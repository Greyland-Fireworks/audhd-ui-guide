import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trialReport } from '../scripts/trial-report.mjs';
test('synthetic trial reports preserve first failures and repairs separately', () => {
  const stage = { stage: 'first-completed', build: 'first-build', workflowTiming: 'unknown', reviewerMethod: 'self-review', evidence: ['first.json'], outcomes: { recovery: 'Fail: replay allowed' } };
  const record = { schemaVersion: 1, id: 'synthetic', prompt: 'Exact synthetic prompt', toolkitHash: 'fixture-hash', firstCompleted: stage, repairs: [{ ...stage, stage: 'repair-1', build: 'repaired-build', outcomes: { recovery: 'Pass: replay blocked' } }] };
  const report = trialReport([record]);
  assert.match(report, /Fail: replay allowed/); assert.match(report, /Pass: replay blocked/); assert.match(report, /Unknown/);
  assert.throws(() => trialReport([{ ...record, firstCompleted: { ...stage, stage: 'repair-1' } }]));
});
