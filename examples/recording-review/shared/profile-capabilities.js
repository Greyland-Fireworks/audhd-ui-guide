import { migrateProfile } from '../../../preferences/profile.js';
import palettes from '../../skins/palette-data.json' with { type: 'json' };

// This is a data capability report, not a common application state engine.
// Each adapter applies these fields independently. Unsupported intent survives
// export and never becomes a claim that the demo implements persistence, etc.
export function inspectProfile(input) {
  const profile = migrateProfile(input);
  const rows = [];
  for (const [group, fields] of Object.entries(profile)) {
    if (!fields || typeof fields !== 'object') continue;
    for (const [key, value] of Object.entries(fields)) {
      const path = `${group}.${key}`;
      let supported = ['display.appearance', 'display.text_style', 'layout.density', 'support.help_detail'].includes(path);
      if (path === 'display.appearance' && value?.mode === 'skin') supported = palettes.some(p => p.id === value.id);
      if (path === 'display.text_scale') supported = [null, 1, 1.25].includes(value);
      const handled = supported && value !== null;
      rows.push({ path, value: JSON.stringify(value), supported, message: value === null ? (supported ? 'Unspecified: use demo default' : 'Unspecified') : handled ? 'Supported in this demo' : 'Not applied in this demo; retained for export' });
    }
  }
  return { profile, rows };
}
