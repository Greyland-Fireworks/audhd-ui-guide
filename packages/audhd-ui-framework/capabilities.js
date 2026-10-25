import { emptyProfile, migrateProfile, validateProfile } from './profile.js';

const fields = Object.entries(emptyProfile()).flatMap(([group, values]) =>
  values && typeof values === 'object' ? Object.keys(values).map(key => [group, key]) : []);
const paths = new Set(fields.map(([group, key]) => `${group}.${key}`));

// Declarations are JSON-shaped data. Inspect descriptors before reading values
// so validation does not invoke application getters or lose hidden properties.
function assertData(value, ancestors = new Set()) {
  if (value === null || ['string', 'boolean'].includes(typeof value) || (typeof value === 'number' && Number.isFinite(value))) return;
  if (!value || typeof value !== 'object' || ancestors.has(value)) throw Error('Capabilities must contain only acyclic JSON data.');
  const array = Array.isArray(value);
  if (Object.getPrototypeOf(value) !== (array ? Array.prototype : Object.prototype)) throw Error('Capability objects must be plain data.');
  ancestors.add(value);
  const keys = Reflect.ownKeys(value).filter(key => !(array && key === 'length'));
  if (array && keys.length !== value.length) throw Error('Capability arrays must be dense lists.');
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value') ||
        (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))) {
      throw Error('Capabilities cannot contain accessors, hidden properties or non-JSON keys.');
    }
    assertData(descriptor.value, ancestors);
  }
  ancestors.delete(value);
}

function equal(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && equal(a[key], b[key]));
}

export function validateCapabilities(declaration) {
  if (!declaration || Object.getPrototypeOf(declaration) !== Object.prototype) throw Error('Capabilities must be a plain object.');
  assertData(declaration);
  for (const [path, choices] of Object.entries(declaration)) {
    if (!paths.has(path)) throw Error(`Unknown capability path: ${path}`);
    if (choices === true) continue;
    if (!Array.isArray(choices)) throw Error(`Capability ${path} must be true or a list of values.`);
    const [group, key] = path.split('.');
    for (const value of choices) {
      if (value === null) throw Error(`Capability ${path} cannot list null; null is unspecified.`);
      const probe = emptyProfile();
      probe[group][key] = value;
      validateProfile(probe);
    }
  }
  return declaration;
}

export function inspectCapabilities(input, declaration) {
  validateCapabilities(declaration);
  const profile = migrateProfile(input);
  const rows = fields.map(([group, key]) => {
    const path = `${group}.${key}`, value = profile[group][key];
    const declared = Object.hasOwn(declaration, path);
    const supported = declared && (declaration[path] === true || declaration[path].some(choice => equal(choice, value)));
    return { path, value: structuredClone(value), declared, status: value === null ? 'unspecified' : supported ? 'supported' : 'unsupported' };
  });
  return { profile, rows };
}
