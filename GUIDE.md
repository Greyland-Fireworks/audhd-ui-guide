# AuDHD friendly interface rulebook and visual standard

**Version:** v1.01 · Updated October 19, 2026

Make tasks easier to understand, resume, inspect and correct. Accessible behavior is mandatory. Appearance is adaptable. Personalization must preserve work, context and operability. This guide combines framework-neutral interaction requirements with selectable light and dark appearances. The rules do not assume a single personality or preferred information density. Apply them alongside your platform's accessibility requirements. See the [overview](README.md) for scope and evidence limits.

## Find what you need

[UI and UX definitions](#ui-and-ux-in-this-project) · [Quick review](#quick-review) · [UX and interaction rules](#ux-and-interaction-rules) · [Tabs and accordion sections](references/interface-patterns.md#tabs-sub-tabs-and-accordion-sections) · [Dashboard organization](#dashboard-organization-and-hierarchy) · [Help-writing guidance](#write-help-for-someone-returning-without-context) · [UI visual standard](#visual-standard) · [Adaptable appearance](#adaptable-appearance)

| I need to… | Start here |
|---|---|
| Understand scope, requirements and exceptions | [How to use this guide](#how-to-use-this-guide) |
| Resolve competing requirements or configure emphasis | [Priority hierarchy](#priority-hierarchy-and-conflicts) and [rule emphasis](#rule-emphasis-and-primary-targets) |
| Distinguish UI from UX and their evidence | [UI and UX definitions](#ui-and-ux-in-this-project) |
| Find a rule by ID | [Rule index](#ux-and-interaction-rules) |
| Organize metrics, alerts, tasks and navigation | [Dashboard guidance](#dashboard-organization-and-hierarchy) |
| Choose tabs, sub-tabs or expandable groups | [Tabs and accordion sections](references/interface-patterns.md#tabs-sub-tabs-and-accordion-sections) |
| Protect consequential settings without obstructing inspection | [Unlock to edit](references/interface-patterns.md#unlock-to-edit-interaction-pattern) |
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

For “if it is a button, confirm…” checks, use the [component review matrix](references/component-review-matrix.md) and its [detailed readiness checks](references/ui-readiness-checks.md) for breadcrumbs, contextual help, controls, recovery and returning to work. Select applicable checks and exercise transitions as well as static states, then verify the complete task outcome. These references apply the existing rules without adding a separate standard or scoring system.

“Requirement” means the intended behavior when adopting a rule in this guide. It is not a claim that the rule is a formal accessibility criterion. Record an alternative when a platform or task requires one.

Requirements describe outcomes. Examples and optional techniques illustrate ways to achieve them; they do not mandate a new panel, tooltip or confirmation for every control. Start with the [worked examples](EXAMPLES.md) when translating a rule into an interface. Preserve a control that already supports the task well.

Apply checks to the affected task and supported capabilities; read-only work does not require adding editing, saving or recovery features. Record unavailable evidence as pending and genuinely inapplicable checks with a reason. A review does not authorize edits. Follow explicit user instructions and applicable project requirements, recording scoped conflicts or exceptions rather than claiming full adherence.

Measure coverage by the requested user goals and observable outcomes, alongside necessary setting or data accounting. Connecting a data source, declaring desired state, inspecting records and managing records are different capabilities; editable fields alone do not establish a complete workflow. Use supported application interfaces within authorization. Distinguish source-declared, runtime-recognized, platform-applicable, editable and behavior-verified status; explain known unavailability before an attempted action. Verify the intended result, such as persistent effective settings, allowed and denied access, or delivery to the intended destination. Startup health and generic round trips cannot establish unrelated outcomes. Keep evidence compact and report missing dependencies or checks as Pending.

Distinguish a saved mutation, an operational runtime and a verified task outcome. When a mutation succeeds but verification fails, preserve the saved identity/version and newer draft; offer a read-only verification retry when supported rather than repeating the mutation. Stop with an honest pending result when the outcome cannot be established. Errors should provide a route to reveal and focus the affected control without discarding unrelated work. The [record-administration example](examples/administration/README.md) demonstrates these transitions in a labeled simulation.

### Priority hierarchy and conflicts

Apply this hierarchy within the instructions governing the task:

1. **Authorization and applicable constraints:** Stay within authorized scope and applicable accessibility, privacy, permission, retention and platform requirements. Honor system accessibility overrides. A preference does not waive these constraints.
2. **Adopted requirements and correct behavior:** Preserve truthful state, essential consequences, domain behavior, recovery and task continuity where applicable. All adopted requirements remain in force unless an explicit, permissible scoped exception is recorded; rule numbers do not indicate precedence.
3. **Rule emphasis and primary targets:** Use the configured emphasis to allocate inspection and remediation effort. Primary targets guide attention among equally emphasized rules, without excusing other applicable requirements.
4. **Optional implementation techniques:** Choose cards, tooltips, diagrams and other examples to serve the outcomes above. They do not independently require a redesign or a particular component.

This orders decision authority, not the severity of every finding. Prioritize concrete consequences such as lost work, blocked access and misleading state. If requirements compete, record the scope, competing outcomes, chosen alternative, reason, observed impact and review condition; identify unresolved decisions or verification gaps. Do not silently sacrifice one requirement or claim full adherence. Accessible behavior remains mandatory across supported appearances; a skin cannot waive an adopted outcome.

### Allocate effort by outcome value

Within the hierarchy above, prioritize working, understandable completion of the requested tasks. Use consequence, task relevance, available evidence and added burden to decide where inspection and remediation effort will help most. Correct behavior, accessible operation, truthful state and preservation of work remain constraints; they cannot be offset by successes elsewhere. Configured emphasis directs attention within those constraints, not a numerical score to maximize.

Give supporting work weight according to its contribution: discovery, explanations, relationships and recovery support task completion; inventories, maps and source references support those outcomes and their verification. Preserve evidence needed to substantiate coverage and behavior, but choose its smallest useful representation and reuse existing records. Produce separate diagrams or reference pages when requested or when they materially clarify relationships, decisions or maintenance. More nodes, fields, prose or artifacts do not establish greater completeness. Optional decoration has lower value unless it improves the requested experience; readable typography and clear control states serve operability and are not merely decoration.

Scale presentation, not required capability or necessary checks. An omitted optional artifact is not a functional gap; an unimplemented requested workflow or unverified required outcome is. Collect enough evidence to implement correctly, then verify representative end-to-end tasks and relevant failure paths before spending effort on elaborate supporting presentation. This is an allocation principle, not a rigid sequence: investigate dependencies first when correctness requires it. State material uncertainty and partial results rather than letting documentation stand in for working behavior.

### Choose a runtime proportional to the task

When implementation or verification requires running the application, compare its supported startup methods and inspect the available runtime before adding dependencies. Prefer the method that satisfies the requested behavior and verification with the fewest additional dependencies and environment changes. Check for an existing compatible installation or an official version-matched runnable distribution before introducing a compiler toolchain, container platform or additional services. Confirm version and platform compatibility; a source checkout alone does not establish that an executable is installed or a service is running.

Require a concrete task reason for extra infrastructure, such as testing source changes that require a rebuild, reproducing a required deployment environment or meeting an isolation requirement. A familiar tool or supplied deployment file alone does not establish that need. Honor explicit user choices and established project requirements; fewer dependencies must not reduce functional scope or required verification. If a startup method is unavailable, reassess supported alternatives before expanding setup or troubleshooting. Explain consequential choices briefly in the existing plan or result; no separate report or approval step is required.

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

These rules supply defaults for relevant design and implementation decisions before the first version is presented. Apply them within the requested scope; depart when an established task need or user constraint justifies it, and briefly explain material departures. Do not add components merely to demonstrate a rule. Verify both the visible outcome and behavior; a default is not evidence of user benefit.

### AUDHD-01 Keep scope and location visible

**Requirement:** Show the current object and the scope of an edit near its controls. Organize around tasks, then related attributes. Allow direct movement between related stages when the task does not require a fixed sequence.

Make each destination answer “Where am I and what am I doing here?” on entry and return. Its heading, selected navigation and visible context should identify the subject, purpose and current scope, with task state and next actions clear. Design for someone who does not remember building or configuring the system, including its original author. Do not assume that a familiar-looking label restores remembered context. Use recorded descriptions and history where helpful; do not invent reasons for earlier choices.

Name both the system being managed and the current task through the heading and its visible context. “Report delivery server — Overview” establishes more than “Local server.” Within that established scope, “Delivery settings” or “Users & permissions” can be sufficient. Keep instance names and deployment details as supporting context; neither “Local server” nor “Server overview” alone explains what an unfamiliar server is for. Define domain roles where needed rather than assuming everyday words such as “topic” or “subscription” have only one meaning.

Update the location cue when the task or child destination changes. An environment label such as “Test workspace” identifies scope, not the current page. Headings, selected navigation and any breadcrumbs must agree on the actual destination, including after search, direct links and Back/Forward. A child task may share its parent's heading if a clear child title and selected state identify the current work; extra breadcrumbs or repeated titles are not required.

Labels should make subject and purpose clear in context; each label need not repeat both. A destination names a view or task, a button names an action, and a field names the value being entered. “Username” within a user editor or “Permissions” under Users can be sufficient. Preserve clear accessible names and associations when using shared context. Add words when they resolve ambiguity; do not mechanically repeat the page title or add an introduction to every control.

**Why:** Visible purpose and scope reduce the effort of reconstructing the task. Users should not have to remember which distant selector controls the current form.

**Example:** A shared calendar editor identifies the calendar and whether an edit affects one event or the repeating series.

**Check:** Enter a destination directly and return after an interruption. Identify where you are, what the view is for and which object or scope it concerns using its heading, navigation and visible context. Record any inference or prior knowledge needed; distinguish agent inspection from participant understanding. Switch objects, workspaces and accounts where supported. Labels, editable values and previews must refer to the same context. Test delayed responses after a switch.

### AUDHD-02 Make hierarchy clear without repetitive headings

**Requirement:** Use spacing, boundaries and meaningful headings to show relationships. Distinguish parent navigation from local choices. Remove redundant visible headings without removing accessible names or document structure. Use text with unfamiliar icons.

Make task-relevant relationships visible: which controls affect which content, which values describe the same item, and which concepts are parents, peers, inputs, outputs or comparisons. Use meaningful grouping, proximity, alignment, shared scope labels or labeled connections as appropriate. Individually labeled cards are insufficient when their relationship remains unclear. Preserve relationships at narrow widths and with enlarged text, with corresponding semantic structure. Color may reinforce relationships but must not carry them alone.

Validate group membership against each control's purpose, dependencies and actual effect. Similar key names, shared prefixes and source-file proximity are discovery clues, not proof that settings belong to the same task. Give each editable setting a clear owning task; link from other relevant tasks without creating competing copies of its state. Inspect ambiguous names and cross-system dependencies explicitly.

Keep values that jointly determine one behavior in a named visual and semantic group, in an order that explains their dependency. Describe their combined effect; proximity or shared color alone does not explain the relationship. Separate distinct decisions even when they use the same subsystem, such as retention duration and database write performance. Give independent panels a clear gap, while keeping controls and their help close; compactness does not mean touching panels or uniformly compressed content.

**Peer settings:** Give settings at the same conceptual level consistent heading prominence and group treatment. Choose each control for its task; using a dropdown instead of cards must not accidentally make a peer setting look less important.

**Independent option groups:** When several option groups appear together, make it clear which options belong together, what each group changes and which choice is active in each group. Use clear group labels and stronger separation between groups than between options within a group. Preserve that distinction across themes, compact layouts and enlarged text, with corresponding semantic grouping. Borders, cards and dividers are optional techniques, not required layouts.

**Selection visibility:** Make the current selection easy to locate among its peers, using a persistent non-color cue such as text, a native checked mark, shape or border alongside any color treatment. Keep focus distinct, expose the actual selected state programmatically and verify recognition in supported light/dark themes, forced colors and narrow layouts. If a subtle outline or small mark is hard to locate, strengthen it; custom visual cards may benefit from a contrasting surface or status band, state wording and a structural cue together. Those are conditional techniques, not mandatory decoration for clear native controls. When a card is the selection control, any state label belongs to the same clickable target, without a nested button or extra keyboard stop. “Active” means currently applied; pending choices need wording that distinguishes selection from application.

**Why:** Repetition can increase reading effort without improving orientation.

**Example:** “Project settings” contains a clear “Notifications” section instead of repeating “Settings” above every group.

**Check:** Identify which controls affect which results and which values belong together. Follow those relationships on a narrow screen, with enlarged text and with keyboard navigation; inspect semantic grouping separately. Decorative connections must not obscure controls or imply actions. Without clicking, can a reviewer identify the independent option groups, what each changes and the active choice in each? Verify that the distinction survives supported themes, density settings and enlarged text.

**Connected-context example:** A current recording card and its detail panel share an active surface, title accent, repeated identity and structural edge. A directional cue points right in columns and down after stacking. A collection introduction such as “3 recordings:” identifies the actual children. These are optional techniques for the required relationship, not decorations to add to every group. Derive them from the actual object ID, not matching titles. Inspect the connection without color and after reflow.

### AUDHD-03 Offer manageable detail without hiding choices

**Requirement:** Put the immediate task first. Keep advanced settings, history and references in clearly named disclosures when appropriate. Where search is provided, search all eligible choices within its stated scope, including collapsed ones. Show active filters, a reset action and selected values excluded by the current filter.

**Long optional collections:** When an optional choice collection pushes unrelated tasks far down the page, default to a clearly named disclosure, initially collapsed unless the current task needs it open. Keep the current selection visible in the summary, with a compact representative preview when it describes appearance. Opening or closing the collection must not apply or discard choices. Keep errors and required next steps discoverable; do not collapse information needed to complete the current task.

Selecting a task must reveal useful task content: its controls, records or an explicit availability explanation and next step. Do not leave the main area empty behind another disclosure while generic help occupies the screen. If every action is unavailable, show the reason in the task area; keep optional technical detail expandable. Named navigation groups may collapse to reduce repetition, but retain their identity, current-task cues and any actionable error or draft state.

Inspect the effort created by the workflow itself: repeated decisions, switching between views and interruptions needed to complete a task. Reduce unnecessary reconstruction without hiding useful expert detail. Do not optimize for a minimum click count; a predictable extra step may be easier than a short but ambiguous action.

Where users need to find or revisit items, provide task-relevant recognition cues so they can browse without recalling an exact name, date or identifier. Use descriptive names and visible choices based on meaningful attributes where useful; text search can supplement these cues. Make retained restrictions visible, state the result count and scope, and explain when the current item is outside the filtered results. Changing or clearing filters must preserve the loaded item and its work; selecting another item is a separate action. State which restrictions a reset clears.

Map/date choices, thumbnail previews, pinned comparisons, recently watched lists and autocomplete are optional patterns chosen for the task, not universal requirements. Autocomplete still requires a starting clue; thumbnails need useful text equivalents. History and pins must respect the product's retention and privacy boundaries. See the [recognition-based recording example](EXAMPLES.md#find-a-recording-without-remembering-its-identifier).

**Why:** Reduced clutter must not create invisible state or an apparently incomplete library. Finding an item should not depend solely on remembered identifiers.

**Example:** A filtered tag picker still shows selected tags and an explicit “No tag” choice where omission is supported. Expanding the list does not change selections.

**Check:** Find an item using recognizable attributes without typing an identifier, search for a term in a collapsed choice where supported, then return with a retained filter. Combine filters, reach zero matches, exclude the loaded item and clear the stated restrictions with an unsaved edit. Verify that filter status and empty-result explanations are accurate, and that loaded identity, draft and usable focus survive. Repeat with keyboard operation and narrow layouts; report unavailable checks as pending.

### AUDHD-04 Explain effective behavior

**Requirement:** Name actions by their effect. Distinguish stored preferences, defaults, eligibility and effective behavior. Explain overrides near affected controls. Display accurate totals and units. If probabilities or weights appear, explain what they actually mean.

Separate recognition from applicability: a value accepted by a parser or listed in runtime help may have no effect on the current platform or deployment. Explain established limits before editing. Distinguish unsupported behavior from a missing prerequisite or an unverified effect; an accepted default alone must not be labeled “Running” or “Active.” If preparing configuration for another environment is in scope, identify that target and its deferred validation rather than implying a local effect.

Label disclosure actions by what clicking does, such as “Show appearance choices” and “Hide appearance choices”; show the current value separately. Distinguish revealing choices from applying them, and state when selection takes effect.

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

Retain an operation acknowledgment and any identifier before attempting follow-up verification. If the check fails, preserve what the acknowledgment establishes: “accepted,” “saved” or “completed,” with verification pending. Acceptance into a queue does not establish completion. Offer a separately labeled verification retry through a supported non-mutating check; it must not repeat a completed send, save or provisioning action. If completion itself is uncertain, say so and use the established reconciliation or duplicate-prevention contract before repeating the operation. If no safe check exists, explain the limit and next step without implying that resubmission is verification.

When explaining errors, distinguish invalid input, unavailable connectivity, denied permission, failed processing and conflicting edits. State what failed, the practical consequence, what remains intact and an available next action. Do not promise that work is retained or safe to retry unless that is established. See the [error examples](EXAMPLES.md#error-messages-with-useful-consequences).

**Why:** Uncertain persistence creates repeated checking and makes interruption costly.

**Example:** “Draft saved on this device” is separate from “Publish to team.” A failed publish keeps the draft and explains how to retry.

**Check:** Reload, interrupt connectivity, fail storage and edit from another session. An older save response must not mark newer changes saved. Do not imply a browser-local draft is a durable backup.

### AUDHD-07 Distinguish previews, results and runtime status

**Requirement:** Identify loading, empty, failed, stale and current results. Match responses to the selected context. Preserve useful previous results only when clearly marked previous. Distinguish prepared input, running work, finished execution and verified output.

On entering a record or collection view, initiate the authorized read needed for that task and show loading, results, an actual empty state or an actionable failure. Do not make a routine Refresh button the prerequisite for seeing existing records. Manual refresh can update or retry an initial load; this does not require continuous polling, unsolicited updates or reads beyond the user's permission.

Make uncertainty actionable when possible: “Not checked yet,” “Partially completed,” “Waiting for your approval” and “Waiting for file access” describe different situations. State the next useful action or explain that none is currently required. A generic “Unknown” should not conceal a known reason or recovery path.

Own asynchronous results by task, object and submitted version, independently of whether their panel is mounted. Leaving a page must not lose an acknowledgment, raise a rendering error on completion or apply a late response to another task. Where overview and detail views exist, derive their status from the same outcome evidence, including scope, checked version and freshness. Label previous results as historical when a later check fails or a newer applied version makes them stale. A newer saved version awaiting application must not inherit verification of the still-running version; identify which version the result covers. Reconcile completion when returning within the declared retention scope; do not imply durable history if results are session-only.

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

**Requirement:** Provide plain-English contextual explanations sufficient to understand and remember unfamiliar controls, settings, statuses and workflows: what they do, why someone would use them and what happens when they act. Use visible adjacent wording when sufficient, with accessible expanded help for further detail and tooltips for brief supplementary refreshers. The explanation is required; a separate help control is not. Do not merely repeat the label or describe the backend implementation.

Deliver complete contextual help within the affected scope. Placeholder text, “coming soon,” generic instructions, repeated labels and backend identifiers alone do not satisfy this requirement. Explain actual meaning, relevant scope and effects supported by established behavior. If behavior cannot be established, identify the specific uncertainty in the implementation report and label relevant uncertainty honestly in the interface; do not invent an explanation or present unfinished help as complete.

For unfamiliar settings, explain the concept in ordinary language, the problem it solves and how choices affect the outcome. Include a concrete use example and, for optional features, when leaving it off, turning it off or leaving the value unchanged is appropriate, with relevant consequences. Define necessary acronyms, product names and specialist terms; replacing one unfamiliar term with another is not an explanation. Name separate tools or setup required and what enabling the setting does not accomplish by itself. Distinguish the application's default from a recommendation; justify recommendations using established behavior and the user's task rather than prescribing a universal preset.

For numeric or formatted inputs, show the unit, accepted format, a valid example and the effect of increasing or decreasing the value. Prefer a number with a visible unit or supported unit selector over requiring remembered suffix syntax; preserve precision and supported values. Explain special values such as zero and what leaving the field blank does. An intentionally blank field still needs an example when its format or purpose is unfamiliar; an example is not an applied value. Distinguish a documented default, a valid range and a task-specific recommendation. Explain scale using established workload evidence; do not invent a “normal” range or machine capacity. For coupled settings, explain the actual timing or calculation rather than simplifying it into a different policy.

Lead with the user-facing purpose and decision guidance. Keep exact keys, source locations and implementation references available as supporting detail; they cannot substitute for explaining meaning or choosing a value. Use concise adjacent wording for the essential decision and accessible expanded help for deeper explanation. Scale the detail to the uncertainty: familiar, self-explanatory choices do not need repetitive tutorials. A user should be able to explain what an unfamiliar setting does, whether it is relevant and why they would select a value using the interface and its help, without prior implementation knowledge or external research for the basic decision.

Apply the same standard to less-common and generated fields as to prominent, hand-written controls. Shared section help can explain common prerequisites or tradeoffs when its scope is clear and it remains available on direct entry to the field; explain exceptions beside the affected control. Inspect fallback descriptions as well as authored overrides. Rewording a key, expanding an acronym or copying a usage string is sufficient only if the resulting explanation actually supports the decision. Do not repeat a full tutorial beside every field or invent missing behavior to fill the gap.

Keep scope, save requirements, blocking errors and consequential effects visible without opening help. Tooltips supplement clear labels and visible context; they must not be the only way to discover a critical consequence. Use an expandable explanation or help popover for content too long to read comfortably in a tooltip, or content containing links and other interactions.

**Associated help placement:** Place an info/help button immediately after its subject, preferably in the same row and adjacent in reading order. Keep expanded decision help inside the control's or group's shared region, beside or directly below it; a detached sidebar card can conceal the relationship even when it is nearby. An `(i)` toggle can reveal readable explanations and short lists, then collapse them once familiar. Keep the association when stacked on narrow screens. A shared outline is useful where a panel already exists; do not add decorative connectors when containment suffices. Retain a topic-specific accessible name, expanded state, programmatic association, visible focus and an adequate target. Opening or closing help must preserve work.

Keep detailed decision guidance available on demand and honor supported concise/expanded preferences; learning a system and using a familiar system need not require the same amount of visible prose. Keep clear labels, units, save requirements, blocking errors and consequential effects visible. Do not add a help control when concise visible wording already suffices. A closed explanation is not permission to hide the task itself.

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

Instructions must correspond to available actions. If an action appears only after an edit or lives on another page, explain that condition or provide the appropriate route. A permanent “Save → apply → verify” explanation without discoverable controls leaves the user to reconstruct the workflow; describe the actual steps and their scope instead.

Make help discoverable and available with keyboard, pointer and touch where supported. Do not rely solely on hover or the browser's native title tooltip. Let users keep explanations open long enough to read, move the pointer onto them and dismiss them without losing their place. Follow applicable hover/focus behavior requirements.

At narrow widths or enlarged text, stack help beside the task in the reading order or provide an explicitly opened help view. Keep controls reachable and preserve drafts, selection and a predictable return location when opening and closing help; do not let a fixed help overlay cover the action needed to continue.

**Why:** Users need help at the point of uncertainty without losing their place.

**Example:** A “Rebuild preview” button has help saying: “Create a new preview using the settings currently shown. Use this after changing the layout to see the result. Your published page stays unchanged; publishing is a separate action.” Avoid “Calls `rebuild_preview()` with the current config.” The interface still visibly distinguishes previewing from publishing.

**Check:** Without consulting source code or remembered implementation details, explain the feature's purpose, current state and effect using only the interface and its help. Access help with supported input methods, read it at enlarged text size, dismiss it where appropriate and confirm focus is retained. Check the explanation against the action's actual result. Follow [W3C hover/focus guidance](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) for web content.

Use `(i)` for supplementary information, `(?)` for clarification and `(!)` for a genuine warning or limitation when visible help access points are useful. Name each button by its topic, expose its state and keep it operable when the nearby action is disabled. Hover help must be dismissible, hoverable and persistent as applicable; click/tap/keyboard access can expose persistent inline detail. A demo-save warning belongs beside Save and also in visible retention wording. It must distinguish simulated acknowledgment from durable storage. Avoid adding icons when the explanation is already sufficient.

For unavailable capabilities, explain the actual boundary and permitted next action beside each affected decision. Missing dependencies, environment restrictions and unfinished implementation are different from a saved change awaiting verification. A limitation explained elsewhere does not make an affected control self-explanatory. Use the [capability-state examples](references/interface-patterns.md#capability-states-and-next-actions) where these distinctions matter; no new status schema is required.

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

**Theme typography defaults:** When a theme includes typography, use its intended heading and body fonts as the application default, unless an explicit user choice or accessibility requirement overrides them. Put the theme-matching choice first and provide a clearly labeled system-font alternative. Changing themes must preserve an explicit font choice. Describe unavailable-font fallbacks and show heading/body samples. This is an application default, not a change to profile semantics: null still means unspecified, and the preference utilities must not infer a stored choice.

**Visual preference scope:** When a choice changes a visible property, default to a representative preview beside its label: swatches for colors, color bands and a sample surface for palettes, rendered text for typography/size, and identical content showing spacing or thickness differences. Provide meaningful text equivalents and identify system-dependent examples. Applying the preference must visibly affect the relevant interface elements consistently within its stated scope. Explain meaningful exclusions; for example, “Spacing changes card padding and layout gaps; line spacing stays unchanged.” Keep previews understandable through labels and descriptions as well as visuals. Preserve readable content, visible focus and usable controls when reducing density.

**Why:** Presentation and input changes must not make a task unusable.

**Example:** Choice labels wrap without covering their radio buttons, and a skip link bypasses repeated navigation.

**Check:** Test narrow layout, text scaling, keyboard order and accessible names. Record actual devices and assistive technologies. Untested screen-reader coverage remains pending. The visual standard below provides design defaults, not a substitute for these checks. Compare each visual preference preview with its applied result: does it demonstrate the actual differences, and do the elements promised by its wording change? Across supported settings, verify that grouping, focus visibility and usable controls remain intact. Record preview-only or untested behavior as such.

### AUDHD-12 Validate complete tasks and report actual evidence

**Requirement:** Review the applicable stages of entry, editing, preview, save, failure, recovery and return as a workflow. Include users when suitability depends on preference. Distinguish implementation, deployment and verification. Keep historical observations dated.

Define completion by the requested user outcome, not the number of exposed fields. Configuring a data source, declaring desired state and inspecting or managing existing records are distinct tasks. Provide the stages needed for the requested workflow through supported interfaces; do not silently substitute raw provisioning fields or directions to another tool for an in-scope management interface. Document concrete scope or environment constraints and unfinished capabilities separately. Disclosing a gap is necessary but does not make that task complete; preserve option accounting without treating it as proof of task coverage.

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

For the detailed transitions, reference values and product decisions, use the [unlock-to-edit pattern](references/interface-patterns.md#unlock-to-edit-interaction-pattern). Try the [standalone demonstrator](examples/unlock-to-edit/README.md) to exercise one explicitly scoped implementation and its failure paths.

## Unlock to edit interaction pattern

Read the [conditional pattern and checks](references/interface-patterns.md#unlock-to-edit-interaction-pattern) when this interaction is part of the task. The pattern does not require adding the component.

<span id="keep-independent-states-visible"></span>
<span id="make-transitions-local-and-predictable"></span>
<span id="name-reference-values-and-recovery-precisely"></span>
<span id="establish-saving-and-lifetime-behavior"></span>
<span id="accessible-operation-and-verification"></span>

## Dashboard organization and hierarchy

Apply AUDHD-01 through AUDHD-05, AUDHD-07, AUDHD-09 and AUDHD-10 to the dashboard's complete workflow. Establish a clear reading order: **where I am → what needs attention → what the summary means → what I can do → supporting detail**. This is a starting arrangement, not a mandatory set of panels. A monitoring dashboard may prioritize status; a work queue may prioritize tasks. Omit layers that do not serve the task.

[Page layers](#organize-the-page-by-purpose) · [Navigation levels](#keep-navigation-levels-distinct) · [Updates and responsive hierarchy](#preserve-hierarchy-as-the-dashboard-changes)

### Organize the page by purpose

Organize around the user's tasks and help them understand the program's systems. Explain what each relevant system does, how it connects to other systems, and how the available settings affect its inputs, outputs and behavior. Use meaningful grouping and adjacent explanations so the user can predict effects without remembering configuration keys or reading source code. For backend configuration dashboards, use the [configuration integration contract](packages/audhd-ui-framework/CONFIGURATION.md) to establish these explanations from repository evidence and account for every option in scope. Add a system map when requested or when relationships are clearer visually than in concise text or a table.

Manage complexity through hierarchy and progressive disclosure while preserving the requested capabilities. A sparse screen is not evidence of a complete or usable workflow. Make material coverage boundaries understandable: distinguish supported tasks, externally managed settings, justified exclusions and unfinished work. A test environment may constrain specific actions; it does not by itself justify excluding unrelated configuration. Apply AUDHD-01, 03, 06 and 12 to scope and completion claims.

Make reference material part of the workflow under AUDHD-03, 05, 08 and 09. Use consistent human-readable names across controls, help, search and maps, with technical identifiers as secondary detail. Search should recognize both visible labels and exact keys. Editable reference entries should lead to their controls, reveal the relevant section and place focus meaningfully without changing values or discarding drafts; provide a return path to the reference context. Read-only or unavailable entries should explain their status and any established next step. A map should explain system roles and relationships, not merely repeat an option list as nodes. Present diagrams in a readable rendered form where offered in the interface, with an accessible textual equivalent; a source-code download is not a rendered map.

| Layer | What belongs here | Hierarchy and behavior |
|---|---|---|
| Page context | Page purpose, current workspace or object, selected period and scope | Use one clear page title and nearby context. State whether filters affect the whole page or only one panel. Keep the selected scope visible when navigation collapses. |
| Alerts requiring attention | Problems that affect the current task, their consequences and available next actions | Place urgent blockers before affected work; keep local problems beside their panel. Rank by consequence and urgency, not arrival time or bright color. Use explicit severity text; routine success messages must not compete with failures. |
| Summary metrics | Values needed to assess the current situation or choose the next task | Group related measures under meaningful headings. Give each value a label, unit, period and relevant comparison or denominator. Show freshness and scope; distinguish zero from unavailable or loading. Do not present stale or partial totals as current complete results. |
| Task panels | The work users came to perform, with related inputs, results and actions | Name panels by task. Keep the current item, primary decision, notes and feedback together. Make the next action visually distinct without making every panel equally prominent. Separate monitoring from editing where they are different tasks. |
| Secondary information | Task-specific diagnostics, definitions, references and optional metadata | Keep contextual help with its control or group; independent supporting information may use a subordinate region. Put routine history in its focused destination. Keep blocking errors, unsaved state, selected values and essential consequences visible beside the work. Secondary information must remain readable and discoverable. |

Use visual weight deliberately: page title, section heading, item title, then supporting text. Related panels share spacing, boundaries and terminology; unrelated tasks have clear separation. Color may reinforce grouping but must not carry it alone. Avoid a wall of equally emphasized cards, repeated generic headings such as “Overview,” or oversized metrics that conceal the action users need.

### Practical interface language

Every sentence must identify something, explain a decision, report state, describe a consequence or provide a necessary next action. Use literal titles sized proportionally to the task. Remove slogans, reassuring filler, redundant subtitles, decorative numbering and copy praising the interface. Do not give every region a visible heading that repeats the established subject; preserve meaningful section names and accessible structure. Preserve essential help, units, prerequisites, consequences and recovery instructions: concision must not become cryptic terminology. Judge copy in its rendered context, not by word counts or banned-word tests.

Useful context is not filler. Preserve wording that helps users recognize their location, understand the view's purpose or resume the task under [AUDHD-01](#audhd-01-keep-scope-and-location-visible). Before removing it, ask whether its absence would force someone to remember or infer that meaning. A slightly longer, specific label can reduce total effort; this does not justify redundant introductions or oversized context panels.

Generated labels, CLI usage strings and copied reference passages are source material, not proof of usable explanations. Review the full affected workflow, including less-common settings: expand unfamiliar terms, explain when to use or leave a feature alone, and identify required setup. Prefer a literal title such as “Server configuration” over a slogan; a subtitle is useful only when it adds orientation, scope, a decision or an instruction absent from the title and surrounding context. Keep deeper technical references available without requiring them for the basic decision.

### Status-first operational overviews

For configuration, administration and monitoring interfaces, prioritize actual blockers, failures and unfinished work, followed by common operational state. Derive summaries from the same records as the controls. Distinguish draft, saved, effective and verified state; include scope and freshness where relevant. Never invent metrics, alerts or verification claims. Focused editors and previews need no artificial overview.

Keep the overview a place to assess state and choose a task. Give substantial workflows and routine activity/history their own focused destinations, with secondary navigation under the relevant domain where useful. Do not duplicate a workflow promotion card merely because the sidebar links to it; a status-specific shortcut must add a reason to act, such as an unfinished test or a failed check. Keep routine instance identifiers compact in the page context and technical ownership details deeper. Explain whether a missing optional integration is expected or prevents a chosen task; “Not connected” alone should not imply a fault. Name what is compared by statuses such as “Up to date,” and use understandable units instead of unexplained shorthand.

Link actionable status directly to its task or control with condition-specific actions such as “Review changes,” “Verify permissions” and “Configure email.” This includes ordinary state users may need to change, such as retention or access policy, not only errors. A nearby link to a broad category is insufficient when the user must then find the affected setting again. Reveal and focus the relevant control or task section while preserving drafts, filters and useful return state; identify unavailable actions and their reason. Informational values need no artificial action. Prefer compact lists or grouped rows over promotional cards; retain readable text and accessible targets. Keep the complete destination index secondary. Verify empty, error, pending and successful states, including a newer saved or applied version that has not yet been verified. Trace claims such as “Configured” to their actual criteria; the presence of a category or default value is not evidence of readiness.

Use a compact literal heading followed by the relevant status rows and actions. Remove decorative hero artwork, repeated introductions and oversized empty-state cards when they push operational work out of the initial view. Keep save/apply bars scoped to the work they affect: an immediate appearance choice must not appear to require saving or restarting an unrelated service. In an idle overview, show truthful ordinary state and useful entry actions rather than filling space with encouragement. Judge desktop, short-height and narrow layouts separately; compactness must preserve readable text and usable targets.

### Readable activity and warning review

When an interface provides operational logs, present events in a readable table or responsive list with clear timestamps, severity, plain-language descriptions and whether action is needed. Keep original entries available as supporting detail. Interpret only what the source establishes; preserve unknown or unparsed entries and never invent a cause, resolution or action. Provide a user-controlled page size for long histories, with clear ordering, total scope and filters. Incoming events must not unexpectedly move the page being read.

For warning triage, put Warnings before the combined All events view within Activity & logs; include higher-severity failures in the attention view or make their own priority explicit. Show an unacknowledged count with its scope, independent of pagination; identify partial counts when full history is unavailable. Where acknowledgment is supported within the requested task, it removes the warning from that count and reduces its emphasis, while retaining its severity, acknowledged label and history. Acknowledged does not mean resolved; later events remain new. State whether acknowledgment is personal or shared and its persistence boundary. Read-only log access does not authorize changing source records; any local review state must be identified as such.

### Prioritize useful work

Check the initial desktop and narrow-screen view against the user's task: can someone identify the next useful action and reach it without passing repeated introductions? Place common decisions and relevant prerequisites before technical ownership or source details. Keep expert settings discoverable within named tasks; source order is not a priority order. Show save or review controls where they apply, retaining global controls only when unfinished work makes them useful. This is a contextual task-visibility check, not a fixed above-the-fold quota or ban on expressive design.

### Keep navigation levels distinct

For complex interfaces, primary destinations represent task domains and secondary destinations represent named tasks within them. Put common tasks, relevant status and setup dependencies first; keep expert detail deeper within its owning task. Do not substitute source-key groupings or a generic “More settings” collection for meaningful secondary navigation. Simple interfaces need no artificial nesting. Preserve the current parent and child, addressable destinations where appropriate, Back/Forward behavior and useful return state.

Make peer tasks discoverable before a long detail panel pushes them out of view. Expanding the first section by default must not make finding another ordinary task depend on collapsing unrelated content or already knowing a search term. Choose an appropriate task selector, compact section index or disclosure arrangement; do not add duplicate navigation when the existing hierarchy suffices. Check both reaching a destination and recognizing why its controls belong there.

**Appearance destination:** Place appearance settings last in each main navigation menu, adjacent to its other entries rather than pinned across a large empty gap. Keep the destination clearly labeled and directly reachable in desktop, collapsed and mobile menus. Match visual and keyboard order; do not bury it in an unrelated task, a vague “More” collection or the footer of a long content page. Opening appearance settings, changing a choice and returning must preserve drafts, pending work, filters, navigation and usable focus. A focused tool without main navigation does not need a new menu, and local task tabs do not need duplicate appearance destinations.

Navigation must fit available height as well as width. For sticky or fixed menus, provide usable vertical overflow, a compact layout or an accessible complete menu so the final destinations remain reachable by keyboard, pointer and touch. Check short desktop windows, landscape screens and actual browser zoom; a width breakpoint or absence of document-wide horizontal overflow is not sufficient evidence. Keep focused links clear of fixed headers and footers. Returning through history should restore useful task position and filters rather than unconditionally jumping to the top; use a meaningful fallback when the prior target no longer exists.

Show pending changes and errors at the relevant navigation level, including collapsed groups. Change reviews and error summaries must offer a route to reveal and focus the affected control without discarding other drafts. A global count alone does not tell users where unfinished work lives.

- Separate application or workspace navigation, page or task navigation, and choices within a panel. Give each level a distinct location and meaningful label; avoid visually identical rows of nested tabs with unclear ownership.
- Show the current location and selected destination at each relevant level. Use breadcrumbs when they clarify a real parent path; do not add a navigation level merely to fill a layout.
- Keep navigation separate from actions and filters. “Reports” opens a destination; “Generate report” starts work; “Last 7 days” changes the displayed period. Their effects should be apparent before activation.
- Changing a local tab or expanding details must not silently switch workspace, reset unrelated filters or discard edits. Preserve context within privacy boundaries, and explain unavailable destinations rather than silently selecting another.

For pattern choice, context retention, hidden errors and accessible operation, use the dedicated [tabs, sub-tabs and accordion guidance](references/interface-patterns.md#tabs-sub-tabs-and-accordion-sections).

### Authoritative navigation and repeated orientation

For a multi-page workspace, provide a complete browsable “All pages” index or equivalent named directory view derived from authoritative page records. Show destinations without requiring a search term, grouped by meaningful categories with alphabetized entries within groups; preserve a necessary sequence for ordered task steps. Include secondary task destinations, not only broad categories. An all-settings catalogue can supplement this directory but does not account for pages such as activity or record management. An existing complete directory can serve this role; a single focused page needs no artificial index. Search optionally filters the list, and entries lead to the appropriate task with useful return context. Keep the index secondary to the current task, not repeated in full on every page.

Where breadcrumbs help orientation, derive actual ancestry from the same page records. A second copy is optional; if provided, keep labels and destinations consistent, with named landmarks and a bypass for repeated navigation. Do not invent parents from browser history or treat a local tab as a parent page. Collapse named navigation groups where this reduces clutter while preserving selected context and access to their children; the full directory remains available.

Workspace links select destinations; local tabs select views of the same object. Keep their scope apparent without repeating two full navigation bars: the reference uses a compact footer disclosure alongside the bottom breadcrumb. Preserve ordinary link behavior, stable IDs, Back/Forward, direct links and truthful unavailable-page handling. Permissioned products must derive navigation from authorized destinations.

The [reference specification](examples/recording-review/SPEC.md) demonstrates canonical ancestry. Multiple-category membership and hover/focus cross-highlighting remain a proposed extension, not an implemented capability or an adopted navigation schema. Membership alone cannot establish a unique parent; contextual paths need a deterministic direct-link policy before implementation.

### Preserve hierarchy as the dashboard changes

Keep a predictable panel order during refreshes. Update values in place; do not automatically sort panels or move the focused task when new data arrives. Surface urgent new conditions without stealing focus or repeatedly announcing every counter change. Explain what dismissing an alert does; hiding a message must not imply that its underlying problem was resolved. Keep unresolved blockers visible at the affected task.

Use the shared [typography and layout guidance](#typography-and-layout) for panel stacks, control alignment and responsive help. Preserve a logical heading, reading and keyboard order when dashboard columns collapse; do not create a visual order that contradicts the underlying document order.

Offer density choices where useful, without hiding ordinary expert work as “advanced.” Keep optional history and metadata from dominating the workspace, but do not shrink text or remove necessary controls to make the dashboard appear simpler.

**Check:** Ask a returning user to identify the current scope, most consequential issue, meaning and age of a summary value, and next available task using only the page. Change global and local filters, switch navigation levels with an unsaved edit, introduce an unavailable metric and a new alert during refresh, and expand secondary details. Repeat with keyboard navigation, enlarged text and a narrow layout. Verify that scope, focus, panel order, drafts and access to relevant information remain understandable. Record untested behavior; a screenshot alone cannot establish these outcomes. See the [dashboard example](EXAMPLES.md#dashboard-from-summary-to-action).

## Tabs, sub-tabs and accordion sections

Read the [conditional pattern and checks](references/interface-patterns.md#tabs-sub-tabs-and-accordion-sections) when this interaction is part of the task. The pattern does not require adding the component.

<span id="choose-a-pattern-by-task"></span>
<span id="preserve-context-and-surface-hidden-problems"></span>
<span id="operate-accessibly-across-layouts"></span>

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

Accessible behavior is mandatory; skins are user-selectable. Light and dark palettes are ordinary choices, not accessibility exceptions. Provide discoverable appearance choices where supported, with their destination at the [end of main navigation](#keep-navigation-levels-distinct); preserve system forced colors and reduced motion. A focused change does not authorize a whole-application reskin. Use [preferences](PREFERENCES.md) for intake, inheritance and storage.

Fun, personal expression and renewed interest are legitimate design objectives alongside readability and comfort. Offer useful palette and text-style variety without automatic rotation or a claim that one preset is AuDHD-ideal. Keep text style independent of skin when supported. Use a coherent heading/label/value hierarchy with intentional font choices, relative sizing and fallback fonts; user-selected styles must not remove labels, clip content or obstruct browser enlargement.

Use semantic roles for page/panel surfaces, reading text, controls/actions, active context, keyboard focus, status and chart data. For new interfaces without an established design system, reuse the canonical skin CSS/tokens and full palette registry described in the [skin integration guidance](examples/skins/README.md), rather than inventing replacement themes. Direct asset reuse is valid; installing the optional framework is not required. Offer all registered skins through an accessible selector with representative previews, independent text-style choices and a system-appearance choice. Layouts and branding remain adaptable; reuse is not a contrast certification.

When no explicit preference or established product default applies, initialize new interfaces with **Guillermo** (`guillermo`). This is the kit's product default, not a universal AuDHD recommendation. For the system-appearance choice, use Paperwhite for light and Guillermo for dark unless established product requirements specify another mapping. Preserve preference precedence and accessibility overrides. Document concrete brand, platform or technical reasons for exceptions to kit reuse or the default; an unrelated focused change does not authorize reskinning an existing product.

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
