import { recordEvent } from './events.js';

// AUDHD-06/07 / GUIDE.md#audhd-06-make-saving-and-recovery-understandable:
// these saved records, separate drafts and immutable content revisions belong to
// the visit, never to a rendered page. Reload resets this fictional workspace.
export const notebooks = [
  { id: 'harbor-meetings', name: 'Meeting notes', description: 'Fictional Harbor team agendas and short meeting records.' },
  { id: 'harbor-decisions', name: 'Project decisions', description: 'Fictional Harbor decisions, their reasons and follow-up work.' },
  { id: 'harbor-reference', name: 'Reference', description: 'Fictional Harbor working agreements and reusable instructions.' },
];
export const settings = { defaultNotebookId: notebooks[0].id, maxNoteLength: 5000 };
export const noteDrafts = new Map();
export const noteErrors = new Map();
const statuses = ['active', 'archived', 'trash'];
const now = () => new Date().toISOString();
const newId = kind => `${kind}-${crypto.randomUUID()}`;
const copyFields = ({ title, body, notebookId }) => ({ title, body, notebookId });
const snapshot = note => Object.freeze({ version: note.version, ...copyFields(note), at: note.updatedAt });
const fail = errors => ({ ok: false, errors });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function makeNote(id, fields, status = 'active', at = now()) {
  const note = { id, ...fields, status, version: 1, updatedAt: at, history: [] };
  note.history.push(snapshot(note));
  return note;
}

const seed = [
  ['harbor-kickoff', 'Harbor kickoff agenda', 'Agree on the purpose of the shared notes space. Mira will collect questions; Sam will record decisions.', 'harbor-meetings', 'active'],
  ['harbor-weekly-review', 'Weekly review — 29 October', 'Review the three open tasks. Keep decisions separate from meeting discussion so the team can find them later.', 'harbor-meetings', 'active'],
  ['harbor-research-checkin', 'Research check-in', 'Compare the two fictional interview summaries. List unanswered questions before planning another interview.', 'harbor-meetings', 'active'],
  ['harbor-note-structure', 'Keep decisions in their own notebook', 'Decision: store one decision per note. Reason: a reader should not need to scan a full meeting transcript to find the outcome.', 'harbor-decisions', 'active'],
  ['harbor-review-day', 'Use Thursday for the weekly review', 'Decision: review open work on Thursday morning. Revisit this arrangement after four fictional weeks.', 'harbor-decisions', 'active'],
  ['harbor-retention', 'Retain completed work in the archive', 'Decision: archive completed notes instead of deleting them. Use Trash only for notes the team no longer needs.', 'harbor-decisions', 'active'],
  ['harbor-writing-guide', 'Writing a useful team note', 'Use a specific title. State the decision or next action first. Name an owner when someone must follow up.', 'harbor-reference', 'active'],
  ['harbor-meeting-template', 'Short meeting template', 'Purpose:\nDecisions:\nQuestions still open:\nNext action and owner:', 'harbor-reference', 'active'],
  ['harbor-old-kickoff', 'Previous kickoff notes', 'Archived fictional notes from the first planning discussion. The current kickoff agenda replaces this record.', 'harbor-meetings', 'archived'],
  ['harbor-old-location', 'Previous notes location', 'Archived decision: the team used a single document. Separate notebooks now make completed decisions easier to find.', 'harbor-decisions', 'archived'],
  ['harbor-duplicate', 'Duplicate weekly agenda', 'Fictional duplicate of the weekly review agenda. Kept in Trash so a mistaken removal can be reversed.', 'harbor-meetings', 'trash'],
  ['harbor-scratch', 'Temporary formatting scratchpad', 'Fictional scratch text used to try headings. It contains no information needed by the team.', 'harbor-reference', 'trash'],
];
export const notes = seed.map(([id, title, body, notebookId, status], index) => makeNote(id, { title, body, notebookId }, status, `2026-10-29T${String(9 + Math.floor(index / 6)).padStart(2, '0')}:${String(index % 6 * 10).padStart(2, '0')}:00.000Z`));

function validateNote(fields, books = notebooks, maxLength = settings.maxNoteLength) {
  const errors = {};
  if (typeof fields?.title !== 'string' || !fields.title.trim() || fields.title.trim().length > 160) errors.title = 'Enter a title from 1 to 160 characters.';
  if (typeof fields?.body !== 'string' || fields.body.length > maxLength) errors.body = `Use up to ${maxLength.toLocaleString('en-US')} characters. A title-only note may have an empty body.`;
  if (typeof fields?.notebookId !== 'string' || !books.some(book => book.id === fields.notebookId)) errors.notebookId = 'Choose an available notebook.';
  return errors;
}
function savedFields(fields) {
  return { title: fields.title.trim(), body: fields.body, notebookId: fields.notebookId };
}

export function getNoteDraft(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return null;
  if (!noteDrafts.has(id)) noteDrafts.set(id, copyFields(note));
  return noteDrafts.get(id);
}
export function isNoteDirty(note) {
  const draft = note && noteDrafts.get(note.id);
  return Boolean(draft && ['title', 'body', 'notebookId'].some(key => draft[key] !== note[key]));
}
export function saveNote(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return fail({ note: 'This note is no longer available.' });
  const draft = getNoteDraft(id);
  const errors = validateNote(draft);
  if (Object.keys(errors).length) { noteErrors.set(id, errors); return fail(errors); }
  const fields = savedFields(draft);
  const changed = Object.keys(fields).some(key => fields[key] !== note[key]);
  if (changed) {
    Object.assign(note, fields, { version: note.version + 1, updatedAt: now() });
    note.history.push(snapshot(note));
    recordEvent({ description: `Saved “${note.title}”, version ${note.version}.`, subject: note.title, version: note.version });
  }
  noteDrafts.delete(id); noteErrors.delete(id);
  return { ok: true, errors: {}, note, unchanged: !changed };
}
export function discardNoteDraft(id) {
  noteDrafts.delete(id); noteErrors.delete(id);
}
export function createNote(fields) {
  const proposed = { ...fields, notebookId: fields?.notebookId ?? settings.defaultNotebookId };
  const errors = validateNote(proposed);
  if (Object.keys(errors).length) return fail(errors);
  const note = makeNote(newId('note'), savedFields(proposed));
  notes.push(note);
  recordEvent({ description: `Created the note “${note.title}”.`, subject: note.title, version: note.version });
  return { ok: true, errors: {}, note };
}
export function setNoteStatus(id, status) {
  const note = notes.find(item => item.id === id);
  if (!note) return fail({ note: 'This note is no longer available.' });
  if (!statuses.includes(status)) return fail({ status: 'Choose active, archived or trash.' });
  if (note.status === status) return { ok: true, errors: {}, note, unchanged: true };
  // AUDHD-06/10 / GUIDE.md#audhd-10-support-interruptions-and-working-preferences:
  // moving a saved note does not save/discard its independent editor draft.
  // Content versions describe content edits; a location move updates its date only.
  note.status = status; note.updatedAt = now();
  const action = { active: 'Restored', archived: 'Archived', trash: 'Moved to Trash' }[status];
  recordEvent({ description: `${action}: “${note.title}”. Unsaved edits, if any, remain separate.`, subject: note.title, version: note.version });
  return { ok: true, errors: {}, note };
}
export function getNoteVersion(id, version) {
  return notes.find(note => note.id === id)?.history.find(item => item.version === version) ?? null;
}
export function restoreNoteVersion(id, version, { replaceDirty = false } = {}) {
  const note = notes.find(item => item.id === id);
  const saved = getNoteVersion(id, version);
  if (!note || !saved) return fail({ version: 'This saved version is not available.' });
  // AUDHD-13 / GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards:
  // the UI must confirm replacement of a dirty draft. Even confirmed restoration
  // prepares a draft only; it never silently replaces the current saved version.
  if (isNoteDirty(note) && !replaceDirty) return { ...fail({ draft: 'Restoring this version would replace your unsaved changes.' }), confirmationRequired: true, snapshot: saved };
  const draft = copyFields(saved);
  noteDrafts.set(id, draft); noteErrors.delete(id);
  recordEvent({ description: `Loaded version ${version} of “${note.title}” into the draft. The saved note is unchanged.`, subject: note.title, version });
  return { ok: true, errors: {}, draft, snapshot: saved };
}

export function saveWorkspaceSettings(value) {
  const errors = {};
  if (!notebooks.some(book => book.id === value?.defaultNotebookId)) errors.defaultNotebookId = 'Choose an available default notebook.';
  if (!Number.isInteger(value?.maxNoteLength) || value.maxNoteLength < 100 || value.maxNoteLength > 50000) errors.maxNoteLength = 'Enter a whole number from 100 to 50,000 characters.';
  if (Object.keys(errors).length) return fail(errors);
  const changed = settings.defaultNotebookId !== value.defaultNotebookId || settings.maxNoteLength !== value.maxNoteLength;
  // AUDHD-04/06 / GUIDE.md#audhd-04-explain-effective-behavior: a new limit
  // governs future saves. Existing content and unfinished drafts are never truncated.
  Object.assign(settings, { defaultNotebookId: value.defaultNotebookId, maxNoteLength: value.maxNoteLength });
  if (changed) recordEvent({ description: `Saved workspace settings. New notes use “${notebooks.find(book => book.id === settings.defaultNotebookId).name}”; note bodies may contain up to ${settings.maxNoteLength.toLocaleString('en-US')} characters. Existing content was retained.`, subject: 'Workspace settings' });
  return { ok: true, errors: {}, settings: { ...settings }, unchanged: !changed, overLimitNoteIds: notes.filter(note => note.body.length > settings.maxNoteLength).map(note => note.id) };
}
export function saveNotebook(value) {
  const errors = {};
  const existing = value?.id === undefined ? null : notebooks.find(book => book.id === value.id);
  if (value?.id !== undefined && !existing) errors.notebook = 'This notebook is no longer available.';
  const name = typeof value?.name === 'string' ? value.name.trim() : '';
  if (!name || name.length > 100) errors.name = 'Enter a notebook name from 1 to 100 characters.';
  else if (notebooks.some(book => book.id !== existing?.id && book.name.toLowerCase() === name.toLowerCase())) errors.name = 'A notebook already uses this name. Choose a different name.';
  if (typeof value?.description !== 'string' || value.description.length > 1000) errors.description = 'Use up to 1,000 characters for the description, or leave it empty.';
  if (Object.keys(errors).length) return fail(errors);
  const notebook = existing || { id: newId('notebook') };
  const changed = !existing || notebook.name !== name || notebook.description !== value.description;
  Object.assign(notebook, { name, description: value.description });
  if (!existing) notebooks.push(notebook);
  if (changed) recordEvent({ description: `${existing ? 'Updated' : 'Created'} the notebook “${name}”.`, subject: name });
  return { ok: true, errors: {}, notebook, unchanged: !changed };
}

export function exportNotes() {
  // AUDHD-07 / GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status:
  // export saved data only. Copies prevent a preview/download consumer from
  // changing live records or immutable history through shared object references.
  return { format: 'shared-notes', version: 1, notebooks: notebooks.map(book => ({ ...book })), notes: notes.map(note => ({ ...note, history: note.history.map(entry => ({ ...entry })) })) };
}
function importPreview(books, entries) {
  if (!Array.isArray(books) || !Array.isArray(entries)) return fail({ file: 'The file must contain a notebooks list and a notes list.' });
  if (!books.length && !entries.length) return fail({ file: 'This file contains no notebooks or notes to import.' });
  const ids = new Set();
  const cleanBooks = [];
  for (const book of books) {
    if (!record(book) || typeof book.id !== 'string' || !book.id.trim() || book.id.length > 200 || ids.has(book.id)) return fail({ file: 'Each imported notebook needs a distinct text ID so its notes can be matched.' });
    if (typeof book.name !== 'string' || !book.name.trim() || book.name.trim().length > 100 || typeof book.description !== 'string' || book.description.length > 1000) return fail({ file: 'Notebook names must contain 1–100 characters; descriptions may contain up to 1,000.' });
    ids.add(book.id);
    cleanBooks.push(Object.freeze({ id: book.id, name: book.name.trim(), description: book.description }));
  }
  const cleanNotes = [];
  for (const entry of entries) {
    if (!record(entry)) return fail({ file: 'Every imported note must be a record with a title, body and notebook ID.' });
    const errors = validateNote(entry, cleanBooks);
    if (Object.keys(errors).length) return fail({ file: `Cannot import a note: ${Object.values(errors).join(' ')}` });
    const status = entry.status ?? 'active';
    if (!statuses.includes(status)) return fail({ file: 'Each note status must be active, archived or trash.' });
    cleanNotes.push(Object.freeze({ ...savedFields(entry), status }));
  }
  return { ok: true, errors: {}, preview: Object.freeze({ notebooks: Object.freeze(cleanBooks), notes: Object.freeze(cleanNotes) }) };
}
export function analyzeImport(value) {
  if (!record(value) || value.format !== 'shared-notes' || value.version !== 1) return fail({ file: 'Choose a Shared Notes JSON file with format “shared-notes” and version 1.' });
  const result = importPreview(value.notebooks, value.notes);
  if (!result.ok) return result;
  return { ...result, counts: { notebooks: result.preview.notebooks.length, notes: result.preview.notes.length, ...Object.fromEntries(statuses.map(status => [status, result.preview.notes.filter(note => note.status === status).length])) }, warnings: ['Imported notes are new copies starting at version 1; earlier history is not carried into the copies.', 'Existing notebooks and notes are never overwritten. Colliding notebook names receive an “imported” suffix.'] };
}
export function importNotes(preview) {
  // AUDHD-12/13 / GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards:
  // revalidate at commit: the workspace limit may have changed since preview.
  // Construct the entire copy batch before publishing it; rejected input cannot
  // leave partial notebooks or modify existing notes, histories or drafts.
  const result = importPreview(preview?.notebooks, preview?.notes);
  if (!result.ok) return result;
  const usedNames = new Set(notebooks.map(book => book.name.toLowerCase()));
  const idMap = new Map();
  const importedBooks = result.preview.notebooks.map(book => {
    let name = book.name, number = 2;
    while (usedNames.has(name.toLowerCase())) {
      const suffix = ` (imported ${number++})`;
      name = book.name.slice(0, 100 - suffix.length) + suffix;
    }
    usedNames.add(name.toLowerCase());
    const copy = { id: newId('notebook'), name, description: book.description };
    idMap.set(book.id, copy.id);
    return copy;
  });
  const importedNotes = result.preview.notes.map(note => makeNote(newId('note'), { ...copyFields(note), notebookId: idMap.get(note.notebookId) }, note.status));
  notebooks.push(...importedBooks); notes.push(...importedNotes);
  recordEvent({ description: `Imported ${importedNotes.length} notes and ${importedBooks.length} notebooks as new copies. Existing data and drafts were unchanged.`, subject: 'Notes import' });
  return { ok: true, errors: {}, notebooks: importedBooks, notes: importedNotes };
}
