import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import workflow from './scenarios/workflow.js';
import navigation from './scenarios/navigation.js';
import appearance from './scenarios/appearance.js';
import headingFocus from './scenarios/heading-focus.js';
import help from './scenarios/context-help.js';

test.beforeEach(async ({page}) => { await mkdir('output/playwright',{recursive:true}); await page.goto('/'); });
for (const [name,run] of Object.entries({workflow,navigation,appearance,headingFocus,help})) {
  test(name, async ({page}, info) => { const result=await run(page); await info.attach('observations',{body:JSON.stringify(result,null,2),contentType:'application/json'}); });
}

test('Relationships, reflow and forced colors', async ({page}) => {
  for (const width of [1440,320]) {
    await page.setViewportSize({width,height:1080});
    const data=await page.evaluate(()=>{
      const source=document.querySelector('.current-record'), panel=document.querySelector('.review-panel');
      const a=getComputedStyle(source),b=getComputedStyle(panel);
      return {surface:a.backgroundColor===b.backgroundColor,title:getComputedStyle(source.querySelector('.record-title')).color===getComputedStyle(panel.querySelector('h2')).color, overflow:document.documentElement.scrollWidth>innerWidth,below:panel.getBoundingClientRect().top>source.getBoundingClientRect().bottom};
    });
    expect(data.surface).toBe(true); expect(data.title).toBe(true); expect(data.overflow).toBe(false);
    if(width===320) expect(data.below).toBe(true);
  }
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  const action=page.getByRole('button',{name:'Reviewing Harbor morning',exact:true});
  await action.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  expect(await action.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  await expect(page.getByText('Current recording',{exact:true})).toBeVisible();
});

test('Palette preview retains labels and data through all skins', async ({page}) => {
  await page.goto('http://127.0.0.1:4185/preview.html');
  await page.locator('details').first().locator('summary').click();
  const picks=page.locator('[data-pick]'); expect(await picks.count()).toBe(22);
  for(const button of await picks.all()) {
    await button.click();
    await expect(page.locator('table').first()).toBeVisible();
    await expect(page.getByText('No data for week 4.',{exact:false})).toBeVisible();
    await expect(page.locator('table').nth(1).getByRole('row',{name:'4 No data No data',exact:true})).toBeVisible();
    await expect(page.getByText('Negative → zero → positive.',{exact:false})).toBeVisible();
  }
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Actual text contrast, all skin/style combinations and enlarged targets', async ({page}) => {
  await page.getByRole('navigation',{name:'Workspace sections',exact:true}).getByRole('link',{name:'Workspace preferences'}).click();
  const skins=page.getByRole('combobox',{name:'Appearance',exact:true});
  const styles=page.getByRole('combobox',{name:'Text style',exact:true});
  const values=await skins.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value).filter(v=>v.startsWith('skin:')));
  await page.setViewportSize({width:320,height:900});
  await page.getByRole('combobox',{name:'Text size',exact:true}).selectOption('larger');
  for(const skin of values) {
    await skins.selectOption(skin);
    for(const type of ['system','expressive','serif','mono']) {
      await styles.selectOption(type);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${skin}/${type} reflow`).toBe(true);
    }
    const failures=await page.evaluate(()=>{
      const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
      return [...document.querySelectorAll('h1,h2,h3,p,label,a,button,select,summary')].filter(el=>el.getClientRects().length).flatMap(el=>{
        let surface=el;while(surface.parentElement&&getComputedStyle(surface).backgroundColor==='rgba(0, 0, 0, 0)')surface=surface.parentElement;
        const a=luminance(getComputedStyle(el).color),b=luminance(getComputedStyle(surface).backgroundColor);
        const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        return ratio<4.5?[{text:el.textContent.slice(0,50),ratio}]:[];
      });
    });
    expect(failures,skin).toEqual([]);
  }
  await page.getByRole('combobox',{name:'Spacing',exact:true}).selectOption('compact');
  const undersized=await page.locator('a,button,select,summary,input').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length).filter(el=>{const box=el.getBoundingClientRect();return box.width<44||box.height<44;}).map(el=>el.textContent||el.id));
  expect(undersized).toEqual([]);
});
