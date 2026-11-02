import assert from 'node:assert/strict';
import { captureInventory, compareInventories } from '../../scripts/review-inventory.mjs';
const baseURL = process.argv[2];
const config = suffix => ({ baseURL, states: [{ id: 'harbor', route: `/tests/fixtures/harbor-inventory.html${suffix}`, synthetic: true, capabilities: ['navigation', 'recovery', 'return'].map(id => ({ id, selector: `[data-capability="${id}"]`, behavior: ['Harbor behavioral suite remains separately required'] })) }] });
const before = await captureInventory(config(''), 'fixture-before');
assert.equal(before.capabilities.length, 3);
for (const id of ['navigation', 'recovery', 'return']) {
  const result = compareInventories(before, await captureInventory(config(`?remove=${id}`), 'fixture-after'));
  assert.equal(result.status, 'Fail'); assert.ok(result.findings.some(f => f.id === id && f.severity === 'blocking'));
}
assert.equal(compareInventories(before, await captureInventory(config('?rename'), 'fixture-after')).status, 'Pending');
console.log('PASS: synthetic Harbor navigation, recovery and named-return removals detected; renaming requires review. Behavior is verified separately.');
