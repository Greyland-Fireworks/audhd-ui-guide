# Interface-pattern lookup

Use the task, not the component name alone, to select checks. Read the linked [Guide rules](../GUIDE.md#ux-and-interaction-rules) when applicable; these prompts do not redefine them. Techniques are optional and findings require evidence.

Use the [component review matrix](component-review-matrix.md) and applicable [detailed readiness checks](ui-readiness-checks.md) to turn the selected workflow into concrete control and transition checks. Record those results in the existing review record, alongside the task outcome.

| Interface family and task | Rules | Questions to investigate | Our example | Evidence needed |
|---|---|---|---|---|
| Forms/settings: change a value and understand its effect | AUDHD-04, 06, 09, 11, 13 | What takes effect, when, and how is failure recovered? | [Unlock-to-edit](../examples/unlock-to-edit/README.md) preserves a restoration point | Actual save contract, rendered labels, keyboard and failure transitions |
| Dashboards: choose what needs attention | AUDHD-01, 02, 07, 08 | Are scope and freshness clear? Can needed values be compared together? | [Skin preview](../examples/skins/README.md) includes labeled charts and data tables | Real task priorities, data meaning and rendered states |
| Navigation/nested views: leave and return | AUDHD-01, 05, 10, 11 | Does the destination match its ancestry? Do drafts and focus survive? | [Recording workspace](../examples/recording-review/README.md) retains local views | Route identities, history, keyboard and return checks |
| Collections/search: find an item without recalling an identifier | AUDHD-03, 04, 05, 10 | Are restrictions visible? Does reset preserve the loaded draft? | [Recognition example](../EXAMPLES.md#find-a-recording-without-remembering-its-identifier) | Available metadata, filter semantics, zero results and unsaved-work transitions |
| Multi-step tasks: understand progress and remaining work | AUDHD-01, 04, 06, 10 | Is completion real? Can the user return to correct a step? | Recording import preview → apply → export is a bounded sequence, not a mandatory wizard | Actual steps, cancellation, failed transitions and return behavior |
| Dialogs/consequential actions: inspect before committing | AUDHD-04, 05, 09, 11, 13 | Is added friction justified? Are effects and recovery accessible? | Unlock-to-edit uses local safeguards rather than mandatory dialogs | Consequences, focus transitions, permission and restoration contracts |
| Loading/empty/error/completion: understand the current result | AUDHD-04, 06, 07, 11 | Is missing data distinct from zero? Are newer edits still unsaved? | Recording review distinguishes earlier acknowledgment from the current draft | Observed pending, failure, retry, stale completion and empty states |

Report the observed problem and consequence, evidence/location, focused proposal, and verification/uncertainty. A screenshot cannot prove persistence or keyboard behavior. Preserve useful density, existing conventions and working controls when no problem is evidenced.

For complex dashboards, check [primary and secondary navigation](../GUIDE.md#keep-navigation-levels-distinct): can someone find a task without knowing configuration names, identify its parent, reach prerequisites and return to unfinished work? A simple screen need not gain extra levels. Check routes from change reviews and error summaries to hidden controls, including reveal, focus and draft preservation. Under [responsive operation](../GUIDE.md#operate-accessibly-across-layouts), every primary destination must remain discoverable without horizontal scrolling at narrow widths or enlarged text; inspect actual navigation and selected content, not just page overflow.

Match verification to the user's task. A settings check observes persistence and effective behavior; an access check observes intended allowed and denied actions; a delivery check observes the intended destination. Do not treat a rendered form, recognized runtime flag, health check or generic round trip as proof of those distinct outcomes. For record-management tasks, distinguish editable declarations from inspection and management of existing records. Record only the evidence needed and leave untested outcomes Pending.

## Visual choices in settings

For new interfaces without an established design system, apply the [full-kit reuse and appearance defaults](../GUIDE.md#adaptable-appearance): all registered skins, Guillermo initially absent explicit preferences or established product defaults, independent text styles and system appearance. Package installation is optional; canonical assets may be reused directly. Existing products and justified exceptions retain their established requirements.

Keep the appearance destination clearly labeled at the bottom/end of each main menu, including collapsed and mobile variants, under the [navigation placement requirement](../GUIDE.md#keep-navigation-levels-distinct). Verify access and retained work using [check 47](ui-readiness-checks.md#check-47); focused tools without main navigation need no new menu.

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

Use single-choice semantics for mutually exclusive options. A card can contain a native radio input: retain its accessible name, checked state and keyboard operation. Make the selected card conspicuous with a contrasting status band, explicit state wording and a structural cue; a small checkmark or subtle border-color change alone is insufficient. Use Active/Inactive for immediately applied choices, and Selected/Not selected for choices awaiting application. Make the status area part of the same clickable card without a separate button inside it. Distinguish selection from focus, and avoid repeating the checked-state announcement through decorative footer text. Examples must not contain nested interactive controls. Describe meaningful differences in text; do not promise a specific screen-reader announcement without testing it. Label system-dependent or font-dependent examples as such.

Verify previews against effective rendering, keyboard focus and selection, narrow/enlarged layouts, forced colors and unsaved-work continuity. Our demos use these cards for appearance, text style, text size and spacing; hosts still own preference application. A visual example supplements accessible descriptions, not vice versa.

## Keep associated help beside its subject

Under AUDHD-02, 09 and 11: **If an info/help button explains a line of text, label or image, place it immediately after that subject, preferably on the same line or in the same row.** Keep the subject and button in one layout group and next to each other in reading order; do not leave the button on a detached row or at a distant panel edge. At narrow widths or enlarged text, allow the group to wrap without overlap while preserving a clear association. A persistent explanation may expand below the group.

Give the button a specific accessible name such as “About text style,” retain a visible keyboard-focus indicator and an adequate target, and associate the explanation programmatically. Proximity supplements these semantics; it does not replace them. Verify placement at normal and narrow/enlarged layouts and test keyboard opening, dismissal and focus retention. This is a concrete application of the existing rules, not a new rule ID.

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

## Record administration and recovery

The [runnable administration example](../examples/administration/README.md) connects collection selection, record inspection, contextual editing, field-linked errors, verification and filtered return. Prefer actions attached to the selected record over a raw command-output panel paired with disconnected command forms. Use named secondary destinations when accounts, permissions and credentials become distinct tasks; a small interface need not introduce extra nesting.

On failure, preserve current identity, drafts and useful collection context. Test a successful save followed by failed verification, a newer unsaved draft, and a retry of the saved operation's verification: the retry must not resubmit the mutation or overwrite the newer draft. Check the intended allowed and denied permission paths or actual delivery destination; generic health does not substitute for either. Where no safe verification interface exists, explain that limit and leave the outcome pending.

Keep verification claims tied to the checked record, version and stage. A new save does not inherit the previous version’s verification; where application is separate, that previous result may still describe the running version. Unsaved drafts do not replace verified saved state. Retain unresolved field errors when leaving and returning, clear them when corrected, and keep any draft-reset action scoped to its named record. Return focus to the originating record when it remains in the filtered collection, with a meaningful fallback otherwise. The administration example exercises these distinctions without imposing a storage or routing API.

**Recovery walkthrough:** A service acknowledges an operation and returns an identifier; the follow-up check times out after the user leaves the page. Retain the receipt under its original task/version. Show the acknowledged stage—accepted, saved or completed—and verification pending consistently wherever the result appears. “Retry verification” checks that receipt without sending again; “Send again” is a separate mutation with its own consequences. If the original acknowledgment was lost instead, completion is uncertain and requires reconciliation under the service contract. Test both paths in a controlled fixture, including a late response after navigation and a newer edit.

During visual review, inspect both desktop and narrow task entry. Common work and prerequisites should precede decorative copy and source detail; inactive global actions should not crowd out the selected task. Keep all necessary settings discoverable. Use the Guide's [task-visibility check](../GUIDE.md#prioritize-useful-work), without imposing fixed screen-space quotas.

## Status to control

Operational overviews route users to work: a failed save links to its record, an invalid value links to the revealed field, and saved permissions awaiting verification link to their read-only check. Use the same state owner as the editor; avoid parallel counters that drift after resets or asynchronous responses. Preserve filters and drafts when following links or returning through browser history. Focus the revealed task heading or exact control after rendering, with a surviving fallback if the previous item is filtered out. Appearance changes and background responses must not steal focus.

Follow the Guide’s [language](../GUIDE.md#practical-interface-language) and [overview](../GUIDE.md#status-first-operational-overviews) requirements. A focused editor or preview needs no additional overview. Put intent-focused comments beside state, navigation, persistence and verification boundaries in runnable examples; explain non-obvious requirements without narrating each line.
