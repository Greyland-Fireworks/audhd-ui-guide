import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { loadConfig, initialize, readRecord, saveRecord, current, recordRendered, runCheck, checkedPath, latestMilestone } from '../../scripts/review-io.mjs';
import { main } from '../../scripts/review.mjs';
import { contract } from './fixtures.js';

async function fixture(t, mode = 'pass') {
  const root = await mkdtemp(join(tmpdir(), 'audhd-evidence-')); t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'source.txt'), 'source'); await writeFile(join(root, 'asset.svg'), '<svg/>');
  await copyFile(new URL('./fixture-adapter.mjs', import.meta.url), join(root, 'adapter.mjs'));
  const config = { root: '.', sources: ['source.txt', 'asset.svg', 'adapter.mjs'], task: 'Fixture', contract, record: 'output/review.json', identity: 'output/build.json', evidenceDir: 'output/evidence', adapters: Object.fromEntries(['navigation', 'lost-response', 'acknowledged-read', 'return-context', 'retained-data'].map(id => [id, { inputs: ['adapter.mjs'], executable: 'node', args: ['adapter.mjs', '{checkId}', '{build}', '{result}', mode], cwd: '.', timeoutMs: mode === 'timeout' ? 100 : 5000, result: 'result.json' }])) };
  const filename = join(root, 'config.json'); await writeFile(filename, JSON.stringify(config));
  const context = await loadConfig(filename); await initialize(context);
  return context;
}
async function rendered(context, id) {
  const path = `output/${id}.json`;
  await writeFile(join(context.root, path), JSON.stringify({ checkId: id, ...context.identity, method: 'self-review', reviewer: 'Synthetic reviewer', sequence: 'Fixture only', timing: 'before-reuse', observedAt: new Date().toISOString(), task: 'Fixture', route: '#fixture', observation: 'Synthetic observation', status: 'Pass', references: ['source.txt'] }));
  await recordRendered(context, id, path);
}
test('fingerprints select source/config/assets, exclude generated writes and reject missing/escaped inputs', async t => {
  const c = await fixture(t), build = c.identity.build;
  if (process.platform === 'win32') assert.ok(await checkedPath(c.root, join(c.root, 'source.txt').toLowerCase()));
  await writeFile(join(c.root, 'output/other.txt'), 'evidence');
  assert.equal((await loadConfig(c.filename)).identity.build, build);
  for (const name of ['source.txt', 'asset.svg']) { await writeFile(join(c.root, name), 'changed'); assert.notEqual((await loadConfig(c.filename)).identity.build, build); }
  const original = JSON.parse(await readFile(c.filename));
  await writeFile(c.filename, JSON.stringify({ ...original, identity: original.record }));
  await assert.rejects(loadConfig(c.filename), /distinct files/);
  await writeFile(c.filename, JSON.stringify({ ...original, task: 'Changed task' }));
  assert.notEqual((await loadConfig(c.filename)).identity.configHash, c.identity.configHash);
  for (const name of ['missing.txt', '../escape.txt', 'output/other.txt']) {
    await writeFile(c.filename, JSON.stringify({ ...original, sources: [name] }));
    await assert.rejects(loadConfig(c.filename));
  }
});
test('legacy history is preserved and concurrent replacement is rejected', async t => {
  const c = await fixture(t), legacy = '{"build":"old","freeText":"Historical only"}';
  await writeFile(join(c.root, c.config.record), legacy); await initialize(c);
  const saved = await readRecord(c);
  assert.equal(saved.record.schemaVersion, 2); assert.ok(saved.record.history[0].previousRecordHash);
  assert.equal((await current(c)).record.gates[0].status, 'Pending');
  await saveRecord(c, saved.record, saved.token);
  const latest = await readFile(join(c.root, c.config.record), 'utf8');
  await assert.rejects(saveRecord(c, saved.record, saved.token), /Concurrent/);
  assert.equal(await readFile(join(c.root, c.config.record), 'utf8'), latest);
  const concurrent = await readRecord(c);
  const attempts = await Promise.allSettled([saveRecord(c, structuredClone(concurrent.record), concurrent.token), saveRecord(c, structuredClone(concurrent.record), concurrent.token)]);
  assert.equal(attempts.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(attempts.filter(r => r.status === 'rejected').length, 1);
  assert.equal((await readRecord(c)).record.schemaVersion, 2);
});
test('runner requires its actual structured assertion; timeout, failure, skip and unrelated results cannot pass', async t => {
  for (const mode of ['pass', 'empty', 'wrong-id', 'fail', 'skipped', 'timeout']) {
    const c = await fixture(t, mode); await rendered(c, 'paths'); await rendered(c, 'workflow');
    await runCheck(c, 'navigation');
    const check = (await current(c)).record.checks.find(c => c.id === 'navigation');
    assert.equal(check.evidence.automated.status === 'Pass', mode === 'pass', mode);
    assert.notEqual(check.status, 'Pass', 'Combined outcome also requires rendered review');
    if (mode === 'pass') {
      await rendered(c, 'navigation'); assert.equal((await current(c)).record.gates[1].status, 'Pass');
      const artifact = (await current(c)).record.checks.find(c => c.id === 'navigation').evidence.automated.resultPath;
      await writeFile(join(c.root, artifact), '{}'); assert.equal((await current(c)).record.gates[1].status, 'Pending');
      await rm(join(c.root, artifact)); assert.equal((await current(c)).record.gates[1].status, 'Pending');
    }
  }
});
test('new builds require reassessment while preserving genuine earlier phase timing', async t => {
  const c = await fixture(t); await rendered(c, 'paths'); await rendered(c, 'workflow');
  await runCheck(c, 'navigation'); await rendered(c, 'navigation');
  const old = (await readRecord(c)).record;
  const priorPath = 'output/prior-milestone.json'; await writeFile(join(c.root, priorPath), JSON.stringify(old));
  await writeFile(join(c.root, 'source.txt'), 'new implementation');
  const next = await loadConfig(c.filename); await initialize(next); await rendered(next, 'paths');
  const prior = old.checks.find(check => check.id === 'workflow').evidence.rendered;
  const path = 'output/reassessed.json';
  const review = { checkId: 'workflow', ...next.identity, status: 'Pass', observedAt: new Date().toISOString(), method: 'self-review', reviewer: 'Fixture reviewer', task: 'Fixture', route: '#fixture', sequence: 'Re-operated the current workflow', observation: 'Current workflow reassessed; original timing remains historical', timing: 'reassessed', priorMilestone: { build: old.build, observedAt: prior.observedAt, artifactPath: priorPath }, references: [priorPath] };
  await writeFile(join(c.root, path), JSON.stringify(review)); await recordRendered(next, 'workflow', path);
  assert.equal((await current(next)).record.checks.find(c => c.id === 'workflow').status, 'Pass');
  old.checks.find(c => c.id === 'workflow').evidence.rendered.timing = 'retrospective';
  await writeFile(join(c.root, priorPath), JSON.stringify(old));
  await assert.rejects(recordRendered(next, 'workflow', path), /Historical artifact/);
});

test('milestones are automatic, immutable, and reusable only with fresh rendered observations', async t => {
  const c = await fixture(t);
  await assert.rejects(latestMilestone(c), /No preserved milestone/);
  await rendered(c, 'paths'); await rendered(c, 'workflow');
  await runCheck(c, 'navigation'); await rendered(c, 'navigation');
  const prior = await latestMilestone(c);
  const original = await readFile(join(c.root, prior.artifactPath), 'utf8');
  await writeFile(join(c.root, 'source.txt'), 'changed');
  const next = await loadConfig(c.filename); await initialize(next); await rendered(next, 'paths');
  await writeFile(join(c.root, 'output/reassessment.json'), JSON.stringify({ checkId: 'workflow', ...next.identity, status: 'Pass', observedAt: new Date().toISOString(), method: 'self-review', reviewer: 'Fixture', task: 'Fixture', route: '#fixture', sequence: 'Re-operated current build', observation: 'Fresh observation', references: ['source.txt'] }));
  const result = await main(['--config', c.filename, 'record', 'workflow', 'output/reassessment.json', '--milestone', prior.artifactPath]);
  assert.equal(result.checks.find(c => c.id === 'workflow').status, 'Pass');
  assert.equal(result.checks.find(c => c.id === 'navigation').status, 'Pending');
  assert.equal(await readFile(join(c.root, prior.artifactPath), 'utf8'), original);
  await writeFile(join(c.root, prior.artifactPath), '{}');
  await assert.rejects(latestMilestone(next), /changed/);
});

test('explicit batches preserve gate order, reject unrelated commands and do not run before review', async t => {
  const c = await fixture(t);
  await assert.rejects(main(['--config', c.filename, 'run', 'navigation']), /preceding gates/);
  await assert.rejects(main(['--config', c.filename, 'run', 'navigation', 'bogus']), /distinct automated/);
  await rendered(c, 'paths'); await rendered(c, 'workflow');
  const results = await main(['--config', c.filename, 'run', 'navigation']);
  assert.equal(results.checks.find(c => c.id === 'navigation').evidence.automated.status, 'Pass');
  assert.equal(results.gates[1].status, 'Pending');
  await rendered(c, 'navigation');
  await writeFile(join(c.root, 'output/batch.json'), JSON.stringify([{checkId: 'navigation', file: 'output/navigation.json'}, {checkId: 'workflow', file: 'output/workflow.json'}]));
  const reviewed = await main(['--config', c.filename, 'record-batch', 'output/batch.json']);
  assert.equal(reviewed.gates[1].status, 'Pass');
  const batch = await main(['--config', c.filename, 'run', 'retained-data', 'return-context']);
  for (const id of ['retained-data', 'return-context']) assert.equal(batch.checks.find(c => c.id === id).evidence.automated.status, 'Pass');
  const stopped = await main(['--config', c.filename, 'run', 'acknowledged-read', 'lost-response']);
  assert.equal(stopped.checks.find(c => c.id === 'lost-response').evidence.automated.status, 'Pending', 'Generic success cannot replace per-task recovery assertions');
  assert.equal(stopped.checks.find(c => c.id === 'acknowledged-read').evidence.automated, undefined, 'Batch stops before the next assertion');
  c.config.adapters.navigation.inputs = ['unbound.mjs'];
  await assert.rejects(runCheck(c, 'navigation'), /not source-bound/);
});
