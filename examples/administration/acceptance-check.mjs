import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { initial, day, guidance } from './acceptance-state.js';
import { assess } from '../../scripts/review-core.js';
import { identity, complete } from '../../tests/review/fixtures.js';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const tick = async () => {
    await page.clock.runFor(30_001);
    await page.waitForFunction(() => document.querySelector('#acceptance-review').getAttribute('aria-busy') === 'false');
  };
  const now = Date.now();
  await page.clock.install({ time: now });
  let record = initial(identity, now), unavailable = false, changedArtifact = false;
  const artifacts = new Map();
  function completed(at) {
    const result = complete(at);
    for (const check of result.checks) for (const [kind, evidence] of Object.entries(check.evidence)) {
      const path = `output/review/synthetic/${check.id}-${kind}.json`;
      const bytes = JSON.stringify(kind === 'automated' ? evidence : { note: 'Synthetic rendered observation only' });
      artifacts.set(path, bytes);
      evidence.artifacts = [{ path, sha256: createHash('sha256').update(bytes).digest('hex') }];
      if (kind === 'automated') evidence.resultPath = path;
    }
    return result;
  }
  await page.route('**/output/review/harbor/build.json', route => route.fulfill({ json: identity }));
  await page.route('**/output/review/harbor/review.json', route => unavailable ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.fulfill({ json: record }));
  await page.route('**/output/review/synthetic/**', route => route.fulfill({ body: changedArtifact ? '{}' : artifacts.get(new URL(route.request().url()).pathname.slice(1)), contentType: 'application/json' }));
  await page.goto(process.argv[2] || 'http://127.0.0.1:4189/examples/administration/');
  const bar = page.locator('#acceptance-review'), summary = bar.locator('summary');
  await summary.waitFor(); assert.equal(await summary.getAttribute('title'), guidance);
  assert.equal(await bar.locator(':scope > summary').count(), 1, 'Empty-host mount creates one summary');
  assert.equal(await bar.locator('.acceptance-lights').count(), 1, 'Mount creates one light group');
  assert.equal(await bar.locator('#acceptance-guidance').count(), 1, 'Mount creates one guidance section');
  await summary.focus(); await page.keyboard.press('Enter');
  assert.equal(await bar.getAttribute('open'), '');
  assert.equal(await bar.locator('.acceptance-lights [data-status="Pending"]').count(), 5);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  record = completed(now);
  await tick();
  await page.waitForFunction(() => document.querySelectorAll('[data-status="Pass"]').length === 5);
  assert.ok((await bar.innerText()).includes('self-review'));
  await summary.press('Enter');
  await page.goto(new URL('#request/harbor-request-chair', page.url()).href);
  await page.locator('#request-title').waitFor();
  await page.evaluate(() => scrollTo(0, 0));
  assert(await page.locator('#request-title').evaluate(el => el.getBoundingClientRect().top < innerHeight), 'Completed review qualifiers must not displace the critical task control');
  await mkdir('output/review-lights', { recursive: true });
  await page.screenshot({path: 'output/review-lights/completed-narrow.png', fullPage: true});
  await summary.focus(); await summary.press('Enter');
  await page.clock.setSystemTime(now + day);
  await tick();
  assert.equal(await bar.isVisible(), true, 'Open/focused panel must remain available at retirement');
  await summary.press('Enter');
  await tick();
  assert.equal(await bar.isVisible(), true, 'Closed summary with keyboard focus must remain available');
  assert.ok(await summary.locator('.acceptance-qualifiers').isVisible(), 'Method and scope must remain visible while collapsed');
  assert.match(await summary.innerText(), /self-review.*External integrations unverified/s);
  await page.locator('#main').focus();
  await tick();
  await page.waitForFunction(() => document.querySelector('#acceptance-review').hidden);
  unavailable = true; await tick();
  await page.waitForFunction(() => document.querySelectorAll('[data-status="Pending"]').length === 5);
  assert.equal(await bar.isVisible(), true, 'Evidence failure must reveal the bar and clear old green lights');
  unavailable = false; changedArtifact = true; await page.reload();
  await page.waitForFunction(() => document.querySelector('#acceptance-review').textContent.includes('Artifact changed'));
  assert.equal(await bar.locator('[data-status="Pass"]').count(), 0);
  changedArtifact = false; record = { build: identity.build, gates: [] }; await page.reload();
  await page.waitForFunction(() => document.querySelector('#acceptance-review').textContent.includes('unavailable or invalid'));
  assert.equal(await bar.locator('[data-status="Pending"]').count(), 5);
  record = completed(now - day - 1); await page.reload();
  await page.waitForFunction(() => document.querySelector('#acceptance-review').textContent.includes('new completion interval'));
  assert.equal(await bar.isVisible(), true, 'Reload must retain the observed evidence interruption');
  // A separate pristine-session scenario verifies initial aged completion.
  await page.evaluate(() => sessionStorage.clear()); await page.reload();
  await page.waitForFunction(() => document.querySelector('#acceptance-review').hidden);
  // A reassessed workflow must retain its original artifact bytes in the browser too.
  record = completed(now);
  const old = structuredClone(record);
  old.gates = assess(record, identity, now).gates;
  old.build = 'd'.repeat(64);
  const previousWorkflow = old.checks.find(c => c.id === 'workflow').evidence.rendered;
  previousWorkflow.build = old.build;
  previousWorkflow.observedAt = new Date(now - 1000).toISOString();
  old.milestoneArtifacts = old.checks.filter(c => ['paths', 'workflow', 'navigation'].includes(c.id)).flatMap(c => Object.values(c.evidence).flatMap(e => e.artifacts.map(a => {
    const storedPath = `output/review/synthetic/preserved-${a.sha256}`;
    artifacts.set(storedPath, artifacts.get(a.path));
    return {...a, storedPath};
  })));
  const milestoneBytes = JSON.stringify(old), milestonePath = 'output/review/synthetic/milestone.json';
  artifacts.set(milestonePath, milestoneBytes);
  const reassessed = record.checks.find(c => c.id === 'workflow').evidence.rendered;
  reassessed.timing = 'reassessed';
  reassessed.priorMilestone = {build: old.build, observedAt: previousWorkflow.observedAt, artifactPath: milestonePath};
  reassessed.artifacts.push({path: milestonePath, sha256: createHash('sha256').update(milestoneBytes).digest('hex')});
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('[data-status="Pass"]').length === 5);
  artifacts.set(old.milestoneArtifacts[0].storedPath, '{}');
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#acceptance-review').textContent.includes('Artifact changed'));
  assert.equal(await bar.locator('[data-status="Pass"]').count(), 1, 'Missing original evidence leaves only A passed; B and dependents reopen');
  record = initial(identity, now);
  await page.goto(new URL('#request/harbor-request-chair/draft', process.argv[2] || 'http://127.0.0.1:4189/examples/administration/').href);
  await tick();
  await page.waitForFunction(() => document.querySelectorAll('[data-status="Pending"]').length === 5);
  await mkdir('output/review-lights', { recursive: true });
  await page.screenshot({ path: 'output/review-lights/narrow.png', fullPage: true });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: 'output/review-lights/enlarged.png', fullPage: true });
  await page.evaluate(() => document.documentElement.style.fontSize = '');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'output/review-lights/desktop.png', fullPage: true });
  const evidenceFlag = process.argv.indexOf('--evidence');
  if (evidenceFlag >= 0) {
    const [checkId, build, destination] = process.argv.slice(evidenceFlag + 1);
    await writeFile(destination, JSON.stringify({ checkId, build, status: 'Pass', task: 'Harbor review indicator', route: '/examples/administration/', observation: 'Executed keyboard disclosure, narrow layout, periodic updates, artifact validation, unavailable-evidence clearing, legacy refusal, focus retention and simulated completion clock. Synthetic evidence does not certify Harbor outcomes.' }));
  }
  console.log('PASS: review display integration and simulated clock; synthetic evidence only.');
} finally { await browser.close(); }
