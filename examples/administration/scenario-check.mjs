import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// AUDHD-12/13: fixture controls must protect real unfinished work in the demo.
// Counts below are independent expectations, not values read from the registry.
// Module inspection establishes data ownership; UI actions establish that users
// can reach the safeguard. Neither establishes participant comprehension.
const base = process.argv[2] || 'http://127.0.0.1:4188/examples/administration/';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[]; page.on('pageerror',error=>errors.push(error.message));
await mkdir('output/playwright/administration',{recursive:true});
const route = async hash => { await page.evaluate(value=>{location.hash=value;},hash); await page.waitForTimeout(80); };
const fixture = async kind => {
  if(await page.locator('#guide-toggle').getAttribute('aria-pressed')!=='true') await page.locator('#guide-toggle').click();
  await page.locator('.scenario-controls').evaluate(el=>{el.open=true;});
  await page.locator('#scenario-fixture').selectOption(kind);
  await page.locator('#scenario-prepare').click();
  assert.equal(await page.locator('#scenario-cancel').evaluate(el=>el===document.activeElement),true);
  await page.locator('#scenario-replace').click();
};
const data = () => page.evaluate(async()=>{
  const n=await import('./notes-state.js'), s=await import('./schedule-state.js'), w=await import('./work-state.js');
  return {notes:n.notes.length, eligibleNoteIds:n.notes.filter(note=>note.status!=='trash').map(note=>note.id), meetings:s.getCalendarEvents().length, tasks:w.getTasks(), requests:w.getRequests(), drafts:n.noteDrafts.size};
});
try {
  await page.goto(base+'#notes/new');
  await page.locator('#note-title').fill('Unfinished scenario test');
  await page.locator('#note-body').fill('Keep these words until replacement is confirmed.');
  const before=await data();
  await page.locator('#guide-toggle').click();
  assert.deepEqual(await data(),before,'Opening Guide notes changes no owning task data');
  await page.locator('.scenario-controls > summary').click();
  await page.locator('#scenario-fixture').selectOption('busy');
  await page.locator('#scenario-prepare').click();
  await page.locator('#scenario-cancel').click();
  assert.equal(await page.locator('#note-title').inputValue(),'Unfinished scenario test');
  assert.deepEqual(await data(),before,'Cancelled replacement retains records and drafts');
  await page.locator('#scenario-rooms').selectOption('failure');
  await page.locator('#guide-toggle').click();
  assert.match(await page.locator('#scenario-indicator').innerText(),/Rooms: failure/);
  assert.equal(await page.locator('#note-body').inputValue(),'Keep these words until replacement is confirmed.');

  await fixture('busy');
  const busy=await data();
  assert.equal(busy.notes,60); assert.equal(busy.meetings,20);
  assert.equal(busy.tasks.length,24); assert.equal(busy.requests.length,12);
  assert.equal(busy.drafts,0);
  for(const status of ['blocked','open','doing','done']) assert.equal(busy.tasks.filter(x=>x.status===status).length,6);
  for(const status of ['draft','pending','approved','returned']) assert.equal(busy.requests.filter(x=>x.status===status).length,3);
  assert(busy.tasks.some(x=>x.dependencies.length)); assert(busy.tasks.some(x=>x.requestId));
  assert(busy.tasks.every(task=>!task.noteId||busy.eligibleNoteIds.includes(task.noteId)), 'Seeded task links must remain valid when a user saves the task');
  await page.locator('#guide-toggle').click();
  assert.match(await page.locator('#scenario-indicator').innerText(),/Busy workspace/);
  await route('people'); assert.equal(await page.locator('#records > li').count(),12);
  await page.locator('#search').fill('Mira');
  await route('calendar/week'); await page.screenshot({path:'output/playwright/administration/busy-week.png',fullPage:true});
  await route('people'); assert.equal(await page.locator('#search').inputValue(),'Mira');
  await route('directory');
  assert.equal(await page.locator('#main a[href="#people/mira"]').count(),1);
  await page.screenshot({path:'output/playwright/administration/busy-directory.png',fullPage:true});
  await page.setViewportSize({width:390,height:844}); await route('calendar/week');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'output/playwright/administration/busy-day-narrow.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await fixture('empty'); await page.locator('#guide-toggle').click();
  const empty=await data(); assert.equal(empty.notes+empty.meetings+empty.tasks.length+empty.requests.length,0);
  await route('people'); assert.match(await page.locator('#records').innerText(),/No configured accounts/);
  assert.equal(await page.locator('#records a[href="#notes/new"]').count(),1);
  await route('overview'); await page.screenshot({path:'output/playwright/administration/empty-overview.png',fullPage:true});
  await route('activity/warnings');
  const activityReset = await page.evaluate(async () => {
    const { replaceScenario } = await import('./scenario-state.js');
    const frames = [], original = window.requestAnimationFrame;
    // Hold a source-change announcement until after replacement. This models
    // a pending UI result from the previous workspace, without timing sleeps.
    window.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
    try {
      const source = document.querySelector('#activity-source');
      source.value = 'example'; source.dispatchEvent(new Event('change', {bubbles:true}));
      replaceScenario('empty');
      frames.splice(0).forEach(callback => callback(performance.now()));
      return {source:document.querySelector('#activity-source').value, announcement:document.querySelector('#activity-announcement').textContent};
    } finally { window.requestAnimationFrame = original; }
  });
  assert.deepEqual(activityReset,{source:'visit',announcement:''},'Old activity announcements must not describe a replaced workspace');
  await fixture('normal'); await page.locator('#guide-toggle').click(); await route('overview');
  assert.equal(await page.locator('#scenario-indicator').isVisible(),false);
  assert.deepEqual(errors,[]);
  console.log('Scenario check passed: unchanged opening/cancel, retained drafts/failures, exact fixtures, dynamic directory, retained filters and narrow busy calendar.');
} finally { await browser.close(); }
