import { test } from 'node:test';
import assert from 'node:assert/strict';
import { definitions, initial, attach, assess, reopen, canHide, day } from '../../scripts/review-core.js';
import { contract, identity, now, evidence, complete } from './fixtures.js';
test('required methods, identity, phase ordering and applicability cannot be bypassed', () => {
  const record = initial(identity, now), d = definitions[0], e = evidence(d, 'rendered');
  assert.equal(assess(record, identity, now).gates[0].status, 'Pending');
  for (const change of [{ checkId: 'unrelated' }, { build: 'x' }, { method: 'source inspection' }, { artifacts: [] }, { observedAt: new Date(now + 1).toISOString() }]) assert.throws(() => attach(record, d.id, 'rendered', { ...e, ...change }, now));
  assert.throws(() => attach(record, d.id, 'automated', e, now));
  assert.throws(() => attach(record, 'workflow', 'rendered', evidence(definitions[1], 'rendered'), now));
  assert.throws(() => initial({ ...identity, contract: { ...contract, mutations: { applicable: false, reason: 'No backend available' } } }, now));
  const readonly = structuredClone(contract); readonly.mode = 'read-only'; readonly.mutationTasks = [];
  for (const k of ['mutations', 'durableRecovery', 'concurrentWrites']) readonly[k] = { applicable: false, reason: 'This declared task only reads local data.' };
  const readIdentity = { ...identity, contract: readonly };
  assert.equal(assess(initial(readIdentity, now), readIdentity, now).checks.find(c => c.id === 'missing-receipt').status, 'Not applicable');
});
test('clock, reload, rollback, future timestamp, exact boundary and reopening', () => {
  const record = complete();
  assert.equal(canHide(record, identity, now + day - 1), false);
  assert.equal(canHide(JSON.parse(JSON.stringify(record)), identity, now + day), true);
  assert.equal(assess(record, identity, now + day * 2).allPassedAt, record.allPassedAt);
  assert.equal(canHide(record, identity, now - 1), false);
  assert.equal(canHide({ ...record, allPassedAt: new Date(now + day).toISOString() }, identity, now), false);
  assert.equal(canHide(record, { ...identity, build: 'd'.repeat(64) }, now + day), false);
  const reopened = assess(reopen(record, 'C', 'Recovery changed', now + day), identity, now + day);
  assert.deepEqual(reopened.gates.map(g => g.status), ['Pass', 'Pass', 'Pending', 'Pending', 'Pending']);
  assert.equal(reopened.allPassedAt, null);
  const reassessed = attach(record, 'paths', 'rendered', evidence(definitions[0], 'rendered', now + day), now + day);
  assert.equal(assess(reassessed, identity, now + day).gates[1].status, 'Pending');
  assert.ok(reassessed.history.length);
});
test('legacy, incomplete results and absent checks cannot light current gates', () => {
  const good = complete();
  assert.ok(assess({ build: identity.build, gates: [] }, identity, now).issue);
  for (const change of [{ exitCode: 1 }, { timedOut: true }, { runStatus: 'skipped' }, { invalidReason: 'Artifact missing' }]) {
    const record = structuredClone(good);
    Object.assign(record.checks.find(c => c.id === 'navigation').evidence.automated, change);
    assert.equal(assess(record, identity, now).gates[1].status, 'Pending');
    assert.equal(canHide(record, identity, now + day), false);
  }
  const missing = structuredClone(good); missing.checks.splice(3, 1);
  assert.ok(assess(missing, identity, now).issue);
  const retrospective = attach(initial(identity, now), 'paths', 'rendered', evidence(definitions[0], 'rendered'), now);
  assert.throws(() => attach(retrospective, 'workflow', 'rendered', { ...evidence(definitions[1], 'rendered'), timing: 'retrospective' }, now));
});

test('recovery task omissions, incomplete scenarios and control-only coverage cannot pass', () => {
  const good = complete();
  for (const id of ['lost-response', 'acknowledged-read', 'missing-receipt', 'reload']) {
    const d = definitions.find(d => d.id === id);
    const e = evidence(d, 'automated');
    e.taskResults.pop();
    assert.throws(() => attach(good, id, 'automated', e, now), /Every declared task/);
    const partial = evidence(d, 'automated');
    delete partial.taskResults[0].scenarios[Object.keys(partial.taskResults[0].scenarios)[0]];
    assert.throws(() => attach(good, id, 'automated', partial, now), /remain unverified/);
  }
  const coverage = evidence(definitions.find(d => d.id === 'coverage'), 'automated');
  coverage.coverage[0].local = 'Pending';
  assert.throws(() => attach(good, 'coverage', 'automated', coverage, now), /remain unverified/);
  const external = structuredClone(good); external.contract.coverage[0].required = 'external';
  assert.equal(assess(external, {...identity, contract: external.contract}, now).gates[3].status, 'Pending');
  assert.throws(() => initial({...identity, contract: {...contract, existingInterface: {applicable: false, reason: 'Started from scratch'}}}, now), /Repair stages/);
});
