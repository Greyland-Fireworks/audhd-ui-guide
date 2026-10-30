import { getSessionEvents, subscribeActivity } from './events.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

// Fixed historical fixtures make review state reproducible. This is not a live
// service feed: entries never change when the example's people are edited.
const sourceEntries = [
  { id: 'e12', at: '2026-10-20T14:12:00Z', level: 'error', code: 'export_failed', person: 'Sam' },
  { id: 'e11', at: '2026-10-20T14:11:00Z', level: 'warning', code: 'check_unavailable', person: 'Mira' },
  { id: 'e10', at: '2026-10-20T14:10:00Z', level: 'info', code: 'check_passed', person: 'Sam' },
  { id: 'e09', at: '2026-10-20T14:09:00Z', level: 'warning', code: 'reason_missing', person: 'Mira' },
  { id: 'e08', at: '2026-10-20T14:08:00Z', level: 'warning', code: 'confirmation_lost', person: 'Sam' },
  { id: 'e07', at: '2026-10-20T14:07:00Z', level: 'info', code: 'saved', person: 'Mira' },
  { id: 'e06', at: '2026-10-20T14:06:00Z', level: 'warning', code: 'check_unavailable', person: 'Sam' },
  { id: 'e05', at: '2026-10-20T14:05:00Z', level: 'info', code: 'check_passed', person: 'Mira' },
  { id: 'e04', at: '2026-10-20T14:04:00Z', level: 'warning', code: 'reason_missing', person: 'Sam' },
  { id: 'e03', at: '2026-10-20T14:03:00Z', level: 'warning', code: 'confirmation_lost', person: 'Mira' },
  { id: 'e02', at: '2026-10-20T14:02:00Z', level: 'info', code: 'saved', person: 'Sam' },
  { id: 'e01', at: '2026-10-20T14:01:00Z', level: 'unknown', raw: 'NOTICE extension=access-extra result=<unmapped> detail=17' },
];

// Translate only this fixture's documented event codes. Unknown source text
// stays available without inventing a cause, severity, or suggested repair.
const descriptions = {
  export_failed: person => [`${person}'s permission report could not be exported.`, 'The report was not created. Check the destination before trying another export.'],
  check_unavailable: person => [`The permission check for ${person} could not reach its service.`, 'The saved change is unchanged. Retry the check when the service is available; do not save again just to verify.'],
  reason_missing: person => [`A permission change for ${person} was not saved because its reason was blank.`, 'Enter the reason before saving.'],
  confirmation_lost: person => [`The reply to ${person}'s save request was lost.`, 'The save may have completed. Check that request’s outcome before submitting another change.'],
  check_passed: person => [`${person}'s saved permissions passed their check.`, 'No action was required at the recorded time. This historical event does not verify a newer change.'],
  saved: person => [`${person}'s permissions were saved.`, 'The saved change still needs a separate permission check.'],
};
const exampleEvents = sourceEntries.map(entry => {
  const explanation = descriptions[entry.code]?.(entry.person);
  return {
    ...entry,
    level: explanation ? entry.level : 'unknown',
    description: explanation?.[0] || 'An event was recorded in an unrecognized format.',
    action: explanation?.[1] || 'Its meaning and severity are not established. Inspect the original entry before deciding whether action is needed.',
    raw: entry.raw || JSON.stringify(entry),
  };
});
const needsReview = event => event.level === 'warning' || event.level === 'error';
// AUDHD-01 / GUIDE.md#readable-activity-and-warning-review: never mix fictional
// history with observations from this visit. Each source owns its review state.
const sourceState = () => ({ acknowledged: new Set(), expandedEntries: new Set(), pages: {warnings:1, all:1}, pageSize:5, snapshot:null });
const sources = { visit:sourceState(), example:sourceState() };
sources.example.snapshot = exampleEvents;
let source = 'visit';
let reviewHelpExpanded = false;
let active = null;
const stamp = new Intl.DateTimeFormat('en-US', {dateStyle:'medium', timeStyle:'medium', timeZone:'UTC'});
const sourceEvents = () => source === 'visit' ? getSessionEvents() : exampleEvents;

function updateArrivalNotice() {
  // AUDHD-05 / GUIDE.md#audhd-05-preserve-focus-and-spatial-stability: update
  // only the count and arrival notice. Never replace rows under the reader.
  if (!active?.section.isConnected) return;
  const state = sources[source];
  const current = sourceEvents();
  const loadedIds = new Set(state.snapshot.map(event => event.id));
  const arriving = current.filter(event => !loadedIds.has(event.id));
  const unacknowledged = level => current.filter(event => event.level === level && !state.acknowledged.has(event.id)).length;
  const countLabel = level => `${unacknowledged(level)} unacknowledged ${level}${unacknowledged(level) === 1 ? '' : 's'}`;
  const scope = source === 'visit' ? 'recorded this visit' : 'in Example history';
  const coverage = current.length === 1 ? '1 event' : `all ${current.length} events`;
  active.section.querySelector('#activity-count').textContent = `${countLabel('warning')} · ${countLabel('error')} across ${coverage} ${scope}.`;
  const button = active.section.querySelector('#activity-new');
  button.hidden = arriving.length === 0;
  button.textContent = `Show ${arriving.length} new ${arriving.length === 1 ? 'event' : 'events'}`;
  active.section.querySelector('#activity-arrivals').textContent = arriving.length
    ? `${arriving.length} new ${arriving.length === 1 ? 'event is' : 'events are'} included in the counts. The rows below have not moved.` : '';
}
subscribeActivity(updateArrivalNotice);

export function renderActivity(container, view = 'warnings') {
  const selected = view === 'all' ? 'all' : 'warnings';
  const state = sources[source];
  if (state.snapshot === null) state.snapshot = sourceEvents();
  const matching = selected === 'warnings' ? state.snapshot.filter(needsReview) : state.snapshot;
  const pageCount = Math.max(1, Math.ceil(matching.length / state.pageSize));
  state.pages[selected] = Math.min(state.pages[selected], pageCount);
  const offset = (state.pages[selected] - 1) * state.pageSize;
  const visible = matching.slice(offset, offset + state.pageSize);
  const rows = visible.map(event => {
    const reviewed = state.acknowledged.has(event.id);
    const title = event.level[0].toUpperCase() + event.level.slice(1);
    const detail = event.raw || JSON.stringify(event);
    const action = event.action || (needsReview(event) ? 'Review the original entry before deciding whether action is needed.' : '');
    return `<tr data-event-id="${event.id}" data-severity="${event.level}" data-acknowledged="${reviewed}" class="${needsReview(event) && !reviewed ? 'activity-unreviewed' : ''}" role="row">
      <td class="activity-description" role="cell"><p>${escape(event.description)}</p></td>
      <td class="activity-time" role="cell"><time datetime="${event.at}">${stamp.format(new Date(event.at))}</time></td>
      <td class="activity-level" role="cell"><span class="activity-severity">${title}</span>${reviewed ? '<span class="activity-acknowledged">Acknowledged</span>' : ''}</td>
      <td class="activity-attention" role="cell">${action ? `<p>${escape(action)}</p>` : ''}<div class="activity-actions">${event.href && event.actionLabel ? `<a class="task-link" href="${escape(event.href)}">${escape(event.actionLabel)}</a>` : ''}${needsReview(event) ? `<button type="button" id="ack-${event.id}" data-ack="${event.id}" aria-label="${reviewed ? 'Mark unreviewed' : 'Acknowledge'} ${title.toLowerCase()}: ${escape(event.description)}">${reviewed ? 'Mark unreviewed' : 'Acknowledge'}</button>` : ''}</div><details data-original="${event.id}" ${state.expandedEntries.has(event.id) ? 'open' : ''}><summary>Original entry</summary><pre>${escape(detail)}</pre></details></td>
    </tr>`;
  }).join('');
  container.innerHTML = `<section class="activity-review" aria-labelledby="activity-heading">
    <h1 id="activity-heading">${selected === 'warnings' ? 'Warnings' : 'All events'}</h1>
    <p id="activity-count" class="activity-count"></p>
    <p>${source === 'visit' ? 'Actions recorded in this open example; reload clears them.' : 'Fixed fictional history, unrelated to this visit.'} Acknowledgment means reviewed, not resolved.</p>
    <div class="activity-controls"><div><label for="activity-source">Activity source</label><select id="activity-source"><option value="visit" ${source === 'visit' ? 'selected' : ''}>This visit</option><option value="example" ${source === 'example' ? 'selected' : ''}>Example history</option></select></div><div class="activity-page-size"><label for="activity-page-size">Events per page</label><select id="activity-page-size">${[5,10,20].map(size => `<option value="${size}" ${state.pageSize === size ? 'selected' : ''}>${size}</option>`).join('')}</select></div>
      <details id="activity-help" ${reviewHelpExpanded ? 'open' : ''}><summary>ⓘ How review works</summary><ul><li>Warnings includes errors. All events also includes ordinary and unrecognized entries.</li><li>Acknowledgment is personal to this open example and resets on reload. It changes the count and emphasis, not the event, severity or resolution.</li><li>Counts cover every event in the selected source, including new events awaiting display. New rows appear only when you choose to show them.</li></ul></details></div>
    <div class="activity-arrival-bar"><button type="button" id="activity-new" hidden></button><p id="activity-arrivals" role="status"></p></div>
    <p id="activity-position">${matching.length ? `${offset + 1}–${offset + visible.length} of ${matching.length} loaded ${selected === 'warnings' ? 'warnings and errors' : 'events'}` : selected === 'warnings' ? 'No warnings or errors in the loaded events.' : 'No events loaded yet.'} · Newest first · Times in UTC</p>
    <table class="activity-table" role="table" aria-describedby="activity-position" ${matching.length ? '' : 'hidden'}><caption>${selected === 'warnings' ? 'Warning and error history' : 'Complete event history'}</caption>
      <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">What happened</th><th scope="col" role="columnheader">Time (UTC)</th><th scope="col" role="columnheader">Severity</th><th scope="col" role="columnheader">Attention</th></tr></thead>
      <tbody role="rowgroup">${rows}</tbody>
    </table>
    <div class="actions activity-pages" aria-label="Event pages" ${matching.length ? '' : 'hidden'}><button type="button" id="activity-previous" ${state.pages[selected] === 1 ? 'disabled' : ''}>Previous page</button><span>Page ${state.pages[selected]} of ${pageCount}</span><button type="button" id="activity-next" ${state.pages[selected] === pageCount ? 'disabled' : ''}>Next page</button></div>
    ${guideNote('activity-reading', 'Keep review state separate from event history', '<p>The log records what happened. Acknowledgment records what this viewer has reviewed; it cannot prove a fault was repaired. Counts cover the selected source, while the row snapshot stays stable until the user accepts new arrivals.</p>', ['AUDHD-04', 'AUDHD-05', 'AUDHD-10'])}
    <p id="activity-announcement" role="status"></p>
  </section>`;
  active = {section:container.querySelector('.activity-review')};
  updateArrivalNotice();
  restoreGuideNotes(container);
  const rerender = (focusId, message) => {
    // Read disclosure state before replacing DOM: native toggle notifications
    // may still be queued when a user immediately acknowledges an open entry.
    reviewHelpExpanded = container.querySelector('#activity-help').open;
    for (const details of container.querySelectorAll('[data-original]')) {
      if (details.open) state.expandedEntries.add(details.dataset.original); else state.expandedEntries.delete(details.dataset.original);
    }
    renderActivity(container, selected);
    // The action keeps its identity after acknowledgment; focus stays on the
    // same event. Page controls fall back to the table heading if unavailable.
    const target = container.querySelector(`#${focusId}`);
    if (target && !target.disabled) { if (focusId === 'activity-heading') target.tabIndex = -1; target.focus(); }
    else { const heading = container.querySelector('#activity-heading'); heading.tabIndex = -1; heading.focus(); }
    requestAnimationFrame(() => {
      const status = container.querySelector('#activity-announcement');
      if (status) status.textContent = message;
    });
  };
  // Acknowledgment updates the row, not the user's chosen reading detail.
  container.querySelector('#activity-help').addEventListener('toggle', event => { if (event.target.isConnected) reviewHelpExpanded = event.target.open; });
  container.querySelectorAll('[data-original]').forEach(details => details.addEventListener('toggle', () => {
    if (!details.isConnected) return;
    if (details.open) state.expandedEntries.add(details.dataset.original); else state.expandedEntries.delete(details.dataset.original);
  }));
  container.querySelectorAll('[data-ack]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.ack;
    const wasAcknowledged = state.acknowledged.has(id);
    if (wasAcknowledged) state.acknowledged.delete(id); else state.acknowledged.add(id);
    rerender(button.id, wasAcknowledged ? 'Marked unreviewed. Event and severity retained.' : 'Acknowledged for this session. Event and severity retained; resolution is unchanged.');
  }));
  container.querySelector('#activity-page-size').addEventListener('change', event => {
    // Keep the previously first event on the new page; retain each
    // view's place independently when switching between warning/all history.
    const previousSize = state.pageSize;
    state.pageSize = Number(event.target.value);
    for (const key of Object.keys(state.pages)) state.pages[key] = Math.floor((state.pages[key] - 1) * previousSize / state.pageSize) + 1;
    rerender('activity-page-size', `${state.pageSize} events per page.`);
  });
  container.querySelector('#activity-source').addEventListener('change', event => {
    source = event.target.value;
    rerender('activity-source', `${source === 'visit' ? 'This visit' : 'Example history'} selected.`);
  });
  container.querySelector('#activity-new').addEventListener('click', () => {
    state.snapshot = sourceEvents();
    state.pages[selected] = 1;
    rerender('activity-heading', 'New events loaded. Showing the newest matching events.');
  });
  for (const [id, delta] of [['activity-previous', -1], ['activity-next', 1]]) {
    container.querySelector(`#${id}`).addEventListener('click', () => {
      state.pages[selected] += delta;
      rerender(id, `Page ${state.pages[selected]} of ${pageCount}.`);
    });
  }
}
