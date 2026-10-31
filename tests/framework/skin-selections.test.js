import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../../packages/audhd-ui-framework/', import.meta.url);
const selections = JSON.parse(await readFile(new URL('skin-selections.json', root)));
const registry = JSON.parse(await readFile(new URL('palette-data.json', root)));
const fonts = JSON.parse(await readFile(new URL('fonts-manifest.json', root)));
const css = await readFile(new URL('skins.css', root), 'utf8');
const faces = await readFile(new URL('fonts.css', root), 'utf8');

test('Chosen workbench combinations retain their identity and exact core colors in CSS', () => {
  assert.deepEqual(selections.map(s => s.id), [
    'murica', 'canto', 'pearl-river', 'porcelain-studio', 'jade-tile', 'szechuan',
    'lacquer-cabinet', 'tea-horse-road', 'peony-album', 'souk', 'damascus-inlay',
    'palm-shade', 'night-bazaar', 'hacienda', 'patio-moderno', 'atacama-dusk',
    'golden-child', 'brass-cabinet', 'black-gold', 'astral-foundry', 'brass-circuit',
  ]);
  const byId = Object.fromEntries(selections.map(s => [s.id, s]));
  assert.deepEqual(byId.murica.source, { palette: 'M01 Union Paper', heading: 'M02 Federal Ledger', body: 'M02 Federal Ledger' });
  assert.deepEqual(byId.szechuan.source, { palette: 'S01 Bamboo Manuscript', heading: 'S03 Celadon Vessel', body: 'S03 Celadon Vessel' });
  assert.equal(byId['brass-cabinet'].heading, byId['brass-circuit'].heading);
  assert.equal(byId['brass-cabinet'].body, 'Work Sans');
  assert.equal(byId['jade-tile'].colors.page, byId.canto.colors.page);
  const roles = { page: 'page', surface: 'surface', ink: 'text', action: 'action', accent: 'active-accent', ornament: 'ornament', success: 'success', danger: 'danger' };
  for (const selected of selections) {
    assert.deepEqual(registry.find(s => s.id === selected.id), { id: selected.id, name: selected.name, mode: selected.mode });
    const block = css.match(new RegExp(`\\[data-audhd-ui\\]\\[data-skin="${selected.id}"\\] \\{([^}]+)\\}`))[1];
    const tokens = Object.fromEntries([...block.matchAll(/--ui-([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]]));
    for (const [source, token] of Object.entries(roles)) assert.equal(tokens[token], selected.colors[source], `${selected.id}: ${source}`);
    assert.ok(tokens['font-heading'].startsWith(`'AuDHD ${selected.heading}'`));
    assert.ok(tokens['font-body'].startsWith(`'AuDHD ${selected.body}'`));
    assert.equal(Number(tokens['font-heading-weight']), selected.headingWeight);
    for (const [family, weight] of [[selected.heading, selected.headingWeight], [selected.body, 400]]) {
      assert.ok(fonts.some(f => f.family === family && f.weight === weight), `${selected.id}: missing ${family} ${weight}`);
    }
  }
});

test('Bundled fonts retain the licensed bytes and resolve locally from CSS', async () => {
  assert.equal(fonts.length, 31);
  assert.ok(css.startsWith('@import url("./fonts.css");'));
  for (const font of fonts) {
    assert.match(font.file, /^fonts\/[a-z0-9-]+\.woff2$/);
    assert.match(font.license, /^fonts\/licenses\/[a-z0-9-]+\.txt$/);
    const data = await readFile(new URL(font.file, root));
    assert.equal(data.length, font.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), font.sha256, font.family);
    assert.match(await readFile(new URL(font.license, root), 'utf8'), /SIL OPEN FONT LICENSE/i);
    assert.ok(faces.includes(`font-family: 'AuDHD ${font.family}'`));
    assert.ok(faces.includes(`url('./${font.file}')`));
  }
  assert.doesNotMatch(faces, /(?:src:|@import).*https?:/);
});
