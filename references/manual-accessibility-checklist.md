# Manual accessibility checks for alpha.2

Use this checklist independently for React, Svelte and the isolated native-controls consumer. Record observations rather than inferring a pass from automated tests. Do not use real personal preferences or review content.

## Preparation and evidence

1. Use the current working tree, including uncommitted and untracked framework files. A fresh clone of the baseline revision does not contain this candidate. On another computer, transfer the source changes through your normal development workflow; install dependencies there instead of copying `node_modules`.
2. Record the operating system/build, browser/version, assistive technology/version, display resolution/scaling, initial zoom and accessibility settings. Record the revision plus local changes or a source snapshot identifier.
3. From the repository root, with Node 22.12 or newer, run `npm ci` if needed. In separate terminals run `npm run dev:react` and `npm run dev:svelte`. Open React at `http://127.0.0.1:4173/` and Svelte at `http://127.0.0.1:4174/`.
4. Prepare three test files outside tracked source: a copy of [the example profile](../preferences.example.json), a second copy changing only `display.appearance.id` to `unknown-skin` and `display.text_scale` to `1.125`, and a file containing only `{` for malformed JSON. Keep the original files unchanged. Have their absolute paths ready for the native file picker.
5. For each scenario below, record **Pass**, **Fail**, **Pending**, or **Not applicable**, with a reason, exact steps, expected/actual behavior and a screenshot or spoken-announcement transcript where useful. Record both demos separately. An unavailable environment is Pending, not Not applicable.

## Keyboard, import and work continuity

Appearance starts collapsed. Use the Show appearance choices summary with Enter or Space; confirm it changes to Hide appearance choices, shows the current skin and retains its color/font preview. Closing the bank must preserve the applied choice and leave focus on the summary. The Display options info button immediately follows its heading; open, read and dismiss it using the keyboard.

The revised display settings use single-choice visual cards for Appearance, Text style, Text size and Spacing. Test each group separately: Tab enters at the selected radio, arrow keys change the choice, and Tab leaves the group. Confirm exactly one card says ACTIVE, other cards say Inactive, and the focus outline is distinguishable from selection. With a screen reader, verify the option name, description and checked state rather than expecting the decorative footer to be read twice. Compare the previews with the applied result. Native results from the earlier dropdown layout do not establish a pass for these cards.

1. Reset browser zoom to 100%. Open `/#recordings/REC-002/review` in the demo. Starting with keyboard focus in browser chrome, reach the page using normal browser keyboard commands. Use Tab/Shift+Tab, Enter/Space and arrow keys as appropriate; avoid pointer input for this sequence. Confirm visible focus, understandable names and logical ordering. Record any pointer assistance rather than counting the run as wholly keyboard-only.
2. Reach **Review note**, enter `Earlier snapshot`, and activate **Save review**. Replace the note with `Newer unsaved draft`. Do not complete the save yet. Set the recording search filter to `Market`, switch to **Recording details**, and navigate to **Workspace preferences** using the page navigation.
3. Activate **Import preferences** and select the example profile. Confirm that a preview appears, supported and unsupported choices are distinguished, and nothing applies before **Apply for this session**. Unsupported choices must remain available for export. A fast file may not expose the reading state long enough for manual assessment; record that as not observed, with automated coverage listed separately.
4. Reach Apply by keyboard and activate it. Confirm visible focus remains on Apply, the current route stays on preferences, text size becomes Larger, and detailed help becomes Expanded. Verify the controls remain usable after the appearance change.
5. Activate **Cancel import**. Confirm the preview disappears, focus returns to Import, and the already-applied session choices remain unchanged. Import the unsupported-choice file; confirm its unknown skin and scale are reported as not applied. Apply it and confirm the previous effective skin and text size remain intact.
6. Activate **Export preferences**. Confirm the download completes. Inspect the downloaded JSON: the unsupported requested skin and scale must remain, while `Newer unsaved draft`, recording data and navigation history must be absent. Import that downloaded file again and verify the same requested values are shown.
7. Import the malformed file. Confirm an understandable error, no actionable stale preview, and no effective preference change. Import a valid file again to verify recovery. Also open the picker and cancel it without selecting a file; confirm current preferences and work remain intact.
8. Navigate back to Recordings. Confirm REC-002, the Market filter and Recording details view survived. Open Review and verify `Newer unsaved draft` and the message indicating an earlier save with newer unsaved changes. In **Demo save controls**, complete the pending save and verify the newer draft remains unsaved. Then save and complete the newer draft. Repeat with **Fail save** to check error and retry behavior.

**Pass boundary:** Only mark the entire sequence passed if every applicable step was observed. Record export contents separately from merely requesting or completing a download. For deliberate overlapping file reads and cancellation during a held read, retain automated results; do not claim manual coverage from ordinary fast imports.

## Actual zoom and reflow

1. Repeat the import/preview/apply/cancel portion at actual browser zoom of **200%**, then **400%**, using the browser's zoom controls. Capture the displayed zoom percentage. A narrow viewport or device-emulation setting is a different test.
2. At each zoom, examine the top, middle and bottom of the preferences page and preview, including error/status text and the recording review form. Check wrapping, clipping, overlapping labels, visible focus, operable buttons and whether ordinary task content requires horizontal scrolling. Use keyboard navigation to reach offscreen controls.
3. Apply preferences while the draft remains unsaved. Confirm it survives and focus remains visible. Record the viewport/display dimensions; passing at one display size is not universal reflow proof.
4. Restore the original zoom after testing. Record failures with the exact control and zoom rather than marking the whole page generically inaccessible.

## Screen reader

1. On Windows, run the required **NVDA with Firefox** sequence in both demos. Record actual speech for headings, navigation, the file input, preview choices, Apply/Cancel/Export, errors and status changes.
2. Confirm labels and descriptions make sense without sight, focus order is understandable, the distinction between requested and applied choices is comprehensible, and errors/recovery are announced without repeated or misleading success messages.
3. Repeat the pending-save/newer-draft sequence. Confirm the speech distinguishes the earlier saved snapshot from newer unsaved work, including failure and retry.
4. On the Mac Mini, VoiceOver with the browser you select can provide an additional result. Record it under its own environment. It does **not** satisfy the NVDA/Firefox requirement or Windows system checks. Enable the keyboard-navigation settings needed for your browser and record them.

## System accessibility settings

1. Record the current OS settings before changing them. On Windows, enable a system contrast theme/high-contrast mode through Windows accessibility settings. Check both demos for readable labels, distinguishable controls, focus, selection, status and errors. A browser's forced-colors emulation is separate evidence.
2. Enable the OS reduced-motion setting and repeat navigation, import and application. Check for unexpected animation or motion and continued availability of feedback. The profile's `sensory.reduce_motion` choice remains unsupported by the demos; importing that field alone does not prove system-setting behavior.
3. On macOS, record reduced-motion and contrast-related checks as macOS results; do not relabel them as Windows high-contrast coverage.
4. Restore your previous OS settings after the checks.

## Isolated native-controls consumer

1. Use the independently installed fixture created by a successful `npm run check:framework`. Its directory is recorded in `output/framework/consumer-location.txt`. In a separate terminal, change to that directory and run `npm exec -- vite preview --host 127.0.0.1 --port 4192 --strictPort`. Open `http://127.0.0.1:4192/`. This uses the packed package, not workspace imports. If the temporary directory has been removed, regenerate it with the framework check first.
2. Begin with keyboard focus in browser chrome, enter the page without pointer assistance and type `Keep this unsaved note` in **Unsaved note**. Exercise Import, preview, Apply, Cancel and Export with the same three files described above. Confirm nothing applies before Apply, Apply retains focus, Cancel returns focus to Import, and malformed imports remove the actionable preview while allowing recovery.
3. The fixture declares only named skins and text styles. Its preview must report the example's text scale and other unsupported fields accordingly. Apply the unsupported-choice file and confirm the existing effective appearance and draft remain intact. Verify exports retain unsupported intent and exclude the unsaved note.
4. Check that the neighboring unmarked region stays unstyled after applying appearance. Repeat the control sequence at actual 200%/400% browser zoom, with NVDA/Firefox, and with Windows system high contrast and reduced motion. Record the same environment and evidence details used for the demos. Earlier partial consumer observations do not establish a complete pass.
5. Do not apply the demos' pending-save, recording selection, filter or local-view requirements to this fixture: it has none of those features. Record them as Not applicable with that reason. Restore browser and OS settings and stop this fixture's server with Ctrl+C afterward.

| Isolated-consumer scenario | Status | Environment, observations and evidence |
|---|---|---|
| Keyboard-only entry, import, preview, apply, cancel and export | Pending | |
| Unsupported intent, malformed import and recovery | Pending | |
| Draft retention and unmarked-region isolation | Pending | |
| Actual 200% zoom and reflow | Pending | |
| Actual 400% zoom and reflow | Pending | |
| NVDA / Firefox | Pending | |
| Windows system high contrast | Pending | |
| OS reduced motion | Pending | |

## Results and cleanup

| Scenario | React | Svelte | Environment, observations and evidence |
|---|---|---|---|
| Keyboard-only entry and full control sequence | Pending | Pending | |
| Preview versus application; unsupported choices | Pending | Pending | |
| Cancel, malformed import and recovery | Pending | Pending | |
| Export completion and contents | Pending | Pending | |
| Draft, pending snapshot, filter, identity and view | Pending | Pending | |
| Actual 200% zoom and reflow | Pending | Pending | |
| Actual 400% zoom and reflow | Pending | Pending | |
| NVDA / Firefox | Pending | Pending | |
| Windows system high contrast | Pending | Pending | |
| OS reduced motion | Pending | Pending | |
| Additional Mac / VoiceOver coverage | Pending | Pending | |

Close only the temporary localhost test tabs, restore zoom/settings, and press Ctrl+C in each demo terminal. Preserve the observation record. Share failures and environment details before updating the [evidence report](framework-evidence.md); never replace a Pending entry solely because the automated suite passed.
