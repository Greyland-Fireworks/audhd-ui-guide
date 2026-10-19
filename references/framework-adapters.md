# Framework adapters and application boundaries

[Guide](../GUIDE.md) · [Reference contract](../examples/recording-review/SPEC.md) · [Evidence](evidence-and-limits.md)

The neutral layer owns observable task continuity, meaningful relationships/help, truthful state, navigation scope, adaptable presentation and verification. An adapter can be direct application code; no universal wrapper library or form generator is required. Applications own domain facts, authorization, backend effects, concurrency and persistence. Fixtures own exact labels, routes, timing values and demonstration layout.

| Ownership layer | Owns | Does not establish |
|---|---|---|
| Framework-neutral specification | Observable behavior, semantics, continuity, adaptation and evidence requirements | A particular framework, component library or visual decoration |
| Framework adapter | Primitive composition, value/event bindings, rendering identity, post-render focus, portals and styling hooks | Domain permissions, persistence or the meaning of configuration keys |
| Application integration | Real tasks and entities, effective configuration, permissions, concurrency, persistence and backend effects | Suitability for every person merely because a library is accessible |
| Reference fixtures | Fictional records, canonical demo page definitions, layout, colors, simulator controls and recorded evidence | Production backend capability or universal AuDHD preferences |

The references share static records and page definitions, semantic CSS tokens, acceptance scenarios and stateless profile utilities. They independently implement review state, save transitions, routing, rendering identity, focus timing and preference application. Angular and Vue should meet the same observable contract when executable adapters are added.

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

The shared preference parser/validator/migrator is stateless. It does not own either app's review, focus, routing or presentation state. Profiles express requests; adapters report which values are applied, unavailable or constrained. Backend defaults, effective configuration, permission rules and save/apply/restart effects must come from the actual application rather than a UI library.
