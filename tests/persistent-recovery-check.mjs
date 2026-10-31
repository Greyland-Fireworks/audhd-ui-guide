import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2];
if (!base) throw new Error('Pass the isolated static-server base URL.');
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await mkdir('output/playwright/persistent-recovery', { recursive: true });
await context.tracing.start({ screenshots: true, snapshots: true });
const url = `${base.replace(/\/$/, '')}/tests/fixtures/persistent-recovery/`;
const status = () => page.locator('#status').textContent();
const state = () => page.evaluate(() => fixture.state());
async function reset() { await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); }
try {
  await reset();
  await page.locator('#draft').fill('Accepted proposal');
  await page.evaluate(() => fixture.faults(null, true));
  await page.locator('#save').click();
  assert.match(await status(), /outcome unavailable/);
  await page.locator('#draft').fill('Newer unfinished text');
  const pendingId = (await state()).journal.pending.id;
  await page.reload();
  assert.equal((await state()).journal.pending.id, pendingId);
  await page.locator('#recover').click();
  assert.equal(await page.locator('#draft').inputValue(), 'Newer unfinished text');
  assert.equal((await state()).journal.baseline.text, 'Accepted proposal');
  assert.equal((await state()).service.mutations, 1);
  await page.locator('#recover').click();
  assert.equal((await state()).service.mutations, 1);

  await reset();
  await page.locator('#draft').fill('Local edit');
  await page.locator('#refresh').click();
  assert.equal(await page.locator('#draft').inputValue(), 'Local edit');
  await page.evaluate(() => fixture.otherWriter('Remote edit'));
  await page.locator('#refresh').click();
  assert.match(await status(), /Conflict/);
  assert.equal((await state()).journal.baseline.text, 'Original');
  assert.equal(await page.locator('#draft').inputValue(), 'Local edit');
  await page.locator('#save').click();
  assert.match(await status(), /Conflict/);
  assert.equal((await state()).service.mutations, 0);
  assert.match(await page.locator('#remote').textContent(), /Remote edit/);
  await page.locator('#reconcile').click();
  assert.equal((await state()).journal.baseline.text, 'Remote edit');
  assert.equal(await page.locator('#draft').inputValue(), 'Local edit');
  assert.equal((await state()).service.mutations, 0);
  await page.locator('#save').click();
  assert.equal((await state()).service.record.text, 'Local edit');
  assert.equal((await state()).service.mutations, 1);
  await reset();
  await page.evaluate(() => fixture.otherWriter('New saved record'));
  await page.locator('#refresh').click();
  assert.equal(await page.locator('#draft').inputValue(), 'New saved record');
  assert.match(await status(), /Latest record loaded/);
  const lastRead = await page.locator('#freshness').textContent();
  assert.ok((await state()).lastSuccessfulRead);
  await page.evaluate(() => fixture.faults(null, true));
  await page.locator('#refresh').click();
  assert.equal(await page.locator('#draft').inputValue(), 'New saved record');
  assert.match(await status(), /Previously loaded record retained/);
  assert.equal(await page.locator('#freshness').textContent(), lastRead);

  await reset();
  await page.evaluate(() => fixture.faults('setItem'));
  await page.locator('#draft').fill('Memory survives write denial');
  await page.locator('#save').click();
  assert.equal((await state()).service.mutations, 0);
  assert.match(await page.locator('#storage').textContent(), /reload recovery is not guaranteed/);
  await page.locator('#recover').click();
  assert.match(await page.locator('#storage').textContent(), /storage unavailable/);
  assert.equal(await page.locator('#draft').inputValue(), 'Memory survives write denial');
  await reset();
  await page.locator('#draft').fill('Stored draft');
  await page.evaluate(() => fixture.faults('removeItem'));
  await page.locator('#clear').click();
  assert.match(await status(), /not removed/);
  await page.reload();
  assert.equal(await page.locator('#draft').inputValue(), 'Stored draft');

  // Getter denial is injected before module initialization, independently of
  // writer denial. This catches silent fallback-to-defaults with no warning.
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('Read denied', 'SecurityError'); }; });
  await page.reload();
  assert.match(await page.locator('#storage').textContent(), /Read denied/);
  assert.equal(await page.locator('#draft').inputValue(), 'Original');
  console.log('PASS: isolated persistent fixture: accepted identity/reload/newer draft, exactly one mutation, dirty conflict, clean refresh, retained stale record and separate read/write/removal failures.');
} catch (error) {
  await page.screenshot({ path: 'output/playwright/persistent-recovery/failure.png', fullPage: true });
  throw error;
} finally {
  await context.tracing.stop({ path: 'output/playwright/persistent-recovery/trace.zip' });
  await browser.close();
}
