import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import palettes from '../../packages/audhd-ui-framework/palette-data.json' with {type:'json'};

// These expectations are independent of the UI registry. A missing destination
// must fail the check rather than disappear from both actual and expected data.
const primaryPages = [
  ['overview','Overview'], ['calendar','Calendar & rooms'], ['work','Tasks & requests'],
  ['notes','Notes'], ['administration','Administration'], ['directory','All pages'], ['appearance','Appearance'],
];
const expectedDirectory = [
  'overview','notes','notes/new','notebooks','notes/archive','notes/trash',
  'people','people/mira','people/sam','workspace-settings','exports','transfer',
  'recovery','settings/requests','activity','activity/warnings','activity/all',
  'directory','appearance','settings','administration',
  'calendar','calendar/week','calendar/month','calendar/agenda','calendar/rooms','calendar/new',
  ...['harbor-planning','research-conversation','weekly-decisions','workshop-preparation'].map(id=>`meeting/${id}`),
  'work','tasks','tasks/new','requests','requests/new',
  ...['harbor-task-agenda','harbor-task-review','harbor-task-room','harbor-task-research','harbor-task-template'].map(id=>`task/${id}`),
  ...['cable','whiteboard','adapter','chair'].map(id=>`request/harbor-request-${id}`),
  ...['harbor-meetings','harbor-decisions','harbor-reference'].map(id=>`notes/notebook-${id}`),
  ...['harbor-kickoff','harbor-weekly-review','harbor-research-checkin',
    'harbor-note-structure','harbor-review-day','harbor-retention',
    'harbor-writing-guide','harbor-meeting-template','harbor-old-kickoff',
    'harbor-old-location','harbor-duplicate','harbor-scratch'].flatMap(id=>[`note/${id}`,`note/${id}/history`]),
].map(path=>`#${path}`).sort();

const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const revealNav = async (tab, link) => {
    const groups = await link.evaluate(el=>{const result=[]; for(let parent=el.parentElement;parent;parent=parent.parentElement) if(parent.matches('ul.nav-children')) result.unshift(parent.id.replace('nav-','')); return result;});
    for(const group of groups) {const toggle=tab.locator(`[data-branch="${group}"]`); if(await toggle.getAttribute('aria-expanded')==='false') await toggle.click();}
  };
  const navigate = async name => {
    if (await page.locator('#menu-toggle').isVisible() && await page.locator('#menu-toggle').getAttribute('aria-expanded') === 'false') await page.locator('#menu-toggle').click();
    const link=page.locator('#workspace-nav').getByRole('link',{name:new RegExp(`^${name}(?:\\s|$)`),includeHidden:true});
    await revealNav(page,link); await link.click();
    await page.waitForFunction(name=>document.title.startsWith(`${name} ·`),name);
    assert.equal(await page.locator('#breadcrumbs').getByRole('link',{name:'Harbor Team Hub',exact:true}).getAttribute('href'),'#overview');
  };
  const role = value => page.locator(`[name="role"][value="${value}"]`);
  const selectedRole = () => page.locator('[name="role"]:checked').inputValue();
  const guide = async visible => {
    if ((await page.locator('#guide-toggle').getAttribute('aria-pressed') === 'true') !== visible) await page.locator('#guide-toggle').click();
  };
  const openNote = async id => {
    await guide(true);
    if (await page.locator(`#${id}`).getAttribute('open') === null) await page.locator(`#${id}-toggle`).click();
  };
  const noOverflow = async () => assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Page must reflow without horizontal scrolling');
  const shot = name => page.screenshot({path:`output/playwright/administration/${name}.png`,fullPage:true});
  await mkdir('output/playwright/administration',{recursive:true});
  // Distinguish population from confirmed problems across routes and filters.
  // Routine drafts/unchecked roles cannot raise the Overview warning above the
  // known blocked-task baseline. Each account contributes at most one problem.
  // Keep this session separate so the existing mutation-count tests stay exact.
  const statusPage = await browser.newPage();
  statusPage.on('pageerror', error => errors.push(error.message));
  await statusPage.goto(process.argv[2] || 'http://127.0.0.1:4187/examples/administration/');
  const statusNav = async path => {
    const link=statusPage.locator(`[data-nav="${path}"]`); await revealNav(statusPage,link); await link.click();
    await statusPage.waitForFunction(path => document.title.startsWith(`${({overview:'Overview',people:'Users & access'})[path]} ·`), path);
  };
  const seededProblems = 2; // “Check the meeting room display” is blocked.
  const statusCounts = async accountProblems => {
    const expected = seededProblems + accountProblems;
    const badge = statusPage.locator('[data-count="overview"]');
    assert.equal(await badge.textContent(),String(expected));
    assert.equal(await badge.isHidden(),expected === 0);
    assert.equal(await badge.getAttribute('data-kind'),'problem');
    assert.equal(await statusPage.locator('[data-count="people"]').textContent(),'2');
    assert.equal(await statusPage.locator('[data-count="people"]').getAttribute('data-kind'),'count');
    assert.equal(await statusPage.locator('[data-nav="people"]').getAttribute('aria-label'),'Users & access — 2 configured user accounts');
  };
  await statusCounts(0);
  assert.equal(await statusPage.locator('[data-count="work"]').textContent(),'2');
  for (const id of ['mira','sam']) {
    await statusNav('people');
    const card = statusPage.locator(`#account-${id}`);
    assert.match(await card.innerText(),/Review · Access check needed/);
    await card.getByRole('link',{name:/Check saved access for/}).click();
    assert(await statusPage.locator('#verify').evaluate(el=>el===document.activeElement));
    await statusPage.locator('#verify').click();
    // Completion must be perceptible even when a repeated check returns the
    // same permissions: a focused result, updated receipt and explicit exit.
    assert.equal(await statusPage.locator('#verify').textContent(),'Check again');
    assert.equal(await statusPage.locator('#verify').getAttribute('class'),'');
    assert(await statusPage.locator('#check-title').evaluate(el=>el===document.activeElement));
    assert.match(await statusPage.locator('#check-title').textContent(),/Check passed/);
    assert.match(await statusPage.locator('#check-receipt').textContent(),/^Check 1 ·/);
    assert(Number.isFinite(Date.parse(await statusPage.locator('#check-receipt time').getAttribute('datetime'))));
    assert(await statusPage.locator('#check-return').isVisible());
    await statusPage.locator('#verify').click();
    assert.match(await statusPage.locator('#check-receipt').textContent(),/^Check 2 ·/);
    assert(await statusPage.locator('#check-title').evaluate(el=>el===document.activeElement));
    await statusCounts(0);
    await statusPage.locator('#check-return').click();
    await statusPage.locator(`#account-${id}`).waitFor({state:'visible'});
    assert(await statusPage.locator(`#account-${id}`).isVisible());
  }
  await statusNav('overview');
  assert.equal(await statusPage.locator('#hub-admin a[href$="/verify"]').count(),0);
  await statusNav('people');
  await statusPage.getByRole('link',{name:'Change Mira’s role',exact:true}).click();
  await statusPage.locator('[name="role"][value="editor"]').check();
  await statusCounts(0);
  await statusPage.locator('#reason').fill('');
  await statusPage.locator('#save').click();
  await statusCounts(1);
  assert.equal(await statusPage.locator('[data-nav="overview"]').getAttribute('aria-label'),'Overview — 3 items with a problem');
  const problemBadge = statusPage.locator('[data-count="overview"]');
  assert(await problemBadge.evaluate(el => getComputedStyle(el).backgroundImage.includes('repeating-linear-gradient')));
  assert(await problemBadge.evaluate(el => getComputedStyle(el,'::before').content.includes('⚠')));
  assert.notEqual(await problemBadge.evaluate(el=>getComputedStyle(el).color),await statusPage.locator('[data-count="people"]').evaluate(el=>getComputedStyle(el).color));
  await statusPage.screenshot({path:'output/playwright/administration/problem-badge.png'});
  await statusPage.emulateMedia({forcedColors:'active'});
  assert.equal(await problemBadge.evaluate(el=>getComputedStyle(el).borderTopStyle),'double');
  assert(await problemBadge.evaluate(el=>getComputedStyle(el,'::before').content.includes('⚠')));
  await statusPage.emulateMedia({forcedColors:'none'});
  await statusNav('people');
  assert.match(await statusPage.locator('#account-mira').innerText(),/Change not saved: enter a reason/);
  await statusPage.getByLabel('Filter users',{exact:true}).fill('Sam');
  assert.equal(await statusPage.locator('#records .person-card').count(),1);
  await statusCounts(1); // The hidden account still needs attention.
  await statusPage.getByRole('link',{name:'Mira: Enter a reason',exact:true}).click();
  await statusPage.locator('#reason').fill('Maintains project decisions');
  await statusCounts(0);
  await statusPage.locator('#save').click();
  assert.match(await statusPage.locator('#check-title').innerText(),/Access check needed/);
  assert.equal(await statusPage.locator('#check-receipt').textContent(),'');
  assert(await statusPage.locator('#check-return').isHidden());
  assert.equal(await statusPage.locator('#verify').textContent(),'Check saved access');
  await statusPage.locator('#guide-toggle').click();
  await statusPage.locator('#verification-design-toggle').click();
  await statusPage.locator('#fail-check').check();
  await statusPage.locator('#verify').click();
  await statusPage.locator('[name="role"][value="reader"]').check();
  await statusNav('people');
  await statusPage.locator('#clear').click();
  await statusCounts(1); // Failed check plus newer draft is one account.
  assert.match(await statusPage.locator('#account-mira').innerText(),/Warning · Check unavailable.*Unsaved change/s);
  await statusPage.locator('#account-mira').getByRole('link',{name:'Restore access check for Mira',exact:true}).click();
  assert(await statusPage.locator('#restore-check').evaluate(el=>el===document.activeElement));
  await statusPage.locator('#restore-check').click();
  await statusPage.locator('#verify').click();
  assert.equal(await statusPage.locator('[name="role"]:checked').inputValue(),'reader');
  assert.equal(await statusPage.locator('#writes').textContent(),'Simulated saves: 1');
  await statusCounts(0); // Successful check clears the problem, not the newer draft.
  assert.match(await statusPage.locator('#draft-status').innerText(),/Unsaved changes/);
  await statusPage.locator('#reset').click();
  await statusCounts(0);
  // Removing the remaining blocked task clears the hub-wide badge. Recovery
  // in one domain must not clear another domain's problem, but an empty total
  // must still hide the badge rather than leave a permanent warning.
  await statusNav('overview');
  await statusPage.locator('a[href="#task/harbor-task-room/blockedReason"]').click();
  await statusPage.getByLabel('Progress',{exact:true}).selectOption('doing');
  await statusPage.getByRole('button',{name:'Save task',exact:true}).click();
  assert.equal(await statusPage.locator('[data-count="overview"]').textContent(),'1');
  await statusPage.evaluate(()=>location.hash='request/harbor-request-chair');
  await statusPage.locator('#request-reason').fill('Replace the broken chair at the shared desk.');
  await statusPage.getByRole('button',{name:'Save request draft',exact:true}).click();
  await statusPage.locator('#request-submit').click();
  assert.equal(await statusPage.locator('[data-count="overview"]').textContent(),'0');
  assert(await statusPage.locator('[data-count="overview"]').isHidden());
  assert(await statusPage.locator('[data-count="work"]').isHidden());
  await statusPage.close();
  await page.goto(process.argv[2] || 'http://127.0.0.1:4187/examples/administration/');
  await page.locator('#palettes input').last().waitFor({state:'attached'});
  assert.equal(await page.locator('html').getAttribute('data-skin'),'guillermo');
  assert.equal(await page.locator('html').getAttribute('data-type'),'expressive');
  assert.equal(await page.locator('#guide-toggle').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#breadcrumbs').innerText(),'Harbor Team Hub');
  assert.equal(await page.locator('#breadcrumbs a').getAttribute('aria-current'),'page');
  assert(await page.getByRole('heading',{name:'Team overview',exact:true}).isVisible());
  assert(await page.getByRole('heading',{name:'Today’s meetings',exact:true}).isVisible());
  assert(!await page.locator('#overview-design').isVisible());
  assert(!await page.locator('#main form').count());
  assert(!await page.locator('#main').getByText('None.',{exact:true}).count());
  assert.equal(await page.locator('#overview-accounts').count(),0);
  assert.match(await page.locator('#hub-admin').innerText(),/Mira: Check saved access.*Sam: Check saved access/s);
  assert.equal(await page.locator('#hub-resume a[href$="/verify"]').count(),0,'Routine access checks stay out of coordination work');
  assert.match(await page.locator('.hub-next-meeting').innerText(),/minutes.*room/s,'The next commitment supplies duration and room together');
  assert(await page.locator('.hub-today a[href^="#meeting/"]').first().evaluate(el=>el.getBoundingClientRect().bottom<innerHeight),'A meaningful meeting action belongs in the first viewport');
  assert(await page.locator('a[href="#task/harbor-task-room/blockedReason"]').evaluate(el=>el.getBoundingClientRect().bottom<innerHeight),'The blocked task has a visible route to its owning control');
  // Keyboard bypass is focus-revealed, skips the entire shell and leaves the
  // route intact. Checking href alone would miss a nonfunctional skip link.
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-link');
  assert(await page.locator('.skip-link').evaluate(el=>el.getBoundingClientRect().top>=0));
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
  await page.locator('#main').blur();
  await shot('overview');
  // Keep the gallery's ordinary narrow view separate from the enlarged-text
  // recovery evidence captured later, after the tests deliberately change state.
  await page.setViewportSize({width:390,height:844});
  await shot('overview-gallery-narrow');
  await page.setViewportSize({width:1440,height:1000});

  // The overview's role action must reveal and focus the actual owning control,
  // rather than merely link to an otherwise unidentifiable record page.
  await navigate('Users & access');
  await page.getByRole('link',{name:'Change Mira’s role',exact:true}).click();
  assert(await role('reader').evaluate(el=>el===document.activeElement));
  await navigate('Overview');

  await page.getByRole('link',{name:'Mira: Check saved access',exact:true}).click();
  assert.match(await page.locator('#verification').innerText(),/Mira/,'A check deep link must name its account locally');
  await page.waitForFunction(()=>document.activeElement.id==='verify');
  await page.goBack();
  await navigate('Users & access');
  assert(await page.locator('#breadcrumbs').evaluate(el=>{const rect=el.getBoundingClientRect();return rect.top>=0&&rect.bottom<=innerHeight;}),'Ordinary navigation preserves visible location context at arrival');
  assert.equal(await page.locator('#records .person-card').count(),2);
  await page.getByLabel('Filter users',{exact:true}).fill('Mira');
  await page.locator('#records h2').getByRole('link',{name:'Mira',exact:true}).click();
  await role('editor').check();
  // Breadcrumbs are a return path, including keyboard activation. Both levels
  // must preserve the filtered list and unsaved edit through browser history.
  assert.match(await page.locator('#breadcrumbs').innerText(),/Harbor Team Hub.*Users & access.*Mira: permissions/s);
  await page.locator('#breadcrumbs').getByRole('link',{name:'Users & access',exact:true}).click();
  assert.equal(await page.locator('#search').inputValue(),'Mira');
  await page.goBack();
  assert.equal(await selectedRole(),'editor');
  await page.locator('#breadcrumbs').getByRole('link',{name:'Harbor Team Hub',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.title==='Overview · Harbor Team Hub demo');
  assert.equal(await page.locator('#breadcrumbs').innerText(),'Harbor Team Hub');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
  await page.goBack();
  assert.equal(await selectedRole(),'editor');
  await page.goForward();
  await page.waitForFunction(()=>document.title==='Overview · Harbor Team Hub demo');
  await page.getByRole('link',{name:'Mira: Review changes',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement.name==='role' && document.activeElement.value==='editor');
  await navigate('All pages'); await page.goBack();
  assert.equal(await selectedRole(),'editor');
  await page.getByLabel('Reason for change',{exact:true}).fill('');
  await page.locator('#save').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'error-link');
  await navigate('Overview');
  assert.equal(await page.getByRole('link',{name:'Mira: Review changes',exact:true}).count(),0);
  await page.getByRole('link',{name:'Mira: Enter a reason',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement.id==='reason');
  assert.equal(await page.locator('#reason').inputValue(),'');
  await page.getByRole('link',{name:'← Back to users',exact:true}).click();
  assert(await page.locator('#records h2 a').evaluate(el=>el===document.activeElement));
  assert.equal(await page.locator('#search').inputValue(),'Mira');
  await page.locator('#records h2 a').click();
  await page.locator('#error-link').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'reason');
  await page.locator('#reason').fill('Mira will update the meeting notes');
  assert.equal(await page.locator('#reason').getAttribute('aria-invalid'),'false');
  assert.equal(await page.locator('#error-link').count(),0);
  await page.locator('#save').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'verify');
  assert.match(await page.locator('#saved-role').innerText(),/Editor/);
  assert.equal(await page.locator('#permission-results').innerText(),'');

  // Guide notes add explanation without replacing the task DOM or typed draft.
  await role('reader').check();
  await page.locator('#reason').fill('A newer unsaved reason');
  await page.locator('#reason').evaluate(el=>{ window.originalReasonNode=el; });
  await openNote('verification-design');
  assert(await page.locator('#reason').evaluate(el=>el===window.originalReasonNode));
  await page.getByLabel('Simulate permission service unavailable').check();
  await guide(false);
  assert(!await page.locator('#verification-design').isVisible());
  await page.locator('#verify').click();
  assert.match(await page.locator('#outcome').innerText(),/remains saved.*unavailable/s);
  assert(await page.locator('#check-title').evaluate(el=>el===document.activeElement));
  assert.equal(await page.locator('#verify').textContent(),'Retry access check');
  assert(await page.locator('#check-return').isHidden());
  assert(await page.locator('#restore-check').isVisible());
  await navigate('Overview'); await page.goBack();
  assert.equal(await selectedRole(),'reader');
  assert.equal(await page.locator('#reason').inputValue(),'A newer unsaved reason');
  await page.locator('#verify').click();
  assert.match(await page.locator('#outcome').innerText(),/unavailable/);
  await page.locator('#restore-check').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'verify');
  await page.locator('#verify').click();
  assert.match(await page.locator('#outcome').innerText(),/Mira can read notes and edit them.*match the saved Editor role/);
  assert.match(await page.locator('#permission-results').innerText(),/Read notes\s+Allowed\s+Edit notes\s+Allowed/);
  assert.equal(await selectedRole(),'reader');
  assert.equal(await page.locator('#writes').textContent(),'Simulated saves: 1');
  assert.match(await page.locator('#check-next').textContent(),/unsaved changes still need review and saving/);
  await guide(true);
  assert.equal(await page.locator('#verification-design').getAttribute('open'),'');
  await guide(false);

  await navigate('Appearance');
  assert.deepEqual(await page.locator('#palettes input').evaluateAll(nodes=>nodes.map(n=>n.value)),palettes.map(p=>p.id));
  assert.equal(await page.locator('#type').count(),0);
  for (const skin of palettes) {
    const input = page.getByRole('radio',{name:`${skin.name} (${skin.mode})`,exact:true});
    await input.locator('..').click();
    assert.equal(await page.locator('html').getAttribute('data-skin'),skin.id);
    assert(await input.evaluate(el=>el===document.activeElement));
    assert.equal(await page.locator('html').getAttribute('data-type'),'expressive');
    const preview = page.locator(`.palette-preview[data-skin="${skin.id}"]`);
    assert.equal(await preview.locator('.preview-heading').innerText(),skin.name);
    // Compare rendered preview typography and surfaces to the applied app,
    // catching inheritance mistakes even when every radio changes data-skin.
    assert.deepEqual(await preview.evaluate(el=>({
      heading:getComputedStyle(el.querySelector('.preview-heading')).fontFamily,
      body:getComputedStyle(el.querySelector('.preview-copy')).fontFamily,
      background:getComputedStyle(el).backgroundColor
    })),await page.evaluate(()=>({
      heading:getComputedStyle(document.querySelector('h1')).fontFamily,
      body:getComputedStyle(document.body).fontFamily,
      background:getComputedStyle(document.body).backgroundColor
    })));
    assert.match(await page.locator('#appearance-status').innerText(),new RegExp(skin.name));
    assert.equal(await page.locator('.palette-current:visible').count(),1);
    assert(await preview.locator('.palette-current').isVisible());
    assert(await preview.locator('.preview-colors i').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).borderStyle==='solid')));
  }
  // Hidden dots retain native radio keyboard behavior, with focus on the card.
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('html').getAttribute('data-skin'),palettes.at(-2).id);
  await page.emulateMedia({colorScheme:'light'});
  assert.equal(await page.locator('html').getAttribute('data-skin'),palettes.at(-2).id);
  assert.equal(await page.locator('html').getAttribute('data-type'),'expressive');
  await page.goBack();
  assert.equal(await selectedRole(),'reader');
  assert.equal(await page.locator('#reason').inputValue(),'A newer unsaved reason');
  await page.getByRole('link',{name:'← Back to users',exact:true}).click();
  assert.equal(await page.locator('#search').inputValue(),'Mira');
  assert.equal(await page.locator('#records .person-card').count(),1);
  await page.goBack(); await page.goForward();
  assert.equal(await page.locator('#search').inputValue(),'Mira');
  await navigate('Appearance');
  await page.locator('input[value="guillermo"]').locator('..').click();
  await navigate('Users & access');
  await page.locator('#records h2 a').click();
  await page.locator('#reason').waitFor();
  await shot('record');
  await page.locator('#save').click();
  assert.equal(await page.locator('#permission-results').innerText(),'');
  assert.match(await page.locator('#outcome').innerText(),/Reader access is saved/);
  await navigate('Overview');
  await page.getByRole('link',{name:'Mira: Check saved access',exact:true}).click();
  await page.locator('#verify').click();
  assert.match(await page.locator('#permission-results').innerText(),/Edit notes\s+Denied/);
  // A scoped discard cannot erase another person's edit or a checked save.
  await role('editor').check();
  await page.getByRole('link',{name:'← Back to users',exact:true}).click();
  await page.locator('#clear').click();
  await page.locator('#records h2').getByRole('link',{name:'Sam',exact:true}).click();
  await role('reader').check();
  await page.getByRole('link',{name:'← Back to users',exact:true}).click();
  await page.locator('#records h2').getByRole('link',{name:'Mira',exact:true}).click();
  await page.locator('#reset').click();
  assert.equal(await selectedRole(),'reader');
  assert.equal(await page.locator('#writes').textContent(),'Simulated saves: 2');
  assert(await role('reader').evaluate(el=>el===document.activeElement));
  assert(await page.locator('#save').isDisabled());
  await page.getByRole('link',{name:'← Back to users',exact:true}).click();
  await page.locator('#records h2').getByRole('link',{name:'Sam',exact:true}).click();
  assert.equal(await selectedRole(),'reader');
  assert.match(await page.locator('#draft-status').innerText(),/Unsaved changes/);
  for (const path of ['people/missing-person','activity/absent','settings/not-a-page']) {
    await page.evaluate(path=>location.hash=path,path);
    await page.getByRole('heading',{name:'Destination not found',exact:true}).waitFor();
    assert.match(await page.locator('#breadcrumbs').innerText(),/Destination not found/);
    await page.goBack();
    assert.equal(await selectedRole(),'reader');
  }

  await navigate('All pages');
  const destinations = await page.locator('#page-directory a').evaluateAll(nodes=>nodes.map(n=>n.hash));
  assert.deepEqual([...destinations].sort(),expectedDirectory);
  const nested = page.locator('#page-directory .directory-children').filter({has:page.getByRole('link',{name:'Mira: permissions',exact:true})});
  assert(await nested.first().isVisible());
  for (const list of await page.locator('#page-directory ul').all()) {
    const names = await list.locator(':scope > li > a').allTextContents();
    assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
  }
  assert.deepEqual(await page.locator('#workspace-nav > .nav-group > .nav-parent > [data-nav]').evaluateAll(nodes=>nodes.map(node=>[node.dataset.nav,node.querySelector('span').textContent])),primaryPages);
  assert.equal(await page.locator('#workspace-nav a').last().innerText(),'Appearance');
  const cards = await page.locator('.directory-card').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().x));
  assert(new Set(cards).size>=2,'Directory uses multiple columns when there is room');
  await shot('directory');
  await page.locator('#page-filter').fill('Mira');
  assert.equal(await page.locator('#page-directory a').count(),3);
  assert(await page.locator('#page-directory').getByRole('link',{name:'Users & access',exact:true}).isVisible());
  await page.locator('#page-filter').fill('request');
  await page.locator('#page-directory').getByRole('link',{name:'Request limits',exact:true}).click();
  await page.getByLabel('Time to allow one more request',{exact:true}).waitFor();
  assert.match(await page.locator('#breadcrumbs').innerText(),/Administration.*Note transfers.*Request limits/s);
  assert.equal(await page.locator('#workspace-nav [aria-current="page"]').innerText(),'Request limits');
  await page.getByLabel('Time to allow one more request',{exact:true}).fill('0.017');
  await page.getByLabel('Time unit',{exact:true}).selectOption('minutes');
  assert.match(await page.locator('#request-preview').innerText(),/1.02 seconds/);
  await page.getByRole('button',{name:'Save request limits',exact:true}).click();
  assert.match(await page.locator('#request-saved').innerText(),/1.02 seconds/);
  await page.getByLabel('Time to allow one more request',{exact:true}).fill('0.0001');
  await page.getByLabel('Time unit',{exact:true}).selectOption('hours');
  await page.getByRole('button',{name:'Save request limits',exact:true}).click();
  assert.match(await page.locator('#request-saved').innerText(),/0.36 seconds/);
  await page.locator('.context-help summary').click();
  assert(await page.locator('.context-help').evaluate(el=>!!el.closest('fieldset')?.querySelector('#request-capacity')));
  for (const selector of ['#request-capacity','#request-unit','#timing-help','.context-help li']) assert(await page.locator(selector).first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
  await shot('requests');
  await page.getByLabel('Time to allow one more request',{exact:true}).fill('');
  await page.getByRole('button',{name:'Save request limits',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'request-amount');
  assert.match(await page.locator('#request-errors').innerText(),/Enter a decimal time/);
  assert.equal(await page.locator('[data-count="overview"]').textContent(),'3');
  assert(await page.locator('[data-count="overview"]').isVisible());
  assert.match(await page.locator('#request-saved').innerText(),/0.36 seconds/);
  await page.evaluate(()=>location.hash='settings/requests/request-capacity');
  await page.waitForFunction(()=>document.activeElement.id==='request-capacity');
  await page.getByLabel('Limit export requests',{exact:true}).uncheck();
  await page.getByRole('button',{name:'Save request limits',exact:true}).click();
  assert.match(await page.locator('#request-saved').innerText(),/no request limit/);
  assert.equal(await page.locator('[data-count="overview"]').textContent(),'2');
  assert(await page.locator('[data-count="overview"]').isVisible());
  await navigate('Appearance'); await page.locator('input[value="green-ledger-dark"]').locator('..').click(); await page.goBack();
  await page.waitForFunction(()=>document.activeElement.id==='limit-enabled');
  assert.equal(await page.getByLabel('Time to allow one more request',{exact:true}).inputValue(),'');
  assert.equal(await page.getByLabel('Time unit',{exact:true}).inputValue(),'hours');
  await page.getByLabel('Limit export requests',{exact:true}).check();
  await page.getByLabel('Time to allow one more request',{exact:true}).fill('0.0000001');
  await page.getByRole('button',{name:'Save request limits',exact:true}).click();
  assert.match(await page.locator('#request-errors').innerText(),/whole milliseconds/);
  assert.equal(await page.locator('#request-amount').getAttribute('aria-invalid'),'true');
  await navigate('Overview');
  await page.getByRole('link',{name:'Request limits: Correct the invalid value',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement.id==='request-amount');
  assert.equal(await page.getByLabel('Time to allow one more request',{exact:true}).inputValue(),'0.0000001');

  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  await noOverflow();
  await page.locator('.context-help summary').click();
  await noOverflow(); await shot('requests-narrow');
  await navigate('All pages');
  assert.equal(await page.locator('#page-filter').inputValue(),'request');
  await page.locator('#clear-pages').click();
  await noOverflow(); await shot('directory-narrow');
  await navigate('Overview');
  assert.equal(await page.locator('#workspace-nav').isVisible(),false);
  assert.match(await page.locator('#menu-toggle').innerText(),/Overview/);
  await page.locator('#menu-toggle').click();
  for (const [path] of primaryPages) assert(await page.locator(`#workspace-nav [data-nav="${path}"]`).isVisible());
  const administrationGroup=page.locator('[data-branch="administration"]');
  if(await administrationGroup.getAttribute('aria-expanded')==='false') await administrationGroup.click();
  const exportGroup = page.locator('[data-branch="exports"]');
  if (await exportGroup.getAttribute('aria-expanded') === 'true') await exportGroup.click();
  assert(!await page.locator('#workspace-nav').getByRole('link',{name:'Request limits',exact:true}).isVisible());
  await exportGroup.click();
  assert(await page.locator('#workspace-nav').getByRole('link',{name:'Request limits',exact:true}).isVisible());
  await page.locator('#workspace-nav a').last().focus(); await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'menu-toggle');
  assert(!await page.locator('#workspace-nav').isVisible());
  await noOverflow(); await shot('overview-narrow');
  await navigate('Users & access');
  await page.emulateMedia({forcedColors:'active'}); await page.locator('#search').focus();
  assert.notEqual(await page.locator('#search').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await noOverflow(); await shot('narrow-forced-colors');
  await page.emulateMedia({forcedColors:'none'});
  await page.evaluate(()=>location.hash='people/sam/verify');
  await page.locator('#verify').waitFor();
  await page.locator('#verify').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'check-title');
  assert(await page.locator('#check-title').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}));
  await noOverflow(); await shot('check-completion-narrow');
  await page.emulateMedia({forcedColors:'active'});
  assert.notEqual(await page.locator('#check-title').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await noOverflow(); await shot('check-completion-forced-colors');
  await page.emulateMedia({forcedColors:'none'});
  await navigate('Appearance');
  await noOverflow();
  await page.keyboard.press('Tab'); // Establish keyboard modality before checking :focus-visible.
  await page.locator('input[value="guillermo"]').focus();
  assert.equal(await page.locator('.palette:has(input:focus-visible)').count(),1);
  await page.emulateMedia({forcedColors:'active'});
  assert.notEqual(await page.locator('.palette:has(:checked)').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  assert.equal(await page.locator('.palette-current:visible').count(),1);
  await noOverflow(); await shot('appearance-narrow-forced-colors');
  await page.emulateMedia({forcedColors:'none'});
  await page.setViewportSize({width:1440,height:1000}); await page.evaluate(()=>document.documentElement.style.fontSize='');
  // Refresh is intentionally destructive only to this isolated demo visit.
  await page.reload(); await navigate('Overview');
  assert(await page.getByRole('heading',{name:'Today’s meetings',exact:true}).isVisible());
  await navigate('Users & access');
  assert.match(await page.locator('#records').innerText(),/Mira.*Reader.*Sam.*Editor/s);
  assert.equal(await page.locator('#guide-toggle').getAttribute('aria-pressed'),'false');

  // The narrow shell moves one teaching button into the section menu. Its
  // state and focus must survive that move, and Escape must cover the whole
  // menu, including controls outside the navigation link list.
  await page.evaluate(()=>location.hash='note/harbor-kickoff');
  await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Harbor kickoff agenda');
  await page.setViewportSize({width:390,height:844});
  const guideToggle = page.locator('#guide-toggle'), menuButton = page.locator('#menu-toggle');
  await page.waitForFunction(()=>document.querySelector('#guide-toggle').parentElement.id==='guide-menu-host');
  assert.equal(await guideToggle.isVisible(),false);
  await menuButton.click();
  assert.equal(await guideToggle.evaluate(el=>el.parentElement.id),'guide-menu-host');
  await guideToggle.click();
  assert.equal(await guideToggle.getAttribute('aria-pressed'),'true');
  await menuButton.click();
  assert.equal(await guideToggle.isVisible(),false);
  await menuButton.click();
  assert.equal(await guideToggle.getAttribute('aria-pressed'),'true');
  await guideToggle.focus(); await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'menu-toggle');

  const pathToggle = page.getByRole('button',{name:'Page path',exact:true});
  assert.equal(await page.locator('#breadcrumb-path').isVisible(),false);
  await pathToggle.click();
  assert.equal(await pathToggle.getAttribute('aria-expanded'),'true');
  assert.deepEqual(await page.locator('#breadcrumb-path a').allTextContents(),['Notes','Notebooks','Meeting notes']);
  assert.equal(await page.locator('#breadcrumb-path [aria-current]').innerText(),'Harbor kickoff agenda');
  await page.locator('#breadcrumb-path').getByRole('link',{name:'Meeting notes',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Meeting notes');
  assert.equal(new URL(page.url()).hash,'#notes/notebook-harbor-meetings');
  await menuButton.click(); await guideToggle.focus();
  await page.setViewportSize({width:1440,height:1000});
  await page.waitForFunction(()=>document.querySelector('#guide-toggle').parentElement.classList.contains('workspace-header'));
  assert.equal(await guideToggle.getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'guide-toggle');
  assert.equal(await page.locator('#breadcrumb-path').isVisible(),true);
  await guideToggle.click();
  assert.equal(await guideToggle.getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[]);
  console.log('PASS: overview facts, skip link, cards/ancestry, access drafts/save/check/recovery, scoped discard, Guide notes, all skins, numeric units, history, mobile, enlarged text and forced colors.');
} finally { await browser.close(); }
