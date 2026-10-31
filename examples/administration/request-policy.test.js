import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequestPolicy, createExportRequestService } from './request-policy.js';

const setup = () => {
  let time = 100000, allowed = true;
  const now = () => time;
  const policy = createRequestPolicy({ now, canConfigure: () => allowed });
  const service = createExportRequestService({ policy, now, delay: async () => {} });
  return { policy, service, advance: ms => { time += ms; }, restrict: value => { allowed = !value; } };
};
const preset = { enabled: true, capacity: 2, intervalMs: 10000 };

test('default allowance, exhaustion, complete-period replenishment and full-cap behavior', () => {
  const { policy, advance } = setup();
  assert.equal(policy.snapshot().capacity, 60);
  assert.equal(policy.snapshot().intervalMs, 5000);
  policy.save(preset);
  assert.equal(policy.consume().remaining, 1);
  assert.equal(policy.consume().remaining, 0);
  assert.equal(policy.consume().allowed, false);
  advance(9999); assert.equal(policy.snapshot().remaining, 0);
  advance(1); assert.equal(policy.snapshot().remaining, 1);
  advance(100000); assert.equal(policy.snapshot().remaining, 2);
  policy.consume(); policy.consume();
  assert.equal(policy.consume().allowed, false, 'Time at full capacity cannot buy another request');
});

test('saving settles the old policy, caps decreases and never grants a capacity increase bonus', () => {
  const { policy, advance } = setup();
  policy.save(preset); policy.consume(); policy.consume();
  advance(15000);
  const changed = policy.save({ ...preset, capacity: 5, intervalMs: 20000 });
  assert.equal(changed.remaining, 1);
  advance(19999); assert.equal(policy.snapshot().remaining, 1);
  advance(1); assert.equal(policy.snapshot().remaining, 2);
  assert.equal(policy.save({ ...preset, capacity: 1 }).remaining, 1);
  policy.consume(); advance(5000); policy.save({ ...preset, capacity: 1 });
  advance(5000); assert.equal(policy.snapshot().remaining, 1, 'An unchanged save preserves replenishment progress');
});

test('disabled policy bypasses spending, retains values and explicitly resets on re-enable', () => {
  const { policy } = setup();
  policy.save(preset); policy.consume();
  assert.equal(policy.save({ ...preset, enabled: false }).remaining, 1);
  assert.equal(policy.consume().consumed, false);
  assert.equal(policy.snapshot().capacity, 2);
  assert.equal(policy.save(preset).resetAllowance, true);
  assert.equal(policy.snapshot().remaining, 2);
});

test('read-only mutation guard rejects policy changes even without a view', () => {
  const { policy, restrict } = setup();
  restrict(true);
  assert.equal(policy.save(preset).restricted, true);
  assert.equal(policy.snapshot().capacity, 60);
  restrict(false);
  assert.equal(policy.save(preset).ok, true);
});

test('rejections and pre-acceptance failures cost nothing; accepted IDs are idempotent', async () => {
  const { policy, service } = setup(); policy.save(preset);
  assert.equal((await service.submit({ id: 'rejected', name: 'Rejected' }, 'reject')).rejected, true);
  await assert.rejects(service.submit({ id: 'absent', name: 'Absent' }, 'lost-before'));
  assert.equal(policy.snapshot().remaining, 2);
  const accepted = await service.submit({ id: 'first', name: 'Original' });
  assert.equal(policy.snapshot().remaining, 1);
  assert.strictEqual(await service.submit({ id: 'first', name: 'Newer draft' }, 'lost-before'), accepted);
  assert.equal(service.count(), 1);
  assert.equal(policy.snapshot().remaining, 1);
  assert.equal(service.lookup('first').name, 'Original');
});

test('lost accepted response is discoverable, consumes once, and exhaustion recovers explicitly', async () => {
  const { policy, service, advance } = setup(); policy.save(preset);
  await assert.rejects(service.submit({ id: 'lost', name: 'Lost reply' }, 'lost-after'));
  assert.equal(service.lookup('lost').name, 'Lost reply');
  assert.equal(policy.snapshot().remaining, 1);
  await service.submit({ id: 'second', name: 'Second' });
  const result = await service.submit({ id: 'waiting', name: 'Waiting' });
  assert.equal(result.limited, true); assert.equal(result.nextEligibleAt, 110000);
  assert.equal(service.count(), 2); assert.equal(service.lookup('waiting'), undefined);
  advance(10000);
  assert.equal(service.count(), 2, 'Clock movement never retries a request');
  await service.submit({ id: 'waiting', name: 'Waiting' });
  assert.equal(service.count(), 3); assert.equal(policy.snapshot().remaining, 0);
});

test('workspace reset cannot accept a request whose response arrives from the old fixture', async () => {
  const { policy } = setup(); let finish;
  const service = createExportRequestService({ policy, delay: () => new Promise(resolve => { finish = resolve; }) });
  const pending = service.submit({ id: 'old', name: 'Old workspace' });
  service.reset(); policy.reset(); finish();
  assert.equal((await pending).cancelled, true);
  assert.equal(service.count(), 0); assert.equal(policy.snapshot().remaining, 60);
});
