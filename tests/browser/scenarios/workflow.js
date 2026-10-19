export default async (page) => {
  const baseURL = new URL(page.url()).origin;
  const requests = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  const results = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const pass = id => results.push({ id, status: 'Pass' });
  const note = page.getByRole('textbox', { name: 'Review note', exact: true });
  const status = page.getByRole('combobox', { name: 'Review status', exact: true });
  const search = page.getByRole('searchbox', { name: 'Find a recording' });
  const save = page.getByRole('button', { name: 'Save review', exact: true });
  const help = page.getByRole('button', { name: 'About these timings' });
  const select = name => page.getByRole('button', { name: new RegExp(`^Review(?:ing)? ${name}$`) }).click();
  const workspaceNav = page.getByRole('navigation', { name: 'Workspace sections', exact: true });
  const preferences = () => workspaceNav.getByRole('link', { name: 'Workspace preferences', exact: true }).click();
  const resume = () => workspaceNav.getByRole('link', { name: 'Recordings', exact: true }).click();
  const feedback = () => page.locator('#save-feedback').innerText();
  const openDemo = async () => {
    const summary = page.locator('summary').filter({ hasText: /^Demo save controls$/ });
    if (!await summary.evaluate(el => el.parentElement.open)) await summary.click();
  };
  const resolve = async (id, outcome) => {
    await openDemo();
    await page.getByRole('group', { name: new RegExp(`${id} · Attempt`) })
      .getByRole('button', { name: outcome === 'saved' ? 'Complete save' : 'Fail save', exact: true }).click();
  };
  const fresh = async () => {
    await page.goto(baseURL);
    await note.waitFor();
  };

  await fresh();
  assert(await page.getByRole('heading', { name: 'Harbor morning REC-001' }).isVisible(), 'Initial record');
  assert(await page.getByText('3 recordings:', { exact: true }).isVisible(), 'Initial count introduces the list');
  assert(await page.getByRole('list', { name: '3 recordings:', exact: true }).getByRole('listitem').count() === 3, 'Count labels its actual children');
  assert(await note.inputValue() === '' && await status.inputValue() === 'Not reviewed', 'Initial review');
  assert(await save.isDisabled(), 'Initially clean');
  assert(await page.evaluate(() => document.activeElement === document.body), 'No initial focus movement');
  assert(await page.getByText('Demo workspace. Reviews are stored only while this page is open. Reloading or closing it resets the demo.', { exact: true }).isVisible(), 'Honest boundary');
  pass('REF-01');

  for (const [query, name] of [[' market ', 'Market loop'], ['2026-01-17', 'Forest evening'], ['303', 'Forest evening'], ['rec-002', 'Market loop']]) {
    await search.fill(query);
    assert(await page.getByText('1 recording:', { exact: true }).isVisible(), `Count: ${query}`);
    assert(await page.getByRole('button', { name: `Review ${name}`, exact: true }).isVisible(), `Match: ${query}`);
  }
  await page.getByRole('button', { name: 'Clear search' }).click();
  assert(await search.evaluate(el => el === document.activeElement), 'Focus returns when Clear disappears');
  assert((await page.locator('.recording-list button').allTextContents()).join('|') === 'Reviewing Harbor morning|Review Market loop|Review Forest evening', 'Stable order and current action');
  pass('REF-02');

  await status.selectOption('Needs follow-up');
  await note.fill('Check pause accounting');
  for (const query of ['Market', 'no-such-record']) {
    await search.fill(query);
    assert(await note.inputValue() === 'Check pause accounting', 'Excluded draft retained');
    assert(await page.getByRole('heading', { name: 'Harbor morning REC-001' }).isVisible(), 'Selection retained');
    assert(await page.getByText('Current recording is outside these search results.', { exact: true }).isVisible(), 'Exclusion explained');
    assert(await page.locator('.current-record,.relationship-cue').count() === 0, 'Excluded selection does not decorate unrelated results');
  }
  assert(await page.getByText('No recordings match this search', { exact: true }).isVisible(), 'Empty state');
  pass('REF-03');

  await page.getByRole('button', { name: 'Clear search' }).click();
  await select('Market loop');
  assert(await page.getByRole('heading', { name: 'Market loop REC-002' }).evaluate(el => el === document.activeElement), 'Selection focus');
  await note.fill('Market draft');
  await select('Harbor morning');
  assert(await note.inputValue() === 'Check pause accounting' && await status.inputValue() === 'Needs follow-up', 'First draft retained');
  await select('Market loop');
  assert(await note.inputValue() === 'Market draft', 'Second draft independent');
  const currentAction = page.getByRole('button', { name: 'Reviewing Market loop', exact: true });
  assert(await currentAction.getAttribute('aria-current') === 'true' && await currentAction.getAttribute('aria-controls') === 'review-panel', 'Current action identifies its detail region');
  assert(await page.getByRole('button', { name: 'Review Harbor morning', exact: true }).getAttribute('aria-current') === null, 'Previous action is no longer current');
  await currentAction.click();
  assert(await page.locator('#review-heading').evaluate(el => el === document.activeElement) && await note.inputValue() === 'Market draft', 'Current action returns focus without resetting the draft');
  pass('REF-04');

  await help.click();
  assert(await help.getAttribute('aria-expanded') === 'true', 'Disclosure expanded');
  await page.getByText('Simulation duration measures time in the simulated world.', { exact: false }).waitFor();
  for (const [name, simulation, execution] of [['Harbor morning', '42 min', '58 min'], ['Market loop', '20 min', '24 min'], ['Forest evening', '35 min', '46 min']]) {
    await select(name);
    assert(await page.locator('.timing-facts').getByText(simulation, { exact: true }).isVisible(), 'Simulation matches identity');
    assert(await page.locator('.timing-facts').getByText(execution, { exact: true }).isVisible(), 'Execution matches identity');
    assert(await page.getByText('America/New_York · UTC−05:00', { exact: true }).isVisible(), 'Time zone visible');
  }
  pass('REF-05');

  await select('Harbor morning');
  await save.click();
  await search.fill('Harbor');
  await preferences();
  for (const [label, value] of [['Text size', 'larger'], ['Spacing', 'compact'], ['Detailed help', 'collapsed']]) {
    const control = page.getByRole('combobox', { name: label, exact: true });
    await control.focus();
    await control.selectOption(value);
    assert(await control.evaluate(el => el === document.activeElement), `${label}: focus retained`);
  }
  await resume();
  assert(await note.inputValue() === 'Check pause accounting' && await search.inputValue() === 'Harbor', 'Adaptation retains context');
  assert(await feedback() === 'Saving review.', 'Pending request retained across adaptation');
  assert(await page.locator('main').evaluate(el => getComputedStyle(el).fontSize) === '20px', 'Larger text applied');
  assert(await page.locator('.review-form').evaluate(el => getComputedStyle(el).rowGap) === '8px', 'Compact gap applied');
  await help.click();
  await preferences();
  assert(await page.getByRole('combobox', { name: 'Detailed help', exact: true }).inputValue() === 'expanded', 'Two-way help setting');
  await resume();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await select('Market loop');
  await preferences();
  assert(await page.getByRole('combobox', { name: 'Text size', exact: true }).inputValue() === 'larger', 'Choices survive record change');
  await resume();
  pass('REF-06');

  await select('Harbor morning');
  assert(await save.isDisabled() && await note.isEnabled(), 'Pending saves block duplicate, not editing');
  assert(await page.getByText('Save in progress.', { exact: true }).isVisible(), 'Disabled reason');
  await openDemo();
  assert(await page.getByRole('group', { name: /REC-001 · Attempt/ }).count() === 1, 'One pending attempt');
  pass('REF-07');

  await resolve('REC-001', 'failed');
  assert((await feedback()).startsWith('Save failed.'), 'Failure visible');
  assert(await note.inputValue() === 'Check pause accounting' && await save.isEnabled(), 'Failure retains draft');
  assert(await page.getByRole('heading', { name: 'Demo save controls', exact: true }).evaluate(el => el === document.activeElement), 'Resolver focus fallback');
  await note.fill('Retry current edits');
  await save.click();
  await resolve('REC-001', 'saved');
  assert(await feedback() === 'Saved in this demo.' && await save.isDisabled(), 'Retry saves current content');
  pass('REF-08');

  await note.fill('First');
  await save.click();
  await note.fill('Second');
  assert((await feedback()).startsWith('Saving earlier edits'), 'Pending snapshot distinguished');
  await resolve('REC-001', 'saved');
  assert(await note.inputValue() === 'Second' && (await feedback()).startsWith('Earlier edits saved'), 'Acknowledgment does not overwrite newer draft');
  await save.click();
  await resolve('REC-001', 'saved');
  assert(await feedback() === 'Saved in this demo.' && await save.isDisabled(), 'Second snapshot acknowledged');
  pass('REF-09');

  await fresh();
  await note.fill('Harbor pending');
  await save.click();
  await select('Market loop');
  await note.fill('Market pending');
  await save.click();
  await select('Forest evening');
  await openDemo();
  await note.focus();
  const scrollBefore = await page.evaluate(() => scrollY);
  for (const id of ['REC-002', 'REC-001']) {
    // A programmatic simulator response must not steal focus from the active editor.
    await page.getByRole('group', { name: new RegExp(`${id} · Attempt`) })
      .getByRole('button', { name: 'Complete save', exact: true }).evaluate(button => button.click());
    assert(await note.evaluate(el => el === document.activeElement), 'Background completion retains editor focus');
    assert(await page.evaluate(() => scrollY) === scrollBefore, 'Background completion retains scroll');
  }
  assert(await page.getByRole('heading', { name: 'Forest evening REC-003' }).isVisible(), 'Reverse completions preserve selection');
  assert(await note.inputValue() === '' && await feedback() === 'No unsaved changes.', 'No false current success');
  await select('Harbor morning');
  assert(await note.inputValue() === 'Harbor pending' && await feedback() === 'Saved in this demo.', 'First outcome scoped');
  await select('Market loop');
  assert(await note.inputValue() === 'Market pending' && await feedback() === 'Saved in this demo.', 'Second outcome scoped');
  results.push({ id: 'REF-10', status: 'Pass', note: 'Background responses preserve editor focus and scroll. Duplicate/stale resolution and unchanged unrelated state are additionally asserted by npm test.' });

  await note.fill('Changed');
  await save.click();
  await resolve('REC-002', 'failed');
  await note.fill('Market pending');
  assert(await save.isDisabled() && !(await feedback()).includes('failed'), 'Revert clears obsolete failure');
  pass('REF-11');

  await page.reload();
  await note.waitFor();
  assert(await note.inputValue() === '' && await status.inputValue() === 'Not reviewed', 'Reload resets review');
  assert(await page.getByRole('heading', { name: 'Market loop REC-002' }).isVisible(), 'Reload restores URL location');
  assert(await search.inputValue() === '', 'Reload resets query');
  assert(await page.locator('main').getAttribute('data-text-size') === 'standard' && await page.locator('main').getAttribute('data-spacing') === 'comfortable', 'Reload resets choices');
  assert(await help.getAttribute('aria-expanded') === 'false', 'Reload resets help');
  assert(await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0), 'No web storage');
  assert(requests.every(request => request.method === 'GET' && new URL(request.url).origin === baseURL), 'Only same-origin static resources requested');
  pass('REF-16');

  return { browser: await page.evaluate(() => navigator.userAgent), results };
}
