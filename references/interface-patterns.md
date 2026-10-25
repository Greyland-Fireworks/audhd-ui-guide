# Interface-pattern lookup

Use the task, not the component name alone, to select checks. Read the linked [Guide rules](../GUIDE.md#ux-and-interaction-rules) when applicable; these prompts do not redefine them. Techniques are optional and findings require evidence.

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

## Visual choices in settings

Under AUDHD-02, 03, 05 and 11, when a choice changes a visible property, show a representative example beside its label. Keep the choice understandable without relying on the example alone. This pattern arose from individual feedback on our recording demos; it is not a new rule ID or a validated universal layout requirement.

| If a choice changes… | Show… |
|---|---|
| A color | A swatch and a meaningful label |
| A palette | Color bands and a small surface showing text, action and selection relationships |
| Text size or typography | The same phrase rendered using each option |
| Spacing, margins or thickness | Identical content with the actual difference visible |

Apply [AUDHD-02](../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings) to independent option groups: can a reviewer identify each group, its effect and its active choice without clicking? In our recording settings, Text style, Text size and Spacing use labeled sections and greater separation between groups than between their options; borders are one implementation choice. Inspect the distinction across themes, density settings and enlarged text.

Apply [AUDHD-11](../GUIDE.md#audhd-11-keep-controls-readable-and-operable) to preview accuracy and application scope: compare the demonstrated properties with what actually changes. Our spacing previews show padding and gaps, and their descriptions explicitly exclude line-height changes. Verify the promised elements, keyboard focus and usable controls in each supported setting; a screenshot alone cannot establish that application works.

For long optional choice collections that push other tasks out of view, consider a clearly named disclosure with the current choice visible in its collapsed summary. Label the action explicitly (for example, Show/Hide appearance choices), and retain a compact representative visual when the current value describes appearance. Our appearance bank starts closed; opening and closing it does not change the applied theme. Keep the choices keyboard reachable when expanded and verify that collapse does not hide an error or required next step.

Use single-choice semantics for mutually exclusive options. A card can contain a native radio input: retain its accessible name, checked state and keyboard operation. Make the selected card conspicuous with a contrasting status band, explicit state wording and a structural cue; a small checkmark or subtle border-color change alone is insufficient. Use Active/Inactive for immediately applied choices, and Selected/Not selected for choices awaiting application. Make the status area part of the same card selection target without a nested button. Distinguish selection from focus, and avoid repeating the checked-state announcement through decorative footer text. Examples must not contain nested interactive controls. Describe meaningful differences in text; do not promise a specific screen-reader announcement without testing it. Label system-dependent or font-dependent examples as such.

Verify previews against effective rendering, keyboard focus and selection, narrow/enlarged layouts, forced colors and unsaved-work continuity. Our demos use these cards for appearance, text style, text size and spacing; hosts still own preference application. A visual example supplements accessible descriptions, not vice versa.

## Keep associated help beside its subject

Under AUDHD-02, 09 and 11: **If an info/help button explains a line of text, label or image, place it immediately after that subject, preferably on the same line or in the same row.** Keep the subject and button in one layout group and adjacent reading order; do not leave the button on a detached row or at a distant panel edge. At narrow widths or enlarged text, allow the group to wrap without overlap while preserving a clear association. A persistent explanation may expand below the group.

Give the button a specific accessible name such as “About text style,” retain a visible keyboard-focus indicator and an adequate target, and associate the explanation programmatically. Proximity supplements these semantics; it does not replace them. Verify placement at normal and narrow/enlarged layouts and test keyboard opening, dismissal and focus retention. This is a concrete application of the existing rules, not a new rule ID.
