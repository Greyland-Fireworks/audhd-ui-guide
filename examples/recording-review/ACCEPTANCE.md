# Acceptance evidence

Verification for v1.01, recorded October 19, 2026 against the public sources before commit. Earlier exploratory passes are not used as evidence for changed files. The final checks include the skin-colored SVG help icons and screenshot gallery. No hosted deployment or model evaluation was performed during verification.

The shared specification is in [SPEC.md](SPEC.md); commands are in [README.md](README.md). Automated execution, visual inspection, actual browser zoom, screen-reader operation, model evaluation and participant research are separate evidence types. Unperformed checks remain Pending.

## Environment and execution

Local Windows execution used Node 22.22.2, npm 10.9.7, Python 3.13 and Playwright Test 1.64.1. The application versions remain React/React DOM 19.3.1, React Aria Components 1.22.1, Svelte 5.57.2 and Bits UI 2.19.5; Vite is 8.3.4. Library choices remain provisional.

| Check | Actual result and scope |
|---|---|
| `npm test` | Pass: 13 tests across independent React/Svelte state and route logic, profile validation, capabilities, merging, migration and CLI file protection. |
| `npm run build` | Pass: both production builds, including from a clean public-only source copy. React emits a nonblocking 500 kB chunk-size warning (about 503 kB minified / 153 kB gzip); production bundle optimization is not claimed. |
| `npm run check:palettes` | Pass: all 22 skins, 11 light/11 dark; specified text, control, focus and categorical-mark contrast, monotonic sequential ramps and preview coverage. |
| `npm run check:docs` | Pass: 20 public Markdown files, local links/anchors, 13 stable rule IDs, 34 authored evaluation cases and no source imports from private research. External primary-source references were inspected separately. |
| Skill format validation | Pass: required frontmatter and skill structure. This is editorial validation, not a model evaluation. |
| Clean distribution | Pass: public files alone install with `npm ci --ignore-scripts`, build both apps and pass all 13 unit tests. No research files, installed dependencies, personal paths or prior build output were copied in. |
| Dependency audit | The clean install reported zero known vulnerabilities at execution time; this is not a security guarantee. |

The [browser configuration](../../playwright.config.js) manages isolated servers on 4183–4185 with fresh contexts. It does not reuse or reset the development demonstrations on 4173/4174. Firefox's isolated test launch disables closing its window with the last tab: default teardown intermittently raised a session-restore protocol error after successful download assertions on Windows. Two repeated Firefox smoke runs passed with that setting. No application assertion is skipped or teardown error swallowed. This test-only setting does not change profile retention or the user's browser preferences.

### Browser coverage

**Final full run: Pass, 34/34 tests, no retries or skips.** There are 11 tests per implementation in Chromium, and three per implementation in each of Firefox and WebKit. Browser versions: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2. These are Playwright browser builds, not a claim to have tested every branded browser or device. The local JSON reporter output is `test-results/results.json`; screenshots and diagnostic traces remain ignored.

| Requirement / pattern | Acceptance checks and observed scope | Rules |
|---|---|---|
| Review continuity and truthful acknowledgment | [Workflow scenarios](../../tests/browser/scenarios/workflow.js), REF-01–11 and REF-16: edit, switch, exclude current item by filtering, leave/return, fail/retry, reverse delayed completions, newer edits during pending work, revert, fresh reload, no web storage and no upload requests. Both independent state engines additionally reject stale/duplicate settlements. | AUDHD-01, 03–07, 10, 13 |
| Connected context | [Full browser suite](../../tests/browser/full.spec.js) plus workflow assertions: identity-driven source/detail surfaces and titles, current-action wording/semantics, correctly named count/list, excluded-selection message and no misleading source highlight, right/down relationship layout and non-color current text. | AUDHD-01, 02, 04, 05, 08, 11 |
| Accurate navigation | [Navigation scenarios](../../tests/browser/scenarios/navigation.js): direct and invalid locations, browser history, manual local tabs, top/bottom ancestry, index, footer disclosure, bypass and hidden-view save recovery. The [smoke suite](../../tests/browser/smoke.spec.js) repeats core navigation across engines. | AUDHD-01, 03, 05, 10, 11 |
| Pointer and keyboard focus | [Focus scenarios](../../tests/browser/scenarios/heading-focus.js): deliberate heading focus with no pointer rectangle, explicit visible keyboard focus, including forced colors. Workflow tests cover surviving-target recovery; cross-engine smoke verifies pointer and keyboard navigation independently. | AUDHD-05, 11 |
| Useful help | [Help scenarios](../../tests/browser/scenarios/context-help.js): substantive topic descriptions, hover, pointer transfer into help, keyboard opening, Escape, accessible description, persistent click/keyboard/touch-emulated detail, enlarged narrow layout and save limitation access during pending work. Cross-engine smoke covers persistent caution help and focus recovery. | AUDHD-04, 06, 09, 11 |
| Appearance and typography | [Appearance scenarios](../../tests/browser/scenarios/appearance.js) plus full suite: all 22 skins and four styles; all 88 combinations at 320 CSS pixels with the Larger text preset; measured rendered preference-page text contrast and 44-pixel control targets; draft, pending snapshot, record, filter, local view and control focus preserved. System changes apply only in System mode. | AUDHD-02, 05, 10, 11 |
| Portable preferences | [Profile unit tests](../../preferences/tests/profile.test.js) and smoke suite: strict JSON/decoded duplicate rejection, malformed/missing/unknown/wrong-type/version failures, null/false/array/atomic appearance semantics, v1 conversion with source protection, local preview/cancel/apply, unsupported skin/size export and reimport, preference-only download, and session reset. | AUDHD-04, 06, 10, 12, 13 |
| Charts | [Palette check](../skins/check_palettes.py) and full suite: all palettes retain direct labels/data tables, explicit diverging zero center and visible/table missing-data equivalents. Category tokens meet 3:1 against the plot surface; sequential luminance is ordered. These assertions do not establish pairwise category discrimination or text contrast on ramp fills. | AUDHD-08, 11 |

REF-12–14 are partially covered by the stated viewport, enlargement, semantic and color checks; this is not a blanket pass for every device or assistive technology. REF-15's participant/assistive-technology evidence remains Pending.

## Visual inspection

Inspected the generated React review and tooltip screenshots, Svelte preference and persistent-help screenshots, and the narrow forced-color navigation capture. Source/detail treatment remains connected; titles, controls, explanatory text, current-action wording and repeated breadcrumbs remain readable in these captures. Help reflows without clipping the form, and keyboard focus remains visible. Diagnostic captures remain ignored. The curated [screenshot gallery](../GALLERY.md) includes refreshed light/dark examples and an annotated walkthrough; these are documentation illustrations, not participant evidence.

Viewport emulation, the application's Larger text preset and forced-color emulation do not substitute for actual browser zoom, operating-system high-contrast testing or assistive-technology operation. The appearance matrix checks layout and selected contrast/target assertions, not every interaction in all 88 combinations. No visual inspection is presented as participant feedback.

## Pending manual and product validation

- Actual browser zoom and assistive-technology operation, including screen-reader navigation/announcements.
- Representative participant understanding, preference suitability and enjoyment.
- Angular/Vue executable references; deep/multiple-category navigation; localization/RTL and permission-filtered indexes.
- Backend persistence, authentication/permissions, cross-session draft recovery and production configuration integration.
- Further model trials require a separate explicit request; the [current evaluation record](../../SKILL_EVALUATIONS.md#current-evidence) now distinguishes six supplied review responses from 29 Pending cases. These do not establish implementation success.
- The authored continuous-check workflow has not been executed on hosted CI; only local commands were run. Full browser scenarios outside Chromium, physical touch devices and alternative font availability remain unverified.

The examples use fictional recordings and in-memory save simulation. A successful simulated acknowledgment is not durable storage. Profile export saves preferences only. No clinical benefit or blanket accessibility conformance is claimed.
