import palettes from 'audhd-ui-framework/palettes' with { type: 'json' };

// These declarations describe the recording demos, not every package consumer.
export const recordingCapabilities = {
  'display.appearance': [
    ...['system', 'light', 'dark'].map(mode => ({ mode })),
    ...palettes.map(({ id }) => ({ mode: 'skin', id })),
  ],
  'display.text_style': true,
  'display.text_scale': [1, 1.25],
  'layout.density': true,
  'support.help_detail': true,
};

export const capabilityMessage = row => row.status === 'unspecified'
  ? (row.declared ? 'Unspecified: use demo default' : 'Unspecified')
  : row.status === 'supported' ? 'Supported in this demo' : 'Not applied in this demo; retained for export';

export const importMessage = state => ({
  reading: 'Reading preferences. Nothing applied yet.',
  cancelled: 'Import cancelled. Current preferences unchanged.',
  ready: state.preview?.sourceVersion === 1
    ? 'Version 1 converted to a version 2 preview. Original file unchanged.'
    : 'Preferences ready to preview. Nothing applied yet.',
})[state.state] ?? '';
