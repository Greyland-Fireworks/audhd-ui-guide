import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as api from 'audhd-ui-framework';
import * as legacy from '../../preferences/profile.js';
import v1 from 'audhd-ui-framework/v1.schema.json' with { type: 'json' };
import v2 from 'audhd-ui-framework/v2.schema.json' with { type: 'json' };
import palettes from 'audhd-ui-framework/palettes' with { type: 'json' };

test('Public API remains browser-independent and legacy exports are identical', () => {
  assert.equal(typeof window, 'undefined');
  assert.deepEqual(Object.keys(api).sort(), ['emptyProfile','migrateProfile','parseProfile','resolveProfiles','validateProfile']);
  for (const key of Object.keys(api)) assert.equal(api[key], legacy[key]);
  assert.equal(api.validateProfile(api.emptyProfile()).schema_version, 2);
  assert.equal(v1.properties.schema_version.const, 1);
  assert.equal(v2.properties.schema_version.const, 2);
  assert.equal(palettes.length, 45);
});

test('Schema and palette compatibility copies cannot drift', async () => {
  for (const name of ['v1.schema.json','v2.schema.json']) {
    assert.deepEqual(await readFile(new URL(`../../preferences/${name}`, import.meta.url)), await readFile(new URL(`../../packages/audhd-ui-framework/${name}`, import.meta.url)));
  }
  assert.deepEqual(await readFile(new URL('../../examples/skins/palette-data.json', import.meta.url)), await readFile(new URL('../../packages/audhd-ui-framework/palette-data.json', import.meta.url)));
});

test('Public parsing, migration and resolution preserve inputs and contract distinctions', () => {
  const low = api.emptyProfile(); low.display.text_scale = 1.25;
  low.support.return_summary = true;
  const high = api.emptyProfile(); high.support.return_summary = false;
  const frozen = JSON.stringify([low, high]);
  assert.equal(api.resolveProfiles(low, high).display.text_scale, 1.25);
  assert.equal(api.resolveProfiles(low, high).support.return_summary, false);
  assert.equal(JSON.stringify([low, high]), frozen);
  assert.notEqual(api.migrateProfile(low), low);
  assert.throws(() => api.parseProfile('{"schema_version":2,"schema_versi\\u006fn":2}'), /Duplicate/);
  assert.throws(() => api.parseProfile('{"schema_version":9}'), /Unsupported/);
  assert.throws(() => api.parseProfile('{'), /Invalid JSON/);
});
