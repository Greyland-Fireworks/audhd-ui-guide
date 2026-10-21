// Run against the locally served example; uses an isolated browser context.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const url = process.argv[2] || 'http://127.0.0.1:4186/examples/unlock-to-edit/';
const output = 'output/playwright/unlock-to-edit';
const observations = [];
const note = message => observations.push(message);
const readonly = id => page.locator(`#${id}`).evaluate(el => el.readOnly);
const status = () => page.locator('#save-status').innerText();
const commit = async (id, value) => { await page.locator(`#${id}`).fill(value); await page.locator(`#${id}`).press('Tab'); };
const fault = async value => {
  await page.locator('details').evaluate(el => el.open = true);
  await page.locator('#failure').selectOption(value);
};

try {
  await mkdir(output, { recursive: true });
  await page.goto(url);
  assert(await readonly('retries') && await readonly('timeout'));
  const closedShackle = await page.locator('#retries-shackle').getAttribute('d');
  assert.equal(await page.locator('#retries-lock').getAttribute('aria-label'), 'Unlock to edit — retry limit');
  assert(await page.locator('#retries-lock').evaluate(el => {
    const button = el.getBoundingClientRect(), card = el.closest('article').getBoundingClientRect();
    return button.width >= 44 && button.height >= 44 && card.right - button.right < 25 && button.top - card.top < 25;
  }));
  await page.locator('#retries').focus();
  await page.locator('#retries').press('Control+a');
  assert.equal(await page.locator('#retries').evaluate(el => el.value.slice(el.selectionStart, el.selectionEnd)), '3');
  await page.locator('#retries').press('9');
  assert.equal(await page.locator('#retries').inputValue(), '3');
  await page.locator('#retries-lock').focus();
  assert(await page.locator('#retries-hint').isVisible());
  await page.keyboard.press('Escape');
  assert(!await page.locator('#retries-hint').isVisible());
  assert(await page.locator('#retries-lock').evaluate(el => el === document.activeElement));
  await page.keyboard.press('Enter');
  assert(!await readonly('retries') && await readonly('timeout'));
  assert.notEqual(await page.locator('#retries-shackle').getAttribute('d'), closedShackle);
  assert.equal(await page.locator('#retries-lock').getAttribute('aria-label'), 'Lock editing — retry limit');
  await page.locator('#timeout-lock').click();
  assert(!await readonly('retries') && !await readonly('timeout'));
  await commit('retries', '5');
  assert.match(await status(), /saved and verified/);
  assert.match(await page.locator('#retries-before').innerText(), /: 3$/);
  await page.locator('#contract-tab').click();
  await page.locator('#appearance').selectOption('dark');
  await page.locator('#settings-tab').click();
  assert.equal(await page.locator('#retries').inputValue(), '5');
  assert(!await readonly('retries') && !await readonly('timeout'));
  await page.locator('#retries-restore').click();
  assert.equal(await page.locator('#retries').inputValue(), '3');
  assert(!await readonly('retries'));
  assert(await page.locator('#retries').evaluate(el => el === document.activeElement));
  note('Locked text selectable and direct typing blocked; keyboard unlock, independent open fields, autosave, navigation/appearance continuity and restoration after autosave passed. Clipboard permission itself was not exercised.');

  await commit('retries', '6');
  await fault('blocked');
  await page.locator('#retries-lock').click();
  assert(!await readonly('retries'));
  assert.match(await status(), /Save unverified/);
  assert.notEqual(await page.locator('#retries-shackle').getAttribute('d'), closedShackle);
  assert.equal(await page.locator('#retries').inputValue(), '6');
  await page.screenshot({ path: `${output}/dark-save-failure.png`, fullPage: true });
  await page.locator('#retries-lock').click();
  assert(await readonly('retries') && !await readonly('timeout'));
  assert.equal(await page.locator('#retries-shackle').getAttribute('d'), closedShackle);
  assert.match(await status(), /saved and verified/);
  await page.reload();
  assert.equal(await page.locator('#retries').inputValue(), '6');
  assert(await readonly('retries') && await readonly('timeout'));
  await page.locator('#retries-lock').click();
  assert.match(await page.locator('#retries-before').innerText(), /: 6$/);
  await commit('retries', '7');
  await fault('mismatch');
  await page.locator('#retries-lock').click();
  assert(!await readonly('retries'));
  assert.match(await status(), /verification did not match/);
  const download = page.waitForEvent('download');
  await page.locator('#export').click();
  await (await download).saveAs(`${output}/recovery.txt`);
  assert.match(await page.locator('#recovery').inputValue(), /Retry limit: 7/);
  assert.equal(await page.locator('#retries').inputValue(), '7');
  await page.locator('#retry-save').click();
  assert(!await readonly('retries'));
  assert.match(await status(), /saved and verified/);
  note('Blocked write and mismatched verification keep editing open; retry, current-value recovery export, reload persistence and fresh restoration point passed.');

  await commit('retries', '');
  assert.match(await status(), /Not saved/);
  assert.equal(await page.locator('#retries').getAttribute('aria-invalid'), 'true');
  await page.locator('#retries-restore').click();
  assert.equal(await page.locator('#retries').inputValue(), '6');
  await fault('blocked');
  await page.locator('#defaults').click();
  assert.equal(await page.locator('#retries').inputValue(), '6');
  assert(!await readonly('retries'));
  await page.locator('#defaults').click();
  assert.equal(await page.locator('#retries').inputValue(), '3');
  assert(await readonly('retries') && await readonly('timeout'));
  note('Invalid draft remains recoverable; failed bulk replacement preserves edits; verified replacement updates and re-locks both fields.');

  for (const theme of ['light', 'dark']) {
    await page.locator('#appearance').selectOption(theme);
    const failures = await page.evaluate(() => {
      const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      return [...document.querySelectorAll('h1,h2,p,label,a,button,input,select,summary,.state')].filter(el => el.getClientRects().length && !el.disabled).flatMap(el => {
        let surface = el;
        while (surface.parentElement && getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)') surface = surface.parentElement;
        const a = luminance(getComputedStyle(el).color), b = luminance(getComputedStyle(surface).backgroundColor);
        const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        return ratio < 4.5 ? [{ text: el.textContent.slice(0, 50), ratio }] : [];
      });
    });
    assert.deepEqual(failures, [], `${theme}: measured visible text contrast`);
    await page.screenshot({ path: `${output}/${theme}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.locator('#text-size').selectOption('200%');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.locator('#retries-lock').focus();
  await page.keyboard.press('Enter');
  assert(!await readonly('retries'));
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.locator('#timeout-lock').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  assert.notEqual(await page.locator('#timeout-lock').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  await page.screenshot({ path: `${output}/narrow-forced-colors.png` });
  note('Light/dark visible text contrast sampled at >=4.5:1; 320 CSS px with 200% application text size reflows; keyboard operation and focus in forced-colors/reduced-motion emulation passed. Actual browser zoom, OS overrides and screen readers remain untested.');

  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage denied for test', 'QuotaExceededError'); }; });
  await page.reload();
  await page.locator('#retries-lock').click();
  await commit('retries', '8');
  await page.locator('#retries-lock').click();
  assert(!await readonly('retries'));
  assert.match(await status(), /Storage denied/);
  assert.equal(await page.locator('#retries').inputValue(), '8');
  note('Injected Storage.setItem denial reaches the real error handler and retains the draft and editing state.');
  await writeFile(`${output}/observations.json`, JSON.stringify({ browser: browser.version(), url, observations }, null, 2));
  console.log(JSON.stringify({ result: 'PASS', observations }, null, 2));
} catch (error) {
  console.error(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getClientRects().length && el.getBoundingClientRect().right > innerWidth).map(el => ({ tag: el.tagName, id: el.id, width: el.getBoundingClientRect().width }))));
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true });
  throw error;
} finally {
  await browser.close();
}
