# Interaction patterns and task lookup

Use the task, not the component name alone, to select checks. Read the linked [Guide rules](../GUIDE.md#ux-and-interaction-rules) when applicable; these prompts do not redefine them. Patterns apply only when their interaction is needed; their procedures preserve the Guide outcomes without requiring new components. Findings require evidence.

[Visual choices](#visual-choices-in-settings) · [Capability states](#capability-states-and-next-actions) · [Record recovery](#record-administration-and-recovery) · [Status links](#status-to-control) · [Unlock to edit](#unlock-to-edit-interaction-pattern) · [Tabs and disclosures](#tabs-sub-tabs-and-accordion-sections)

Use the [component review matrix](component-review-matrix.md) and applicable [detailed readiness checks](ui-readiness-checks.md) to turn the selected workflow into concrete control and transition checks. Record those results in the existing review record, alongside the task outcome.

| Interface family and task | Rules | Questions to investigate | Our example | Evidence needed |
|---|---|---|---|---|
| Forms/settings: change a value and understand its effect | AUDHD-04, 06, 09, 11, 13 | What takes effect, when, and how is failure recovered? | [Unlock-to-edit](../examples/unlock-to-edit/README.md) preserves a restoration point | Actual save contract, rendered labels, keyboard and failure transitions |
| Dashboards: choose what needs attention | AUDHD-01, 02, 07, 08 | Are scope and freshness clear? Can needed values be compared together? | [Administration overview](../examples/administration/README.md#overview-and-control-links) links errors, drafts and pending verification to the affected record/control | Real task priorities, data meaning and rendered states |
| Navigation/nested views: leave and return | AUDHD-01, 05, 10, 11 | Do heading, selected navigation and context answer “Where am I and what am I doing here?” Does the destination match its ancestry? Do drafts and focus survive? | [Recording workspace](../examples/recording-review/README.md) retains local views | Rendered orientation, route identities, history, keyboard and return checks |
| Collections/search: find an item without recalling an identifier | AUDHD-03, 04, 05, 10 | Are restrictions visible? Does reset preserve the loaded draft? | [Recognition example](../EXAMPLES.md#find-a-recording-without-remembering-its-identifier) | Available metadata, filter semantics, zero results and unsaved-work transitions |
| Multi-step tasks: understand progress and remaining work | AUDHD-01, 04, 06, 10 | Is completion real? Can the user return to correct a step? | Recording import preview → apply → export is a bounded sequence, not a mandatory wizard | Actual steps, cancellation, failed transitions and return behavior |
| Dialogs/consequential actions: inspect before committing | AUDHD-04, 05, 09, 11, 13 | Is added friction justified? Are effects and recovery accessible? | Unlock-to-edit uses local safeguards rather than mandatory dialogs | Consequences, focus transitions, permission and restoration contracts |
| Loading/empty/error/completion: understand the current result | AUDHD-04, 06, 07, 11 | Is missing data distinct from zero? Are newer edits still unsaved? | Recording review distinguishes earlier acknowledgment from the current draft | Observed pending, failure, retry, stale completion and empty states |

Report the observed problem and consequence, evidence/location, focused proposal, and verification/uncertainty. A screenshot cannot prove persistence or keyboard behavior. Preserve useful density, existing conventions and working controls when no problem is evidenced.

For complex dashboards, check [primary and secondary navigation](../GUIDE.md#keep-navigation-levels-distinct): can someone find a task without knowing configuration names, identify its parent, reach prerequisites and return to unfinished work? A simple screen need not gain extra levels. Check routes from change reviews and error summaries to hidden controls, including reveal, focus and draft preservation. Under [responsive operation](#operate-accessibly-across-layouts), every primary destination must remain discoverable without horizontal scrolling at narrow widths or enlarged text; inspect actual navigation and selected content, not just page overflow.

Match verification to the user's task. A settings check observes persistence and effective behavior; an access check observes intended allowed and denied actions; a delivery check observes the intended destination. Do not treat a rendered form, recognized runtime flag, health check or generic round trip as proof of those distinct outcomes. For record-management tasks, distinguish editable declarations from inspection and management of existing records. Record only the evidence needed and leave untested outcomes Pending.

## Visual choices in settings

For new interfaces without an established design system, apply the [full-kit reuse and appearance defaults](../GUIDE.md#adaptable-appearance): all registered skins, Guillermo initially absent explicit preferences or established product defaults, independent text styles and system appearance. Package installation is optional; canonical assets may be reused directly. Existing products and justified exceptions retain their established requirements.

Keep the appearance destination last and adjacent to the other main-menu entries, including collapsed and mobile variants, under the [navigation placement requirement](../GUIDE.md#keep-navigation-levels-distinct). Verify access and retained work using [check 47](ui-readiness-checks.md#check-47); focused tools without main navigation need no new menu.

Under AUDHD-02, 03, 05 and 11, when a choice changes a visible property, show a representative example beside its label. Keep the choice understandable without relying on the example alone. This pattern arose from individual feedback on our recording demos; it is not a new rule ID or a validated universal layout requirement.

| If a choice changes… | Show… |
|---|---|
| A color | A swatch and a meaningful label |
| A palette | Color bands and a small surface showing text, action and selection relationships |
| Text size or typography | The same phrase rendered using each option |
| Spacing, margins or thickness | Identical content with the actual difference visible |

Apply [AUDHD-02](../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings) to independent option groups: can a reviewer identify each group, its effect and its active choice without clicking? In our recording settings, Text style, Text size and Spacing use labeled sections and greater separation between groups than between their options; borders are one implementation choice. Inspect the distinction across themes, density settings and enlarged text.

For theme typography, follow the [AUDHD-11 default](../GUIDE.md#audhd-11-keep-controls-readable-and-operable): place the theme-matching option first, show Heading and Body samples, and preserve explicit overrides when the theme changes. In these demos, Skin headings is the initial choice and System is last. This does not change schema defaults or make a personal preference universal.

Apply [AUDHD-11](../GUIDE.md#audhd-11-keep-controls-readable-and-operable) to preview accuracy and application scope: compare the demonstrated properties with what actually changes. Our spacing previews show padding and gaps, and their descriptions explicitly exclude line-height changes. Verify the promised elements, keyboard focus and usable controls in each supported setting; a screenshot alone cannot establish that application works.

For long optional choice collections that push other tasks out of view, consider a clearly named disclosure with the current choice visible in its collapsed summary. Label the action explicitly (for example, Show/Hide appearance choices), and retain a compact representative visual when the current value describes appearance. Our appearance bank starts closed; opening and closing it does not change the applied theme. Keep the choices keyboard reachable when expanded and verify that collapse does not hide an error or required next step.

Use single-choice semantics for mutually exclusive options. Our demos use cards containing native radios, preserving their names, checked state and keyboard operation. Their contrasting status band, state wording and structural cue are one application of [AUDHD-02's selection requirement](../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings), not a required replacement for clear native controls. Active/Inactive describes immediately applied choices; Selected/Not selected describes choices awaiting application. Any status area belongs to the same clickable card, without nested controls or another keyboard stop. Keep focus distinct and avoid repeating checked-state announcements through decorative text. Describe meaningful differences, label system/font-dependent samples and test actual assistive-technology behavior rather than promising announcements.

Verify previews against effective rendering, keyboard focus and selection, narrow/enlarged layouts, forced colors and unsaved-work continuity. Our demos use these cards for appearance, text style, text size and spacing; hosts still own preference application. A visual example supplements accessible descriptions, not vice versa.

## Keep associated help beside its subject

Follow [AUDHD-09's placement and disclosure rules](../GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision). For example, a named `(i)` button beside a setting reveals purpose, use/off examples and choice guidance inside the same panel. Collapse returns to the concise view without hiding units or consequential state. On a narrow screen the opened help stacks directly after its subject, not after unrelated sidebar content.

Adapt the [administration request policy](../examples/administration/request-settings.js) for a native disclosure around coupled fields, or the independent recording [React](../examples/recording-review/react/src/ContextHelp.jsx) and [Svelte](../examples/recording-review/svelte/src/ContextHelp.svelte) controls for a brief hover/focus refresher with persistent inline expansion. Keep domain explanation specific to the actual field; the example's limits and use cases are fictional, not reusable production recommendations. These patterns can be copied without installing the preference framework.

Inspect both closed and open states, reading order, visual grouping, expanded state and keyboard/touch operation. Opening help must not activate the setting; dismissal must preserve drafts and useful focus. A detached help card and a nearby control do not establish that the participant recognizes their connection. This is an application of AUDHD-02, 05, 09 and 11, not a new rule ID.

## Make group membership visible

Apply [AUDHD-02](../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings) at the relationship's owner. A notebook count and its label can share one outlined description-list entry; an agenda date and its meetings can share a panel with inset contents or a continuous edge. Keep siblings aligned and gaps between groups stronger than gaps within a group. The particular border is optional; recognizable membership and its semantic equivalent must survive wrapping, enlarged text and forced colors.

Inspect a boundary case rather than only an evenly filled layout: a multi-line label, one group with a single item beside another with several, or a count of zero. Follow each label to its value and each heading through its complete contents. See the administration [notebook presentation](../examples/administration/notes-tools.css) and [agenda presentation](../examples/administration/schedule.css); source rationale describes their constraints, not proven comprehension.

## Search criteria, comparison and selected detail

Use [AUDHD-07](../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status) to separate a composed availability request from immediate collection filtering. A multi-field search has editable criteria, an explicit initiating action and the criteria snapshot belonging to its results. After an edit, old results identify that snapshot and require another search; incomplete input does not become a plausible proposal. Recheck availability before commitment. A simple name filter can still update a browsable collection immediately.

Under [AUDHD-03](../GUIDE.md#audhd-03-offer-manageable-detail-without-hiding-choices) and [AUDHD-08](../GUIDE.md#audhd-08-use-visuals-to-support-decisions), compact choices retain the information needed for comparison while the selected detail has a clear connection and return path. Selecting a room reveals its schedule; continuing prepares a draft; saving books it. Preserve those distinctions and the user's criteria, selection and drafts. Test an edit during a pending search, no matches, invalid input and a choice followed by Back/Forward. The administration example connects this contract to [submitted room searches and their recovery](../examples/administration/README.md#worked-design-decisions). Its optional scenarios distinguish an empty successful response from unavailable or partial data; refresh failures retain the last successful snapshot and its timestamp.

A configuration illustration must describe the same policy that the consuming operation enforces. Compare current and proposed values, explain scope and effects, then exercise acceptance, rejection and correction through that operation. Revalidate an earlier preview before committing against changed rules. See the [note settings and export-request examples](../examples/administration/README.md#worked-design-decisions) and [AUDHD-12](../GUIDE.md#audhd-12-validate-complete-tasks-and-report-actual-evidence).

## Capability states and next actions

Use the distinctions a task needs; these are examples of truthful language, not mandatory badges or a runtime schema. A read-only presentation describes interaction, not the reason a capability is unavailable.

| State | Explain beside the affected task | Useful next action |
| --- | --- | --- |
| Available and verified | What outcome was observed, on which saved version or destination, and its limits | Inspect the result or continue the task |
| Configurable, verification pending | What was saved and what has not been established | Verify the saved operation without saving it again |
| Unavailable until a dependency exists | Name the missing service, credential or application and its consequence | Configure or connect that dependency when authorized; retain preparation work where useful |
| Restricted by the environment | State the actual permission, platform or isolation boundary | Offer an established permitted alternative or explain who can resolve the boundary |
| Not implemented | Name the unsupported task without disguising it as a restriction | Identify an existing supported alternative, or report the implementation gap |

Apply a shared dependency warning to each affected control or clearly containing task. For example, an absent client application affects every setting whose visible result requires that client. Missing credentials prevent an external verification; they do not automatically justify removing configuration. Availability and verification may differ, so a single success badge should not erase those distinctions.

When all actions in a selected task are unavailable, present the reason and established next step in the main task area. Do not reduce the page to a closed “Managed settings” row while leaving only generic sidebar instructions visible. Share common limitations at the group level and identify exceptions locally, rather than repeating the same warning beside every field.

## Record administration and recovery

The [runnable administration example](../examples/administration/README.md) connects collection selection, record inspection, contextual editing, field-linked errors, verification and filtered return. Prefer actions attached to the selected record over a raw command-output panel paired with disconnected command forms. Use named secondary destinations when accounts, permissions and credentials become distinct tasks; a small interface need not introduce extra nesting.

Check initial entry separately from refresh: the authorized collection read starts on entry, with loading, empty and failure states distinguished. Refresh updates or retries that read. New responses must preserve the selected record and draft; auto-loading a task is not permission for continuous background polling.

On failure, preserve current identity, drafts and useful collection context. Test a successful save followed by failed verification, a newer unsaved draft, and a retry of the saved operation's verification: the retry must not resubmit the mutation or overwrite the newer draft. Check the intended allowed and denied permission paths or actual delivery destination; generic health does not substitute for either. Where no safe verification interface exists, explain that limit and leave the outcome pending.

Keep verification claims tied to the checked record, version and stage. A new save does not inherit the previous version’s verification; where application is separate, that previous result may still describe the running version. Unsaved drafts do not replace verified saved state. Retain unresolved field errors when leaving and returning, clear them when corrected, and keep any draft-reset action scoped to its named record. Return focus to the originating record when it remains in the filtered collection, with a meaningful fallback otherwise. The administration example exercises these distinctions without imposing a storage or routing API.

**Recovery walkthrough:** A service acknowledges an operation and returns an identifier; the follow-up check times out after the user leaves the page. Retain the receipt under its original task/version. Show the acknowledged stage—accepted, saved or completed—and verification pending consistently wherever the result appears. “Retry verification” checks that receipt without sending again; “Send again” is a separate mutation with its own consequences. If the original acknowledgment was lost instead, completion is uncertain and requires reconciliation under the service contract. Retain the submitted snapshot and identity before dispatch; do not generate a new identifier when recovering the same operation. Reusing one prevents duplication only if the service supports it. Test both paths through the visible controls in a controlled fixture, including navigation and a newer edit, and inspect mutation counts. An API test that supplies the same identifier twice does not prove the UI preserves it.

The administration [recovery module](../examples/administration/recovery.js) isolates the submitted request from the editable next draft and demonstrates rejection, response loss and verification recovery. Its in-memory service makes the contract visible; production adapters must establish their own supported reconciliation, deduplication and retention boundaries. Use the example's browser check as an interaction pattern, not evidence about another application.

During visual review, inspect both desktop and narrow task entry. Common work and prerequisites should precede decorative copy and source detail; inactive global actions should not crowd out the selected task. Keep all necessary settings discoverable. Use the Guide's [task-visibility check](../GUIDE.md#prioritize-useful-work), without imposing fixed screen-space quotas.

## Status to control

Operational overviews route users to work: a failed save links to its record, an invalid value links to the revealed field, and saved permissions awaiting verification link to their read-only check. Keep subject, severity, consequence and remedy together; distinguish confirmed problems from routine unfinished work and unchecked evidence. Use the same state owner as the editor; avoid parallel counters that drift after resets or asynchronous responses. Preserve filters and drafts when following links or returning through browser history. Focus the revealed task heading or exact control after rendering, with a surviving fallback if the previous item is filtered out. Appearance changes and background responses must not steal focus.

Ordinary configurable status needs the same connection: “Report retention: 30 days” can offer “Change report retention” leading to that control, rather than leaving the user to search a general Settings page. Derive readiness labels from established criteria, not the existence of a settings category. On arrival, the heading, selected navigation and any breadcrumb should identify the owning task as well as the affected scope. Purely informational values need no artificial link. Use [AUDHD-02](../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings) to check ownership and [AUDHD-04](../GUIDE.md#audhd-04-explain-effective-behavior) to explain platform or dependency limits before an unavailable action.

Follow the Guide’s [language](../GUIDE.md#practical-interface-language) and [overview](../GUIDE.md#status-first-operational-overviews) requirements. A focused editor or preview needs no additional overview. Completion belongs beside its action as well as in relevant summaries: show what was observed and update the checked time when repeating the same check. Clear corrected errors and stale remedies without erasing newer work. Follow the [source-rationale maintenance convention](../CONTRIBUTING.md#maintain-accessibility-rationale-with-the-implementation) when documenting these boundaries in examples.


## Unlock to edit interaction pattern

Use this pattern when AUDHD-13's deliberate transition from inspection to modification is justified by the consequences of accidental edits. Keep the name, current value, units, protection reason, editing action and recovery feedback together in a stable layout. A card is optional. Ordinary fields can remain directly editable. Unlocking does not grant permission, override a dependency, bypass validation or establish control over a running process.

### Keep independent states visible

| Property | Question it answers | Example labels |
|---|---|---|
| Editing availability | Can I directly change this field? | Locked / Editing enabled |
| Comparison | Does this value differ from the named reference? | Matches baseline / Changed / Baseline unavailable |
| Persistence | What version was saved, and where? | Unsaved / Saving / Saved on this device / Save failed |
| Applicability | Does this setting currently take effect? | Inactive under the selected configuration; value retained |

Show the states that apply to the actual workflow. “Matches baseline” establishes neither validity nor saving; “Editing enabled” need not mean the value has changed. Give editing, comparison and keyboard focus distinct cues, with readable text rather than color or padlock icons alone. Keep a dependent setting's explanation and retained value available even when direct editing is unavailable.

### Make transitions local and predictable

| Action or situation | Expected interaction when using this pattern |
|---|---|
| Inspect a locked field | Show its current value and units. Allow text selection and copying where appropriate; keep selected choices recognizable. |
| Choose **Unlock to edit** | Enable only the named field or explicitly named group without changing its value. If session restoration is offered, capture the value at this point. |
| Edit or switch sections | Follow the stated saving contract. Preserve the draft, editing state, focus and useful position across ordinary panel navigation; navigation alone does not finish or cancel editing. |
| Choose **Restore value from before editing** | Restore only the named field's captured value and leave editing enabled. Apply the same saving contract as other edits. |
| Choose **Lock editing** | Prevent further direct editing without silently discarding changes. If this action also promises saving, complete the required save acknowledgement or verification before closing editing. |
| A promised save fails | Preserve the draft and keep editing open, with a persistent explanation and a working retry or recovery action. |
| Unlock again | Capture a fresh restoration point for the new editing session, if supported. |

Independent fields may remain open together. Unlocking one must not silently close or unlock its neighbors. An unlocked-field count can help in a large workspace, but is optional. The explicit local unlock action ordinarily needs no second confirmation dialog.

### Name reference values and recovery precisely

Distinguish the current draft, the value captured before unlocking, the selected comparison baseline, a default and the last saved value. If the product also has an applied or historical configuration, identify it separately and establish when draft changes reach it. Do not assume an existing process or record changes with the draft, or that its configuration is frozen, without evidence.

For example, a retry limit starts at `3` when unlocked. Editing it to `5` may successfully autosave; **Restore value from before editing** still returns it to `3`. That restoration point does not move with each autosave. Offer this action while editing when the value differs from the captured value; describe it as one restoration point, not a revision history. Label whole-form undo and restoring defaults separately, with their actual scope.

**Copy default value to clipboard**, when offered, copies the stated default without changing the draft or comparison baseline and can work while editing is locked. Confirm successful copying; if clipboard access fails, keep the reference selectable and explain manual copying. Any focus movement should follow the user's copy request and help complete it.

### Establish saving and lifetime behavior

Use [AUDHD-06](../GUIDE.md#audhd-06-make-saving-and-recovery-understandable) to establish the saving contract before implementing the pattern. Resolve these decisions from the product or mark them proposed or unknown:

- **Save trigger and scope:** Does saving occur while typing, on committed changes, on re-locking or through a separate action? Does it persist one field or the whole form? A local lock action must not imply that other fields were also locked.
- **Destination and evidence:** Is this a local draft, shared record or explicit export? Confirm only the version and destination actually acknowledged or verified. Local write/readback verification does not establish durable backup, domain validity or conflict handling across sessions.
- **Reload and session boundaries:** Which values survive, do fields reopen locked, and is the restoration point temporary? A common choice is to restore saved values with editing locked and discard temporary restoration points; document the chosen behavior rather than implying persisted undo.
- **Intentional replacement:** Can importing, loading a preset or whole-form undo replace locked values? Explain the replacement's scope and what happens to open edits and restoration points. Re-locking affected fields after an intentional replacement is one option; locks protect direct editing, not every authorized replacement operation.

Keep saving feedback truthful to the operation. Do not promise every partially typed value is preserved if saving happens only after a committed change, or invent asynchronous progress for an instantaneous operation. Preserve recovery information after its initial announcement.

### Accessible operation and verification

Include the field's name in each action's accessible name. Use native read-only text controls where suitable to preserve inspection and copying. If a choice control must be disabled, keep its value and reason readable nearby rather than relying on keyboard focus reaching it. Follow the shared [control requirements](../GUIDE.md#audhd-11-keep-controls-readable-and-operable) and [target, motion and feedback guidance](../GUIDE.md#targets-motion-and-feedback); keep focus cues independent and announce meaningful action results without rearranging the interface.

Exercise inspect/copy → unlock → edit → navigate away and back → restore → re-lock → reload against the chosen contract. Where supported, also test independent open fields, inactive dependencies, intentional bulk replacement, save failure or conflicting responses, clipboard failure, keyboard operation, narrow layouts, enlarged text and accessibility overrides. Check that a restoration point survives intermediate saves and that failure does not falsely close a save-dependent editing session. Record observed results separately from planned checks and user feedback; another product's tests do not verify this implementation. Assess whether the safeguard's added steps are justified for the people and task involved.

## Tabs, sub-tabs and accordion sections

Apply AUDHD-01, 02, 03, 05, 06, 09, 10 and 11 to consolidate related information, tools and settings into digestible chunks. **UI** concerns include labels, hierarchy, control semantics and focus. **UX** concerns include finding the right chunk, retaining context and completing work without hidden blockers. These patterns are optional techniques, not a requirement to subdivide every page.

[Choose a pattern](#choose-a-pattern-by-task) · [Context and hidden errors](#preserve-context-and-surface-hidden-problems) · [Accessible operation](#operate-accessibly-across-layouts)

### Choose a pattern by task

| Pattern | Use when | Avoid when |
|---|---|---|
| Tabs | Peer sections within one context can be used one at a time, such as a project's Overview, Tools and Settings | Users must compare their contents simultaneously, or tabs would conceal a required step or important consequence |
| Sub-tabs | A parent section has meaningful peer subdivisions, such as Settings containing Delivery and Access | The parent relationship is unclear, the same hierarchy can be expressed with headings, or repeated nesting forces users to reconstruct their location |
| Accordion sections | Related groups should expand in place, such as optional notification or retry settings, while their headings remain discoverable | Essential context would disappear or repeated opening and closing would obstruct ordinary work |
| Plain sections or a comparison layout | Related information must remain visible together or the content is already manageable | Added structure would only repeat labels without helping the task |

Use navigation links for destinations that behave as separate pages; a tab-like appearance alone does not make them a tab widget. Tabs switch panels, while accordion controls expand sections in place. Keep labels specific to the contents, distinguish parent and child navigation visually and semantically, and keep the selected parent visible above its sub-tabs. Add depth only when the task benefits; do not impose a universal maximum tab count or a fixed nesting depth.

Allow multiple accordion sections open when users need to compare or combine their contents. A single-open arrangement is appropriate only when it supports the task; opening one section must not discard work in another. Keep ordinary choices discoverable rather than labeling them “advanced” merely to hide them. For search within these groups, follow AUDHD-03's stated-scope and hidden-selection requirements.

A named navigation group can use a plus/minus disclosure to reduce repeated links; expose its expanded state and retain current-task and error cues while closed. The [complete directory](../GUIDE.md#authoritative-navigation-and-repeated-orientation) remains available without search. Selecting a task should then reveal its useful content, rather than require another generic expansion to find anything to do. Disclosure supports focus on a task; it must not hide the whole task.

### Preserve context and surface hidden problems

Switching tabs or collapsing a section changes the view, not the meaning, approval or saved state of its contents. Preserve drafts, selections, relevant filters and useful position within privacy and retention boundaries. Where helpful, remember the selected child for each parent. Bind retained state to the correct object or workspace; do not carry one record's draft into another. Explain any required save, discard or session-expiry boundary before work is lost.

Keep object identity, overall save scope and consequential actions outside hidden panels when they apply across the workspace. Distinguish “Save delivery settings” from “Save all settings”; explain whether hidden changes are included. Use visible unsaved or error summaries on the relevant tab or accordion header when needed, with text rather than color alone. Do not imply that a collapsed group is valid or saved just because its fields are out of view.

If validation or a save fails in a hidden panel, show a persistent, accessible summary in the current context that identifies the group and provides a route to the affected field. Reveal every containing tab and accordion section before focusing that field; associate the error with it. If the field is unavailable or access has changed, explain the obstacle and provide an appropriate fallback. Never leave a disabled Save button with its only explanation hidden. Preserve all other entries and the user's context as far as the task permits; a background error must not unexpectedly switch panels or steal focus. A deliberate “Go to error” action may reveal the target and move focus.

### Operate accessibly across layouts

Do not require horizontal scrolling to discover primary destinations. At narrow widths and enlarged text, use an accessible complete section menu, drawer or vertical hierarchy suited to the host, while keeping the current location visible. Prioritize the selected task: repeated promotional copy, unrelated summaries and inactive action areas must not crowd out navigation and work. Verify access to every destination and its return path, not merely absence of page overflow; preserve drafts, focus and parent/child context through responsive changes.

For web tab widgets, follow the [W3C APG tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): provide a named tab list, associated tabs and panels, and accurate selected state. Tab enters the active tab and then proceeds into the panel or onward; arrow keys move among tabs according to orientation. For manual activation, Enter or Space opens the focused tab. Automatic activation is suitable only when panels appear without noticeable delay. Keep nested tab lists independently named and their key handling local to the active list.

For custom web accordions, follow the [W3C APG accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): use heading buttons with accurate expanded state and panel relationships. Enter or Space toggles the section; normal Tab navigation reaches visible controls. Native disclosure controls may be suitable when their semantics fit the task. Use platform equivalents in native applications. These are implementation references, not proof of accessibility conformance.

Keep hidden panel controls out of keyboard navigation and the accessibility tree while hidden, without erasing their data. Preserve a visible focus cue independent of selection or expansion. If a panel containing focus closes, move focus to its controlling tab or disclosure button before focus is lost. At narrow widths and enlarged text, keep every tab reachable with readable labels; avoid clipped options or ambiguous multi-row hierarchy. If tabs become accordions responsively, preserve content, drafts and a meaningful location, update semantics to match the new controls, and avoid duplicate accessible copies.

**UI checks:** Operate parent tabs, sub-tabs and accordion controls with keyboard and supported touch input. Inspect names, relationships, selected/expanded states, hidden content, focus and narrow/enlarged layouts. **UX checks:** Find a setting without remembered context, edit across groups, switch parents and return, compare open sections, and trigger a validation failure inside nested hidden content. Check save scope, draft retention and the route from error summary to field. Record actual evidence and pending coverage. See the [worked example](../EXAMPLES.md#settings-workspace-tabs-and-accordion-sections).
