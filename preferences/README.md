# Portable preferences

The canonical implementation and schemas now live in the optional [framework package](../packages/audhd-ui-framework/README.md). The existing `profile.js` path remains a compatibility re-export; schema files remain checked compatibility copies. CLI behavior and schema versions are unchanged. Consumers can import the package without importing appearance CSS.

[Authoritative format, precedence and privacy](../PREFERENCES.md) · [Field reference](../README_JSON.md)

Install dependencies from the repository root with `npm ci` (Node 22.12 or newer). This command checks a profile without changing it:

```sh
npm run preferences -- validate preferences.example.json
```

To convert a v1 profile, explicitly choose a new output file:

```sh
npm run preferences -- migrate preferences/fixtures/v1.json --out audhd-preferences.local.json
```

Migration validates first, writes a new v2 file, and refuses to overwrite any existing destination, including its input. The conventional output filename and backups are ignored; ignore rules are not access control. Choose an authorized private location. No automatic discovery, uploads or storage occur.

The schemas use JSON Schema draft-07. `parseProfile(text)` performs strict parsing, rejects duplicate decoded keys, and validates. `validateProfile(object)` validates already parsed data; use the text parser at file boundaries because an ordinary JSON parser may already have discarded duplicates. `migrateProfile(profile)` returns a separate v2 copy. `emptyProfile(scope)` creates a profile whose preference fields are null. `resolveProfiles(...profiles)` gives later profiles precedence, preserves false as an explicit choice and replaces arrays/appearance objects as whole values. These are stateless utilities; they do not enforce product permissions or implement settings. See [Ajv](https://ajv.js.org/json-schema.html) and [jsonc-parser](https://github.com/microsoft/node-jsonc-parser).

The v1 fixture is the original fictional example. The main [v2 example](../preferences.example.json) is also fictional, not recommended defaults or a personal profile. Both schemas require complete objects and reject unknown keys. Unsupported skin IDs are distinct from malformed profiles; the consuming application reports capabilities before application. Rule emphasis remains outside the JSON contract.
