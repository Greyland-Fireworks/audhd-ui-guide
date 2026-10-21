# AuDHD friendly interface rulebook and visual standard

**Version:** v1.01 · Updated October 19, 2026

Make tasks easier to understand, resume, inspect and correct. Accessible behavior is mandatory. Appearance is adaptable. Personalization must preserve work, context and operability. This guide combines framework-neutral interaction requirements with selectable light and dark appearances. The rules do not assume a single personality or preferred information density. Apply them alongside your platform's accessibility requirements. See the [overview](README.md) for scope and evidence limits.

## Find what you need

[UI and UX definitions](#ui-and-ux-in-this-project) · [Quick review](#quick-review) · [UX and interaction rules](#ux-and-interaction-rules) · [Tabs and accordion sections](#tabs-sub-tabs-and-accordion-sections) · [Dashboard organization](#dashboard-organization-and-hierarchy) · [Help-writing guidance](#write-help-for-someone-returning-without-context) · [UI visual standard](#visual-standard) · [Adaptable appearance](#adaptable-appearance)

| I need to… | Start here |
|---|---|
| Understand scope, requirements and exceptions | [How to use this guide](#how-to-use-this-guide) |
| Resolve competing requirements or configure emphasis | [Priority hierarchy](#priority-hierarchy-and-conflicts) and [rule emphasis](#rule-emphasis-and-primary-targets) |
| Distinguish UI from UX and their evidence | [UI and UX definitions](#ui-and-ux-in-this-project) |
| Find a rule by ID | [Rule index](#ux-and-interaction-rules) |
| Organize metrics, alerts, tasks and navigation | [Dashboard guidance](#dashboard-organization-and-hierarchy) |
| Choose tabs, sub-tabs or expandable groups | [Tabs and accordion sections](#tabs-sub-tabs-and-accordion-sections) |
| Protect consequential settings without obstructing inspection | [Unlock to edit](#unlock-to-edit-interaction-pattern) |
| Apply consistent controls, layout and visual states | [UI visual standard](#visual-standard) |
| Tailor display or interaction preferences | [Optional preference intake and storage](PREFERENCES.md) |
| Record findings or see concrete applications | [Review template](REVIEW_TEMPLATE.md) and [worked examples](EXAMPLES.md) |

### Start with the difficulty

| Difficulty | Start with |
|---|---|
| I do not remember what this screen does | AUDHD-01, AUDHD-09, AUDHD-10 |
| Everything on this dashboard competes for attention | AUDHD-02, AUDHD-03; [dashboard organization](#dashboard-organization-and-hierarchy) |
| I selected this, but something else happens | AUDHD-04 |
| Did it save? | AUDHD-06 |
| Are these results current? | AUDHD-07 |
| I lost my place | AUDHD-05, AUDHD-10 |
| I cannot find a selected option | AUDHD-03 |
| I cannot read or operate this control | AUDHD-11 |

## Quick review

- Can I tell what I am editing and where the change applies?
- Can I distinguish my chosen value from the value currently taking effect?
- Can I find all relevant choices without losing my place?
- Can I tell whether my work saved, and recover it if saving failed?
- Can I leave and return without reconstructing the task?
- Can I understand what this feature does without remembering how or why I built it?
- Does nearby help explain the purpose and consequences in plain English rather than naming backend code?
- Can I operate it without relying on hover, color or a mouse alone?
- Does the status describe the current item and current evidence?

## How to use this guide

Choose one task and use the quick review to locate the difficulty. Read the relevant rules, then the pattern or UI sections needed for that task. Use the review template to record evidence and gaps; you do not need to apply every technique to every screen.

“Requirement” means the intended behavior when adopting a rule in this guide. It is not a claim that the rule is a formal accessibility criterion. Record an alternative when a platform or task requires one.

Requirements describe outcomes. Examples and optional techniques illustrate ways to achieve them; they do not mandate a new panel, tooltip or confirmation for every control. Start with the [worked examples](EXAMPLES.md) when translating a rule into an interface. Preserve a control that already supports the task well.

Apply checks to the affected task and supported capabilities; read-only work does not require adding editing, saving or recovery features. Record unavailable evidence as pending and genuinely inapplicable checks with a reason. A review does not authorize edits. Follow explicit user instructions and applicable project requirements, recording scoped conflicts or exceptions rather than claiming full adherence.

### Priority hierarchy and conflicts

Apply this hierarchy within the instructions governing the task:

1. **Authorization and applicable constraints:** Stay within authorized scope and applicable accessibility, privacy, permission, retention and platform requirements. Honor system accessibility overrides. A preference does not waive these constraints.
2. **Adopted requirements and correct behavior:** Preserve truthful state, essential consequences, domain behavior, recovery and task continuity where applicable. All adopted requirements remain in force unless an explicit, permissible scoped exception is recorded; rule numbers do not indicate precedence.
3. **Rule emphasis and primary targets:** Use the configured emphasis to allocate inspection and remediation effort. Primary targets guide attention among equally emphasized rules, without excusing other applicable requirements.
4. **Optional implementation techniques:** Choose cards, tooltips, diagrams and other examples to serve the outcomes above. They do not independently require a redesign or a particular component.

This orders decision authority, not the severity of every finding. Prioritize concrete consequences such as lost work, blocked access and misleading state. If requirements compete, record the scope, competing outcomes, chosen alternative, reason, observed impact and review condition; identify unresolved decisions or verification gaps. Do not silently sacrifice one requirement or claim full adherence. Accessible behavior remains mandatory across supported appearances; a skin cannot waive an adopted outcome.

### Rule emphasis and primary targets

Users may assign each stable AUDHD rule an emphasis level and name primary target concepts for a task. Unspecified rules default to **Apply**; existing applicability and requirements remain unchanged.

| Level | Name | Effect on work |
|---|---|---|
| 1 | Consider | Look for useful opportunities; avoid speculative changes without evidence of benefit. |
| 2 | Prefer | Favor this outcome among otherwise suitable approaches. |
| 3 | Apply | Address the rule wherever applicable in the affected scope. |
| 4 | Prioritize | Actively inspect for deficiencies and resolve them within scope; explain competing requirements. |
| 5 | Require | Treat an applicable unresolved deficiency as blocking a claim of completion; explicitly report exceptions and missing verification. |

These levels configure attention and completion scrutiny, not permission to violate requirements. Consider and Prefer do not waive adopted outcomes or excuse known deficiencies. Require makes the completion check explicit; it does not imply that known failures at lower levels may be described as satisfying the Guide. It does not authorize expanded scope, fabricated behavior or unrun checks. Deliver supported work and report a blocked or partially verified result when necessary. A genuinely inapplicable rule remains inapplicable at every level, with a reason.

Primary targets describe the intended focus, such as “complete contextual explanations” and “visible relationships between concepts.” They are not extra rule IDs. Equal levels remain equal; assigning every rule Require is valid but supplies no relative ordering. Do not invent an ordering, force users to lower priorities or interpret higher emphasis as a demand for more UI elements. Use the [preference guidance](PREFERENCES.md#configure-rule-emphasis) for configuration and inheritance.

## UI and UX in this project

These working definitions establish how this guide organizes its advice; they are not a claim that UI and UX are independent disciplines.

| Aspect | Meaning here | Primary home and evidence |
|---|---|---|
| User Interface (UI) | The layer people perceive and operate: layout, typography, labels, controls, visual states, help presentation and accessible semantics. UI includes interaction and nonvisual access as well as appearance. | The [visual standard](#visual-standard) owns presentation and control conventions. Inspect rendered states, semantics and actual operation across supported inputs and layouts. |
| User Experience (UX) | A person's experience of understanding and completing a task over time: orientation, effort, predictability, trust in status, recovery and returning after interruptions. UI is one contributor, alongside system behavior and product policies. | The [interaction rules](#ux-and-interaction-rules) own task outcomes and behavior. Follow complete workflows and involve users where suitability or preference is at issue. |

Keep the guidance in these separate homes, with cross-references for shared concerns. [Dashboard organization](#dashboard-organization-and-hierarchy) applies both: deciding which issue needs attention is a UX priority; making that priority legible through headings, placement and controls is UI work. Accessibility spans both areas.

For example, a readable “Saved” indicator is a UI concern; showing it only after the correct version is acknowledged, retaining work on failure and helping someone recover are UX and behavior concerns. Record a finding as **UI, UX or both**, then identify the implementation layer separately: wording/layout, interaction state, navigation, persistence or business logic. A UI symptom can require a behavior fix. Report the evidence for each aspect independently; visual consistency alone cannot establish a successful experience.

## UX and interaction rules

The 13 stable rule IDs describe task outcomes and the interaction behavior supporting them. They include UI requirements where presentation is necessary to understand or operate the task. Use the [visual standard](#visual-standard) for the shared presentation conventions rather than defining a separate visual treatment for every rule.

- [AUDHD-01 Keep scope and location visible](#audhd-01-keep-scope-and-location-visible)
- [AUDHD-02 Make hierarchy clear without repetitive headings](#audhd-02-make-hierarchy-clear-without-repetitive-headings)
- [AUDHD-03 Offer manageable detail without hiding choices](#audhd-03-offer-manageable-detail-without-hiding-choices)
- [AUDHD-04 Explain effective behavior](#audhd-04-explain-effective-behavior)
- [AUDHD-05 Preserve focus and spatial stability](#audhd-05-preserve-focus-and-spatial-stability)
- [AUDHD-06 Make saving and recovery understandable](#audhd-06-make-saving-and-recovery-understandable)
- [AUDHD-07 Distinguish previews, results and runtime status](#audhd-07-distinguish-previews-results-and-runtime-status)
- [AUDHD-08 Use visuals to support decisions](#audhd-08-use-visuals-to-support-decisions)
- [AUDHD-09 Put essential explanations beside the decision](#audhd-09-put-essential-explanations-beside-the-decision)
- [AUDHD-10 Support interruptions and working preferences](#audhd-10-support-interruptions-and-working-preferences)
- [AUDHD-11 Keep controls readable and operable](#audhd-11-keep-controls-readable-and-operable)
- [AUDHD-12 Validate complete tasks and report actual evidence](#audhd-12-validate-complete-tasks-and-report-actual-evidence)
- [AUDHD-13 Protect consequential edits with scoped safeguards](#audhd-13-protect-consequential-edits-with-scoped-safeguards)

### AUDHD-01 Keep scope and location visible

**Requirement:** Show the current object and the scope of an edit near its controls. Organize around tasks, then related attributes. Allow direct movement between related stages when the task does not require a fixed sequence.

Design for someone who does not remember building or configuring the system, including its original author. A page or section should briefly explain what it is for, which item is selected, what state the work is in and what the available next actions accomplish. Do not assume that a familiar-looking label restores remembered context. Use recorded descriptions and history where available; do not invent reasons for earlier choices.

**Why:** Users should not have to remember which distant selector controls the current form.

**Example:** A shared calendar editor identifies the calendar and whether an edit affects one event or the repeating series.

**Check:** Switch objects, workspaces and accounts where supported. Labels, editable values and previews must refer to the same context. Test delayed responses after a switch.

### AUDHD-02 Make hierarchy clear without repetitive headings

**Requirement:** Use spacing, boundaries and meaningful headings to show relationships. Distinguish parent navigation from local choices. Remove redundant visible headings without removing accessible names or document structure. Use text with unfamiliar icons.

Make task-relevant relationships visible: which controls affect which content, which values describe the same item, and which concepts are parents, peers, inputs, outputs or comparisons. Use meaningful grouping, proximity, alignment, shared scope labels or labeled connections as appropriate. Individually labeled cards are insufficient when their relationship remains unclear. Preserve relationships at narrow widths and with enlarged text, with corresponding semantic structure. Color may reinforce relationships but must not carry them alone.

**Why:** Repetition can increase reading effort without improving orientation.

**Example:** “Project settings” contains a clear “Notifications” section instead of repeating “Settings” above every group.

**Check:** Identify which controls affect which results and which values belong together. Follow those relationships on a narrow screen, with enlarged text and with keyboard navigation; inspect semantic grouping separately. Decorative connections must not obscure controls or imply actions.

**Connected-context example:** A current recording card and its detail panel share an active surface, title accent, repeated identity and structural edge. A directional cue points right in columns and down after stacking. A collection introduction such as “3 recordings:” identifies the actual children. These are optional techniques for the required relationship, not decorations to add to every group. Derive them from the actual object ID, not matching titles. Inspect the connection without color and after reflow.

### AUDHD-03 Offer manageable detail without hiding choices

**Requirement:** Put the immediate task first. Keep advanced settings, history and references in clearly named disclosures when appropriate. Where search is provided, search all eligible choices within its stated scope, including collapsed ones. Show active filters, a reset action and selected values excluded by the current filter.

Inspect the effort created by the workflow itself: repeated decisions, switching between views and interruptions needed to complete a task. Reduce unnecessary reconstruction without hiding useful expert detail. Do not optimize for a minimum click count; a predictable extra step may be easier than a short but ambiguous action.

Where users need to find or revisit items, provide task-relevant recognition cues so they can browse without recalling an exact name, date or identifier. Use descriptive names and visible choices based on meaningful attributes where useful; text search can supplement these cues. Make retained restrictions visible, state the result count and scope, and explain when the current item is outside the filtered results. Changing or clearing filters must preserve the loaded item and its work; selecting another item is a separate action. State which restrictions a reset clears.

Map/date choices, thumbnail previews, pinned comparisons, recently watched lists and autocomplete are optional patterns chosen for the task, not universal requirements. Autocomplete still requires a starting clue; thumbnails need useful text equivalents. History and pins must respect the product's retention and privacy boundaries. See the [recognition-based recording example](EXAMPLES.md#find-a-recording-without-remembering-its-identifier).

**Why:** Reduced clutter must not create invisible state or an apparently incomplete library. Finding an item should not depend solely on remembered identifiers.

**Example:** A filtered tag picker still shows selected tags and an explicit “No tag” choice where omission is supported. Expanding the list does not change selections.

**Check:** Find an item using recognizable attributes without typing an identifier, search for a term in a collapsed choice where supported, then return with a retained filter. Combine filters, reach zero matches, exclude the loaded item and clear the stated restrictions with an unsaved edit. Verify that filter status and empty-result explanations are accurate, and that loaded identity, draft and usable focus survive. Repeat with keyboard operation and narrow layouts; report unavailable checks as pending.

### AUDHD-04 Explain effective behavior

**Requirement:** Name actions by their effect. Distinguish stored preferences, defaults, eligibility and effective behavior. Explain overrides near affected controls. Display accurate totals and units. If probabilities or weights appear, explain what they actually mean.

Use one term consistently for one concept, and different terms for different effects. Replace vague actions such as “Process,” “Apply” or “Resolve” with a specific effect when ambiguity matters. Explain unfamiliar domain terms without losing precision. Keep internal identifiers in optional technical details rather than using them as the only user-facing name.

**Why:** A selected setting may be overridden, and an ambiguous action may do more than its label suggests.

**Example:** “Send notifications” remains selected, but a nearby message says “Paused until 09:00 by your quiet-hours schedule.” A batch button says “Start 5 jobs,” including the reference job.

**Check:** Exercise overrides, unavailable options and boundary cases. Compare the explanation and action label with the actual result. Avoid using one button both to enter a mode and to add another item.

For an already-open item, name the action by its current effect: “Reviewing Harbor morning” can return focus to the open review. Do not imply another selection or save is required. Inspect configuration loaders, schemas, API behavior and permissions before explaining defaults, overrides, units, dependencies or apply/restart effects; a key name alone is insufficient evidence.

### AUDHD-05 Preserve focus and spatial stability

**Requirement:** Preserve focus, selection and scroll position during ordinary edits and saves. Do not reorder items or switch views unexpectedly. If a focused control disappears, move focus to a predictable surviving control. Closing a dialog returns focus to its trigger when available.

**Why:** Unexpected movement forces users to locate their work again.

**Example:** Saving a row leaves it in place. New activity offers “Show new items” instead of shifting the row being edited.

**Check:** Edit, filter, expand, collapse and close help using a keyboard. Repeat during slow responses and errors. Verify that there is no keyboard trap and focus remains visible.

Deliberate page navigation may move focus to a named heading for orientation. Keep keyboard focus visible without forcing a large full-width rectangle after pointer navigation. Browser focus-visible behavior is one technique, not permission to globally remove focus styles. Check pointer, keyboard and assistive-technology behavior separately.

### AUDHD-06 Make saving and recovery understandable

**Requirement:** State what autosaves, what requires Save and where data is stored. Distinguish unsaved, saving, saved, conflict and failed states. Only confirm the version actually saved. Preserve recoverable drafts and offer an explicit retry, undo or recovery path.

Explain recovery boundaries before consequential actions: canceling pending work, undoing a completed action and restoring a saved version are different operations. State what will be replaced and any real expiry of undo. Do not promise recovery the product cannot provide. Use proportionate safeguards rather than adding confirmation to every ordinary action.

When explaining errors, distinguish invalid input, unavailable connectivity, denied permission, failed processing and conflicting edits. State what failed, the practical consequence, what remains intact and an available next action. Do not promise that work is retained or safe to retry unless that is established. See the [error examples](EXAMPLES.md#error-messages-with-useful-consequences).

**Why:** Uncertain persistence creates repeated checking and makes interruption costly.

**Example:** “Draft saved on this device” is separate from “Publish to team.” A failed publish keeps the draft and explains how to retry.

**Check:** Reload, interrupt connectivity, fail storage and edit from another session. An older save response must not mark newer changes saved. Do not imply a browser-local draft is a durable backup.

### AUDHD-07 Distinguish previews, results and runtime status

**Requirement:** Identify loading, empty, failed, stale and current results. Match responses to the selected context. Preserve useful previous results only when clearly marked previous. Distinguish prepared input, running work, finished execution and verified output.

Make uncertainty actionable when possible: “Not checked yet,” “Partially completed,” “Waiting for your approval” and “Waiting for file access” describe different situations. State the next useful action or explain that none is currently required. A generic “Unknown” should not conceal a known reason or recovery path.

For long-running work, distinguish start time, elapsed time and the time status was last checked. Show a relevant deadline with its date and time zone where ambiguity matters. Relative times can help scanning, but provide an exact timestamp when comparison or later review requires it. Mark stalled or stale updates honestly. Do not invent a completion estimate, use unrelated activity as progress or animate a countdown merely to create urgency. Identify unfinished work and whether the user needs to act.

**Why:** Plausible stale output can mislead more than an obvious error.

**Example:** A report says “Generation finished; download verification failed” instead of simply “Success.” A preview identifies the settings used to produce it.

**Check:** Change inputs while a request is pending. Test missing data, zero results and a failed refresh separately. Status announcements should communicate useful changes without narrating every keystroke or progress tick.

### AUDHD-08 Use visuals to support decisions

**Requirement:** Use previews, diagrams, swatches and comparisons when they reduce reading or memory demands. Preserve text equivalents. Keep content colors separate from focus, selection and error cues. Label estimates and approximations.

Preserve useful comparison arrangements, such as an image grid, inspection canvas or side-by-side versions, when reorganizing a screen. Keep the item being inspected, its overall decision and its notes close together; put detailed checks beneath a subordinate heading or divider. Do not replace a useful overview with one-item-at-a-time navigation merely to reduce visible content. Keep each preview, answer and note attached to the same item or version when filtering, sorting or switching views. A presentation change must not fabricate a review judgment or transfer one item's decision to another.

**Why:** A well-labelled comparison can make relationships easier to inspect.

**Example:** A settings review shows “Previous → Proposed” values with a plain-language effect, rather than requiring users to remember the previous screen.

**Check:** Verify meaning without color and with the visualization unavailable. Check whether the visual helps the actual decision rather than adding decoration or implying unsupported precision.

### AUDHD-09 Put essential explanations beside the decision

**Requirement:** Treat detailed, plain-English contextual help as an essential aid to understanding and remembering the interface. Provide tooltips or adjacent, explicitly opened help for unfamiliar controls, settings, statuses and workflows. Explain what the feature does, why someone would use it and what will happen when they act. Do not merely repeat the label or describe the backend implementation.

Deliver complete contextual help within the affected scope. Placeholder text, “coming soon,” generic instructions, repeated labels and backend identifiers alone do not satisfy this requirement. Explain actual meaning, relevant scope and effects supported by established behavior. If behavior cannot be established, identify the specific uncertainty in the implementation report and label relevant uncertainty honestly in the interface; do not invent an explanation or present unfinished help as complete.

Keep scope, save requirements, blocking errors and consequential effects visible without opening help. Tooltips supplement clear labels and visible context; they must not be the only way to discover a critical consequence. Use an expandable explanation or help popover for content too long to read comfortably in a tooltip, or content containing links and other interactions.

#### Choose the help format

| Information needed | Suitable presentation |
|---|---|
| Essential scope, save requirement or consequential effect | Visible beside the action |
| Brief explanation of unfamiliar meaning | Accessible tooltip or nearby help |
| Detailed explanation requiring sustained reading | Expandable section or help panel that stays open |
| Reference links or interactive content | An explicitly opened interactive help component with appropriate keyboard focus and dismissal |

Keep detailed plain-English help available; do not squeeze it into a transient hover box. Choose the smallest presentation that lets someone understand the decision comfortably.

#### Write help for someone returning without context

Include the details needed for the particular decision:

- **Purpose:** What does this control or feature do, in everyday language?
- **Use:** When would someone choose it, and how does it relate to the current task?
- **Effect:** What changes, which items are affected and when does it take effect?
- **Meaning:** What do the values, units or choices mean? Give a concrete example where useful.
- **State and recovery:** What prerequisites or overrides matter, does it save automatically, and how can the user correct or undo the result?

Write connected sentences or short, readable lists. Detail should resolve uncertainty, not become a wall of text. Do not use function names, configuration keys, enum values, file paths or phrases such as “invokes the handler” as the explanation. Put implementation references in separately labelled technical details when the audience needs them. Verify help against actual behavior; mark unknown behavior for investigation rather than inventing an explanation.

Make help discoverable and available with keyboard, pointer and touch where supported. Do not rely solely on hover or the browser's native title tooltip. Let users keep explanations open long enough to read, move the pointer onto them and dismiss them without losing their place. Follow applicable hover/focus behavior requirements.

At narrow widths or enlarged text, stack help beside the task in the reading order or provide an explicitly opened help view. Keep controls reachable and preserve drafts, selection and a predictable return location when opening and closing help; do not let a fixed help overlay cover the action needed to continue.

**Why:** Users need help at the point of uncertainty without losing their place.

**Example:** A “Rebuild preview” button has help saying: “Create a new preview using the settings currently shown. Use this after changing the layout to see the result. Your published page stays unchanged; publishing is a separate action.” Avoid “Calls `rebuild_preview()` with the current config.” The interface still visibly distinguishes previewing from publishing.

**Check:** Without consulting source code or remembered implementation details, explain the feature's purpose, current state and effect using only the interface and its help. Access help with supported input methods, read it at enlarged text size, dismiss it where appropriate and confirm focus is retained. Check the explanation against the action's actual result. Follow [W3C hover/focus guidance](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) for web content.

Use `(i)` for supplementary information, `(?)` for clarification and `(!)` for a genuine warning or limitation when visible help access points are useful. Name each button by its topic, expose its state and keep it operable when the nearby action is disabled. Hover help must be dismissible, hoverable and persistent as applicable; click/tap/keyboard access can expose persistent inline detail. A demo-save warning belongs beside Save and also in visible retention wording. It must distinguish simulated acknowledgment from durable storage. Avoid adding icons when the explanation is already sufficient.

### AUDHD-10 Support interruptions and working preferences

**Requirement:** Preserve useful context and unfinished work within a documented scope consistent with privacy needs. Offer focused and overview layouts when both serve the task. Honor reduced-motion preferences. Avoid decorative flashing, automatic cycling and unnecessary attention-seeking notifications.

Restoring a screen is not enough if its meaning has been forgotten. Provide a concise return summary where useful: what this workspace is for, what was last saved, what remains unfinished and which next actions are available. Distinguish recorded facts from suggestions. Keep contextual help available on every visit rather than limiting explanations to first-use onboarding.

Where useful, let users attach an optional purpose or decision note to saved work. Describe recorded changes meaningfully, such as “Changed the report folder from Downloads to Reports,” rather than “Configuration updated.” Separate user-written reasons from system-generated summaries; history establishes what happened, not necessarily why. Do not require note-taking to complete ordinary tasks.

**Why:** Returning should not require reconstructing the task; one information density will not suit everyone. Selectable appearance and system accessibility constraints are defined in the visual standard.

**Example:** Returning restores the selected document and section, while clearly identifying any stale data. A view preference does not mark content approved.

**Check:** Leave and resume, including after a timeout. Confirm that preferences do not alter content or permissions. Where preservation is inappropriate on a shared device, explain the retention boundary before work is lost.

Appearance changes must preserve current work and context. Offer selectable skins and independent text styles where supported; enjoyable variety is a valid preference. Never infer a diagnosis or prescribe low stimulation, darkness or one information density to everyone. Verify changes during pending work and after leaving and returning.

### AUDHD-11 Keep controls readable and operable

**Requirement:** Support wrapping, text enlargement, visible focus and usable targets at supported widths. Use semantic controls with names, roles and states. Support keyboard operation and applicable assistive technologies. Measure contrast and target sizing rather than assuming a theme passes.

**Why:** Presentation and input changes must not make a task unusable.

**Example:** Choice labels wrap without covering their radio buttons, and a skip link bypasses repeated navigation.

**Check:** Test narrow layout, text scaling, keyboard order and accessible names. Record actual devices and assistive technologies. Untested screen-reader coverage remains pending. The visual standard below provides design defaults, not a substitute for these checks.

### AUDHD-12 Validate complete tasks and report actual evidence

**Requirement:** Review the applicable stages of entry, editing, preview, save, failure, recovery and return as a workflow. Include users when suitability depends on preference. Distinguish implementation, deployment and verification. Keep historical observations dated.

Include a returning-without-memory review: using only the interface and its help, identify purpose, selected scope, what happened, the effect and timing of actions, save state, recovery and available next steps where applicable. Where possible, involve someone unfamiliar with the implementation; an author may unconsciously fill in missing context. Record what the person had to remember or infer and any friction introduced by the proposed fix. Label an agent walkthrough as inspection, not a user study. When user access or execution is unavailable, report supported findings and pending checks without inferring user benefit.

**Why:** A good-looking panel can still be part of a confusing or exhausting task.

**Example:** A local automated test passes, but the deployed interface remains marked unverified until it is checked there.

**Check:** Use the [review template](REVIEW_TEMPLATE.md). Record expected and observed behavior, build, environment and gaps. Do not claim clinical effectiveness, universal suitability or “AuDHD compliance.”

### AUDHD-13 Protect consequential edits with scoped safeguards

**Requirement:** Where accidental edits have meaningful consequences, consider a readable locked state with an explicit “Unlock to edit” action for a named field or group. Do not lock every ordinary field by default; extra steps can themselves be a barrier. An editing lock is not an authorization boundary.

Keep values readable and, where appropriate, selectable and copyable. Treat editing availability, comparison with a reference, persistence and applicability as independent properties: a field can be locked, changed from baseline and saved at the same time. Explain whether editing autosaves, re-locking saves or a separate Save action is required. A lock icon alone proves neither saving nor security.

Name recovery actions precisely: “Copy default value to clipboard,” “Restore last saved value” and “Restore value from before editing” have different effects. Do not silently substitute one for another. Document whether bulk imports or presets replace locked values and whether unlocking survives a reload.

If re-locking promises to save, confirm persistence through an appropriate acknowledgement or verification before claiming success. On failure, preserve the draft, show the failed state and keep a working recovery path.

**Why:** A deliberate editing boundary may prevent mistakes in consequential settings; its benefit depends on the task and the user.

**Example:** A deployment destination is readable but requires unlocking. Nearby descriptive notes remain directly editable.

**Check:** Copy a locked value, unlock one field, edit, change sections, restore, save and reload. Test failure and keyboard access. Verify that safeguards do not prevent emergency correction or create repetitive friction without benefit.

For the detailed transitions, reference values and product decisions, use the [unlock-to-edit pattern](#unlock-to-edit-interaction-pattern).

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

Use [AUDHD-06](#audhd-06-make-saving-and-recovery-understandable) to establish the saving contract before implementing the pattern. Resolve these decisions from the product or mark them proposed or unknown:

- **Save trigger and scope:** Does saving occur while typing, on committed changes, on re-locking or through a separate action? Does it persist one field or the whole form? A local lock action must not imply that other fields were also locked.
- **Destination and evidence:** Is this a local draft, shared record or explicit export? Confirm only the version and destination actually acknowledged or verified. Local write/readback verification does not establish durable backup, domain validity or conflict handling across sessions.
- **Reload and session boundaries:** Which values survive, do fields reopen locked, and is the restoration point temporary? A common choice is to restore saved values with editing locked and discard temporary restoration points; document the chosen behavior rather than implying persisted undo.
- **Intentional replacement:** Can importing, loading a preset or whole-form undo replace locked values? Explain the replacement's scope and what happens to open edits and restoration points. Re-locking affected fields after an intentional replacement is one option; locks protect direct editing, not every authorized replacement operation.

Keep saving feedback truthful to the operation. Do not promise every partially typed value is preserved if saving happens only after a committed change, or invent asynchronous progress for an instantaneous operation. Preserve recovery information after its initial announcement.

### Accessible operation and verification

Include the field's name in each action's accessible name. Use native read-only text controls where suitable to preserve inspection and copying. If a choice control must be disabled, keep its value and reason readable nearby rather than relying on keyboard focus reaching it. Follow the shared [control requirements](#audhd-11-keep-controls-readable-and-operable) and [target, motion and feedback guidance](#targets-motion-and-feedback); keep focus cues independent and announce meaningful action results without rearranging the interface.

Exercise inspect/copy → unlock → edit → navigate away and back → restore → re-lock → reload against the chosen contract. Where supported, also test independent open fields, inactive dependencies, intentional bulk replacement, save failure or conflicting responses, clipboard failure, keyboard operation, narrow layouts, enlarged text and accessibility overrides. Check that a restoration point survives intermediate saves and that failure does not falsely close a save-dependent editing session. Record observed results separately from planned checks and user feedback; another product's tests do not verify this implementation. Assess whether the safeguard's added steps are justified for the people and task involved.

## Dashboard organization and hierarchy

Apply AUDHD-01 through AUDHD-05, AUDHD-07, AUDHD-09 and AUDHD-10 to the dashboard's complete workflow. Establish a clear reading order: **where I am → what needs attention → what the summary means → what I can do → supporting detail**. This is a starting arrangement, not a mandatory set of panels. A monitoring dashboard may prioritize status; a work queue may prioritize tasks. Omit layers that do not serve the task.

[Page layers](#organize-the-page-by-purpose) · [Navigation levels](#keep-navigation-levels-distinct) · [Updates and responsive hierarchy](#preserve-hierarchy-as-the-dashboard-changes)

### Organize the page by purpose

| Layer | What belongs here | Hierarchy and behavior |
|---|---|---|
| Page context | Page purpose, current workspace or object, selected period and scope | Use one clear page title and nearby context. State whether filters affect the whole page or only one panel. Keep the selected scope visible when navigation collapses. |
| Alerts requiring attention | Problems that affect the current task, their consequences and available next actions | Place urgent blockers before affected work; keep local problems beside their panel. Rank by consequence and urgency, not arrival time or bright color. Use explicit severity text; routine success messages must not compete with failures. |
| Summary metrics | Values needed to assess the current situation or choose the next task | Group related measures under meaningful headings. Give each value a label, unit, period and relevant comparison or denominator. Show freshness and scope; distinguish zero from unavailable or loading. Do not present stale or partial totals as current complete results. |
| Task panels | The work users came to perform, with related inputs, results and actions | Name panels by task. Keep the current item, primary decision, notes and feedback together. Make the next action visually distinct without making every panel equally prominent. Separate monitoring from editing where they are different tasks. |
| Secondary information | History, diagnostics, definitions, references and optional metadata | Use subordinate headings, a supporting column or clearly named disclosures. Keep blocking errors, unsaved state, selected values and essential consequences visible beside the work. Secondary information must remain readable and discoverable. |

Use visual weight deliberately: page title, section heading, item title, then supporting text. Related panels share spacing, boundaries and terminology; unrelated tasks have clear separation. Color may reinforce grouping but must not carry it alone. Avoid a wall of equally emphasized cards, repeated generic headings such as “Overview,” or oversized metrics that conceal the action users need.

### Keep navigation levels distinct

- Separate application or workspace navigation, page or task navigation, and choices within a panel. Give each level a distinct location and meaningful label; avoid visually identical rows of nested tabs with unclear ownership.
- Show the current location and selected destination at each relevant level. Use breadcrumbs when they clarify a real parent path; do not add a navigation level merely to fill a layout.
- Keep navigation separate from actions and filters. “Reports” opens a destination; “Generate report” starts work; “Last 7 days” changes the displayed period. Their effects should be apparent before activation.
- Changing a local tab or expanding details must not silently switch workspace, reset unrelated filters or discard edits. Preserve context within privacy boundaries, and explain unavailable destinations rather than silently selecting another.

For pattern choice, context retention, hidden errors and accessible operation, use the dedicated [tabs, sub-tabs and accordion guidance](#tabs-sub-tabs-and-accordion-sections).

### Authoritative navigation and repeated orientation

For a multi-page workspace, derive page labels, destinations and canonical ancestry from authoritative page records. A browsable index puts summaries up front and detailed material on destination pages. Keep top and bottom breadcrumb copies accurate and consistent on destination pages, with named navigation landmarks and a bypass for repeated navigation. Do not invent parents from browser history or treat a local tab as a parent page.

Workspace links select destinations; local tabs select views of the same object. Keep their scope apparent without repeating two full navigation bars: the reference uses a compact footer disclosure alongside the bottom breadcrumb. Preserve ordinary link behavior, stable IDs, Back/Forward, direct links and truthful unavailable-page handling. Permissioned products must derive navigation from authorized destinations.

The [reference specification](examples/recording-review/SPEC.md) demonstrates canonical ancestry. Multiple-category membership and hover/focus cross-highlighting remain a proposed extension, not an implemented capability or an adopted navigation schema. Membership alone cannot establish a unique parent; contextual paths need a deterministic direct-link policy before implementation.

### Preserve hierarchy as the dashboard changes

Keep a predictable panel order during refreshes. Update values in place; do not automatically sort panels or move the focused task when new data arrives. Surface urgent new conditions without stealing focus or repeatedly announcing every counter change. Explain what dismissing an alert does; hiding a message must not imply that its underlying problem was resolved. Keep unresolved blockers visible at the affected task.

Use the shared [typography and layout guidance](#typography-and-layout) for panel stacks, control alignment and responsive help. Preserve a logical heading, reading and keyboard order when dashboard columns collapse; do not create a visual order that contradicts the underlying document order.

Offer density choices where useful, without hiding ordinary expert work as “advanced.” Keep optional history and metadata from dominating the workspace, but do not shrink text or remove necessary controls to make the dashboard appear simpler.

**Check:** Ask a returning user to identify the current scope, most consequential issue, meaning and age of a summary value, and next available task using only the page. Change global and local filters, switch navigation levels with an unsaved edit, introduce an unavailable metric and a new alert during refresh, and expand secondary details. Repeat with keyboard navigation, enlarged text and a narrow layout. Verify that scope, focus, panel order, drafts and access to relevant information remain understandable. Record untested behavior; a screenshot alone cannot establish these outcomes. See the [dashboard example](EXAMPLES.md#dashboard-from-summary-to-action).

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

### Preserve context and surface hidden problems

Switching tabs or collapsing a section changes the view, not the meaning, approval or saved state of its contents. Preserve drafts, selections, relevant filters and useful position within privacy and retention boundaries. Where helpful, remember the selected child for each parent. Bind retained state to the correct object or workspace; do not carry one record's draft into another. Explain any required save, discard or session-expiry boundary before work is lost.

Keep object identity, overall save scope and consequential actions outside hidden panels when they apply across the workspace. Distinguish “Save delivery settings” from “Save all settings”; explain whether hidden changes are included. Use visible unsaved or error summaries on the relevant tab or accordion header when needed, with text rather than color alone. Do not imply that a collapsed group is valid or saved just because its fields are out of view.

If validation or a save fails in a hidden panel, show a persistent, accessible summary in the current context that identifies the group and provides a route to the affected field. Reveal every containing tab and accordion section before focusing that field; associate the error with it. If the field is unavailable or access has changed, explain the obstacle and provide an appropriate fallback. Never leave a disabled Save button with its only explanation hidden. Preserve all other entries and the user's context as far as the task permits; a background error must not unexpectedly switch panels or steal focus. A deliberate “Go to error” action may reveal the target and move focus.

### Operate accessibly across layouts

For web tab widgets, follow the [W3C APG tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): provide a named tab list, associated tabs and panels, and accurate selected state. Tab enters the active tab and then proceeds into the panel or onward; arrow keys move among tabs according to orientation. For manual activation, Enter or Space opens the focused tab. Automatic activation is suitable only when panels appear without noticeable delay. Keep nested tab lists independently named and their key handling local to the active list.

For custom web accordions, follow the [W3C APG accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): use heading buttons with accurate expanded state and panel relationships. Enter or Space toggles the section; normal Tab navigation reaches visible controls. Native disclosure controls may be suitable when their semantics fit the task. Use platform equivalents in native applications. These are implementation references, not proof of accessibility conformance.

Keep hidden panel controls out of keyboard navigation and the accessibility tree while hidden, without erasing their data. Preserve a visible focus cue independent of selection or expansion. If a panel containing focus closes, move focus to its controlling tab or disclosure button before focus is lost. At narrow widths and enlarged text, keep every tab reachable with readable labels; avoid clipped options or ambiguous multi-row hierarchy. If tabs become accordions responsively, preserve content, drafts and a meaningful location, update semantics to match the new controls, and avoid duplicate accessible copies.

**UI checks:** Operate parent tabs, sub-tabs and accordion controls with keyboard and supported touch input. Inspect names, relationships, selected/expanded states, hidden content, focus and narrow/enlarged layouts. **UX checks:** Find a setting without remembered context, edit across groups, switch parents and return, compare open sections, and trigger a validation failure inside nested hidden content. Check save scope, draft retention and the route from error summary to field. Record actual evidence and pending coverage. See the [worked example](EXAMPLES.md#settings-workspace-tabs-and-accordion-sections).

## Visual standard

This is the **UI standard**: presentation, control semantics and observable states that support the UX rules. Make scope, hierarchy, selection, focus and work state visible. Support accessible light and dark appearances within adoption scope. Neither is inherently better for every AuDHD person. Preserve platform accessibility overrides and verify the actual supported appearances.

Record which interfaces or components are in adoption scope. A focused wording or interaction fix does not authorize an application-wide theme migration. If scope is unclear, identify that decision before making broader theme changes; continue the bounded review and document any scoped exception.

[Controls and states](#functional-requirements) · [Typography and layout](#typography-and-layout) · [Label, clarify and show](#label-clarify-and-show) · [Adaptable appearance](#adaptable-appearance) · [Color and group cues](#color-and-redundant-group-cues) · [Targets, motion and feedback](#targets-motion-and-feedback) · [Verification](#verification)

### Functional requirements

| Role | Required distinction |
|---|---|
| Current workspace | Named context and a persistent selected state |
| Heading | Meaningful hierarchy; does not look like an action unless interactive |
| Selection | Text, shape, marker or border in addition to color |
| Keyboard focus | Independent visible cue, including on selected controls |
| Hover | Temporary feedback that does not obscure selection or focus |
| Disabled action | Understandable label and an accessible explanation when the reason matters |
| Changed value | Static indicator separate from save status |
| Saving or failure | Explicit text tied to the affected work |
| Content preview | Cannot be confused with interface status colors |

Use native radio buttons for exclusive choices, checkboxes for independent toggles and appropriate selectors for longer lists. Do not replace familiar controls solely to fit a theme. Expose names, roles and states through the platform's accessibility APIs.

Keep headings and form labels semantic: use appropriate heading levels, labels and group legends rather than styling plain text to look equivalent. Connect each label to its control and give related choices a meaningful group name. Non-interactive headings retain a normal reading cursor and must not suggest a clickable action.

Expose selection through the control's actual state, such as native checked state or the appropriate selected/pressed state for that component. A bright primary action indicates what can be done; it must not imply that the action has already run or that a choice is saved. Disabled controls retain readable labels and actual disabled semantics; gray styling alone does not disable an action. Keep an explanation of an important unavailable action accessible without requiring focus on a disabled control.

### Typography and layout

- Use relative sizing and platform text preferences. As an initial web design choice, try body text around 1rem with approximately 1.5 line height, then test actual content and users. These are design starting points, not universal accessibility thresholds.
- Use a small, consistent heading hierarchy. Avoid all-caps paragraphs and unnecessarily compressed labels. Keep instructions in plain language with technical detail available nearby.
- Keep related values, actions and feedback close together. Separate editing, reference material and monitoring when they represent different tasks.
- Use consistent spacing or indentation to reinforce named groups, with optional family colors as an additional cue. Keep primary decisions more prominent than detailed questions. A compact typography exception in one component must not become the default for ordinary labels, disclosure triggers or expanded content.
- For comparable questions in a row, align answer controls using layout sizing and allow sufficient label space. A two-line label area can be a starting point, but must grow for longer text or translation. Use independent vertical stacks for unrelated content of different lengths; do not force every row to match the tallest unrelated description. Apply these principles to forms and review screens as well as dashboards.
- Start with component gaps around 0.5–1rem and panel padding around 0.75–1.25rem. Adjust for density and input method without shrinking text to fit a desktop layout onto a phone.
- Permit wrapping and vertical growth. Use logical start/end alignment so layouts can support right-to-left languages. Do not insert blank text merely to align rows.
- Offer compact and comfortable layouts only where both are useful and maintain accessibility. Do not impose a universal maximum number of visible choices.

### Label, clarify and show

For each meaningful information group, use **label → explanation when needed → related value, visual or control**. Keep these elements visually grouped with consistent spacing and typography. Use a small, consistent type scale and weights; intentional user-selectable fonts may vary without changing that hierarchy. Apply AUDHD-02, AUDHD-09 and AUDHD-11, including semantic headings, associated control labels and descriptions.

The label identifies what this is; an explanation resolves ambiguity; the content supplies the information or action. Keep essential meaning visible without relying on color, icons, placeholders or hover. A border or card is optional; spacing, table structure or a field group may express the relationship better. Do not require a subheading for obvious labels, fragment useful prose or comparisons, or repeat explanations unnecessarily. Concise summaries supplement rather than replace required detailed contextual help.

Use meters for bounded quantities and charts for meaningful relationships, trends or comparisons. Keep explanations and missing evidence plainly labeled in text. Inspect the rendered group and opened help; separately inspect accessible associations. See the [timing and search example](EXAMPLES.md#timing-and-search-label-clarify-and-show).

### Adaptable appearance

Accessible behavior is mandatory; skins are user-selectable. Light and dark palettes are ordinary choices, not accessibility exceptions. Provide discoverable appearance choices where supported; preserve system forced colors and reduced motion. A focused change does not authorize a whole-application reskin. Use [preferences](PREFERENCES.md) for intake, inheritance and storage.

Fun, personal expression and renewed interest are legitimate design objectives alongside readability and comfort. Offer useful palette and text-style variety without automatic rotation or a claim that one preset is AuDHD-ideal. Keep text style independent of skin when supported. Use a coherent heading/label/value hierarchy with intentional font choices, relative sizing and fallback fonts; user-selected styles must not remove labels, clip content or obstruct browser enlargement.

Use semantic roles for page/panel surfaces, reading text, controls/actions, active context, keyboard focus, status and chart data. The [22-skin preview](examples/skins/README.md) supplies reusable examples and checks. Its names, colors, fonts and numerical dimensions are reference choices, not mandatory product branding or a contrast certification.

Reserve an **active-context accent and surface** for the current working object and associated detail area. Both ends should share identity, title treatment and structural cues where useful. Do not tint an entire unrelated collection to imply that every item is current. Keyboard focus remains independently visible when it enters or leaves that context; action, success, warning, error and chart categories have separate meanings. Multiple navigation levels can each have a current state. Use text, borders or other structure when system colors collapse hue differences.

Apply appearance changes without remounting working forms, clearing drafts, changing record identity, losing pending save acknowledgments, moving focus or resetting filters and local views. System appearance changes have the same continuity obligation. Show requested versus effective choices when a preference is unsupported; storing or exporting it does not mean it was applied.

Measure foreground/background combinations in their actual states. Essential control boundaries need appropriate non-text contrast; decorative separators are not interchangeable with them. Selection may use a fill plus an edge; focus may use an offset outline. Exact widths are optional, but outlines must remain visible and unclipped. Evaluate overlays against underlying content, and retain native check/radio marks. Avoid tint or shadows as the only indication.

For charts, preserve category identity across skins, use sequential ramps for quantities and an explicit center for diverging scales, and distinguish missing data from zero. Supply labels, markers/dashes or patterns plus a usable data equivalent. Canvas adapters must redraw resolved tokens after appearance changes; CSS alone does not provide chart semantics or keyboard operation. Test adjacent marks and labels as well as tokens against the plot surface.

### Color and redundant group cues

Use consistent color families to connect related information, controls and settings when this helps orientation. Pair them with meaningful text and stable grouping; add shapes, markers, line styles or restrained patterns where useful. A legend should explain mappings near the work, and the same concept should keep its identity across tabs, charts and summaries. Keep category colors separate from error, focus and selection semantics.

Do not assume every user distinguishes colors the same way or wants patterns. Color-vision differences can be supported by multiple redundant cues; pattern coding is an option, not a universal substitute for color. For example, label “Delivery” items consistently, give them a circular marker and optional diagonal chart hatching; use a labeled square and optional dotted fill for “Access.” Avoid dense patterns behind text or patterns so similar or small that they become indistinguishable. Preserve plain text/semantic equivalents for people who cannot perceive either cue.

Follow [W3C's use-of-color guidance](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): information must not depend on color alone. Test actual contrast, enlarged text and forced colors; check whether grouping and status remain understandable without color and whether patterned charts remain readable. Simulation can help find issues but does not replace user feedback or accessibility checks. Offer previewable cue preferences using [the preference guidance](PREFERENCES.md).

### Targets, motion and feedback

Prefer generously sized targets, especially for touch; 44 × 44 CSS pixels is a useful design target where practical. It is not a claim that WCAG AA universally requires that size. WCAG 2.2 distinguishes [minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) from [enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), with their own conditions and exceptions.

Keep change and status indicators static by default. Honor reduced-motion preferences without removing information. Avoid pulsing warnings, automatic carousels and animated decoration in work areas. Provide deliberate controls for useful animation, playback and updates.

Use concise status text close to the relevant action. Important errors remain until resolved or deliberately dismissed; do not rely only on brief toast messages. Announce meaningful asynchronous changes through the platform's accessible status mechanism without repeatedly interrupting the user.

### Verification

Check real screens at supported widths, enlarged text, keyboard focus and selected states, reduced motion and forced colors where supported. Verify contrast, target sizing and accessible names against applicable criteria. Check localization and long labels. Exercise the complete affected task, including save and recovery when persistence is involved; for read-only tasks, check relevant loading, failure and return states. A screenshot cannot establish interaction correctness.

Check each affected mode or screen rather than assuming a shared style change works everywhere. Confirm labels remain connected to controls, headings and legends retain their meaning, answer rows align without clipping, selection survives hover and focus remains independently visible. Operate affected choices, tabs, disabled actions and save controls. For comparison or review tools, filter, reorder and switch items, then save and reload where applicable; verify that notes, judgments, settings and preview identities still belong to the correct records. Record any mode not exercised as pending.

Record results with the [review template](REVIEW_TEMPLATE.md). Record appearance coverage, usability observations and accessibility conformance separately. Test supported light/dark appearances and system overrides; do not infer usability from palettes or two matching implementations.

## Maintaining the rules

Keep IDs stable. Record requirement changes in a version history. Use product-specific appendices for domain rules, density choices and exceptions rather than embedding them in this shared guide. An exception records its scope, reason, alternative, observed impact and review condition. Existing gaps do not authorize unrelated rewrites.

### Version history

- **v1.01 draft update — October 20, 2026:** Expanded AUDHD-03 with recognition-based discovery, visible retained filters and reset continuity. Added a recording example, skill routing and evaluation case E35 under the existing 13 rule IDs. Discovery patterns remain optional; all 35 model outcomes remain pending.

- **v1.01 — October 19, 2026:** Replaces mandatory dark appearance with accessible selectable light/dark skins, strengthens relationships/navigation/help/continuity under the existing 13 rules, and adds version-2 profiles and independent runnable references. See [evidence and limits](references/evidence-and-limits.md); model evaluations remain unrun.

- **1.01 draft — October 18, 2026:** Added explicit priority hierarchy, five-level rule emphasis, primary targets, complete-help and visible-relationship requirements, and a shared label/clarify/show pattern under existing rule IDs. Low emphasis does not relax adopted requirements. Editorial checks do not constitute model, runtime or user validation; existing evaluation outcomes remain pending.

- **1.0 draft — October 17, 2026:** Initial practitioner draft combining interaction rules, mandatory dark visual standard, and detailed plain-English help for returning without remembered context.
  - Expanded dashboard guidance for metrics, alerts, task panels, navigation levels and secondary information, with a worked example. Expanded task-oriented grouping and layout principles; project-specific branding and typography exceptions are not adopted. This adds application guidance under existing rule IDs; dashboard reviews should check these cases where relevant.
  - Completed the source-standard comparison and added project-independent guidance for comparison identity, responsive help, form grouping and alignment, action/selection distinctions, shared visual tokens and verification across affected modes. Existing rule IDs remain stable; recheck these behaviors when their presentation changes.
  - Defined UI and UX, separated their guidance and evidence, consolidated repeated layout advice, clarified optional search and task-scoped verification, and expanded the review record. This is an editorial consistency review; model evaluations and user validation remain pending.
  - Aligned skill usage, adoption scope, evidence limits and evaluation records across the supporting documents. The then-current 16 scenarios remained unrun; coverage limits are documented in the evaluation procedure.
  - Added tabs, sub-tabs and accordion guidance, a settings-workspace example and four evaluation cases (E17–E20). The evaluation pack now contains 20 unrun scenarios.
  - Added redundant color/group cues and optional individual preference intake, with a documented fictional JSON profile. Added three worked examples and six evaluation scenarios (E21–E26) for intake, profile handling, privacy and overrides. All 26 model outcomes remain pending; no runtime preference effects have been tested.
  - Reviewed personalization consistency: clarified full profile structure, skipped updates, array replacement, clearing/inheritance, data-only handling and private recovery copies. Expanded existing cases without changing their IDs or claiming behavioral validation.
