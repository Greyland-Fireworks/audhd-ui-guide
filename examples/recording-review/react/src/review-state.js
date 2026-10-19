import { recordings, copy } from '../../shared/fixtures.js';

// These transitions supply the meaning behind the formatted review and save cues.
// Keep them independent from Svelte: the reference comparison shares observable
// outcomes, not a state engine. Functions return new state without DOM effects;
// the component handles focus only after React renders the resulting identity.

export const sameReview = (a, b) => a.status === b.status && a.note === b.note;

export function createReviewState() {
  // Per-ID drafts outlive their visible cards. A filter, layout change or selection
  // switch must never transfer edits to a different recording or erase them.
  return {
    nextAttempt: 1,
    announcement: '',
    reviews: Object.fromEntries(recordings.map(({ id }) => [id, {
      draft: { status: 'Not reviewed', note: '' },
      saved: { status: 'Not reviewed', note: '' },
      savedRevision: 0,
      pending: null,
      outcome: null,
    }])),
  };
}

export function editReview(state, id, field, value) {
  const review = state.reviews[id];
  const draft = { ...review.draft, [field]: value };
  return { ...state, reviews: { ...state.reviews, [id]: {
    ...review, draft,
    outcome: sameReview(draft, review.saved) && review.outcome === 'failed' ? null : review.outcome,
  } } };
}

export function startSave(state, id) {
  // Guard here as well as in the disabled button: appearance alone cannot prevent
  // duplicate attempts. Capture a detached snapshot so editing can continue while
  // the UI truthfully distinguishes pending content from newer unsaved work.
  const review = state.reviews[id];
  if (review.pending || sameReview(review.draft, review.saved)) return state;
  return {
    ...state,
    nextAttempt: state.nextAttempt + 1,
    announcement: `${id}: Saving review.`,
    reviews: { ...state.reviews, [id]: {
      ...review,
      pending: { attemptId: state.nextAttempt, snapshot: { ...review.draft } },
      outcome: null,
    } },
  };
}

export function resolveSave(state, id, attemptId, outcome) {
  // Resolve the originating record/attempt, not the currently displayed panel.
  // A stale response must not update another context or replay its announcement.
  // Only the submitted snapshot becomes saved; the current draft stays intact.
  const review = state.reviews[id];
  if (!review?.pending || review.pending.attemptId !== attemptId) return state;
  if (outcome !== 'saved' && outcome !== 'failed') return state;
  const saved = outcome === 'saved' ? { ...review.pending.snapshot } : review.saved;
  const next = {
    ...review, saved, pending: null,
    savedRevision: review.savedRevision + (outcome === 'saved' ? 1 : 0),
    outcome: outcome === 'failed' && sameReview(review.draft, saved) ? null : outcome,
  };
  return {
    ...state,
    reviews: { ...state.reviews, [id]: next },
    announcement: `${id}: ${reviewFeedback(next)}`,
  };
}

export function reviewFeedback(review) {
  // Derive wording from actual content and acknowledgment. A green treatment or
  // resolved promise alone cannot justify "Saved" while newer edits remain.
  const dirty = !sameReview(review.draft, review.saved);
  if (review.pending) {
    return sameReview(review.draft, review.pending.snapshot)
      ? 'Saving review.' : 'Saving earlier edits; newer changes are not saved.';
  }
  if (review.outcome === 'failed' && dirty) return copy.failed;
  if (dirty) return review.outcome === 'saved'
    ? 'Earlier edits saved; newer changes are not saved.' : 'Unsaved changes.';
  return review.savedRevision > 0 ? 'Saved in this demo.' : 'No unsaved changes.';
}

export function filterRecordings(query) {
  const term = query.trim().toLowerCase();
  return recordings.filter(record =>
    [record.name, record.date, record.map, record.seed, record.id]
      .some(value => value.toLowerCase().includes(term)));
}
