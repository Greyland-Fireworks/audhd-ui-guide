import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// AUDHD-12 / GUIDE.md#audhd-12-validate-complete-tasks-and-report-actual-evidence:
// exercise the visible workflow and downloaded artifacts, not internal model calls.
// This is one isolated browser visit; no production account or notes service exists.
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.argv[2] || 'http://127.0.0.1:4199/examples/administration/';
  const output = 'output/playwright/administration';
  await mkdir(output, { recursive: true });
  await page.goto(`${base}#notes`);
  const shot = async name => {
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    if (name.endsWith('-narrow')) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${name}-viewport.png` });
    }
  };
  const noOverflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'The task must fit without sideways page scrolling');
  const navigate = async path => {
    if (await page.locator('#menu-toggle').isVisible() && await page.locator('#menu-toggle').getAttribute('aria-expanded') !== 'true') await page.locator('#menu-toggle').click();
    const link = page.locator(`#workspace-nav a[href="#${path}"]`);
    const parents = await link.evaluate(node => {
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
    const previousHeading = await page.locator('#main h1').elementHandle();
    const sameRoute = new URL(page.url()).hash === `#${path}`;
    await link.click();
    await page.waitForFunction(hash => location.hash === hash, `#${path}`);
    // A hash changes before its screen is rendered. Wait for the outgoing
    // heading to leave so identically named controls cannot yield stale values.
    if (!sameRoute) await previousHeading.waitForElementState('hidden');
  };
  const notesCount = async count => {
    await navigate('notes');
    await page.locator('#clear-notes').click();
    assert.equal(await page.locator('#note-count').innerText(), `${count} of ${count} active notes`);
  };
  const download = async filename => {
    const waiting = page.waitForEvent('download');
    await page.locator('#download-notes').click();
    const file = await waiting;
    assert.match(file.suggestedFilename(), /^shared-notes-.*\.json$/);
    const path = `${output}/${filename}`;
    await file.saveAs(path);
    return { path, data: JSON.parse(await readFile(path, 'utf8')) };
  };

  assert.equal(await page.locator('#note-count').innerText(), '8 of 8 active notes');
  assert.equal(await page.locator('.notebook-card').count(), 3);
  assert.equal(await page.locator('.note-rows > li').count(), 8);
  assert.equal(await page.locator('[data-notebook-id="harbor-meetings"] .notebook-count').innerText(), '3 active notes');
  assert.equal(await page.locator('[data-notebook-id="harbor-reference"] .notebook-count').innerText(), '2 active notes');
  assert.equal(await page.locator('#guide-toggle').getAttribute('aria-pressed'), 'false');
  await shot('notes-browse');
  await page.locator('#notes-filter').fill('kickoff');
  assert.equal(await page.locator('#note-count').innerText(), '1 of 8 active notes');
  assert.equal(await page.locator('.notebook-summary').innerText(), '1 of 3 shown');
  const originalLink = page.locator('.note-rows').getByRole('link', { name: 'Harbor kickoff agenda', exact: true });
  const noteHref = await originalLink.getAttribute('href');
  const noteId = noteHref.split('/')[1];
  await originalLink.click();
  const originalTitle = await page.locator('#note-title').inputValue();
  const originalBody = await page.locator('#note-body').inputValue();
  const firstBody = 'First browser revision. Keep the decision, its owner and the next action together.';
  const secondBody = 'Second browser revision. This saved text must survive navigation and remain separate from a later draft. '.repeat(3);
  await page.locator('#note-body').fill(firstBody);
  assert.match(await page.locator('#note-saved-context').innerText(), /Unsaved draft based on saved version 1/);
  await page.locator('#breadcrumbs').getByRole('link', { name: 'Notes', exact: true }).click();
  assert.equal(await page.locator('#notes-filter').inputValue(), 'kickoff');
  assert.match(await page.locator('.notebook-summary').innerText(), /1 with unsaved changes/);
  assert.match(await page.locator('.note-row .note-state').innerText(), /Unsaved changes/);
  await page.goBack();
  assert.equal(await page.locator('#note-body').inputValue(), firstBody);
  await page.locator('#note-notebookId').selectOption({ label: 'Reference' });
  await navigate('appearance');
  await page.locator('#palettes input[value="green-ledger-dark"]').locator('..').click();
  await page.goBack();
  assert.equal(await page.locator('#note-body').inputValue(), firstBody);
  assert.equal(await page.locator('#note-notebookId').inputValue(), 'harbor-reference');
  assert.match(await page.locator('#note-draft-status').innerText(), /Unsaved/);
  assert(await page.locator('#note-form .note-save-bar #save-note').isVisible());

  // A second save without leaving catches stale references to a draft removed
  // by the first save; a successful first write is insufficient evidence.
  await page.locator('#note-title').fill('Harbor kickoff — revised');
  await page.locator('#save-note').click();
  assert.match(await page.locator('#note-result').innerText(), /Saved version 2/);
  assert.match(await page.locator('#breadcrumbs').innerText(), /Reference.*Harbor kickoff — revised/s);
  assert.match(await page.locator('#main .task-heading > p').innerText(), /Reference.*Active note/);
  await page.locator('#note-body').fill(secondBody);
  assert(await page.locator('#save-note').isEnabled());
  await page.locator('#save-note').click();
  assert.match(await page.locator('#note-result').innerText(), /Saved version 3/);
  await page.locator('#note-title').fill('');
  await page.locator('#save-note').click();
  assert.equal(await page.locator('#note-title').getAttribute('aria-invalid'), 'true');
  await navigate('overview');
  await page.getByRole('link', { name: 'Harbor kickoff — revised: Correct the unsaved note', exact: true }).click();
  await page.waitForFunction(() => document.activeElement.id === 'note-title');
  assert.equal(await page.locator('#note-title').inputValue(), '');
  const savedTitle = 'Harbor kickoff — final';
  await page.locator('#note-title').fill(savedTitle);
  await page.locator('#save-note').click();
  assert.match(await page.locator('#note-result').innerText(), /Saved version 4/);
  assert.equal(await page.locator('#main h1').innerText(), savedTitle);
  await shot('notes-editor');

  await page.getByRole('link', { name: 'Saved versions (4)', exact: true }).click();
  await page.locator('#note-version').selectOption('1');
  assert.match(await page.locator('#note-version option[value="1"]').innerText(), /Version 1 · \d/);
  assert.match(await page.locator('#note-version option[value="4"]').innerText(), /Current/);
  await page.locator('.version-full-text > summary').click();
  assert.equal(await page.locator('[data-version-side="selected"] .note-copy').innerText(), originalBody);
  assert.equal(await page.locator('[data-version-side="current"] .note-copy').innerText(), secondBody);
  assert.match(await page.locator('.version-differences').innerText(), /title, notebook, note text/);
  assert.equal(await page.locator('[data-version-side="selected"] .is-different').count(), 3);
  const selectedBox = await page.locator('[data-version-side="selected"]').boundingBox();
  const currentBox = await page.locator('[data-version-side="current"]').boundingBox();
  assert(selectedBox.x + selectedBox.width <= currentBox.x, 'Desktop presents selected and current saved content side by side');
  await shot('notes-comparison');
  await page.getByRole('button', { name: 'Restore version 1 to draft', exact: true }).click();
  await page.waitForFunction(() => document.activeElement.id === 'note-body');
  assert.equal(await page.locator('#note-title').inputValue(), originalTitle);
  assert.equal(await page.locator('#note-body').inputValue(), originalBody);
  assert(await page.getByRole('link', { name: 'Saved versions (4)', exact: true }).isVisible());
  await page.locator('#note-body').fill('A newer unsaved draft must not be overwritten by history navigation.');
  await page.getByRole('link', { name: 'Saved versions (4)', exact: true }).click();
  await page.locator('#note-version').selectOption('2');
  await navigate('appearance');
  await page.goBack();
  assert.equal(await page.locator('#note-version').inputValue(), '2');
  await page.getByRole('button', { name: 'Restore version 2 to draft', exact: true }).click();
  assert(await page.locator('#restore-confirm').isVisible());
  assert.equal(await page.evaluate(() => document.activeElement.id), 'keep-note-draft');
  await shot('notes-history');
  await page.locator('#keep-note-draft').click();
  await page.getByRole('navigation', { name: 'Note views' }).getByRole('link', { name: 'Note', exact: true }).click();
  assert.equal(await page.locator('#note-body').inputValue(), 'A newer unsaved draft must not be overwritten by history navigation.');
  await page.getByRole('link', { name: 'Saved versions (4)', exact: true }).click();
  await page.locator('#note-version').selectOption('1');
  await page.getByRole('button', { name: 'Restore version 1 to draft', exact: true }).click();
  await page.locator('#replace-note-draft').click();
  await page.waitForFunction(() => document.activeElement.id === 'note-body');
  assert.equal(await page.locator('#note-body').inputValue(), originalBody);
  assert.match(await page.locator('#note-draft-status').innerText(), /Unsaved/);

  // Archive and Trash move the saved note, keeping its independent draft and
  // history available. Both paths must expose an actual restore action.
  await page.locator('#archive-note').click();
  assert.equal(await page.locator('#note-body').getAttribute('readonly'), '');
  assert.match(await page.locator('.note-editor-context').innerText(), /Read archived note.*Showing retained unsaved draft/s);
  assert((await page.locator('#restore-note').boundingBox()).y < (await page.locator('#note-title').boundingBox()).y, 'Read-only recovery is explained before the unavailable inputs');
  await notesCount(7);
  await navigate('notes/archive');
  assert.equal(await page.locator('#note-count').innerText(), '3 of 3 archived notes');
  await page.locator('.note-rows').getByRole('link', { name: savedTitle, exact: true }).click();
  assert.equal(await page.locator('#note-body').inputValue(), originalBody);
  await page.locator('#restore-note').click();
  assert.equal(await page.locator('#note-body').getAttribute('readonly'), null);
  await page.locator('#trash-note').click();
  assert.match(await page.locator('.note-editor-context').innerText(), /Read removed note/);
  await navigate('notes/trash');
  assert.equal(await page.locator('#note-count').innerText(), '3 of 3 removed notes');
  await page.locator('.note-rows').getByRole('link', { name: savedTitle, exact: true }).click();
  await page.locator('#restore-note').click();
  assert.equal(await page.locator('#note-body').inputValue(), originalBody);
  assert(await page.getByRole('link', { name: 'Saved versions (4)', exact: true }).isVisible());

  await navigate('workspace-settings');
  await page.locator('#default-notebook').selectOption({ label: 'Reference' });
  await page.locator('#max-note-length').fill('99');
  await page.getByRole('button', { name: 'Save workspace settings', exact: true }).click();
  assert.equal(await page.locator('#max-note-length').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'max-note-length');
  await page.locator('#max-note-length').fill('100');
  const usage = page.locator(`#note-length-impact .note-usage-list a[href="#note/${noteId}/body"]`).locator('..');
  assert.match(await usage.innerText(), new RegExp(`${secondBody.length} characters`));
  assert.equal(await usage.locator('meter').getAttribute('max'), '100');
  assert.equal(await usage.locator('meter').getAttribute('value'), '100');
  assert.match(await usage.locator('meter').getAttribute('aria-label'), new RegExp(`${secondBody.length-100} over`));
  await page.getByRole('button', { name: 'Save workspace settings', exact: true }).click();
  assert.match(await page.locator('#workspace-settings-saved').innerText(), /Reference; 100 characters maximum/);
  await navigate('notes/new');
  assert.equal(await page.locator('#note-notebookId').inputValue(), 'harbor-reference');
  await page.locator('#note-title').fill('Browser workflow note');
  await page.locator('#note-body').fill('x'.repeat(101));
  await page.locator('#save-note').click();
  assert.equal(await page.locator('#note-body').getAttribute('aria-invalid'), 'true');
  await page.locator('#note-body').fill('A short fictional note created through the browser workflow.');
  await page.locator('#save-note').click();
  await page.waitForFunction(() => location.hash.startsWith('#note/'));
  await page.getByRole('heading', { name: 'Browser workflow note', exact: true }).waitFor();
  assert.match(await page.locator('#note-draft-status').innerText(), /Saved version 1/);
  await navigate('workspace-settings');
  await page.locator('#max-note-length').fill('5000');
  await page.getByRole('button', { name: 'Save workspace settings', exact: true }).click();
  await notesCount(9);

  // Parse the real browser download. The current editor draft is deliberately
  // an older snapshot, so this distinguishes saved-only export from UI values.
  await navigate('exports');
  const exported = await download('notes-export.json');
  assert.equal(exported.data.format, 'shared-notes');
  assert.equal(exported.data.notes.length, 13);
  assert.equal(exported.data.notebooks.length, 3);
  const savedNote = exported.data.notes.find(note => note.id === noteId);
  assert.equal(savedNote.title, savedTitle);
  assert.equal(savedNote.body, secondBody);
  assert.equal(savedNote.version, 4);
  assert.equal(savedNote.notebookId, 'harbor-reference');
  assert.equal(savedNote.history.length, 4);
  assert.equal(savedNote.history[0].body, originalBody);
  assert.equal(exported.data.settings, undefined);
  await page.locator('#import-notes-file').setInputFiles(exported.path);
  await page.getByRole('heading', { name: 'Preview: 13 notes in 3 notebooks', exact: true }).waitFor();
  await shot('notes-transfer');
  await notesCount(9);
  await navigate('exports');
  assert(await page.locator('#import-copies').isVisible());

  // A valid preview cannot bypass a subsequently changed workspace limit.
  // Rejection leaves every existing record and the reviewable preview intact.
  await navigate('workspace-settings');
  await page.locator('#max-note-length').fill('100');
  await page.getByRole('button', { name: 'Save workspace settings', exact: true }).click();
  await navigate('exports');
  await page.locator('#import-copies').click();
  assert.match(await page.locator('#import-notes-error').innerText(), /100 characters/);
  await notesCount(9);
  await navigate('workspace-settings');
  await page.locator('#max-note-length').fill('5000');
  await page.getByRole('button', { name: 'Save workspace settings', exact: true }).click();
  await navigate('exports');
  await page.locator('#import-copies').click();
  assert.match(await page.locator('#import-notes-status').innerText(), /Imported 13 note copies in 3 new notebooks/);
  assert.equal(await page.locator('#import-copies').count(), 0);
  const copied = await download('notes-after-import.json');
  assert.equal(copied.data.notes.length, 26);
  assert.equal(copied.data.notebooks.length, 6);
  assert.equal(new Set(copied.data.notes.map(note => note.id)).size, 26);
  const originalIds = new Set(exported.data.notes.map(note => note.id));
  const newNotes = copied.data.notes.filter(note => !originalIds.has(note.id));
  assert.equal(newNotes.length, 13);
  assert(newNotes.every(note => note.version === 1 && note.history.length === 1));
  assert.deepEqual(copied.data.notes.find(note => note.id === noteId), savedNote);
  assert.equal(new Set(copied.data.notebooks.map(book => book.name.toLowerCase())).size, 6);
  await notesCount(18);
  await navigate('directory');
  const historyHref = `${noteHref}/history`;
  assert.equal(await page.locator(`#page-directory a[href="${historyHref}"]`).innerText(), 'Saved versions');
  await page.locator('#page-filter').fill('Saved versions');
  await page.locator(`#page-directory a[href="${historyHref}"]`).click();
  await page.locator('#note-version').waitFor();
  assert.match(await page.locator('#breadcrumbs').innerText(), /Saved versions/);
  await page.goBack();
  assert.equal(await page.locator('#page-filter').inputValue(), 'Saved versions');
  await page.getByRole('button', { name: 'Clear filter', exact: true }).click();
  // The imported copy has the same title; choose the original by its observed URL.
  await page.locator(`#page-directory a[href="${noteHref}"]`).click();
  assert.equal(await page.locator('#note-body').inputValue(), originalBody);
  assert.equal(await page.locator('#note-title').inputValue(), originalTitle);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  await noOverflow(); await shot('notes-editor-narrow');
  await page.getByRole('link', { name: 'Saved versions (4)', exact: true }).click();
  await page.locator('#note-version').selectOption('2');
  if (await page.locator('.version-full-text').getAttribute('open') === null) await page.locator('.version-full-text > summary').click();
  await noOverflow(); await shot('notes-comparison-narrow');
  const stackedSelected = await page.locator('[data-version-side="selected"]').boundingBox();
  const stackedCurrent = await page.locator('[data-version-side="current"]').boundingBox();
  assert(stackedCurrent.y >= stackedSelected.y + stackedSelected.height, 'Narrow comparison keeps whole labeled versions in reading order');
  const changeSides = page.locator('.version-change[data-change="0"] .version-change-side');
  const selectedChange = await changeSides.nth(0).boundingBox(), currentChange = await changeSides.nth(1).boundingBox();
  assert(currentChange.y >= selectedChange.y + selectedChange.height, 'Narrow changes keep each selected/current pair adjacent');
  await navigate('notes');
  await noOverflow(); await shot('notes-browse-narrow');
  await navigate('exports');
  await page.locator('#import-notes-file').setInputFiles(exported.path);
  await page.locator('#import-copies').waitFor();
  await noOverflow(); await shot('notes-transfer-narrow');
  assert.deepEqual(errors, []);

  // Exercise a real multi-line change in a separate visit, then use narrowly
  // scoped pure cases for repeated lines and the bounded large-span fallback.
  const comparison = await browser.newPage({viewport:{width:1280,height:900}});
  comparison.on('pageerror', error => errors.push(error.message));
  await comparison.goto(`${base}#note/harbor-kickoff`);
  const beforeLines = 'Keep the opening.\nDecision: meet Tuesday.\nKeep this context.\nOwner: Mira.\nKeep the close.';
  const afterLines = 'Keep the opening.\nDecision: meet Thursday.\nKeep this context.\nOwner: Sam.\nKeep the close.';
  await comparison.locator('#note-body').fill(beforeLines); await comparison.locator('#save-note').click();
  await comparison.locator('#note-body').fill(afterLines); await comparison.locator('#save-note').click();
  await comparison.getByRole('link',{name:'Saved versions (3)',exact:true}).click();
  await comparison.locator('#note-version').selectOption('2');
  assert.equal(await comparison.locator('.version-change[data-change]').count(),2);
  assert.deepEqual(await comparison.locator('.version-change[data-change="0"] .note-copy').allTextContents(),['Decision: meet Tuesday.','Decision: meet Thursday.']);
  assert.deepEqual(await comparison.locator('.version-change[data-change="1"] .note-copy').allTextContents(),['Owner: Mira.','Owner: Sam.']);
  assert(!(await comparison.locator('.version-change-list').innerText()).includes('Keep this context'));
  await comparison.locator('.version-full-text > summary').click();
  assert.equal(await comparison.locator('[data-version-side="selected"] .note-copy').innerText(),beforeLines);
  assert.equal(await comparison.locator('[data-version-side="current"] .note-copy').innerText(),afterLines);
  const diffCases = await comparison.evaluate(async () => {
    const {compareNoteLines} = await import('./notes.js');
    return {
      same:compareNoteLines('same','same'),
      repeated:compareNoteLines('a\nkeep\nx\nkeep\nz','a\nkeep\ny\nkeep\nz'),
      inserted:compareNoteLines('a\nc','a\nb\nc'),
      blank:compareNoteLines('a\n','a\n\n'),
      large:compareNoteLines(Array.from({length:600},(_,i)=>`before ${i}`).join('\n'),Array.from({length:600},(_,i)=>`after ${i}`).join('\n')),
    };
  });
  assert.deepEqual(diffCases.same.changes,[]);
  assert.deepEqual(diffCases.repeated.changes,[{before:['x'],after:['y'],beforeLine:3,afterLine:3}]);
  assert.deepEqual(diffCases.inserted.changes,[{before:[],after:['b'],beforeLine:2,afterLine:2}]);
  assert.deepEqual(diffCases.blank.changes[0].after,['']);
  assert.equal(diffCases.large.coarse,true);
  assert.equal(diffCases.large.changes[0].before.length,600);
  await comparison.close();
  assert.deepEqual(errors, []);
  console.log('PASS: notebook counts/previews, retained drafts/filter/appearance, consecutive saves, linked validation, directory history discovery, dated versions, exact changed-line pairs/full saved text and guarded restoration, early archive/trash recovery, proposed length limits, real JSON transfer, desktop/narrow enlarged layouts.');
} finally { await browser.close(); }
