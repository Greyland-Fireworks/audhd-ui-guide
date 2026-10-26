# audhd-ui-framework

Version 0.1.0-alpha.2 is an internal candidate, not a validated release. This optional package provides preference validation, application capability reports, an import/preview controller and appearance styles for existing applications. It neither requires nor supplies React, Svelte, routing, persistence, authorization, telemetry or a component library.

## Install a local candidate

Package installation remains optional. For new interfaces without an established design system, the Guide's [appearance policy](../../GUIDE.md#adaptable-appearance) defaults to reusing this package's canonical skin CSS/tokens and full palette registry; direct asset reuse is sufficient. Offer all registered skins, independent text styles and system appearance, initially using Guillermo unless explicit preferences or established product defaults apply. Document justified exceptions; do not treat package optionality as a reason to invent replacement themes.

With Node 22.12 or newer, run `npm pack --workspace audhd-ui-framework --pack-destination output` from the source repository (create output first). In a consumer, run `npm install /path/to/audhd-ui-framework-0.1.0-alpha.2.tgz`. No registry publication is configured. The repository's `npm run check:framework` creates and tests a tarball and writes its checksum.

```js
import { parseProfile, emptyProfile, resolveProfiles } from 'audhd-ui-framework';
const profile = parseProfile(fileText); // Validate before preview; does not apply it.
const merged = resolveProfiles(emptyProfile(), profile); // Merge requests; does not apply them.
```

The registry includes 24 skins (12 light and 12 dark), including `green-ledger-light` and `green-ledger-dark`. See the [skin preview and Green Ledger notes](../../examples/skins/README.md#green-ledger-pair) for appearance details and token-check limits.

## Public interface

For backend configuration dashboards, follow the bundled [configuration integration contract](CONFIGURATION.md): discover configuration sources, trace and account for every option in scope, justify coverage decisions, and verify the requested workflows against the host's actual behavior. Preserve necessary coverage evidence, reusing existing records where sufficient. Separate inventories, system maps and reference pages are warranted by user request or practical value, not required by default. Distinguish lifecycle status from runtime applicability and connect any interface references to controls through consistent names and usable navigation. Prioritize working, understandable tasks over artifact volume. This is an application integration requirement; the preference APIs below do not analyze repositories or manage arbitrary backend configuration.

| Export | Contract |
|---|---|
| `parseProfile(text)` | Strict JSON parsing, decoded duplicate-key rejection and schema validation; returns the parsed profile or throws. |
| `validateProfile(profile)` | Validates supported v1/v2 data; returns the input or throws. At file boundaries use parseProfile so duplicate keys are not lost. |
| `migrateProfile(profile)` | Validates and returns a separate v2 copy; does not write a file. |
| `emptyProfile(scope = 'project')` | Creates a v2 profile with null choices. |
| `resolveProfiles(...profiles)` | Later profiles take precedence. Null inherits an earlier value; false is an explicit choice. Arrays and appearance objects replace earlier values as a whole. Inputs are not changed. |
| `audhd-ui-framework/v1.schema.json`, `audhd-ui-framework/v2.schema.json` | Existing JSON Schema contracts; no new preference version. |
| `audhd-ui-framework/palettes` | JSON palette registry; use JSON import attributes in Node. |
| `audhd-ui-framework/skins.css` | Optional styles; never imported by the JavaScript API. |

The application supplies its capability declaration and decides how to apply preferences, follow system settings, protect data and retain choices. Valid data is not proof that an application supports a requested choice. Preserve unsupported intent for export while reporting what actually applied. No automatic file discovery, storage or network access occurs.

## Requested, supported and applied

- **Requested:** the value in a profile, including values this application cannot use.
- **Supported:** the application declares that it can handle the value. This declaration must be checked against its behavior.
- **Applied:** the application has actually used the value. Only the application can confirm this.

Parsing, merging and previewing do not apply preferences. Keep unsupported requested values in exports; report separately what the application used.

## Application capabilities

Import `validateCapabilities` and `inspectCapabilities` from `audhd-ui-framework/capabilities`. Declarations are plain objects keyed by existing v2 preference paths. Each entry is `true` (all schema-valid non-null values) or a list of complete supported values. An empty list supports no explicit value; omitted fields are unsupported. Unknown paths, malformed entries, invalid values and null list entries throw. Validation returns the input declaration unchanged.

Use plain JSON-compatible objects and arrays, without circular references or missing array elements. Accessors, hidden or symbol properties and custom-prototype objects are rejected before their property values are read. Validation does not invoke declaration getters.

```js
import { inspectCapabilities } from 'audhd-ui-framework/capabilities';
const capabilities = {
  'display.text_style': true,
  'display.text_scale': [1, 1.25],
  'display.appearance': [{ mode: 'system' }, { mode: 'skin', id: 'paperwhite' }],
};
const report = inspectCapabilities(profile, capabilities);
```

Inspection validates the supplied profile and returns a separate v2 copy as `profile`. `rows` contain every preference field in schema order: `{ path, value, declared, status }`. `declared` is true when the declaration contains that path, even if its supported-value list is empty. Each `value` keeps its original data type and is copied so callers cannot change the input through a report. Status is `unspecified`, `supported` or `unsupported`. Null is always unspecified, including declared fields. Objects and arrays must match a listed choice in full. Object key order does not matter; array order does. An unknown named skin can be valid data while unsupported by a particular application.

Declarations describe the host's promised support, not verified application. Hosts own defaults, explanations, formatting and effective values. A supported preview never means the preference has already applied. Test declarations against actual host behavior.

## Import and preview workflow

```js
import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
const workflow = createImportWorkflow({ capabilities });
renderPreview(workflow.getSnapshot()); // subscribe does not send initial state.
const unsubscribe = workflow.subscribe(snapshot => renderPreview(snapshot));

// In the host's file-selection handler:
await workflow.importText(() => selectedFile.text());

// Call only after the user activates Apply:
function applyReadyPreview() {
  const snapshot = workflow.getSnapshot();
  if (snapshot.state !== 'ready') return;
  applyInThisApplication(snapshot.preview.profile);
  // Announce the actual result, including unsupported or overridden choices.
}
// In the host's Cancel handler: workflow.cancel(); then restore focus.
// On host teardown: unsubscribe(); workflow.dispose();
```

Snapshots are separate copies with the shape `{ state, preview, error }`. State is `idle`, `reading`, `ready`, `error` or `cancelled`; preview/error are null unless applicable. A ready preview contains `{ profile, rows, sourceVersion }`. Capabilities are validated and copied once at creation. Changing the original declaration does not change the controller.

`subscribe(listener)` receives synchronous state changes, not an initial notification; use `getSnapshot()` for initial rendering. Each listener receives its own snapshot copy. Listener exceptions are host errors and propagate; they are not reported as file-validation failures. `importText(readText)` accepts a function that returns text or a promise of text. Its promise settles after that read settles and its result is processed or ignored. Cancelling or replacing an import does not make an unfinished read settle early. Only the latest read may publish a preview/error. Starting a read clears an older preview and error immediately.

`cancel()` clears preview/error and invalidates pending reads without stopping the underlying file read. `dispose()` silently clears state and subscribers, invalidates reads and prevents later imports, cancellation or valid subscriptions from restarting it. Passing a non-function to `subscribe` still throws. Create a new controller when mounting again; React development StrictMode setup/cleanup must not reuse a disposed instance. Unsubscribe is safe to repeat.

If a subscriber cancels or starts another import during notification, delivery of the superseded notification stops; the replacement transition delivers its own notifications. Thrown errors with an empty message, or thrown values that are not strings or Error objects, use `Unable to read preferences.` so hosts can show a meaningful error without converting arbitrary thrown objects to strings.

Hosts own loading/cancel controls, file-input clearing, accessible announcements, focus and rendering. Keep Apply mounted after application, and offer Cancel during reads as well as preview. Application and export remain host-owned; there is no controller apply, persistence or download method. The five root exports are unchanged. Import the capability and workflow modules explicitly through their subpaths; neither accesses browser globals or imports styles.

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

Use the marker, skin and typography attributes on the same root. The optional `ui-skin` class on that root supplies visible keyboard-focus outlines to descendants. The `--ui-*` CSS custom properties inherit within that region; typography supports system, expressive, serif and mono. Layout remains application-owned. Unmarked sibling regions are unaffected. Nesting an unmarked element inside a marked root still inherits its appearance; this is ordinary CSS inheritance, not an isolation boundary. Forced colors remain effective. No external font download or animation is introduced.

For a theme-matching application default, set `data-type="expressive"`: the current skins use their heading font with system body text. Put that choice first in a typography picker, with a clearly labeled System alternative. Preserve explicitly requested `system`, `serif` or `mono` values when changing skins. The package does not choose an application default or replace null profile fields with `expressive`; the application makes that decision when applying an unspecified request.

Apply attributes without replacing the application tree. Preserve drafts, pending work, selection and focus. Applications must independently verify keyboard operation, accessible names, actual contrast, zoom and assistive-technology behavior. These assets do not certify accessibility or suitability for any person.

## Compatibility and status

Existing repository preference imports and CLI remain compatibility entry points. Existing schema paths retain checked copies. The old skin stylesheet imports the canonical file; consumers must now explicitly mark the appearance root. Registry IDs, colors, schema versions and preference merge behavior are unchanged.

Only local candidate distribution is supported. Manual accessibility and controlled skill evidence are recorded by the source project's framework evidence report; participant research is deferred. Code/assets use [MIT](LICENSE-CODE); this README uses [CC BY 4.0](LICENSE). See [license scope](LICENSE_SCOPE.md).
