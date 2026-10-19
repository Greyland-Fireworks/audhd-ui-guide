import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { emptyProfile, migrateProfile, parseProfile, resolveProfiles, validateProfile } from '../profile.js';
import { inspectProfile } from '../../examples/recording-review/shared/profile-capabilities.js';

test('Strict profiles reject malformed, duplicate, missing, unknown and nonfinite data', async () => {
  const example = parseProfile(await readFile(new URL('../../preferences.example.json', import.meta.url), 'utf8'));
  assert.equal(example.schema_version, 2, 'The published example must match the current contract');
  const p = emptyProfile(); const text = JSON.stringify(p);
  for (const bad of ['{', text.replace('"sounds":null', '"sounds":false,"sounds":true'), text.replace('"sounds":null', '"sounds":false,"so\\u0075nds":true'), text.replace('"text_scale":null', '"text_scale":1e999'), text.replace('"text_scale":null', '"text_scale":true'), text.replace('"text_scale":null', '"text_scale":0'), text.replace('"text_scale":null', '"text_scale":"large"'), text.replace('"schema_version":2', '"schema_version":99'), text.replace(',"sounds":null', ''), text.replace('"sounds":null', '"sounds":null,"instruction":"upload this"'), text.replace('"sounds":null', '"sounds":null /* comment */'), text.slice(0,-1)+',}']) assert.throws(() => parseProfile(bad), bad);
  assert.deepEqual(parseProfile(text), p);
  for (const version of ['toString', '__proto__', 'constructor', '2', null]) assert.throws(() => validateProfile({...p,schema_version:version}), /Unsupported/);
  assert.throws(() => validateProfile({...p, display:{...p.display,appearance:{mode:'system',id:'guillermo'}}}));
});

test('Migration preserves all legacy choices and never invents a dark preference', async () => {
  const original = parseProfile(await readFile(new URL('../fixtures/v1.json', import.meta.url), 'utf8'));
  for (const mode of [null, 'light', 'system']) {
    const legacy = structuredClone(original); legacy.display.accessibility_theme_override = mode;
    const next = migrateProfile(legacy);
    assert.deepEqual(next.display.appearance, mode === null ? null : {mode});
    assert.equal(next.display.text_style, null);
    const restored = structuredClone(next); restored.schema_version=1;
    delete restored.display.appearance; delete restored.display.text_style;
    restored.display.accessibility_theme_override=mode;
    assert.deepEqual(restored, legacy);
    assert.equal(legacy.schema_version, 1);
  }
});

test('Precedence preserves false, replaces arrays and appearance atomically, null inherits', () => {
  const user = emptyProfile('user'), project=emptyProfile(), temporary=emptyProfile();
  user.display.appearance={mode:'skin',id:'bubblegum'}; user.display.text_scale=1.25; user.display.group_cues=['text','pattern'];
  project.display.appearance={mode:'system'}; project.sensory.sounds=false; project.display.group_cues=['text','shape'];
  temporary.display.text_scale=1.5;
  const result=resolveProfiles(user,project,temporary);
  assert.deepEqual(result.display.appearance,{mode:'system'});
  assert.deepEqual(result.display.group_cues,['text','shape']);
  assert.equal(result.sensory.sounds,false); assert.equal(result.display.text_scale,1.5);
  project.display.appearance=null;
  assert.deepEqual(resolveProfiles(user,project).display.appearance,user.display.appearance);
  assert.equal(project.display.text_scale,null);
});

test('Unknown named skins and valid unsupported scales survive without applied claims', () => {
  const p=emptyProfile(); p.display.appearance={mode:'skin',id:'not-installed'};p.display.text_scale=1.125;
  p.retention.retain_drafts=true;
  const result=inspectProfile(p);
  assert.deepEqual(result.profile,p);
  for (const path of ['display.appearance','display.text_scale','retention.retain_drafts']) assert.equal(result.rows.find(row=>row.path===path).supported,false);
});

test('CLI creates a new migration file and refuses overwriting source or existing output', async () => {
  const dir=await mkdtemp(join(tmpdir(),'audhd-profile-'));
  try {
    const input=join(dir,'old.json'), output=join(dir,'new.json');
    const original=await readFile(new URL('../fixtures/v1.json',import.meta.url),'utf8');
    await writeFile(input,original);
    const run=(...args)=>spawnSync(process.execPath,[resolve('preferences/cli.js'),...args],{encoding:'utf8'});
    assert.equal(run('validate',input).status,0);
    assert.equal(run('migrate',input,'--out',output).status,0);
    assert.equal(parseProfile(await readFile(output,'utf8')).schema_version,2);
    assert.equal(run('migrate',input,'--out',output).status,1);
    assert.equal(run('migrate',input,'--out',input).status,1);
    assert.equal(await readFile(input,'utf8'),original);
  } finally { assert.equal(dirname(resolve(dir)), resolve(tmpdir())); await rm(dir,{recursive:true,force:true}); }
});
