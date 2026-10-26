// Test the packed distribution, not a workspace symlink. Temp directories remain
// available for diagnosis; this script never deletes another process's workspace.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { access, mkdtemp, mkdir, readFile, writeFile, cp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const source of ['scripts/package-plugin.py', 'plugin/plugin.json']) {
  await access(join(root, source)).catch(() => {
    throw new Error(`check:framework requires the source checkout (${source} is missing). Bundled examples support npm test and npm run build.`);
  });
}
const output = join(root, 'output/framework');
await mkdir(output, {recursive:true});
const npmCli = process.env.npm_execpath;
assert(npmCli, 'Run with npm run check:framework');
const npm = (args, cwd = root) => execFileSync(process.execPath, [npmCli, ...args], {cwd, encoding:'utf8', timeout:180000});
const packed = JSON.parse(npm(['pack','--workspace','audhd-ui-framework','--json','--pack-destination',output]))[0];
const allowed = ['CONFIGURATION.md','LICENSE','LICENSE-CODE','LICENSE_SCOPE.md','README.md','package.json','profile.js','capabilities.js','import-workflow.js','v1.schema.json','v2.schema.json','skins.css','palette-data.json'];
assert.deepEqual(packed.files.map(f => f.path).sort(), allowed.sort());
const tarball = join(output, packed.filename);
const checksum = createHash('sha256').update(await readFile(tarball)).digest('hex');
await writeFile(`${tarball}.sha256`, `${checksum}  ${packed.filename}\n`);
const consumer = await mkdtemp(join(tmpdir(), 'audhd-consumer-'));
await cp(join(root,'examples/framework-consumer'), consumer, {recursive:true});
const viteVersion = JSON.parse(await readFile(join(root,'examples/recording-review/react/package.json'))).devDependencies.vite;
await writeFile(join(consumer,'package.json'), JSON.stringify({private:true,type:'module',dependencies:{'audhd-ui-framework':`file:${tarball.replaceAll('\\','/')}`},devDependencies:{vite:viteVersion}},null,2));
await writeFile(join(output,'consumer-location.txt'), consumer);
console.log(`Isolated consumer: ${consumer}`);
console.log(npm(['install','--ignore-scripts','--no-audit','--no-fund'],consumer));
const nodeProbe = `import {inspectCapabilities} from 'audhd-ui-framework/capabilities'; import {createImportWorkflow} from 'audhd-ui-framework/import-workflow'; import assert from 'node:assert/strict'; import {emptyProfile,parseProfile} from 'audhd-ui-framework'; import v1 from 'audhd-ui-framework/v1.schema.json' with {type:'json'}; import v2 from 'audhd-ui-framework/v2.schema.json' with {type:'json'}; import palettes from 'audhd-ui-framework/palettes' with {type:'json'}; assert.equal(typeof window,'undefined'); assert.equal(inspectCapabilities(emptyProfile(),{}).rows[0].status,'unspecified'); const workflow=createImportWorkflow({capabilities:{}}); await workflow.importText(()=>JSON.stringify(emptyProfile())); assert.equal(workflow.getSnapshot().state,'ready'); workflow.dispose(); assert.equal(parseProfile(JSON.stringify(emptyProfile())).schema_version,2); assert.equal(v1.properties.schema_version.const,1); assert.equal(v2.properties.schema_version.const,2); assert.equal(palettes.length,24);`;
execFileSync(process.execPath,['--input-type=module','-e',nodeProbe],{cwd:consumer,stdio:'inherit'});
console.log(npm(['exec','--','vite','build'],consumer));
const server = spawn(process.execPath,[join(consumer,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4191','--strictPort'],{cwd:consumer,stdio:['ignore','pipe','pipe'],windowsHide:true});
let serverLog=''; server.stdout.on('data',chunk=>serverLog+=chunk); server.stderr.on('data',chunk=>serverLog+=chunk);
let browser;
const base='http://127.0.0.1:4191';
try {
  let ready=false;
  for(let i=0;i<100;i++) {
    assert.equal(server.exitCode,null,`Fixture server exited: ${serverLog}`);
    // Require this process's startup message before contacting its port.
    if(serverLog.includes('4191')) { try { ready=(await fetch(base)).ok; } catch {} }
    if(ready) break;
    await new Promise(done=>setTimeout(done,200));
  }
  assert(ready,`Fixture server unavailable: ${serverLog}`);
  browser=await chromium.launch();
  const page=await browser.newPage();
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  const styles=()=>page.evaluate(()=>Object.fromEntries(['settings','neighbor'].map(id=>{const s=getComputedStyle(document.getElementById(id));return [id,{color:s.color,background:s.backgroundColor,font:s.fontFamily}]})));
  await page.goto(`${base}/?no-css`); await page.waitForFunction(()=>document.querySelector('#settings').hasAttribute('data-audhd-ui'));
  const plain=await styles();
  await page.goto(`${base}/?no-marker`); await page.waitForFunction(()=>document.styleSheets.length>0);
  assert.deepEqual(await styles(),plain,'Importing CSS without a marker must not style matching unmarked attributes/classes');
  await page.goto(base); await page.waitForFunction(()=>document.querySelector('#settings').hasAttribute('data-audhd-ui'));
  const styled=await styles(); assert.deepEqual(styled.neighbor,plain.neighbor); assert.notDeepEqual(styled.settings,plain.settings);
  await page.getByLabel('Unsaved note').fill('Do not export or erase this draft');
  const profile=JSON.parse(await readFile(join(root,'preferences.example.json')));
  profile.display.appearance={mode:'skin',id:'obsidian'}; profile.display.text_scale=1.75;
  const upload=value=>page.getByLabel('Import preferences').setInputFiles({name:'profile.json',mimeType:'application/json',buffer:Buffer.from(typeof value==='string'?value:JSON.stringify(value))});
  await upload(profile); await page.getByRole('button',{name:'Apply for this session'}).waitFor();
  assert.match(await page.locator('#choices').innerText(),/Not applied; retained for export/);
  await page.getByRole('button',{name:'Apply for this session'}).focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#settings').getAttribute('data-skin'),'obsidian');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'apply');
  assert.equal(await page.getByLabel('Unsaved note').inputValue(),'Do not export or erase this draft');
  const downloaded=page.waitForEvent('download'); await page.getByRole('button',{name:'Export preferences'}).click();
  const download=await downloaded;
  const exported=JSON.parse(await readFile(await download.path(),'utf8')); assert.deepEqual(exported,profile); assert(!JSON.stringify(exported).includes('Do not export'));
  await upload(profile); await page.getByRole('button',{name:'Cancel import'}).click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'import');
  assert.equal(await page.locator('#preview').isVisible(),false);
  await upload('{'); await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Invalid JSON'));
  assert.equal(await page.locator('#settings').getAttribute('data-skin'),'obsidian');
  // Hold an earlier read until the newer preview is visible, then explicitly
  // release it. This tests ordering without assuming a machine's speed.
  await page.evaluate(()=>{
    const original=File.prototype.text;
    File.prototype.text=async function(){
      const value=await original.call(this);
      if(value.includes('slow-marker')) await new Promise(done=>window.releaseRead=done);
      if(value.includes('reject-marker')) throw new Error('Stale read failure');
      return value;
    };
  });
  const holdRead=async value=>{
    await page.evaluate(()=>window.releaseRead=null);
    await upload(value);
    await page.waitForFunction(()=>typeof window.releaseRead==='function');
  };
  const releaseRead=()=>page.evaluate(async()=>{
    window.releaseRead();
    // Let the awaiting file handler finish, including its parse/error branch.
    await new Promise(done=>setTimeout(done,0));
  });
  const slow=structuredClone(profile); slow.display.appearance={mode:'skin',id:'slow-marker'};
  // Cancellation must be available before a slow file finishes reading.
  await holdRead(slow);
  assert.equal(await page.locator('#status').innerText(),'Reading preferences. Nothing applied yet.');
  await page.getByRole('button',{name:'Cancel import'}).focus();
  await page.keyboard.press('Enter');
  await releaseRead();
  assert.equal(await page.locator('#preview').isVisible(),false);
  assert.equal(await page.locator('#cancel').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'import');
  assert.equal(await page.locator('#status').innerText(),'Import cancelled. Current preferences unchanged.');
  assert.equal(await page.locator('#settings').getAttribute('data-skin'),'obsidian');
  assert.equal(await page.getByLabel('Unsaved note').inputValue(),'Do not export or erase this draft');
  for (const earlier of [slow, 'slow-marker reject-marker']) {
    await holdRead(earlier);
    await upload(profile);
    await page.waitForFunction(()=>!document.querySelector('#preview').hidden);
    const newerChoices=await page.locator('#choices').innerText();
    await releaseRead();
    assert.equal(await page.locator('#choices').innerText(),newerChoices);
    assert.equal(await page.locator('#error').innerText(),'');
    assert.equal(await page.locator('#status').innerText(),'Preview ready. Nothing applied yet.');
  }
  // An empty selection invalidates an in-flight read without applying it.
  await holdRead(slow);
  await page.getByLabel('Import preferences').setInputFiles([]);
  await releaseRead();
  assert.equal(await page.locator('#preview').isVisible(),false);
  assert.equal(await page.locator('#settings').getAttribute('data-skin'),'obsidian');
  assert.equal(await page.getByLabel('Unsaved note').inputValue(),'Do not export or erase this draft');
  await upload(profile);
  await page.getByRole('button',{name:'Apply for this session'}).waitFor();
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  assert.equal(await page.locator('#settings').evaluate(el=>getComputedStyle(el).forcedColorAdjust),'auto');
  await page.getByRole('button',{name:'Apply for this session'}).focus();
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#apply').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
  assert.deepEqual(errors,[]);
  await page.screenshot({path:join(output,'consumer-forced-colors.png'),fullPage:true});
  // Verify the narrower fixture declaration against effective application.
  await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
  const palettes=JSON.parse(await readFile(join(root,'packages/audhd-ui-framework/palette-data.json')));
  for (const appearance of palettes.map(({id})=>({mode:'skin',id}))) {
    const choice=structuredClone(profile); choice.display.appearance=appearance;
    await upload(choice);
    await page.getByRole('button',{name:'Apply for this session'}).click();
    assert.equal(await page.locator('#settings').getAttribute('data-skin'),appearance.id);
  }
  for (const style of ['system','expressive','serif','mono']) {
    const choice=structuredClone(profile); choice.display.text_style=style;
    await upload(choice);
    await page.getByRole('button',{name:'Apply for this session'}).click();
    assert.equal(await page.locator('#settings').getAttribute('data-type'),style);
  }
  assert.equal(await page.getByLabel('Unsaved note').inputValue(),'Do not export or erase this draft');
  assert.deepEqual(errors,[]);
} finally { await browser?.close(); server.kill(); }

// Test clean plugin assembly as a separate distribution boundary.
const python=process.env.PYTHON || 'python';
console.log(execFileSync(python,['scripts/package-plugin.py'],{cwd:root,encoding:'utf8',timeout:120000}));
const plugin=await mkdtemp(join(tmpdir(),'audhd-plugin-'));
// The assembled tree is exactly the ZIP input; extract the ZIP to catch archive omissions.
const pluginManifest=JSON.parse(await readFile(join(root,'plugin/plugin.json')));
execFileSync(python,['-m','zipfile','-e',join(root,`output/openai/audhd-ui-guide-${pluginManifest.version}.zip`),plugin],{cwd:root,stdio:'inherit'});
const clean=join(plugin,'skills/audhd-ui-guide');
console.log(npm(['ci','--ignore-scripts','--no-audit','--no-fund'],clean));
assert.throws(
  () => execFileSync(process.execPath,['scripts/check-framework.mjs'],{cwd:clean,encoding:'utf8',stdio:'pipe'}),
  error => error.status === 1 && error.stderr.includes('check:framework requires the source checkout'),
  'Bundled plugin must explain the source-only distribution check before packing or installing'
);
console.log(npm(['test'],clean));
console.log(npm(['run','build'],clean));
const bundleSizes={};
for(const framework of ['react','svelte']) {
  const folder=join(clean,`examples/recording-review/${framework}/dist/assets`);
  bundleSizes[framework]={};
  for(const name of await readdir(folder)) bundleSizes[framework][name]=gzipSync(await readFile(join(folder,name))).length;
}
await writeFile(join(output,'results.json'),JSON.stringify({status:'internal candidate; manual and skill gates recorded separately',checksum,consumer,plugin,checks:['packed allowlist','Node public imports','isolated install/build','CSS opt-in and isolation','import/apply/cancel/export','draft/focus continuity','malformed reads','stale success and stale rejection after newer preview','empty selection invalidates pending read','forced-color emulation','source-checkout diagnostic','clean plugin install/test/build'],bundleSizes},null,2));
console.log(`PASS: isolated package and clean plugin checks. Candidate: ${tarball}`);
