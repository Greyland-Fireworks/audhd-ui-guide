import { recordings, copy } from '../../shared/fixtures.js';

// This reference mutates its own Svelte-proxied workspace. No React transitions
// or shared state engine are imported; only static comparison inputs are shared.
// State gives the UI's context and save cues their meaning. Keep DOM/focus work in
// the component, after Svelte has rendered the result of these local operations.
export function createWorkspace() {
  // Keep drafts keyed by domain ID, outside any filtered/conditional card. Layout
  // changes and record switching must not erase work or attach it to another item.
  const records = {};
  for (const recording of recordings) {
    records[recording.id] = {
      draft: { status: 'Not reviewed', note: '' },
      confirmed: { status: 'Not reviewed', note: '' },
      version: 0,
      attempt: null,
      lastResult: null,
    };
  }
  return { records, nextToken: 1, announcement: '' };
}

function equalContent(left, right) {
  return left.note === right.note && left.status === right.status;
}

export function isDirty(review) {
  return !equalContent(review.draft, review.confirmed);
}

export function updateDraft(workspace, id, field, value) {
  const review = workspace.records[id];
  review.draft[field] = value;
  if (!isDirty(review) && review.lastResult === 'failed') review.lastResult = null;
}

export function requestSave(workspace, id) {
  // The model guard backs up the disabled button. The separate submitted content
  // lets the editor remain usable while feedback identifies which edits are pending.
  const review = workspace.records[id];
  if (review.attempt || !isDirty(review)) return null;
  const token = workspace.nextToken++;
  review.attempt = {
    token,
    // Copy primitive fields; never keep a reference to the live draft proxy.
    content: { status: review.draft.status, note: review.draft.note },
  };
  review.lastResult = null;
  workspace.announcement = `${id}: Saving review.`;
  return token;
}

export function settleSave(workspace, id, token, succeeded) {
  // A response belongs to its original record/attempt, even if another panel is
  // now current. Ignore stale tokens without announcing a false change. Success
  // confirms the captured content, never overwrites a newer draft with that copy.
  const review = workspace.records[id];
  if (!review?.attempt || review.attempt.token !== token) return false;
  if (typeof succeeded !== 'boolean') return false;
  if (succeeded) {
    const { status, note } = review.attempt.content;
    review.confirmed = { status, note };
    review.version += 1;
  }
  review.attempt = null;
  review.lastResult = succeeded ? 'saved' : isDirty(review) ? 'failed' : null;
  workspace.announcement = `${id}: ${feedbackFor(review)}`;
  return true;
}

export function feedbackFor(review) {
  // Visible feedback is derived from content and acknowledgment, not a cosmetic
  // success flag. This distinction also feeds the scoped status announcement.
  if (review.attempt) {
    return equalContent(review.draft, review.attempt.content)
      ? 'Saving review.'
      : 'Saving earlier edits; newer changes are not saved.';
  }
  if (!isDirty(review)) return review.version ? 'Saved in this demo.' : 'No unsaved changes.';
  if (review.lastResult === 'failed') return copy.failed;
  if (review.lastResult === 'saved') return 'Earlier edits saved; newer changes are not saved.';
  return 'Unsaved changes.';
}

export function matchingRecordings(query) {
  const normalized = query.trim().toLowerCase();
  return recordings.filter(({ id, name, date, map, seed }) =>
    [id, name, date, map, seed].some(text => text.toLowerCase().includes(normalized)));
}
