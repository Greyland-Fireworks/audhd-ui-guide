import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const base = process.argv[2] || 'http://127.0.0.1:4187/examples/administration/';
  await page.goto(`${base}#settings/requests`);
  await page.locator('#request-form').waitFor();
  // Fix only the service clock. Inputs, submitted snapshots and recovery are
  // exercised through the rendered UI; elapsed wall time cannot refill a test.
  await page.evaluate(async () => {
    const scenarios = await import('./scenario-state.js');
    scenarios.setScenarioClock(() => Date.UTC(2026, 9, 31, 12));
    (await import('./request-policy.js')).requestPolicy.reset();
  });
  const go = async hash => { await page.evaluate(value => { location.hash = value; }, hash); };
  const state = value => page.waitForFunction(expected => document.querySelector('#operation-state')?.dataset.state === expected, value);
  const allowance = () => page.evaluate(async () => (await import('./request-policy.js')).requestPolicy.snapshot().remaining);
  const accepted = async () => Number((await page.locator('#export-writes').textContent()).match(/\d+/)[0]);

  await page.locator('#guide-toggle').click();
  await page.locator('#request-policy-notes-toggle').click();
  await page.locator('#request-preset').click();
  assert.equal(await page.locator('#request-capacity').inputValue(), '2');
  assert.match(await page.locator('#request-effective').innerText(), /60 requests maximum/);
  assert.equal(await allowance(), 60, 'A demonstration preset changes the draft only');
  await page.locator('#save-request-policy').click();
  assert.equal(await allowance(), 2);
  assert.match(await page.locator('#request-saved').innerText(), /effective now.*maximum 2.*10 seconds/);

  await go('recovery');
  await page.locator('#export-name').fill('First export');
  for (const name of ['First export', 'Second export']) {
    await page.locator('#export-name').fill(name);
    await page.locator('#send-export').click();
    await state('accepted');
    await page.locator('#verify-export').click();
    await state('confirmed');
    await page.locator('#new-export').click();
  }
  assert.equal(await allowance(), 0);
  await page.locator('#export-name').fill('Waiting export');
  await page.locator('#send-export').click();
  await page.locator('#export-name').fill('A newer draft');
  await state('limited');
  assert.equal(await accepted(), 2);
  assert.match(await page.locator('#operation-message').innerText(), /not accepted.*retained.*eligible/);
  assert.equal(await page.locator('#export-name').inputValue(), 'A newer draft');
  const waitingId = await page.locator('#request-id').textContent();
  await page.locator('#failure-controls-toggle').click();
  await page.locator('#advance-export-time').click();
  assert.equal(await allowance(), 1);
  assert.equal(await accepted(), 2, 'Clock advancement never submits a request');
  await state('limited');
  await page.locator('#retry-export').click();
  await state('accepted');
  assert.equal(await page.locator('#request-id').textContent(), waitingId);
  assert.equal(await accepted(), 3);
  assert.equal(await allowance(), 0);
  await page.locator('#verify-export').click();
  await state('confirmed');
  assert.equal(await page.locator('#export-name').inputValue(), 'A newer draft');

  // A permission change is injected at the scenario boundary, then both UI and
  // mutation guards are checked. It must retain the unsaved numeric proposal.
  await go('settings/requests');
  await page.locator('#request-capacity').fill('4');
  await page.evaluate(async () => (await import('./scenario-state.js')).setConfigurationReadOnly(true));
  assert(await page.locator('#save-request-policy').isDisabled());
  assert(await page.locator('#request-capacity').isDisabled());
  assert.equal(await page.locator('#request-capacity').inputValue(), '4');
  assert.match(await page.locator('#request-restriction').innerText(), /read-only.*retained/);
  assert.equal(await page.evaluate(async () => (await import('./request-policy.js')).requestPolicy.save({enabled:true,capacity:4,intervalMs:10000}).restricted), true);
  await page.evaluate(async () => (await import('./scenario-state.js')).setConfigurationReadOnly(false));
  await page.locator('#save-request-policy').click();
  assert.equal(await allowance(), 0, 'Saving a larger maximum does not refill the allowance');
  await page.locator('#limit-enabled').uncheck();
  await page.locator('#save-request-policy').click();
  await page.locator('#limit-enabled').check();
  await page.locator('#save-request-policy').click();
  assert.equal(await allowance(), 4);
  assert.match(await page.locator('#request-saved').innerText(), /reset the allowance to its full maximum/);

  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS: preset without autosave, effective request policy, exhaustion, explicit retry, immutable request/newer draft, clock advance, configuration permission guards and disable/re-enable receipt.');
} finally { await browser.close(); }
