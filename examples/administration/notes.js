import { notes, notebooks, settings, noteErrors, getNoteDraft, isNoteDirty, saveNote, createNote, discardNoteDraft, setNoteStatus, restoreNoteVersion } from './notes-state.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bookName = id => notebooks.find(book => book.id === id)?.name || 'Notebook unavailable';
const time = at => `<time datetime="${escape(at)}">${new Date(at).toLocaleString()}</time>`;
const title = (name, description) => `<div class="task-heading"><h1>${escape(name)}</h1><p>${description}</p></div>`;
// AUDHD-05/06/10: browse filters and an unsubmitted new note outlive their view.
// Existing-note drafts belong to notes-state.js. Never reconstruct either owner
// from a saved value when a user returns from Appearance or follows a breadcrumb.
const filters = new Map();
const historySelections = new Map();
let newDraft = null;
let newNotebookAtStart;
const newErrors = {};
// AUDHD-03/08: compare exact lines before rendering. Common outer context is
// omitted from the change list, but both complete saved texts remain available.
// ponytail: cap the LCS table at 200,000 cells; very large changed spans use an
// explicitly labeled whole-span replacement instead of blocking the interface.
export function compareNoteLines(before, after) {
  const left = before.split('\n'), right = after.split('\n');
  let start = 0, endLeft = left.length, endRight = right.length;
  while (start < endLeft && start < endRight && left[start] === right[start]) start++;
  while (endLeft > start && endRight > start && left[endLeft - 1] === right[endRight - 1]) { endLeft--; endRight--; }
  const a = left.slice(start, endLeft), b = right.slice(start, endRight);
  if (!a.length && !b.length) return { changes: [], coarse: false };
  if ((a.length + 1) * (b.length + 1) > 200000) return { changes: [{ before: a, after: b, beforeLine: start + 1, afterLine: start + 1 }], coarse: true };
  const width = b.length + 1, lengths = new Uint16Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
    lengths[i * width + j] = a[i] === b[j] ? lengths[(i + 1) * width + j + 1] + 1 : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
  }
  const changes = [];
  let i = 0, j = 0, change;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { change = null; i++; j++; continue; }
    if (!change) { change = { before: [], after: [], beforeLine: start + i + 1, afterLine: start + j + 1 }; changes.push(change); }
    if (j === b.length || (i < a.length && lengths[(i + 1) * width + j] >= lengths[i * width + j + 1])) change.before.push(a[i++]);
    else change.after.push(b[j++]);
  }
  return { changes, coarse: false };
}
const hasNewWork = () => newDraft && (newDraft.title || newDraft.body || newDraft.notebookId!==newNotebookAtStart || Object.keys(newErrors).length);
export function noteWorkSummary() {
  return notes.filter(note => isNoteDirty(note) || noteErrors.has(note.id)).map(note => ({
    text: `${note.title}: ${noteErrors.has(note.id) ? 'Correct the unsaved note' : 'Resume unsaved changes'}`,
    href: `#note/${note.id}/${Object.keys(noteErrors.get(note.id) || {})[0] || 'body'}`,
    hasProblem: noteErrors.has(note.id),
  })).concat(hasNewWork() ? [{text:'Finish the new note',href:`#notes/new/${Object.keys(newErrors)[0] || 'title'}`,hasProblem:Object.keys(newErrors).length > 0}] : []);
}
export function noteDestinations() {
  return [
    ...notebooks.map(book => ({path:`notes/notebook-${book.id}`,label:book.name,parent:'notebooks',group:'Notes',notebookId:book.id,record:true})),
    ...notes.flatMap(note => [
      {path:`note/${note.id}`,label:note.title,parent:note.status === 'active' ? `notes/notebook-${note.notebookId}` : `notes/${note.status === 'trash' ? 'trash' : 'archive'}`,group:'Notes',noteId:note.id,record:true,targets:['title','body','notebookId']},
      {path:`note/${note.id}/history`,label:'Saved versions',parent:`note/${note.id}`,group:'Notes',noteId:note.id,record:true,noteHistory:true},
    ]),
  ];
}
function noteRow(note) {
  const issue = noteErrors.has(note.id) ? 'Not saved · needs correction' : isNoteDirty(note) ? 'Unsaved changes' : '';
  return `<li class="note-row ${issue ? 'has-draft' : ''}"><div><a href="#note/${note.id}">${escape(note.title)}</a>${issue ? `<span class="note-state ${noteErrors.has(note.id) ? 'error' : ''}">${issue}</span>` : ''}</div><p>${escape(note.body.slice(0,110) || 'Title only; no note text.')}${note.body.length > 110 ? '…' : ''}</p></li>`;
}
export function renderNotes(container, page) {
  const status = page.path === 'notes/archive' ? 'archived' : page.path === 'notes/trash' ? 'trash' : 'active';
  const book = notebooks.find(item => item.id === page.notebookId);
  let query = filters.get(page.path) || '';
  const description = status === 'trash' ? 'Removed notes stay here until this page is refreshed. Restore a note to use it again; nothing is permanently deleted here.'
    : status === 'archived' ? 'Completed notes stay available to read. Restore one to active notes before editing it.'
    : book ? escape(book.description) : 'Meeting notes, project decisions and team reference.';
  container.innerHTML = title(book?.name || (status === 'active' ? 'Notes' : status === 'trash' ? 'Trash' : 'Archived notes'), description) + `
    <div class="panel-heading"><p id="note-count" role="status"></p>${status === 'active' ? '<a class="task-link ui-action" href="#notes/new">New note</a>' : ''}</div>
    <div class="filter-bar"><label for="notes-filter">Filter notes<input id="notes-filter" type="search" value="${escape(query)}" placeholder="For example, meeting"></label><button id="clear-notes">Clear filter</button></div>
    <div id="notebook-list" class="card-grid notebook-grid"></div>
    ${guideNote('notes-browse-design','Recognize the notebook before searching','<p>The initial view lists real notes grouped by notebook, with titles and excerpts. Filtering supplements browsing and retains notebook context. Active, archived and removed notes have separate destinations; a hidden draft remains owned by its note.</p>',['AUDHD-01','AUDHD-02','AUDHD-03','AUDHD-10'])}`;
  const draw = () => {
    const scoped = notes.filter(note => note.status === status && (!book || note.notebookId === book.id));
    const matches = scoped.filter(note => `${note.title} ${note.body} ${bookName(note.notebookId)}`.toLowerCase().includes(query.toLowerCase()));
    container.querySelector('#note-count').textContent = `${matches.length} of ${scoped.length} ${status === 'active' ? 'active' : status === 'trash' ? 'removed' : 'archived'} notes`;
    container.querySelector('#notebook-list').innerHTML = notebooks.filter(item => matches.some(note => note.notebookId === item.id)).map(item => {
      const collection = scoped.filter(note => note.notebookId === item.id);
      const shown = matches.filter(note => note.notebookId === item.id).sort((a,b)=>a.title.localeCompare(b.title));
      const draftCount = collection.filter(isNoteDirty).length;
      const errorCount = collection.filter(note => noteErrors.has(note.id)).length;
      // AUDHD-02/07: counts describe this saved collection, not hidden search
      // results or invented activity. Draft/error labels stay with their notes.
      const summary = [query ? `${shown.length} of ${collection.length} shown` : '', draftCount ? `${draftCount} with unsaved changes` : '', errorCount ? `${errorCount} needing correction` : ''].filter(Boolean).join(' · ');
      return `<section class="ui-panel notebook-card" data-notebook-id="${item.id}"><div class="notebook-heading"><h2>${book || status!=='active' ? escape(item.name) : `<a href="#notes/notebook-${item.id}">${escape(item.name)}</a>`}</h2><span class="notebook-count">${collection.length} ${status === 'trash' ? 'removed' : status} ${collection.length === 1 ? 'note' : 'notes'}</span></div>${!book ? `<p class="notebook-description">${escape(item.description)}</p>` : ''}${summary ? `<p class="notebook-summary">${summary}</p>` : ''}<ul class="note-rows">${shown.map(noteRow).join('')}</ul></section>`;
    }).join('') || `<p class="ui-panel">${query ? 'No matching notes. Clear the filter to see this collection.' : 'No notes in this collection.'}</p>`;
  };
  container.querySelector('#notes-filter').oninput = event => { query = event.target.value; filters.set(page.path,query); draw(); };
  container.querySelector('#clear-notes').onclick = () => { query = ''; filters.set(page.path,''); container.querySelector('#notes-filter').value = ''; draw(); container.querySelector('#notes-filter').focus(); };
  draw();
}
export function renderNote(container, id, history, changed) {
  const note = notes.find(item => item.id === id);
  const creating = !id;
  if (!creating && !note) return;
  if (creating && !newDraft) {newNotebookAtStart=settings.defaultNotebookId;newDraft={title:'',body:'',notebookId:newNotebookAtStart};}
  let draft = creating ? newDraft : getNoteDraft(id);
  const editable = creating || note.status === 'active';
  const description = creating ? 'Write a note for the Harbor project team. It joins the notebook after you save.' : `${escape(bookName(note.notebookId))} · ${note.status === 'active' ? 'Active note' : note.status === 'trash' ? 'In Trash' : 'Archived note'}`;
  const moveDescription = editable ? 'Archive completed work to keep active notebooks focused. Trash removes it from active notes but keeps it available to restore.' : history ? 'Restoring returns the note to its notebook. Saved versions and any unsaved changes stay with it.' : 'Move this archived note to Trash if it is no longer needed. Its saved versions and any unsaved changes stay available.';
  container.innerHTML = title(creating ? 'New note' : history ? `${note.title}: saved versions` : note.title,description) + `
    ${!creating ? `<nav class="note-tabs" aria-label="Note views"><a href="#note/${id}" ${history ? '' : 'aria-current="page"'}>Note</a><a href="#note/${id}/history" ${history ? 'aria-current="page"' : ''}>Saved versions (${note.history.length})</a></nav>` : ''}
    ${history ? '<section id="note-history" class="ui-panel" aria-label="Saved versions"></section>' : `
    <form id="note-form" class="ui-panel note-editor" novalidate>
      <div class="note-editor-context"><strong>${creating ? 'New note draft' : editable ? 'Edit note' : note.status === 'trash' ? 'Read removed note' : 'Read archived note'}</strong><span id="note-saved-context"></span></div>
      ${!editable ? '<div class="note-readonly"><p>This note is read-only. Restore it to active notes before editing.</p><button type="button" id="restore-note" class="ui-action">Restore to active notes</button></div>' : ''}
      <div id="note-errors" role="alert"></div>
      <label for="note-title">Title<input id="note-title" value="${escape(draft.title)}" ${editable ? '' : 'readonly'} aria-describedby="note-errors" required></label>
      <label for="note-notebookId">Notebook<select id="note-notebookId" ${editable ? '' : 'disabled'} aria-describedby="note-errors">${notebooks.map(book=>`<option value="${book.id}" ${draft.notebookId === book.id ? 'selected' : ''}>${escape(book.name)}</option>`).join('')}</select></label>
      <label for="note-body">Note text<textarea id="note-body" rows="10" ${editable ? '' : 'readonly'} aria-describedby="note-length note-errors">${escape(draft.body)}</textarea></label>
      <p id="note-length" class="muted"></p>
      <div class="note-save-bar"><p id="note-draft-status" role="status"></p><div id="note-result" class="status" role="status" tabindex="-1" hidden></div>
      ${editable ? `<div class="actions"><button id="save-note" class="ui-action" type="submit">${creating ? 'Create note' : 'Save note'}</button><button id="discard-note" type="button">Discard ${creating ? 'new note' : 'changes'}</button></div><div id="discard-confirm" class="account-status" hidden><p>Discard this note’s unsaved changes? Other notes stay unchanged.</p><div class="actions"><button type="button" id="confirm-discard">Discard this draft</button><button type="button" id="cancel-discard">Keep editing</button></div></div>` : ''}
      </div>
      <details class="context-help" data-guide-key="note-save-help"><summary>ⓘ About saving notes</summary><ul><li>Save updates this note for this browser visit. Refreshing or closing the page resets the sample workspace.</li><li>Leaving this screen keeps unsaved text. A saved version is a snapshot; restoring it first creates a draft for review.</li><li>Use Import &amp; export to download a JSON copy before refreshing if you want to keep your notes.</li></ul></details>
    </form>`}
    ${!creating && (editable || history || note.status !== 'trash') ? `<section class="ui-panel note-lifecycle"><h2>Move this note</h2><p>${moveDescription}</p><div class="actions">${!editable && history ? '<button id="restore-note" class="ui-action">Restore to active notes</button>' : editable ? '<button id="archive-note">Archive note</button>' : ''}${note.status !== 'trash' ? '<button id="trash-note">Move to Trash</button>' : ''}</div></section>` : ''}
    ${guideNote('note-edit-design','Saved content, drafts and recovery have different owners','<p>Typing changes only this note’s draft. Save creates a new snapshot; navigation and appearance do not. Saved-version review shows changed lines and differing fields, with complete saved originals available, before restoration fills a draft. The user then reviews and deliberately saves it. Archive and Trash preserve history and drafts, and offer a reversible path back. No real notes service or durable database is involved.</p>',['AUDHD-02','AUDHD-05','AUDHD-06','AUDHD-07','AUDHD-08','AUDHD-10','AUDHD-13'])}`;
  const get = selector => container.querySelector(selector);
  const result = text => { const region=get('#note-result'); region.textContent=text; region.hidden=false; region.focus(); };
  const errors = () => creating ? newErrors : noteErrors.get(id) || {};
  const showErrors = () => {
    get('#note-errors').innerHTML = Object.entries(errors()).length ? `<p class="error">Note not saved.</p><ul>${Object.entries(errors()).map(([field,message])=>`<li><a class="error" href="#note-${field}">${escape(message)}</a></li>`).join('')}</ul>` : '';
    for (const field of ['title','body','notebookId']) get(`#note-${field}`).setAttribute('aria-invalid',String(Boolean(errors()[field])));
    get('#note-errors').onclick = event => { const link=event.target.closest('a'); if(link) {event.preventDefault();get(link.getAttribute('href'))?.focus();} };
  };
  const update = () => {
    get('#note-length').textContent = `${draft.body.length.toLocaleString()} of ${settings.maxNoteLength.toLocaleString()} characters`;
    const dirty = creating ? Boolean(hasNewWork()) : isNoteDirty(note);
    get('#note-draft-status').textContent = creating ? 'Not created yet.' : dirty ? 'Unsaved changes. The saved version is unchanged.' : `Saved version ${note.version} for this visit · ${new Date(note.updatedAt).toLocaleString()}`;
    get('#note-saved-context').textContent = creating ? 'Not saved yet' : `${dirty ? editable ? 'Unsaved draft based on' : 'Showing retained unsaved draft based on' : 'Showing'} saved version ${note.version} · ${bookName(note.notebookId)}`;
    get('#note-form').dataset.draft = String(dirty);
    if (editable) {get('#save-note').disabled = !creating && !dirty; get('#discard-note').disabled = !dirty;}
    changed();
  };
  if (history) {
    // AUDHD-06/13: historical snapshots are read-only. A confirmation names the
    // one draft at risk; no retry or page visit may overwrite an in-progress edit.
    let selected = historySelections.get(id) || note.history.at(-2)?.version || note.version;
    if (!note.history.some(version => version.version === selected)) selected = note.version;
    get('#note-history').innerHTML = `<h2>Compare saved versions</h2><p>Review what changed before restoring. Restore fills an unsaved draft; it does not save over the current note.</p><label class="version-picker" for="note-version">Version to review<select id="note-version">${[...note.history].reverse().map(version=>`<option value="${version.version}" ${version.version === selected ? 'selected' : ''}>Version ${version.version} · ${escape(new Date(version.at).toLocaleString())}${version.version === note.version ? ' · Current' : ''}</option>`).join('')}</select></label><div id="version-comparison"></div><div class="version-restore"><p id="version-draft-warning">${isNoteDirty(note) ? 'You also have unsaved changes. Restoring asks before replacing that draft.' : 'There are no unsaved changes to replace.'}</p><button id="restore-selected-version" ${editable ? '' : 'disabled'}></button><div id="restore-confirm" class="account-status" hidden></div><div id="note-result" class="status" role="status" tabindex="-1" hidden></div>${!editable ? '<p>Restore the note to active notes before restoring a saved version.</p>' : ''}</div>`;
    const drawComparison = () => {
      const version = note.history.find(entry => entry.version === selected);
      const current = note.history.find(entry => entry.version === note.version);
      const fields = [['title','Title'],['notebookId','Notebook'],['body','Note text']];
      const different = fields.filter(([field]) => version[field] !== note[field]);
      const column = (value, name, side) => `<section class="version-column" data-version-side="${side}" aria-label="${name}"><div class="version-column-heading"><h3>${name}</h3>${time(value.at)}</div>${fields.map(([field,label])=>{
        const changed = version[field] !== note[field];
        const content = field === 'notebookId' ? bookName(value[field]) : value[field];
        return `<div class="version-field ${changed ? 'is-different' : ''}" data-version-field="${field}"><div class="version-field-label"><h4>${label}</h4><span>${changed ? 'Different' : 'Same'}</span></div>${field === 'body' ? `<p class="muted">${value.body.length.toLocaleString()} characters</p><pre class="note-copy">${escape(content || '(Empty note)')}</pre>` : `<p>${escape(content)}</p>`}</div>`;
      }).join('')}</section>`;
      // AUDHD-02/07/08: each changed span keeps its two sides together on a
      // phone. Complete saved snapshots remain separate from the editor draft.
      const diff = compareNoteLines(version.body, note.body);
      const side = (lines, label, line) => `<section class="version-change-side"><h4>${label}</h4>${lines.length ? `${line ? `<p class="muted">${lines.length === 1 ? `Line ${line}` : `Lines ${line}–${line + lines.length - 1}`}</p>` : ''}<pre class="note-copy">${escape(lines.join('\n') || '(Blank line)')}</pre>` : '<p>No text in this span.</p>'}</section>`;
      const changedFields = different.filter(([field])=>field !== 'body').map(([field,label])=>`<section class="version-change"><h3>${label}</h3><div class="version-change-pair">${side([field === 'notebookId' ? bookName(version[field]) : version[field]],`Selected version ${version.version}`,'')}${side([field === 'notebookId' ? bookName(note[field]) : note[field]],`Current saved version ${note.version}`,'')}</div></section>`).join('');
      const changedText = diff.changes.map((change,index)=>`<section class="version-change" data-change="${index}"><h3>Note text${diff.changes.length > 1 ? ` · change ${index + 1}` : ''}</h3><div class="version-change-pair">${side(change.before,`Selected version ${version.version}`,change.beforeLine)}${side(change.after,`Current saved version ${note.version}`,change.afterLine)}</div></section>`).join('');
      get('#version-comparison').innerHTML = `<p class="version-differences" role="status">${different.length ? `Different from the current saved note: ${different.map(([,label])=>label.toLowerCase()).join(', ')}.` : 'This version matches the current saved note.'}</p><p class="version-dates">Selected version ${version.version}: ${time(version.at)}<br>Current saved version ${note.version}: ${time(current?.at || note.updatedAt)}</p>${diff.coarse ? '<p>Large changed span: unchanged lines inside this span are included. Full saved texts are available below.</p>' : diff.changes.length ? '<p>Unchanged lines are omitted below. Both complete saved texts remain available for review.</p>' : ''}<div class="version-change-list">${changedFields}${changedText}</div><details class="context-help version-full-text" data-guide-key="note-full-versions-${id}"><summary>Read both complete saved versions</summary><div class="version-columns">${column(version,`Selected version ${version.version}`,'selected')}${column({...note,at:current?.at || note.updatedAt},`Current saved version ${note.version}`,'current')}</div></details>`;
      restoreGuideNotes(get('#version-comparison'));
      const button = get('#restore-selected-version');
      button.textContent = `Restore version ${version.version} to draft`;
      button.dataset.restoreVersion = String(version.version);
      get('#restore-confirm').hidden = true;
    };
    const restore = (version,replaceDirty=false) => {
      const outcome=restoreNoteVersion(id,version,{replaceDirty});
      if (outcome.confirmationRequired) {
        const region=get('#restore-confirm'); region.hidden=false;
        region.innerHTML=`<p>Replace this note’s unsaved draft with version ${version}? Its saved versions and other drafts stay unchanged.</p><div class="actions"><button id="replace-note-draft">Replace this draft</button><button id="keep-note-draft">Keep my draft</button></div>`;
        get('#replace-note-draft').onclick=()=>restore(version,true);
        get('#keep-note-draft').onclick=()=>{ region.hidden=true;get(`[data-restore-version="${version}"]`).focus(); };
        get('#keep-note-draft').focus();
      } else if(outcome.ok) {changed();location.hash=`note/${id}/body`;}
      else result(Object.values(outcome.errors || {}).join(' ') || 'This version cannot be restored.');
    };
    get('#note-version').onchange = event => { selected=Number(event.target.value);historySelections.set(id,selected);drawComparison(); };
    get('#restore-selected-version').onclick=()=>restore(selected);
    drawComparison();
  } else {
    showErrors(); update();
    for (const field of ['title','body','notebookId']) get(`#note-${field}`).oninput = event => { draft[field]=event.target.value;get('#note-result').hidden=true;update(); };
    get('#note-form').onsubmit = event => {
      event.preventDefault(); if(!editable)return;
      const outcome = creating ? createNote(draft) : saveNote(id);
      if(creating) {for(const key of Object.keys(newErrors)) delete newErrors[key];Object.assign(newErrors,outcome.errors || {});}
      // Saving replaces the draft owner with a clean copy. Rebind it before
      // another keystroke so subsequent edits cannot live in a detached object.
      if(outcome.ok && !creating) {
        draft=getNoteDraft(id);
        for(const field of ['title','body','notebookId']) get(`#note-${field}`).value=draft[field];
        container.querySelector('.note-tabs a:last-child').textContent=`Saved versions (${note.history.length})`;
      }
      showErrors(); update();
      if(!outcome.ok) {get('#note-errors a')?.focus();return;}
      if(creating) {newDraft=null; changed(); location.hash=`note/${outcome.note.id}`;}
      else {result(`Saved version ${note.version} for this visit. Your note is available in ${bookName(note.notebookId)}.`);}
    };
    if(editable) {
      get('#discard-note').onclick=()=>{get('#discard-confirm').hidden=false;get('#cancel-discard').focus();};
      get('#cancel-discard').onclick=()=>{get('#discard-confirm').hidden=true;get('#discard-note').focus();};
      get('#confirm-discard').onclick=()=>{
        if(creating){newDraft=null;for(const key of Object.keys(newErrors))delete newErrors[key];}else discardNoteDraft(id);
        renderNote(container,id,false,changed);restoreGuideNotes(container);container.querySelector('#note-title').focus();
      };
    }
  }
  for(const [selector,status] of [['#archive-note','archived'],['#trash-note','trash'],['#restore-note','active']]) {
    if(get(selector))get(selector).onclick=()=>{
      setNoteStatus(id,status);changed();renderNote(container,id,history,changed);restoreGuideNotes(container);
      const region=container.querySelector('#note-result');region.hidden=false;region.textContent=status==='active'?'Restored to active notes.':status==='trash'?'Moved to Trash. The note and any draft remain available to restore.':'Archived. The note and any draft remain available to restore.';region.focus();
    };
  }
}
