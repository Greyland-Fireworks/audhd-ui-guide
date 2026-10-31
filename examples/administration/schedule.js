import { notes } from './notes-state.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';
import { dataMode, scenarioEpoch, registerScenarioOwner } from './scenario-state.js';
import { rooms, equipmentNames, localZone, localDate, addDays, getCalendarEvents, getMeeting, getMeetingDraft, meetingDrafts, meetingErrors, isMeetingDirty, discardMeetingDraft, saveMeeting, cancelMeeting, restoreMeeting, roomConflicts, validateMeeting, prepareNewMeeting, simulateRoomTaken, calendarHours, calendarRange, layoutDayEvents, findAlternatives } from './schedule-state.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const roomName = id => rooms.find(room => room.id === id)?.name || 'Room unavailable';
const dayName = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not selected';
const timeRange = item => `${item.startTime}–${item.endTime}`;
const period = item => `${dayName(item.date)}, ${timeRange(item)}`;
const heading = (title, description) => `<header class="task-heading"><h1>${escape(title)}</h1><p>${description}</p></header>`;
// AUDHD-05/10: changing view, Appearance or route does not reconstruct filters,
// entered dates, an unfinished booking, or a failed-save result from defaults.
// See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
const browse = { date: localDate(), cancelled: false };
let calendarCleanup = () => {};
const availability = { date: localDate(), startTime: '09:00', endTime: '10:00', attendees: '2', requiredEquipment: [] };
const roomSearch = { result: null, loading: false, error: '', errors: {}, sequence: 0 };
let refreshRoomSearch = null;
let selectedRoom = null;
const messages = new Map();
const failures = new Map();
const restoreFailures = new Map();
let pendingNew = null;
const targets = ['title', 'description', 'date', 'startTime', 'endTime', 'roomId', 'attendees', 'requiredEquipment', 'noteId'];
export function resetScheduleView() {
  Object.assign(browse, { date: localDate(), cancelled: false });
  Object.assign(availability, { date: localDate(), startTime: '09:00', endTime: '10:00', attendees: '2', requiredEquipment: [] });
  Object.assign(roomSearch, { result: null, loading: false, error: '', errors: {}, sequence: roomSearch.sequence + 1 });
  selectedRoom = null; pendingNew = null; messages.clear(); failures.clear(); restoreFailures.clear();
}
registerScenarioOwner('schedule-view', { reset: resetScheduleView });
const copyRequirements = value => ({ date: value.date, startTime: value.startTime, endTime: value.endTime, attendees: value.attendees, requiredEquipment: [...value.requiredEquipment] });
const sameRequirements = (a, b) => JSON.stringify(copyRequirements(a)) === JSON.stringify(copyRequirements(b));
const requirementErrors = value => validateMeeting({ ...value, title: 'Room search', description: '', roomId: 'workshop', noteId: '' });
// AUDHD-05/07: a completed response owns its criteria and reservation snapshot.
// Edits never rewrite that evidence. A later request/reset supersedes this ticket;
// late replies cannot replace newer results, and navigating away changes no draft.
// This delay/failure is a local service simulation, not a real reservation lock.
// See ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status.
async function searchRooms() {
  const sequence = ++roomSearch.sequence, epoch = scenarioEpoch();
  roomSearch.errors = requirementErrors(availability); roomSearch.error = '';
  if (Object.keys(roomSearch.errors).length) { roomSearch.loading = false; refreshRoomSearch?.(); return false; }
  const criteria = copyRequirements(availability), mode = dataMode('rooms');
  roomSearch.loading = true; refreshRoomSearch?.();
  await new Promise(resolve => setTimeout(resolve, mode === 'loading' ? 1000 : 180));
  if (sequence !== roomSearch.sequence || epoch !== scenarioEpoch()) return false;
  roomSearch.loading = false;
  if (mode === 'failure') roomSearch.error = 'Room availability could not be checked. Your requirements and any earlier results are retained. Try again.';
  else roomSearch.result = { criteria, events: getCalendarEvents(), checkedAt: Date.now() };
  refreshRoomSearch?.(); return mode !== 'failure';
}

export function scheduleDestinations() {
  return [
    { path: 'calendar', label: 'Calendar & rooms', group: 'Calendar', alias: 'calendar/week' },
    { path: 'calendar/week', label: 'Week calendar', parent: 'calendar', group: 'Calendar' },
    { path: 'calendar/month', label: 'Month calendar', parent: 'calendar', group: 'Calendar' },
    { path: 'calendar/agenda', label: 'Meeting agenda', parent: 'calendar', group: 'Calendar' },
    { path: 'calendar/rooms', label: 'Room availability', parent: 'calendar', group: 'Calendar' },
    { path: 'calendar/new', label: 'New meeting', parent: 'calendar', group: 'Calendar', targets },
    ...getCalendarEvents().map(item => ({ path: `meeting/${item.id}`, label: item.title, parent: 'calendar/week', group: 'Calendar', record: true, targets })),
  ];
}
export function scheduleSummary() {
  return [...meetingDrafts.keys()].filter(id => isMeetingDirty(id) || meetingErrors.has(id)).map(id => {
    const item = getMeeting(id), field = Object.keys(meetingErrors.get(id) || {})[0] || 'title';
    return { href: `#${id === 'new' ? 'calendar/new' : `meeting/${id}`}/${field}`, label: item?.title || 'New meeting', text: meetingErrors.has(id) ? 'Correct the unsaved reservation' : 'Resume unsaved changes', hasProblem: meetingErrors.has(id) };
  });
}
function calendarViewChoice(selected) {
  // AUDHD-02/08: these change the representation of the same meeting records.
  // Room lookup remains a separate sidebar task; creating a meeting is an action.
  // See ../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings.
  return `<div class="calendar-view-actions"><nav class="schedule-nav" aria-label="Calendar view">${[['calendar/week', 'Week'], ['calendar/month', 'Month'], ['calendar/agenda', 'Agenda']].map(([path, label]) => `<a href="#${path}" ${selected === path ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><a id="calendar-new" class="task-link ui-action" href="#calendar/new">New meeting</a></div>`;
}
function roomDescription(room) { return `${room.capacity} people · ${room.equipment.map(key => equipmentNames[key]).join(', ')}`; }
function eventRow(item) {
  return `<li class="schedule-event"><div><a href="#meeting/${item.id}">${escape(item.title)}</a>${item.status === 'cancelled' ? '<strong class="schedule-state">Cancelled · room released</strong>' : ''}</div><p><time datetime="${item.date}T${item.startTime}">${escape(period(item))}</time> · ${escape(roomName(item.roomId))} · ${item.attendees} people</p>${isMeetingDirty(item.id) ? '<p>Unsaved changes</p>' : ''}</li>`;
}
const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const span = calendarHours.end - calendarHours.start;
const hours = Array.from({ length: 11 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`);
const timePosition = time => (minutes(time) - calendarHours.start) / span * 100;
const dayMeetings = (date, items = getCalendarEvents()) => items.filter(item => item.date === date && item.status === 'scheduled');
const minuteLabel = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
const hourAxis = (range = calendarHours) => {
  const ticks = [range.start, ...Array.from({ length: 25 }, (_, index) => index * 60).filter(value => value > range.start && value < range.end), range.end];
  return `<div class="calendar-hour-axis" aria-hidden="true">${ticks.map(value => `<span style="top:${(value - range.start) / (range.end - range.start) * 100}%">${minuteLabel(value)}</span>`).join('')}</div>`;
};
const detailMarker = '<span class="calendar-detail-marker" aria-hidden="true" hidden>…</span>';
function nowMarker(date, range = calendarHours) {
  const now = new Date(), value = now.getHours() * 60 + now.getMinutes();
  return `<div class="calendar-now" data-now-date="${date}" data-time-start="${range.start}" data-time-end="${range.end}" aria-hidden="true" style="top:${(value - range.start) / (range.end - range.start) * 100}%" ${date !== localDate(now) || value < range.start || value > range.end ? 'hidden' : ''}><span>Now</span></div>`;
}
function dayPlot(date, events, range = calendarHours) {
  const items = layoutDayEvents(dayMeetings(date, events));
  const duration = range.end - range.start;
  return `<div class="calendar-day-plot" data-date="${date}" data-time-start="${range.start}" data-time-end="${range.end}" style="--grid-hour:${60 / duration * 100}%;--grid-offset:${(60 - range.start % 60) % 60 / duration * 100}%">${items.map(item => `<a class="calendar-meeting" data-meeting-id="${item.id}" data-offset="${item.offset}" data-duration="${item.duration}" data-column="${item.column}" data-columns="${item.columns}" href="#meeting/${item.id}" style="top:${(minutes(item.startTime) - range.start) / duration * 100}%;height:${item.duration / duration * 100}%;left:${item.column / item.columns * 100}%;width:${100 / item.columns}%" aria-label="${escape(`${item.title}, ${dayName(date)}, ${timeRange(item)}, ${roomName(item.roomId)}, ${item.duration} minutes`)}" title="${escape(`${item.title} · ${timeRange(item)} · ${roomName(item.roomId)}`)}"><time>${timeRange(item)}</time><strong>${escape(item.title)}</strong><span>${escape(roomName(item.roomId))}</span>${detailMarker}</a>`).join('')}${nowMarker(date, range)}</div>`;
}
// AUDHD-08/11: Overview reuses this presentation-only geometry. Exact duration
// is visible; a native list disclosure preserves full labels for short events,
// enlarged text, keyboard users, and people who prefer a chronological list.
// See ../../GUIDE.md#audhd-08-use-visuals-to-support-decisions.
export function renderDayTimeline(date, events, { compact = false, showHeading = true } = {}) {
  const items = dayMeetings(date, events).sort((a, b) => a.startTime.localeCompare(b.startTime));
  // AUDHD-02/08: an overview crops unused hours, never scales individual
  // reservations differently. Endpoint labels expose that narrower window;
  // the full calendar still uses the complete, comparable room-hours scale.
  // See ../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings.
  const range = compact && items.length ? {
    start: Math.max(calendarHours.start, Math.floor(Math.min(...items.map(item => minutes(item.startTime))) / 30) * 30 - 30),
    end: Math.min(calendarHours.end, Math.ceil(Math.max(...items.map(item => minutes(item.endTime))) / 30) * 30 + 30),
  } : calendarHours;
  return `<section class="day-timeline ${compact ? 'day-timeline-compact' : ''}" aria-label="${escape(`Meetings on ${dayName(date)}`)}">${showHeading ? `<h2>${escape(dayName(date))}${date === localDate() ? ' · Today' : ''}</h2>` : ''}${compact && !items.length ? '' : `<div class="day-timeline-grid" ${compact ? `style="height:${Math.max(10, (range.end - range.start) / 60 * 5)}rem"` : ''}>${hourAxis(range)}${dayPlot(date, events, range)}</div>`}${items.length ? `<details class="calendar-readable-list" data-guide-key="calendar-day-list"><summary>Meeting list · ${items.length}</summary><ul class="schedule-events">${items.map(eventRow).join('')}</ul></details>` : '<p>No meetings reserved on this day.</p>'}</section>`;
}
// AUDHD-05/08/11: fit complete labels after layout, not a guessed character
// count. Short events remain truthful duration marks with a full accessible
// name and the readable list; we never stretch a booking to fit its wording.
// The owning view schedules this function, so the shared renderer adds no timer.
// See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
export function updateCalendarPresentation(container) {
  const now = new Date(), value = now.getHours() * 60 + now.getMinutes();
  const outsideHours = value < calendarHours.start || value > calendarHours.end;
  for (const marker of container.querySelectorAll('[data-now-date]')) {
    const start = Number(marker.dataset.timeStart), end = Number(marker.dataset.timeEnd);
    marker.hidden = marker.dataset.nowDate !== localDate(now) || value < start || value > end;
    marker.style.top = `${(value - start) / (end - start) * 100}%`;
  }
  for (const block of container.querySelectorAll('.calendar-meeting,.room-reservation')) {
    if (!block.getClientRects().length) continue;
    const marker = block.querySelector('.calendar-detail-marker');
    const labels = [...block.children].filter(label => label !== marker);
    marker.hidden = true;
    const compact = Boolean(block.closest('.day-timeline-compact'));
    for (const label of labels) label.hidden = true;
    const priority = compact ? [...labels].sort((a, b) => Number(b.tagName === 'STRONG') - Number(a.tagName === 'STRONG')) : labels;
    for (const label of priority) {
      if (label.tagName === 'SPAN' && (compact || block.querySelector('strong')?.hidden)) continue;
      label.hidden = false;
      if (block.scrollHeight > block.clientHeight || block.scrollWidth > block.clientWidth) label.hidden = true;
    }
    // AUDHD-08/11: an unlabeled duration mark still signals that details exist.
    // The original link/name remains keyboard accessible; the marker adds no
    // second focus stop and does not enlarge the booked interval.
    // See ../../GUIDE.md#audhd-08-use-visuals-to-support-decisions.
    marker.hidden = labels.some(label => !label.hidden);
    // AUDHD-03/08/11: shortened duration marks retain their full visible
    // context on focus or hover, without enlarging the time they occupy. The
    // link's accessible name already contains this text; the visual preview
    // introduces neither a second focus stop nor an extra spoken duplicate.
    // See ../../GUIDE.md#audhd-03-offer-manageable-detail-without-hiding-choices.
    const hidePreview = () => container.querySelector('.calendar-event-preview')?.remove();
    const showPreview = () => {
      hidePreview();
      if (!labels.some(label => label.hidden)) return;
      const preview = document.createElement('div');
      preview.className = 'calendar-event-preview'; preview.setAttribute('aria-hidden', 'true');
      preview.dataset.previewFor = block.dataset.meetingId;
      preview.textContent = `${block.getAttribute('aria-label')}. Open the meeting for details.`;
      container.append(preview);
      const box = block.getBoundingClientRect(), tip = preview.getBoundingClientRect();
      preview.style.left = `${Math.max(8, Math.min(box.left, innerWidth - tip.width - 8))}px`;
      preview.style.top = `${Math.max(8, box.bottom + tip.height <= innerHeight - 8 ? box.bottom - 1 : box.top - tip.height + 1)}px`;
      preview.onpointerleave = () => { if (document.activeElement !== block) hidePreview(); };
    };
    block.onfocus = showPreview; block.onblur = hidePreview;
    block.onpointerenter = showPreview;
    block.onpointerleave = event => { if (document.activeElement !== block && !event.relatedTarget?.closest?.('.calendar-event-preview')) hidePreview(); };
    block.onkeydown = event => { if (event.key === 'Escape') { hidePreview(); event.preventDefault(); } };
    if (container.querySelector('.calendar-event-preview')?.dataset.previewFor === block.dataset.meetingId) showPreview();
  }
  return { today: localDate(now), time: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }), outsideHours };
}
function monthMarkup(date, events) {
  const { first, last } = calendarRange(date, 'month');
  const start = calendarRange(first, 'week').first;
  const length = Math.ceil((Math.round((new Date(`${last}T12:00:00`) - new Date(`${start}T12:00:00`)) / 86400000) + 1) / 7) * 7;
  const days = Array.from({ length }, (_, index) => addDays(start, index));
  return `<p class="month-mobile-help">Numbers under dates count meetings. Select a date for the list below.</p><table class="month-calendar" aria-label="Month calendar"><thead><tr>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `<th scope="col"><span class="month-weekday-long">${day}</span><span class="month-weekday-short" aria-label="${day}">${day[0]}</span></th>`).join('')}</tr></thead><tbody>${Array.from({ length: length / 7 }, (_, row) => `<tr>${days.slice(row * 7, row * 7 + 7).map(day => {
    const items = dayMeetings(day, events).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return `<td class="${day < first || day > last ? 'month-outside' : ''}" data-today="${day === localDate()}"><button id="month-${day}" data-calendar-day="${day}" aria-pressed="${day === date}" aria-label="${escape(`${dayName(day)}${day === localDate() ? ', today' : ''}, ${items.length} meetings`)}"><span>${Number(day.slice(-2))}</span><small class="month-mobile-count">${items.length ? `·${items.length}` : ''}</small></button><ul class="month-meetings">${items.slice(0, 3).map(item => `<li><a href="#meeting/${item.id}" title="${escape(`${item.title} · ${timeRange(item)} · ${roomName(item.roomId)}`)}"><time>${item.startTime}</time> ${escape(item.title)}</a></li>`).join('')}${items.length > 3 ? `<li><button data-calendar-day="${day}" data-calendar-more="true">${items.length - 3} more</button></li>` : ''}</ul></td>`;
  }).join('')}</tr>`).join('')}</tbody></table><section class="month-selected-day"><h2 tabindex="-1">${escape(dayName(date))}</h2><ul class="schedule-events">${dayMeetings(date, events).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(eventRow).join('') || '<li>No meetings reserved on this day.</li>'}</ul></section>`;
}
function weekMarkup(date, events) {
  const { first } = calendarRange(date, 'week');
  const days = Array.from({ length: 7 }, (_, index) => addDays(first, index));
  return `<div class="calendar-week-desktop"><div class="calendar-week-head"><span aria-hidden="true">Time</span>${days.map(day => `<h2 data-today="${day === localDate()}">${new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}<span>${new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>${day === localDate() ? '<small>Today</small>' : ''}</h2>`).join('')}</div><div class="calendar-week-grid">${hourAxis()}${days.map(day => dayPlot(day, events)).join('')}</div></div><div class="calendar-week-mobile">${renderDayTimeline(date, events, { showHeading: false })}</div><details class="calendar-readable-list calendar-week-desktop" data-guide-key="calendar-week-list"><summary>Meeting list for this week</summary><ul class="schedule-events">${events.filter(item => item.status === 'scheduled' && item.date >= first && item.date <= addDays(first, 6)).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).map(eventRow).join('') || '<li>No meetings reserved this week.</li>'}</ul></details>`;
}
function renderCalendar(container, view, changed) {
  const narrow = matchMedia('(max-width: 70rem)');
  const label = view === 'month' ? 'Month calendar' : view === 'agenda' ? 'Meeting agenda' : 'Week calendar';
  container.innerHTML = `<header class="task-heading calendar-heading"><h1>${label}</h1>${calendarViewChoice(`calendar/${view}`)}</header>
    <div id="calendar-new-confirm"></div><section class="calendar-view"><div class="calendar-toolbar"><div class="calendar-period"><h2 id="calendar-range" aria-live="polite"></h2><div class="calendar-step-actions"><button id="calendar-previous">Previous</button><button id="calendar-today">Today</button><button id="calendar-next">Next</button></div></div><label>Date<input type="date" id="${view === 'agenda' ? 'agenda-date' : 'calendar-date'}" value="${browse.date}"></label></div>${view === 'agenda' ? `<label class="inline"><input type="checkbox" id="include-cancelled" ${browse.cancelled ? 'checked' : ''}>Include cancelled meetings</label>` : ''}<p class="calendar-time-context">Room hours 08:00–18:00 · ${escape(localZone)} <span id="calendar-now-label"></span></p><div id="${view === 'agenda' ? 'agenda-results' : 'calendar-stage'}"></div></section>${guideNote(view === 'agenda' ? 'calendar-agenda-design' : view === 'month' ? 'calendar-month-design' : 'calendar-time-design', view === 'agenda' ? 'Date headings contain their meetings' : view === 'month' ? 'Days retain calendar context' : 'Time and length share one scale', view === 'agenda' ? '<p>Each date owns one outlined group of meetings. The shared boundary keeps membership visible when text wraps; readable times supplement the week timeline.</p>' : view === 'month' ? '<p>Cells preserve the week and day relationships. Select a date to inspect its complete meeting list without forcing every detail into a small cell.</p>' : '<p>Columns group a day; vertical position shows the start time and block height shows duration. Meetings at the same time use separate columns. Narrow screens show one selected day instead of compressing seven columns. Month cells summarize each day; select a date for the complete list below. Focus or point to a compact meeting block to read its full details; open the link to change the reservation.</p>', ['AUDHD-02', 'AUDHD-08', 'AUDHD-11'])}`;
  const stage = container.querySelector(view === 'agenda' ? '#agenda-results' : '#calendar-stage');
  let focusedMeetingId = '';
  const rememberFocus = event => {
    // Hiding a desktop plot can blur its link before matchMedia fires. Retain
    // that record identity until the user actually focuses/clicks elsewhere.
    // AUDHD-05: ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    if (event.target !== document.body) focusedMeetingId = stage.contains(event.target) ? event.target.closest('[data-meeting-id]')?.dataset.meetingId || '' : '';
  };
  const rememberPointer = event => { if (!event.target.closest('[data-meeting-id]')) focusedMeetingId = ''; };
  document.addEventListener('focusin', rememberFocus);
  document.addEventListener('pointerdown', rememberPointer);
  const draw = () => {
    const active = stage.contains(document.activeElement) ? document.activeElement : null;
    const focused = active?.id, meetingId = active?.dataset.meetingId || focusedMeetingId;
    // AUDHD-05/11: the same booking owns focus across week/day reflow. A
    // focused meeting may be on a different day from the date input; reveal it
    // before rebuilding, rather than dropping the user's place to the body.
    // See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    if (view === 'week' && narrow.matches && meetingId) browse.date = getMeeting(meetingId)?.date || browse.date;
    container.querySelector('input[type=date]').value = browse.date;
    const { first, last } = calendarRange(browse.date, view), events = getCalendarEvents();
    container.querySelector('#calendar-range').textContent = view === 'month' ? new Date(`${browse.date}T12:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : view === 'week' && narrow.matches ? dayName(browse.date) : `${dayName(first)} – ${dayName(last)}`;
    for (const [id, direction] of [['calendar-previous', 'Previous'], ['calendar-next', 'Next']]) {
      const button = container.querySelector(`#${id}`), step = view === 'week' && narrow.matches ? 'day' : view === 'agenda' ? '7 days' : view;
      button.textContent = `${direction} ${step}`; button.removeAttribute('aria-label');
    }
    if (view === 'agenda') {
      const items = events.filter(item => item.date >= first && item.date <= last && (browse.cancelled || item.status === 'scheduled')).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
      const dates = [...new Set(items.map(item => item.date))];
      stage.innerHTML = `<p role="status">${items.length} meeting${items.length === 1 ? '' : 's'}</p>${dates.map(date => `<section class="schedule-day"><h2>${escape(dayName(date))}</h2><ul class="schedule-events">${items.filter(item => item.date === date).map(eventRow).join('')}</ul></section>`).join('') || '<p>No meetings in this period. <a href="#calendar/new">Plan a meeting</a> or change the date.</p>'}`;
    } else stage.innerHTML = view === 'month' ? monthMarkup(browse.date, events) : weekMarkup(browse.date, events);
    for (const button of stage.querySelectorAll('[data-calendar-day]')) button.onclick = () => { browse.date = button.dataset.calendarDay; container.querySelector('input[type=date]').value = browse.date; draw(); if (button.dataset.calendarMore) stage.querySelector('.month-selected-day h2')?.focus(); };
    restoreGuideNotes(stage);
    updateClock();
    if (active || meetingId) {
      const target = meetingId ? [...stage.querySelectorAll('[data-meeting-id]')].find(node => node.dataset.meetingId === meetingId && node.getClientRects().length) : focused ? document.getElementById(focused) : null;
      (target || container.querySelector('input[type=date]')).focus();
    }
  };
  const updateClock = () => {
    if (!stage.isConnected) { calendarCleanup(); return; }
    const clock = updateCalendarPresentation(stage);
    const { first, last } = calendarRange(browse.date, view);
    container.querySelector('#calendar-now-label').textContent = clock.today >= first && clock.today <= last ? `· Now ${clock.time}` : '';
  };
  const clearNewConfirmation = () => { pendingNew = null; container.querySelector('#calendar-new-confirm').replaceChildren(); };
  const move = direction => {
    clearNewConfirmation();
    if (view === 'month') {
      const date = new Date(`${browse.date}T12:00:00`), month = date.getMonth() + direction;
      browse.date = localDate(new Date(date.getFullYear(), month, Math.min(date.getDate(), new Date(date.getFullYear(), month + 1, 0).getDate())));
    } else browse.date = addDays(browse.date, direction * (view === 'week' && narrow.matches ? 1 : 7));
    container.querySelector('input[type=date]').value = browse.date; draw();
  };
  container.querySelector('#calendar-previous').onclick = () => move(-1);
  container.querySelector('#calendar-next').onclick = () => move(1);
  container.querySelector('#calendar-today').onclick = () => { clearNewConfirmation(); browse.date = localDate(); container.querySelector('input[type=date]').value = browse.date; draw(); };
  // AUDHD-02/05: the sidebar and the calendar's task action have one outcome.
  // This listener exists only while browsing a calendar; room proposals supply
  // their own explicit date/time, and ordinary modified-link navigation remains native.
  // See ../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings.
  const openNewMeeting = event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !event.target.closest('a[href="#calendar/new"]')) return;
    event.preventDefault();
    const draft = getMeetingDraft('new');
    if (isMeetingDirty('new') && draft.date === browse.date) { location.hash = 'calendar/new'; return; }
    showNewConfirmation(container.querySelector('#calendar-new-confirm'), { date: browse.date }, changed);
  };
  document.addEventListener('click', openNewMeeting);
  container.querySelector('input[type=date]').oninput = event => { if (event.target.value) { clearNewConfirmation(); browse.date = event.target.value; draw(); } };
  container.querySelector('#include-cancelled')?.addEventListener('change', event => { browse.cancelled = event.target.checked; draw(); });
  narrow.addEventListener('change', draw);
  const resize = new ResizeObserver(updateClock);
  resize.observe(stage);
  const timer = setInterval(updateClock, 60000);
  calendarCleanup = () => { clearInterval(timer); narrow.removeEventListener('change', draw); resize.disconnect(); document.removeEventListener('focusin', rememberFocus); document.removeEventListener('pointerdown', rememberPointer); document.removeEventListener('click', openNewMeeting); };
  draw(); restoreGuideNotes(container);
}
function showNewConfirmation(host, fields, changed) {
  const result = prepareNewMeeting(fields);
  if (result.ok) { changed(); location.hash = 'calendar/new'; return; }
  pendingNew = fields;
  const previousDate = getMeetingDraft('new').date;
  host.innerHTML = `<div class="status" id="replace-meeting-warning" role="alert"><p>You have an unfinished new meeting for ${escape(dayName(previousDate))}. Keep it, or start a new draft for ${escape(dayName(fields.date))}${fields.startTime ? `, ${escape(timeRange(fields))} in ${escape(roomName(fields.roomId))}` : ''}. Starting a new draft discards the unfinished one. Saved reservations are unchanged.</p><div class="actions"><button id="keep-meeting-draft">Keep my draft</button><button id="replace-meeting-draft">Start new meeting draft</button></div></div>`;
  host.querySelector('#keep-meeting-draft').onclick = () => { pendingNew = null; location.hash = 'calendar/new'; };
  host.querySelector('#replace-meeting-draft').onclick = () => { prepareNewMeeting(pendingNew, true); pendingNew = null; changed(); location.hash = 'calendar/new'; };
  host.querySelector('#keep-meeting-draft').focus();
}
function roomLane(room, events, criteria) {
  const items = dayMeetings(criteria.date, events).filter(item => item.roomId === room.id);
  const start = timePosition(criteria.startTime), width = (minutes(criteria.endTime) - minutes(criteria.startTime)) / span * 100;
  return `<div class="room-lane-wrap"><div class="room-hour-horizontal" aria-hidden="true">${hours.map((hour, index) => `<span style="left:${index * 10}%">${hour}</span>`).join('')}</div>${hourAxis()}<div class="room-time-lane" aria-label="${escape(`${room.name}, ${dayName(criteria.date)}, 08:00 to 18:00`)}">${items.map(item => `<a class="room-reservation" data-meeting-id="${item.id}" data-start="${item.startTime}" data-end="${item.endTime}" href="#meeting/${item.id}" style="--time-start:${timePosition(item.startTime)}%;--time-span:${(minutes(item.endTime) - minutes(item.startTime)) / span * 100}%" aria-label="${escape(`${item.title}, ${timeRange(item)}, reserved in ${room.name}`)}" title="${escape(`${item.title} · ${timeRange(item)}`)}"><time>${timeRange(item)}</time><strong>${escape(item.title)}</strong>${detailMarker}</a>`).join('')}<div class="room-proposal" role="img" style="--time-start:${start}%;--time-span:${width}%" aria-label="${escape(`Searched time ${criteria.startTime} to ${criteria.endTime}; not reserved`)}"></div></div></div>`;
}
function renderRooms(container, changed) {
  // AUDHD-04/07/09: multi-field requirements need an explicit submission boundary.
  // Essential rules and each correction stay beside their control. The form is
  // never replaced by result rendering, preserving caret, draft and equipment help.
  // See ../../GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision.
  container.innerHTML = heading('Room availability', 'Find a room for your meeting, inspect its schedule, then finish the meeting details. Nothing is booked until you save the meeting.') + `
    <form id="room-search-form" class="ui-panel room-requirements" aria-labelledby="room-requirements-title" novalidate><h2 id="room-requirements-title">Meeting requirements</h2><div class="schedule-date-pair room-query-grid"><label>Date<input id="rooms-date" type="date" value="${availability.date}" aria-describedby="rooms-error-date"><span id="rooms-error-date" class="error"></span></label><label>Start time<input id="rooms-start" type="time" value="${availability.startTime}" aria-describedby="room-time-rules rooms-error-startTime"><span id="rooms-error-startTime" class="error"></span></label><label>End time<input id="rooms-end" type="time" value="${availability.endTime}" aria-describedby="room-time-rules rooms-error-endTime"><span id="rooms-error-endTime" class="error"></span></label><label>People<input id="rooms-people" type="number" min="1" max="12" step="1" value="${availability.attendees}" aria-describedby="rooms-error-attendees"><span id="rooms-error-attendees" class="error"></span></label></div><details data-guide-key="room-equipment-filter"><summary>Equipment needed <span id="room-equipment-count"></span></summary><fieldset class="schedule-equipment"><legend>Required equipment</legend>${Object.entries(equipmentNames).map(([key, label]) => `<label class="inline"><input type="checkbox" data-room-equipment="${key}" ${availability.requiredEquipment.includes(key) ? 'checked' : ''}>${label}</label>`).join('')}</fieldset></details><p id="room-time-rules" class="schedule-boundary">08:00–18:00 · ${escape(localZone)} · Meetings: 15 minutes to 8 hours, within one day.</p><div id="room-query-error" role="alert"></div><div class="actions"><button id="find-rooms" class="ui-action" type="submit">Find available rooms</button><span id="room-search-progress" role="status"></span></div>${guideNote('room-search-design', 'Submit related requirements together', '<p>The search owns a snapshot. New edits invalidate continuation without erasing the last result; only the latest response may update it.</p>', ['AUDHD-05', 'AUDHD-07', 'AUDHD-09'])}</form>
    <section class="room-comparison" aria-labelledby="room-choices-title"><h2 id="room-choices-title" tabindex="-1">Choose a room</h2><div id="room-search-status" role="status"></div><div id="room-search-failure"></div><div id="rooms-range" class="room-search-snapshot"></div><ul id="room-summary" class="room-summary" aria-label="Rooms for the searched time"></ul><div id="rooms-alternatives"></div><div id="room-draft-confirm"></div><div id="room-results"></div></section>${guideNote('room-lanes-design', 'Search, compare, then inspect one room', '<p>Submitting freezes the requirements shown with these results. Editing keeps the previous result visible but prevents continuing until another search succeeds. Only the latest response can replace results. Compact choices support comparison; selecting one focuses its schedule without booking it. Save rechecks the live reservation records. The same time scale has a vertical alternative on narrow screens.</p>', ['AUDHD-02', 'AUDHD-04', 'AUDHD-05', 'AUDHD-07', 'AUDHD-08', 'AUDHD-11'])}`;
  const controls = [['rooms-date', 'date'], ['rooms-start', 'startTime'], ['rooms-end', 'endTime'], ['rooms-people', 'attendees']];
  const draw = () => {
    // AUDHD-05: a delayed result must not strand keyboard focus on the document.
    // Preserve an inspected result's control identity; form controls are not
    // recreated at all. The search action is the fallback if a result disappears.
    const active = document.activeElement;
    const resultKey = ['roomJump', 'roomReturn', 'bookRoom'].find(key => active.dataset?.[key]);
    const restoreSelector = container.contains(active) && !active.closest('#room-search-form')
      ? active.id ? `#${CSS.escape(active.id)}`
      : resultKey ? `[data-${resultKey.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`)}="${CSS.escape(active.dataset[resultKey])}"]`
        : active.matches('summary') && active.parentElement.dataset.guideKey ? `[data-guide-key="${active.parentElement.dataset.guideKey}"] > summary` : null
      : null;
    const restoreResultFocus = () => {
      if (!restoreSelector) return;
      const target = container.querySelector(restoreSelector);
      (target && !target.disabled ? target : container.querySelector('#find-rooms'))?.focus({ preventScroll: true });
    };
    const { result, loading, error, errors } = roomSearch;
    const stale = result && !sameRequirements(availability, result.criteria);
    const usable = Boolean(result && !stale && !loading && !error && !Object.keys(errors).length);
    container.querySelector('#room-equipment-count').textContent = availability.requiredEquipment.length ? `· ${availability.requiredEquipment.map(key => equipmentNames[key]).join(', ')}` : '· Any';
    for (const [control, key] of controls) {
      container.querySelector(`#${control}`).setAttribute('aria-invalid', String(Boolean(errors[key])));
      container.querySelector(`#rooms-error-${key}`).textContent = errors[key] || '';
    }
    container.querySelector('#room-query-error').textContent = Object.keys(errors).length ? 'Correct the marked requirements, then find available rooms.' : '';
    container.querySelector('#room-search-progress').textContent = loading ? 'Checking room availability…' : '';
    container.querySelector('#room-search-status').textContent = stale ? 'Requirements changed—search again. These earlier results cannot be used to continue.' : loading ? 'Search in progress. Any earlier results remain below.' : !result && !error ? 'Set your requirements, then choose Find available rooms.' : '';
    container.querySelector('#room-search-failure').innerHTML = error ? `<div class="status room-search-error" role="alert"><p>${error}</p><button id="retry-room-search" type="button">Retry room search</button></div>` : '';
    container.querySelector('#retry-room-search')?.addEventListener('click', submit);
    for (const id of ['rooms-range', 'room-summary', 'rooms-alternatives', 'room-results']) container.querySelector(`#${id}`).replaceChildren();
    if (!result) { restoreResultFocus(); return; }
    const { criteria, events, checkedAt } = result;
    const roomResults = rooms.map(room => {
      const conflicts = events.filter(item => item.status === 'scheduled' && item.roomId === room.id && item.date === criteria.date && minutes(item.startTime) < minutes(criteria.endTime) && minutes(item.endTime) > minutes(criteria.startTime));
      const lacksSpace = Number(criteria.attendees) > room.capacity, lacksEquipment = criteria.requiredEquipment.some(key => !room.equipment.includes(key));
      const available = !conflicts.length && !lacksSpace && !lacksEquipment;
      const status = lacksSpace ? 'Too small for this group.' : lacksEquipment ? 'Missing selected equipment.' : conflicts.length ? 'Reserved during this time.' : 'Available for this date and time.';
      return { room, available, status };
    });
    const availableCount = roomResults.filter(item => item.available).length;
    container.querySelector('#rooms-range').innerHTML = `<strong>${availableCount} of ${rooms.length} rooms available for the searched requirements</strong><span>${escape(dayName(criteria.date))} · ${timeRange(criteria)} · ${escape(criteria.attendees)} people · ${criteria.requiredEquipment.length ? escape(criteria.requiredEquipment.map(key => equipmentNames[key]).join(', ')) : 'No equipment required'}</span><small>Last successful check: <time datetime="${new Date(checkedAt).toISOString()}">${escape(new Date(checkedAt).toLocaleString())}</time>. Availability is checked again when you save.</small>`;
    // AUDHD-02/05/08: comparison stays compact; one selected schedule shares an
    // outline with its state and next action. The snapshot, not edited criteria,
    // owns every geometry/label so an invalid draft can never draw a false interval.
    // See ../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings.
    container.querySelector('#room-summary').innerHTML = roomResults.map(({ room, status }) => `<li><button type="button" data-room-jump="${room.id}" aria-pressed="${selectedRoom === room.id}" aria-controls="room-detail-${room.id}"><strong>${escape(room.name)}</strong><small>Up to ${room.capacity} people</small><span>${status}</span><span class="room-selection-label">${selectedRoom === room.id ? 'Selected room' : 'View room & schedule'}</span></button></li>`).join('');
    container.querySelector('#room-results').innerHTML = roomResults.map(({ room, available, status }) => `<section id="room-detail-${room.id}" class="room-comparison-row" data-room="${room.id}" aria-labelledby="room-${room.id}" ${selectedRoom === room.id ? '' : 'hidden'}><div class="room-detail-heading"><div><h3 id="room-${room.id}" tabindex="-1">${escape(room.name)}</h3><p>${escape(dayName(criteria.date))} · Up to ${room.capacity} people</p></div><button type="button" data-room-return="${room.id}">Back to room choices</button></div><div class="room-choice"><p class="schedule-room-state">${status}${!usable ? ' Search again before continuing.' : ''}</p><button data-book-room="${room.id}" class="ui-action" ${available && usable ? '' : 'disabled'}>Continue with ${escape(room.name)}</button></div><details data-guide-key="room-facts-${room.id}"><summary>Equipment & location</summary><ul class="room-equipment-list">${Object.entries(equipmentNames).map(([key, label]) => `<li data-available="${room.equipment.includes(key)}">${room.equipment.includes(key) ? '✓' : '—'} ${label}${room.equipment.includes(key) ? '' : ' unavailable'}</li>`).join('')}</ul><p>${escape(room.location)}</p></details><p class="room-legend"><span class="room-legend-busy">Reserved</span><span class="room-legend-proposal">Searched · ${timeRange(criteria)} · not booked</span><span>Unfilled time is free in these results.</span></p>${roomLane(room, events, criteria)}<details class="room-reservation-list" data-guide-key="room-list-${room.id}"><summary>Reservation list · ${dayMeetings(criteria.date, events).filter(item => item.roomId === room.id).length}</summary><ul class="schedule-events">${dayMeetings(criteria.date, events).filter(item => item.roomId === room.id).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(eventRow).join('') || '<li>No meetings reserved in this room on this date.</li>'}</ul></details></section>`).join('');
    for (const button of container.querySelectorAll('[data-room-jump]')) button.onclick = () => {
      selectedRoom = button.dataset.roomJump;
      for (const choice of container.querySelectorAll('[data-room-jump]')) {
        const selected = choice.dataset.roomJump === selectedRoom;
        choice.setAttribute('aria-pressed', String(selected)); choice.querySelector('.room-selection-label').textContent = selected ? 'Selected room' : 'View room & schedule';
      }
      for (const panel of container.querySelectorAll('[data-room]')) panel.hidden = panel.dataset.room !== selectedRoom;
      updateCalendarPresentation(container);
      const title = container.querySelector(`#room-${selectedRoom}`); title.focus(); title.scrollIntoView({ block: 'start' });
    };
    for (const button of container.querySelectorAll('[data-room-return]')) button.onclick = () => container.querySelector(`[data-room-jump="${button.dataset.roomReturn}"]`).focus();
    const choices = usable && !availableCount ? rooms.flatMap(room => findAlternatives({ ...criteria, title: 'Proposed meeting', description: '', noteId: '', roomId: room.id }))
      .filter((choice, index, list) => list.findIndex(other => JSON.stringify(other) === JSON.stringify(choice)) === index).slice(0, 3) : [];
    container.querySelector('#rooms-alternatives').innerHTML = choices.length ? `<section class="ui-panel"><h2>Available alternatives</h2><p>No room fits the searched time and requirements. Choose an alternative to update your requirements, then search again.</p><div class="actions">${choices.map((choice, index) => `<button data-room-alternative="${index}">${escape(roomName(choice.roomId))} · ${timeRange(choice)}</button>`).join('')}</div></section>` : '';
    for (const button of container.querySelectorAll('[data-book-room]')) button.onclick = () => {
      if (!usable || !sameRequirements(availability, criteria)) return;
      showNewConfirmation(container.querySelector('#room-draft-confirm'), { ...copyRequirements(criteria), roomId: button.dataset.bookRoom }, changed);
    };
    for (const button of container.querySelectorAll('[data-room-alternative]')) button.onclick = () => {
      const choice = choices[Number(button.dataset.roomAlternative)];
      Object.assign(availability, { date: choice.date, startTime: choice.startTime, endTime: choice.endTime }); selectedRoom = choice.roomId;
      for (const [control, key] of controls) container.querySelector(`#${control}`).value = availability[key];
      draw(); container.querySelector('#find-rooms').focus();
    };
    restoreGuideNotes(container); updateCalendarPresentation(container); restoreResultFocus();
  };
  const submit = async event => {
    event?.preventDefault(); pendingNew = null; container.querySelector('#room-draft-confirm').replaceChildren();
    const promise = searchRooms();
    const invalid = controls.find(([, key]) => roomSearch.errors[key]);
    if (invalid) container.querySelector(`#${invalid[0]}`).focus();
    await promise;
  };
  const queryChanged = () => {
    pendingNew = null; container.querySelector('#room-draft-confirm').replaceChildren();
    // AUDHD-06: a keystroke alone cannot clear a correction. Revalidate the
    // retained errors, including coupled start/end and capacity constraints.
    // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
    const current = requirementErrors(availability);
    for (const key of Object.keys(roomSearch.errors)) { if (current[key]) roomSearch.errors[key] = current[key]; else delete roomSearch.errors[key]; }
    draw();
  };
  container.querySelector('#room-search-form').onsubmit = submit;
  for (const [id, key] of controls) container.querySelector(`#${id}`).oninput = event => { availability[key] = event.target.value; queryChanged(); };
  for (const input of container.querySelectorAll('[data-room-equipment]')) input.onchange = () => { availability.requiredEquipment = [...container.querySelectorAll('[data-room-equipment]:checked')].map(item => item.dataset.roomEquipment); queryChanged(); };
  refreshRoomSearch = draw;
  const results = container.querySelector('#room-results'), resize = new ResizeObserver(() => { if (!results.isConnected) resize.disconnect(); else updateCalendarPresentation(results); });
  resize.observe(results);
  calendarCleanup = () => { resize.disconnect(); if (refreshRoomSearch === draw) refreshRoomSearch = null; };
  draw(); restoreGuideNotes(container);
}
const help = (id, title, body) => `<details class="context-help" data-guide-key="${id}"><summary id="${id}-toggle">ⓘ ${title}</summary>${body}</details>`;
const meetingLength = item => {
  if (![item.startTime, item.endTime].every(value => /^\d{2}:\d{2}$/.test(value))) return 'Choose a start and end time';
  const length = minutes(item.endTime) - minutes(item.startTime);
  return Number.isFinite(length) && length > 0 ? `${length} minutes` : 'Choose an end time after the start';
};
function savedMeetingSummary(saved) {
  const room = rooms.find(item => item.id === saved.roomId);
  const note = notes.find(item => item.id === saved.noteId && item.status !== 'trash');
  // AUDHD-02/08/10: opening a calendar event first answers when, where and
  // what comes next. These facts and links use the saved record, never a draft
  // that has not reserved its proposed room. Editing stays below this summary.
  // See ../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings.
  return `<section class="ui-panel meeting-summary" aria-label="Saved meeting">
    <dl class="meeting-facts"><div><dt>When</dt><dd>${escape(dayName(saved.date))}<strong>${escape(timeRange(saved))} · ${meetingLength(saved)}</strong></dd></div><div><dt>Where</dt><dd>${escape(roomName(saved.roomId))}<span>${escape(room?.location || '')} · ${saved.attendees} people</span></dd></div></dl>
    ${saved.description ? `<p>${escape(saved.description)}</p>` : ''}
    <div class="actions">${note ? `<a class="task-link ui-action" href="#note/${note.id}">Open notes: ${escape(note.title)}</a>` : ''}<a class="task-link" href="#tasks/new/meeting/${saved.id}">Create follow-up task</a>${saved.status !== 'cancelled' ? `<a class="task-link" href="#meeting/${saved.id}/title">Change reservation</a>` : ''}</div>
    <p class="schedule-boundary">${saved.status === 'cancelled' ? 'Cancelled · room released.' : 'Room reserved.'} No meeting invitations are sent.</p>
  </section>`;
}
function reservationChanges(saved, draft) {
  // AUDHD-06/08: pair each old value with its proposed replacement. Reviewing
  // a title, date or room must not require remembering a distant summary. This
  // renderer reads state only; it cannot reserve a room or claim availability.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  const values = item => [
    ['Meeting title', item.title || 'Not entered'], ['Purpose', item.description || 'None'],
    ['Date', dayName(item.date)], ['Time', `${timeRange(item)} · ${meetingLength(item)}`],
    ['Room', roomName(item.roomId)], ['People', String(item.attendees || 'Not entered')],
    ['Equipment needed', item.requiredEquipment.map(key => equipmentNames[key]).sort().join(', ') || 'None'],
    ['Meeting note', notes.find(note => note.id === item.noteId)?.title || (item.noteId ? 'Note unavailable' : 'None')],
  ];
  const before = values(saved), after = values(draft);
  const differences = before.flatMap(([label, value], index) => value === after[index][1] ? [] : [{ label, before: value, after: after[index][1] }]);
  const explanation = saved.status === 'cancelled'
    ? 'The room has been released. Your edits remain here; restore the original reservation before saving them.'
    : 'The saved booking stays in place until you save. Room availability is checked again then.';
  return differences.length ? `<h2>Review reservation changes</h2><p>${explanation}</p><div class="meeting-change-list">${differences.map(change => `<section class="meeting-change"><h3>${change.label}</h3><dl><div><dt>Saved</dt><dd>${escape(change.before)}</dd></div><div><dt>Proposed</dt><dd>${escape(change.after)}</dd></div></dl></section>`).join('')}</div>` : '';
}
function reservationDraftStatus(saved, dirty, recheckRequired) {
  // AUDHD-06/07: retained edits do not hold a room after cancellation. Keep
  // that lifecycle separate from dirty/clean state instead of letting a
  // generic "unsaved changes" message imply that a booking is still active.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  let status;
  if (saved?.status === 'cancelled') {
    status = dirty ? 'Reservation cancelled. Unsaved edits retained; no room is reserved.' : 'The original reservation is cancelled.';
  } else if (dirty) {
    status = saved ? 'Unsaved changes. The saved room reservation has not changed.' : 'Unsaved new meeting. No room has been reserved yet.';
  } else {
    status = saved ? 'No unsaved changes.' : 'No reservation has been made.';
  }
  if (recheckRequired) status += ' Reservation details changed. Save to check availability again.';
  return status;
}
function renderEditor(container, id, changed) {
  const saved = getMeeting(id), draft = getMeetingDraft(id), cancelled = saved?.status === 'cancelled';
  if (!draft) { container.innerHTML = heading('Meeting unavailable', '<a href="#calendar/agenda">Return to the agenda</a>.'); return; }
  const errors = meetingErrors.get(id) || {}, failed = failures.get(id), disabled = cancelled ? 'disabled' : '';
  const field = (key, helpId = '') => {
    const describedBy = [helpId, errors[key] ? `meeting-error-${key}` : ''].filter(Boolean).join(' ');
    return `id="meeting-${key}" name="${key}" aria-invalid="${Boolean(errors[key])}" ${describedBy ? `aria-describedby="${describedBy}"` : ''}`;
  };
  container.innerHTML = (saved ? `<header class="task-heading"><h1>${escape(saved.title)}</h1></header>` : heading('New meeting', 'Reserve a room for one meeting. Repeating meetings must be booked separately.')) + `
    ${messages.has(id) ? `<p id="meeting-result" class="status" role="status" tabindex="-1">${escape(messages.get(id))}</p>` : ''}
    ${saved ? savedMeetingSummary(saved) : '<p class="schedule-boundary">No meeting invitations are sent.</p>'}
    ${cancelled ? `<section class="ui-panel"><h2>Cancelled reservation</h2><p>The meeting record remains, but it no longer holds the room. Restoring checks that the original slot is still free. Any unsaved edits remain separate.</p><div class="actions"><button id="restore-meeting">Restore original reservation</button><button id="copy-meeting">Copy to a new meeting</button></div><div id="cancelled-error" role="alert" tabindex="-1">${escape(restoreFailures.get(id) || '')}</div><div id="copy-draft-confirm"></div></section>` : ''}
    <form id="meeting-form" class="ui-panel schedule-editor" novalidate>
      ${saved ? `<h2>${cancelled ? 'Retained reservation draft' : 'Change reservation'}</h2>` : ''}
      <div id="meeting-errors" ${Object.keys(errors).length ? 'role="alert"' : ''}>${Object.keys(errors).length ? `<h2>Reservation not saved</h2><ul>${Object.entries(errors).map(([key, text]) => `<li><a href="#meeting-${key}">${escape(text)}</a></li>`).join('')}</ul>` : ''}</div>
      <label>Meeting title<input ${field('title')} maxlength="120" value="${escape(draft.title)}" ${disabled}></label>
      <label>Purpose (optional)<textarea ${field('description', 'meeting-purpose-help')} rows="3" maxlength="2000" ${disabled}>${escape(draft.description)}</textarea></label><p id="meeting-purpose-help">For example, “Choose the next project milestones.” Leave blank when the title is enough.</p>
      <fieldset class="schedule-timing"><legend>Date and time · ${escape(localZone)}</legend><div class="schedule-date-pair"><label>Date<input ${field('date')} type="date" min="${localDate()}" max="${addDays(localDate(), 365)}" value="${escape(draft.date)}" ${disabled}></label><label>Start time<input ${field('startTime', 'meeting-duration meeting-time-rules')} type="time" min="08:00" max="17:45" value="${escape(draft.startTime)}" ${disabled}></label><label>End time<input ${field('endTime', 'meeting-duration meeting-time-rules')} type="time" min="08:15" max="18:00" value="${escape(draft.endTime)}" ${disabled}></label></div><p id="meeting-duration" class="meeting-duration"></p><p id="meeting-time-rules">Use local time. Rooms open 08:00–18:00; each meeting lasts 15 minutes to 8 hours on one day.</p>${help('meeting-time-help', 'Choosing a time', '<p>For a half-hour discussion, choose 09:00 to 09:30. An end time of 10:00 leaves the room available for another booking starting at 10:00. A saved booking holds its room until you change or cancel it.</p>')}</fieldset>
      <fieldset><legend>Room and people</legend><div class="schedule-date-pair"><label>Room<select ${field('roomId', 'selected-room-description')} ${disabled}>${rooms.map(room => `<option value="${room.id}" ${draft.roomId === room.id ? 'selected' : ''}>${escape(room.name)} · up to ${room.capacity} people</option>`).join('')}</select></label><label>Number of people<input ${field('attendees')} type="number" min="1" max="12" step="1" value="${escape(draft.attendees)}" ${disabled}></label></div><p id="selected-room-description"></p><fieldset class="schedule-equipment" ${field('requiredEquipment', 'meeting-equipment-help')} tabindex="-1"><legend>Equipment needed</legend>${Object.entries(equipmentNames).map(([key, label]) => `<label class="inline"><input type="checkbox" data-meeting-equipment="${key}" ${draft.requiredEquipment.includes(key) ? 'checked' : ''} ${disabled}>${label}</label>`).join('')}</fieldset><p id="meeting-equipment-help">Leave equipment unchecked when none is needed. Choosing equipment does not add it to a room.</p></fieldset>
      <label>Related meeting note (optional)<select ${field('noteId')} ${disabled}><option value="">No note linked</option>${notes.filter(note => note.status !== 'trash').map(note => `<option value="${note.id}" ${draft.noteId === note.id ? 'selected' : ''}>${escape(note.title)}${note.status === 'archived' ? ' · archived' : ''}</option>`).join('')}</select></label>
      <div id="meeting-change-preview"></div>
      <div id="meeting-alternatives">${failed?.conflicts?.length ? `<h2>Conflicting reservations</h2><ul>${failed.conflicts.map(item => `<li><a href="#meeting/${item.id}">${escape(item.title)}</a> · ${escape(period(item))}</li>`).join('')}</ul>` : ''}${failed?.alternatives?.length ? `<h2>Available alternatives</h2><p>Choose a proposal, then save to reserve it. Availability is checked again when you save.</p><div class="actions">${failed.alternatives.map((item, index) => `<button type="button" data-alternative="${index}">${escape(roomName(item.roomId))} · ${escape(period(item))}</button>`).join('')}</div>` : ''}</div>
      <p id="meeting-draft-state" role="status"></p>${cancelled ? '' : `<div class="actions"><button id="save-meeting" class="ui-action" type="submit">${saved ? 'Save reservation changes' : 'Reserve room'}</button><button id="discard-meeting" type="button">Discard unsaved changes</button></div><div id="discard-meeting-confirm"></div>`}
      ${guideNote('meeting-conflict-design', 'Check the shared reservation at save', '<p>Bookings and drafts are owned by this browser visit. Refreshing this page resets the fictional records; no external reservation service or invitation system is connected. A visible availability result can become stale. This practice action creates another fictional reservation while preserving your draft; saving must then offer recovery.</p><button type="button" id="simulate-room-taken">Simulate another booking taking this slot</button>', ['AUDHD-06', 'AUDHD-07', 'AUDHD-12'])}
    </form>
    ${saved && !cancelled ? `<section class="ui-panel schedule-meeting-actions"><h2>Release the room</h2><p>Cancel the saved reservation. Its meeting record and linked note remain.</p><button id="cancel-meeting">Cancel this reservation</button><div id="cancel-meeting-confirm"></div></section>` : ''}`;
  const length = container.querySelector('#meeting-duration');
  restoreGuideNotes(container);
  // AUDHD-06/09: the summary provides navigation; the same correction also
  // stays beside its input so focus does not land on an unexplained error.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  for (const [key, text] of Object.entries(errors)) {
    const input = container.querySelector(`#meeting-${key}`);
    if (!input) continue;
    const message = document.createElement('span');
    message.id = `meeting-error-${key}`; message.className = 'error'; message.textContent = text;
    input.insertAdjacentElement('afterend', message);
  }
  let recheckRequired = Boolean(saved && (!sameRequirements({ ...saved, attendees: String(saved.attendees) }, draft) || saved.roomId !== draft.roomId));
  const clearError = key => {
    const input = container.querySelector(`#meeting-${key}`), current = meetingErrors.get(id);
    input?.removeAttribute('aria-invalid');
    if (input?.hasAttribute('aria-describedby')) input.setAttribute('aria-describedby', input.getAttribute('aria-describedby').split(' ').filter(value => value !== `meeting-error-${key}`).join(' '));
    container.querySelector(`#meeting-error-${key}`)?.remove();
    container.querySelector(`#meeting-errors a[href="#meeting-${key}"]`)?.closest('li')?.remove();
    if (current) { delete current[key]; if (!Object.keys(current).length) meetingErrors.delete(id); }
    if (!container.querySelector('#meeting-errors li')) { container.querySelector('#meeting-errors').replaceChildren(); container.querySelector('#meeting-errors').removeAttribute('role'); }
  };
  const proposalChanged = key => {
    // AUDHD-06/07: retain each error until its affected value validates. Related
    // edits invalidate old alternatives, but do not erase unrelated corrections.
    // A local format/overlap check is still not a reservation; Save checks again.
    // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
    const current = validateMeeting(draft);
    if (!['date', 'startTime', 'endTime', 'roomId'].some(field => current[field]) && roomConflicts(draft.roomId, draft.date, draft.startTime, draft.endTime, id).length) current.roomId = 'This room is still reserved during the proposed time. Choose another room or time.';
    for (const field of Object.keys(meetingErrors.get(id) || {})) {
      if (!current[field]) clearError(field);
      else {
        meetingErrors.get(id)[field] = current[field];
        const local = container.querySelector(`#meeting-error-${field}`), summary = container.querySelector(`#meeting-errors a[href="#meeting-${field}"]`);
        if (local) local.textContent = current[field]; if (summary) summary.textContent = current[field];
      }
    }
    container.querySelector('#discard-meeting-confirm')?.replaceChildren();
    if (!['date', 'startTime', 'endTime', 'roomId', 'attendees', 'requiredEquipment'].includes(key)) return;
    // AUDHD-05/06/07: alternatives belong to the failed proposal. After a
    // dependency changes, choosing an old suggestion could overwrite a newer
    // time or room. Clear those results and recheck only on the next save.
    // See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    failures.delete(id); messages.delete(id); recheckRequired = true;
    container.querySelector('#meeting-alternatives').replaceChildren();
    container.querySelector('#meeting-result')?.remove();
  };
  const update = () => {
    const room = rooms.find(item => item.id === draft.roomId);
    length.textContent = `Proposed duration: ${meetingLength(draft)}.`;
    container.querySelector('#meeting-change-preview').innerHTML = saved ? reservationChanges(saved, draft) : '';
    // AUDHD-05/06: update derived feedback without replacing the controls,
    // selection or focused input. Saving an unchanged record is not a task.
    // See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    const dirty = isMeetingDirty(id);
    const save = container.querySelector('#save-meeting'), discard = container.querySelector('#discard-meeting');
    if (save) save.disabled = Boolean(saved && !dirty);
    if (discard) discard.disabled = !dirty && !meetingErrors.has(id);
    container.querySelector('#selected-room-description').textContent = room ? `${room.location}. ${roomDescription(room)}.` : 'Choose a room.';
    container.querySelector('#meeting-draft-state').textContent = reservationDraftStatus(saved, dirty, recheckRequired);
  };
  for (const key of targets.filter(key => key !== 'requiredEquipment')) container.querySelector(`#meeting-${key}`).oninput = event => { draft[key] = event.target.value; proposalChanged(key); update(); changed(); };
  for (const input of container.querySelectorAll('[data-meeting-equipment]')) input.onchange = () => { draft.requiredEquipment = [...container.querySelectorAll('[data-meeting-equipment]:checked')].map(item => item.dataset.meetingEquipment); proposalChanged('requiredEquipment'); update(); changed(); };
  for (const link of container.querySelectorAll('#meeting-errors a')) link.onclick = event => { event.preventDefault(); const target = container.querySelector(link.getAttribute('href')); target?.focus(); };
  container.querySelector('#meeting-form').onsubmit = event => {
    event.preventDefault();
    const result = saveMeeting(id);
    if (!result.ok) { failures.set(id, result); renderEditor(container, id, changed); changed(); container.querySelector(`#meeting-${Object.keys(result.errors)[0]}`)?.focus(); return; }
    failures.delete(id); messages.set(result.meeting.id, result.unchanged ? 'No reservation changes to save.' : `Room reserved for ${period(result.meeting)} in ${roomName(result.meeting.roomId)}. No invitations sent.`);
    changed();
    if (id === 'new') location.hash = `meeting/${result.meeting.id}`;
    else { renderEditor(container, id, changed); container.querySelector('#meeting-result')?.focus(); }
  };
  // AUDHD-06/13: discard names the retained proposal before deleting it. Cancel
  // leaves every field and error intact and returns focus to the initiating
  // control. Reservation cancellation below is separate and keeps the record.
  // See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  container.querySelector('#discard-meeting')?.addEventListener('click', () => {
    const host = container.querySelector('#discard-meeting-confirm');
    host.innerHTML = `<div class="status" role="alert"><p>Discard the unsaved title, purpose, room, time and note choices for “${escape(draft.title || 'New meeting')}”? ${saved ? 'The saved reservation will remain.' : 'No room has been reserved for this draft.'}</p><div class="actions"><button id="keep-meeting-changes" type="button">Keep editing</button><button id="confirm-discard-meeting" type="button">Discard this draft</button></div></div>`;
    host.querySelector('#keep-meeting-changes').onclick = () => { host.replaceChildren(); container.querySelector('#discard-meeting').focus(); };
    host.querySelector('#confirm-discard-meeting').onclick = () => { discardMeetingDraft(id); failures.delete(id); messages.set(id, 'Unsaved changes discarded. Saved reservations are unchanged.'); renderEditor(container, id, changed); changed(); container.querySelector('#meeting-result')?.focus(); };
    host.querySelector('#keep-meeting-changes').focus();
  });
  for (const button of container.querySelectorAll('[data-alternative]')) button.onclick = () => {
    Object.assign(draft, failed.alternatives[Number(button.dataset.alternative)]);
    const remaining = validateMeeting(draft);
    if (Object.keys(remaining).length) meetingErrors.set(id, remaining); else meetingErrors.delete(id);
    failures.delete(id);
    messages.set(id, 'Alternative selected as an unsaved proposal. Save to reserve it.'); renderEditor(container, id, changed); changed(); container.querySelector('#save-meeting')?.focus();
  };
  container.querySelector('#simulate-room-taken').onclick = () => { const result = simulateRoomTaken(id); messages.set(id, result.ok ? 'Another simulated reservation now holds this slot. Your draft is unchanged; save to check availability.' : 'Choose a valid, unreserved room and time before running this demonstration.'); renderEditor(container, id, changed); changed(); container.querySelector('#meeting-result')?.focus(); };
  container.querySelector('#cancel-meeting')?.addEventListener('click', () => {
    container.querySelector('#cancel-meeting-confirm').innerHTML = '<div class="status"><p>Cancel the saved reservation and release its room? The meeting record, linked note and any draft remain.</p><div class="actions"><button id="keep-reservation">Keep reservation</button><button id="confirm-cancel-meeting">Cancel reservation</button></div></div>';
    container.querySelector('#keep-reservation').onclick = () => { container.querySelector('#cancel-meeting-confirm').replaceChildren(); container.querySelector('#cancel-meeting').focus(); };
    container.querySelector('#confirm-cancel-meeting').onclick = () => { cancelMeeting(id); messages.set(id, 'Reservation cancelled. Its room is available again; the meeting record and draft remain.'); renderEditor(container, id, changed); changed(); container.querySelector('#meeting-result')?.focus(); };
    container.querySelector('#keep-reservation').focus();
  });
  container.querySelector('#restore-meeting')?.addEventListener('click', () => {
    const result = restoreMeeting(id);
    if (!result.ok) {
      const text = `Last restore attempt: ${Object.values(result.errors).join(' ')}`;
      restoreFailures.set(id, text); container.querySelector('#cancelled-error').textContent = text; container.querySelector('#cancelled-error').focus(); return;
    }
    restoreFailures.delete(id);
    messages.set(id, 'Original reservation restored. Any unsaved draft still needs to be saved separately.'); renderEditor(container, id, changed); changed(); container.querySelector('#meeting-result')?.focus();
  });
  container.querySelector('#copy-meeting')?.addEventListener('click', () => showNewConfirmation(container.querySelector('#copy-draft-confirm'), { ...getMeetingDraft(id), title: `${saved.title} — copy` }, changed));
  update();
}
export function renderSchedule(container, path, changed = () => {}) {
  calendarCleanup();
  if (['calendar', 'calendar/week', 'calendar/month', 'calendar/agenda'].includes(path)) renderCalendar(container, path === 'calendar' ? 'week' : path.split('/')[1], changed);
  else if (path === 'calendar/rooms') renderRooms(container, changed);
  else {
    const id = path.startsWith('calendar/new') ? 'new' : path.split('/')[1];
    renderEditor(container, id, changed);
    // AUDHD-05/06: overview correction links land on the actual field while
    // leaving the retained draft intact. Parent navigation owns Back/Forward.
    // See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    const field = path.split('/')[2];
    if (targets.includes(field)) container.querySelector(`#meeting-${field}`)?.focus();
  }
}
