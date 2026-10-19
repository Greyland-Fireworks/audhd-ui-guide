export default async (page) => {
  const assert = (ok, message) => { if (!ok) throw Error(message); };
  page.setDefaultTimeout(10000);
  const results = [];
  for (const port of [new URL(page.url()).port]) {
    await page.goto(`http://127.0.0.1:${port}/#recordings/REC-002/review`);
    await page.reload(); // Start each test with a fresh demo, even on repeat runs.
    const nav = page.getByRole('navigation', {name:'Workspace sections', exact:true});
    const note = page.getByRole('textbox', {name:'Review note', exact:true});
    await note.fill('Snapshot before appearance changes');
    await page.getByRole('button', {name:'Save review', exact:true}).click();
    await note.fill('Newer unsaved draft must survive');
    await page.getByRole('searchbox').fill('Market');
    await page.getByRole('tab', {name:'Recording details',exact:true}).click();
    await nav.getByRole('link',{name:'Workspace preferences',exact:true}).click();
    const skin = page.getByRole('combobox',{name:'Appearance',exact:true});
    const style = page.getByRole('combobox',{name:'Text style',exact:true});
    const ids = await skin.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value).filter(value=>value.startsWith('skin:')));
    assert(ids.length===22,'22 skins available');
    for (const id of ids) {
      await skin.focus(); await skin.selectOption(id);
      assert(await page.locator('html').getAttribute('data-skin')===id.slice(5),'Skin applied');
      assert(await skin.evaluate(el=>el===document.activeElement),'Skin retains focus');
      assert(page.url().endsWith('#preferences'),'Appearance does not navigate');
    }
    for (const value of ['expressive','serif','mono','system']) {
      await style.focus(); await style.selectOption(value);
      assert(await page.locator('html').getAttribute('data-type')===value,'Text style applied');
      assert(await style.evaluate(el=>el===document.activeElement),'Text style retains focus');
    }
    await skin.selectOption('skin:bubblegum'); await style.selectOption('serif');
    assert(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily.includes('Georgia')),'Selected font renders');
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No narrow overflow');
    await page.screenshot({path:`output/appearance-${port}-light.png`,fullPage:true});
    await nav.getByRole('link',{name:'Recordings',exact:true}).click();
    assert(page.url().includes('REC-002/details'),'Record and sub-tab retained');
    assert(await page.getByRole('searchbox').inputValue()==='Market','Filter retained');
    assert(await page.locator('#save-feedback').innerText()==='Saving earlier edits; newer changes are not saved.','Pending save retained');
    await page.getByRole('tab',{name:'Review',exact:true}).click();
    assert(await note.inputValue()==='Newer unsaved draft must survive','Unsaved draft retained');
    await page.emulateMedia({forcedColors:'active'}); await note.focus();
    assert(await note.evaluate(el=>getComputedStyle(el).outlineStyle)!=='none','Forced-colors focus survives');
    await page.emulateMedia({forcedColors:'none'});
    await page.screenshot({path:`output/appearance-${port}-review.png`,fullPage:true});
    results.push({port,skins:22,styles:4,preserved:['draft','pending save','filter','record','sub-tab','focus']});
  }
  return results;
}
