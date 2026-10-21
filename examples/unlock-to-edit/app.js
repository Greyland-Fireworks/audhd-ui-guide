const key = 'audhd-unlock-example-v1';
const defaults = { retries: '3', timeout: '30' };
const fields = {
  retries: { label: 'retry limit', min: 0, max: 10, locked: true, before: null },
  timeout: { label: 'response timeout', min: 1, max: 120, locked: true, before: null },
};
const $ = id => document.getElementById(id);
let draft = { ...defaults };
let saved = null;
const valid = (id, value) => typeof value === 'string' && /^\d+$/.test(value) && Number(value) >= fields[id].min && Number(value) <= fields[id].max;
const equal = (a, b) => b && Object.keys(fields).every(id => a[id] === b[id]);

function renderField(id) {
  const field = fields[id];
  const input = $(id);
  // Keep the actual input node, focus and partially typed text intact.
  if (input.value !== draft[id]) input.value = draft[id];
  input.readOnly = field.locked;
  $(`${id}-card`).dataset.editing = String(!field.locked);
  $(`${id}-state`).textContent = field.locked ? 'Locked' : 'Editing enabled';
  $(`${id}-hint`).textContent = field.locked ? 'Unlock to edit' : 'Lock editing';
  $(`${id}-shackle`).setAttribute('d', field.locked ? 'M7 10V7a5 5 0 0 1 10 0v3' : 'M7 10V7a5 5 0 0 1 9.6-2');
  $(`${id}-lock`).setAttribute('aria-label', `${field.locked ? 'Unlock to edit' : 'Lock editing'} — ${field.label}`);
  $(`${id}-restore`).disabled = field.locked || draft[id] === field.before;
  $(`${id}-before`).textContent = field.before === null ? 'Unlock to capture a restoration point.' : `Before this editing session: ${field.before}`;
  $(`${id}-comparison`).textContent = Number(draft[id]) === Number(defaults[id]) && valid(id, draft[id]) ? `Matches default: ${defaults[id]}` : `Changed from default: ${defaults[id]}`;
  const invalid = !valid(id, draft[id]);
  input.setAttribute('aria-invalid', String(invalid));
  $(`${id}-error`).hidden = !invalid;
  $(`${id}-error`).textContent = invalid ? `Enter a whole number from ${field.min} to ${field.max}. Your entry is retained.` : '';
}

function persist(values = draft) {
  if (!Object.keys(fields).every(id => valid(id, values[id]))) {
    $('save-status').textContent = 'Not saved. Correct the highlighted value; both settings are saved together. Your draft remains on this page.';
    return false;
  }
  const failure = $('failure').value;
  $('failure').value = 'none';
  try {
    if (failure === 'blocked') throw new Error('Simulated blocked write.');
    const serialized = JSON.stringify(values);
    localStorage.setItem(key, serialized);
    const readback = localStorage.getItem(key);
    if (failure === 'mismatch' || readback !== serialized) throw new Error('Write verification did not match.');
    saved = { ...values };
    $('save-status').textContent = 'Both settings saved and verified in this browser. This is not a durable backup.';
    return true;
  } catch (error) {
    // A failed verification can follow a successful write: invalidate old certainty.
    saved = null;
    $('save-status').textContent = `Save unverified. ${error.message} Your draft remains on this page. Retry saving or export it before leaving.`;
    return false;
  }
}

try {
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    const parsed = JSON.parse(stored);
    if (!parsed || Object.keys(parsed).length !== 2 || !Object.keys(fields).every(id => valid(id, parsed[id]))) throw new Error('Stored draft has an unsupported format.');
    draft = { ...parsed };
    saved = { ...parsed };
    $('save-status').textContent = 'Saved settings loaded from this browser. Editing starts locked; previous restoration points have expired.';
  }
} catch (error) {
  $('save-status').textContent = `Stored draft unavailable: ${error.message} Showing example defaults; the existing storage has not been replaced.`;
}

for (const [id, field] of Object.entries(fields)) {
  renderField(id);
  const lockButton = $(`${id}-lock`);
  const hintContainer = lockButton.parentElement;
  lockButton.addEventListener('keydown', event => {
    if (event.key === 'Escape') hintContainer.dataset.hintDismissed = 'true';
  });
  hintContainer.addEventListener('pointerleave', () => delete hintContainer.dataset.hintDismissed);
  lockButton.addEventListener('blur', () => delete hintContainer.dataset.hintDismissed);
  $(id).addEventListener('input', () => {
    draft[id] = $(id).value;
    renderField(id);
    $('save-status').textContent = equal(draft, saved) ? 'Current values match the last verified save in this page.' : 'Uncommitted edits. Leave the field or commit the change to save both settings.';
    $('action-status').textContent = '';
  });
  $(id).addEventListener('change', () => persist());
  $(`${id}-lock`).addEventListener('click', () => {
    if (field.locked) {
      field.before = draft[id];
      field.locked = false;
      $('action-status').textContent = `Editing enabled for ${field.label}. Its value is unchanged.`;
    } else {
      if (!persist()) {
        $('action-status').textContent = `Editing remains open for ${field.label}.`;
        return;
      }
      field.locked = true;
      field.before = null;
      $('action-status').textContent = `Editing locked for ${field.label}. Other fields keep their editing state.`;
    }
    renderField(id);
  });
  $(`${id}-restore`).addEventListener('click', () => {
    draft[id] = field.before;
    renderField(id);
    persist();
    $('action-status').textContent = `Restored ${field.label} to ${draft[id]}. Editing remains enabled.`;
    // Restoration disables its own action; return focus deliberately to its field.
    $(id).focus();
  });
}

for (const section of ['settings', 'contract']) {
  $(`${section}-tab`).addEventListener('click', () => {
    for (const name of ['settings', 'contract']) {
      $(name).hidden = name !== section;
      if (name === section) $(`${name}-tab`).setAttribute('aria-current', 'page');
      else $(`${name}-tab`).removeAttribute('aria-current');
    }
  });
}
$('appearance').addEventListener('change', event => document.documentElement.dataset.theme = event.target.value);
$('text-size').addEventListener('change', event => document.documentElement.style.fontSize = event.target.value);
$('retry-save').addEventListener('click', () => { persist(); $('action-status').textContent = 'Editing states are unchanged.'; });
$('defaults').addEventListener('click', () => {
  if (!persist(defaults)) {
    $('action-status').textContent = 'Replacement was not applied to the page. Current edits and restoration points are retained.';
    return;
  }
  draft = { ...defaults };
  for (const id of Object.keys(fields)) {
    fields[id].locked = true;
    fields[id].before = null;
    renderField(id);
  }
  $('action-status').textContent = 'Both settings replaced with example defaults and editing locked. Previous restoration points have expired.';
});
$('export').addEventListener('click', () => {
  const text = `Unlock-to-edit example — manual recovery\nRetry limit: ${draft.retries}\nResponse timeout (seconds): ${draft.timeout}\nValues may be incomplete or invalid. This is not an importable preset.\n`;
  // Always offer a readable fallback; the explicit export request may move focus.
  $('manual-export').hidden = false;
  $('recovery').value = text;
  $('recovery').focus();
  $('recovery').select();
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'unlock-example-recovery.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('action-status').textContent = 'Recovery download requested. If it is blocked, copy the selected recovery text. Draft values and editing states are unchanged.';
});
