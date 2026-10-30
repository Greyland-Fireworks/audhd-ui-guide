import { recordEvent } from './events.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const accepted = new Map();
let draftName = 'Weekly notes';
let scenario = 'normal';
let operation = null;
let writes = 0;
let statusCallback = () => {};

// AUDHD-06 / GUIDE.md#audhd-06-make-saving-and-recovery-understandable:
// this fictional service, rather than the view, owns acceptance and ID deduplication.
// A real adapter may retry an ID only when the supported service contract allows it.
async function submitToService(request, failure) {
  await new Promise(resolve => setTimeout(resolve, 350));
  if (failure === 'reject') return { rejected: true };
  if (failure === 'lost-before') throw new Error('Response unavailable');
  if (!accepted.has(request.id)) {
    const record = Object.freeze({ ...request, number: ++writes, version: 1 });
    accepted.set(request.id, record);
    recordEvent({ description: `The simulated service accepted the export request “${request.name}”. No file was produced.`, subject: request.name, operationId: request.id, version: record.version });
  }
  if (failure === 'lost-after') throw new Error('Response unavailable');
  return accepted.get(request.id);
}

export function recoverySummary() {
  if (!operation) return null;
  const labels = { pending: 'Export request pending', unknown: 'Export outcome unknown', rejected: 'Export request not accepted', accepted: 'Export accepted; confirmation pending', confirmed: 'Export request confirmed' };
  // A pending request or routine confirmation is unfinished work, not a fault.
  // Keep an observed confirmation failure until a successful check resolves it.
  const hasProblem = ['unknown', 'rejected'].includes(operation.state) || Boolean(operation.confirmationFailed);
  const label = operation.confirmationFailed ? 'Export accepted; confirmation unavailable' : labels[operation.state];
  return { text: `${operation.snapshot.name}: ${label}`, needsAttention: operation.state !== 'confirmed', hasProblem, href: '#recovery' };
}

function report(level, description, action) {
  recordEvent({ level, description, action, subject: operation.snapshot.name, operationId: operation.id, href: '#recovery', actionLabel: 'Inspect export outcome' });
}

function refresh() {
  // AUDHD-05, 06 / GUIDE.md#audhd-05-preserve-focus-and-spatial-stability:
  // late replies update their owner without replacing another task or a newer draft.
  // Stable focus IDs and disclosure state also survive this screen's own refresh.
  if (['#recovery', '#exports'].includes((location.hash || '#overview').split('/')[0])) {
    const active = document.activeElement;
    const focusId = active?.closest('#main') ? active.id : null;
    const selection = focusId === 'export-name' ? [active.selectionStart, active.selectionEnd] : null;
    renderRecovery(document.querySelector('#main'), statusCallback);
    const next = focusId && document.getElementById(focusId);
    if (next && !next.disabled) { next.focus(); if (selection) next.setSelectionRange(...selection); }
    else if (focusId) document.getElementById('operation-message')?.focus();
  }
  statusCallback();
}

async function send(request) {
  request.state = 'pending'; request.message = 'Waiting for the simulated service to accept this request.';
  const failure = scenario;
  report('info', `Submitted the export request “${request.snapshot.name}”.`);
  refresh();
  try {
    const result = await submitToService({ id: request.id, name: request.snapshot.name }, failure);
    request.state = result.rejected ? 'rejected' : 'accepted';
    request.message = result.rejected ? 'The service rejected this request before accepting it. Nothing was created. Restore the simulated service, then retry this request or start a new one.' : 'The service accepted this request. Confirm that its saved name matches what you submitted.';
    if (result.rejected) report('warning', `The export request “${request.snapshot.name}” was rejected before acceptance.`, 'Restore the simulated service, then retry or start a new request.');
  } catch {
    request.state = 'unknown';
    request.message = 'No response reached this screen. The request may already be accepted. Check its outcome before submitting again.';
    report('warning', `The response for the export request “${request.snapshot.name}” was lost. Acceptance is unknown to this screen.`, 'Check whether this request was accepted.');
  }
  refresh();
}

export function renderRecovery(container, onChange = () => {}) {
  statusCallback = onChange;
  const state = operation?.state;
  const blocked = operation !== null;
  const stateLabels = { pending: 'Waiting for acceptance', unknown: 'Outcome unknown', rejected: 'Not accepted', accepted: 'Accepted · confirmation needed', confirmed: 'Accepted request confirmed' };
  // AUDHD-02/07/09: identify the content and actual result before submission.
  // A request-confirmation exercise must not imply a file format, download or
  // external delivery that this in-memory service does not implement.
  container.innerHTML = `<h1 class="task-heading">Request a notes export</h1>
    <p>Practice requesting a copy of your team’s shared notes.</p>
    <form id="export-form" class="ui-panel">
      <p class="simulation-boundary">This demo confirms a request only. It creates no file, chooses no file format and sends nothing to your computer or another website.</p>
      ${blocked ? '<h2>Next request draft</h2>' : ''}
      <label for="export-name">Request name<input id="export-name" required value="${escape(draftName)}" aria-describedby="export-help"></label>
      <p id="export-help">Example: Weekly notes. This identifies the request; it is not a filename.${blocked ? ' Editing this draft does not change the submitted request below.' : ''}</p>
      <button id="send-export" class="ui-action" ${blocked ? 'disabled' : ''}>Submit demo request</button>
      ${blocked ? `<p>${state === 'confirmed' ? 'The request below is confirmed. Choose “Start a new request from my draft” to request another export.' : state === 'rejected' ? 'Retry the submitted request, or choose “Start a new request from my draft” below.' : 'Finish checking the submitted request before starting another. This draft is kept separately.'}</p>` : ''}
    </form>
    ${operation ? `<section class="ui-panel" aria-labelledby="submitted-heading"><h2 id="submitted-heading">Submitted request</h2>
      <p><strong>${escape(operation.snapshot.name)}</strong> · <span id="operation-state" data-state="${state}">${stateLabels[state]}</span></p>
      <p id="operation-message" role="status" tabindex="-1">${escape(operation.message)}</p>
      <div class="actions">
        ${state === 'unknown' ? '<button id="reconcile">Check whether this request was accepted</button>' : ''}
        ${state === 'rejected' ? '<button id="retry-export">Retry the same submitted request</button>' : ''}
        ${state === 'accepted' ? '<button id="verify-export">Confirm accepted request</button>' : ''}
        ${['rejected', 'confirmed'].includes(state) ? '<button id="new-export">Start a new request from my draft</button>' : ''}
      </div>
      ${scenario !== 'normal' && state !== 'pending' ? '<p>The simulated service has a failure condition selected.</p><button id="restore-service">Restore simulated service</button>' : ''}
      ${guideNote('request-identity', 'How recovery keeps this request', `<p id="request-id">${operation.id}</p><p>Checks and safe retries retain this identity and the submitted name. Editing the next draft never changes that snapshot. Confirmation reads the accepted record; it does not submit a second request or prove a file exists.</p>`, ['AUDHD-06', 'AUDHD-07'])}
    </section>` : ''}
    ${guideNote('failure-controls', 'Try recovery paths', `<label for="export-scenario">Next request or confirmation<select id="export-scenario">
      <option value="normal">Response and confirmation available</option>
      <option value="lost-after">Service accepts, but response is lost</option>
      <option value="lost-before">Connection fails before acceptance</option>
      <option value="reject">Service rejects before acceptance</option>
      <option value="verify-fail">Request accepted; confirmation unavailable</option>
    </select></label><p id="export-writes">Accepted request records: ${writes}</p><p>The count increases only when the simulated service accepts a new request ID. Outcome checks and confirmation cannot increase it. The current failure condition is captured when submission starts.</p><p>Acceptance lookup reads the existing request by ID. A real service without lookup or duplicate protection needs a different recovery path, not a blind retry.</p>`, ['AUDHD-06', 'AUDHD-07', 'AUDHD-12'])}`;
  const get = id => container.querySelector(`#${id}`);
  restoreGuideNotes(container);
  get('export-scenario').value = scenario;
  get('export-scenario').onchange = event => { scenario = event.target.value; };
  get('export-name').oninput = event => { draftName = event.target.value; };
  get('export-form').onsubmit = event => {
    event.preventDefault();
    if (operation || !draftName.trim()) return;
    // AUDHD-06 / GUIDE.md#audhd-06-make-saving-and-recovery-understandable:
    // retain identity and an immutable snapshot before transport starts. Neither
    // a missing reply nor a later edit is permission to replace the submitted request.
    operation = { id: crypto.randomUUID(), snapshot: Object.freeze({ name: draftName.trim() }), state: 'pending', message: '' };
    void send(operation);
  };
  if (get('restore-service')) get('restore-service').onclick = () => {
    scenario = 'normal';
    operation.message += ' Service responses are available again; continue with the recovery action.';
    report('info', 'Simulated service responses restored. The submitted request is unchanged.');
    refresh(); (get('reconcile') || get('retry-export') || get('verify-export') || get('new-export'))?.focus();
  };
  if (get('reconcile')) get('reconcile').onclick = () => {
    const result = accepted.get(operation.id);
    operation.state = result ? 'accepted' : 'rejected';
    operation.message = result ? 'This request was accepted. You can confirm the existing record; no second request was created.' : 'This request was not accepted. Retry the same submitted name and ID, or start a different request from your draft.';
    report('info', `Outcome check for “${operation.snapshot.name}”: ${result ? 'accepted record found' : 'request was not accepted'}. No request was submitted.`);
    refresh(); (get('verify-export') || get('retry-export'))?.focus();
  };
  if (get('retry-export')) get('retry-export').onclick = () => { void send(operation); };
  if (get('verify-export')) get('verify-export').onclick = () => {
    // AUDHD-07 / GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status:
    // confirmation compares the accepted record to its snapshot. It cannot mutate
    // that record, clear a newer draft, or claim that an export file was generated.
    const result = accepted.get(operation.id);
    if (scenario === 'verify-fail') {
      operation.confirmationFailed = true;
      operation.message = 'The request remains accepted. Confirmation is unavailable. Restore the simulated service, then retry confirmation; do not submit again.';
      report('warning', `Confirmation for “${operation.snapshot.name}” was unavailable. The request remains accepted.`, 'Restore the simulated service, then retry confirmation.');
    } else if (result?.name === operation.snapshot.name) {
      operation.confirmationFailed = false;
      operation.state = 'confirmed';
      operation.message = `Confirmed: the accepted request is named “${operation.snapshot.name}”, matching what you submitted. No file was produced.`;
      report('info', `Confirmed the accepted request “${operation.snapshot.name}” matches the submitted name. No file was produced.`);
    }
    refresh(); (get('verify-export') || get('new-export'))?.focus();
  };
  if (get('new-export')) get('new-export').onclick = () => { operation = null; refresh(); get('export-name').focus(); };
}
