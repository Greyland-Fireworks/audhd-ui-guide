import assert from 'node:assert/strict';
import { getSessionEvents } from './events.js';
import {
  notebooks, notes, settings, noteDrafts, noteErrors, getNoteDraft, isNoteDirty,
  saveNote, discardNoteDraft, createNote, setNoteStatus, getNoteVersion,
  restoreNoteVersion, saveWorkspaceSettings, saveNotebook, exportNotes,
  analyzeImport, importNotes, resetNotesState,
} from './notes-state.js';
import { setConfigurationReadOnly, advanceScenarioTime } from './scenario-state.js';

// AUDHD-12 / GUIDE.md#audhd-12-validate-complete-tasks-and-report-actual-evidence:
// model checks prove state ownership and data boundaries. Browser tests separately
// establish that people can reach, understand and operate the owning controls.
assert.equal(notebooks.length, 3);
assert.equal(notes.length, 12);
assert.deepEqual(['active', 'archived', 'trash'].map(status => notes.filter(note => note.status === status).length), [8, 2, 2]);
const note = notes[0];
const first = getNoteVersion(note.id, 1);
assert(Object.isFrozen(first));
assert.throws(() => { first.body = 'changed'; }, TypeError);
const draft = getNoteDraft(note.id);
draft.title = '   ';
assert.equal(saveNote(note.id).ok, false);
assert(noteErrors.get(note.id).title);
assert.equal(getNoteDraft(note.id), draft);
assert.equal(note.version, 1);
draft.title = 'Harbor — revised kickoff';
draft.body = 'A fictional revision kept separate from the original agenda.';
assert(isNoteDirty(note));
assert(saveNote(note.id).ok);
assert.equal(note.version, 2);
assert.equal(getNoteVersion(note.id, 1), first);
assert.notEqual(getNoteVersion(note.id, 2).body, first.body);
assert(!noteDrafts.has(note.id));
assert(!noteErrors.has(note.id));
const eventCount = getSessionEvents().length;
assert.equal(saveNote(note.id).unchanged, true);
assert.equal(getSessionEvents().length, eventCount);

getNoteDraft(note.id).body = 'Keep this unsaved work while moving the saved record.';
for (const status of ['archived', 'trash', 'active']) {
  assert(setNoteStatus(note.id, status).ok);
  assert.equal(note.status, status);
  assert.equal(note.version, 2);
  assert.equal(getNoteDraft(note.id).body, 'Keep this unsaved work while moving the saved record.');
}
assert.equal(setNoteStatus('missing', 'active').ok, false);
assert.equal(setNoteStatus(note.id, 'deleted').ok, false);
assert.equal(restoreNoteVersion(note.id, 1).confirmationRequired, true);
assert.equal(getNoteDraft(note.id).body, 'Keep this unsaved work while moving the saved record.');
assert(restoreNoteVersion(note.id, 1, { replaceDirty: true }).ok);
assert.equal(getNoteDraft(note.id).body, first.body);
assert.equal(note.version, 2);
assert.notEqual(note.body, first.body);
assert(saveNote(note.id).ok);
assert.equal(note.version, 3);
assert.equal(note.body, first.body);
assert.equal(note.history.length, 3);
assert.equal(restoreNoteVersion(note.id, 999).ok, false);
getNoteDraft(note.id).title = 'Discard this title';
discardNoteDraft(note.id);
assert.equal(getNoteDraft(note.id).title, note.title);

assert.equal(saveNotebook({ name: 'MEETING NOTES', description: '' }).ok, false);
assert.equal(saveNotebook({ id: 'missing', name: 'Missing', description: '' }).ok, false);
const bookResult = saveNotebook({ name: 'Workshop', description: 'Fictional workshop notes.' });
assert(bookResult.ok);
assert(saveNotebook({ id: bookResult.notebook.id, name: 'Workshop notes', description: 'Updated fictional description.' }).ok);
const savedBody = note.body;
const retainedDraft = getNoteDraft(note.id);
retainedDraft.body = 'x'.repeat(120);
const lowered = saveWorkspaceSettings({ defaultNotebookId: bookResult.notebook.id, maxNoteLength: 100 });
assert(lowered.ok);
assert.equal(note.body, savedBody);
assert.equal(retainedDraft.body.length, 120);
assert.equal(saveNote(note.id).ok, false);
assert.equal(note.version, 3);
assert.equal(saveWorkspaceSettings({ defaultNotebookId: bookResult.notebook.id, maxNoteLength: 99 }).ok, false);
assert.equal(saveWorkspaceSettings({ defaultNotebookId: 'missing', maxNoteLength: 5000 }).ok, false);
assert.equal(settings.maxNoteLength, 100);
const newNote = createNote({ title: 'Title-only fictional note', body: '' });
assert(newNote.ok);
assert.equal(newNote.note.notebookId, bookResult.notebook.id);
assert.equal(createNote({ title: '', body: '' }).ok, false);
assert.equal(createNote({ title: 'Invalid notebook', body: '', notebookId: 'missing' }).ok, false);
assert(saveWorkspaceSettings({ defaultNotebookId: notebooks[0].id, maxNoteLength: 5000 }).ok);

const exported = exportNotes();
exported.notes[0].body = 'An export consumer must not mutate live state.';
exported.notes[0].history[0].body = 'Nor a saved revision.';
exported.notebooks[0].name = 'Nor a notebook.';
assert.equal(note.body, savedBody);
assert.equal(first.body, savedBody);
assert.equal(notebooks[0].name, 'Meeting notes');
const payload = exportNotes();
const countsBefore = [notebooks.length, notes.length];
const analysis = analyzeImport(payload);
assert(analysis.ok);
assert.deepEqual([notebooks.length, notes.length], countsBefore);
assert(Object.isFrozen(analysis.preview));
assert(Object.isFrozen(analysis.preview.notes[0]));
assert.equal(analysis.counts.notes, notes.length);
assert.equal(analysis.counts.trash, 2);
assert(analysis.warnings.some(message => message.includes('history')));
// The browser bounds file bytes, not record count. A growing workspace's own
// export must not fail solely because it contains more than a small seed fixture.
const manyBooks = Array.from({ length: 21 }, (_, index) => ({ ...payload.notebooks[0], id: `bulk-book-${index}`, name: `Fictional bulk notebook ${index}` }));
const manyNotes = Array.from({ length: 101 }, (_, index) => ({ ...payload.notes[0], title: `Fictional bulk note ${index}`, notebookId: manyBooks[index % manyBooks.length].id }));
assert(analyzeImport({ ...payload, notebooks: manyBooks, notes: manyNotes }).ok);
assert.equal(analyzeImport({ ...payload, notes: {} }).ok, false);
assert.equal(analyzeImport({ ...payload, notebooks: null }).ok, false);
assert.equal(analyzeImport({ ...payload, notes: [{ ...payload.notes[0], notebookId: 'missing' }] }).ok, false);
assert.equal(analyzeImport({ ...payload, notes: [{ ...payload.notes[0], status: 'deleted' }] }).ok, false);
assert.equal(analyzeImport({ ...payload, notes: [{ ...payload.notes[0], body: {} }] }).ok, false);
assert.equal(analyzeImport({ ...payload, notebooks: [payload.notebooks[0], payload.notebooks[0]] }).ok, false);
assert.equal(analyzeImport({ ...payload, version: 2 }).ok, false);
assert.deepEqual([notebooks.length, notes.length], countsBefore);

// Current limits are authoritative at commit, even after a valid preview. A bad
// last note must not leave a partial first note or new notebooks behind.
saveWorkspaceSettings({ defaultNotebookId: notebooks[0].id, maxNoteLength: 100 });
assert.equal(importNotes(analysis.preview).ok, false);
assert.deepEqual([notebooks.length, notes.length], countsBefore);
saveWorkspaceSettings({ defaultNotebookId: notebooks[0].id, maxNoteLength: 5000 });
const badPreview = { notebooks: analysis.preview.notebooks, notes: [...analysis.preview.notes, { title: '', body: '', notebookId: notebooks[0].id }] };
assert.equal(importNotes(badPreview).ok, false);
assert.deepEqual([notebooks.length, notes.length], countsBefore);
const originalIds = new Set([...notebooks, ...notes].map(item => item.id));
const beforeDraft = getNoteDraft(note.id);
const imported = importNotes(analysis.preview);
assert(imported.ok);
assert.equal(imported.notes.length, payload.notes.length);
assert.equal(imported.notebooks.length, payload.notebooks.length);
assert(imported.notes.every(item => !originalIds.has(item.id) && item.version === 1 && item.history.length === 1));
assert(imported.notes.every(item => imported.notebooks.some(book => book.id === item.notebookId)));
assert(imported.notebooks.every(item => !originalIds.has(item.id)));
assert.equal(new Set(notebooks.map(book => book.name.toLowerCase())).size, notebooks.length);
assert.equal(imported.notes.filter(item => item.status === 'trash').length, 2);
assert.equal(getNoteDraft(note.id), beforeDraft);
assert.equal(note.body, savedBody);
assert(getSessionEvents().some(event => event.subject === 'Notes import'));
assert(getSessionEvents().every(event => !event.description.includes('Keep this unsaved work')));
const beforeRestriction = { ...settings };
const booksBeforeRestriction = notebooks.map(book => ({ ...book }));
setConfigurationReadOnly(true);
assert.equal(saveWorkspaceSettings({ ...settings, maxNoteLength: 100 }).ok, false);
assert.deepEqual(settings, beforeRestriction);
assert.equal(saveNotebook({ ...notebooks[0], name: 'Blocked rename' }).ok, false);
assert.equal(saveNotebook({ name: 'Blocked new notebook', description: '' }).ok, false);
assert.deepEqual(notebooks, booksBeforeRestriction);
setConfigurationReadOnly(false);
// Export allowance teaching time cannot falsify note-save or policy receipts.
advanceScenarioTime(86_400_000);
const observedBefore = Date.now();
const timedNote = createNote({ title: 'Actual observation time', body: '', notebookId: notebooks[0].id });
const timedSettings = saveWorkspaceSettings({ ...settings });
assert(Date.parse(timedNote.note.updatedAt) >= observedBefore && Date.parse(timedNote.note.updatedAt) <= Date.now());
assert(Date.parse(timedSettings.effectiveAt) >= observedBefore && Date.parse(timedSettings.effectiveAt) <= Date.now());
resetNotesState('busy');
assert.equal(notes.length, 60);
assert.deepEqual(notebooks.map(book => notes.filter(note => note.notebookId === book.id).length), [20, 20, 20]);
assert(notes.some(note => note.id === 'harbor-kickoff'));
resetNotesState('empty');
assert.equal(notes.length, 0); assert.equal(notebooks.length, 3);
resetNotesState('normal');
assert.equal(notes.length, 12); assert.equal(settings.maxNoteLength, 5000);
console.log('PASS: fictional notes, separate drafts, immutable saved history, guarded restore, non-truncating settings, notebook uniqueness, saved-only export, schema-validated import preview and atomic copies with new identities.');
