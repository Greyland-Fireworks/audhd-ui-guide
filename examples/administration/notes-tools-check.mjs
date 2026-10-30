import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:4199/examples/administration/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const heading = name => page.getByRole('heading', { name, exact: true }).waitFor();
const navigate = async path => {
  if(await page.locator('#menu-toggle').isVisible() && await page.locator('#menu-toggle').getAttribute('aria-expanded')!=='true') await page.locator('#menu-toggle').click();
  const link=page.locator(`#workspace-nav a[href="#${path}"]`);
  const parents=await link.evaluate(node=>{
    const keys=[];
    for(let parent=node.parentElement;parent;parent=parent.parentElement) if(parent.classList.contains('nav-group')) {
      const toggle=parent.querySelector(':scope > .nav-parent > [data-branch]');
      if(toggle) keys.unshift(toggle.dataset.branch);
    }
    return keys;
  });
  for(const key of parents) {
    const toggle=page.locator(`[data-branch="${key}"]`);
    if(await toggle.getAttribute('aria-expanded')==='false') await toggle.click();
  }
  await link.click();
};
const upload = (name, value) => page.locator('#import-notes-file').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.isBuffer(value) ? value : Buffer.from(value) });

try {
  await page.goto(`${base}#notebooks/new/name`); await heading('Notebooks');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'notebook-new-name');
  assert((await page.locator('.new-notebook-editor > summary').boundingBox()).y < (await page.locator('[data-notebook="harbor-meetings"]').boundingBox()).y, 'Notebook creation precedes the existing notebook editors');
  assert.equal(await page.locator('[data-notebook-editor="harbor-meetings"]').getAttribute('open'),null);
  assert.deepEqual(await page.locator('[data-notebook="harbor-meetings"] .notebook-counts dd').allTextContents(), ['3','1','1']);
  assert.equal(await page.locator('[data-notebook="harbor-meetings"] .notebook-previews a').count(), 2);
  await page.locator('[data-notebook-editor="harbor-meetings"] > summary').click();
  await page.locator('#notebook-harbor-meetings-name').fill('Draft meeting name');
  await page.locator('[data-notebook-editor="harbor-meetings"] > summary').click();
  assert.match(await page.locator('[data-notebook-editor="harbor-meetings"] > summary').innerText(),/unsaved changes/);
  assert.equal(await page.locator('#notebook-harbor-meetings-name').inputValue(),'Draft meeting name');
  await page.locator('#notebook-new-name').fill('Reference');
  await page.locator('[data-notebook="new"] button[type=submit]').click();
  assert.match(await page.locator('#notebook-new-errors').innerText(), /already uses this name/);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'notebook-new-name');
  await navigate('workspace-settings'); await heading('Workspace settings');
  assert.match(await page.locator('.task-heading p').innerText(), /saving any note/);
  assert.match(await page.locator('#note-limit-summary').innerText(), /0 notes exceed.*5,000/);
  assert.equal(await page.locator('#note-length-impact meter').count(), 3);
  await page.locator('#max-note-length').fill('100');
  assert.match(await page.locator('#note-limit-summary').innerText(), /notes exceed.*100-character/);
  assert(await page.locator('#note-length-impact .over-limit').count() > 0);
  await page.locator('[data-guide-key="note-limit-affected"] summary').click();
  await page.locator('#default-notebook').selectOption({label:'Reference'});
  assert.equal(await page.locator('[data-guide-key="note-limit-affected"]').getAttribute('open'), '', 'A related settings edit must retain the open impact review');
  await page.locator('#max-note-length').fill('101');
  assert.equal(await page.locator('[data-guide-key="note-limit-affected"]').getAttribute('open'), '', 'Recalculating the maximum must retain the open impact review');
  await page.locator('#max-note-length').fill('100');
  const savedSettingsText = await page.locator('#workspace-settings-saved').innerText();
  assert.match(savedSettingsText, /5,000/);
  await page.locator('#note-length-impact .note-usage-list a').first().click();
  await page.locator('#note-body').waitFor();
  await page.waitForFunction(() => document.activeElement.id === 'note-body');
  await page.goBack(); await heading('Workspace settings');
  assert.equal(await page.locator('#max-note-length').inputValue(), '100');
  assert.equal(await page.locator('#workspace-settings-saved').innerText(), savedSettingsText);
  await page.locator('#max-note-length').fill('');
  assert.equal(await page.locator('#note-length-impact meter').count(), 0);
  assert.match(await page.locator('#note-limit-summary').innerText(), /Enter a whole number/);
  await page.locator('#discard-workspace-settings').click();
  assert.equal(await page.locator('#max-note-length').inputValue(), '5000');
  await navigate('notebooks'); await heading('Notebooks');
  assert.equal(await page.locator('#notebook-harbor-meetings-name').inputValue(), 'Draft meeting name');
  assert.equal(await page.locator('[data-notebook-editor="harbor-meetings"]').getAttribute('open'),null, 'Returning keeps an intentionally closed editor closed without discarding it');
  assert.match(await page.locator('#notebook-new-errors').innerText(), /already uses/);
  await page.locator('#notebook-new-name').fill('Test notebook');
  await page.locator('[data-notebook="new"] button[type=submit]').click();
  assert.match(await page.locator('#notebook-notice').innerText(), /Test notebook created/);
  assert.equal(await page.locator('#notebook-harbor-meetings-name').inputValue(), 'Draft meeting name');

  await navigate('exports'); await heading('Import & export notes');
  await upload('large.json', Buffer.alloc(10_000_001));
  await page.waitForFunction(() => document.querySelector('#import-notes-error').textContent.includes('larger than 10 MB'));
  assert.equal(await page.locator('#import-notes-file').getAttribute('aria-invalid'), 'true');

  // A controlled read barrier makes navigation and stale-response checks
  // deterministic. The actual parser and view handlers still process each file.
  const data = await page.evaluate(async () => {
    const model = await import('./notes-state.js');
    const original = File.prototype.text;
    File.prototype.text = function () {
      return this.name === 'delayed.json' ? new Promise((resolve, reject) => {
        window.releaseFileRead = () => original.call(this).then(resolve, reject);
      }) : original.call(this);
    };
    return model.exportNotes();
  });
  await upload('delayed.json', JSON.stringify(data));
  await navigate('overview'); await heading('Team overview');
  await page.evaluate(async () => { await window.releaseFileRead(); await new Promise(resolve => setTimeout(resolve, 0)); });
  assert.equal(await page.locator('h1').innerText(), 'Team overview');
  await navigate('exports'); await heading('Import & export notes');
  await heading('Preview: 12 notes in 4 notebooks');
  await upload('delayed.json', JSON.stringify(data));
  await upload('broken.json', '{broken');
  await page.waitForFunction(() => document.querySelector('#import-notes-error').textContent.includes('could not be read as JSON'));
  await page.evaluate(async () => { await window.releaseFileRead(); await new Promise(resolve => setTimeout(resolve, 0)); });
  assert.equal(await page.locator('#import-copies').count(), 0);
  assert.match(await page.locator('#import-notes-error').innerText(), /could not be read as JSON/);
  assert.equal(await page.locator('#import-notes-file').evaluate(input => input.files[0].name), 'broken.json');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${base}#workspace-settings/maxNoteLength`); await heading('Workspace settings');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'max-note-length');
  await navigate('exports'); await heading('Import & export notes');
  // Controlled saved history exercises the export boundary without thousands
  // of unrelated editor actions. It never touches production data or a backend.
  await page.evaluate(async () => {
    const { notes } = await import('./notes-state.js');
    notes[0].history = Array.from({ length: 2100 }, (_, index) => ({ version: index + 1, title: 'Boundary test', body: 'x'.repeat(5000), notebookId: notes[0].notebookId, at: notes[0].updatedAt }));
  });
  let downloads = 0;
  page.on('download', () => downloads++);
  await page.locator('#download-notes').click();
  await page.waitForFunction(() => document.querySelector('#download-notes-status').textContent.startsWith('No file was downloaded'));
  assert.equal(downloads, 0);
  assert.equal(await page.evaluate(async () => (await import('./notes-state.js')).notes[0].history.length), 2100);
  assert.match(await page.locator('#download-notes-status').innerText(), /10 MB/);
  assert.deepEqual(errors, []);
  console.log('PASS: notebook counts/previews, independent drafts and validation, proposed-limit impact and retained settings, deep-link focus, import size/JSON checks, hidden-page completion, stale-read protection, retained file selection, narrow enlarged layout and oversize export without truncation.');
} finally {
  await browser.close();
}
