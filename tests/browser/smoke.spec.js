import palettes from 'audhd-ui-framework/palettes' with { type: 'json' };
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { emptyProfile } from '../../preferences/profile.js';
import { recordingCapabilities } from '../../examples/recording-review/shared/profile-capabilities.js';
import schema from 'audhd-ui-framework/v2.schema.json' with { type: 'json' };

const upload = (page, value) => page.getByLabel('Import preferences').setInputFiles({name:'preferences.json',mimeType:'application/json',buffer:Buffer.from(typeof value==='string'?value:JSON.stringify(value))});
const nav = page => page.getByRole('navigation',{name:'Workspace sections',exact:true});

test('Every declared recording preference value is previewed and applied', async ({page}) => {
  await page.goto('/#preferences');
  await page.emulateMedia({ colorScheme: 'light' });
  for (const [path, declaration] of Object.entries(recordingCapabilities)) {
    const [group, key] = path.split('.');
    const values = declaration === true ? schema.properties[group].properties[key].enum.filter(v => v !== null) : declaration;
    for (const value of values) {
      const profile = emptyProfile(); profile[group][key] = value;
      await upload(page, profile);
      await expect(page.locator('.profile-preview li').filter({has: page.locator('strong', {hasText: path})})).toContainText('Supported in this demo');
      await page.getByRole('button', {name: 'Apply for this session'}).click();
      if (path === 'display.appearance') {
        await expect(page.locator('html')).toHaveAttribute('data-skin', value.mode === 'skin' ? value.id : value.mode === 'dark' ? 'guillermo' : 'paperwhite');
      } else if (path === 'display.text_style') await expect(page.locator('html')).toHaveAttribute('data-type', value);
      else if (path === 'display.text_scale') await expect(page.getByRole('group',{name:'Text size',exact:true}).locator('input:checked')).toHaveValue(value === 1.25 ? 'larger' : 'standard');
      else if (path === 'layout.density') await expect(page.getByRole('group',{name:'Spacing',exact:true}).locator('input:checked')).toHaveValue(value);
      else await expect(page.getByRole('combobox', {name:'Detailed help',exact:true})).toHaveValue(value === 'expanded' ? 'expanded' : 'collapsed');
    }
  }
});

test('Pending imports cancel and ignore stale success or error after a newer preview', async ({page}) => {
  await page.goto('/#preferences');
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = async function() {
      const text = await original.call(this);
      if (text.includes('held-read')) await new Promise(done => window.releaseRead = done);
      if (text.includes('reject-read')) throw Error('Stale read error');
      return text;
    };
  });
  const held = emptyProfile(); held.display.appearance = {mode:'skin',id:'held-read'};
  const hold = async value => {
    await page.evaluate(() => window.releaseRead = null);
    await upload(page, value);
    await page.waitForFunction(() => typeof window.releaseRead === 'function');
  };
  const release = () => page.evaluate(async () => { window.releaseRead(); await new Promise(done => setTimeout(done,0)); });
  await hold(held);
  await expect(page.locator('.profile-controls [role=status]')).toContainText('Reading preferences');
  await page.getByRole('button', {name:'Cancel import'}).focus(); await page.keyboard.press('Enter');
  await release();
  await expect(page.getByLabel('Import preferences')).toBeFocused();
  await expect(page.locator('.profile-preview')).toHaveCount(0);
  for (const value of [held, 'held-read reject-read']) {
    await hold(value);
    const newer = emptyProfile(); newer.display.text_style = 'mono';
    await upload(page, newer);
    await expect(page.locator('.profile-preview')).toContainText('mono');
    await release();
    await expect(page.locator('.profile-preview')).not.toContainText('held-read');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-type', 'expressive');
  }
  await hold(held);
  await page.getByLabel('Import preferences').setInputFiles([]);
  await release();
  await expect(page.locator('.profile-preview')).toHaveCount(0);
});

test('Profile preview, apply, system appearance and export preserve pending work', async ({page}) => {
  await page.goto('/#recordings/REC-002/review');
  const note=page.getByRole('textbox',{name:'Review note',exact:true});
  await note.fill('Snapshot'); await page.getByRole('button',{name:'Save review',exact:true}).click();
  await note.fill('Newer draft'); await page.getByRole('searchbox').fill('Market');
  await page.getByRole('tab',{name:'Recording details',exact:true}).click();
  await nav(page).getByRole('link',{name:'Workspace preferences'}).click();
  const profile=emptyProfile();profile.display.appearance={mode:'skin',id:'bubblegum'};
  profile.display.text_style='serif';profile.display.text_scale=1.25;profile.layout.density='compact';profile.support.help_detail='expanded';profile.retention.retain_drafts=true;
  await upload(page,profile);
  await expect(page.getByRole('heading',{name:'Application preview'})).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-skin','guillermo');
  const apply=page.getByRole('button',{name:'Apply for this session'});
  await apply.focus(); await page.keyboard.press('Enter'); await expect(apply).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-skin','bubblegum');
  await expect(page.locator('html')).toHaveAttribute('data-type','serif');
  await page.emulateMedia({colorScheme:'dark'});
  await expect(page.locator('html')).toHaveAttribute('data-skin','bubblegum');
  await expect(page.getByRole('group',{name:'Text size',exact:true}).locator('input:checked')).toHaveValue('larger');
  const downloadEvent=page.waitForEvent('download'); await page.getByRole('button',{name:'Export preferences'}).click();
  const download=await downloadEvent;
  expect(JSON.parse(await readFile(await download.path(),'utf8'))).toEqual(profile);
  await page.locator('.appearance-disclosure > summary').click();
  await page.getByRole('group',{name:'Appearance',exact:true}).locator('input[value="system"]').check();
  await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-skin','paperwhite');
  await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-skin','guillermo');
  await nav(page).getByRole('link',{name:'Recordings',exact:true}).click();
  await expect(page).toHaveURL(/REC-002\/details$/);
  await expect(page.getByRole('searchbox')).toHaveValue('Market');
  await page.getByRole('tab',{name:'Review',exact:true}).click();await expect(note).toHaveValue('Newer draft');
  await expect(page.locator('#save-feedback')).toHaveText('Saving earlier edits; newer changes are not saved.');
  await page.reload();await expect(note).toHaveValue('');
});

test('Invalid/cancelled imports leave effective choices intact; unsupported intent stays exportable',async({page})=>{
  await page.goto('/#preferences');
  await upload(page,'{"schema_version":2,"schema_version":1}');await expect(page.getByRole('alert')).toContainText('Duplicate key');
  const unknown=emptyProfile();unknown.display.appearance={mode:'skin',id:'unknown-skin'};unknown.display.text_scale=1.125;
  await upload(page,unknown);await expect(page.locator('.profile-preview')).toContainText('Not applied in this demo');
  await page.getByRole('button',{name:'Cancel import'}).click();await expect(page.getByLabel('Import preferences')).toBeFocused();
  await expect(page.getByRole('button',{name:'Apply for this session'})).toHaveCount(0);
  await upload(page,unknown);await page.getByRole('button',{name:'Apply for this session'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-skin','guillermo');
  await expect(page.getByRole('group',{name:'Text size',exact:true}).locator('input:checked')).toHaveValue('standard');
  const downloadEvent=page.waitForEvent('download'); await page.getByRole('button',{name:'Export preferences'}).click();
  const download=await downloadEvent;
  const exported=await readFile(await download.path(),'utf8');
  expect(JSON.parse(exported)).toEqual(unknown);
  await upload(page,exported);
  await expect(page.locator('.profile-preview')).toContainText('unknown-skin');
  await expect(page.locator('.profile-preview')).toContainText('1.125');
  await page.getByRole('button',{name:'Apply for this session'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-skin','guillermo');
  const legacy=JSON.parse(await readFile('preferences/fixtures/v1.json','utf8'));
  legacy.display.accessibility_theme_override='light';
  await upload(page,legacy);await expect(page.locator('.profile-controls')).toContainText('Version 1 converted');
  await page.getByRole('button',{name:'Apply for this session'}).click();await expect(page.locator('html')).toHaveAttribute('data-skin','paperwhite');
});

test('Navigation focus, keyboard tabs and persistent help',async({page})=>{
  await page.goto('/');
  const prefs=nav(page).getByRole('link',{name:'Workspace preferences'});
  await prefs.click();await expect(page.locator('#page-heading')).toBeFocused();
  expect(await page.locator('#page-heading').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('none');
  await nav(page).getByRole('link',{name:'Recordings',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.locator('#review-heading')).toBeFocused();
  expect(await page.locator('#review-heading').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.getByRole('tab',{name:'Review',exact:true}).focus();await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Recording details',exact:true})).toBeFocused();
  await expect(page.getByRole('tab',{name:'Review',exact:true})).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('Enter');await expect(page.getByRole('textbox',{name:'Review note',exact:true})).toHaveCount(0);
  await page.getByRole('tab',{name:'Review',exact:true}).click();
  const help=page.getByRole('button',{name:'About demo saving',exact:true});
  await help.click();await expect(help).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.context-help-detail')).toContainText('not permanent storage');
  await help.focus();await page.keyboard.press('Escape');await expect(help).toHaveAttribute('aria-expanded','false');await expect(help).toBeFocused();
  await nav(page).getByRole('link',{name:'Workspace preferences'}).click(); await page.goBack();await expect(page).toHaveURL(/review$/);
});


test('Visual choice cards expose radio state, keyboard selection and representative samples', async ({page}) => {
  await page.goto('/#preferences');
  const disclosure=page.locator('.appearance-disclosure');
  await expect(disclosure).not.toHaveAttribute('open','');
  await expect(disclosure.locator('.appearance-show')).toBeVisible();
  await expect(disclosure.locator('.appearance-hide')).not.toBeVisible();
  await expect(disclosure.locator('.appearance-summary-preview')).toBeVisible();
  const displayHelp=page.getByRole('button',{name:'About display options',exact:true});
  await expect(displayHelp).toHaveAttribute('aria-expanded','false');
  await displayHelp.click();
  await expect(displayHelp).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.display-options-heading .context-help-detail')).toContainText('These choices last while this page is open');
  await displayHelp.click();
  await expect(page.getByRole('heading',{name:'Readability and spacing'})).toBeVisible();
  await disclosure.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open','');
  await expect(disclosure.locator('.appearance-hide')).toBeVisible();
  await expect(disclosure.locator('.appearance-show')).not.toBeVisible();
  const group = name => page.getByRole('group', {name,exact:true});
  await expect(group('Text style').getByRole('radio').first()).toHaveAccessibleName('Skin headings');
  await expect(group('Text style').getByRole('radio').last()).toHaveAccessibleName('System');
  await expect(group('Text style').getByRole('radio',{name:'Skin headings',exact:true})).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-type','expressive');
  for (const name of ['Appearance','Text style','Text size','Spacing']) {
    await expect(group(name).locator('input:checked')).toHaveCount(1);
    await expect(group(name).locator('.choice-state').filter({hasText:'✓ ACTIVE'})).toHaveCount(1);
  }
  await expect(group('Appearance').getByRole('radio')).toHaveCount(palettes.length + 1);
  await expect(group('Appearance').getByRole('radio',{name:'Paperwhite (light)',exact:true})).toHaveCount(1);
  await expect(group('Appearance').getByRole('radio',{name:'Guillermo (dark)',exact:true})).toHaveCount(1);
  for (const [name,topic] of [['Appearance','skin'],['Text style','text style']]) {
    const heading=group(name).getByRole('heading',{name,exact:true});
    const help=group(name).getByRole('button',{name:`About ${topic}`,exact:true});
    const labelBox=await heading.boundingBox(), helpBox=await help.boundingBox();
    expect(helpBox.x).toBeGreaterThanOrEqual(labelBox.x+labelBox.width);
    expect(helpBox.x-labelBox.x-labelBox.width).toBeLessThan(20);
    expect(Math.abs(helpBox.y+helpBox.height/2-labelBox.y-labelBox.height/2)).toBeLessThan(2);
  }
  // Click the visible footer area: the native radio covers the complete card.
  for (const skin of ['paperwhite','guillermo']) {
    const card=group('Appearance').locator('.choice-card').filter({has:page.locator(`input[value="skin:${skin}"]`)});
    const footer=card.locator('.choice-state');
    await footer.scrollIntoViewIfNeeded();
    const box=await footer.boundingBox();
    await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await expect(card.getByRole('radio')).toBeChecked();
    await expect(footer).toHaveText('✓ ACTIVE');
    await expect(page.locator('html')).toHaveAttribute('data-skin',skin);
    await expect(group('Appearance').locator('.choice-state').filter({hasText:'Inactive'})).toHaveCount(palettes.length);
    const appearance=await footer.evaluate(el=>({fill:getComputedStyle(el).backgroundColor,ink:getComputedStyle(el).color,border:getComputedStyle(el.closest('label')).borderTopWidth}));
    expect(appearance.fill).not.toBe(appearance.ink);
    expect(appearance.border).toBe('4px');
  }
  const fontPreviews=await group('Appearance').locator('.choice-preview[data-kind=appearance]').evaluateAll(nodes=>nodes.map(el=>({
    font:getComputedStyle(el.querySelector('.sample-heading')).fontFamily,
    expected:getComputedStyle(el).getPropertyValue('--ui-font-display').trim()
  })));
  for (const sample of fontPreviews) {
    // Browsers normalize quoting/whitespace in computed font-family values.
    expect(sample.font.replace(/[\"']/g,'').replace(/\s/g,'')).toBe(sample.expected.replace(/[\"']/g,'').replace(/\s/g,''));
  }
  await expect(disclosure.locator('summary')).toContainText('Guillermo');
  await disclosure.locator('summary').click();
  await expect(group('Appearance')).not.toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-skin','guillermo');
  await disclosure.locator('summary').click();
  const standard=group('Text size').getByRole('radio',{name:'Standard',exact:true});
  const larger=group('Text size').getByRole('radio',{name:'Larger',exact:true});
  await standard.focus(); await page.keyboard.press('ArrowRight');
  await expect(larger).toBeChecked(); await expect(larger).toBeFocused();
  await expect(standard).not.toBeChecked();
  const outline=await larger.evaluate(el=>getComputedStyle(el.closest('label')).outlineStyle);
  expect(outline).not.toBe('none');
  const sizes=await group('Text size').locator('.choice-preview').evaluateAll(nodes=>nodes.map(el=>parseFloat(getComputedStyle(el).fontSize)));
  expect(sizes[1]/sizes[0]).toBe(1.25);
  const gaps=await group('Spacing').locator('.choice-preview').evaluateAll(nodes=>nodes.map(el=>parseFloat(getComputedStyle(el).gap)));
  expect(gaps[0]).toBeGreaterThan(gaps[1]);
  await expect(group('Appearance').getByRole('radio',{name:'Default',exact:true})).toHaveAccessibleDescription(/default appearance for this device/);
  await page.keyboard.press('Tab');
  await expect(group('Spacing').getByRole('radio',{name:'Comfortable',exact:true})).toBeFocused();
  const dimensions=()=>group('Text style').evaluate(el=>({
    padding:parseFloat(getComputedStyle(el.querySelector('.choice-card')).paddingTop),
    gap:parseFloat(getComputedStyle(el.querySelector('.choice-grid')).gap),
    lineHeight:getComputedStyle(el).lineHeight,
    boundary:getComputedStyle(el).borderTopStyle
  }));
  const comfortable=await dimensions();
  await group('Spacing').getByRole('radio',{name:'Compact',exact:true}).check();
  const compact=await dimensions();
  expect(compact.padding).toBeLessThan(comfortable.padding);
  expect(compact.gap).toBeLessThan(comfortable.gap);
  expect(compact.lineHeight).toBe(comfortable.lineHeight);
  expect(compact.boundary).toBe('solid');
  await page.setViewportSize({width:320,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.emulateMedia({forcedColors:'active'});
  await standard.focus();
  expect(await standard.evaluate(el=>getComputedStyle(el.closest('label')).outlineStyle)).not.toBe('none');
});
