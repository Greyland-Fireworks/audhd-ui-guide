# audhd-ui-framework

Version 0.1.0-alpha.2 is an internal candidate, not a validated release. This optional foundation supplies preference utilities and scoped appearance assets for existing applications. It neither requires nor supplies React, Svelte, routing, persistence, authorization, telemetry or a component library.

## Install a local candidate

With Node 22.12 or newer, run `npm pack --workspace audhd-ui-framework --pack-destination output` from the source repository (create output first). In a consumer, run `npm install /path/to/audhd-ui-framework-0.1.0-alpha.2.tgz`. No registry publication is configured. The repository's `npm run check:framework` creates and tests a tarball and writes its checksum.

```js
import { parseProfile, emptyProfile, resolveProfiles } from 'audhd-ui-framework';
const profile = parseProfile(fileText); // Validate before preview; does not apply it.
const effective = resolveProfiles(emptyProfile(), profile);
```

## Public interface

| Export | Contract |
|---|---|
| `parseProfile(text)` | Strict JSON parsing, decoded duplicate-key rejection and schema validation; returns the parsed profile or throws. |
| `validateProfile(profile)` | Validates supported v1/v2 data; returns the input or throws. At file boundaries use parseProfile so duplicate keys are not lost. |
| `migrateProfile(profile)` | Validates and returns a detached v2 copy; does not write a file. |
| `emptyProfile(scope = 'project')` | Creates a v2 profile with null choices. |
| `resolveProfiles(...profiles)` | Low-to-high precedence; null inherits, false is a choice, arrays and appearance replace atomically. Inputs are not mutated. |
| `audhd-ui-framework/v1.schema.json`, `audhd-ui-framework/v2.schema.json` | Existing JSON Schema contracts; no new preference version. |
| `audhd-ui-framework/palettes` | JSON palette registry; use JSON import attributes in Node. |
| `audhd-ui-framework/skins.css` | Optional styles; never imported by the JavaScript API. |

The host owns capability checks, effective application, system preferences, privacy and retention. Valid data is not proof that an application supports a requested choice. Preserve unsupported intent for export while reporting what actually applied. No automatic file discovery, storage or network access occurs.

## Application capabilities

Import `validateCapabilities` and `inspectCapabilities` from `audhd-ui-framework/capabilities`. Declarations are plain objects keyed by existing v2 preference paths. Each entry is `true` (all schema-valid non-null values) or a list of complete supported values. An empty list supports no explicit value; omitted fields are unsupported. Unknown paths, malformed entries, invalid values and null list entries throw. Validation returns the input declaration unchanged.

Declarations must be acyclic JSON-shaped data with dense arrays. Accessors, hidden or symbol properties and custom-prototype objects are rejected before their property values are read. Validation does not invoke declaration getters.

```js
import { inspectCapabilities } from 'audhd-ui-framework/capabilities';
const capabilities = {
  'display.text_style': true,
  'display.text_scale': [1, 1.25],
  'display.appearance': [{ mode: 'system' }, { mode: 'skin', id: 'paperwhite' }],
};
const report = inspectCapabilities(profile, capabilities);
```

Inspection validates and migrates to a detached v2 `profile`. `rows` contain every preference field in schema order: `{ path, value, declared, status }`. Values remain typed and detached; status is `unspecified`, `supported` or `unsupported`. Null is always unspecified, including declared fields. Compound choices match completely: object key order is irrelevant, array order is significant. An unknown named skin can be valid data while unsupported by a particular application.

Declarations describe the host's promised support, not verified application. Hosts own defaults, explanations, formatting and effective values. A supported preview never means the preference has already applied. Test declarations against actual host behavior.

## Import and preview workflow

```js
import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
const workflow = createImportWorkflow({ capabilities });
const unsubscribe = workflow.subscribe(snapshot => renderPreview(snapshot));
await workflow.importText(() => selectedFile.text()); // Explicit host action.
// In the host's Apply handler, after checking state === 'ready':
const requested = workflow.getSnapshot().preview.profile;
applyInThisApplication(requested); // Host owns application and its announcement.
// In the host's Cancel handler: workflow.cancel(); then restore focus.
// On host teardown: unsubscribe(); workflow.dispose();
```

Snapshots are detached `{ state, preview, error }` values. State is `idle`, `reading`, `ready`, `error` or `cancelled`; preview/error are null unless applicable. A ready preview contains `{ profile, rows, sourceVersion }`. Capabilities are validated and copied once at creation. Changing the original declaration does not change the controller.

`subscribe(listener)` receives synchronous state changes, not an initial notification; use `getSnapshot()` for initial rendering. Each listener receives its own detached snapshot. Listener exceptions are host errors and propagate; they are not reported as file-validation failures. `importText(readText)` returns a promise resolving after processing or supersession and accepts a function returning text or a promise of text. Only the latest read may publish a preview/error. Starting a read clears an older preview and error immediately.

`cancel()` clears preview/error and invalidates pending reads without claiming to abort file I/O. `dispose()` silently clears state and subscribers, invalidates reads and makes later import/cancel/subscription commands inert. Create a new controller when mounting again; React development StrictMode setup/cleanup must not reuse a disposed instance. Unsubscribe is safe to repeat.

If a subscriber cancels or starts another import during notification, delivery of the superseded notification stops; the replacement transition delivers its own notifications. Empty or non-string read failures use `Unable to read preferences.` so hosts can show a meaningful error without converting arbitrary thrown objects to strings.

Hosts own loading/cancel controls, file-input clearing, accessible announcements, focus and rendering. Keep Apply mounted after application, and offer Cancel during reads as well as preview. Application and export remain host-owned; there is no controller apply, persistence or download method. The root API is unchanged; both modules are opt-in subpaths with no browser globals or style imports.

## Optional appearance

```js
import 'audhd-ui-framework/skins.css';
```

```html
<section data-audhd-ui class="ui-skin" data-skin="paperwhite" data-type="system">
  <p>Application-owned content</p>
  <button class="ui-action">Application-owned action</button>
</section>
```

Use the marker, skin and typography attributes on the same root. The optional `ui-skin` class on that root supplies visible keyboard-focus outlines to descendants. Semantic `--ui-*` tokens inherit within that region; typography supports system, expressive, serif and mono. Layout remains application-owned. Unmarked sibling regions are unaffected. Nesting an unmarked element inside a marked root still inherits its appearance; this is ordinary CSS inheritance, not an isolation boundary. Forced colors remain effective. No external font download or animation is introduced.

Apply attributes without replacing the application tree. Preserve drafts, pending work, selection and focus. Applications must independently verify keyboard operation, accessible names, actual contrast, zoom and assistive-technology behavior. These assets do not certify accessibility or suitability for any person.

## Compatibility and status

Existing repository preference imports and CLI remain compatibility entry points. Existing schema paths retain checked copies. The old skin stylesheet imports the canonical file; consumers must now explicitly mark the appearance root. Registry IDs, colors, schema versions and preference merge behavior are unchanged.

Only local candidate distribution is supported. Manual accessibility and controlled skill evidence are recorded by the source project's framework evidence report; participant research is deferred. Code/assets use [MIT](LICENSE-CODE); this README uses [CC BY 4.0](LICENSE). See [license scope](LICENSE_SCOPE.md).
