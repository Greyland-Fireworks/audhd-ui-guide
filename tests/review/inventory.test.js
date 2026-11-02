import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareInventories } from '../../scripts/review-inventory.mjs';
const baseline = { schemaVersion: 1, states: [{ id: 'task', visited: true }], capabilities: [{ id: 'return', state: 'task', route: '#task', role: 'link', name: 'Return to task', destination: '#task', form: null, behavior: ['return-check'] }] };
test('removals, forms and unavailable states block; renaming needs review; additions do not offset loss', () => {
  const after = structuredClone(baseline); after.capabilities[0].name = 'Back to task';
  assert.equal(compareInventories(baseline, after).status, 'Pending');
  after.capabilities[0].form = 'different-form'; assert.equal(compareInventories(baseline, after).status, 'Fail');
  after.capabilities = [{ ...baseline.capabilities[0], id: 'new-action' }]; assert.equal(compareInventories(baseline, after).status, 'Fail');
  assert.equal(compareInventories(baseline, after, [{ id: 'return', reason: 'User removed this task', authorization: 'request-123' }]).status, 'Pass');
  after.states = []; assert.equal(compareInventories(baseline, after, [{ id: 'return', reason: 'Scoped removal', authorization: 'request-123' }]).status, 'Pending');
});
