# Portable preferences

[Authoritative format, precedence and privacy](../PREFERENCES.md) · [Field reference](../README_JSON.md)

Install from the repository root with `npm ci` (Node 22.12+). Validation is read-only:

```sh
npm run preferences -- validate preferences.example.json
npm run preferences -- migrate preferences/fixtures/v1.json --out audhd-preferences.local.json
npm test
```

Migration validates first, creates a new v2 file exclusively, and refuses to overwrite any existing destination, including its input. The conventional output filename and backups are ignored; ignore rules are not access control. Choose an authorized private location. No automatic discovery, uploads or storage occur.

The schemas use JSON Schema draft-07. `parseProfile(text)` performs strict parsing, rejects duplicate decoded keys, and validates. `validateProfile(object)` validates already parsed data; use the text parser at file boundaries because an ordinary JSON parser may already have discarded duplicates. `migrateProfile(profile)` returns a detached v2 copy. `emptyProfile(scope)` creates null leaves. `resolveProfiles(...profiles)` merges lowest-to-highest precedence, preserving false and replacing arrays/appearance atomically. These are stateless utilities; they do not enforce product permissions or implement settings. See [Ajv](https://ajv.js.org/json-schema.html) and [jsonc-parser](https://github.com/microsoft/node-jsonc-parser).

The v1 fixture is the original fictional example. The main [v2 example](../preferences.example.json) is also fictional, not recommended defaults or a personal profile. Both schemas require complete objects and reject unknown keys. Unsupported skin IDs are distinct from malformed profiles; the consuming application reports capabilities before application. Rule emphasis remains outside the JSON contract.
