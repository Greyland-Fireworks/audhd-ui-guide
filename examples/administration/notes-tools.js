import { notebooks, notes, settings, saveNotebook, saveWorkspaceSettings, exportNotes, analyzeImport, importNotes } from './notes-state.js';
import { recordEvent } from './events.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const heading = (title, description) => `<div class="task-heading"><h1>${title}</h1><p>${description}</p></div>`;
const drafts = new Map();
const newNotebook = { name: '', description: '' };
const notebookErrors = new Map();
// AUDHD-03/05: opening an editor is a presentation choice, not a mutation.
// Each collapsed editor retains its own draft and exposes its unfinished state.
const openNotebooks = new Set();
let lastNotebookPath;
let notebookNotice = '';
let workspaceDraft;
let workspaceErrors = {};
let workspaceNotice = '';
const maxFileBytes = 10_000_000;
let downloadNotice = '';
let downloadFailed = false;
let transfer = { filename: '', preview: null, warnings: [], error: '', reading: false, notice: '' };
let fileRead = 0;
let transferView;

function refreshTransfer(focusId, clearSelection = false) {
  if (!transferView?.section.isConnected) return;
  const { section, container, onChange } = transferView;
  const previousFocus = section.contains(document.activeElement) ? document.activeElement.id : '';
  const fileInput = container.querySelector('#import-notes-file');
  renderTransfer(container, onChange);
  // AUDHD-05: the native input owns its selected FileList. Retain that node
  // during an in-page update so a checked file does not appear to be unchosen.
  // Route changes cannot restore a native file selection; the named preview
  // remains in task state and can still be reviewed without selecting it again.
  const replacement = container.querySelector('#import-notes-file');
  fileInput.setAttribute('aria-invalid', replacement.getAttribute('aria-invalid'));
  if (clearSelection) fileInput.value = '';
  replacement.replaceWith(fileInput);
  const target = focusId || previousFocus;
  if (target) (container.querySelector(`#${target}`) || container.querySelector('#import-notes-file')).focus();
}

// AUDHD-05/10 / GUIDE.md#audhd-10-support-interruptions-and-working-preferences:
// views own drafts and the pending import choice; the model owns saved records.
// Navigation only replaces markup. It neither saves nor discards either owner.
const draftFor = notebook => {
  if (!drafts.has(notebook.id)) drafts.set(notebook.id, { name: notebook.name, description: notebook.description });
  return drafts.get(notebook.id);
};
const changed = notebook => {
  const draft = drafts.get(notebook.id);
  return Boolean(draft && (draft.name !== notebook.name || draft.description !== notebook.description));
};
const workspaceChanged = () => Boolean(workspaceDraft && (workspaceDraft.defaultNotebookId !== settings.defaultNotebookId || workspaceDraft.maxNoteLength !== String(settings.maxNoteLength)));
const writeText = (element, value) => { if (element.textContent !== value) element.textContent = value; };

export function notesToolsSummary() {
  const result = [];
  for (const notebook of [...notebooks, null]) {
    const id = notebook?.id || 'new';
    const fields = Object.keys(notebookErrors.get(id) || {});
    if (!fields.length && !(notebook ? changed(notebook) : newNotebook.name || newNotebook.description)) continue;
    const field = fields[0] || 'name';
    result.push({ text: `${notebook?.name || 'New notebook'}: ${fields.length ? 'correct the unsaved details' : 'review unsaved changes'}`, href: `#notebooks/${id}/${field}`, hasProblem: Boolean(fields.length) });
  }
  if (Object.keys(workspaceErrors).length || workspaceChanged()) {
    const field = Object.keys(workspaceErrors)[0] || (workspaceDraft.defaultNotebookId !== settings.defaultNotebookId ? 'defaultNotebookId' : 'maxNoteLength');
    result.push({ text: Object.keys(workspaceErrors).length ? 'Workspace settings: correct the unsaved value' : 'Workspace settings: review unsaved changes', href: `#workspace-settings/${field}`, hasProblem: Boolean(Object.keys(workspaceErrors).length) });
  }
  if (transfer.error) result.push({ text: 'Import notes: review the rejected file', href: '#transfer/import-notes-file', hasProblem: true });
  else if (transfer.reading) result.push({ text: 'Import notes: reading the selected file', href: '#transfer' });
  else if (transfer.preview) result.push({ text: `Import notes: review ${transfer.preview.notes.length} notes before copying`, href: '#transfer/import-copies' });
  if (downloadFailed) result.push({ text: 'Export notes: review the download limit', href: '#transfer/download-notes', hasProblem: true });
  return result;
}

function formErrors(form, errors, messageId) {
  const message = form.querySelector(`#${messageId}`);
  writeText(message, Object.values(errors).join(' '));
  for (const input of form.querySelectorAll('[name]')) input.setAttribute('aria-invalid', String(Boolean(errors[input.name])));
}

export function renderNotebookSettings(container, onChange = () => {}) {
  const target = location.hash.match(/^#notebooks\/([^/]+)\/(?:name|description)$/)?.[1];
  if (target && location.hash !== lastNotebookPath) openNotebooks.add(target);
  lastNotebookPath = location.hash;
  const form = notebook => {
    const draft = notebook ? draftFor(notebook) : newNotebook;
    const id = notebook?.id || 'new';
    const prefix = `notebook-${id}`;
    const savedNotes = notebook ? notes.filter(note => note.notebookId === notebook.id) : [];
    const activeNotes = savedNotes.filter(note => note.status === 'active').sort((a,b)=>a.title.localeCompare(b.title));
    const errors = notebookErrors.get(id) || {};
    return `<form class="ui-panel" data-notebook="${escape(id)}" novalidate>
      <div class="panel-heading"><h2>${notebook ? escape(notebook.name) : 'Create a notebook'}</h2></div>
      ${notebook ? `<div class="notebook-snapshot"><dl class="notebook-counts">${[['active','Active'],['archived','Archived'],['trash','In Trash']].map(([status,label])=>`<div><dt>${label}</dt><dd>${savedNotes.filter(note=>note.status===status).length}</dd></div>`).join('')}</dl>${activeNotes.length ? `<ul class="notebook-previews" aria-label="Active note examples in ${escape(notebook.name)}">${activeNotes.slice(0,2).map(note=>`<li><a href="#note/${note.id}">${escape(note.title)}</a></li>`).join('')}</ul>` : '<p>No active notes in this notebook.</p>'}<a href="#notes/notebook-${encodeURIComponent(notebook.id)}">View all active notes in ${escape(notebook.name)}</a></div>` : '<p>A notebook groups related notes. Example: Project planning.</p>'}
      ${notebook ? `<details class="notebook-editor" data-notebook-editor="${escape(id)}" ${openNotebooks.has(id) ? 'open' : ''}><summary>Edit notebook details <span data-summary-state>${Object.keys(errors).length ? '· needs correction' : changed(notebook) ? '· unsaved changes' : ''}</span></summary>` : ''}
      <label for="${prefix}-name">Notebook name<input id="${prefix}-name" name="name" value="${escape(draft.name)}" maxlength="100" required aria-describedby="${prefix}-name-help ${prefix}-errors"></label>
      <p id="${prefix}-name-help">Use a unique name, up to 100 characters.</p>
      <label for="${prefix}-description">Description <span class="muted">(optional)</span><textarea id="${prefix}-description" name="description" maxlength="1000" rows="3" aria-describedby="${prefix}-description-help ${prefix}-errors">${escape(draft.description)}</textarea></label>
      <p id="${prefix}-description-help">Explain what belongs here. Example: “Decisions and next steps for the website.” Leave blank if the name is enough.</p>
      <p id="${prefix}-errors" class="error" role="alert">${escape(Object.values(errors).join(' '))}</p>
      <p data-draft-status role="status">${notebook ? changed(notebook) ? 'Unsaved changes.' : 'Saved for this visit.' : draft.name || draft.description ? 'Not created yet.' : 'Enter a name to create a notebook.'}</p>
      <div class="actions"><button class="ui-action" type="submit">${notebook ? 'Save notebook' : 'Create notebook'}</button><button type="button" data-discard>${notebook ? 'Discard changes' : 'Clear new notebook'}</button></div>
      ${notebook ? '</details>' : ''}
    </form>`;
  };
  container.innerHTML = `<section class="notes-tools">${heading('Notebooks', 'Group related notes and name each group clearly. Changes last for this visit only.')}
    <details class="new-notebook-editor" data-notebook-editor="new" ${openNotebooks.has('new') ? 'open' : ''}><summary>New notebook <span data-summary-state>${notebookErrors.get('new') && Object.keys(notebookErrors.get('new')).length ? '· needs correction' : newNotebook.name || newNotebook.description ? '· unfinished draft' : ''}</span></summary>${form(null)}</details>
    <p id="notebook-notice" role="status">${escape(notebookNotice)}</p><div class="card-grid">${notebooks.map(form).join('')}</div>
    ${guideNote('notebooks-design', 'Connect notebook identity, contents and edits', '<p>The creation action comes before the notebook list. Each card pairs its saved active/archive/trash counts with note previews; its named disclosure opens one independent editor. Closing it retains the draft and exposes unfinished state. Saving or discarding one card leaves the others intact. Renaming a notebook does not move or delete its notes.</p>', ['AUDHD-02', 'AUDHD-03', 'AUDHD-05', 'AUDHD-06', 'AUDHD-07'])}</section>`;
  for (const disclosure of container.querySelectorAll('[data-notebook-editor]')) disclosure.ontoggle = () => {
    if (disclosure.open) openNotebooks.add(disclosure.dataset.notebookEditor);
    else openNotebooks.delete(disclosure.dataset.notebookEditor);
  };
  restoreGuideNotes(container);
  for (const element of container.querySelectorAll('form[data-notebook]')) {
    const id = element.dataset.notebook;
    const notebook = notebooks.find(item => item.id === id);
    const draft = notebook ? draftFor(notebook) : newNotebook;
    const errorsId = element.querySelector('[role="alert"]').id;
    const summaryState = element.querySelector('[data-summary-state]') || element.closest('[data-notebook-editor]')?.querySelector('[data-summary-state]');
    const updateSummary = () => writeText(summaryState, Object.keys(notebookErrors.get(id) || {}).length ? '· needs correction' : (notebook ? changed(notebook) : draft.name || draft.description) ? '· unsaved changes' : '');
    formErrors(element, notebookErrors.get(id) || {}, errorsId);
    for (const input of element.querySelectorAll('[name]')) input.oninput = event => {
      draft[input.name] = event.target.value;
      const errors = { ...notebookErrors.get(id) }; delete errors[input.name]; notebookErrors.set(id, errors);
      formErrors(element, errors, errorsId);
      writeText(element.querySelector('[data-draft-status]'), notebook ? changed(notebook) ? 'Unsaved changes.' : 'Saved for this visit.' : 'Not created yet.');
      updateSummary();
      onChange();
    };
    element.onsubmit = event => {
      event.preventDefault();
      const result = saveNotebook({ ...(notebook ? { id } : {}), ...draft });
      notebookErrors.set(id, result.errors || {});
      if (!result.ok) {
        formErrors(element, result.errors, errorsId);
        updateSummary();
        element.elements.namedItem(Object.keys(result.errors)[0])?.focus();
        onChange();
        return;
      }
      notebookNotice = `${result.notebook.name} ${notebook ? 'saved' : 'created'} for this visit.`;
      if (notebook) drafts.delete(id); else Object.assign(newNotebook, { name: '', description: '' });
      openNotebooks.add(result.notebook.id);
      if (!notebook) openNotebooks.delete('new');
      renderNotebookSettings(container, onChange);
      container.querySelector(`[data-notebook="${result.notebook.id}"] input`)?.focus();
      onChange();
    };
    element.querySelector('[data-discard]').onclick = () => {
      notebookErrors.delete(id);
      if (notebook) drafts.delete(id); else Object.assign(newNotebook, { name: '', description: '' });
      renderNotebookSettings(container, onChange);
      container.querySelector(`[data-notebook="${id}"] input`)?.focus();
      onChange();
    };
  }
}

export function renderWorkspaceSettings(container, onChange = () => {}) {
  workspaceDraft ||= { defaultNotebookId: settings.defaultNotebookId, maxNoteLength: String(settings.maxNoteLength) };
  container.innerHTML = `<section class="notes-tools">${heading('Workspace settings', 'Choose the default notebook for new notes and the maximum length for saving any note.')}
    <form id="workspace-settings-form" class="ui-panel" novalidate>
      <fieldset class="workspace-setting-group"><legend>New notes</legend>
      <label for="default-notebook">Default notebook<select id="default-notebook" name="defaultNotebookId" aria-describedby="default-notebook-help workspace-settings-errors">${notebooks.map(notebook => `<option value="${escape(notebook.id)}" ${notebook.id === workspaceDraft.defaultNotebookId ? 'selected' : ''}>${escape(notebook.name)}</option>`).join('')}</select></label>
      <p id="default-notebook-help">Preselect this notebook when creating a note. You can choose another notebook before saving; existing notes stay where they are.</p>
      </fieldset>
      <fieldset class="workspace-setting-group"><legend>Note length</legend><div class="workspace-limit-layout"><div>
      <label for="max-note-length">Maximum note length<input id="max-note-length" name="maxNoteLength" type="number" min="100" max="50000" step="1" value="${escape(workspaceDraft.maxNoteLength)}" aria-describedby="max-note-length-unit max-note-length-help workspace-settings-errors" required></label>
      <p id="max-note-length-unit" class="field-unit">Characters per note body</p>
      <p id="max-note-length-help">Accepts 100–50,000 whole characters. Example: 5000. A larger maximum allows longer note bodies; a smaller maximum limits future saves. Existing text is never cut to fit.</p>
      <details class="context-help" data-guide-key="workspace-defaults-help"><summary>ⓘ Choosing a note length</summary><ul><li>Keep the current value if it fits your notes. Increase it when a longer note needs to be saved.</li><li>A note above a newly lowered maximum stays readable and exportable. Shorten its body or raise the maximum before saving another edit.</li><li>This is a writing limit for this example, not a measure of server capacity or storage space.</li><li>The maximum applies to note bodies; notebook names and note titles have their own limits.</li></ul></details>
      </div><section id="note-length-impact" class="note-length-impact" aria-label="Saved notes compared with the proposed maximum"></section></div></fieldset>
      <p id="workspace-settings-errors" class="error" role="alert">${escape(Object.values(workspaceErrors).join(' '))}</p>
      <p id="workspace-settings-draft" role="status">${workspaceChanged() ? 'Unsaved changes.' : 'No unsaved changes.'}</p>
      <div class="actions"><button class="ui-action" type="submit">Save workspace settings</button><button id="discard-workspace-settings" type="button">Discard changes</button></div>
      <p id="workspace-settings-saved" role="status">${escape(workspaceNotice || `Saved maximum: ${settings.maxNoteLength.toLocaleString()} characters. Settings last for this visit only.`)}</p>
    </form>${guideNote('workspace-defaults-design', 'Show the effect on actual saved notes', '<p>The maximum has a visible unit, accepted range and example. The comparison uses actual saved body lengths against the proposed maximum; it excludes unsaved edits and never changes text. Draft settings stay separate from saved defaults, and validation cannot silently truncate existing content. These values describe this example’s supported behavior, not universal recommended limits.</p>', ['AUDHD-04', 'AUDHD-06', 'AUDHD-08', 'AUDHD-09'])}</section>`;
  restoreGuideNotes(container);
  const form = container.querySelector('#workspace-settings-form');
  const showImpact = () => {
    const priorOpen = container.querySelector('#note-length-impact details')?.open;
    const maximum = Number(workspaceDraft.maxNoteLength);
    const valid = Number.isInteger(maximum) && maximum >= 100 && maximum <= 50000;
    const affected = valid ? notes.filter(note => note.body.length > maximum) : [];
    const largest = [...notes].sort((a,b)=>b.body.length-a.body.length || a.title.localeCompare(b.title)).slice(0,3);
    // AUDHD-07/08/09: this is a proposed-limit preview from saved text, not a
    // storage-capacity estimate or a mutation. Native meters retain an explicit
    // count and over-limit wording so color and bar length are never the evidence.
    container.querySelector('#note-length-impact').innerHTML = `<h2>Effect on saved notes</h2><p class="limit-scope">${notes.length} saved notes, including Archive and Trash. Unsaved text is not counted.</p><p id="note-limit-summary" role="status">${valid ? `${affected.length} ${affected.length === 1 ? 'note exceeds' : 'notes exceed'} the proposed ${maximum.toLocaleString()}-character maximum.` : 'Enter a whole number from 100 to 50,000 to compare existing notes.'}</p>${valid ? `<p>Three longest saved notes:</p><ul class="note-usage-list">${largest.map(note=>`<li class="${note.body.length>maximum ? 'over-limit' : ''}"><a href="#note/${note.id}/body">${escape(note.title)}</a><p>${note.body.length.toLocaleString()} characters${note.body.length>maximum ? ` · ${(note.body.length-maximum).toLocaleString()} over` : ` · ${(maximum-note.body.length).toLocaleString()} remaining`}</p><meter min="0" max="${maximum}" value="${Math.min(note.body.length,maximum)}" aria-label="${escape(note.title)}: ${note.body.length} characters against the proposed maximum of ${maximum}${note.body.length>maximum ? `; ${note.body.length-maximum} over` : ''}"></meter></li>`).join('')}</ul>${affected.length ? `<details class="context-help"><summary>Review all ${affected.length} notes above this maximum</summary><ul>${affected.map(note=>`<li><a href="#note/${note.id}/body">${escape(note.title)}</a> · ${note.body.length.toLocaleString()} characters</li>`).join('')}</ul><p>The text remains unchanged. Shorten it or raise the maximum before saving another edit.</p></details>` : ''}` : ''}`;
    const impact = container.querySelector('#note-length-impact');
    const affectedDisclosure = impact.querySelector('.context-help');
    if (affectedDisclosure) affectedDisclosure.dataset.guideKey = 'note-limit-affected';
    restoreGuideNotes(impact);
    // A native toggle event may still be queued when the number changes. Read
    // the current disclosure before replacement so an immediate edit retains it.
    if (affectedDisclosure && priorOpen !== undefined) affectedDisclosure.open = priorOpen;
  };
  formErrors(form, workspaceErrors, 'workspace-settings-errors');
  for (const input of form.querySelectorAll('[name]')) input.oninput = event => {
    workspaceDraft[input.name] = event.target.value;
    delete workspaceErrors[input.name]; formErrors(form, workspaceErrors, 'workspace-settings-errors');
    writeText(container.querySelector('#workspace-settings-draft'), workspaceChanged() ? 'Unsaved changes.' : 'No unsaved changes.');
    if (input.name === 'maxNoteLength') showImpact();
    onChange();
  };
  form.onsubmit = event => {
    event.preventDefault();
    const result = saveWorkspaceSettings({ ...workspaceDraft, maxNoteLength: Number(workspaceDraft.maxNoteLength) });
    workspaceErrors = result.errors || {};
    formErrors(form, workspaceErrors, 'workspace-settings-errors');
    if (!result.ok) { form.elements.namedItem(Object.keys(workspaceErrors)[0])?.focus(); onChange(); return; }
    workspaceDraft = { defaultNotebookId: settings.defaultNotebookId, maxNoteLength: String(settings.maxNoteLength) };
    workspaceNotice = `Saved for this visit: ${notebooks.find(notebook => notebook.id === settings.defaultNotebookId)?.name}; ${settings.maxNoteLength.toLocaleString()} characters maximum.${result.overLimitNoteIds.length ? ` ${result.overLimitNoteIds.length} existing notes exceed this maximum. Their text is retained; shorten them or raise the maximum before saving another edit.` : ''}`;
    writeText(container.querySelector('#workspace-settings-draft'), 'No unsaved changes.');
    writeText(container.querySelector('#workspace-settings-saved'), workspaceNotice);
    showImpact();
    onChange();
  };
  container.querySelector('#discard-workspace-settings').onclick = () => {
    workspaceDraft = null; workspaceErrors = {}; workspaceNotice = '';
    renderWorkspaceSettings(container, onChange); container.querySelector('#default-notebook').focus(); onChange();
  };
  showImpact();
}

function importPreview() {
  if (!transfer.preview) return '';
  const preview = transfer.preview;
  return `<section class="import-preview" aria-labelledby="import-preview-title"><h3 id="import-preview-title">Preview: ${preview.notes.length} notes in ${preview.notebooks.length} notebooks</h3>
    <p>${escape(transfer.filename)} is ready to review. Import creates new copies; it never replaces existing notes.</p>
    ${transfer.warnings.length ? `<ul>${transfer.warnings.map(warning => `<li>${escape(warning)}</li>`).join('')}</ul>` : ''}
    <ul class="import-notebooks">${preview.notebooks.map(notebook => {
      const included = preview.notes.filter(note => note.notebookId === notebook.id);
      return `<li><strong>${escape(notebook.name)}</strong> · ${included.length} notes${included.length ? `<ul>${included.slice(0, 3).map(note => `<li>${escape(note.title)} <span class="muted">(${escape(note.status)})</span></li>`).join('')}</ul>${included.length > 3 ? `<details><summary>View ${included.length - 3} more note names</summary><ul>${included.slice(3).map(note => `<li>${escape(note.title)} <span class="muted">(${escape(note.status)})</span></li>`).join('')}</ul></details>` : ''}` : ''}</li>`;
    }).join('')}</ul><div class="actions"><button id="import-copies" class="ui-action" type="button">Import copies</button><button id="cancel-import" type="button">Discard preview</button></div></section>`;
}

export function renderTransfer(container, onChange = () => {}) {
  container.innerHTML = `<section class="notes-tools" id="notes-transfer">${heading('Import & export notes', 'Move a copy of saved notes between this practice workspace and a JSON file on your computer.')}
    <section class="ui-panel" aria-labelledby="download-notes-title"><h2 id="download-notes-title">Download saved notes</h2><p>The JSON file contains saved notes and notebooks, including note status and saved history. Unsaved drafts and workspace settings are excluded.</p>
      <p>Your browser saves the file in its download folder or asks you to choose a location. No file is sent to a remote service. This example supports files up to 10 MB.</p><button id="download-notes" class="ui-action" type="button">Download notes JSON</button><p id="download-notes-status" class="${downloadFailed ? 'error' : ''}" role="status">${escape(downloadNotice)}</p></section>
    <section class="ui-panel" aria-labelledby="import-notes-title"><h2 id="import-notes-title">Import copies from a file</h2><p>Choose a Shared Notes JSON export, up to 10 MB. Review its contents before importing. New copies last for this visit; reloading clears them.</p>
      <label for="import-notes-file">Notes file<input id="import-notes-file" type="file" accept=".json,application/json" aria-invalid="${Boolean(transfer.error)}" aria-describedby="import-notes-help import-notes-error"></label>
      <p id="import-notes-help">Use a file downloaded by this workspace (format “shared-notes”, version 1). Choosing a file does not import it.</p>
      <p>Imports use the current maximum note length. If the file contains longer notes, <a href="#workspace-settings">raise that maximum</a> before importing; saved source notes are not shortened.</p>
      <p id="import-reading" role="status">${transfer.reading ? `Reading ${escape(transfer.filename)}…` : ''}</p><p id="import-notes-error" class="error" role="alert">${escape(transfer.error)}</p><p id="import-notes-status" role="status">${escape(transfer.notice)}</p>
      ${transfer.error && transfer.preview ? '<p>Your preview is retained. <a href="#workspace-settings">Review workspace limits</a> or choose another file.</p>' : ''}
      <div id="import-preview-host">${importPreview()}</div>
    </section>${guideNote('transfer-design', 'Preview before copying', '<p>The browser reads the selected file locally. Size and schema checks run before a preview appears; importing validates it again against current limits. The preview belongs to this task even while its page is hidden. New identifiers keep copies separate from existing notes. A requested download is not proof that a file reached a disk folder.</p>', ['AUDHD-05', 'AUDHD-06', 'AUDHD-07', 'AUDHD-13'])}</section>`;
  restoreGuideNotes(container);
  const section = container.querySelector('#notes-transfer');
  transferView = { section, container, onChange };
  container.querySelector('#download-notes').onclick = () => {
    // AUDHD-07: this requests a real browser download. JavaScript cannot assert
    // that the person accepted it or which folder their browser selected.
    const blob = new Blob([JSON.stringify(exportNotes(), null, 2)], { type: 'application/json' });
    const status = container.querySelector('#download-notes-status');
    if (blob.size > maxFileBytes) {
      downloadFailed = true; status.classList.add('error');
      downloadNotice = 'No file was downloaded: this export exceeds the example’s 10 MB file limit. All saved notes and history remain unchanged.';
      writeText(status, downloadNotice); onChange(); return;
    }
    downloadFailed = false; status.classList.remove('error');
    const url = URL.createObjectURL(blob);
    const filename = `shared-notes-${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    downloadNotice = `Download requested: ${filename}. Check your browser’s downloads.`;
    writeText(status, downloadNotice);
    recordEvent({ description: `Requested a JSON download of ${notes.length} saved notes and ${notebooks.length} notebooks.`, subject: 'Notes download' });
    onChange();
  };
  container.querySelector('#import-notes-file').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    const sequence = ++fileRead;
    transfer = { filename: file.name, preview: null, warnings: [], error: '', reading: true, notice: '' };
    refreshTransfer('import-notes-file');
    onChange();
    try {
      if (file.size > maxFileBytes) throw Error('This file is larger than 10 MB. Choose a smaller Shared Notes export.');
      let value;
      try { value = JSON.parse(await file.text()); } catch { throw Error('This file could not be read as JSON. Choose a Shared Notes JSON export.'); }
      // AUDHD-07 / GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status:
      // a slower previous read cannot replace the user's newer file choice.
      if (sequence !== fileRead) return;
      const result = analyzeImport(value);
      if (!result.ok) throw Error(Object.values(result.errors).join(' '));
      transfer.preview = result.preview; transfer.warnings = result.warnings || [];
      transfer.notice = 'File checked. Review the import preview below.';
    } catch (error) { if (sequence === fileRead) transfer.error = error.message; }
    finally {
      if (sequence === fileRead) {
        transfer.reading = false;
        // Complete into task state while hidden, without replacing another page.
        refreshTransfer();
        onChange();
      }
    }
  };
  const importButton = container.querySelector('#import-copies');
  if (importButton) importButton.onclick = () => {
    const result = importNotes(transfer.preview);
    if (!result.ok) { transfer.error = Object.values(result.errors).join(' '); refreshTransfer('import-notes-file'); onChange(); return; }
    transfer.notice = `Imported ${result.notes.length} note copies in ${result.notebooks.length} new notebooks for this visit. Existing notes are unchanged.`;
    transfer.preview = null; transfer.warnings = []; transfer.error = '';
    refreshTransfer('import-notes-file', true); onChange();
  };
  const cancelButton = container.querySelector('#cancel-import');
  if (cancelButton) cancelButton.onclick = () => {
    ++fileRead; transfer = { filename: '', preview: null, warnings: [], error: '', reading: false, notice: 'Import preview discarded. No notes were copied.' };
    refreshTransfer('import-notes-file', true); onChange();
  };
}
