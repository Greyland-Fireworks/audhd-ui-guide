import Ajv from 'ajv';
import { parseTree, printParseErrorCode } from 'jsonc-parser';
import v1 from './v1.schema.json' with { type: 'json' };
import v2 from './v2.schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true, strict: true });
const validators = { 1: ajv.compile(v1), 2: ajv.compile(v2) };

// JSON.parse alone loses duplicate properties. Inspect decoded keys in the AST
// before constructing a value; comments/trailing commas are not profile syntax.
export function parseProfile(text) {
  const errors = [];
  const tree = parseTree(text, errors, { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false });
  if (errors.length || !tree) throw Error(`Invalid JSON: ${errors.map(e => `${printParseErrorCode(e.error)} at offset ${e.offset}`).join('; ')}`);
  function inspect(node) {
    if (node.type === 'object') {
      const keys = new Set();
      for (const property of node.children) {
        const key = property.children[0].value;
        if (keys.has(key)) throw Error(`Duplicate key: ${key}`);
        keys.add(key);
      }
    }
    for (const child of node.children || []) inspect(child);
  }
  inspect(tree);
  const profile = JSON.parse(text);
  validateProfile(profile);
  return profile;
}

export function validateProfile(profile) {
  const version = profile?.schema_version;
  const validate = Number.isInteger(version) && Object.hasOwn(validators, version) ? validators[version] : null;
  if (!validate) throw Error('Unsupported preference version; expected 1 or 2.');
  if (!validate(profile)) throw Error(ajv.errorsText(validate.errors, { separator: '; ' }));
  return profile;
}

export function migrateProfile(profile) {
  validateProfile(profile);
  const result = structuredClone(profile);
  if (result.schema_version === 1) {
    const legacy = result.display.accessibility_theme_override;
    delete result.display.accessibility_theme_override;
    result.display.appearance = legacy === null ? null : { mode: legacy };
    result.display.text_style = null;
    result.schema_version = 2;
  }
  return validateProfile(result);
}

export function emptyProfile(scope = 'project') {
  const result = { schema_version: 2, scope };
  for (const [group, schema] of Object.entries(v2.properties)) {
    if (schema.type === 'object') result[group] = Object.fromEntries(schema.required.map(key => [key, null]));
  }
  return validateProfile(result);
}

// Inputs are ordered from product defaults to user, project, and temporary
// instructions. Appearance objects and arrays are atomic leaves, not deep merges.
export function resolveProfiles(...profiles) {
  const result = emptyProfile();
  for (const profile of profiles) {
    if (!profile) continue;
    const current = migrateProfile(profile);
    for (const [group, fields] of Object.entries(current)) {
      if (typeof fields !== 'object' || fields === null) continue;
      for (const [key, value] of Object.entries(fields)) {
        if (value !== null) result[group][key] = structuredClone(value);
      }
    }
  }
  return result;
}
