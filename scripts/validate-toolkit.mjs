import { spawn } from 'node:child_process';
import { openSync, writeSync, closeSync } from 'node:fs';
import { createServer } from 'node:http';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute, join } from 'node:path';
import { homedir } from 'node:os';

// Sequential integration is intentional: browser checks own fixed preview ports
// and output folders. No parallel runner may silently reuse a user's workspace.
const root = process.cwd(), output = resolve(root, 'output/validation');
await mkdir(output, { recursive: true });
const results = [];
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run with npm run validate:toolkit so the current npm runtime is used.');
async function check(name, command, args, unavailable) {
  if (unavailable) { console.log(`SKIPPED ${name}: ${unavailable}`); results.push({ name, status: 'skipped', reason: unavailable }); return; }
  console.log(`\nRUN ${name}`);
  const start = Date.now(); let log = '';
  const path = `output/validation/${name}.log`;
  const logFile = openSync(resolve(root, path), 'w');
  const outcome = await new Promise(done => {
    let settled = false, timedOut = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      done(timedOut ? { status: 'failed', reason: 'Check exceeded the 10-minute execution limit.', timedOut: true } : result);
    };
    // The Guide is UTF-8, including when an installed Python validator uses
    // locale-default reads on Windows. Propagate this to nested package checks.
    const child = spawn(command, args, { cwd: root, shell: false, windowsHide: true,
      env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' } });
    // A hung preview must fail the gate, not block every later check forever.
    // Kill only this check's process tree; preserve output as it arrives so an
    // externally interrupted run still leaves diagnostic evidence.
    const timeout = setTimeout(() => {
      timedOut = true;
      const reason = 'Check exceeded the 10-minute execution limit.';
      log += `\n${reason}\n`;
      writeSync(logFile, `\n${reason}\n`);
      if (process.platform === 'win32') {
        const cleanup = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
        cleanup.on('error', () => { child.kill(); finish({ status: 'failed', reason, timedOut: true }); });
        cleanup.on('close', () => finish({ status: 'failed', reason, timedOut: true }));
      } else { child.kill('SIGKILL'); finish({ status: 'failed', reason, timedOut: true }); }
    }, 600_000);
    for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { log += data; if (!settled) writeSync(logFile, data); process.stdout.write(data); });
    child.on('error', error => finish({ status: error.code === 'ENOENT' ? 'skipped' : 'failed', reason: error.message }));
    child.on('close', code => finish({ status: code === 0 ? 'passed' : 'failed', exitCode: code }));
  });
  closeSync(logFile);
  // Missing installed browser assets are an unavailable gate, never a pass.
  // Assertion errors and application failures remain failures even if other
  // checks succeed; installation is not attempted by routine validation.
  if (outcome.status === 'failed' && !outcome.timedOut && /Executable doesn't exist|browserType\.launch:.*ENOENT/.test(log)) {
    outcome.status = 'skipped';
    outcome.reason = 'Required browser executable unavailable; see log and configure PLAYWRIGHT_BROWSERS_PATH or install the required browser.';
  }
  await writeFile(resolve(root, path), log || outcome.reason || 'No output.');
  results.push({ name, ...outcome, durationMs: Date.now() - start, log: path });
}
const node = (name, file, ...args) => check(name, process.execPath, [file, ...args]);
const npmRun = script => check(script.replaceAll(':', '-'), process.execPath, [npm, 'run', script]);
const server = createServer(async (request, response) => {
  try {
    let file = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
    const fromRoot = relative(root, file);
    if (isAbsolute(fromRoot) || fromRoot.split(/[\\/]/).includes('..')) { response.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(await readFile(file));
  } catch { response.writeHead(404).end('Not found'); }
});
try {
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', done);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  await npmRun('test');
  await node('note-state', 'examples/administration/notes-state-check.mjs');
  await check('request-policy-unit', process.execPath, ['--test', 'examples/administration/request-policy.test.js']);
  await npmRun('build');
  await npmRun('test:browser');
  for (const file of ['check', 'activity-check', 'notes-check', 'notes-tools-check', 'recovery-check', 'schedule-check', 'work-check', 'request-policy-check', 'scenario-check']) {
    await node(`administration-${file}`, `examples/administration/${file}.mjs`, `${base}/examples/administration/`);
  }
  await node('unlock', 'examples/unlock-to-edit/check.mjs', `${base}/examples/unlock-to-edit/`);
  await node('persistent-recovery', 'tests/persistent-recovery-check.mjs', base);
  await npmRun('check:docs');
  await node('source-references', 'scripts/check-source-references.mjs');
  await npmRun('check:palettes');
  const validator = process.env.SKILL_VALIDATOR || join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills/.system/skill-creator/scripts/quick_validate.py');
  const available = await access(validator).then(() => true, () => false);
  await check('skill', process.env.PYTHON || 'python', [validator, root], available ? null : 'Set SKILL_VALIDATOR to the installed skill-creator quick_validate.py.');
  await npmRun('check:framework');
  await check('whitespace', 'git', ['diff', '--check']);
} catch (error) {
  // An interrupted sequence is not a passing gate, even when every check that
  // finished passed. Keep the runner failure in the same evidence record.
  console.error(error);
  results.push({ name: 'validation-runner', status: 'failed', reason: error.stack || String(error) });
} finally {
  if (server.listening) await new Promise(done => server.close(done));
  const failed = results.filter(r => r.status === 'failed'), skipped = results.filter(r => r.status === 'skipped');
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), results, separateGates: ['Agent rendered and keyboard inspection', 'Screen-reader and platform inspection', 'Optional participant feedback'], status: failed.length ? 'failed' : skipped.length ? 'incomplete' : 'passed' }, null, 2));
  console.log(`\nDeterministic checks: ${results.filter(r => r.status === 'passed').length} passed; ${failed.length} failed; ${skipped.length} skipped. See output/validation/results.json.`);
  console.log('This command does not establish visual comprehension, screen-reader support or participant usability.');
  process.exitCode = failed.length ? 1 : skipped.length ? 2 : 0;
}
