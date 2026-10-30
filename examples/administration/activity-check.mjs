import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.argv[2] || 'http://127.0.0.1:4187/examples/administration/';
  await page.goto(`${base.split('#')[0]}#activity/warnings`);
  await page.getByRole('heading',{name:'Warnings',exact:true}).waitFor();
  assert.equal(await page.getByLabel('Activity source',{exact:true}).inputValue(),'visit');
  assert.equal(await page.locator('[data-event-id="e12"]').count(),0);
  assert.match(await page.locator('#activity-count').innerText(),/0 unacknowledged warnings · 0 unacknowledged errors/);

  // Controlled events test a feed arrival while the reader stays on this page.
  // User-workflow event production is exercised separately by the main check.
  const injected = await page.evaluate(async () => {
    const { recordEvent, getSessionEvents } = await import('./events.js');
    const first = recordEvent({level:'info',description:'Test observation: saved version 2.',subject:'mira',version:2,operationId:'activity-check-save'});
    const second = recordEvent({level:'warning',description:'Test observation: saved version 2 awaits a permission check.',action:'Review the saved role before checking permissions.',href:'#people/mira/verify',actionLabel:'Check saved access'});
    const third = recordEvent({level:'error',description:'Test observation: a report could not be created.',action:'Check the destination before retrying.'});
    const snapshot = getSessionEvents(); snapshot.pop();
    return {ids:[first.id,second.id,third.id],frozen:Object.isFrozen(first),count:getSessionEvents().length};
  });
  assert(injected.frozen);
  assert.equal(injected.count,3);
  await page.getByRole('button',{name:'Show 3 new events',exact:true}).waitFor();
  assert.match(await page.locator('#activity-count').innerText(),/1 unacknowledged warning · 1 unacknowledged error across all 3 events recorded this visit/);
  assert.equal(await page.locator('.activity-table tbody tr').count(),0);
  await page.getByRole('button',{name:'Show 3 new events',exact:true}).click();
  assert.equal(await page.locator('.activity-table tbody tr').count(),2);
  assert.equal(await page.locator(`[data-event-id="${injected.ids[1]}"]`).getByRole('link',{name:'Check saved access',exact:true}).getAttribute('href'),'#people/mira/verify');
  assert.equal(await page.locator('#activity-heading').evaluate(el => el === document.activeElement),true);
  const frozenRows = await page.locator('.activity-table tbody tr').evaluateAll(rows => rows.map(row => row.dataset.eventId));
  await page.locator(`#ack-${injected.ids[1]}`).focus();
  await page.evaluate(async () => (await import('./events.js')).recordEvent({level:'warning',description:'Test observation: a newer warning arrived.'}));
  await page.getByRole('button',{name:'Show 1 new event',exact:true}).waitFor();
  assert.deepEqual(await page.locator('.activity-table tbody tr').evaluateAll(rows => rows.map(row => row.dataset.eventId)),frozenRows);
  assert.equal(await page.locator(`#ack-${injected.ids[1]}`).evaluate(el => el === document.activeElement),true);
  assert.match(await page.locator('#activity-count').innerText(),/2 unacknowledged warnings · 1 unacknowledged error across all 4 events recorded this visit/);
  await page.getByRole('button',{name:'Show 1 new event',exact:true}).click();
  assert.equal(await page.locator('.activity-table tbody tr').count(),3);

  // The fixed historical source has separate counts, paging and review state.
  await page.getByLabel('Activity source',{exact:true}).selectOption('example');
  assert.equal(await page.locator('.activity-table tbody tr').count(),5);
  assert.equal(await page.locator('.activity-table a').count(),0, 'Historical examples must not imply that today’s controls can repair their old events.');
  assert.match(await page.locator('#activity-count').innerText(),/6 unacknowledged warnings · 1 unacknowledged error/);
  assert.match(await page.locator('#activity-position').innerText(),/1–5 of 7/);
  assert(await page.locator('#activity-previous').isDisabled());
  assert.equal(await page.locator('.activity-table time').first().getAttribute('datetime'),'2026-10-20T14:12:00Z');

  // Review uses the visible action; the source event remains in both views.
  await page.locator('[data-event-id="e12"]').getByText('Original entry',{exact:true}).click();
  const original = await page.locator('[data-event-id="e12"] pre').innerText();
  await page.locator('#ack-e12').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#ack-e12').evaluate(el => el === document.activeElement),true);
  assert.equal(await page.locator('[data-event-id="e12"]').getAttribute('data-acknowledged'),'true');
  assert.match(await page.locator('[data-event-id="e12"]').innerText(),/Error[\s\S]*Acknowledged/);
  assert(await page.locator('[data-event-id="e12"] pre').isVisible());
  assert.equal(await page.locator('[data-event-id="e12"] pre').innerText(),original);
  assert(!await page.locator('[data-event-id="e12"]').evaluate(el => el.classList.contains('activity-unreviewed')));
  assert.match(await page.locator('#activity-count').innerText(),/6 unacknowledged warnings · 0 unacknowledged errors/);
  await page.locator('#ack-e11').click();
  assert.match(await page.locator('#activity-count').innerText(),/5 unacknowledged warnings/);
  await page.locator('#activity-next').click();
  assert.equal(await page.locator('.activity-table tbody tr').count(),2);
  assert.match(await page.locator('#activity-position').innerText(),/6–7 of 7/);
  assert.match(await page.locator('#activity-count').innerText(),/5 unacknowledged warnings/);
  await page.locator('#ack-e04').click();
  assert.match(await page.locator('#activity-count').innerText(),/4 unacknowledged warnings/);

  await page.getByRole('link',{name:'All events',exact:true}).click();
  await page.getByRole('heading',{name:'All events',exact:true}).waitFor();
  await page.getByLabel('Events per page',{exact:true}).selectOption('20');
  assert.equal(await page.locator('.activity-table tbody tr').count(),12);
  assert.match(await page.locator('#activity-count').innerText(),/4 unacknowledged warnings · 0 unacknowledged errors/);
  assert.equal(await page.locator('[data-event-id="e04"]').getAttribute('data-acknowledged'),'true');
  assert.equal(await page.locator('[data-event-id="e12"]').getAttribute('data-severity'),'error');
  const unknown = page.locator('[data-event-id="e01"]');
  assert.match(await unknown.innerText(),/unrecognized format/);
  assert.match(await unknown.innerText(),/meaning and severity are not established/);
  await unknown.getByText('Original entry',{exact:true}).click();
  assert.equal(await unknown.locator('pre').innerText(),'NOTICE extension=access-extra result=<unmapped> detail=17');
  assert.equal(await unknown.getByRole('button').count(),0);
  assert.equal(await page.locator('.activity-table time').count(),12);

  // Zero unacknowledged events is not zero historical warnings or errors.
  while (await page.getByRole('button',{name:/^Acknowledge /}).count()) {
    await page.getByRole('button',{name:/^Acknowledge /}).first().click();
  }
  assert.match(await page.locator('#activity-count').innerText(),/0 unacknowledged warnings · 0 unacknowledged errors/);
  assert.equal(await page.locator('.activity-table tbody tr').count(),12);
  await page.getByRole('link',{name:'Warnings',exact:true}).click();
  await page.getByRole('heading',{name:'Warnings',exact:true}).waitFor();
  assert.equal(await page.locator('.activity-table tbody tr').count(),7);
  assert.equal(await page.locator('[data-acknowledged="true"]').count(),7);
  await page.locator('#ack-e11').click();
  assert.equal(await page.locator('[data-event-id="e11"]').getAttribute('data-acknowledged'),'false');
  assert.match(await page.locator('#activity-count').innerText(),/1 unacknowledged warning/);

  await page.getByLabel('Events per page',{exact:true}).selectOption('5');
  await page.locator('#activity-next').click();
  await page.getByRole('link',{name:'All events',exact:true}).click();
  await page.getByRole('heading',{name:'All events',exact:true}).waitFor();
  await page.goBack();
  await page.getByRole('heading',{name:'Warnings',exact:true}).waitFor();
  assert.match(await page.locator('#activity-position').innerText(),/6–7 of 7/);
  assert.equal(await page.getByLabel('Events per page',{exact:true}).inputValue(),'5');
  await page.getByLabel('Activity source',{exact:true}).selectOption('visit');
  assert.match(await page.locator('#activity-count').innerText(),/2 unacknowledged warnings · 1 unacknowledged error across all 4 events recorded this visit/);
  assert.equal(await page.locator('.activity-table tbody tr').count(),3);
  assert.equal(await page.locator('[data-acknowledged="true"]').count(),0);
  await page.getByLabel('Activity source',{exact:true}).selectOption('example');
  assert.match(await page.locator('#activity-position').innerText(),/6–7 of 7/);
  assert.equal(await page.getByLabel('Events per page',{exact:true}).inputValue(),'5');

  // Check responsive rows with real text enlargement, not only a width
  // breakpoint. This does not establish assistive-technology comprehension.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert(await page.locator('.activity-table caption').evaluate(el => el.getBoundingClientRect().width >= el.closest('table').getBoundingClientRect().width * .95), 'The responsive caption must use the event-list width rather than a narrow table-caption column.');
  await page.keyboard.press('Tab');
  await page.locator('#ack-e04').focus();
  assert.notEqual(await page.locator('#ack-e04').evaluate(el => getComputedStyle(el).outlineStyle),'none');
  await page.emulateMedia({forcedColors:'active'});
  assert.match(await page.locator('[data-event-id="e04"]').innerText(),/Warning[\s\S]*Acknowledged/);
  await page.locator('#menu-toggle').click();
  assert(await page.locator('nav[aria-label="Workspace"] a').first().isVisible());
  assert(await page.locator('nav[aria-label="Workspace"] a').first().evaluate(el => getComputedStyle(el).color !== getComputedStyle(document.body).backgroundColor), 'Forced-color navigation links must remain visible against the page.');
  await page.locator('#menu-toggle').click();
  await mkdir('output/playwright/administration',{recursive:true});
  await page.screenshot({path:'output/playwright/administration/activity-narrow.png',fullPage:true});
  await page.locator('.activity-table caption').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/administration/activity-narrow-detail.png'});
  await page.emulateMedia({forcedColors:'none'});
  await page.setViewportSize({width:1280,height:900});
  await page.evaluate(() => document.documentElement.style.fontSize = '');
  await page.reload();
  await page.getByRole('heading',{name:'Warnings',exact:true}).waitFor();
  assert.equal(await page.getByLabel('Activity source',{exact:true}).inputValue(),'visit');
  assert.match(await page.locator('#activity-count').innerText(),/0 unacknowledged warnings · 0 unacknowledged errors across all 0 events recorded this visit/);
  await page.getByLabel('Activity source',{exact:true}).selectOption('example');
  assert.match(await page.locator('#activity-count').innerText(),/6 unacknowledged warnings · 1 unacknowledged error/);
  assert.equal(await page.locator('[data-acknowledged="true"]').count(),0);
  await page.screenshot({path:'output/playwright/administration/activity.png',fullPage:true});

  // Exercise a real example task, not just controlled event injection. Saving
  // access must record the saved version without pretending it was verified.
  if (!await page.locator('[data-nav="people"]').isVisible()) await page.locator('[data-branch="administration"]').click();
  await page.locator('[data-nav="people"]').click();
  await page.getByRole('link',{name:'Mira',exact:true}).click();
  await page.locator('input[name="role"][value="editor"]').check();
  await page.locator('#reason').fill('Mira will edit the shared meeting notes.');
  await page.locator('#save').click();
  await page.getByRole('link',{name:'Activity & logs',exact:true}).click();
  await page.getByRole('link',{name:'All events',exact:true}).click();
  await page.getByLabel('Activity source',{exact:true}).selectOption('visit');
  await page.getByRole('button',{name:'Show 1 new event',exact:true}).click();
  assert.equal(await page.locator('.activity-table tbody tr').count(),1);
  const savedEvent = page.locator('.activity-table tbody tr');
  assert.match(await savedEvent.innerText(),/Mira’s Editor access was saved/);
  assert.match(await savedEvent.innerText(),/saved access still needs its permission check/);
  await savedEvent.getByText('Original entry',{exact:true}).click();
  const savedRecord = JSON.parse(await savedEvent.locator('pre').innerText());
  assert.equal(savedRecord.subject,'mira');
  assert.equal(savedRecord.version,2);
  assert.equal(savedRecord.level,'info');

  // A real return decision records the reason and routes back to the editable
  // request. Acknowledgment cannot approve it or erase that historical reason.
  await page.evaluate(() => location.hash = 'request/harbor-request-whiteboard/review');
  await page.locator('#request-review').waitFor();
  if (!await page.locator('#request-review').evaluate(element => element.parentElement.open)) await page.locator('#request-review').click();
  await page.locator('#request-review-reason').fill('Specify the wall and mounting height.');
  await page.locator('#return-request').click();
  await page.evaluate(() => location.hash = 'activity/warnings');
  await page.getByRole('heading',{name:'Warnings',exact:true}).waitFor();
  await page.getByRole('button',{name:'Show 1 new event',exact:true}).click();
  const returnedEvent = page.locator('.activity-table tbody tr');
  assert.match(await returnedEvent.innerText(),/Correction requested: Specify the wall and mounting height/);
  const returnedId = await returnedEvent.getAttribute('data-event-id');
  await returnedEvent.getByRole('button',{name:/^Acknowledge warning:/}).click();
  await page.locator(`[data-event-id="${returnedId}"]`).getByRole('link',{name:'Review the requested correction',exact:true}).click();
  await page.locator('#request-draft').waitFor();
  assert.equal(await page.evaluate(() => document.activeElement.id),'request-draft');
  assert.equal(await page.evaluate(async () => (await import('./work-state.js')).getRequest('harbor-request-whiteboard').status),'returned');
  await page.goBack();
  await page.getByRole('heading',{name:'Warnings',exact:true}).waitFor();
  assert.equal(await page.locator(`[data-event-id="${returnedId}"]`).getAttribute('data-acknowledged'),'true');
  assert.equal(await page.locator(`[data-event-id="${returnedId}"]`).getAttribute('data-severity'),'warning');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(() => scrollTo(0,0));
  assert(await page.locator('.activity-description').evaluate(element => element.getBoundingClientRect().top < element.parentElement.querySelector('.activity-time').getBoundingClientRect().top));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({path:'output/playwright/administration/activity-remedy-narrow.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: real access-save and returned-request events, explicit correction reason and focused remedy route, acknowledgment distinct from resolution, separate visit/example sources, stable arrival snapshots/focus, complete-source counts, severity/history retention, unknown-source preservation, pagination and compact narrow/enlarged layout.');
} finally {
  await browser.close();
}
