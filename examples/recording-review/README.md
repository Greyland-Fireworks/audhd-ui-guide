# Recording review references

[Specification](SPEC.md) · [Acceptance evidence](ACCEPTANCE.md) · [Adapter boundaries](../../references/framework-adapters.md) · [Guide](../../GUIDE.md)

Two independently implemented interfaces review three fictional recordings. React uses React Aria provisionally; Svelte 5 uses Bits UI provisionally. Both support canonical navigation, contextual help, 45 skins, four text styles and explicit preference import/export. Reviews and preferences are session-only; simulated save acknowledgment is not a server or file save. Export downloads preferences only.

From the repository root, with Node 22.12+ and npm:

```sh
npm ci
npm run dev:react
```

Run `npm run dev:svelte` in another terminal. The default development addresses are `http://127.0.0.1:4173/` and `http://127.0.0.1:4174/`. If those ports already host another copy, stop that copy deliberately or pass a different port: `npm run dev --workspace recording-review-react-reference -- --port 4193`. No hosted demo is implied.

```sh
npm run build
npm test
npm run check:palettes
npm run check:docs
npx playwright install chromium firefox webkit
npm run test:browser
```

Browser checks use isolated ports 4183–4185 and fresh contexts, never the user's development tabs. Python 3 runs the palette check. Test results, traces and screenshots are local ignored output. No backend, login, telemetry, automatic profile storage or external fonts are included.

Shared files contain fictional data, page records, color mappings, choice descriptions and the recording-demo capability declaration. Both demos use the framework’s capability inspector and import/preview controller. Each framework still owns review state, simulated save completion, navigation, focus and preference application. Do not key/remount the workspace by appearance. Current dependency versions are pinned in the root lockfile; library choice remains provisional despite runnable examples.

A new demo session starts with Guillermo and Skin headings text. The choice labeled Default follows the device’s light/dark setting. Imported light/dark preferences map to Paperwhite/Guillermo; the picker shows each named skin only once. These are demonstration choices. See [profile boundaries](../../PREFERENCES.md#reference-application-boundaries) for supported values and unapplied requests. Full Angular/Vue apps, multiple-category index paths, cross-highlighting and automatic persistence remain deferred.

## Entry and status links

An empty address opens Workspace. Failed saves, pending saves and unsaved reviews appear before the complete destination index. Each row links to its named review, restoring task focus without clearing filters or drafts. Pending saves capture a snapshot; newer edits can remain unsaved even after that snapshot succeeds. These summaries use each adapter’s existing state independently. Explicit recording links still open that recording directly.

## Settings and simulated saves

Appearance choices start collapsed. Select **Show appearance choices** to open the previews; the summary keeps the current skin name, color bands and heading-font sample visible. Selecting a card applies it immediately for this session. **Hide appearance choices** closes the collection without changing the selection.

Text style, Text size, Spacing and Detailed help have separate groups. Detailed help currently opens or closes only “About these timings” on recording pages; it does not expand every info button. Spacing changes card padding and layout gaps, not line height. **Skin headings** uses the skin’s heading font; available local fonts determine the actual rendering. Importing a profile is different from choosing a card: import creates a preview, and **Apply for this session** applies it. **Portable preferences** contains import/export; exports contain preferences only.

**Save review** deliberately stays pending until you open **Demo save controls** and simulate completion or failure. Waiting does not finish it. This lets you test newer edits and navigation while a save is pending; completion still stores the result only in the open page. Reloading resets the demo.

See the [current validation summary](../../references/framework-evidence.md) and [manual checklist](../../references/manual-accessibility-checklist.md). Automated browser checks do not close the native accessibility gates.

## Intent comments and source owners

Source comments identify the relevant `AUDHD-xx` rule and relative Guide anchor, the behavior being protected, and the failure a change could introduce. Shared files own shared rationale; adapter comments explain their independent state, lifecycle and markup wiring. These are implementation explanations, not evidence of accessibility conformance. The following map locates the existing checks; their execution history remains in [Acceptance evidence](ACCEPTANCE.md) and the [current validation summary](../../references/framework-evidence.md).

| Behavior and invariant | Source owner | Existing checks |
|---|---|---|
| Location, ancestry and complete browse routes ([AUDHD-01](../../GUIDE.md#audhd-01-keep-scope-and-location-visible), [AUDHD-03](../../GUIDE.md#audhd-03-offer-manageable-detail-without-hiding-choices)): filtering can exclude a card without silently choosing another recording; local tabs do not become invented parent pages. | Shared facts in [navigation.js](shared/navigation.js); independent [React routes](react/src/navigation.js) and [Svelte routes](svelte/src/navigation.js); rendered navigation and status links in each App. | Each adapter's model/route tests below; [navigation scenarios](../../tests/browser/scenarios/navigation.js); [overview checks](../../tests/browser/overview.spec.js). |
| Drafts, save snapshots and retry ([AUDHD-06](../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable), [AUDHD-07](../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status)): a completion belongs to its recording and attempt; newer draft text cannot be reported as saved by an earlier snapshot. | Independent [React review-state.js](react/src/review-state.js) and [Svelte review-workspace.js](svelte/src/review-workspace.js). Each App owns the workspace above conditional views and derives its own overview summaries. | [React model tests](react/tests/review-state.test.js); [Svelte model tests](svelte/tests/review-workspace.test.js); [workflow scenarios](../../tests/browser/scenarios/workflow.js); [overview checks](../../tests/browser/overview.spec.js). |
| Deliberate focus and interruption continuity ([AUDHD-05](../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability), [AUDHD-10](../../GUIDE.md#audhd-10-support-interruptions-and-working-preferences)): explicit navigation moves focus after rendering; appearance updates and late save results do not act as navigation. | [React App.jsx](react/src/App.jsx) and [Svelte App.svelte](svelte/src/App.svelte), including each adapter's recovery when a focused simulation control disappears. | [Heading-focus scenarios](../../tests/browser/scenarios/heading-focus.js); [workflow scenarios](../../tests/browser/scenarios/workflow.js); [cross-engine smoke checks](../../tests/browser/smoke.spec.js). |
| Local explanations ([AUDHD-09](../../GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision)): tooltip help also opens inline for sustained reading; essential save limits remain visible without opening help. | Shared wording and fixture limits in [fixtures.js](shared/fixtures.js); independent [React ContextHelp](react/src/ContextHelp.jsx) and [Svelte ContextHelp](svelte/src/ContextHelp.svelte) own their library bindings and expanded state. | [Context-help scenarios](../../tests/browser/scenarios/context-help.js); [cross-engine smoke checks](../../tests/browser/smoke.spec.js). |
| Grouping, responsive relationships and focus versus selection ([AUDHD-02](../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings), [AUDHD-08](../../GUIDE.md#audhd-08-use-visuals-to-support-decisions), [AUDHD-11](../../GUIDE.md#audhd-11-keep-controls-readable-and-operable)): source and detail retain their reading order; current-record treatment and keyboard focus remain distinct; compact spacing does not reduce the control-height minimum. | Shared semantic roles in [tokens.css](shared/tokens.css); adapter layouts in [React styles.css](react/src/styles.css) and [Svelte styles.css](svelte/src/styles.css). App markup supplies the non-color identity and relationship cues. | [Full browser suite](../../tests/browser/full.spec.js): source/detail relationships, reflow, forced colors and selected measurements; [heading-focus scenarios](../../tests/browser/scenarios/heading-focus.js). |
| Appearance samples and independent choices ([AUDHD-08](../../GUIDE.md#audhd-08-use-visuals-to-support-decisions), [AUDHD-10](../../GUIDE.md#audhd-10-support-interruptions-and-working-preferences)): samples illustrate an option; the native radio conveys selection, and App applies appearance without remounting work. | Registry-derived [visual-choices.js](shared/visual-choices.js) and shared [visual-choices.css](shared/visual-choices.css) own choice vocabulary and presentation; [React VisualChoices](react/src/VisualChoices.jsx) and [Svelte VisualChoices](svelte/src/VisualChoices.svelte) bind native controls. | [Appearance scenarios](../../tests/browser/scenarios/appearance.js); [full browser suite](../../tests/browser/full.spec.js); radio-state and profile checks in [smoke.spec.js](../../tests/browser/smoke.spec.js). |
| Preference preview, cancellation and export ([AUDHD-04](../../GUIDE.md#audhd-04-explain-effective-behavior), [AUDHD-06](../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable)): valid but unsupported requests remain identified and exportable; reading a file never applies it. | Shared [profile-capabilities.js](shared/profile-capabilities.js) declares actual demo support. The framework's [import-workflow.js](../../packages/audhd-ui-framework/import-workflow.js) owns preview/read-race handling; [React ProfileControls](react/src/ProfileControls.jsx) and [Svelte ProfileControls](svelte/src/ProfileControls.svelte) own subscription cleanup, local focus and preference-only downloads. | [Import-workflow tests](../../tests/framework/workflow.test.js); [profile tests](../../preferences/tests/profile.test.js); preview/cancel/race/export scenarios in [smoke.spec.js](../../tests/browser/smoke.spec.js). |

For a focused source/comment change, the existing adapter checks can be run independently from the repository root:

```sh
node --test examples/recording-review/react/tests/*.test.js examples/recording-review/svelte/tests/*.test.js
npm run build --workspace recording-review-react-reference
npm run build --workspace recording-review-svelte-reference
```

Use the browser checks above when interaction or rendering changes. Review saves are explicit in-memory simulations: the retry path covers a known simulated failure, not production reconciliation after a lost server response. Profile reads are local; a download request does not prove a file was stored. Screen-reader operation, actual browser zoom, participant comprehension, RTL/localization and production persistence remain separate pending validation; comments and automated assertions do not establish those outcomes.
