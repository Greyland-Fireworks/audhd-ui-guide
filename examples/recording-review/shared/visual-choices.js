import palettes from 'audhd-ui-framework/palettes';
// AUDHD-10 (../../../GUIDE.md#audhd-10-support-interruptions-and-working-preferences).
// This is the shared choice vocabulary, sourced from the full skin registry so
// the adapters cannot silently offer different palettes. App owns the effective
// selection and device-mode mapping; samples do not save preferences or review
// work. Typography and spacing remain independent choices, not skin side effects.
export const appearanceChoices = [
  { value: 'system', label: 'Default', description: 'Use the default appearance for this device.' },
  ...palettes.map(p => ({ value: `skin:${p.id}`, label: `${p.name} (${p.mode})`, skin: p.id, description: `${p.mode === 'light' ? 'Light' : 'Dark'} surface. Sample shows text, action and selection colors.` }))
];
export const styleChoices = [
  {value:'expressive',label:'Skin headings',description:'Use the selected skin’s paired typography where supplied, with local fallbacks.'},
  {value:'serif',label:'Serif',description:'Use Georgia or the available serif fallback.'},
  {value:'mono',label:'Monospace',description:'Use letters and symbols that each take the same width.'},
  {value:'system',label:'System',description:'Use the system font.'}
];
export const sizeChoices = [
  {value:'standard',label:'Standard',description:'Use the standard text size.'},
  {value:'larger',label:'Larger',description:'Make text 25% larger than Standard.'}
];
export const spacingChoices = [
  {value:'comfortable',label:'Comfortable',description:'More padding inside cards and more space between cards and groups. Line spacing stays unchanged.'},
  {value:'compact',label:'Compact',description:'Less card padding and smaller gaps between cards and groups. Line spacing and minimum control sizes stay unchanged.'}
];
