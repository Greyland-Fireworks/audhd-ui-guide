import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const base = process.argv[2] || 'http://127.0.0.1:4187/examples/administration/';
  await page.goto(`${base}#overview`);
  const state = value => page.waitForFunction(expected => document.querySelector('#operation-state')?.dataset.state === expected, value);
  const count = async value => assert.equal(await page.locator('#export-writes').textContent(), `Accepted request records: ${value}`);
  // A seeded task is blocked and a request needs correction; export failures add their own problem and
  // successful recovery returns to that baseline without clearing other work.
  const problems = async exportProblems => {
    const expected = 2 + exportProblems;
    const badge = page.locator('[data-count="overview"]');
    assert.equal(await badge.textContent(),String(expected));
    assert.equal(await badge.isHidden(),expected === 0);
    assert.equal(await page.locator('[data-count="people"]').textContent(),'2');
  };
  const notes = async visible => {
    if ((await page.locator('#guide-toggle').getAttribute('aria-pressed') === 'true') !== visible) await page.locator('#guide-toggle').click();
  };
  const scenario = async value => {
    await notes(true);
    if (await page.locator('#failure-controls').getAttribute('open') === null) await page.locator('#failure-controls-toggle').click();
    await page.locator('#export-scenario').selectOption(value);
  };
  const navigate = async name => {
    // AUDHD-11: the 64rem shell breakpoint changes access, not destinations.
    if (await page.locator('#menu-toggle').isVisible() && await page.locator('#menu-toggle').getAttribute('aria-expanded') !== 'true') await page.locator('#menu-toggle').click();
    const link = page.getByRole('navigation', {name:'Workspace', exact:true}).getByRole('link', { name: new RegExp(`^${name}(?:\\s|$)`), includeHidden:true });
    const groups = await link.evaluate(el=>{const result=[]; for(let p=el.parentElement;p;p=p.parentElement) if(p.matches('ul.nav-children')) result.unshift(p.id.replace('nav-','')); return result;});
    for(const group of groups) {const toggle=page.locator(`[data-branch="${group}"]`); if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();}
    await link.click();
  };

  // AUDHD-12 / GUIDE.md#audhd-12-validate-complete-tasks-and-report-actual-evidence:
  // ordinary use succeeds first; optional teaching controls must not be required.
  // The parent now opens real JSON transfer. The separate request simulation
  // remains reachable through its named child and starts without teaching controls.
  await navigate('Import & export');
  await navigate('Request a notes export');
  assert.equal(new URL(page.url()).hash, '#recovery');
  assert.equal(await page.locator('#guide-toggle').getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('#failure-controls').isVisible(), false);
  await page.locator('#send-export').click();
  await problems(0); // Waiting for a response is not a problem.
  await state('accepted');
  await problems(0); // Ordinary confirmation work is not a failure.
  await page.locator('#verify-export').click();
  await state('confirmed');
  await count(1);
  assert.match(await page.locator('#operation-message').innerText(), /No file was produced/);
  await page.reload();
  await page.locator('#send-export').waitFor();
  await count(0);
  assert.equal(await page.locator('#operation-state').count(), 0);

  // The optional condition makes the service accept first, then lose the reply.
  // Recover through visible controls; do not call the service with a test ID.
  await scenario('lost-after');
  await page.locator('#send-export').click();
  await page.locator('#export-name').fill('Newer draft');
  await notes(false);
  await state('unknown');
  await problems(1);
  await count(1);
  const submittedId = await page.locator('#request-id').textContent();
  assert.equal(await page.locator('#export-name').inputValue(), 'Newer draft');
  assert(await page.locator('#send-export').isDisabled());
  assert(await page.locator('#restore-service').isVisible());
  await navigate('Overview');
  await page.getByRole('link', { name: 'Weekly notes: Export outcome unknown', exact: true }).click();
  await page.locator('#reconcile').click();
  await state('accepted');
  await problems(0);
  assert.equal(await page.locator('#request-id').textContent(), submittedId);
  await count(1);
  await scenario('verify-fail');
  await notes(false);
  await page.locator('#verify-export').click();
  assert.match(await page.locator('#operation-message').innerText(), /Confirmation is unavailable/);
  await problems(1);
  await count(1);
  const returnPath = new URL(page.url()).hash;
  await navigate('Appearance');
  await page.locator('#palettes input[value="paperwhite"]').locator('..').click();
  await page.goBack(); // Browser history; persistent fixture separately exercises a keyboard return control.
  await page.waitForURL(url => url.hash === returnPath);
  assert.equal(new URL(page.url()).hash, returnPath);
  assert.equal(await page.locator('#request-id').textContent(), submittedId);
  assert.equal(await page.locator('#export-name').inputValue(), 'Newer draft');
  assert.equal(await page.locator('#guide-toggle').getAttribute('aria-pressed'), 'false');
  await page.locator('#restore-service').click();
  await problems(1); // Restoring responses is not evidence of a successful check.
  await page.locator('#verify-export').click();
  await state('confirmed');
  await problems(0);
  await count(1);
  assert.match(await page.locator('#operation-message').innerText(), /Weekly notes/);
  // Historical success is not current evidence after a failed recheck. A newer
  // draft, accepted identity and mutation count survive every read-only retry.
  const confirmedAt = await page.locator('#confirmation-history time').getAttribute('datetime');
  await scenario('receipt-missing');
  await page.locator('#advance-export-time').click();
  await notes(false);
  await page.locator('#verify-export').click();
  await state('accepted');
  await problems(1);
  assert.match(await page.locator('#confirmation-history').innerText(), /Historical confirmation only/);
  assert.equal(await page.locator('#confirmation-history time').getAttribute('datetime'), confirmedAt);
  assert.doesNotMatch(await page.locator('#operation-message').innerText(), /^Confirmed:/);
  assert.equal(await page.locator('#export-name').inputValue(), 'Newer draft');
  assert.equal(await page.locator('#request-id').textContent(), submittedId);
  await count(1);
  await page.locator('#restore-service').click();
  await page.locator('#verify-export').click();
  await state('confirmed');
  await problems(0);
  assert.notEqual(await page.locator('#confirmation-history time').getAttribute('datetime'), confirmedAt);
  const previousCheck = await page.locator('#confirmation-history').innerText();
  await page.locator('#verify-export').click();
  assert.notEqual(await page.locator('#confirmation-history').innerText(), previousCheck);
  await count(1);
  assert.equal(await page.locator('#export-name').inputValue(), 'Newer draft');
  await page.locator('#new-export').click();
  assert.equal(await page.locator('#export-name').inputValue(), 'Newer draft');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'export-name');

  // Unknown does not mean accepted. A read-only lookup establishes absence before
  // the screen offers a retry using the same submitted snapshot and identity.
  await scenario('lost-before');
  await page.locator('#send-export').click();
  await state('unknown');
  await count(1);
  const absentId = await page.locator('#request-id').textContent();
  await notes(false);
  await page.locator('#reconcile').click();
  await state('rejected');
  await problems(1);
  await page.locator('#restore-service').click();
  await page.locator('#retry-export').click();
  await state('accepted');
  assert.equal(await page.locator('#request-id').textContent(), absentId);
  await count(2);
  await page.locator('#verify-export').click();
  await state('confirmed');
  await count(2);
  await page.locator('#new-export').click();
  await scenario('reject');
  await page.locator('#send-export').click();
  await state('rejected');
  await count(2);
  assert.match(await page.locator('#operation-message').innerText(), /before accepting/);

  // A reply arriving on another page must update its request without replacing
  // the currently focused status link or discarding its recovery destination.
  await page.locator('#new-export').click();
  await scenario('lost-after');
  await page.locator('#send-export').click();
  await navigate('Overview');
  const pendingLink = page.getByRole('link', {name:'Newer draft: Export request pending',exact:true});
  await pendingLink.focus();
  await page.getByRole('link', { name: 'Newer draft: Export outcome unknown', exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Team overview', exact: true }).count(), 1);
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Newer draft: Export outcome unknown');
  await page.getByRole('link', { name: 'Newer draft: Export outcome unknown', exact: true }).click();
  await count(3);
  await page.locator('#reconcile').click();
  await page.locator('#restore-service').click();
  await page.locator('#verify-export').click();
  await page.locator('#new-export').click();
  await scenario('lost-after');
  await page.locator('#send-export').click();
  await page.locator('#request-identity-toggle').click();
  await state('unknown');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'request-identity-toggle');
  assert.equal(await page.locator('#request-identity').getAttribute('open'), '');
  await count(4);

  // Hiding Guide notes cannot hide the only recovery action, even on narrow screens.
  await notes(false);
  await page.setViewportSize({width:390,height:844});
  await page.locator('#menu-toggle').waitFor({state:'visible'});
  await page.locator('#restore-service').click();
  await page.locator('#reconcile').click();
  await page.locator('#verify-export').click();
  await state('confirmed');
  await count(4);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await navigate('Appearance');
  await page.goBack();
  await state('confirmed');
  assert.equal(await page.locator('#export-name').inputValue(), 'Newer draft');
  await page.setViewportSize({width:1440,height:1000});
  await mkdir('output/playwright/administration', { recursive: true });
  await page.screenshot({path:'output/playwright/administration/recovery.png',fullPage:true});
  console.log('PASS: normal export request, optional failure teaching, notes-off recovery, immutable identity, newer drafts, no duplicate acceptance, confirmation-only retry and late completion/focus across navigation (simulation).');
} finally { await browser.close(); }
