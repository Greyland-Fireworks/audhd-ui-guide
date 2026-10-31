import { emptyProfile } from 'audhd-ui-framework';
import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
import palettes from 'audhd-ui-framework/palettes';

// AUDHD-11, AUDHD-04 — ../../GUIDE.md#audhd-11-keep-controls-readable-and-operable
// The fixture switches isolate two requirements: loading CSS and opting a root in.
// Merely importing a stylesheet must not style matching unmarked neighbors; the
// consumer check measures actual control text/targets after the host opts in.
const params = new URLSearchParams(location.search);
if (!params.has('no-css')) {
  await import('audhd-ui-framework/skins.css');
  await import('audhd-ui-framework/controls.css');
}
const root = document.querySelector('#settings');
if (!params.has('no-marker')) root.setAttribute('data-audhd-ui', '');
const byId = id => document.getElementById(id);
// AUDHD-06, AUDHD-07 — ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable
// Applied preferences are owned separately from the pending import. Cancel/error
// must not mutate current choices. Capabilities describe this small fixture, not
// all framework features; unsupported valid choices stay in the exported profile.
// Nothing here persists a profile or saves the separate textarea's document data.
let current = emptyProfile();
const workflow = createImportWorkflow({ capabilities: {
  'display.text_style': true,
  'display.appearance': palettes.map(({ id }) => ({ mode: 'skin', id })),
} });
workflow.subscribe(({ state, preview, error }) => {
  // AUDHD-07 — ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status
  // The workflow rejects stale file completions before publishing a snapshot.
  // Render preview rows only; applying styles is an explicit later action. Plain
  // text rendering also prevents imported values becoming executable markup.
  byId('preview').hidden = state !== 'ready';
  byId('cancel').hidden = !['reading', 'ready'].includes(state);
  byId('error').textContent = error ? `${error} Nothing applied.` : '';
  byId('status').textContent = ({
    reading: 'Reading preferences. Nothing applied yet.',
    ready: preview?.sourceVersion === 1 ? 'Version 1 converted to a version 2 preview. Original file unchanged.' : 'Preview ready. Nothing applied yet.',
    cancelled: 'Import cancelled. Current preferences unchanged.',
  })[state] ?? '';
  byId('choices').replaceChildren();
  for (const row of preview?.rows ?? []) {
    if (row.value === null) continue;
    const item = document.createElement('li');
    item.textContent = `${row.path}: ${JSON.stringify(row.value)} — ${row.status === 'supported' ? 'Supported' : 'Not applied; retained for export'}`;
    byId('choices').append(item);
  }
});
// AUDHD-10 — ../../GUIDE.md#audhd-10-support-interruptions-and-working-preferences
// A back/forward-cache page may resume with its DOM and draft intact. Retain its
// controller; disposing it would leave visible controls attached to a dead import
// workflow. A real teardown invalidates pending reads instead of publishing late.
addEventListener('pagehide', event => { if (!event.persisted) workflow.dispose(); });
byId('import').addEventListener('change', event => {
  // AUDHD-06 — ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable
  // Clear the native selection so choosing the same corrected file can fire again.
  // An empty selection cancels pending work; it must not apply an older late read.
  const file = event.target.files[0];
  event.target.value = '';
  if (file) void workflow.importText(() => file.text());
  else workflow.cancel();
});
byId('apply').addEventListener('click', () => {
  // AUDHD-04, AUDHD-05 — ../../GUIDE.md#audhd-04-explain-effective-behavior
  // Apply supported appearance on the existing root, not a reconstructed tree:
  // the draft and Apply button/focus survive. Retaining the complete profile for
  // export does not mean its unsupported fields have taken effect in this host.
  const { preview } = workflow.getSnapshot();
  if (!preview) return;
  current = preview.profile;
  const appearance = current.display.appearance;
  root.dataset.skin = preview.rows.find(row => row.path === 'display.appearance').status === 'supported' ? appearance.id : 'paperwhite';
  root.dataset.type = current.display.text_style ?? 'serif';
  byId('status').textContent = 'Supported choices applied for this session. Other choices retained, not applied.';
});
byId('cancel').addEventListener('click', () => {
  // AUDHD-05 — ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability
  // Cancellation hides its own control, so return focus to the surviving file
  // input where another import can begin rather than leaving focus on hidden UI.
  workflow.cancel();
  byId('import').focus();
});
byId('export').addEventListener('click', () => {
  // AUDHD-06 — ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable
  // Serialize only the applied profile, never a pending preview or document draft.
  // Requesting a browser download is not evidence that a file reached a chosen
  // folder; the status intentionally reports the request rather than durable save.
  const url = URL.createObjectURL(new Blob([JSON.stringify(current, null, 2)], {type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = 'audhd-preferences.local.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  byId('status').textContent = 'Preference download requested. Unsaved notes are not included.';
});
