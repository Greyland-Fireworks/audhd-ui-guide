import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspace, feedbackFor, isDirty, matchingRecordings, requestSave, settleSave, updateDraft } from '../src/review-workspace.js';

test('REF-02: search the declared metadata fields and retain fixture order', () => {
  const cases = [[' market ', 'REC-002'], ['2026-01-17', 'REC-003'], ['303', 'REC-003'], ['rec-002', 'REC-002']];
  for (const [query, id] of cases) assert.deepEqual(matchingRecordings(query).map(item => item.id), [id]);
  assert.deepEqual(matchingRecordings(' ').map(item => item.id), ['REC-001', 'REC-002', 'REC-003']);
  assert.deepEqual(matchingRecordings('Reviewed'), []);
});

test('REF-07–10: mutable workspace keeps snapshots detached and responses scoped', () => {
  const workspace = createWorkspace();
  const harbor = workspace.records['REC-001'];
  const untouched = structuredClone(workspace.records['REC-003']);
  assert.equal(requestSave(workspace, 'REC-001'), null);
  updateDraft(workspace, 'REC-001', 'note', 'First');
  const first = requestSave(workspace, 'REC-001');
  assert.notEqual(harbor.attempt.content, harbor.draft);
  assert.equal(requestSave(workspace, 'REC-001'), null);
  updateDraft(workspace, 'REC-001', 'note', 'Second');
  assert.match(feedbackFor(harbor), /Saving earlier edits/);
  updateDraft(workspace, 'REC-002', 'status', 'Reviewed');
  const other = requestSave(workspace, 'REC-002');
  assert.notEqual(first, other);
  assert.equal(settleSave(workspace, 'REC-002', other, true), true);
  assert.equal(settleSave(workspace, 'REC-001', first, true), true);
  assert.equal(harbor.confirmed.note, 'First');
  assert.equal(harbor.draft.note, 'Second');
  assert.equal(harbor.version, 1);
  assert.equal(workspace.records['REC-002'].confirmed.status, 'Reviewed');
  assert.deepEqual(workspace.records['REC-003'], untouched);
  assert.match(feedbackFor(harbor), /Earlier edits saved/);

  const next = requestSave(workspace, 'REC-001');
  const beforeStale = structuredClone(workspace);
  assert.equal(settleSave(workspace, 'REC-001', first, true), false);
  assert.equal(settleSave(workspace, 'REC-001', first, false), false);
  assert.deepEqual(workspace, beforeStale, 'stale replies change neither state nor announcements');
  assert.equal(settleSave(workspace, 'REC-001', next, true), true);
  assert.equal(harbor.confirmed.note, 'Second');
  assert.equal(harbor.version, 2);
  assert.equal(isDirty(harbor), false);
  assert.equal(feedbackFor(harbor), 'Saved in this demo.');
});

test('REF-08,11,16: failure, current-content retry, exact revert and fresh reset', () => {
  const workspace = createWorkspace();
  const harbor = workspace.records['REC-001'];
  updateDraft(workspace, 'REC-001', 'note', 'Unsent');
  let token = requestSave(workspace, 'REC-001');
  settleSave(workspace, 'REC-001', token, false);
  assert.equal(harbor.confirmed.note, '');
  assert.equal(harbor.draft.note, 'Unsent');
  assert.equal(harbor.version, 0);
  assert.match(feedbackFor(harbor), /Save failed/);
  updateDraft(workspace, 'REC-001', 'note', 'Current retry');
  token = requestSave(workspace, 'REC-001');
  settleSave(workspace, 'REC-001', token, true);
  assert.equal(harbor.confirmed.note, 'Current retry');
  assert.equal(harbor.version, 1);
  updateDraft(workspace, 'REC-001', 'status', 'Needs follow-up');
  token = requestSave(workspace, 'REC-001');
  settleSave(workspace, 'REC-001', token, false);
  updateDraft(workspace, 'REC-001', 'status', 'Not reviewed');
  assert.equal(harbor.lastResult, null);
  assert.equal(isDirty(harbor), false);
  assert.equal(requestSave(workspace, 'REC-001'), null);
  updateDraft(workspace, 'REC-001', 'note', 'Revert before failure');
  token = requestSave(workspace, 'REC-001');
  updateDraft(workspace, 'REC-001', 'note', 'Current retry');
  settleSave(workspace, 'REC-001', token, false);
  assert.equal(harbor.lastResult, null);
  assert.equal(harbor.version, 1);
  const fresh = createWorkspace();
  assert.equal(fresh.records['REC-001'].draft.note, '');
  assert.equal(fresh.records['REC-001'].version, 0);
  assert.equal(fresh.nextToken, 1);
});

// The same location contract is exercised against each independently written parser.
import { parseLocation } from '../src/navigation.js';
test('NAV-01: valid direct destinations and explicit unknown-location recovery', () => {
  assert.deepEqual(parseLocation(''), { page: 'recording', id: 'REC-001', view: 'review' });
  for (const page of ['workspace', 'recordings', 'preferences']) assert.deepEqual(parseLocation('#' + page), { page });
  assert.deepEqual(parseLocation('#recordings/REC-002'), { page: 'recording', id: 'REC-002', view: 'review' });
  assert.deepEqual(parseLocation('#recordings/REC-003/details'), { page: 'recording', id: 'REC-003', view: 'details' });
  for (const invalid of ['#unknown', '#recordings/REC-999/review', '#recordings/REC-001/unknown', '#recordings/REC-001/', '#recordings/REC-001/review/extra', '#recordings/%/review']) {
    assert.deepEqual(parseLocation(invalid), { page: 'missing' }, invalid);
  }
});
