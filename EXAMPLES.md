# Worked interface examples

**Version:** v1.01. These fictional examples illustrate the [guide](GUIDE.md); they are not tested product findings or additional rules. They support accessible selectable appearance; exact colors and layouts are techniques, not universal requirements. Adapt the wording to verified product behavior.

Use the guide's [UI and UX definitions](GUIDE.md#ui-and-ux-in-this-project). The examples identify both aspects: UI covers presentation, semantics and control operation; UX covers task understanding, effort, predictability, recovery and return. These aspects overlap, but require distinct evidence. The checks below are proposals, not performed tests. Identify the implementation layer separately; a UI label change does not establish correct persistence or recovery.

## Find an example

| I need help with… | Open this example |
|---|---|
| Naming a setting, explaining scope and saving safely | [Settings form](#settings-form-understand-before-changing) |
| Organizing tabs, accordion sections and hidden errors | [Settings workspace](#settings-workspace-tabs-and-accordion-sections) |
| Prioritizing metrics, alerts, tasks and supporting information | [Dashboard](#dashboard-from-summary-to-action) |
| Distinguishing execution, verified output and stale results | [Monitoring screen](#monitoring-screen-status-is-not-a-promise) |
| Identifying saved versions and explaining replacement | [Saved-item library](#saved-item-library-names-need-meaning) |
| Offering optional questions without assuming needs or storage consent | [Preference intake](#preference-intake-answer-only-what-matters) |
| Updating profiles, inheritance, invalid data and private storage | [JSON profiles](#json-profiles-preserve-choices-and-privacy) |
| Combining color with other cues and honoring system accessibility overrides | [Group cues](#group-cues-and-accessibility-overrides) |
| Writing errors with consequences and recovery | [Error messages](#error-messages-with-useful-consequences) |
| Choosing visible context, help or extended reference | [Explanation depth](#put-explanations-at-the-right-depth) |
| Checking whether an improvement adds unnecessary work | [Overcorrections](#when-guidance-becomes-an-obstacle) |

### How to use these examples

Choose the example closest to the task. Read its UI and UX concerns, then follow the proposed interaction and applicable checks. Use the guide for requirements and the preference documentation for profile rules; these illustrations do not add product capabilities or establish test results.

The first five examples follow interface workflows. The next three cover individual personalization. The final three provide reusable wording and tradeoff patterns.

## Settings form: understand before changing

**UI concerns:** Specific action labels, visible scope and save state, connected field labels and accessible contextual help. **UX concerns:** Predicting which reports are affected, trusting saved status, recovering a failed save and understanding retained work on return.

**Before:** A page titled “Configuration” offers a destination field, an “Apply” button and help reading “Sets output_dir.” It does not say what is saved or when the setting applies.

**After — visible context:**

> **Where new reports are saved**
>
> Editing: Monthly sales reports · This account only
>
> New reports will be saved in: Reports / Monthly
>
> Changes are not saved yet. Existing reports will stay where they are.
>
> **Save report location** · **Discard unsaved changes**

**Contextual help beside the location field:** “Choose where future reports are saved. Use a folder you can find again and have permission to write to. Changing this location does not move reports you already created.” If selecting a folder has prerequisites, explain them beside the unavailable action.

**Failure and recovery:** “The location could not be saved. Your entered folder is still shown. Check folder access, then select Retry save.” Never claim success before the save is acknowledged. Discard means returning to the last saved value, not deleting reports.

**Return:** “Last saved location: Reports / Monthly. You have an unsaved change to Reports / Quarterly.” Show this only if the draft was actually retained. An optional user note can explain why Quarterly was chosen; do not infer the reason from the folder name.

**UI checks:** Inspect field labels and state text; operate help, Save and Discard with supported inputs and confirm focus remains usable. **UX checks:** Ask someone to predict the effect, then follow save, access failure, return and discard. Verify that existing reports are untouched and the acknowledged saved version matches the displayed state. Relevant rules: AUDHD-01, 04, 05, 06, 09, 10, 11.

## Settings workspace: tabs and accordion sections

**UI concerns:** Distinct parent tabs and sub-tabs, named accordion controls, readable selected/expanded states and an accessible route to hidden errors. **UX concerns:** Finding related settings in digestible groups, preserving edits when moving between them, knowing what Save includes and resolving a blocker without reconstructing the workspace.

**Before:** A project workspace has two identical tab rows. Switching the upper row resets edits below it. The Delivery settings contain a single-open accordion that forces users to alternate between scheduling and retries. “Save” remains disabled because an invalid address is in a hidden Access panel; no explanation is visible.

**After — proposed organization:**

- Keep “Project: Monthly reports” and workspace navigation visible. Parent tabs are Overview, Tools and Settings; Settings owns clearly subordinate Delivery and Access sub-tabs. Preserve the selected sub-tab for each parent where appropriate.
- Delivery contains named “Schedule” and “Retry rules” accordion sections. Both can stay open to inspect their relationship. Keep the current delivery summary visible without requiring every section to be opened. Use plain sections if routine comparison makes collapsing them more work.
- A shared action reads “Save all project settings,” with visible “Unsaved changes in Delivery and Access.” This includes hidden changes; switching panels does not save or discard them. A product that saves sections independently must instead name each save scope accurately.
- After a save attempt, a persistent summary says “Settings were not saved. Access: enter a valid notification address.” Its “Go to notification address” action selects Settings, opens Access and its Notifications section, then focuses the address with its associated error. Other drafts remain intact. A background validation result can update the summary without moving focus.

Use these retention and failure messages only if the product actually supports the stated behavior. Changing projects must not apply the previous project's draft to the new one; restoring context remains subject to privacy policy. Reload persistence is a separate capability to verify.

**UI checks:** Check tab-list names, selected and expanded states, local arrow-key behavior, manual activation where loading is slow, disclosure operation and exclusion of hidden controls from focus. Follow the error action through every hidden ancestor. Repeat at enlarged text and narrow widths, including any responsive change of pattern. **UX checks:** Ask someone to locate an unfamiliar setting, predict Save's scope, compare Schedule and Retry rules, edit both sub-tabs, switch parents and return, then recover the hidden-field failure. Verify draft identity, unchanged saved values on failed validation and whether an available search finds collapsed content. Relevant rules: AUDHD-01, 02, 03, 05, 06, 09, 10, 11, 12. See the [pattern guidance](GUIDE.md#tabs-sub-tabs-and-accordion-sections).

## Dashboard: from summary to action

**UI concerns:** Heading and panel hierarchy, distinct navigation and filters, readable metric labels, responsive reading order and visible focus. **UX concerns:** Finding the most consequential issue, interpreting scope and freshness, reaching the next task and retaining work during refreshes or interruptions.

**Before:** A reporting dashboard presents twelve equally prominent cards, an activity feed above the work queue, two identical tab rows and a red “3” with no explanation. The totals do not identify their period, and a refresh moves the row being edited.

**After — illustrative reading order:**

1. **Context:** “Report operations — North team.” A nearby “Last 7 days” filter explicitly applies to summary metrics and the queue. A task-specific owner filter remains inside the queue panel.
2. **Attention:** “3 reports could not be delivered. Open failed deliveries to inspect each reason and retry where available.” This stays ahead of routine activity; errors for an individual report also appear beside that report. Viewing or dismissing the notice does not mark delivery successful.
3. **Summary:** “Delivered: 42 of 45 attempted · Last 7 days · Updated 10:42, October 17, 2026, America/New_York.” A metric whose source is unavailable says so instead of displaying zero. A link labeled “View delivered reports” explains where the count leads.
4. **Primary work:** A “Review reports awaiting approval” panel contains the selected report, relevant notes and “Open report for review.” Opening a review does not approve it. Approval remains a separate action with its actual consequences explained.
5. **Supporting detail:** “Recent activity” and expandable “Delivery diagnostics” follow the work or occupy a subordinate column. A blocking delivery reason remains visible at the affected report even when diagnostics are collapsed.

Application navigation identifies “Reports”; page navigation distinguishes “Overview” from “Delivery history”; the queue's owner selector is visibly a filter. These controls do not share an indistinguishable tab treatment. Each selected destination remains clear, and changing the queue filter does not silently alter the whole dashboard's period.

At narrow widths, the supporting column follows the main work in the document and keyboard order. Long descriptions wrap without stretching unrelated rows. Refreshes update counts in place and offer “Show new reports” when inserting rows would displace current work. Retain drafts and filters only where supported and permitted by the product's privacy rules.

**UI checks:** Inspect headings, navigation, filter ownership and metric labels at narrow widths and enlarged text; check keyboard order, focus and control operation. **UX checks:** Locate failed deliveries, explain the metric's denominator and freshness, open a review, change a local filter and return after an interruption. Introduce a delayed refresh, unavailable metric and delivery failure; verify that the edited row and draft stay stable and that reviewing or dismissing a notice does not approve or resolve work. Relevant rules: AUDHD-01, 02, 03, 04, 05, 07, 09, 10, 11, 12.

## Monitoring screen: status is not a promise

**UI concerns:** Job identity, readable freshness and status labels, accessible actions and useful status announcements. **UX concerns:** Knowing whether output is verified, avoiding decisions based on another job's results and recovering verification without unnecessary regeneration.

**Before:** A dashboard shows “Success,” a changing counter and “Run.” Results remain visible after a different job is selected, with no freshness label.

**After — visible context:**

> **Report generation**
>
> Selected job: October summary
>
> Generation finished. File verification has not run.
>
> Last update: 10:42 · Results below belong to October summary.
>
> **Verify generated file** · **View generation details**

**Contextual help:** “Check that the generated file is present and readable. This does not regenerate the report or check whether its conclusions are correct.” Use this explanation only if these are the actual checks.

**When selection changes:** Show the new selection immediately, label its results as loading, and reject late responses belonging to the old job. If old results remain useful, label their job and date explicitly.

**Failure and recovery:** “The file could not be read. Generation finished, but verification failed. Retry verification after checking file access.” Do not offer rerunning as the only recovery if verification can be retried independently.

**Return:** Summarize meaningful changes since the last visit if reliably recorded. Otherwise show current status and freshness, without inventing a session history. Avoid announcements for every counter increment.

**UI checks:** Inspect job, freshness and status labels; operate verification and details with supported inputs and check meaningful status announcements. **UX checks:** Switch jobs during a delayed response, fail verification and return later. Verify response matching and ask the reviewer to distinguish completion, verification and freshness and choose the next action. Relevant rules: AUDHD-01, 04, 07, 09, 10, 11, 12.

## Saved-item library: names need meaning

**UI concerns:** Meaningful card names, visible replacement consequences, distinct preview/replacement controls and selected-item indicators. **UX concerns:** Finding the intended version, predicting replacement, preserving draft boundaries and understanding actual recovery options without remembered context.

**Before:** Cards named “Version 2,” “Final” and “Test B” offer identical “Open” and “Restore” buttons. Nobody remembers their purpose.

**After — one card:**

> **Weekly newsletter — shorter introduction**
>
> Saved October 12 · Draft · Owner note: “Compare a shorter opening with the original.”
>
> **Preview saved draft** · **Replace current draft with this version**

Keep stable IDs available in details for troubleshooting. Search names and descriptions, including items inside collapsed groups, while preserving selection. If no purpose was recorded, say “No description recorded”; do not manufacture one.

**Contextual help for replacement:** “Copy this saved version into your current draft. Your published newsletter stays unchanged. This replaces unsaved edits in the current draft.” That replacement consequence must also be visible at the action, not only in help.

**Recovery:** Show the content being replaced before a consequential replacement. Offer “Save current draft as a separate version” if supported. If undo exists, state its actual availability and expiry. Never promise an invented recovery feature.

**Return:** Restore the selected item and filters where appropriate; indicate if a selected item is excluded by the current filter. Explain missing items rather than silently selecting another.

**UI checks:** Inspect card names, consequence text and selection indicators; operate search, preview and replacement controls with supported inputs, including when a filter hides the selection. **UX checks:** Find a description, preview, cancel replacement, change filters and return. Verify that browsing never edits the draft, replacement affects only the stated scope and any documented recovery works. Ask the reviewer to predict these effects before acting. Relevant rules: AUDHD-01, 03, 06, 08, 09, 10, 11, 13.

## Preference intake: answer only what matters

**UI concerns:** A short, readable choice of display and interaction options, an obvious skip path and a preview. **UX concerns:** Personalizing without a mandatory questionnaire, diagnostic disclosure or repeated questions, while distinguishing a temporary choice from permission to remember it.

**Before:** An agent asks for a diagnosis and requires every preference to be answered before reviewing a settings form. It copies all example-profile values into a personal file when the person says only “larger text, please.”

**After — optional intake:** Use the [preference intake](PREFERENCES.md#ask-briefly-and-progressively). The person says, “Larger text and no sounds. Skip everything else; don't save a profile.” Offer a text-size preview and keep sounds off where supported for this task. Do not create a file, fill skipped fields with the fictional example's choices or ask again merely because answers are incomplete. Do not claim the application changed until verified.

If the person later says, “Remember those two choices for this project,” save only confirmed choices. For a new version-2 profile, other preference leaves are `null`; `sensory.sounds` is `false`, not unanswered. If an existing profile is being updated, skipped questions leave its prior choices intact. Do not infer a text-scale number from “larger”; establish it through a preview or leave it unspecified until chosen. No diagnosis or medical reason belongs in the profile.

**UI checks:** Inspect the intake's readability and operable skip/preview controls. **UX checks:** Skip questions and continue the original task; distinguish previewed, selected, remembered and actually applied settings. Check that declining storage creates no file, and later authorized storage records only confirmed choices. Relevant rules: AUDHD-03, 04, 10, 11, 12; [preference storage](PREFERENCES.md#save-an-optional-json-profile).

## JSON profiles: preserve choices and privacy

**UI concerns:** Accurate saved/applied/unsupported feedback and a readable explanation of profile conflicts. **UX concerns:** Predictable merging, recoverable updates, privacy on shared devices and honest handling of unavailable preferences.

**Example update:** A user-wide profile has text scale `1.25` and sounds off. A project profile leaves text scale `null` and chooses an overview layout. The project therefore inherits `1.25`; its null does not reset the scale, and `false` for sounds stays an explicit choice. The user says, “Use text scale 1.5 today, but don't save that. Remember expanded help for this project.” Apply the temporary text choice within supported scope and update only the project's help preference, keeping the previous profile recoverable. Skipped preferences do not erase old values.

These descriptions show only the fields relevant to the example; a saved version-2 profile requires the full documented structure, with unanswered new leaves null. If the user later asks to clear the project's text choice, null resumes inheritance from the user-wide `1.25`; it does not force scale `1`. If the project chooses `["text", "shape"]` for group cues, that array replaces inherited cues rather than retaining an unwanted inherited pattern. Visible text and accessible semantics remain baseline requirements.

If the existing JSON is malformed, contains an unsupported version or has a wrong type such as `"text_scale": "large"`, report that it cannot be used as a valid profile. Preserve the file; do not overwrite it with [the fictional example](preferences.example.json). Explain known safe fallbacks and unsupported settings. Parsing valid JSON alone does not prove it matches the documented format or changes an interface.

On a shared workstation, a preference for retained drafts does not override the product's session-end deletion policy. Save permitted preferences only in the agreed scope/location; do not include patient or document history, diagnoses or credentials. Do not commit, sync or publish a personal profile or its recoverable copy without authorization. The repository ignores the conventional local filename, but a custom path or backup needs its own storage review. An audit alone does not authorize writing a profile.

**UI checks:** Inspect feedback for saved versus applied settings, unsupported values and conflicts. **UX checks:** Propose or execute, within authorization, load/update/reload, null inheritance, explicit false, a temporary override, skipped questions, malformed JSON, wrong types and unknown versions. Verify unchanged data after failure, recoverability and shared-device boundaries; report any checks not run as pending. Relevant rules: AUDHD-04, 06, 10, 12; [profile format and precedence](PREFERENCES.md#format-and-precedence).

## Group cues and accessibility overrides

**UI concerns:** Consistent text, shape, line-style and optional pattern cues alongside color, with separate focus and selection indicators. **UX concerns:** Following related groups without decoding color alone and choosing a comfortable presentation without losing task meaning.

**Before:** Delivery and Access are identified only by green and red. An agent prescribes dense hatching to everyone reporting color-vision differences and rejects an explicit request for a light accessibility theme because it incorrectly assumes dark is mandatory.

**After:** Keep visible “Delivery” and “Access” labels, with a circle and square respectively. Where charts need matching cues, offer labeled solid/circular versus dashed/square series or restrained patterns, with a nearby legend. Preview alternatives; the person may prefer labels and shapes without patterns. Keep the same mapping across panels, and keep errors, focus and selection independently identifiable. Pattern preference never removes text or semantic equivalents.

A person explicitly requests a light presentation for accessibility and larger text. Record the appearance preference if they ask to remember it; otherwise use it only within the current authorized task. Honor operating-system forced colors even when a stored profile prefers a custom palette. Recheck contrast, focus, labels and charts in the effective presentation. “Subdued surfaces” changes product tokens, not device brightness, and must not reduce required contrast. Unsupported choices remain reported as unsupported rather than presented as applied.

**UI checks:** Inspect grouping without color, enlarged labels, chart alternatives, focus and effective theme/forced-color states. **UX checks:** Ask the person to match groups, find a relevant tool and interpret an error using their chosen cues; verify that the selected appearance resolves the requested presentation without changing domain behavior. Simulation and profile syntax checks do not establish user benefit. Relevant rules: AUDHD-02, 08, 10, 11, 12; [color and redundant cues](GUIDE.md#color-and-redundant-group-cues).

## Error messages with useful consequences

These fictional messages depend on verified behavior. They are patterns to adapt, not promises to copy into a product whose persistence or retry behavior is unknown.

**UI concerns:** Plain-language errors connected to the affected control or task, with accessible feedback and operable recovery actions. **UX concerns:** Understanding the consequence, knowing what remains intact and choosing a safe next step. Inspect the message and its operation for UI evidence; exercise the underlying failure and recovery and check the user's understanding for UX evidence. Wording alone cannot establish that a draft was retained or a retry is safe.

| Condition | Example message | Check before using it |
|---|---|---|
| Invalid input | “Enter an end date on or after the start date. Your other entries are unchanged.” | Field identification and preservation of valid entries |
| Connectivity failure | “The save was not confirmed because the connection was interrupted. Your draft remains open. Reconnect and check saved status before retrying.” | Actual draft retention and whether the first save may have completed |
| Permission denied | “You cannot save changes to this shared report with your current access. Your draft remains open. Ask the report owner for editing access.” | Correct access explanation without exposing private details |
| Processing failure | “The export stopped before a complete file was produced. Your source document is unchanged. View the error details before trying again.” | Source integrity, partial-output handling and safe retry behavior |
| Conflicting edits | “A newer version was saved by another editor. Your edits have not replaced it. Compare the versions before choosing what to keep.” | Conflict detection, retained versions and deliberate resolution |

Pair the message with an appropriate action and visible context. Do not erase input, overwrite newer work or repeatedly retry a consequential operation as part of displaying an error.

## Put explanations at the right depth

**UI concerns:** Placement, disclosure controls and accessible help presentation. **UX concerns:** Finding needed meaning without repeated scrolling or losing task context. Check reading and control access separately from whether someone can explain the action's effect and complete the task using that help.

| Layer | Include | Avoid |
|---|---|---|
| Always visible | Purpose, selected scope, save state and important consequences | Requiring ten help interactions to understand the page |
| Contextual help | Meaning, when to use it, timing, examples and relevant recovery | Repeating the label or substituting backend names |
| Extended reference | Procedures, unusual cases and optional technical mechanisms | Making ordinary operation depend on reading source code |

A useful writing pattern is **what it does → when to use it → what it affects → example or recovery**. Include only the parts needed to resolve uncertainty. Apply the guide's [help-format guidance](GUIDE.md#choose-the-help-format) to choose between brief definitions, persistent explanations and interactive reference content.

## Timing and search: label, clarify and show

In this fictional recording interface, simulation time and real execution time differ, measured execution duration includes recorded pauses, and the recording is dated January 15, 2026. Verify the corresponding facts before using the wording in a real product.

**Before:** Three isolated cards show “EST,” “42 min” and “58 min.” Tooltips say “Time information” or “More information coming soon.” A distant search box says only “Search…” and its scope is unclear.

**After:** Place related values in a named **Timing** group, retaining a useful side-by-side comparison:

| Label | Explanation | Value |
|---|---|---|
| Time zone | Used for recording timestamps | America/New_York · UTC−05:00 |
| Simulation duration | Time elapsed inside the simulation | 42 min |
| Execution time | Real elapsed time, including recorded pauses | 58 min |

Place **Find a recording** beside the results it filters, followed by “Search by test name, date, map, seed or ID” and the search control. Associate its visible label and description programmatically; its placeholder is supplementary. Do not add a repeated subheading to an already clear field such as “Recording ID.” Keep detailed help available for unfamiliar simulation semantics rather than squeezing it into the short summary.

Show the time-zone offset applicable to the recording date; do not use a fixed abbreviation or the viewer's current offset for every recording.

**UI checks:** Inspect the grouping, opened help, label associations, no-color interpretation and narrow/enlarged layout. **UX checks:** Ask someone to distinguish the two durations, identify the time zone and predict which results search affects; verify the stated clock and search behavior. Mark unperformed checks pending. Accurate individual labels alone do not establish clear relationships. Relevant rules: AUDHD-02, 04, 07, 09, 11, 12.

## Emphasis changes attention, not requirements

**Configuration:** “Primary targets: complete contextual explanations; visible relationships between concepts. AUDHD-09 Require; AUDHD-02 Prioritize; AUDHD-05 Consider; other rules Apply.” This is a fictional task configuration, not permission to save a profile.

**Application:** Inspect every unfamiliar control and status in the affected recording workflow for substantive help, and inspect relationships among timing values, filters and results. Preserve focus and selection even though AUDHD-05 has lower emphasis. Grouping changes must preserve keyboard focus and the selected recording.

**Unresolved behavior:** If pause accounting cannot be established, report that specific uncertainty and leave behavior verification pending; do not copy the fictional claim above. Report the applicable Require-level gap as blocking full completion while delivering supported changes. A review reports the finding without edits. If every rule is Require, retain equal emphasis and use primary targets for attention without silently dropping other requirements. A read-only screen still does not require inventing save controls.

**Checks:** Inspect the effective task/project/user configuration and confirm that lower levels did not waive requirements, unknown behavior was not invented, no unrequested profile was saved, and completion claims match the available evidence. Editorial inspection is not model or user validation.

## When guidance becomes an obstacle

**UI concerns:** Added clutter, hidden controls and excessive visual emphasis. **UX concerns:** Repeated decisions, unnecessary confirmations, lost capability and privacy tradeoffs. Compare presentation and control access, then observe task effort and outcomes; a cleaner-looking screen can still make the workflow harder.

| Overcorrection | Better response |
|---|---|
| Every label gets a redundant tooltip | Explain unfamiliar meaning and consequences; retain obvious controls |
| Every action requires confirmation | Use safeguards proportionate to consequence; prefer reliable undo where appropriate |
| Routine choices are hidden as “advanced” | Keep ordinary tasks discoverable and selected values visible |
| Return summaries dominate the page | Show concise relevant context with optional history |
| Plain English removes needed precision | Explain the technical term while retaining accurate units and boundaries |
| Restoring context exposes private work | Respect shared-device and retention boundaries; explain what is not retained |
| Simplification removes expert controls | Preserve necessary capability with clear organization and optional detail |

These examples are guide text under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Connected recording review and adaptable appearance

**Before:** A selected card is tinted but its detail panel is unrelated, both current and inactive actions say “Review,” a detached count does not introduce its list, and navigating always outlines a heading. The saved indicator does not say that storage is simulated.

**After:** Shared active-context treatment connects source and detail by real record ID, with repeated identity and structural cues. “Reviewing…” reflects the open mode, “3 recordings:” introduces its labeled list, and a direction cue follows reflow. Keyboard focus remains separate; pointer navigation does not force a large heading outline. The `( ! )` warning access point (rendered as `(!)`) beside Save explains simulation while visible retention wording states the boundary. `(i)` and `(?)` help remains useful on keyboard/touch and does not conceal essential consequences.

Users can choose any of 22 skins and four text styles. Light/dark are ordinary choices. Skin changes and explicit profile application preserve drafts, pending snapshots, selected record, filters and local views. Unsupported profile choices remain exportable but are not claimed active. Canonical page records supply matching top/bottom breadcrumbs and the page index; workspace links and local tabs have different scopes.

**Checks:** See the [runnable references](examples/recording-review/README.md), [shared contract](examples/recording-review/SPEC.md) and [actual evidence](examples/recording-review/ACCEPTANCE.md). Relevant rules: AUDHD-01–12 as applicable. These implementations do not establish universal user benefit or replace application integration checks.

## From configuration files to a useful dashboard

**Before:** Every JSON key becomes a control; help repeats the key, and “Save” is presented as though it applies runtime changes immediately.

**After:** Inspect the real loader, schema, defaults, precedence, dependencies, permissions and persistence path. Group by task/effect, show requested versus effective state and explain save/apply/restart separately. Keep useful technical details available without replacing plain-English summaries. Where facts remain unknown, mark them and continue supported work rather than inventing values or blocking on an optional preference questionnaire.

**Checks:** Trace input through validation and persistence to effective behavior; test permissions, failure/recovery and return. Identify the evidence source for each material explanation. Relevant rules: AUDHD-01, 02, 04, 06, 09, 12, 13. The recording demo illustrates continuity; it does not implement a real configuration backend.
