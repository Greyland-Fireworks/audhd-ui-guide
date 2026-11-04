import { definitions, initial, attach, pendingDetails } from '../../scripts/review-core.js';
export const contract = { mode: 'persistent', stage: 'repair', mutationTasks: ['save', 'publish'], verificationScope: 'Synthetic local assertions', unverified: ['External integrations unverified'], partialApply: { applicable: true, reason: 'Synthetic multi-step apply' }, coverage: [{ id: 'fixture', required: 'local', outcome: 'Complete synthetic task', requestReference: 'Fixture task contract', proof: 'effect' }], ...Object.fromEntries(['mutations', 'durableRecovery', 'concurrentWrites', 'browserStorage', 'existingInterface'].map(k => [k, { applicable: true, reason: 'Synthetic persistent task contract.' }])) };
export const identity = { build: 'a'.repeat(64), configHash: 'b'.repeat(64), contract };
export const now = Date.parse('2026-11-01T12:00:00Z');
export function evidence(d, kind, at = now, target = identity) {
  const details = pendingDetails(d.id, target.contract);
  for (const task of details.taskResults || []) for (const key of Object.keys(task.scenarios)) task.scenarios[key] = 'Pass';
  for (const item of details.coverage || []) Object.assign(item, { control: 'Pass', local: 'Pass', proof: 'effect', observation: 'Synthetic effect asserted' });
  for (const check of Object.values(details.requiredChecks || {})) Object.assign(check, {status: 'Pass', observation: 'Synthetic exercised sequence'});
  return { ...details, checkId: d.id, ...target, status: 'Pass', observedAt: new Date(at).toISOString(), task: 'Synthetic task', route: '#fixture', observation: 'Fixture assertion, not dashboard acceptance.', artifacts: [{ path: 'result.json', sha256: 'c'.repeat(64) }],
    ...(kind === 'automated' ? { method: 'automated', runner: 'fixture', invocation: ['node', 'fixture'], exitCode: 0, timedOut: false, runStatus: 'completed', resultPath: 'result.json' } : { method: 'self-review', reviewer: 'Synthetic reviewer', sequence: 'Fixture sequence', timing: 'before-reuse' }) };
}
export function complete(at = now) {
  let record = initial(identity, at);
  for (const d of definitions) for (const kind of d.method === 'combined' ? ['automated', 'rendered'] : [d.method]) record = attach(record, d.id, kind, evidence(d, kind, at), at);
  return record;
}
