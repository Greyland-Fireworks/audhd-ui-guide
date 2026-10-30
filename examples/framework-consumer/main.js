import { emptyProfile } from 'audhd-ui-framework';
import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
import palettes from 'audhd-ui-framework/palettes';

// Fixture switches let the contract check distinguish importing CSS from opting in.
const params = new URLSearchParams(location.search);
if (!params.has('no-css')) {
  await import('audhd-ui-framework/skins.css');
  await import('audhd-ui-framework/controls.css');
}
const root = document.querySelector('#settings');
if (!params.has('no-marker')) root.setAttribute('data-audhd-ui', '');
const byId = id => document.getElementById(id);
// Applied preferences stay separate from the import preview: cancel/error must
// preserve current choices. This fixture has no durable profile storage.
let current = emptyProfile();
const workflow = createImportWorkflow({ capabilities: {
  'display.text_style': true,
  'display.appearance': palettes.map(({ id }) => ({ mode: 'skin', id })),
} });
workflow.subscribe(({ state, preview, error }) => {
  byId('preview').hidden = state !== 'ready';
  byId('cancel').hidden = !['reading', 'ready'].includes(state);
  byId('error').textContent = error ? `${error} Nothing applied.` : '';
  byId('status').textContent = ({
    reading: 'Reading preferences. Nothing applied yet.',
    ready: preview?.sourceVersion === 1 ? 'Version 1 converted to a version 2 preview. Original file unchanged.' : 'Preview ready. Nothing applied yet.',
    cancelled: 'Import cancelled. Current preferences unchanged.',
  })[state] ?? '';
  byId('choices').replaceChildren();
  for (const row of preview?.rows ?? []) {
    if (row.value === null) continue;
    const item = document.createElement('li');
    item.textContent = `${row.path}: ${JSON.stringify(row.value)} — ${row.status === 'supported' ? 'Supported' : 'Not applied; retained for export'}`;
    byId('choices').append(item);
  }
});
// A persisted page can resume from the back/forward cache; retain its controller.
addEventListener('pagehide', event => { if (!event.persisted) workflow.dispose(); });
byId('import').addEventListener('change', event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (file) void workflow.importText(() => file.text());
  else workflow.cancel();
});
byId('apply').addEventListener('click', () => {
  const { preview } = workflow.getSnapshot();
  if (!preview) return;
  current = preview.profile;
  const appearance = current.display.appearance;
  root.dataset.skin = preview.rows.find(row => row.path === 'display.appearance').status === 'supported' ? appearance.id : 'paperwhite';
  root.dataset.type = current.display.text_style ?? 'serif';
  byId('status').textContent = 'Supported choices applied for this session. Other choices retained, not applied.';
});
byId('cancel').addEventListener('click', () => {
  workflow.cancel();
  byId('import').focus();
});
byId('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(current, null, 2)], {type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = 'audhd-preferences.local.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  byId('status').textContent = 'Preference download requested. Unsaved notes are not included.';
});
