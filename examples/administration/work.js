import { owners, taskStatuses, getTasks, getRequests, getTask, getRequest, taskDraft, requestDraft, taskDirty, requestDirty, taskErrors, requestErrors, saveTask, saveRequest, submitRequest, reviewRequest, discardTask, discardRequest } from './work-state.js';
import { notes } from './notes-state.js';
import { getCalendarEvents } from './schedule-state.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';
import { registerScenarioOwner } from './scenario-state.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const heading = (title, description) => `<div class="task-heading"><h1>${escape(title)}</h1><p>${description}</p></div>`;
const taskTargets = ['title', 'owner', 'dueDate', 'status', 'blockedReason', 'dependencies', 'meetingId', 'noteId', 'requestId', 'saved'];
const requestTargets = ['title', 'requester', 'type', 'item', 'quantity', 'location', 'change', 'reason', 'submit', 'review', 'saved', 'draft'];
const requestStatus = { draft: 'Draft only', pending: 'Awaiting review', approved: 'Submitted version approved', returned: 'Returned for correction' };
const filters = { tasks: { owner: '', status: '' }, requests: { owner: '', status: '' } };
// AUDHD-05/10: view preferences and reviewer input outlive a mounted page, while
// work-state.js owns editable records. Rerendering a board must not silently
// clear another request's correction reason or reset the returning user's filter.
// See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
const filtersExpanded = { tasks: false, requests: false };
const taskOrder = ['blocked', 'open', 'doing', 'done'];
let taskView = 'board';
const notices = new Map(), reviewDrafts = new Map(), reviewFailures = new Map();
registerScenarioOwner('work-view', {reset: () => {
  for (const key of ['tasks','requests']) { filters[key] = {owner:'',status:''}; filtersExpanded[key] = false; }
  taskView = 'board'; notices.clear(); reviewDrafts.clear(); reviewFailures.clear();
}});
const dateText = date => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const option = (value, label, current) => `<option value="${escape(value)}" ${String(value) === String(current) ? 'selected' : ''}>${escape(label)}</option>`;

export function workDestinations() {
  const common = { group: 'Tasks & requests' };
  return [
    { ...common, path: 'work', label: 'Tasks & requests', alias: 'tasks' },
    { ...common, path: 'tasks', label: 'Tasks', parent: 'work' },
    { ...common, path: 'tasks/new', label: 'New task', parent: 'tasks', targets: [...taskTargets, ...getCalendarEvents().map(event => `meeting/${event.id}`)] },
    { ...common, path: 'requests', label: 'Requests', parent: 'work' },
    { ...common, path: 'requests/new', label: 'New request', parent: 'requests', targets: requestTargets },
    ...getTasks().map(task => ({ ...common, path: `task/${task.id}`, label: task.title, parent: 'tasks', record: true, targets: taskTargets })),
    ...getRequests().map(request => ({ ...common, path: `request/${request.id}`, label: request.fields.title, parent: 'requests', record: true, targets: requestTargets })),
  ];
}
export function workSummary() {
  const rows = [];
  for (const task of [...getTasks(), { id: 'new', title: 'New task' }]) {
    const errors = taskErrors.get(task.id) || {}, error = Object.keys(errors)[0];
    if (error || taskDirty(task.id) || task.status === 'blocked') rows.push({ href: `#${task.id === 'new' ? 'tasks/new' : `task/${task.id}`}/${error || (!taskDirty(task.id) && task.status === 'blocked' ? 'blockedReason' : 'title')}`, label: task.title, text: error ? 'Correct the unsaved task.' : taskDirty(task.id) ? 'Review unsaved task changes.' : `Blocked: ${task.blockedReason}`, actionLabel: error ? 'Correct task fields' : taskDirty(task.id) ? 'Review unsaved changes' : 'Resolve blocker', meta: task.owner ? `Owner: ${task.owner}` : '', hasProblem: Boolean(error || task.status === 'blocked') });
  }
  for (const request of [...getRequests(), { id: 'new', fields: { title: 'New request' } }]) {
    const error = Object.keys(requestErrors.get(request.id) || {})[0] || (reviewFailures.has(request.id) ? 'review' : '');
    const dirty = requestDirty(request.id);
    const unsubmitted = request.id !== 'new' && request.savedVersion !== request.submitted?.savedVersion;
    const target = error || (dirty ? 'title' : request.status === 'pending' ? 'review' : request.status === 'returned' ? 'draft' : unsubmitted ? 'submit' : 'title');
    if (error || dirty || unsubmitted || ['pending', 'returned'].includes(request.status)) rows.push({ href: `#${request.id === 'new' ? 'requests/new' : `request/${request.id}`}/${target}`, label: request.fields.title, text: error === 'review' ? 'Complete the local review decision.' : error ? 'Correct the unsaved request.' : dirty ? 'Review unsaved request changes.' : request.status === 'returned' ? `Correction needed: ${request.review.reason}` : request.status === 'pending' ? `Submitted version awaits local review.${unsubmitted ? ' A newer saved draft is not submitted.' : ''}` : 'Saved draft is ready to review and submit.', actionLabel: error === 'review' ? 'Complete review decision' : error ? 'Correct request fields' : dirty ? 'Review unsaved changes' : request.status === 'returned' ? 'Correct request' : request.status === 'pending' ? 'Review submitted version' : 'Review and submit draft', meta: request.fields.requester ? `Requested by: ${request.fields.requester}` : '', hasProblem: Boolean(error || request.status === 'returned') });
  }
  return rows;
}
const field = (prefix, name, label, control, help = '') => `<div class="work-field"><label for="${prefix}-${name}">${label}</label>${control}<p class="field-help" id="${prefix}-${name}-help">${help}</p><p class="error work-field-error" id="${prefix}-${name}-error" hidden></p></div>`;
const input = (prefix, name, value, type = 'text', attributes = '') => `<input id="${prefix}-${name}" name="${name}" type="${type}" value="${escape(value)}" aria-describedby="${prefix}-${name}-help ${prefix}-${name}-error" ${attributes}>`;
const select = (prefix, name, options) => `<select id="${prefix}-${name}" name="${name}" aria-describedby="${prefix}-${name}-help ${prefix}-${name}-error">${options}</select>`;
const textarea = (prefix, name, value, max) => `<textarea id="${prefix}-${name}" name="${name}" rows="3" maxlength="${max}" aria-describedby="${prefix}-${name}-help ${prefix}-${name}-error">${escape(value)}</textarea>`;
function displayErrors(container, prefix, errors, focus = false) {
  // AUDHD-06/09: a control describes only its own error. The summary is a set
  // of routes back to those controls, not a paragraph repeated at every field.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  const summary = container.querySelector(`#${prefix}-errors`);
  const entries = Object.entries(errors);
  summary.hidden = !entries.length;
  summary.innerHTML = entries.length ? `<p>Correct ${entries.length === 1 ? 'this issue' : 'these issues'} before continuing:</p><ul>${entries.map(([name, message]) => `<li><a href="#${prefix}-${name}" data-error-target="${prefix}-${name}">${escape(message)}</a></li>`).join('')}</ul>` : '';
  for (const message of container.querySelectorAll('.work-field-error')) { const name = message.id.slice(prefix.length + 1, -6); message.textContent = errors[name] || ''; message.hidden = !errors[name]; }
  for (const control of container.querySelectorAll('[name]')) control.setAttribute('aria-invalid', String(Boolean(errors[control.name])));
  container.querySelector(`#${prefix}-dependencies`)?.setAttribute('aria-invalid', String(Boolean(errors.dependencies)));
  const focusControl = id => {
    const control = container.querySelector(`#${id}`) || container.querySelector(`#${prefix}-title`);
    for (let ancestor = control?.parentElement; ancestor && ancestor !== container; ancestor = ancestor.parentElement) if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    control?.focus();
  };
  for (const link of summary.querySelectorAll('[data-error-target]')) link.onclick = event => { event.preventDefault(); focusControl(link.dataset.errorTarget); };
  if (focus) focusControl(`${prefix}-${Object.keys(errors)[0]}`);
}
const hasNewerRequestDraft = request => Boolean(request.submitted && request.savedVersion !== request.submitted.savedVersion);
const requestStateText = request => hasNewerRequestDraft(request) ? `Newer saved draft, not submitted. Submission ${request.submitted.version}: ${requestStatus[request.status].toLowerCase()}.` : requestStatus[request.status];
const tone = status => ['blocked', 'returned'].includes(status) ? 'problem' : ['done', 'approved'].includes(status) ? 'success' : ['doing', 'pending'].includes(status) ? 'review' : 'neutral';
function taskCard(task) {
  const prerequisites = task.dependencies.map(getTask).filter(Boolean);
  const request = task.requestId && getRequest(task.requestId);
  const waiting = prerequisites.some(item => item.status !== 'done');
  const action = task.status === 'blocked' ? 'Review blocker' : task.status === 'done' ? 'Review or reopen' : 'Update progress';
  return `<li class="task-card" data-tone="${tone(task.status)}" data-task-id="${task.id}">
    <h3><a href="#task/${task.id}">${escape(task.title)}</a></h3>
    <dl class="work-card-facts"><div><dt>Owner</dt><dd>${escape(task.owner)}</dd></div><div><dt>Due</dt><dd><time datetime="${task.dueDate}">${escape(dateText(task.dueDate))}</time></dd></div></dl>
    <p class="task-next"><strong>${task.status === 'done' ? 'Finished' : task.status === 'blocked' ? 'Blocked' : 'Next'}:</strong> ${escape(task.status === 'blocked' ? task.blockedReason : task.status === 'done' ? 'Reopen if more work is needed.' : waiting ? 'Work can begin; complete the prerequisite tasks before marking this task complete.' : task.status === 'doing' ? 'Finish the work, then mark complete.' : 'Start the work when ready.')}</p>
    ${prerequisites.length ? `<div class="task-relationship"><strong>Required before completion</strong><ul>${prerequisites.map(item => `<li><a href="#task/${item.id}">${escape(item.title)}</a><span>${taskStatuses[item.status]}</span></li>`).join('')}</ul></div>` : ''}
    ${request ? `<div class="task-relationship"><strong>Related request</strong><a href="#request/${request.id}">${escape(request.fields.title)}</a><span>${requestStateText(request)}</span>${request.status === 'approved' && task.status !== 'done' ? '<p>Approval does not complete this task.</p>' : ''}</div>` : ''}
    ${taskDirty(task.id) ? '<p class="work-draft-flag">Unsaved task changes</p>' : ''}
    <a class="task-card-action" href="#task/${task.id}/${task.status === 'blocked' ? 'blockedReason' : 'status'}">${action}<span aria-hidden="true"> →</span></a></li>`;
}
function taskCollection(rows, statusFilter) {
  // AUDHD-02/04: lane headings own their task cards. Each lane count describes
  // the already-filtered rows; the separate shown/total result explains scope.
  // A zero lane count therefore does not establish that no saved tasks exist.
  // AUDHD-02/08/11: the board is a real status grouping, not draggable decoration.
  // The list uses the same order and records. Both keep prerequisite links and
  // record-edit actions available to keyboard and touch users.
  // See ../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings.
  return `<div class="task-collection" data-view="${taskView}">${taskOrder.filter(status => !statusFilter || statusFilter === status).map(status => {
    const tasks = rows.filter(task => task.status === status);
    return `<section class="task-lane" data-status="${status}" data-tone="${tone(status)}" aria-labelledby="lane-${status}"><div class="task-lane-heading"><h2 id="lane-${status}">${taskStatuses[status]}</h2><span class="lane-count" aria-label="${tasks.length} ${taskStatuses[status].toLowerCase()} tasks">${tasks.length}</span></div><ul class="task-cards">${tasks.map(taskCard).join('')}</ul>${tasks.length ? '' : '<p class="lane-empty">No matching tasks.</p>'}</section>`;
  }).join('')}</div>`;
}
function requestStages(request, compact = false) {
  const current = !request?.submitted ? 0 : request.status === 'pending' ? 1 : 2;
  const newer = request?.submitted && request.savedVersion !== request.submitted.savedVersion;
  const dirty = requestDirty(request?.id || 'new');
  const descriptions = [request ? `Saved draft ${request.savedVersion}${dirty ? ' · Unsaved changes' : newer ? ' · Newer, not submitted' : ''}` : 'Not saved yet', request?.submitted ? `Submission ${request.submitted.version}${current === 1 ? ' · Awaiting review' : ''}` : 'Not submitted', request?.status === 'approved' ? 'Approved' : request?.status === 'returned' ? 'Correction needed' : 'No decision yet'];
  return `<ol class="request-stages ${compact ? 'is-compact' : ''}" aria-label="${compact ? 'Request stages' : 'Request progress'}">${['Draft', 'Submitted', 'Decision'].map((label, index) => `<li data-stage="${index}" data-state="${index === 0 && (newer || dirty) ? 'newer' : index < current ? 'complete' : index === current ? 'current' : 'waiting'}" ${index === current ? 'aria-current="step"' : ''} ${index === current ? `data-tone="${tone(request?.status || 'draft')}"` : ''}><span class="stage-marker" aria-hidden="true">${index === 0 && (newer || dirty) ? '↻' : index < current ? '✓' : index + 1}</span><span><strong>${label}</strong>${compact ? '' : `<small>${escape(descriptions[index])}</small>`}</span></li>`).join('')}</ol>`;
}
function requestCard(request) {
  const correction = request.status === 'returned';
  const newer = hasNewerRequestDraft(request);
  const action = correction ? 'Correct request' : request.status === 'pending' ? 'Review submission' : newer ? 'Review newer draft' : request.status === 'approved' ? 'View decision' : 'Review draft';
  // AUDHD-07: the title belongs to the saved draft. An older approval cannot
  // lend its success color or label to content it never covered.
  // See ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status.
  return `<li class="request-card" data-request-id="${request.id}" data-tone="${correction ? 'problem' : newer ? 'neutral' : tone(request.status)}"><span class="work-status-label">${newer ? 'Newer saved draft — not submitted' : requestStatus[request.status]}</span><h2><a href="#request/${request.id}">${escape(request.fields.title)}</a></h2><dl class="work-card-facts"><div><dt>Requested by</dt><dd>${escape(request.fields.requester)}</dd></div><div><dt>Type</dt><dd>${request.fields.type === 'equipment' ? 'Equipment' : 'Workspace'}</dd></div></dl>${requestStages(request, true)}${newer ? `<p class="request-previous-outcome">Submission ${request.submitted.version}, “${escape(request.submitted.fields.title)}”: ${requestStatus[request.status].toLowerCase()}.</p>` : ''}${correction ? `<p class="task-next"><strong>Correct:</strong> ${escape(request.review.reason)}</p>` : ''}${requestDirty(request.id) ? '<p class="work-draft-flag">Unsaved request changes</p>' : ''}<a class="task-card-action" href="#request/${request.id}${request.status === 'pending' ? '/review' : ''}">${action}<span aria-hidden="true"> →</span></a></li>`;
}
function list(container, kind) {
  const taskList = kind === 'tasks', current = filters[kind];
  const records = taskList ? getTasks() : getRequests();
  const rows = records.filter(record => (!current.owner || (taskList ? record.owner : record.fields.requester) === current.owner) && (!current.status || record.status === current.status));
  rows.sort((a, b) => (a.title || a.fields.title).localeCompare(b.title || b.fields.title));
  container.innerHTML = `<section class="work-tools">${heading(taskList ? 'Tasks' : 'Requests', taskList ? 'Assign work, set a due date and track what is blocking completion.' : 'Prepare an equipment or workspace request, then review its submitted version.')}
    <div class="work-toolbar"><a class="task-link ui-action" href="#${kind}/new">${taskList ? 'New task' : 'New request'}</a>${taskList ? `<div class="work-view-switch" role="group" aria-label="Task view"><button id="work-board-view" aria-pressed="${taskView === 'board'}">Status board</button><button id="work-list-view" aria-pressed="${taskView === 'list'}">Grouped list</button></div>` : ''}</div>
    <details class="work-filters" ${filtersExpanded[kind] ? 'open' : ''}><summary id="work-filter-toggle">Filter ${kind} <span>· ${escape(current.owner || 'Everyone')} · ${escape((taskList ? taskStatuses : requestStatus)[current.status] || 'All statuses')}</span></summary><fieldset class="work-filter"><legend>Filter ${kind}</legend><label>Person<select id="work-person-filter">${option('', 'Everyone', current.owner)}${owners.map(owner => option(owner, owner, current.owner)).join('')}</select></label><label>Status<select id="work-status-filter">${option('', 'All statuses', current.status)}${Object.entries(taskList ? taskStatuses : requestStatus).map(([value, label]) => option(value, label, current.status)).join('')}</select></label><button type="button" id="work-filter-reset" ${current.owner || current.status ? '' : 'disabled'}>Reset filters</button></fieldset></details>
    <p id="work-result-count" role="status">${rows.length} of ${records.length} ${kind} shown.</p>${taskList ? taskCollection(rows, current.status) : `<ul class="work-list requests-grid">${rows.map(requestCard).join('')}</ul>`}${rows.length ? '' : '<p>No matching records. Choose another filter to see the other work.</p>'}${taskList ? guideNote('task-board-design', 'Compare work by status', '<p>The board and list use the same records and explicit links. View changes do not change task status.</p>', ['AUDHD-02', 'AUDHD-08', 'AUDHD-10']) : ''}</section>`;
  const disclosure = container.querySelector('.work-filters');
  disclosure.ontoggle = () => { if (disclosure.isConnected) filtersExpanded[kind] = disclosure.open; };
  for (const [id, key] of [['work-person-filter', 'owner'], ['work-status-filter', 'status']]) container.querySelector(`#${id}`).onchange = event => { filtersExpanded[kind] = disclosure.open; current[key] = event.target.value; list(container, kind); container.querySelector(`#${id}`).focus(); };
  container.querySelector('#work-filter-reset').onclick = () => { current.owner = ''; current.status = ''; list(container, kind); container.querySelector('#work-filter-toggle').focus(); };
  if (taskList) for (const [id, view] of [['work-board-view', 'board'], ['work-list-view', 'list']]) container.querySelector(`#${id}`).onclick = () => { taskView = view; list(container, kind); container.querySelector(`#${id}`).focus(); };
}

function taskForm(container, key, path, changed) {
  const saved = key === 'new' ? null : getTask(key), draft = taskDraft(key);
  const sourceMeeting = path.startsWith('tasks/new/meeting/') && getCalendarEvents().find(event => event.id === path.slice('tasks/new/meeting/'.length));
  if (sourceMeeting && !taskDirty('new')) { draft.meetingId = sourceMeeting.id; draft.noteId = sourceMeeting.noteId || ''; }
  const availableNotes = notes.filter(note => note.status !== 'trash');
  const unavailableNote = draft.noteId && !availableNotes.some(note => note.id === draft.noteId);
  let errors = taskErrors.get(key) || {};
  container.innerHTML = `<section class="work-tools">${heading(saved?.title || 'New task', 'Assign the work, its due date and any tasks required before completion.')}
    <a href="#tasks">All tasks</a>
    ${sourceMeeting && draft.meetingId !== sourceMeeting.id ? '<p class="status">Your existing new-task draft is retained. Choose the meeting below if you want to change its link.</p>' : ''}
    <form class="ui-panel" id="task-form" novalidate>
      <p id="task-saved-state">${saved ? `Saved version ${saved.version}: ${taskStatuses[saved.status]}.` : 'Not created yet.'}</p>
      <div id="task-errors" class="error work-error-summary" role="alert" hidden></div>
      ${field('task', 'title', 'Task title', input('task', 'title', draft.title, 'text', 'maxlength="160" required'), 'Name the work. Example: Prepare the weekly agenda.')}
      <div class="work-pair">${field('task', 'owner', 'Responsible person', select('task', 'owner', owners.map(owner => option(owner, owner, draft.owner)).join('')), 'This person owns the next action.')}${field('task', 'dueDate', 'Due date', input('task', 'dueDate', draft.dueDate, 'date', 'required'), 'Choose a calendar date. A past date keeps overdue work visible; it does not erase it.')}</div>
      ${field('task', 'status', 'Progress', select('task', 'status', Object.entries(taskStatuses).map(([value, label]) => option(value, label, draft.status)).join('')), 'Choose Complete when finished. To reopen completed work, choose In progress and save.')}
      <div id="blocked-fields" ${draft.status !== 'blocked' ? 'hidden' : ''}>${field('task', 'blockedReason', 'What is blocking this task?', textarea('task', 'blockedReason', draft.blockedReason, 1000), 'State what is needed next. Example: Waiting for a replacement cable.')}</div>
      <fieldset id="task-dependencies" tabindex="-1" aria-describedby="task-dependencies-help task-dependencies-error"><legend>Tasks required before completion</legend><p id="task-dependencies-help">Work can start in parallel. These tasks must be complete before this task can be marked Complete. Leave all unchecked if none are required; circular dependencies are not allowed.</p>${getTasks().filter(task => task.id !== key).map(task => `<label class="inline"><input type="checkbox" name="dependencies" value="${task.id}" aria-describedby="task-dependencies-help task-dependencies-error" ${draft.dependencies.includes(task.id) ? 'checked' : ''}>${escape(task.title)} — ${taskStatuses[task.status]}</label>`).join('')}<p id="task-dependencies-error" class="error work-field-error" hidden></p></fieldset>
      <fieldset><legend>Related context <span class="muted">(optional)</span></legend>${field('task', 'meetingId', 'Meeting', select('task', 'meetingId', option('', 'No meeting linked', draft.meetingId) + getCalendarEvents().map(event => option(event.id, `${event.title} · ${event.date}${event.status === 'cancelled' ? ' · Cancelled' : ''}`, draft.meetingId)).join('')), 'Link the meeting that produced this task. This does not book a meeting or send an invitation.')}${field('task', 'noteId', 'Note', select('task', 'noteId', option('', 'No note linked', draft.noteId) + (unavailableNote ? option(draft.noteId, 'Linked note unavailable or in Trash', draft.noteId) : '') + availableNotes.map(note => option(note.id, note.title, draft.noteId)).join('')), unavailableNote ? 'Restore the linked note from Trash, choose another note or choose No note linked before saving.' : 'Link the instructions or decision. Leaving this empty is allowed.')}${field('task', 'requestId', 'Related request', select('task', 'requestId', option('', 'No request linked', draft.requestId) + getRequests().map(request => option(request.id, `${request.fields.title} · ${requestStateText(request)}`, draft.requestId)).join('')), 'Link equipment or a workspace change needed for the work. Approval does not automatically unblock or complete this task.')}</fieldset>
      <p id="task-draft-state" role="status">${taskDirty(key) ? 'Unsaved task changes.' : 'No unsaved changes.'}</p>
      <div class="actions"><button class="ui-action" type="submit">${saved ? 'Save task' : 'Create task'}</button><button type="button" id="discard-task">Discard changes</button></div>
      <p id="task-saved" role="status" tabindex="-1">${escape(notices.get(`task/${key}`) || '')}</p>
    </form>${saved?.meetingId ? `<p><a href="#meeting/${saved.meetingId}">Open linked meeting</a></p>` : ''}${saved?.noteId ? `<p><a href="#note/${saved.noteId}">Open linked note</a></p>` : ''}${saved?.requestId ? `<section class="ui-panel task-linked-request"><h2>Related request</h2><a href="#request/${saved.requestId}">${escape(getRequest(saved.requestId).fields.title)}</a><p>${requestStateText(getRequest(saved.requestId))}. This task stays ${taskStatuses[saved.status].toLowerCase()} until its progress is updated.</p></section>` : ''}
    ${guideNote('task-ownership-guide', 'Prerequisites and retained drafts', '<p>Dependencies constrain completion. A graph check rejects circular work; changing pages or appearance retains the unsaved task. All records belong to this browser visit.</p>', ['AUDHD-04', 'AUDHD-06', 'AUDHD-10'])}</section>`;
  displayErrors(container, 'task', errors);
  const form = container.querySelector('#task-form');
  form.oninput = event => {
    const control = event.target;
    notices.delete(`task/${key}`); container.querySelector('#task-saved').textContent = '';
    draft[control.name] = control.name === 'dependencies' ? [...form.querySelectorAll('[name=dependencies]:checked')].map(input => input.value) : control.value;
    delete errors[control.name]; displayErrors(container, 'task', errors);
    container.querySelector('#blocked-fields').hidden = draft.status !== 'blocked';
    container.querySelector('#task-draft-state').textContent = taskDirty(key) ? 'Unsaved task changes.' : 'No unsaved changes.';
    changed();
  };
  form.onsubmit = event => {
    event.preventDefault(); const result = saveTask(key); changed();
    if (!result.ok) { errors = result.errors; displayErrors(container, 'task', errors, true); return; }
    notices.set(`task/${result.task.id}`, `Saved. Task is ${taskStatuses[result.task.status].toLowerCase()}.`);
    // AUDHD-05: report a save beside its action instead of taking the reader
    // back to the first field. Only creation changes to a new record route.
    // See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    if (key === 'new') location.hash = `task/${result.task.id}/saved`;
    else { taskForm(container, key, `task/${key}`, changed); container.querySelector('#task-saved').focus(); }
  };
  container.querySelector('#discard-task').onclick = () => { discardTask(key); changed(); taskForm(container, key, key === 'new' ? 'tasks/new' : `task/${key}`, changed); container.querySelector('#task-title').focus(); };
  // AUDHD-06/13: task and request discard handlers restore saved fields directly.
  // They do not retain an Undo snapshot; submission history protects submitted
  // versions only, not text discarded from the current editable draft.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  restoreGuideNotes(container);
}

function requestDetails(fields) {
  return `<dl class="work-snapshot"><dt>Title</dt><dd>${escape(fields.title)}</dd><dt>Requested by</dt><dd>${escape(fields.requester)}</dd>${fields.type === 'equipment' ? `<dt>Equipment</dt><dd>${escape(fields.quantity)} × ${escape(fields.item)}</dd>` : `<dt>Place</dt><dd>${escape(fields.location)}</dd><dt>Requested change</dt><dd>${escape(fields.change)}</dd>`}<dt>Reason</dt><dd>${escape(fields.reason)}</dd></dl>`;
}
function submissionHtml(request) {
  const snapshot = request.submitted;
  if (!snapshot) return '<p>No version has been submitted.</p>';
  return `<h2>Submitted version ${snapshot.version}</h2><p>${requestStatus[request.status]} · Submitted ${escape(new Date(snapshot.at).toLocaleString())}</p>
    ${requestDetails(snapshot.fields)}
    ${request.review ? `<p class="status" id="request-decision" tabindex="-1">${request.review.decision === 'approved' ? `Approval applies only to submitted version ${snapshot.version}.` : `Correction needed: ${escape(request.review.reason)}`}</p>` : ''}
    ${request.savedVersion !== snapshot.savedVersion ? '<p><strong>The saved draft has newer changes. They are not part of this submission or its decision.</strong></p>' : ''}`;
}

function requestProgress(request, key) {
  // AUDHD-04/07/08: the rail follows the submitted version, not the latest
  // keystroke. A newer draft is a separate branch, never implied approval.
  // See ../../GUIDE.md#audhd-04-explain-effective-behavior.
  const status = request?.status || 'draft';
  const title = status === 'approved' ? `Submission ${request.submitted.version} approved` : requestStatus[status];
  const explanation = status === 'returned' ? request.review.reason : status === 'pending' ? `Submission ${request.submitted.version} is awaiting a local review decision.` : status === 'approved' ? 'Approval does not mean equipment has arrived or linked tasks are complete.' : request ? 'Review the saved details, then submit when ready.' : 'Complete the draft and save it before submitting.';
  const route = key === 'new' ? 'requests/new' : `request/${key}`;
  const tasks = request ? getTasks().filter(task => task.requestId === key) : [];
  return `<section class="request-progress" aria-label="Request status">${requestStages(request)}<div class="request-state-banner" data-tone="${tone(status)}"><div><strong>${escape(title)}</strong><p>${escape(explanation)}</p></div>${status === 'returned' ? `<a class="task-link" href="#${route}/draft">Correct the draft</a>` : status === 'pending' ? `<a class="task-link" href="#${route}/review">Review submitted version</a>` : ''}</div>${tasks.length ? `<div class="request-linked-tasks"><strong>Linked work</strong>${tasks.map(task => `<a href="#task/${task.id}">${escape(task.title)} <span>— ${taskStatuses[task.status]}</span></a>`).join('')}</div>` : ''}</section>`;
}
function submitHelp(saved, key) {
  if (!saved) return 'Save the draft first.';
  if (saved.status === 'pending') return 'The submitted version awaits a decision. You can save later edits as a separate draft.';
  if (requestDirty(key)) return 'Save or discard your edits before submitting. The previously submitted version stays unchanged.';
  if (saved.submitted?.savedVersion === saved.savedVersion) return 'Save a correction or change before submitting another version.';
  return `Review saved draft version ${saved.savedVersion} below. Submit copies these details into a new submission; later edits stay separate.`;
}

function requestForm(container, key, changed) {
  const saved = key === 'new' ? null : getRequest(key), draft = requestDraft(key);
  let errors = requestErrors.get(key) || {};
  const equipment = draft.type === 'equipment';
  const canSubmit = saved && !requestDirty(key) && saved.status !== 'pending' && saved.savedVersion !== saved.submitted?.savedVersion;
  container.innerHTML = `<section class="work-tools">${heading(saved?.fields.title || 'New request', 'Save a draft, then submit that version for a local review. No real order or workspace change is sent.')}
    <a href="#requests">All requests</a>
    ${requestProgress(saved, key)}<div class="request-workspace"><form class="ui-panel" id="request-form" novalidate>
      <h2 id="request-draft" tabindex="-1">Request draft</h2><p>${saved ? `Saved draft version ${saved.savedVersion}.` : 'Not saved yet.'} Saving does not submit a request.</p>
      <div id="request-errors" class="error work-error-summary" role="alert" hidden></div>
      ${field('request', 'title', 'Request title', input('request', 'title', draft.title, 'text', 'maxlength="160" required'), 'Example: Replace the meeting room cable.')}
      <div class="work-pair">${field('request', 'requester', 'Requested by', select('request', 'requester', owners.map(owner => option(owner, owner, draft.requester)).join('')), 'Who needs this equipment or change?')}${field('request', 'type', 'Request type', select('request', 'type', option('equipment', 'Equipment', draft.type) + option('workspace', 'Workspace change', draft.type)), 'The selected type determines which details are needed.')}</div>
      ${equipment ? `<fieldset><legend>Equipment details</legend>${field('request', 'item', 'Equipment needed', input('request', 'item', draft.item, 'text', 'maxlength="160"'), 'Example: HDMI cable. Use a specific item name.')}${field('request', 'quantity', 'Number of items', input('request', 'quantity', draft.quantity, 'number', 'min="1" max="20" step="1"'), 'Enter 1 to 20 items. Example: 2 cables.')}</fieldset>` : `<fieldset><legend>Workspace change</legend>${field('request', 'location', 'Affected place', input('request', 'location', draft.location, 'text', 'maxlength="160"'), 'Example: Harbor meeting room.')}${field('request', 'change', 'Change requested', textarea('request', 'change', draft.change, 1000), 'Example: Move the display where everyone at the table can see it.')}</fieldset>`}
      ${field('request', 'reason', 'Why is this needed?', textarea('request', 'reason', draft.reason, 2000), 'Describe the problem this would solve. Example: The current cable loses its connection.')}
      <p id="request-draft-state" role="status">${requestDirty(key) ? 'Unsaved request changes.' : 'No unsaved changes.'}</p>
      <div class="actions"><button class="ui-action" type="submit">Save request draft</button><button type="button" id="discard-request">Discard changes</button></div>
      <p id="request-saved" role="status" tabindex="-1">${escape(notices.get(`request/${key}`) || '')}${notices.has(`request/${key}`) && canSubmit ? ` <a href="#request/${key}/submit">Review and submit this saved draft</a>` : ''}</p>
    </form><div class="request-review-column">
    <section class="ui-panel" id="request-submission"><h2>Submit the saved draft</h2><p id="request-submit-help">${submitHelp(saved, key)}</p>${saved && saved.savedVersion !== saved.submitted?.savedVersion ? `<details id="saved-request-preview" open><summary>Review saved draft version ${saved.savedVersion}</summary><p>These saved details exclude any unsaved edits in the form.</p>${requestDetails(saved.fields)}</details>` : ''}<button id="request-submit" ${canSubmit ? '' : 'disabled'} aria-describedby="request-submit-help">${saved?.submitted ? 'Submit revised request' : 'Submit request'}</button></section>
    <section class="ui-panel" id="submitted-snapshot">${saved ? submissionHtml(saved) : '<p>No version has been submitted.</p>'}
      ${saved?.status === 'pending' ? `<details ${reviewFailures.has(key) ? 'open' : ''}><summary id="request-review">Try a local reviewer decision</summary><p>This is a reviewer simulation for this browser visit. It does not enforce staff permissions or contact a real approval service.</p><p>Review submitted version ${saved.submitted.version} above. A newer draft, if present, is excluded.</p><label for="request-review-reason">Correction needed <span class="muted">(required when returning)</span><textarea id="request-review-reason" rows="3" maxlength="1000" aria-describedby="request-review-help review-error" aria-invalid="${reviewFailures.has(key)}">${escape(reviewDrafts.get(key) || '')}</textarea></label><p id="request-review-help">Example: Specify the cable length. Approval needs no correction message.</p><p id="review-error" class="error" role="alert">${escape(reviewFailures.get(key) || '')}</p><div class="actions"><button id="approve-request">Approve submitted version ${saved.submitted.version}</button><button id="return-request">Return for correction</button></div></details>` : ''}
    </section>${saved?.submissions.length > 1 ? `<details id="request-history"><summary>Earlier submissions and decisions</summary><ol class="request-history">${saved.submissions.slice(0, -1).map(submission => {
      const decision = saved.decisions.find(item => item.submissionVersion === submission.version);
      return `<li data-submission-version="${submission.version}"><h3>Submission ${submission.version}: ${escape(submission.fields.title)}</h3><p>Submitted ${escape(new Date(submission.at).toLocaleString())}</p>${decision ? `<p><strong>${decision.decision === 'approved' ? 'Approved' : 'Returned for correction'}</strong> · ${escape(new Date(decision.at).toLocaleString())}</p>${decision.reason ? `<p>${escape(decision.reason)}</p>` : ''}` : '<p>No decision recorded for this version.</p>'}<details><summary>Submitted details</summary>${requestDetails(submission.fields)}</details></li>`;
    }).join('')}</ol></details>` : ''}</div></div>
    ${guideNote('request-snapshot-guide', 'A decision applies to one submitted version', '<p>The visible snapshot is separate from the editable draft. Review actions reject stale submission versions. This teaching workflow simulates review; a production application must authorize reviewers on the server.</p>', ['AUDHD-06', 'AUDHD-07', 'AUDHD-13'])}</section>`;
  displayErrors(container, 'request', errors);
  const form = container.querySelector('#request-form');
  form.oninput = event => {
    notices.delete(`request/${key}`); container.querySelector('#request-saved').textContent = '';
    draft[event.target.name] = event.target.name === 'quantity' && event.target.value !== '' ? Number(event.target.value) : event.target.value; delete errors[event.target.name];
    displayErrors(container, 'request', errors);
    container.querySelector('#request-draft-state').textContent = requestDirty(key) ? 'Unsaved request changes.' : 'No unsaved changes.';
    const submit = container.querySelector('#request-submit');
    submit.disabled = !saved || requestDirty(key) || saved.status === 'pending' || saved.savedVersion === saved.submitted?.savedVersion;
    container.querySelector('#request-submit-help').textContent = submitHelp(saved, key);
    container.querySelector('.request-progress .request-stages').outerHTML = requestStages(saved);
    changed();
  };
  container.querySelector('#request-type').onchange = () => { for (const field of ['item', 'quantity', 'location', 'change']) delete errors[field]; requestForm(container, key, changed); container.querySelector('#request-type').focus(); };
  form.onsubmit = event => {
    event.preventDefault(); const result = saveRequest(key); changed();
    if (!result.ok) { errors = result.errors; displayErrors(container, 'request', errors, true); return; }
    notices.set(`request/${result.request.id}`, `Draft version ${result.request.savedVersion} saved. Submission status is unchanged.`);
    if (key === 'new') location.hash = `request/${result.request.id}/saved`;
    else { requestForm(container, key, changed); container.querySelector('#request-saved').focus(); }
  };
  container.querySelector('#discard-request').onclick = () => { discardRequest(key); changed(); requestForm(container, key, changed); container.querySelector('#request-title').focus(); };
  container.querySelector('#request-submit').onclick = () => {
    const result = submitRequest(key); changed();
    if (!result.ok) { errors = result.errors; requestErrors.set(key, errors); displayErrors(container, 'request', errors, true); return; }
    notices.set(`request/${key}`, `Submitted version ${result.request.submitted.version}. Awaiting a local review decision.`);
    requestForm(container, key, changed); container.querySelector('#request-review').focus();
  };
  if (saved?.status === 'pending') {
    container.querySelector('#request-review-reason').oninput = event => {
      reviewDrafts.set(key, event.target.value); reviewFailures.delete(key);
      event.target.setAttribute('aria-invalid', 'false'); container.querySelector('#review-error').textContent = ''; changed();
    };
    for (const [button, decision] of [['approve-request', 'approved'], ['return-request', 'returned']]) container.querySelector(`#${button}`).onclick = () => {
      const result = reviewRequest(key, saved.submitted.version, decision, reviewDrafts.get(key) || '');
      if (!result.ok) { reviewFailures.set(key, result.errors.review); container.querySelector('#review-error').textContent = result.errors.review; container.querySelector('#request-review-reason').setAttribute('aria-invalid', 'true'); container.querySelector('#request-review-reason').focus(); changed(); return; }
      notices.set(`request/${key}`, decision === 'approved' ? `Submitted version ${saved.submitted.version} approved. Any newer draft still needs its own submission.` : `Submitted version ${saved.submitted.version} returned for correction.`);
      reviewDrafts.delete(key); reviewFailures.delete(key); changed(); requestForm(container, key, changed); container.querySelector('#request-decision').focus();
    };
  }
  restoreGuideNotes(container);
}

export function renderWork(container, path = 'tasks', changed = () => {}) {
  if (path === 'work' || path === 'tasks') return list(container, 'tasks');
  if (path === 'requests') return list(container, 'requests');
  if (path === 'tasks/new' || path.startsWith('tasks/new/')) return taskForm(container, 'new', path, changed);
  if (path === 'requests/new' || path.startsWith('requests/new/')) return requestForm(container, 'new', changed);
  const [kind, key] = path.split('/');
  if (kind === 'task' && getTask(key)) return taskForm(container, key, path, changed);
  if (kind === 'request' && getRequest(key)) return requestForm(container, key, changed);
  container.innerHTML = `${heading('Work record not found', 'This record is unavailable in the current visit.')}<a href="#tasks">Browse tasks</a> · <a href="#requests">Browse requests</a>`;
}
