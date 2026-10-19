export default async (page) => {
  page.setDefaultTimeout(10000);
  const baseURL = new URL(page.url()).origin;
  const results = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const pass = id => results.push({ id, status: 'Pass' });
  const nav = page.getByRole('navigation', { name: 'Workspace sections', exact: true });
  const note = page.getByRole('textbox', { name: 'Review note', exact: true });
  const save = page.getByRole('button', { name: 'Save review', exact: true });
  const tab = name => page.getByRole('tab', { name, exact: true });
  const preferences = () => nav.getByRole('link', { name: 'Workspace preferences', exact: true }).click();
  const resume = () => nav.getByRole('link', { name: 'Recordings', exact: true }).click();
  const path = async expected => {
    const read = position => page.getByRole('navigation', { name: `Breadcrumbs ${position}`, exact: true })
      .locator('li').evaluateAll(items => items.map(item => ({ title: item.lastElementChild.textContent.trim(), href: item.lastElementChild.getAttribute('href'), current: item.lastElementChild.getAttribute('aria-current') })));
    const top = await read('top');
    assert(JSON.stringify(top) === JSON.stringify(await read('bottom')), 'Breadcrumb copies agree');
    assert(top.map(item => item.title).join('|') === expected, 'Canonical ancestry: ' + expected);
    assert(top.at(-1).current === 'page' && !top.at(-1).href, 'Current crumb is text, not a redundant link');
    assert(top.slice(0, -1).every(item => item.href && !item.current), 'Ancestors are real destinations');
    assert(await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
      return new Set(ids).size === ids.length;
    }), 'No duplicate IDs across repeated navigation');
  };
  const selectedView = async name => {
    await page.getByRole('tabpanel', { name, exact: true }).waitFor();
    assert(await tab(name).getAttribute('aria-selected') === 'true', 'Correct local view');
    assert(await page.getByRole('tabpanel').count() === 1, 'One exposed local panel');
  };

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto(baseURL + '/#recordings/REC-002/details');
  await selectedView('Recording details');
  await path('Workspace|Recordings|Market loop');
  assert(await page.locator('.record-metadata').getByText('202', { exact: true }).isVisible(), 'Direct destination has matching source facts');
  await page.reload();
  await selectedView('Recording details');
  assert(await page.locator('#review-heading').innerText() === 'Market loop\nREC-002', 'Reload restores explicit object');
  await page.goto(baseURL + '/#recordings/REC-999/details');
  await page.getByRole('heading', { name: 'Page unavailable', exact: true }).waitFor();
  await path('Workspace|Page unavailable');
  assert(await page.locator('.review-panel').count() === 0, 'Invalid ID does not silently display a substitute recording');
  await page.locator('.navigation-top').getByRole('link', { name: 'All pages', exact: true }).click();
  await page.getByRole('heading', { name: 'All pages', exact: true }).waitFor();
  await path('Workspace');
  assert(await page.locator('.page-directory a').count() === 5, 'Index covers both workspace sections and all three records');
  const recordIndex = page.getByRole('list', { name: 'Individual recordings:', exact: true });
  assert(await recordIndex.getByRole('listitem').count() === 3 && await recordIndex.locator('..').getByRole('link', { name: 'Recordings', exact: true }).count() === 1, 'Index entries sit under their actual breadcrumb parent');
  await page.locator('.page-directory').getByRole('link', { name: 'Recordings', exact: true }).click();
  await path('Workspace|Recordings');
  assert(await page.locator('.recording-list li').count() === 3 && await page.locator('.review-panel,.current-record').count() === 0, 'Collection is a genuine parent destination');
  await page.getByRole('button', { name: 'Review Harbor morning', exact: true }).click();
  await path('Workspace|Recordings|Harbor morning');
  pass('NAV-01');

  await note.fill('Navigation preserves this draft');
  await tab('Review').focus();
  await page.keyboard.press('ArrowRight');
  assert(await tab('Recording details').evaluate(el => el === document.activeElement), 'Arrow moves local keyboard focus');
  assert(await tab('Review').getAttribute('aria-selected') === 'true' && await note.isVisible(), 'Manual activation leaves current view and draft visible');
  await page.keyboard.press('Enter');
  await selectedView('Recording details');
  assert(await note.count() === 0 && await save.isEnabled(), 'Hidden assessment is absent from accessible controls; Save remains available');
  assert(await page.locator('.timing-facts').isVisible() && await page.locator('#save-feedback').innerText() === 'Unsaved changes.', 'Timing and dirty state survive local views');
  assert(await tab('Recording details').evaluate(el => el === document.activeElement), 'Activation keeps focus on local tab');
  await save.click();
  assert(await page.locator('#save-feedback').innerText() === 'Saving review.', 'Save from details targets the retained review draft');
  await tab('Review').click();
  assert(await note.inputValue() === 'Navigation preserves this draft', 'Returning restores editable content');
  await tab('Recording details').click();
  await page.getByRole('button', { name: 'Review Market loop', exact: true }).click();
  // The earlier direct-linked view for Market is remembered independently.
  await selectedView('Recording details');
  await tab('Review').click();
  await note.fill('Independent Market draft');
  await page.getByRole('button', { name: 'Review Harbor morning', exact: true }).click();
  await selectedView('Recording details');
  assert(await page.locator('#save-feedback').innerText() === 'Saving review.', 'Pending work remains scoped to Harbor');
  pass('NAV-02');

  await preferences();
  await path('Workspace|Workspace preferences');
  assert(await page.locator('#page-heading').evaluate(el => el === document.activeElement), 'New page has an explicit focus destination');
  await page.getByRole('combobox', { name: 'Text size', exact: true }).selectOption('larger');
  await page.goBack();
  await selectedView('Recording details');
  await path('Workspace|Recordings|Harbor morning');
  assert(await page.locator('#save-feedback').innerText() === 'Saving review.', 'Back preserves pending save');
  await page.goForward();
  await page.getByRole('heading', { name: 'Workspace preferences', exact: true }).waitFor();
  assert(await page.getByRole('combobox', { name: 'Text size', exact: true }).inputValue() === 'larger', 'Forward retains preferences');
  await resume();
  await selectedView('Recording details');
  await tab('Review').click();
  assert(await note.inputValue() === 'Navigation preserves this draft', 'Back/Forward and workspace pages retain draft');
  await page.goBack();
  await selectedView('Recording details');
  await page.goForward();
  await selectedView('Review');
  assert(await note.inputValue() === 'Navigation preserves this draft', 'History traverses local views without resetting inputs');
  pass('NAV-03');

  const sections = page.locator('.footer-sections summary');
  const footerNav = page.getByRole('navigation', { name: 'Footer sections', exact: true });
  assert(await footerNav.count() === 0, 'Footer links initially collapsed');
  await sections.click();
  await footerNav.getByRole('link', { name: 'Recording details', exact: true }).click();
  await selectedView('Recording details');
  assert(await page.locator('#review-heading').evaluate(el => el === document.activeElement), 'Footer view link returns focus to named recording');
  await path('Workspace|Recordings|Harbor morning');
  await page.getByRole('link', { name: 'Back to top', exact: true }).click();
  assert(await page.locator('#page-heading').evaluate(el => el === document.activeElement), 'Back to top moves keyboard focus');
  assert(await page.evaluate(() => scrollY) === 0 && page.url().endsWith('/details'), 'Back to top preserves view URL');
  await page.screenshot({ path: 'output/playwright/navigation-details.png', fullPage: true });
  pass('NAV-04');

  await page.setViewportSize({ width: 320, height: 800 });
  const narrow = await page.evaluate(() => {
    const visible = el => el.getClientRects().length && !el.closest('details:not([open]) nav');
    return {
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('main')).fontSize,
      targets: [...document.querySelectorAll('nav a,[role=tab],.footer-actions > a,.footer-sections summary')].filter(visible).map(el => ({ text: el.textContent.trim(), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })),
      fixed: [...document.querySelectorAll('nav,footer')].some(el => ['fixed', 'sticky'].includes(getComputedStyle(el).position)),
    };
  });
  assert(narrow.scrollWidth <= narrow.width && narrow.font === '20px' && !narrow.fixed, 'Navigation wraps without clipping or covering the task');
  assert(narrow.targets.every(item => item.width >= 44 && item.height >= 44), 'Navigation retains target sizes at narrow enlarged text');
  await page.screenshot({ path: 'output/playwright/navigation-narrow.png', fullPage: true });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await tab('Recording details').focus();
  await page.keyboard.press('ArrowLeft');
  const forced = await page.evaluate(() => {
    const selected = document.querySelector('[role=tab][aria-selected=true]');
    return { selected: selected.textContent, selectedBorder: getComputedStyle(selected).borderBottomWidth, focus: document.activeElement.textContent, outline: getComputedStyle(document.activeElement).outlineWidth, adjust: getComputedStyle(selected).forcedColorAdjust };
  });
  assert(forced.selected === 'Recording details' && forced.focus === 'Review' && forced.selectedBorder === '3px' && forced.outline === '3px' && forced.adjust === 'auto', 'Forced colors distinguish selected view from keyboard focus');
  await page.screenshot({ path: 'output/playwright/navigation-forced-colors.png', fullPage: true });
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  pass('NAV-05');

  await page.setViewportSize({ width: 1440, height: 1080 });
  await preferences();
  await page.screenshot({ path: 'output/playwright/navigation-preferences.png', fullPage: true });
  await page.locator('.navigation-top').getByRole('link', { name: 'All pages', exact: true }).click();
  await page.screenshot({ path: 'output/playwright/navigation-index.png', fullPage: true });
  await page.locator('.page-directory').getByRole('link', { name: 'Harbor morning', exact: true }).click();
  await selectedView('Recording details');
  await page.locator('.demo-controls summary').click();
  await page.getByRole('button', { name: 'Fail save', exact: true }).click();
  assert((await page.locator('#save-feedback').innerText()).startsWith('Save failed.'), 'Failure remains visible on details');
  await tab('Review').click();
  assert(await note.inputValue() === 'Navigation preserves this draft', 'Failure after navigation retains original content');
  await save.click();
  await tab('Recording details').click();
  await page.getByRole('button', { name: 'Complete save', exact: true }).click();
  assert(await page.locator('#save-feedback').innerText() === 'Saved in this demo.', 'Completion stays visible across local views');
  await tab('Review').click();
  assert(await note.inputValue() === 'Navigation preserves this draft' && await save.isDisabled(), 'Acknowledgment matches the retained draft');
  pass('NAV-06');
  await page.goto(baseURL);
  return { results, narrow, forced, pending: ['Actual browser zoom', 'Screen-reader navigation', 'Participant evaluation', 'Multi-category directory and cross-highlighting'] };
}
