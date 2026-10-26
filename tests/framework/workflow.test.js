import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { emptyProfile } from 'audhd-ui-framework';
import { inspectCapabilities, validateCapabilities } from 'audhd-ui-framework/capabilities';
import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
import { recordingCapabilities } from '../../examples/recording-review/shared/profile-capabilities.js';

const text = () => JSON.stringify(emptyProfile());
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('Declarations reject hidden, accessor and non-data properties without invoking getters', () => {
  let reads = 0;
  const accessor = Object.defineProperty({}, 'display.text_style', { enumerable: true, get() { reads++; return true; } });
  const hidden = Object.defineProperty({}, 'display.text_style', { value: false });
  const inherited = Object.create({ mode: 'system' });
  for (const value of [accessor, hidden, { [Symbol('unknown')]: true }, { 'display.appearance': [inherited] }]) {
    assert.throws(() => validateCapabilities(value));
  }
  assert.equal(reads, 0);
});

test('Reentrant cancellation delivers the replacement state once and never starts the read', async () => {
  const controller = createImportWorkflow({ capabilities: {} });
  const states = [];
  controller.subscribe(({state}) => { if (state === 'reading') controller.cancel(); });
  controller.subscribe(({state}) => states.push(state));
  let reads = 0;
  await controller.importText(() => { reads++; return text(); });
  assert.deepEqual(states, ['cancelled']);
  assert.equal(reads, 0);
});

test('Unusual read rejections still produce a visible error and permit retry', async () => {
  const controller = createImportWorkflow({ capabilities: {} });
  for (const reason of [new Error(''), '', Object.create(null)]) {
    await controller.importText(() => Promise.reject(reason));
    assert.equal(controller.getSnapshot().state, 'error');
    assert.ok(controller.getSnapshot().error.length > 0);
    await controller.importText(text);
    assert.equal(controller.getSnapshot().state, 'ready');
  }
});

test('Declarations validate paths and values without changing schema or intent', () => {
  for (const invalid of [null, [], true, { scope: true }, { 'display.text_scale': false },
    { 'display.text_scale': [null] }, { 'display.text_scale': [0] },
    { 'display.appearance': [{ mode: 'skin' }] }, { 'display.text_style': ['invented'] }]) {
    assert.throws(() => validateCapabilities(invalid));
  }
  const declaration = { 'display.text_scale': [1, 1.25], 'support.return_summary': [false],
    'display.appearance': [{ id: 'unknown-skin', mode: 'skin' }],
    'display.group_cues': [['text', 'shape']] };
  assert.equal(validateCapabilities(declaration), declaration);
  const profile = emptyProfile();
  profile.display.text_scale = 1.125;
  profile.support.return_summary = false;
  profile.display.appearance = { mode: 'skin', id: 'unknown-skin' };
  profile.display.group_cues = ['shape', 'text'];
  const before = JSON.stringify([profile, declaration]);
  const result = inspectCapabilities(profile, declaration);
  const row = path => result.rows.find(row => row.path === path);
  assert.equal(row('display.text_scale').status, 'unsupported');
  assert.equal(row('support.return_summary').status, 'supported');
  assert.equal(row('support.return_summary').value, false);
  assert.equal(row('display.appearance').status, 'supported');
  assert.equal(row('display.group_cues').status, 'unsupported');
  assert.equal(row('display.text_style').status, 'unspecified');
  assert.equal(row('display.text_style').declared, false);
  assert.equal(JSON.stringify([profile, declaration]), before);
  result.profile.display.appearance.id = 'changed';
  row('display.appearance').value.id = 'row-changed';
  assert.equal(profile.display.appearance.id, 'unknown-skin');
  assert.equal(result.profile.display.appearance.id, 'changed');
  profile.display.group_cues.reverse();
  assert.equal(inspectCapabilities(profile, declaration).rows.find(r => r.path === 'display.group_cues').status, 'supported');
  assert.equal(inspectCapabilities(profile, { 'display.appearance': true }).rows.find(r => r.path === 'display.appearance').status, 'supported');
  assert.equal(inspectCapabilities(profile, {}).rows.find(r => r.path === 'display.appearance').status, 'unsupported');
  const reordered = Object.fromEntries(Object.entries(profile).reverse());
  assert.deepEqual(inspectCapabilities(reordered, {}).rows.map(r => r.path), result.rows.map(r => r.path));
});

test('Workflow emits detached states, migrates v1, and preserves fixed declarations', async () => {
  const capabilities = { 'display.text_scale': [1] };
  const controller = createImportWorkflow({ capabilities });
  capabilities['display.text_scale'].push(1.25);
  const states = [];
  controller.subscribe(state => { states.push(state.state); if (state.preview) state.preview.profile.scope = 'user'; });
  const profile = emptyProfile(); profile.display.text_scale = 1.25;
  const pending = controller.importText(() => JSON.stringify(profile));
  assert.equal(controller.getSnapshot().state, 'reading');
  await pending;
  assert.deepEqual(states, ['reading', 'ready']);
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.preview.profile.scope, 'project');
  assert.equal(snapshot.preview.rows.find(r => r.path === 'display.text_scale').status, 'unsupported');
  snapshot.preview.profile.scope = 'user';
  assert.equal(controller.getSnapshot().preview.profile.scope, 'project');
  const v1 = await readFile(new URL('../../preferences/fixtures/v1.json', import.meta.url), 'utf8');
  await controller.importText(() => v1);
  assert.equal(controller.getSnapshot().preview.sourceVersion, 1);
  assert.equal(controller.getSnapshot().preview.profile.schema_version, 2);
  controller.dispose();
});

test('Current read and parse failures clear previews and allow retry', async () => {
  const controller = createImportWorkflow({ capabilities: {} });
  for (const read of [() => { throw Error('read failed'); }, () => Promise.reject(Error('async failure')),
    () => '{', () => '{"schema_version":2,"schema_versi\\u006fn":2}', () => '{"schema_version":9}']) {
    await controller.importText(text);
    await controller.importText(read);
    const state = controller.getSnapshot();
    assert.equal(state.state, 'error'); assert.equal(state.preview, null); assert.equal(typeof state.error, 'string');
  }
  await controller.importText(text);
  assert.equal(controller.getSnapshot().state, 'ready');
});

test('Only the latest read can update state, including stale rejections', async () => {
  for (const reject of [false, true]) {
    const controller = createImportWorkflow({ capabilities: {} });
    const earlier = deferred();
    const pending = controller.importText(() => earlier.promise);
    await controller.importText(text);
    const newer = controller.getSnapshot();
    if (reject) earlier.reject(Error('stale failure')); else earlier.resolve('{');
    await pending;
    assert.deepEqual(controller.getSnapshot(), newer);
  }
});

test('Cancel, disposal, unsubscribe and independent instances isolate lifecycle', async () => {
  for (const action of ['cancel', 'dispose']) {
    const controller = createImportWorkflow({ capabilities: {} });
    const other = createImportWorkflow({ capabilities: {} });
    const read = deferred(), states = [];
    const unsubscribe = controller.subscribe(state => states.push(state.state));
    const pending = controller.importText(() => read.promise);
    controller[action]();
    const after = controller.getSnapshot();
    read.resolve(text()); await pending;
    assert.deepEqual(controller.getSnapshot(), after);
    assert.equal(other.getSnapshot().state, 'idle');
    unsubscribe();
    const count = states.length;
    controller.cancel();
    await controller.importText(text);
    assert.equal(states.length, count);
    if (action === 'dispose') assert.equal(controller.getSnapshot().preview, null);
    else {
      assert.equal(controller.getSnapshot().state, 'ready');
      controller.cancel(); controller.cancel();
      assert.equal(controller.getSnapshot().state, 'cancelled');
      assert.equal(controller.getSnapshot().preview, null);
    }
  }
});

test('Recording declaration describes only its implemented choices', () => {
  validateCapabilities(recordingCapabilities);
  assert.deepEqual(Object.keys(recordingCapabilities).sort(), ['display.appearance', 'display.text_scale', 'display.text_style', 'layout.density', 'support.help_detail']);
  assert.equal(recordingCapabilities['display.appearance'].length, 27);
  for (const [path, choices] of Object.entries(recordingCapabilities)) {
    if (choices === true) continue;
    for (const value of choices) {
      const profile = emptyProfile(), [group, key] = path.split('.'); profile[group][key] = value;
      assert.equal(inspectCapabilities(profile, recordingCapabilities).rows.find(r => r.path === path).status, 'supported');
    }
  }
});
