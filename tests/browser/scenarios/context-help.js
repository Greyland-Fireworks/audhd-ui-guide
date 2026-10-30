export default async (page) => {
  page.setDefaultTimeout(10000);
  const assert = (ok, message) => { if (!ok) throw Error(message); };
  const results = [];
  for (const port of [new URL(page.url()).port]) {
    await page.setViewportSize({width:1280,height:1000});
    await page.goto(`http://127.0.0.1:${port}/#recordings/REC-001/review`);
    await page.reload();
    const note=page.getByRole('textbox',{name:'Review note',exact:true});
    await note.fill('Keep this draft while reading help');
    await page.getByRole('button',{name:'Save review',exact:true}).click();
    const nav=page.getByRole('navigation',{name:'Workspace sections',exact:true});
    for (const topic of ['review status','demo saving','skin','text style']) {
      if(topic==='skin') { await nav.getByRole('link',{name:'Workspace preferences',exact:true}).click(); await page.locator('.appearance-disclosure > summary').click(); }
      const trigger=page.getByRole('button',{name:`About ${topic}`,exact:true});
      await page.mouse.move(10,10); // Establish pointer modality before entering after keyboard use.
      await trigger.hover();
      const tip=page.getByRole('tooltip');
      await tip.waitFor({state:'visible'}).catch(e=>{throw Error(topic+': tooltip open: '+e.message);});
      assert((await tip.innerText()).length>70, 'Substantive explanation');
      await tip.hover();
      await page.waitForTimeout(800); // Beyond close delay: pointer over text must keep help open.
      assert(await tip.isVisible(),'Hoverable content');
      await page.keyboard.press('Escape');
      await tip.waitFor({state:'hidden'});
      await page.mouse.move(0,0);
      // Establish keyboard modality, then finish scrolling before refocusing.
      // Radio groups can otherwise move focus several screenfuls away.
      await trigger.focus(); await page.keyboard.press('Tab');
      await trigger.scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await trigger.focus();
      await tip.waitFor({state:'visible'}).catch(e=>{throw Error(topic+': keyboard open: '+e.message);});
      await page.waitForFunction(label => document.querySelector(`[aria-label="${label}"]`)?.getAttribute('aria-describedby'), `About ${topic}`);
      const described=await trigger.getAttribute('aria-describedby');
      assert(described && await page.locator(`[id="${described}"]`).count()>0,'Accessible description');
      await page.keyboard.press('Escape'); await tip.waitFor({state:'hidden'});
      assert(await trigger.evaluate(el=>el===document.activeElement),'Escape preserves focus');
      await page.keyboard.press('Enter');
      assert(await trigger.getAttribute('aria-expanded')==='true','Press opens inline help');
      const detail=page.locator(`[id="${await trigger.getAttribute('aria-controls')}"]`);
      assert(await detail.isVisible(),'Persistent explanation');
      assert(await detail.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=16,'Decision help retains ordinary reading size');
      assert(await trigger.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=16,'Help control retains ordinary reading size');
      await page.mouse.move(0,0); await page.keyboard.press('Tab');
      assert(await detail.isVisible(),'Persistent help survives leaving trigger');
      await trigger.focus(); await page.keyboard.press('Escape');
      assert(await trigger.getAttribute('aria-expanded')==='false','Inline help dismisses');
    }
    await page.getByRole('group',{name:'Appearance',exact:true}).locator('input[value="skin:bubblegum"]').check();
    await page.getByRole('group',{name:'Text size',exact:true}).locator('input[value="larger"]').check();
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'About skin',exact:true}).click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Narrow enlarged help reflows');
    await page.screenshot({path:`output/help-${port}-narrow.png`,fullPage:true});
    await nav.getByRole('link',{name:'Recordings',exact:true}).click();
    assert(await note.inputValue()==='Keep this draft while reading help','Draft preserved');
    assert(await page.locator('#save-feedback').innerText()==='Saving review.','Pending save preserved');
    await page.emulateMedia({forcedColors:'active'});
    const reviewHelp=page.getByRole('button',{name:'About review status',exact:true});
    // Finish scrolling before testing keyboard-open help; viewport movement
    // can dismiss floating help independently of keyboard focus.
    await reviewHelp.scrollIntoViewIfNeeded();
    await page.mouse.move(0,0);
    await reviewHelp.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    await page.getByRole('tooltip').waitFor({state:'visible'});
    assert(await reviewHelp.evaluate(el=>getComputedStyle(el).outlineStyle)!=='none','Forced-colors keyboard focus');
    await page.emulateMedia({forcedColors:'none'});
    await page.setViewportSize({width:1280,height:1000});
    await reviewHelp.hover(); await page.getByRole('tooltip').waitFor({state:'visible'});
    await page.screenshot({path:`output/help-${port}-tooltip.png`});
    const touch=await page.context().browser().newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
    const touchPage=await touch.newPage();
    try {
      await touchPage.goto(`http://127.0.0.1:${port}/#preferences`);
      await touchPage.locator('.appearance-disclosure > summary').click();
      const button=touchPage.getByRole('button',{name:'About skin',exact:true});
      await button.tap();
      assert(await button.getAttribute('aria-expanded')==='true','Touch opens persistent help');
      await button.tap();
      assert(await button.getAttribute('aria-expanded')==='false','Touch closes persistent help');
    } finally { await touch.close(); }
    results.push({port,hover:true,keyboard:true,escape:true,touch:true,persistent:true,draft:true,pendingSave:true,narrowLarger:true});
  }
  return results;
}
