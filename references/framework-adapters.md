# Framework adapters and application boundaries

[Guide](../GUIDE.md) · [Reference contract](../examples/recording-review/SPEC.md) · [Evidence](evidence-and-limits.md)

The Guide defines the required outcomes: preserve unfinished work, explain relationships and actions, report state honestly and keep the interface operable. The framework package supplies only the documented preference utilities, import/preview controller and optional appearance assets; it does not implement every Guide rule. An adapter is the application code that connects these pieces to a UI framework. The application still controls permissions, saves, navigation, focus and actual preference application. The demos supply fictional records and examples of these decisions.

| Ownership layer | Owns | Does not establish |
|---|---|---|
| Framework-neutral specification | Observable behavior, semantics, continuity, adaptation and evidence requirements | A particular framework, component library or visual decoration |
| Framework adapter | Connect UI controls to state and events, preserve component identity, manage focus after rendering and style overlays | Domain permissions, persistence or the meaning of configuration keys |
| Application integration | Real tasks and entities, effective configuration, permissions, concurrency, persistence and backend effects | Suitability for every person merely because a library is accessible |
| Reference fixtures | Fictional records, canonical demo page definitions, layout, colors, simulator controls and recorded evidence | Production backend capability or universal AuDHD preferences |

The references share fictional records, page definitions, CSS variables, acceptance scenarios and a capability declaration. Both use the framework’s preference utilities and import/preview controller; each mounted importer creates its own controller. They independently implement review state, save transitions, routing, rendering identity, focus timing and preference application. Angular and Vue should meet the same observable contract when executable adapters are added.

Configuration dashboards must also follow the [configuration integration contract](../packages/audhd-ui-framework/CONFIGURATION.md). Application integration owns source-backed coverage evidence and each in-scope option's editable, read-only, justifiably excluded or unresolved disposition. Separate inventories and maps depend on user request or practical value; complete coverage checks do not. Preserve requested capability and connect any interface references to usable controls through consistent names, appropriate search and navigation. Adapters carry established semantics into working controls and explanations; neither a preference capability declaration nor documentation substitutes for functional support.

| Concern | React reference | Svelte 5 reference | Angular mapping (not implemented) | Vue mapping (not implemented) |
|---|---|---|---|---|
| Review and presentation state | Separate root React state; immutable updates | Separate root rune state; local mutations/derived values | Component/service state or signals, stable entity IDs | Component/composable state with refs/reactivity, stable entity IDs |
| Disclosure/local tabs/help | Provisional React Aria primitives with controlled state | Provisional Bits UI primitives with controlled state | Investigate Angular Aria; use CDK utilities selectively and preserve suitable existing Material/native controls | Investigate Reka UI; retain native controls and compare Ark UI where useful |
| Navigation | Independent hash parser and history handlers | Independent parser and history handlers | Bind actual router destinations and active states | Bind actual router destinations and active states |
| Focus after rendering | Explicit action requests plus refs/layout effect | Explicit action plus `tick()` and surviving-target check | Post-render target references; verify cancellation/stale requests | Post-render refs/`nextTick`; verify cancellation/stale requests |
| Skin and typography | Root attributes, system media listener, independent profile application | Root attributes, media listener, independent profile application | Map neutral tokens and lifecycle cleanup; don't recreate forms on theme changes | Map tokens and lifecycle cleanup; preserve keyed content identity |
| Portals and semantics | Tooltip text inherits global appearance; explicit descriptions | Bits tooltip role supplied explicitly for the pinned implementation | Verify overlay theme scope, names and focus restoration | Verify teleport theme scope, names and focus restoration |

For every chosen primitive, verify actual value/event shapes, controlled-state ownership, accessible associations, hidden-panel exposure, focus behavior and version-specific gaps. Matching component names are not evidence of equivalent behavior. Follow the [React Aria documentation](https://react-aria.adobe.com/), [Bits UI documentation](https://bits-ui.com/docs/introduction), [Angular Aria overview](https://angular.dev/guide/aria/overview) and [Reka UI documentation](https://reka-ui.com/). These are integration candidates, not blanket endorsements or proof of accessibility.

[Ark UI](https://ark-ui.com/) remains a cross-framework comparator; [Radix](https://www.radix-ui.com/primitives/docs/overview/introduction) remains a React alternative. Choose based on the actual required workflow and existing stack. No framework migration follows merely from invoking this Skill. Angular and Vue are documentation targets with executable verification Pending.

The preference parser, validator and migration utilities keep no application state. The optional import controller owns only read/preview/error state and ignores results from superseded reads. Applications own file selection, focus restoration, application, export and controller cleanup. Neither module owns review data, routing or the effective presentation. Profiles express requests; adapters report which values are applied, unavailable or constrained. Backend defaults, effective configuration, permission rules and save/apply/restart effects must come from the actual application rather than a UI library.
