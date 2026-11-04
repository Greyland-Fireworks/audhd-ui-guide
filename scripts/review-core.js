// Original AuDHD implementation. Local evidence validation is not certification.
export const guidance = 'If any of these lights are not illuminated, re-run your dashboard-building sequence with high effort to correct it.';
export const day = 86_400_000;
const rule = 'GUIDE.md#audhd-12-validate-complete-tasks-and-report-actual-evidence';
export const definitions = [
  ['paths', 'A', 'Supported task paths', 'rendered'],
  ['workflow', 'B', 'Representative workflow before reuse', 'rendered'],
  ['navigation', 'B', 'Keyboard and secondary navigation', 'combined'],
  ['lost-response', 'C', 'Lost response and one mutation', 'combined', 'mutations'],
  ['acknowledged-read', 'C', 'Acknowledged acceptance followed by failed read', 'combined', 'mutations'],
  ['missing-receipt', 'C', 'Missing receipt with and without acknowledgment; replay blocked', 'combined', 'mutations'],
  ['return-context', 'C', 'Applicable drafts, help and named field/section/overview return', 'combined'],
  ['reload', 'C', 'Submitted identity, acknowledgment and return context across reload', 'combined', 'durableRecovery'],
  ['concurrency', 'C', 'Dirty baseline and clean refresh', 'automated', 'concurrentWrites'],
  ['retained-data', 'C', 'Failed refresh retains data and freshness', 'combined'],
  ['storage-failures', 'C', 'Separate storage read, write and removal failures', 'automated', 'browserStorage'],
  ['coverage', 'D', 'Complete consuming task coverage', 'combined'],
  ['explanations', 'D', 'Individual practical explanations and coupled controls', 'rendered'],
  ['preservation', 'E', 'Capabilities preserved through changes', 'combined', 'existingInterface'],
  ['review-lights', 'E', 'Live lights, invalidation and completion timing', 'combined'],
  ['integrated', 'E', 'Integrated rendered review and affected retests', 'combined'],
].map(([id, gate, name, method, condition]) => ({ id, gate, name, method, condition, reference: rule }));
export const gateNames = ['Task paths', 'Navigation', 'Recovery', 'Explanations', 'Final review'];
export const gates = 'ABCDE'.split('').map((id, i) => [id, gateNames[i], definitions.filter(d => d.gate === id).map(d => d.id)]);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
// These are assertion identities, not permission to report unexecuted cases as passed.
export const recoveryScenarios = {
  'lost-response': ['identity-and-snapshot', 'newer-draft', 'single-mutation', 'blocked-replay'],
  'acknowledged-read': ['accepted-before-read-failure', 'newer-draft', 'read-only-recovery', 'single-mutation'],
  'missing-receipt': ['acknowledged-unverified', 'unacknowledged-unknown', 'blocked-replay', 'read-only-recovery'],
  reload: ['reload-identity-snapshot-acknowledgment', 'failed-read-after-reload', 'newer-draft', 'single-mutation'],
};
export const proofLevels = ['control', 'saved', 'loaded', 'effect', 'task'];
export const integratedChecks = ['delivered-startup', 'normal-path', 'native-zoom'];
export const resultFields = ['checkId', 'build', 'status', 'observation', 'task', 'route', 'taskResults', 'coverage'];
export function pendingDetails(id, contract) {
  if (recoveryScenarios[id]) return { taskResults: contract.mutationTasks.map(taskId => ({ id: taskId, route: '(not exercised)', observation: 'Not exercised', scenarios: Object.fromEntries(recoveryScenarios[id].map(s => [s, 'Pending'])) })) };
  if (id === 'coverage') return { coverage: contract.coverage.map(({ id }) => ({ id, control: 'Pending', local: 'Pending', external: 'Pending', proof: 'control', observation: 'Not exercised' })) };
  if (id === 'integrated') return { requiredChecks: Object.fromEntries([...integratedChecks, ...(contract.partialApply.applicable ? ['partial-apply-recovery'] : [])].map(id => [id, { status: 'Pending', observation: 'Not exercised' }])) };
  return {};
}
export function outcomeError(e, contract) {
  const scenarios = recoveryScenarios[e.checkId];
  const entries = scenarios ? e.taskResults : e.checkId === 'coverage' ? e.coverage : null;
  const declared = scenarios ? contract.mutationTasks : contract.coverage.map(c => c.id);
  if (!scenarios && e.checkId !== 'coverage') return null;
  if (!Array.isArray(entries) || entries.length !== declared.length || new Set(entries.map(c => c.id)).size !== declared.length || declared.some(id => !entries.some(c => c.id === id))) return 'Every declared task needs its own structured outcome.';
  for (const entry of entries) {
    if (!scenarios && ['control', 'local', 'external'].some(key => !['Pass', 'Fail', 'Pending'].includes(entry[key]))) return 'Report control, local and external verification separately.';
    if (!scenarios && (!proofLevels.includes(entry.proof) || !nonempty(entry.observation) || (e.status === 'Pass' && proofLevels.indexOf(entry.proof) < proofLevels.indexOf(contract.coverage.find(c => c.id === entry.id).proof)))) return 'Minimum requested consumer proof remains unverified.';
    const required = scenarios || ['control', 'local', 'external'].slice(0, ['control', 'local', 'external'].indexOf(contract.coverage.find(c => c.id === entry.id).required) + 1);
    const values = scenarios ? entry.scenarios : entry;
    if (scenarios && (!nonempty(entry.route) || !nonempty(entry.observation))) return 'Recovery outcomes require their task route and observation.';
    if (required.some(key => !['Pass', 'Fail', 'Pending'].includes(values?.[key]) || (e.status === 'Pass' && values[key] !== 'Pass'))) return 'Required task scenarios or coverage levels remain unverified or failed.';
  }
  return null;
}
export function catalog(contract) {
  if (!['read-only', 'memory', 'persistent'].includes(contract?.mode)) throw new Error('Declare the task persistence contract.');
  if (!['initial', 'repair'].includes(contract.stage)) throw new Error('Declare initial or repair stage; repairs include a newly built dashboard.');
  if (contract.stage === 'repair' && !contract.existingInterface?.applicable) throw new Error('Repair stages require capability preservation.');
  if (!Array.isArray(contract.mutationTasks) || contract.mutationTasks.some(id => !nonempty(id)) || new Set(contract.mutationTasks).size !== contract.mutationTasks.length || (contract.mode === 'read-only' ? contract.mutationTasks.length !== 0 : !contract.mutationTasks.length)) throw new Error('Declare each mutation task, or an empty list for read-only work.');
  if (!nonempty(contract.verificationScope) || !Array.isArray(contract.unverified) || contract.unverified.some(item => !nonempty(item))) throw new Error('Declare visible verification scope and unverified areas.');
  if (!Array.isArray(contract.coverage) || !contract.coverage.length || new Set(contract.coverage.map(c => c.id)).size !== contract.coverage.length || contract.coverage.some(c => !nonempty(c.id) || !['control', 'local', 'external'].includes(c.required))) throw new Error('Declare coverage tasks and required control/local/external verification levels.');
  if (contract.coverage.some(c => !nonempty(c.outcome) || !nonempty(c.requestReference) || !proofLevels.includes(c.proof))) throw new Error('Bind every coverage outcome to the request and minimum consumer proof.');
  if (typeof contract.partialApply?.applicable !== 'boolean' || !nonempty(contract.partialApply.reason)) throw new Error('Declare partial-apply applicability and its operation boundary.');
  for (const [key, expected] of Object.entries({ mutations: contract.mode !== 'read-only', durableRecovery: contract.mode === 'persistent', concurrentWrites: contract.mode === 'persistent' })) {
    if (contract[key]?.applicable !== expected) throw new Error(`Applicable ${key} checks cannot be omitted.`);
  }
  for (const key of new Set(definitions.map(d => d.condition).filter(Boolean))) {
    if (typeof contract?.[key]?.applicable !== 'boolean' || !nonempty(contract[key].reason)) throw new Error(`Declare applicability and task-contract reason: ${key}`);
  }
  return definitions.map(d => ({ ...d, applicable: !d.condition || contract[d.condition].applicable, reason: d.condition ? contract[d.condition].reason : '' }));
}
export function initial(identity, now = Date.now()) {
  if (!/^[a-f0-9]{64}$/.test(identity?.build) || !/^[a-f0-9]{64}$/.test(identity?.configHash)) throw new Error('Expected SHA-256 build and configuration identities.');
  return { schemaVersion: 2, build: identity.build, configHash: identity.configHash, contract: structuredClone(identity.contract),
    createdAt: new Date(now).toISOString(), revision: 0, allPassedAt: null, advisory: [], history: [],
    checks: catalog(identity.contract).map(d => ({ id: d.id, evidence: {}, ...(d.applicable ? {} : { applicability: d.reason }) })) };
}
function evidenceError(e, d, kind, record, now) {
  if (!e) return kind === 'automated' ? 'Run this automated check and record its structured result.' : 'Review this task in the rendered interface and record the observation.';
  if (e.checkId !== d.id || e.build !== record.build || e.configHash !== record.configHash) return 'Evidence identity does not match this check and build.';
  if (!['Pass', 'Fail', 'Pending'].includes(e.status)) return 'Invalid evidence status.';
  if (!Number.isFinite(Date.parse(e.observedAt)) || Date.parse(e.observedAt) > now || Date.parse(e.observedAt) < Date.parse(record.createdAt)) return 'Observation time is outside this review session.';
  if (!['task', 'route', 'observation'].every(k => nonempty(e[k]))) return 'Task, route and observation are required.';
  if (!Array.isArray(e.artifacts) || !e.artifacts.length || e.artifacts.some(a => !nonempty(a.path) || !/^[a-f0-9]{64}$/.test(a.sha256))) return 'Hashed evidence artifacts are required.';
  if (kind === 'automated') {
    const outcome = outcomeError(e, record.contract);
    if (outcome) return outcome;
    if (e.method !== 'automated' || !nonempty(e.runner) || !Array.isArray(e.invocation) || !e.invocation.length || !e.resultPath || !e.artifacts.some(a => a.path === e.resultPath)) return 'An executed structured result is required.';
    if (e.status === 'Pass' && (e.exitCode !== 0 || e.timedOut || e.runStatus !== 'completed')) return 'The check did not complete successfully.';
  } else {
    if (!['self-review', 'independent review'].includes(e.method) || !nonempty(e.reviewer) || !nonempty(e.sequence)) return 'Named rendered review and an exercised sequence are required.';
    if (d.id === 'integrated') {
      const required = [...integratedChecks, ...(record.contract.partialApply.applicable ? ['partial-apply-recovery'] : [])];
      if (required.some(id => !['Pass', 'Fail', 'Pending'].includes(e.requiredChecks?.[id]?.status) || !nonempty(e.requiredChecks[id].observation) || (e.status === 'Pass' && e.requiredChecks[id].status !== 'Pass'))) return 'Required startup, normal-path, native-zoom or partial-apply review remains unfinished.';
    }
    if (d.id === 'workflow' && !['before-reuse', 'reassessed', 'retrospective'].includes(e.timing)) return 'Identify whether representative review preceded reuse.';
    if (d.id === 'workflow' && e.timing === 'retrospective') return 'Retrospective review does not prove the required phase ordering.';
    if (d.id === 'workflow' && e.timing === 'reassessed') {
      const prior = e.priorMilestone;
      if (!prior || prior.build === record.build || !/^[a-f0-9]{64}$/.test(prior.build) || !Number.isFinite(Date.parse(prior.observedAt)) || Date.parse(prior.observedAt) > Date.parse(record.createdAt) || !e.artifacts.some(a => a.path === prior.artifactPath)) return 'Reassessment requires the preserved earlier milestone artifact and its original build/time.';
    }
  }
  return e.invalidReason || null;
}
export function preservedArtifacts(historical) {
  const expected = historical?.checks?.filter(c => ['paths', 'workflow', 'navigation'].includes(c.id)).flatMap(c => Object.values(c.evidence || {}).flatMap(e => e.artifacts || [])) || [];
  const bundle = historical?.milestoneArtifacts;
  if (!expected.length || !Array.isArray(bundle) || bundle.some(a => !nonempty(a.storedPath) || !/^[a-f0-9]{64}$/.test(a.sha256)) || expected.some(a => !bundle.some(b => b.path === a.path && b.sha256 === a.sha256))) throw new Error('Historical milestone lacks its preserved artifact bundle; retain it as incomplete historical evidence.');
  return bundle.map(a => ({ path: a.storedPath, sha256: a.sha256 }));
}
export function verifyPriorMilestone(evidence, historical) {
  if (evidence.checkId !== 'workflow' || evidence.timing !== 'reassessed') return;
  const prior = evidence.priorMilestone;
  const observed = historical?.checks?.find(c => c.id === 'workflow')?.evidence?.rendered;
  if (historical?.schemaVersion !== 2 || historical.build !== prior?.build || observed?.build !== prior.build || observed?.observedAt !== prior.observedAt || observed?.timing !== 'before-reuse' || observed?.status !== 'Pass' || !historical.gates?.some(g => g.id === 'B' && g.status === 'Pass')) throw new Error('Historical artifact does not establish the claimed earlier milestone.');
}
export function assess(record, identity, now = Date.now()) {
  const fresh = () => ({ ...initial(identity, now), gates: gates.map(([id, name]) => ({ id, name, status: 'Pending', checks: [] })), issue: 'Legacy, invalid or mismatched review record; current verification is Pending.' });
  if (record?.schemaVersion !== 2 || record.build !== identity.build || record.configHash !== identity.configHash || JSON.stringify(record.contract) !== JSON.stringify(identity.contract)) return fresh();
  const list = catalog(identity.contract);
  if (!Array.isArray(record.checks) || record.checks.length !== list.length || new Set(record.checks.map(c => c.id)).size !== list.length || list.some(d => !record.checks.some(c => c.id === d.id)) || !Number.isFinite(Date.parse(record.createdAt)) || Date.parse(record.createdAt) > now) return fresh();
  const result = structuredClone(record);
  result.checks = list.map(d => {
    const c = record.checks.find(c => c.id === d.id);
    if (!d.applicable) return { ...c, ...d, status: 'Not applicable', issue: d.reason };
    const methods = d.method === 'combined' ? ['automated', 'rendered'] : [d.method];
    const errors = methods.map(k => evidenceError(c.evidence?.[k], d, k, record, now));
    const statuses = methods.map(k => c.evidence?.[k]?.status);
    return { ...c, ...d, status: errors.some(Boolean) ? 'Pending' : statuses.includes('Fail') ? 'Fail' : statuses.every(s => s === 'Pass') ? 'Pass' : 'Pending', issue: errors.filter(Boolean).join(' ') };
  });
  let blocked = false;
  result.gates = gates.map(([id, name]) => {
    const checks = result.checks.filter(c => c.gate === id);
    let status = checks.some(c => c.status === 'Fail') ? 'Fail' : checks.every(c => ['Pass', 'Not applicable'].includes(c.status)) ? 'Pass' : 'Pending';
    if (blocked && status === 'Pass') status = 'Pending';
    blocked ||= status !== 'Pass';
    return { id, name, status, checks };
  });
  const newest = Math.max(Date.parse(record.createdAt), ...result.checks.flatMap(c => Object.values(c.evidence || {}).map(e => Date.parse(e.observedAt))));
  if (blocked || !Number.isFinite(Date.parse(record.allPassedAt)) || Date.parse(record.allPassedAt) < newest || Date.parse(record.allPassedAt) > now) result.allPassedAt = null;
  return result;
}
export function reopen(record, gate, reason, now = Date.now()) {
  if (!gates.some(([id]) => id === gate) || !nonempty(reason)) throw new Error('A known gate and reason are required.');
  const next = structuredClone(record);
  next.history ||= [];
  next.history.push({ at: new Date(now).toISOString(), gate, reason, checks: next.checks.filter(c => definitions.find(d => d.id === c.id).gate >= gate) });
  next.checks = next.checks.map(c => definitions.find(d => d.id === c.id).gate >= gate ? { id: c.id, evidence: {} } : c);
  next.allPassedAt = null;
  return next;
}
export function attach(record, id, kind, evidence, now = Date.now()) {
  const d = definitions.find(d => d.id === id);
  if (!d || !['automated', 'rendered'].includes(kind) || (d.method !== 'combined' && d.method !== kind)) throw new Error('Unknown check or wrong evidence method.');
  const before = assess(record, record, now);
  if (before.issue || before.gates.some(g => g.id < d.gate && g.status !== 'Pass')) throw new Error('Prior gates must pass before this milestone advances.');
  const error = evidenceError(evidence, d, kind, record, now);
  if (error) throw new Error(error);
  const next = structuredClone(record);
  const entry = next.checks.find(c => c.id === id);
  const replaced = next.checks.filter(c => definitions.find(d => d.id === c.id).gate >= d.gate && Object.keys(c.evidence || {}).length);
  if (replaced.length) next.history.push({ at: new Date(now).toISOString(), reason: `Reassessment of ${id}`, checks: structuredClone(replaced) });
  entry.evidence[kind] = structuredClone(evidence);
  // Reassessing an earlier gate invalidates dependent outcomes, even on Pass.
  for (const c of next.checks) if (definitions.find(d => d.id === c.id).gate > d.gate) c.evidence = {};
  const status = assess(next, next, now);
  next.allPassedAt = status.gates.every(g => g.status === 'Pass') ? new Date(now).toISOString() : null;
  return next;
}
export function canHide(record, identity, now = Date.now()) {
  try { const r = assess(record, identity, now); return !!r.allPassedAt && r.gates.every(g => g.status === 'Pass') && now - Date.parse(r.allPassedAt) >= day; } catch { return false; }
}
