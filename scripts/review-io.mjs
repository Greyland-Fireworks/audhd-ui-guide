import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, lstat, realpath, rename, open, rm } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { initial, assess, attach, verifyPriorMilestone, preservedArtifacts, definitions, resultFields, outcomeError, pendingDetails } from './review-core.js';

export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const excluded = /(^|\/)(node_modules|output|dist|build|coverage|\.git|\.cache|test-results|playwright-report|\.agents)(\/|$)|(^|\/)\.env(?:\.|$)|\.(pem|key)$/i;
export function within(root, name) {
  const path = resolve(root, name), rel = relative(root, path);
  if (isAbsolute(rel) || rel.split(sep).includes('..')) throw new Error(`Path escapes project root: ${name}`);
  return path;
}
export async function checkedPath(root, name) {
  const path = within(root, name);
  let current = path;
  while (relative(root, current)) {
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Symlinks are not review inputs: ${name}`); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    current = dirname(current);
  }
  return path;
}
export async function loadConfig(filename) {
  filename = await realpath(resolve(filename));
  const config = JSON.parse(await readFile(filename, 'utf8'));
  const root = await realpath(resolve(dirname(filename), config.root || '.'));
  within(root, filename);
  if (!Array.isArray(config.sources) || !config.sources.length || !config.record || !config.identity || !config.evidenceDir || !config.task) throw new Error('Declare sources, task, record, identity and evidenceDir.');
  for (const key of ['record', 'identity', 'evidenceDir']) await checkedPath(root, config[key]);
  if (!relative(within(root, config.record), within(root, config.identity)) || ['record', 'identity'].some(key => !relative(filename, within(root, config[key])))) throw new Error('Configuration, review record and build identity must use distinct files.');
  const mode = config.contract?.mode;
  if (!['read-only', 'memory', 'persistent'].includes(mode)) throw new Error('Declare a read-only, memory or persistent task contract.');
  for (const [key, expected] of Object.entries({ mutations: mode !== 'read-only', durableRecovery: mode === 'persistent', concurrentWrites: mode === 'persistent' })) {
    if (config.contract[key]?.applicable !== expected) throw new Error(`Contract cannot omit applicable ${key} checks.`);
  }
  const paths = new Set([relative(root, filename).split(sep).join('/')]);
  const ignored = [config.record, config.identity, config.evidenceDir, ...(config.exclude || [])].map(p => relative(root, within(root, p)).split(sep).join('/'));
  async function select(name, explicit = false) {
    const path = await checkedPath(root, name), normalized = relative(root, path).split(sep).join('/');
    if (excluded.test(normalized) || ignored.some(p => normalized === p || normalized.startsWith(p + '/'))) {
      if (explicit) throw new Error(`Generated, evidence or secret input selected: ${name}`);
      return;
    }
    const info = await lstat(path); // Missing declared inputs are errors, not empty fingerprints.
    if (info.isDirectory()) for (const child of await readdir(path)) await select(relative(root, resolve(path, child)));
    else if (info.isFile()) paths.add(normalized);
    else throw new Error(`Unsupported source input: ${name}`);
  }
  for (const name of config.sources) await select(name, true);
  const digest = createHash('sha256');
  for (const name of [...paths].sort()) {
    const bytes = await readFile(await checkedPath(root, name));
    digest.update(JSON.stringify([name, bytes.length]) + '\n'); digest.update(bytes);
  }
  const identity = { build: digest.digest('hex'), configHash: hash(await readFile(filename)), contract: config.contract };
  initial(identity); // Validate the complete canonical applicability set.
  return { root, config, filename, identity, sources: [...paths].sort() };
}
export async function readRecord(context) {
  const path = await checkedPath(context.root, context.config.record);
  const raw = await readFile(path).catch(e => { if (e.code === 'ENOENT') return null; throw e; });
  let record;
  try { record = JSON.parse(raw); } catch { record = null; }
  return { raw, token: raw ? hash(raw) : null, record };
}
export async function atomic(path, bytes) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, bytes, { flag: 'wx' }); await rename(temporary, path); }
  finally { await rm(temporary, { force: true }); }
}
export async function saveRecord(context, record, expectedToken) {
  if ((await loadConfig(context.filename)).identity.build !== context.identity.build) throw new Error('Source changed before record update; initialize the new build.');
  const path = await checkedPath(context.root, context.config.record);
  await mkdir(dirname(path), { recursive: true });
  const lock = await open(path + '.lock', 'wx').catch(e => { throw new Error(`Concurrent review update rejected: ${e.message}`); });
  try {
    const previous = await readRecord(context);
    if (previous.token !== expectedToken) throw new Error('Concurrent review update rejected; reload the last valid record.');
    record.revision = (record.revision || 0) + 1;
    const disposition = assess(record, context.identity);
    record.gates = disposition.gates;
    record.allPassedAt = disposition.allPassedAt;
    const bytes = JSON.stringify(record, null, 2) + '\n';
    const workflow = record.checks.find(c => c.id === 'workflow')?.evidence?.rendered;
    if (workflow?.timing === 'before-reuse' && disposition.gates[1].status === 'Pass' && previous.record?.gates?.[1]?.status !== 'Pass') {
      const checked = await verified(context, record);
      if (checked.gates[1].status === 'Pass') {
        const milestone = structuredClone(record);
        milestone.milestoneArtifacts = [];
        const artifacts = record.checks.filter(c => ['paths', 'workflow', 'navigation'].includes(c.id)).flatMap(c => Object.values(c.evidence || {}).flatMap(e => e.artifacts || []));
        for (const entry of artifacts) {
          const data = await readFile(await checkedPath(context.root, entry.path));
          if (hash(data) !== entry.sha256) throw new Error('Milestone source artifact changed during preservation.');
          const storedPath = `${context.config.evidenceDir}/milestones/artifacts/${entry.sha256}`;
          await atomic(await checkedPath(context.root, storedPath), data);
          milestone.milestoneArtifacts.push({ ...entry, storedPath });
        }
        const preserved = JSON.stringify(milestone, null, 2) + '\n';
        await atomic(await checkedPath(context.root, `${context.config.evidenceDir}/milestones/${hash(preserved)}.json`), preserved);
      }
    }
    await atomic(path, bytes);
  } finally { await lock.close(); await rm(path + '.lock', { force: true }); }
}
export async function initialize(context) {
  const previous = await readRecord(context);
  let record = previous.record;
  if (!record || assess(record, context.identity).issue) {
    if (previous.raw) {
      const history = within(context.root, `${context.config.evidenceDir}/history/${hash(previous.raw)}.json`);
      await atomic(history, previous.raw);
    }
    record = initial(context.identity);
    if (previous.raw) record.history.push({ previousRecordHash: hash(previous.raw), note: 'Preserved historical evidence; no current-build passes migrated.' });
    await saveRecord(context, record, previous.token);
  }
  await atomic(within(context.root, context.config.identity), JSON.stringify(context.identity, null, 2) + '\n');
  return record;
}
export async function artifact(context, name) {
  const path = await checkedPath(context.root, name), data = await readFile(path);
  if (!data.length) throw new Error(`Empty evidence artifact: ${name}`);
  return { path: relative(context.root, path).split(sep).join('/'), sha256: hash(data) };
}
export async function verified(context, record) {
  const copy = structuredClone(record);
  for (const check of copy?.checks || []) for (const [kind, evidence] of Object.entries(check.evidence || {})) {
    delete evidence.invalidReason;
    try {
      for (const a of evidence.artifacts || []) if ((await artifact(context, a.path)).sha256 !== a.sha256) throw new Error(`Changed artifact: ${a.path}`);
      if (evidence.timing === 'reassessed') {
        const old = await readMilestone(context, evidence.priorMilestone.artifactPath);
        verifyPriorMilestone(evidence, old);
      }
      if (kind === 'automated') {
        const result = JSON.parse(await readFile(await checkedPath(context.root, evidence.resultPath), 'utf8'));
        for (const key of resultFields) if (JSON.stringify(result[key]) !== JSON.stringify(evidence[key])) throw new Error(`Structured result mismatch: ${key}`);
      }
    } catch (e) { evidence.invalidReason = `Evidence unavailable or invalid: ${e.message}`; }
  }
  return assess(copy, context.identity);
}
export async function current(context) {
  const saved = await readRecord(context);
  if (!saved.record || assess(saved.record, context.identity).issue) throw new Error('Run init for this build; historical evidence cannot close current checks.');
  return { ...saved, record: await verified(context, saved.record) };
}
export async function recordRendered(context, id, filename, milestone) {
  const saved = await current(context), inputPath = await checkedPath(context.root, filename);
  const evidence = JSON.parse(await readFile(inputPath, 'utf8'));
  if (!['self-review', 'independent review'].includes(evidence.method)) throw new Error('record accepts rendered review only; use run for automated evidence.');
  if (!Array.isArray(evidence.references) || !evidence.references.length) throw new Error('Rendered review requires local evidence references.');
  if (milestone) {
    if (id !== 'workflow') throw new Error('A prior milestone applies only to workflow reassessment.');
    const old = await readMilestone(context, milestone);
    evidence.timing = 'reassessed';
    evidence.priorMilestone = { build: old.build, observedAt: old.checks?.find(c => c.id === 'workflow')?.evidence?.rendered?.observedAt, artifactPath: milestone };
    evidence.references.push(milestone);
  }
  evidence.artifacts = await Promise.all([...new Set([relative(context.root, inputPath), ...evidence.references])].map(p => artifact(context, p)));
  if (evidence.timing === 'reassessed') {
    const old = await readMilestone(context, evidence.priorMilestone.artifactPath);
    verifyPriorMilestone(evidence, old);
  }
  const next = attach(saved.record, id, 'rendered', evidence);
  await saveRecord(context, next, saved.token);
  return next;
}
export async function runCheck(context, id) {
  const adapter = context.config.adapters?.[id];
  if (!adapter || typeof adapter.executable !== 'string' || !Array.isArray(adapter.args) || !adapter.args.every(a => typeof a === 'string') || !Number.isInteger(adapter.timeoutMs) || adapter.timeoutMs < 1 || adapter.timeoutMs > 600_000 || !adapter.result || !adapter.cwd) throw new Error('Explicit executable, argument array, cwd, timeout and result path are required.');
  if (!Array.isArray(adapter.inputs) || !adapter.inputs.length) throw new Error('Declare adapter inputs containing the executed assertions and their local helpers.');
  for (const input of adapter.inputs) {
    const name = relative(context.root, await checkedPath(context.root, input)).split(sep).join('/');
    if (!context.sources.includes(name)) throw new Error(`Adapter input is not source-bound: ${input}`);
  }
  const saved = await current(context);
  const definition = definitions.find(d => d.id === id);
  if (!definition || definition.method === 'rendered' || !saved.record.checks.find(c => c.id === id)?.applicable) throw new Error('Request an applicable automated check.');
  if (saved.record.gates.some(g => g.id < definition.gate && g.status !== 'Pass')) throw new Error('Complete preceding gates before running this check.');
  const runDir = within(context.root, `${context.config.evidenceDir}/runs/${randomUUID()}`);
  await mkdir(runDir, { recursive: true });
  const resultPath = within(runDir, adapter.result), logPath = resolve(runDir, 'process.log');
  const replace = value => value.replaceAll('{build}', context.identity.build).replaceAll('{checkId}', id).replaceAll('{result}', resultPath);
  const executable = adapter.executable === 'node' ? process.execPath : adapter.executable;
  const args = adapter.args.map(replace), cwd = await checkedPath(context.root, adapter.cwd);
  let output = '', timedOut = false;
  const exitCode = await new Promise(done => {
    const child = spawn(executable, args, { cwd, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === 'win32') { const stop = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }); stop.on('error', () => child.kill()); }
      else child.kill('SIGKILL');
    }, adapter.timeoutMs);
    const finish = code => { clearTimeout(timer); done(code); };
    child.on('error', error => { output += error.message; finish(null); });
    child.on('close', finish);
    for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { output += data; if (output.length > 4_000_000) { output = output.slice(-4_000_000); } });
  });
  await writeFile(logPath, output || '(No process output)\n');
  let result, issue;
  try {
    result = JSON.parse(await readFile(resultPath, 'utf8'));
    if (result.checkId !== id || result.build !== context.identity.build || !['Pass', 'Fail', 'Pending'].includes(result.status) || !['task', 'route', 'observation'].every(k => typeof result[k] === 'string' && result[k].trim())) throw new Error('Expected structured check result not found.');
    const detailError = outcomeError(result, context.config.contract);
    if (detailError) throw new Error(detailError);
  } catch (e) { issue = e.message; }
  if (issue || exitCode !== 0 || timedOut) {
    result = { ...pendingDetails(id, context.config.contract), checkId: id, build: context.identity.build, status: exitCode !== 0 && !timedOut ? 'Fail' : 'Pending', task: context.config.task, route: adapter.route || '(adapter)', observation: issue || (timedOut ? 'Check timed out.' : `Process exit ${exitCode}.`) };
    await writeFile(resultPath, JSON.stringify(result));
  }
  // A source edit during a run invalidates its result rather than blessing another build.
  if ((await loadConfig(context.filename)).identity.build !== context.identity.build) throw new Error('Source changed during check; initialize and rerun against the new build.');
  const evidence = { ...result, configHash: context.identity.configHash, method: 'automated', runner: adapter.runner || adapter.executable,
    observedAt: new Date().toISOString(), invocation: [executable, ...args], exitCode, timedOut, runStatus: issue ? 'incomplete' : timedOut ? 'timeout' : 'completed',
    resultPath: relative(context.root, resultPath).split(sep).join('/'), artifacts: await Promise.all([resultPath, logPath].map(p => artifact(context, p))) };
  const next = attach(saved.record, id, 'automated', evidence);
  await saveRecord(context, next, saved.token);
  return next;
}

async function readMilestone(context, filename) {
  const bytes = await readFile(await checkedPath(context.root, filename));
  if (!filename.replaceAll('\\', '/').endsWith('/' + hash(bytes) + '.json')) throw new Error('Preserved milestone artifact changed.');
  const old = JSON.parse(bytes);
  for (const a of preservedArtifacts(old)) if ((await artifact(context, a.path)).sha256 !== a.sha256) throw new Error('Preserved milestone evidence changed.');
  return old;
}
export async function latestMilestone(context) {
  const directory = await checkedPath(context.root, `${context.config.evidenceDir}/milestones`);
  const files = await readdir(directory).catch(e => { if (e.code === 'ENOENT') return []; throw e; });
  const milestones = [];
  for (const filename of files.filter(f => /^[a-f0-9]{64}\.json$/.test(f))) {
    const path = await checkedPath(context.root, relative(context.root, resolve(directory, filename)));
    const bytes = await readFile(path);
    if (hash(bytes) + '.json' !== filename) throw new Error('Preserved milestone artifact changed.');
    if (!JSON.parse(bytes).milestoneArtifacts) continue; // Legacy records stay historical; a later complete bundle may be used.
    const old = await readMilestone(context, relative(context.root, path)), observed = old.checks?.find(c => c.id === 'workflow')?.evidence?.rendered;
    const prior = { build: old.build, observedAt: observed?.observedAt, artifactPath: relative(context.root, path).split(sep).join('/') };
    verifyPriorMilestone({ checkId: 'workflow', timing: 'reassessed', priorMilestone: prior }, old);
    milestones.push(prior);
  }
  milestones.sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt));
  if (!milestones.length) throw new Error('No preserved milestone. Complete A and B before pattern reuse; retrospective review cannot create earlier evidence.');
  return milestones[0];
}
