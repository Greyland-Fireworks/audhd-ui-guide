import { notes } from './notes-state.js';
import { getCalendarEvents } from './schedule-state.js';
import { recordEvent } from './events.js';
import { registerScenarioOwner } from './scenario-state.js';

export const owners = ['Mira', 'Sam'];
export const taskStatuses = { open: 'Not started', doing: 'In progress', blocked: 'Blocked', done: 'Complete' };
const now = () => new Date().toISOString();
const copy = value => structuredClone(value);
const id = prefix => `${prefix}-${crypto.randomUUID()}`;
const taskFields = ['title', 'owner', 'dueDate', 'status', 'blockedReason', 'dependencies', 'meetingId', 'noteId', 'requestId'];
const requestFields = ['title', 'requester', 'type', 'item', 'quantity', 'location', 'change', 'reason'];
const pick = (value, fields) => Object.fromEntries(fields.map(key => [key, copy(value[key])]));
const emptyTask = () => ({ title: '', owner: 'Mira', dueDate: '', status: 'open', blockedReason: '', dependencies: [], meetingId: '', noteId: '', requestId: '' });
const emptyRequest = () => ({ title: '', requester: 'Mira', type: 'equipment', item: '', quantity: 1, location: '', change: '', reason: '' });
const dueIn = days => { const date = new Date(); date.setDate(date.getDate() + days); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
const tasks = [
  { id: 'harbor-task-agenda', ...emptyTask(), title: 'Prepare the weekly agenda', owner: 'Sam', dueDate: dueIn(3), noteId: 'harbor-weekly-review', version: 1 },
  { id: 'harbor-task-review', ...emptyTask(), title: 'Review the weekly agenda', dueDate: dueIn(4), dependencies: ['harbor-task-agenda'], version: 1 },
  { id: 'harbor-task-room', ...emptyTask(), title: 'Check the meeting room display', owner: 'Sam', dueDate: dueIn(5), status: 'blocked', blockedReason: 'Waiting for the replacement cable.', requestId: 'harbor-request-cable', version: 1 },
  { id: 'harbor-task-research', ...emptyTask(), title: 'Summarize the research questions', dueDate: dueIn(2), status: 'doing', noteId: 'harbor-research-checkin', meetingId: 'research-conversation', version: 1 },
  { id: 'harbor-task-template', ...emptyTask(), title: 'Prepare a short meeting template', owner: 'Sam', dueDate: dueIn(-1), status: 'done', noteId: 'harbor-meeting-template', version: 1 },
];
const requests = [{ id: 'harbor-request-cable', fields: { ...emptyRequest(), title: 'Replace the meeting room cable', requester: 'Sam', item: 'HDMI cable', quantity: 1, reason: 'The meeting room display loses its connection.' }, savedVersion: 1, status: 'draft', submitted: null, review: null, submissions: [], decisions: [] }];
// Fictional starting records demonstrate the different stages without writing
// invented actions into This visit's activity log. Each submitted snapshot has
// the same ownership boundary as a real local Submit operation below.
// AUDHD-07: ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status.
for (const [key, fields, status, reason] of [
  ['harbor-request-whiteboard', { ...emptyRequest(), title: 'Improve whiteboard visibility', type: 'workspace', location: 'Harbor meeting room', change: 'Move the whiteboard where everyone at the table can see it.', reason: 'People at the far end cannot read the current board.' }, 'pending', ''],
  ['harbor-request-adapter', { ...emptyRequest(), title: 'Add spare display adapters', item: 'USB-C display adapter', quantity: 2, reason: 'Keep two adapters with the shared meeting kit.' }, 'approved', ''],
  ['harbor-request-chair', { ...emptyRequest(), title: 'Replace the unstable desk chair', requester: 'Sam', item: 'Desk chair', reason: 'The current chair wobbles.' }, 'returned', 'Specify which desk and whether the chair can be repaired.'],
]) {
  const at = new Date(Date.now() - 3_600_000).toISOString();
  const submitted = Object.freeze({ version: 1, savedVersion: 1, fields: Object.freeze(copy(fields)), at });
  const review = status === 'pending' ? null : Object.freeze({ submissionVersion: 1, decision: status, reason, at });
  requests.push({ id: key, fields, savedVersion: 1, status, submitted, review, submissions: [submitted], decisions: review ? [review] : [] });
}

// AUDHD-06/10: drafts belong to the visit, not a mounted form. Browser routing,
// filters and appearance changes never become accidental Save operations.
// See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
export const taskDrafts = new Map();
export const requestDrafts = new Map();
export const taskErrors = new Map();
export const requestErrors = new Map();
const startingTasks = copy(tasks), startingRequests = copy(requests);
// AUDHD-07/10/13: confirmed fixture replacement resets owning records and drafts
// together. Busy data is deterministic, with explicit IDs linking prerequisites;
// titles are never used to infer dependencies. Seeding creates no session events.
// See ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status.
export function resetWorkState(kind = 'normal') {
  taskDrafts.clear(); requestDrafts.clear(); taskErrors.clear(); requestErrors.clear();
  tasks.splice(0); requests.splice(0); owners.splice(0, owners.length, 'Mira', 'Sam');
  if (kind === 'normal') { tasks.push(...copy(startingTasks)); requests.push(...copy(startingRequests)); }
  if (kind !== 'busy') return;
  owners.push('Alex', 'Jordan', 'Taylor', 'Casey', 'Robin', 'Morgan', 'Avery', 'Drew', 'Lee', 'Quinn');
  const stages = ['draft','pending','approved','returned'];
  for (let i=0;i<12;i++) {
    const fields = { ...emptyRequest(), title: `Meeting equipment request ${i+1}${i===3?' — confirm accessible placement and compatibility before the workshop':''}`, requester: owners[i], item: 'Display adapter', quantity: 1, reason: 'Support the team workshop.' };
    const status = stages[i%4], at = '2026-10-20T14:00:00.000Z';
    const submitted = status === 'draft' ? null : Object.freeze({version:1,savedVersion:1,fields:Object.freeze(copy(fields)),at});
    const review = ['approved','returned'].includes(status) ? Object.freeze({submissionVersion:1,decision:status,reason:status==='returned'?'Specify the device connector before resubmitting.':'',at}) : null;
    requests.push({id:`busy-request-${i+1}`,fields,savedVersion:1,status,submitted,review,submissions:submitted?[submitted]:[],decisions:review?[review]:[]});
  }
  const events = getCalendarEvents(), states = ['blocked','open','doing','done'];
  // Seed only links that the task editor can retain. A crowded fixture should
  // exercise navigation and dependencies, not fail a routine save because its
  // starting note link already violates the editor's Trash restriction.
  const linkedNotes = notes.filter(note => note.status !== 'trash');
  for (let i=0;i<24;i++) tasks.push({id:`busy-task-${i+1}`,...emptyTask(),title:`Workshop follow-up ${i+1}${i===0?' — prepare the accessible presentation setup for remote and in-room participants':''}`,owner:owners[i%owners.length],dueDate:dueIn(i%7),status:states[i%4],blockedReason:i%4===0?'Waiting for the linked equipment request.':'',dependencies:i%4===1?[`busy-task-${i}`]:[],requestId:i%4===0?`busy-request-${i%12+1}`:'',noteId:linkedNotes[i%Math.max(1,linkedNotes.length)]?.id || '',meetingId:events[i%Math.max(1,events.length)]?.id || '',version:1});
}
registerScenarioOwner('work-records', {reset:resetWorkState});
export const getTasks = () => copy(tasks);
export const getRequests = () => copy(requests);
export const getTask = key => copy(tasks.find(task => task.id === key) || null);
export const getRequest = key => copy(requests.find(request => request.id === key) || null);
export function taskDraft(key = 'new') {
  if (!taskDrafts.has(key)) taskDrafts.set(key, key === 'new' ? emptyTask() : pick(tasks.find(task => task.id === key), taskFields));
  return taskDrafts.get(key);
}
export function requestDraft(key = 'new') {
  if (!requestDrafts.has(key)) requestDrafts.set(key, key === 'new' ? emptyRequest() : copy(requests.find(request => request.id === key).fields));
  return requestDrafts.get(key);
}
export const taskDirty = key => taskDrafts.has(key) && JSON.stringify(taskDrafts.get(key)) !== JSON.stringify(key === 'new' ? emptyTask() : pick(tasks.find(task => task.id === key), taskFields));
export const requestDirty = key => requestDrafts.has(key) && JSON.stringify(requestDrafts.get(key)) !== JSON.stringify(key === 'new' ? emptyRequest() : requests.find(request => request.id === key).fields);
const textValid = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const fail = errors => ({ ok: false, errors });

function validateTask(value, key) {
  const errors = {};
  if (!textValid(value.title, 160)) errors.title = 'Enter a task title from 1 to 160 characters.';
  if (!owners.includes(value.owner)) errors.owner = 'Choose the person responsible for this task.';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value.dueDate) && new Date(`${value.dueDate}T12:00:00Z`);
  if (!date || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value.dueDate) errors.dueDate = 'Choose a real due date. Past dates are allowed for existing overdue work.';
  if (!Object.hasOwn(taskStatuses, value.status)) errors.status = 'Choose a task status.';
  if (value.status === 'blocked' && !textValid(value.blockedReason, 1000)) errors.blockedReason = 'Explain what must happen before work can continue, up to 1,000 characters.';
  if (!Array.isArray(value.dependencies) || value.dependencies.some(dependency => dependency === key || !tasks.some(task => task.id === dependency))) errors.dependencies = 'Choose other existing tasks as dependencies.';
  else {
    // AUDHD-04: a prerequisite is an actual constraint, not merely a related
    // link. Walk the saved graph with the proposed edges to reject any cycle.
    // See ../../GUIDE.md#audhd-04-explain-effective-behavior.
    const visit = (node, trail = new Set()) => {
      if (trail.has(node)) return true;
      const next = new Set([...trail, node]);
      return (node === key ? value.dependencies : tasks.find(task => task.id === node)?.dependencies || []).some(child => visit(child, next));
    };
    if (visit(key)) errors.dependencies = 'These dependencies create a loop. Remove a task that already depends on this one.';
    else if (value.status === 'done' && value.dependencies.some(dependency => tasks.find(task => task.id === dependency).status !== 'done')) errors.dependencies = 'Complete the prerequisite tasks before completing this task, or remove an incorrect dependency.';
  }
  if (value.meetingId && !getCalendarEvents().some(event => event.id === value.meetingId)) errors.meetingId = 'Choose an existing meeting or leave the link empty.';
  if (value.noteId && !notes.some(note => note.id === value.noteId && note.status !== 'trash')) errors.noteId = 'Choose a note outside Trash or leave the link empty.';
  if (value.requestId && !requests.some(request => request.id === value.requestId)) errors.requestId = 'Choose an existing request or leave the link empty.';
  return errors;
}

export function saveTask(key = 'new') {
  const draft = taskDraft(key), errors = validateTask(draft, key);
  if (Object.keys(errors).length) { taskErrors.set(key, errors); return fail(errors); }
  const fields = pick(draft, taskFields);
  fields.title = fields.title.trim(); fields.dependencies = [...new Set(fields.dependencies)];
  fields.blockedReason = fields.status === 'blocked' ? fields.blockedReason.trim() : '';
  let task = tasks.find(item => item.id === key);
  if (!task) { task = { id: id('task'), ...fields, version: 1 }; tasks.push(task); }
  else if (JSON.stringify(pick(task, taskFields)) !== JSON.stringify(fields)) Object.assign(task, fields, { version: task.version + 1 });
  taskDrafts.delete(key); taskErrors.delete(key);
  recordEvent({ description: `Saved task “${task.title}”: ${taskStatuses[task.status].toLowerCase()}.`, subject: task.id, version: task.version, href: `#task/${task.id}`, actionLabel: 'Review task progress' });
  return { ok: true, task: copy(task) };
}
export function discardTask(key) { taskDrafts.delete(key); taskErrors.delete(key); }
export function discardRequest(key) { requestDrafts.delete(key); requestErrors.delete(key); }

function validateRequest(value) {
  const errors = {};
  if (!textValid(value.title, 160)) errors.title = 'Give the request a specific title, up to 160 characters.';
  if (!owners.includes(value.requester)) errors.requester = 'Choose the person requesting this change.';
  if (!['equipment', 'workspace'].includes(value.type)) errors.type = 'Choose Equipment or Workspace change.';
  if (value.type === 'equipment') {
    if (!textValid(value.item, 160)) errors.item = 'Name the equipment. Example: HDMI cable.';
    if (!Number.isInteger(Number(value.quantity)) || Number(value.quantity) < 1 || Number(value.quantity) > 20) errors.quantity = 'Enter a whole number from 1 to 20 items.';
  } else if (value.type === 'workspace') {
    if (!textValid(value.location, 160)) errors.location = 'Name the affected place. Example: Harbor meeting room.';
    if (!textValid(value.change, 1000)) errors.change = 'Describe the requested change, up to 1,000 characters.';
  }
  if (!textValid(value.reason, 2000)) errors.reason = 'Explain why this is needed, up to 2,000 characters.';
  return errors;
}
export function saveRequest(key = 'new') {
  const draft = requestDraft(key), errors = validateRequest(draft);
  if (Object.keys(errors).length) { requestErrors.set(key, errors); return fail(errors); }
  const fields = pick(draft, requestFields);
  for (const field of requestFields.filter(field => field !== 'quantity')) fields[field] = fields[field].trim();
  fields.quantity = Number(fields.quantity);
  if (fields.type === 'equipment') { fields.location = ''; fields.change = ''; } else { fields.item = ''; fields.quantity = 1; }
  let request = requests.find(item => item.id === key);
  if (!request) { request = { id: id('request'), fields, savedVersion: 1, status: 'draft', submitted: null, review: null, submissions: [], decisions: [] }; requests.push(request); }
  else if (JSON.stringify(request.fields) !== JSON.stringify(fields)) { request.fields = fields; request.savedVersion++; }
  requestDrafts.delete(key); requestErrors.delete(key);
  recordEvent({ description: `Saved draft version ${request.savedVersion} of “${fields.title}”. Submission status is unchanged.`, subject: request.id, version: request.savedVersion, href: `#request/${request.id}/draft`, actionLabel: 'Review saved request draft' });
  return { ok: true, request: copy(request) };
}
export function submitRequest(key) {
  const request = requests.find(item => item.id === key);
  if (!request) return fail({ title: 'Save the request draft first.' });
  if (requestDirty(key)) return fail({ title: 'Save or discard the current edits before submitting.' });
  if (request.status === 'pending') return fail({ review: 'The submitted version is still awaiting a decision.' });
  if (request.submitted?.savedVersion === request.savedVersion) return fail({ title: 'Save a correction or change before submitting another version.' });
  // AUDHD-07/13: the approval target is an immutable submission. Subsequent
  // saved drafts cannot change what a reviewer is deciding or imply approval.
  // See ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status.
  const submission = Object.freeze({ version: request.submissions.length + 1, savedVersion: request.savedVersion, fields: Object.freeze(copy(request.fields)), at: now() });
  request.submitted = submission; request.submissions.push(submission); request.status = 'pending'; request.review = null;
  recordEvent({ description: `Submitted “${submission.fields.title}”, submission ${submission.version}, for local review.`, subject: key, version: submission.version, action: 'This submission is awaiting a local review decision.', href: `#request/${key}`, actionLabel: 'Review request status' });
  return { ok: true, request: copy(request) };
}
export function reviewRequest(key, submissionVersion, decision, reason = '') {
  const request = requests.find(item => item.id === key);
  if (!request || request.status !== 'pending' || request.submitted.version !== submissionVersion) return fail({ review: 'This submission is no longer awaiting this decision. Review its current state.' });
  if (!['approved', 'returned'].includes(decision)) return fail({ review: 'Choose Approve or Return for correction.' });
  if (decision === 'returned' && !textValid(reason, 1000)) return fail({ review: 'Explain the correction needed, up to 1,000 characters.' });
  request.review = Object.freeze({ submissionVersion, decision, reason: reason.trim(), at: now() }); request.status = decision;
  // AUDHD-06/07: keep each decision with the version it reviewed. Submitting a
  // correction clears only the current decision, not why an older one returned.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  request.decisions.push(request.review);
  // AUDHD-04/07: request approval is not equipment delivery or task completion.
  // Related tasks keep their saved blocked/progress state until someone updates
  // the task after doing the work; no hidden cross-record mutation occurs here.
  // See ../../GUIDE.md#audhd-04-explain-effective-behavior.
  recordEvent({ level: decision === 'returned' ? 'warning' : 'info', description: `${decision === 'approved' ? 'Approved' : 'Returned for correction'} “${request.submitted.fields.title}”, submission ${submissionVersion}.`, subject: key, version: submissionVersion,
    action: decision === 'returned' ? `Correction requested: ${request.review.reason}` : 'Approval applies to this submission only; equipment delivery and linked tasks are unchanged.',
    href: `#request/${key}${decision === 'returned' ? '/draft' : ''}`, actionLabel: decision === 'returned' ? 'Review the requested correction' : 'Review request status' });
  return { ok: true, request: copy(request) };
}
