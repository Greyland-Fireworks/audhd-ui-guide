import palettes from 'audhd-ui-framework/palettes' with { type: 'json' };

// AUDHD-04 (../../../GUIDE.md#audhd-04-explain-effective-behavior).
// This shared declaration is the import-preview contract for both recording
// demos. Schema-valid does not mean applied: undeclared or unsupported requests
// stay visible in the preview and survive export, while App applies only its
// supported values. Keep this aligned with both App applyProfile functions so a
// reader is not promised a change that the rendered interface cannot make.
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
