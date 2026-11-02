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

  // Receiving an acknowledgment before a failed status read is distinct from
  // losing the acknowledgment itself. Both evidence and later work survive.
  await reset();
  await page.locator('#draft').fill('Acknowledged proposal');
  await page.evaluate(() => fixture.faults(null, true, true));
  await page.locator('#save').click();
  assert.match(await status(), /Change accepted; status refresh unavailable/);
  const acknowledged = (await state()).journal.pending;
  assert.equal(acknowledged.acknowledgment.text, 'Acknowledged proposal');
  assert.equal(await page.locator('#conflict').isVisible(), false);
  await page.locator('#draft').fill('Newer draft after acknowledgment');
  await page.reload();
  assert.deepEqual((await state()).journal.pending, acknowledged);
  assert.match(await page.locator('#acknowledgment').textContent(), /Acknowledged proposal/);
  await page.evaluate(() => fixture.faults(null, true));
  await page.locator('#recover').click();
  assert.match(await status(), /Change accepted; status refresh unavailable/);
  assert.deepEqual((await state()).journal.pending, acknowledged);
  assert.equal(await page.locator('#draft').inputValue(), 'Newer draft after acknowledgment');
  assert.equal(await page.locator('#conflict').isVisible(), false);
  await page.screenshot({ path: 'output/playwright/persistent-recovery/acknowledged-reload.png', fullPage: true });
  await page.locator('#save').click();
  assert.match(await status(), /Check the existing submitted change first/);
  assert.equal((await state()).service.mutations, 1);
  await page.evaluate(() => fixture.faults(null));
  await page.locator('#recover').click();
  assert.equal((await state()).journal.baseline.text, 'Acknowledged proposal');
  assert.equal(await page.locator('#draft').inputValue(), 'Newer draft after acknowledgment');
  await page.locator('#recover').click();
  assert.equal((await state()).service.mutations, 1);

  // Exercise an actual storage exception after acceptance, independently of
  // the fixture's fault flag. A shared save/verify catch used to erase identity.
  await reset();
  await page.locator('#draft').fill('Accepted before thrown read');
  await page.evaluate(() => {
    fixture.faults(null, false, true);
    const original = Storage.prototype.getItem;
    let serviceReads = 0;
    Storage.prototype.getItem = function (key) {
      if (key === 'recovery-fixture-service' && ++serviceReads === 2) {
        Storage.prototype.getItem = original;
        throw new Error('Status read failed after acceptance');
      }
      return original.call(this, key);
    };
  });
  await page.locator('#save').click();
  const thrownReadPending = (await state()).journal.pending;
  assert.equal(thrownReadPending.acknowledgment.text, 'Accepted before thrown read');
  assert.match(await status(), /Change accepted; status refresh unavailable/);
  assert.equal(await page.locator('#conflict').isVisible(), false);
  await page.locator('#save').click();
  assert.deepEqual((await state()).journal.pending, thrownReadPending);
  assert.equal((await state()).service.mutations, 1);
  await page.locator('#recover').click();
  assert.equal((await state()).journal.pending, null);
  assert.equal((await state()).service.mutations, 1);

  // An exception at submission can also hide an accepted effect. Only an
  // explicit revision rejection may clear the pending identity.
  await reset();
  await page.locator('#draft').fill('Accepted before submission error');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      original.call(this, key, value);
      if (key === 'recovery-fixture-service') {
        Storage.prototype.setItem = original;
        throw new Error('Acknowledgment lost after service write');
      }
    };
  });
  await page.locator('#save').click();
  const uncertain = (await state()).journal.pending;
  assert.equal(uncertain.text, 'Accepted before submission error');
  assert.match(await status(), /Submission outcome unavailable/);
  assert.equal(await page.locator('#conflict').isVisible(), false);
  await page.locator('#save').click();
  assert.equal((await state()).service.mutations, 1);
  await page.locator('#recover').click();
  assert.equal((await state()).journal.pending, null);
  assert.equal((await state()).service.mutations, 1);

  // Missing receipts must not downgrade historical acknowledgment to unknown,
  // or invent acceptance when no acknowledgment was received.
  for (const received of [true, false]) {
    await reset();
    await page.locator('#draft').fill('Proposal with missing receipt');
    await page.evaluate(received => fixture.faults(null, true, received), received);
    await page.locator('#save').click();
    const pending = (await state()).journal.pending;
    await page.locator('#draft').fill('Newer work while receipt is missing');
    await page.evaluate(id => fixture.removeReceipt(id), pending.id);
    await page.reload();
    for (let check = 0; check < 2; check++) {
      await page.locator('#recover').click();
      assert.match(await status(), received ? /Previously accepted; receipt unavailable. Current verification unavailable/ : /Outcome remains unknown/);
      assert.equal(await page.locator('#conflict').isVisible(), false);
      assert.equal(await page.locator('#draft').inputValue(), 'Newer work while receipt is missing');
      assert.deepEqual((await state()).journal.pending, pending);
      assert.equal((await state()).service.mutations, 1);
    }
    const acknowledgment = await page.locator('#acknowledgment').textContent();
    if (received) assert.match(acknowledgment, /Historical acceptance; current verification pending/);
    else assert.equal(acknowledgment, '');
    await page.screenshot({ path: `output/playwright/persistent-recovery/missing-receipt-${received ? 'acknowledged' : 'unknown'}.png`, fullPage: true });
    await page.locator('#save').click();
    assert.match(await status(), /Check the existing submitted change first/);
    assert.equal((await state()).service.mutations, 1);
  }

  // Persist useful task context independently of the immutable submission.
  // Exercise all supported return origins, not only the field-level shortcut.
  for (const [origin, target, label] of [
    ['field', 'draft', 'proposed record'],
    ['section', 'record-heading', 'record editor'],
    ['overview', 'overview', 'workspace'],
  ]) {
    await reset();
    await page.locator('#draft').fill('Submitted before detour');
    await page.evaluate(() => fixture.faults(null, true, true));
    await page.locator('#save').click();
    const submitted = (await state()).journal.pending;
    await page.locator('#draft').fill('Newer record draft');
    await page.locator('#notes').fill('Independent notes draft');
    await page.locator('#help summary').click();
    await page.locator(`#${origin}-appearance`).click();
    await page.locator('#color-scheme').selectOption('dark');
    await page.reload();
    assert.equal(await page.locator('#appearance').isVisible(), true);
    assert.equal(await page.locator('#workspace').isVisible(), false);
    assert.equal(await page.locator('#color-scheme').inputValue(), 'dark');
    assert.deepEqual((await state()).journal.pending, submitted);
    await page.getByRole('button', { name: `Return to ${label}`, exact: true }).press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), target);
    assert.equal(await page.locator('#help').evaluate(el => el.open), true);
    assert.equal(await page.locator('#draft').inputValue(), 'Newer record draft');
    assert.equal(await page.locator('#notes').inputValue(), 'Independent notes draft');
    assert.equal((await state()).journal.baseline.text, 'Original');
    assert.deepEqual((await state()).journal.pending, submitted);
    await page.screenshot({ path: `output/playwright/persistent-recovery/return-${origin}.png`, fullPage: true });
    await page.locator('#recover').press('Enter');
    assert.equal((await state()).journal.baseline.text, 'Submitted before detour');
    assert.equal(await page.locator('#draft').inputValue(), 'Newer record draft');
    assert.equal(await page.locator('#notes').inputValue(), 'Independent notes draft');
    assert.equal((await state()).service.mutations, 1);
    const retained = (await state()).journal;
    const freshness = await page.locator('#freshness').textContent();
    await page.evaluate(() => fixture.faults(null, true));
    await page.locator('#refresh').click();
    assert.match(await status(), /Previously loaded record retained/);
    assert.deepEqual((await state()).journal, retained);
    assert.equal(await page.locator('#freshness').textContent(), freshness);
  }

  await reset();
  await page.locator('#draft').fill('Local edit');
  await page.locator('#refresh').click();
  assert.equal(await page.locator('#draft').inputValue(), 'Local edit');
  await page.evaluate(() => fixture.otherWriter('Remote edit'));
  await page.locator('#refresh').click();
  assert.match(await status(), /Conflict/);
  await page.reload();
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
  await page.locator('#notes').fill('Notes survive write denial');
  await page.locator('#field-appearance').click();
  assert.equal(await page.locator('#storage').isVisible(), true);
  assert.match(await page.locator('#storage').textContent(), /reload recovery is not guaranteed/);
  await page.getByRole('button', { name: 'Return to proposed record', exact: true }).click();
  assert.equal(await page.locator('#draft').inputValue(), 'Memory survives write denial');
  assert.equal(await page.locator('#notes').inputValue(), 'Notes survive write denial');
  assert.equal(await page.locator('#storage').isVisible(), true);
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
  console.log('PASS: isolated persistent fixture: thrown status-read failures, lost outcome and acknowledged recovery, missing receipts with/without acknowledgment, reload/two drafts/help/named return from field, section and overview, exactly one mutation, dirty conflict across reload, clean refresh, retained stale record and separate read/write/removal failures.');
} catch (error) {
  await page.screenshot({ path: 'output/playwright/persistent-recovery/failure.png', fullPage: true });
  throw error;
} finally {
  await context.tracing.stop({ path: 'output/playwright/persistent-recovery/trace.zip' });
  await browser.close();
}
