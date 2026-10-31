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
  assert.equal(await page.locator('#note-length-impact meter').count(), 1);
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

  // The teaching walkthrough uses the same save boundary as an ordinary note.
  // Changing permission mid-edit must retain proposed values and guard a direct
  // mutation as well as the visible button; an explanation alone is not a guard.
  await page.reload(); await heading('Import & export notes');
  await navigate('workspace-settings'); await heading('Workspace settings');
  await page.locator('#max-note-length').fill('100');
  const affected = await page.evaluate(async () => (await import('./notes-state.js')).notes.filter(note => note.body.length > 100).length);
  assert.match(await page.locator('#note-limit-summary').innerText(), new RegExp(`^${affected} notes exceed`));
  await page.evaluate(async () => (await import('./scenario-state.js')).setConfigurationReadOnly(true));
  assert(await page.locator('#note-settings-permission').isVisible());
  assert(await page.locator('#save-note-settings').isDisabled());
  assert.equal(await page.locator('#max-note-length').inputValue(), '100');
  assert.equal(await page.evaluate(async () => {
    const model = await import('./notes-state.js');
    return model.saveWorkspaceSettings({ ...model.settings, maxNoteLength:100 }).ok;
  }), false);
  assert.equal(await page.evaluate(async () => (await import('./notes-state.js')).settings.maxNoteLength), 5000);
  await page.evaluate(async () => (await import('./scenario-state.js')).setConfigurationReadOnly(false));
  assert(await page.locator('#save-note-settings').isEnabled());
  await page.locator('#save-note-settings').click();
  assert.match(await page.locator('#workspace-settings-saved').innerText(), /Effective now for note creation, saves and imports/);
  assert.equal(await page.evaluate(async () => (await import('./notes-state.js')).notes.filter(note => note.body.length > 100).length), affected, 'A reduced limit must not truncate stored text');
  await page.locator('#guide-toggle').click();
  await page.locator('#workspace-defaults-design > summary').click();
  await page.locator('#prepare-note-limit-example').click();
  await heading('New note');
  assert.equal((await page.locator('#note-body').inputValue()).length, 101);
  const exampleBody = await page.locator('#note-body').inputValue();
  await page.locator('#save-note').click();
  assert.equal(await page.locator('#note-body').inputValue(), exampleBody);
  assert.equal(await page.locator('#note-body').getAttribute('aria-invalid'), 'true');
  await navigate('workspace-settings'); await heading('Workspace settings');
  await page.locator('#prepare-note-limit-example').click();
  assert.match(await page.locator('#note-example-result').innerText(), /existing new-note draft is retained/);
  await page.locator('#note-example-result a').click(); await heading('New note');
  assert.equal(await page.locator('#note-body').inputValue(), exampleBody);
  await page.locator('#note-body').fill('A corrected example note that fits the saved limit.');
  await page.locator('#save-note').click();
  await heading('Example: note length limit');
  assert.match(await page.locator('#note-draft-status').innerText(), /Saved version 1/);

  // Notebook responses are deliberately controlled here. The rendered directory
  // must preserve its rename editor during loading, distinguish a partial reply
  // from an empty one, retain stale results and ignore an older delayed answer.
  await navigate('notebooks'); await heading('Notebooks');
  await page.locator('[data-notebook-editor="harbor-meetings"] > summary').click();
  await page.locator('#notebook-harbor-meetings-name').fill('Keep this notebook draft');
  await page.locator('[data-notebook-editor="new"] > summary').click();
  await page.locator('#notebook-new-name').fill('Keep this new notebook');
  const notebookInput = page.locator('#notebook-harbor-meetings-name');
  await notebookInput.evaluate(input => window.permissionNotebookInput = input);
  await page.evaluate(async () => (await import('./scenario-state.js')).setConfigurationReadOnly(true));
  for (const id of ['harbor-meetings','new']) {
    assert(await page.locator(`#notebook-${id}-permission`).isVisible());
    assert(await page.locator(`#notebook-${id}-name`).isDisabled());
    assert(await page.locator(`#notebook-${id}-description`).isDisabled());
    assert(await page.locator(`[data-notebook="${id}"] button[type=submit]`).isDisabled());
    assert(await page.locator(`[data-notebook="${id}"] [data-discard]`).isEnabled(), 'Read-only configuration still permits deliberate local draft discard');
  }
  assert.equal(await notebookInput.evaluate(input => input === window.permissionNotebookInput), true, 'Permission changes must update availability without recreating edited fields');
  assert.deepEqual(await page.evaluate(async () => {
    const model = await import('./notes-state.js');
    const before = JSON.stringify(model.notebooks);
    return [model.saveNotebook({ ...model.notebooks[0], name:'Forbidden rename' }).ok, model.saveNotebook({ name:'Forbidden create', description:'' }).ok, JSON.stringify(model.notebooks) === before];
  }), [false,false,true]);
  await navigate('overview'); await heading('Team overview');
  await navigate('notebooks'); await heading('Notebooks');
  assert(await notebookInput.isDisabled(), 'Returning while read-only retains the restriction');
  assert.equal(await notebookInput.inputValue(), 'Keep this notebook draft');
  assert.equal(await page.locator('#notebook-new-name').inputValue(), 'Keep this new notebook');
  await page.evaluate(async () => (await import('./scenario-state.js')).setConfigurationReadOnly(false));
  assert(await notebookInput.isEnabled());
  assert(await page.locator('[data-notebook="new"] button[type=submit]').isEnabled());
  assert.equal(await page.locator('#notebook-harbor-meetings-permission').isVisible(), false);
  await page.locator('#notebook-harbor-meetings-name').evaluate(input => window.retainedNotebookInput = input);
  await page.evaluate(async () => (await import('./scenario-state.js')).setDataMode('notebooks', 'loading'));
  assert.match(await page.locator('#notebook-load-status').innerText(), /Loading notebooks/);
  await page.evaluate(async () => (await import('./scenario-state.js')).setDataMode('notebooks', 'partial'));
  await page.waitForFunction(() => document.querySelector('#notebook-load-status').textContent.startsWith('Partial results:'));
  assert.match(await page.locator('#notebook-load-status').innerText(), /Reference.*loaded notes only/);
  assert.equal(await page.locator('[data-notebook="harbor-reference"] .notebook-counts').count(), 0);
  assert.match(await page.locator('[data-notebook="harbor-reference"] .notebook-snapshot').innerText(), /counts are unavailable/);
  await page.waitForTimeout(750);
  assert.match(await page.locator('#notebook-load-status').innerText(), /^Partial results:/, 'An older delayed success cannot replace the newer partial response');
  assert.equal(await page.locator('#notebook-harbor-meetings-name').inputValue(), 'Keep this notebook draft');
  assert.equal(await page.locator('#notebook-harbor-meetings-name').evaluate(input => input === window.retainedNotebookInput), true);
  const retainedCounts = await page.locator('[data-notebook="harbor-meetings"] .notebook-counts dd').allTextContents();
  await page.evaluate(async () => (await import('./scenario-state.js')).setDataMode('notebooks', 'failure'));
  await page.waitForFunction(() => document.querySelector('#notebook-load-status').textContent.includes('may be out of date'));
  assert.match(await page.locator('#notebook-load-status').innerText(), /Last successful load:/);
  assert.deepEqual(await page.locator('[data-notebook="harbor-meetings"] .notebook-counts dd').allTextContents(), retainedCounts);
  assert(await page.getByRole('button', {name:'Retry loading notebooks', exact:true}).isVisible());
  await page.evaluate(async () => (await import('./scenario-state.js')).setDataMode('notebooks', 'normal'));
  await page.waitForFunction(() => document.querySelector('#notebook-load-status').textContent.startsWith('Notebook list loaded.'));
  assert.equal(await page.locator('[data-notebook="harbor-reference"] .notebook-counts dd').count(), 3);
  const realBefore = Date.now();
  await page.evaluate(async () => (await import('./scenario-state.js')).advanceScenarioTime(86_400_000));
  await page.locator('#refresh-notebooks').click();
  await page.waitForFunction(() => document.querySelector('#notebook-load-status').textContent.startsWith('Notebook list loaded.'));
  const actualObservation = await page.evaluate(async () => Date.parse((await import('./notes.js')).notebookData().at));
  assert(actualObservation >= realBefore && actualObservation <= Date.now(), 'Notebook freshness uses observation time rather than the export allowance clock');

  await navigate('overview'); await heading('Team overview');
  await page.evaluate(async () => {
    const scenarios = await import('./scenario-state.js');
    scenarios.replaceScenario('normal'); scenarios.setDataMode('notebooks','failure');
  });
  await navigate('notebooks'); await heading('Notebooks');
  await page.waitForFunction(() => document.querySelector('#notebook-load-status').textContent.includes('does not mean the workspace is empty'));
  assert.equal(await page.locator('.notebook-counts').count(), 0, 'Failed first load cannot fabricate zero counts');
  await page.evaluate(async () => (await import('./scenario-state.js')).replaceScenario('empty'));
  assert.deepEqual(await page.locator('.notebook-counts dd').allTextContents(), Array(9).fill('0'));
  assert.match(await page.locator('#notebook-load-status').innerText(), /^Notebook list loaded/);
  await page.evaluate(async () => (await import('./scenario-state.js')).replaceScenario('busy'));
  await navigate('notes'); await heading('Notes');
  assert.equal(await page.locator('[data-notebook-id="harbor-meetings"] .note-row').count(), 6);
  const firstTitle = await page.locator('[data-notebook-id="harbor-meetings"] .note-row a').first().innerText();
  await page.locator('[data-notebook-id="harbor-meetings"]').getByRole('button', {name:'Next notes',exact:true}).click();
  assert.notEqual(await page.locator('[data-notebook-id="harbor-meetings"] .note-row a').first().innerText(), firstTitle);
  assert.match(await page.locator('[data-notebook-id="harbor-meetings"] .notebook-pagination').innerText(), /Page 2 of/);
  await page.locator('#notes-filter').fill('Harbor');
  await page.evaluate(async () => (await import('./scenario-state.js')).setDataMode('notebooks', 'partial'));
  await page.waitForFunction(() => document.querySelector('#note-count').textContent.includes('incomplete result'));
  assert.equal(await page.locator('#notes-filter').inputValue(), 'Harbor');
  assert.deepEqual(errors, []);
  console.log('PASS: notebook counts/previews, independent drafts and validation, note-limit walkthrough and mutation restrictions, partial/stale/empty/loading notebook results and response races, busy pagination, deep-link focus, import size/JSON checks, hidden-page completion, stale-read protection, retained file selection, narrow enlarged layout and oversize export without truncation.');
} catch (error) {
  console.error(await page.locator('main').innerText());
  throw error;
} finally {
  await browser.close();
}
