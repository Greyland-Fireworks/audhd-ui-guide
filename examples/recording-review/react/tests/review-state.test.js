import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewState, editReview, filterRecordings, resolveSave, reviewFeedback, startSave } from '../src/review-state.js';

test('REF-02: trim, case-insensitive metadata search and fixture order', () => {
  for (const [query, id] of [[' market ', 'REC-002'], ['2026-01-17', 'REC-003'], ['303', 'REC-003'], ['rec-002', 'REC-002']]) {
    assert.deepEqual(filterRecordings(query).map(r => r.id), [id]);
  }
  assert.deepEqual(filterRecordings('').map(r => r.id), ['REC-001', 'REC-002', 'REC-003']);
  assert.deepEqual(filterRecordings('Reviewed'), []);
});

test('REF-07–11: detached snapshots, failure, retry, stale resolution and per-ID isolation', () => {
  let state = createReviewState();
  assert.equal(startSave(state, 'REC-001'), state, 'clean save is ignored');
  state = editReview(state, 'REC-001', 'note', 'First');
  const beforeSave = structuredClone(state);
  state = startSave(state, 'REC-001');
  assert.deepEqual(beforeSave.reviews['REC-001'].pending, null, 'pure transition');
  const first = state.reviews['REC-001'].pending.attemptId;
  assert.notEqual(state.reviews['REC-001'].pending.snapshot, state.reviews['REC-001'].draft);
  assert.equal(startSave(state, 'REC-001'), state, 'duplicate pending save is ignored');
  state = editReview(state, 'REC-001', 'note', 'Second');
  assert.match(reviewFeedback(state.reviews['REC-001']), /Saving earlier edits/);
  state = editReview(state, 'REC-002', 'status', 'Reviewed');
  state = startSave(state, 'REC-002');
  const second = state.reviews['REC-002'].pending.attemptId;
  assert.notEqual(first, second);
  const thirdRecord = structuredClone(state.reviews['REC-003']);
  state = resolveSave(state, 'REC-002', second, 'saved');
  state = resolveSave(state, 'REC-001', first, 'saved');
  assert.equal(state.reviews['REC-001'].saved.note, 'First');
  assert.equal(state.reviews['REC-001'].draft.note, 'Second');
  assert.equal(state.reviews['REC-001'].savedRevision, 1);
  assert.equal(state.reviews['REC-002'].saved.status, 'Reviewed');
  assert.deepEqual(state.reviews['REC-003'], thirdRecord);
  assert.match(reviewFeedback(state.reviews['REC-001']), /Earlier edits saved/);
  state = startSave(state, 'REC-001');
  const retry = state.reviews['REC-001'].pending.attemptId;
  assert.equal(resolveSave(state, 'REC-001', first, 'saved'), state, 'old acknowledgment cannot resolve new save');
  assert.equal(resolveSave(state, 'REC-001', first, 'failed'), state);
  state = resolveSave(state, 'REC-001', retry, 'failed');
  assert.equal(state.reviews['REC-001'].saved.note, 'First');
  assert.equal(state.reviews['REC-001'].draft.note, 'Second');
  assert.equal(state.reviews['REC-001'].savedRevision, 1);
  assert.match(reviewFeedback(state.reviews['REC-001']), /Save failed/);
  state = editReview(state, 'REC-001', 'note', 'First');
  assert.equal(state.reviews['REC-001'].outcome, null);
  assert.equal(startSave(state, 'REC-001'), state);
  state = editReview(state, 'REC-001', 'note', 'Current retry');
  state = startSave(state, 'REC-001');
  state = resolveSave(state, 'REC-001', state.reviews['REC-001'].pending.attemptId, 'saved');
  assert.equal(state.reviews['REC-001'].saved.note, 'Current retry');
  assert.equal(state.reviews['REC-001'].savedRevision, 2);
  assert.equal(reviewFeedback(state.reviews['REC-001']), 'Saved in this demo.');
});

test('REF-11,16: revert during a pending failure and fresh page reset', () => {
  let state = editReview(createReviewState(), 'REC-001', 'note', 'Temporary');
  state = startSave(state, 'REC-001');
  const attempt = state.reviews['REC-001'].pending.attemptId;
  state = editReview(state, 'REC-001', 'note', '');
  state = resolveSave(state, 'REC-001', attempt, 'failed');
  assert.equal(reviewFeedback(state.reviews['REC-001']), 'No unsaved changes.');
  assert.equal(state.reviews['REC-001'].savedRevision, 0);
  assert.deepEqual(createReviewState().reviews['REC-001'], state.reviews['REC-001']);
});

// The same location contract is exercised against each independently written parser.
import { routeFromHash } from '../src/navigation.js';
test('NAV-01: valid direct destinations and explicit unknown-location recovery', () => {
  assert.deepEqual(routeFromHash(''), { page: 'recording', id: 'REC-001', view: 'review' });
  for (const page of ['workspace', 'recordings', 'preferences']) assert.deepEqual(routeFromHash('#' + page), { page });
  assert.deepEqual(routeFromHash('#recordings/REC-002'), { page: 'recording', id: 'REC-002', view: 'review' });
  assert.deepEqual(routeFromHash('#recordings/REC-003/details'), { page: 'recording', id: 'REC-003', view: 'details' });
  for (const invalid of ['#unknown', '#recordings/REC-999/review', '#recordings/REC-001/unknown', '#recordings/REC-001/', '#recordings/REC-001/review/extra', '#recordings/%/review']) {
    assert.deepEqual(routeFromHash(invalid), { page: 'missing' }, invalid);
  }
});
