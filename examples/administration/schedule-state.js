import { recordEvent } from './events.js';
import { notes } from './notes-state.js';

// AUDHD-06/07: bookings and drafts belong to this visit, not to a mounted view.
// This single-process simulation checks conflicts at save; it is not a shared
// reservation service or a production concurrency guarantee. Reload resets it.
// See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
export const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'browser local time';
export const equipmentNames = { screen: 'Screen', whiteboard: 'Whiteboard', video: 'Video-call equipment' };
export const rooms = Object.freeze([
  Object.freeze({ id: 'harbor', name: 'Harbor room', capacity: 8, equipment: Object.freeze(['screen', 'whiteboard']), location: 'Ground floor, beside reception' }),
  Object.freeze({ id: 'focus', name: 'Focus room', capacity: 4, equipment: Object.freeze(['screen', 'video']), location: 'Ground floor, quiet corridor' }),
  Object.freeze({ id: 'workshop', name: 'Workshop room', capacity: 12, equipment: Object.freeze(['screen', 'whiteboard', 'video']), location: 'First floor, beside the stairs' }),
]);
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(value, count) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + count);
  return localDate(date);
}
const minute = value => /^\d{2}:\d{2}$/.test(value || '') && +value.slice(0, 2) < 24 && +value.slice(3) < 60 ? +value.slice(0, 2) * 60 + +value.slice(3) : NaN;
const time = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const calendarHours = Object.freeze({ start: 480, end: 1080 });
export function calendarRange(date, view) {
  if (view === 'month') {
    const day = new Date(`${date}T12:00:00`);
    return { first: localDate(new Date(day.getFullYear(), day.getMonth(), 1)), last: localDate(new Date(day.getFullYear(), day.getMonth() + 1, 0)) };
  }
  const first = view === 'week' ? addDays(date, -((new Date(`${date}T12:00:00`).getDay() + 6) % 7)) : date;
  return { first, last: addDays(first, 6) };
}
// AUDHD-04/08: placement represents actual minutes. Simultaneous meetings in
// different rooms occupy separate columns, including chained overlaps; touching
// endpoints reuse a column. No minimum visual duration changes the saved time.
export function layoutDayEvents(events) {
  const ordered = events.filter(item => item.status === 'scheduled')
    .map(item => ({ ...item, startMinute: minute(item.startTime), endMinute: minute(item.endTime) }))
    .sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute || a.id.localeCompare(b.id));
  let cluster = [], ends = [], lastEnd = -1;
  const finish = () => { for (const item of cluster) item.columns = ends.length; cluster = []; ends = []; };
  for (const item of ordered) {
    if (item.startMinute >= lastEnd) finish();
    let column = ends.findIndex(end => end <= item.startMinute);
    if (column === -1) column = ends.length;
    ends[column] = item.endMinute;
    Object.assign(item, { column, offset: item.startMinute - calendarHours.start, duration: item.endMinute - item.startMinute });
    cluster.push(item); lastEnd = Math.max(lastEnd, item.endMinute);
  }
  finish();
  return ordered;
}
const copyFields = value => ({ title: value.title, description: value.description, date: value.date, startTime: value.startTime, endTime: value.endTime, roomId: value.roomId, attendees: String(value.attendees), requiredEquipment: [...value.requiredEquipment], noteId: value.noteId });
const today = localDate();
const meetings = [
  { id: 'harbor-planning', title: 'Harbor planning meeting', description: 'Agree the next project steps and record decisions.', date: today, startTime: '09:00', endTime: '10:00', roomId: 'harbor', attendees: 6, requiredEquipment: ['whiteboard'], noteId: 'harbor-kickoff' },
  { id: 'research-conversation', title: 'Research check-in', description: 'Compare research notes and identify open questions.', date: today, startTime: '11:00', endTime: '11:45', roomId: 'focus', attendees: 3, requiredEquipment: ['video'], noteId: 'harbor-research-checkin' },
  { id: 'weekly-decisions', title: 'Project decision review', description: 'Review decisions that need follow-up.', date: addDays(today, 1), startTime: '10:00', endTime: '11:00', roomId: 'harbor', attendees: 7, requiredEquipment: ['screen'], noteId: 'harbor-note-structure' },
  { id: 'workshop-preparation', title: 'Workshop preparation', description: 'Check the shared agenda before the workshop.', date: addDays(today, 3), startTime: '14:00', endTime: '15:30', roomId: 'workshop', attendees: 10, requiredEquipment: ['whiteboard', 'video'], noteId: 'harbor-meeting-template' },
].map(item => ({ ...item, status: 'scheduled', version: 1, updatedAt: new Date().toISOString() }));
export const meetingDrafts = new Map();
export const meetingErrors = new Map();
let initialNewDraft;
export function getCalendarEvents() {
  return meetings.map(item => ({ ...item, requiredEquipment: [...item.requiredEquipment] }));
}
export function getMeeting(id) {
  return getCalendarEvents().find(item => item.id === id);
}
export function getMeetingDraft(id = 'new') {
  if (!meetingDrafts.has(id)) {
    const saved = meetings.find(item => item.id === id);
    if (!saved && id !== 'new') return null;
    const fields = saved ? copyFields(saved) : { title: '', description: '', date: addDays(localDate(), 1), startTime: '09:00', endTime: '10:00', roomId: 'harbor', attendees: '2', requiredEquipment: [], noteId: '' };
    meetingDrafts.set(id, fields);
    if (id === 'new') initialNewDraft = JSON.stringify(fields);
  }
  return meetingDrafts.get(id);
}
export function isMeetingDirty(id) {
  const draft = meetingDrafts.get(id);
  const saved = meetings.find(item => item.id === id);
  return Boolean(draft && JSON.stringify(draft) !== (id === 'new' ? initialNewDraft : saved ? JSON.stringify(copyFields(saved)) : ''));
}
export function discardMeetingDraft(id) { meetingDrafts.delete(id); meetingErrors.delete(id); }

export function roomConflicts(roomId, date, startTime, endTime, exceptId) {
  const start = minute(startTime), end = minute(endTime);
  // Endpoints may touch: 09:00–10:00 and 10:00–11:00 are separate bookings.
  return getCalendarEvents().filter(item => item.status === 'scheduled' && item.id !== exceptId && item.roomId === roomId && item.date === date && minute(item.startTime) < end && minute(item.endTime) > start);
}
function matchesRoom(room, fields) {
  return room.capacity >= Number(fields.attendees) && fields.requiredEquipment.every(key => room.equipment.includes(key));
}
export function validateMeeting(fields) {
  const errors = {};
  if (typeof fields?.title !== 'string' || !fields.title.trim() || fields.title.trim().length > 120) errors.title = 'Enter a meeting title from 1 to 120 characters.';
  if (typeof fields?.description !== 'string' || fields.description.length > 2000) errors.description = 'Use up to 2,000 characters for the meeting purpose.';
  const date = typeof fields?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fields.date) ? new Date(`${fields.date}T12:00:00`) : null;
  if (!date || !Number.isFinite(+date) || localDate(date) !== fields.date) errors.date = 'Choose a real calendar date.';
  else if (fields.date < localDate() || fields.date > addDays(localDate(), 365)) errors.date = 'Choose today or a date within the next 365 days.';
  const start = minute(fields?.startTime), end = minute(fields?.endTime);
  if (!Number.isFinite(start) || start < 480 || start >= 1080) errors.startTime = 'Choose a start time from 08:00 until before 18:00.';
  if (!Number.isFinite(end) || end > 1080 || end <= 480) errors.endTime = 'Choose an end time after 08:00 and no later than 18:00.';
  else if (Number.isFinite(start) && (end - start < 15 || end - start > 480)) errors.endTime = 'End at least 15 minutes after the start, within the same day. The maximum duration is 8 hours.';
  const room = rooms.find(item => item.id === fields?.roomId);
  if (!room) errors.roomId = 'Choose an available room.';
  if (!/^\d+$/.test(String(fields?.attendees ?? '')) || Number(fields.attendees) < 1 || Number(fields.attendees) > 12) errors.attendees = 'Enter 1 to 12 people. The largest room holds 12.';
  else if (room && Number(fields.attendees) > room.capacity) errors.attendees = `${room.name} holds ${room.capacity} people. Choose a larger room or reduce the number of people.`;
  if (!Array.isArray(fields?.requiredEquipment) || fields.requiredEquipment.some(key => !Object.hasOwn(equipmentNames, key))) errors.requiredEquipment = 'Choose equipment from the listed options.';
  else if (room && !fields.requiredEquipment.every(key => room.equipment.includes(key))) errors.roomId = `${room.name} does not have all the selected equipment. Choose a room that does.`;
  if (typeof fields?.noteId !== 'string' || (fields.noteId && !notes.some(note => note.id === fields.noteId && note.status !== 'trash'))) errors.noteId = 'Choose an available meeting note, or leave this unlinked.';
  return errors;
}
export function findAlternatives(fields, exceptId) {
  const start = minute(fields.startTime), end = minute(fields.endTime);
  const errors = validateMeeting(fields);
  if (['date', 'startTime', 'endTime', 'requiredEquipment'].some(key => errors[key]) || !Number.isFinite(start) || !Number.isFinite(end)) return [];
  const choices = rooms.filter(room => room.id !== fields.roomId && matchesRoom(room, fields) && !roomConflicts(room.id, fields.date, fields.startTime, fields.endTime, exceptId).length)
    .map(room => ({ roomId: room.id, date: fields.date, startTime: fields.startTime, endTime: fields.endTime }));
  const room = rooms.find(item => item.id === fields.roomId);
  if (room && matchesRoom(room, fields)) {
    for (let candidate = end; candidate + end - start <= 1080 && choices.length < 3; candidate += 15) {
      const from = time(candidate), to = time(candidate + end - start);
      if (!roomConflicts(room.id, fields.date, from, to, exceptId).length) { choices.push({ roomId: room.id, date: fields.date, startTime: from, endTime: to }); break; }
    }
  }
  return choices.slice(0, 3);
}
export function saveMeeting(id = 'new') {
  const fields = getMeetingDraft(id);
  const saved = meetings.find(item => item.id === id);
  if (!fields) return { ok: false, errors: { title: 'This meeting is no longer available.' } };
  if (saved?.status === 'cancelled') return { ok: false, errors: { title: 'This meeting is cancelled. Restore its reservation before editing it.' } };
  const errors = validateMeeting(fields);
  const conflicts = Object.keys(errors).length ? [] : roomConflicts(fields.roomId, fields.date, fields.startTime, fields.endTime, id);
  if (conflicts.length) errors.roomId = 'This room is already reserved during the proposed time. Choose another room or time below; your draft has not been saved.';
  if (Object.keys(errors).length) { meetingErrors.set(id, errors); return { ok: false, errors, conflicts, alternatives: findAlternatives(fields, id) }; }
  const unchanged = saved && !isMeetingDirty(id);
  const meeting = saved || { id: `meeting-${crypto.randomUUID()}`, version: 0 };
  if (!unchanged) {
    Object.assign(meeting, copyFields(fields), { title: fields.title.trim(), attendees: Number(fields.attendees), status: 'scheduled', version: meeting.version + 1, updatedAt: new Date().toISOString() });
    if (!saved) meetings.push(meeting);
    recordEvent({ description: `${saved ? 'Changed' : 'Reserved'} “${meeting.title}” in ${rooms.find(room => room.id === meeting.roomId).name}, ${meeting.date} ${meeting.startTime}–${meeting.endTime}.`, subject: meeting.title, version: meeting.version, action: 'The saved reservation now holds this room and time.', href: `#meeting/${meeting.id}`, actionLabel: 'Review meeting reservation' });
  }
  discardMeetingDraft(id);
  return { ok: true, meeting: getMeeting(meeting.id), unchanged: Boolean(unchanged) };
}
export function cancelMeeting(id) {
  const meeting = meetings.find(item => item.id === id);
  if (!meeting) return { ok: false, errors: { title: 'This meeting is unavailable.' } };
  if (meeting.status !== 'cancelled') {
    meeting.status = 'cancelled'; meeting.version++; meeting.updatedAt = new Date().toISOString();
    recordEvent({ description: `Cancelled “${meeting.title}”. Its room is available again; the meeting record and unsaved draft remain.`, subject: meeting.title, action: 'Restore the original reservation if the room is still free, or copy it to a new meeting.', href: `#meeting/${id}`, actionLabel: 'Review cancelled meeting' });
  }
  return { ok: true };
}
export function restoreMeeting(id) {
  const meeting = meetings.find(item => item.id === id);
  if (!meeting || meeting.status !== 'cancelled') return { ok: false, errors: { title: 'Choose a cancelled meeting to restore.' } };
  const errors = validateMeeting(copyFields(meeting));
  const conflicts = roomConflicts(meeting.roomId, meeting.date, meeting.startTime, meeting.endTime, id);
  if (conflicts.length) errors.roomId = 'The original room and time are now reserved. Copy this meeting to a new draft to choose another slot.';
  if (Object.keys(errors).length) return { ok: false, errors, conflicts };
  meeting.status = 'scheduled'; meeting.version++; meeting.updatedAt = new Date().toISOString();
  recordEvent({ description: `Restored the room reservation for “${meeting.title}”.`, subject: meeting.title, action: 'The original room and time are reserved again. Unsaved edits remain separate.', href: `#meeting/${id}`, actionLabel: 'Review restored reservation' });
  return { ok: true };
}
export function prepareNewMeeting(fields, replace = false) {
  if (isMeetingDirty('new') && !replace) return { ok: false, confirmationRequired: true };
  // AUDHD-05/06: replacement is explicit. Start from a fresh draft so omitted
  // fields cannot leak the previous meeting's title, note or requirements.
  if (replace) discardMeetingDraft('new');
  getMeetingDraft('new');
  Object.assign(meetingDrafts.get('new'), fields);
  meetingErrors.delete('new');
  return { ok: true };
}
export function simulateRoomTaken(id) {
  const fields = getMeetingDraft(id);
  if (Object.keys(validateMeeting(fields)).length || roomConflicts(fields.roomId, fields.date, fields.startTime, fields.endTime).length) return { ok: false };
  const meeting = { ...copyFields(fields), title: 'Simulated competing reservation', noteId: '', attendees: 1, id: `meeting-${crypto.randomUUID()}`, version: 1, status: 'scheduled', updatedAt: new Date().toISOString() };
  // AUDHD-07/12: this is an explicit fixture mutation, not a claim of a live
  // colleague's activity. Save still uses the same overlap check as normal use.
  meetings.push(meeting);
  recordEvent({ level: 'warning', description: 'Guide demonstration: another simulated booking took the proposed room and time. The current meeting draft remains unchanged.', action: 'Choose another room or time, then save to check availability again.', href: `#${id === 'new' ? 'calendar/new' : `meeting/${id}`}/roomId`, actionLabel: 'Review affected meeting draft' });
  return { ok: true };
}
