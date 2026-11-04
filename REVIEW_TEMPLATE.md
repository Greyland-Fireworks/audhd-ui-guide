# Interface review record

Copy this template for one bounded task. Remove personal information from public evidence; use synthetic content where possible.

## Short review for a focused change

Use this instead of the full record for a small, bounded issue. Lead the user-facing response with the result and its consequence; use these fields as a coverage guide rather than mandatory headings. Include the rule ID, build and environment with the check. Expand to the full review when several states or an entire workflow are affected.

- **Task:**
- **Difficulty:**
- **Relevant rule IDs and evidence source:**
- **Aspect:** UI, UX or both; use the [project definitions](GUIDE.md#ui-and-ux-in-this-project).
- **Proposed change and affected layer:** wording/layout, interaction state, navigation, persistence or business logic.
- **Check and actual result:**
- **Remaining uncertainty:**
- **Added effort and justification, if material:** decisions, reading, navigation or maintenance.

A proposed check is Pending until performed. A short review does not establish that the whole interface passes the guide.

For `audhd quick review` and `audhd audit`, follow the [review modes](SKILL.md#review-modes). The short record limits presentation, not applicable task checks; incomplete evidence remains Pending.

## Full review

### Scope

- Task and intended users:
- Deliverable contract: requested artifact, purpose, observable outcomes and original request reference:
- Delivered entry point, documented prerequisites, exclusions and blocking dependencies:

- UI and UX aspects in scope, and evidence needed for each:
- Guide version and affected rule IDs:
- Build or revision:
- Environment and location: local, preview or deployed:
- Device, viewport, text scale and input methods:
- Assistive technologies and preferences actually tested:
- Affected screens or modes, including shared styles; identify any not exercised:
- Data retention and save locations:
- Classification: adopted outcome, implementation example, preference or proposed extension:
- Consequential behavior: established behavior and source; proposed choice and tradeoff; unresolved dependency and what it blocks. Omit empty categories.
- Requested preferences, declared support, actually applied values and unsupported choices:
- Agreed Guide emphasis/primary targets and their source, if supplied; distinguish them from application preferences:

- Requested outcome → request reference → minimum consumer proof → observed result: use the existing coverage rows.
- Applicable partial-apply boundaries and restoration evidence:
- Exact delivered startup command/context, normal-path result and native-zoom evidence:
- Unfinished authorized work or concrete blocker/next action:


### Delivered experience and contradictions

Follow the [delivered-experience procedure](references/autonomous-implementation.md#challenge-the-delivered-experience). Record the first attempt from the delivered entry, coaching/interventions, and separate functional and usability conclusions in the existing rows. Identify the actual recovery boundary tested. If evidence contradicts an earlier pass, link the historical observation, reopened gate/dependents and required retest; do not erase the earlier failure or retain a misleading current Pass.

### Procedure and results

Use Pass, Fail, Pending or Not applicable with a reason. Do not mark an unperformed check passed.

| Evidence available | What it supports and what remains open |
|---|---|
| Supplied description or screenshot | Findings about the supplied facts or visible state; behavior, semantics and task success remain unverified unless separately evidenced |
| Code inspection | Findings about implementation and likely failure paths; runtime behavior and user understanding still need relevant checks |
| Executed interaction checks | Observed results for the tested build, environment and sequence; do not generalize to untested modes or user suitability |
| Supplied or directly observed user feedback | Understanding, effort and outcomes under the recorded conditions; preserve source and limits rather than claiming universal benefit |

Select applicable [component roles](references/component-review-matrix.md) and [detailed checks](references/ui-readiness-checks.md); combine roles such as button + save + pending operation. Record selected checks below or in an existing task record, not a duplicate checklist. Name the control, state/transition and relevant rule with the evidence.

Split mixed results: a label may pass while persistence remains Pending. Identify satisfied rules, consumer defects under existing rules, toolkit coverage gaps and unresolved participant questions only where relevant; a consumer bug does not automatically require another guide rule. Include meaningful differences between shared-component instances and verify the intended task outcome. Keep supplied or reused dated results distinct from checks newly executed on the current build, including a defect's before/fix/retest sequence. The [worked example](#worked-review-example) demonstrates a single record with mixed results.

For navigation or layout work, trace a representative task's starting point, decisions, destinations, transitions and completion evidence here or in the existing plan. For implementations, compare the planned path with the delivered path; reviews trace the existing interface. Record reachability separately from task coherence; functioning links do not prove that someone can find and complete the task. An agent walkthrough remains inspection, with participant understanding Pending until observed.

For substantial implementations, record the [phase exits](references/autonomous-implementation.md#phase-exits) alongside these existing actions and observations: supported task paths (A), rendered and exercised representative slice (B), challenged recovery (C), complete task coverage (D) and integrated acceptance (E). Link reused evidence instead of duplicating it. Identify the independent reviewer and inspected scope, or state that sequential self-review was used. Record repair/retest evidence and unresolved requirements; do not mark a gate passed because a later phase started.

Keep four evidence categories distinct in the handoff: automated behavior; agent visual and keyboard inspection; screen-reader and platform checks; participant feedback. Record pending or unavailable checks explicitly. Participant feedback is optional: do not make the user complete a comprehension exercise or repeatedly approve phase transitions.

In each applicable row's evidence cell, include **phase, task/control and route, build, reviewer, method, evidence reference and retest**. Scope-level values may be referenced rather than repeated. A screenshot supports a visible state; an API test supports its exercised operation; neither alone closes a rendered task interaction. Source-only independent review leaves rendered acceptance Pending. Required Fail/Pending outcomes remain unfinished and block dependent pattern reuse or acceptance, while independent authorized work continues.

Use the existing rows to account separately for option inventory and completed tasks, and for functional/recovery results versus navigation, explanation and visual-relationship results. Record which unfamiliar fields have useful explanations and which need correction; shared boilerplate or a help-text count cannot certify individual explanations. Use the [recovery ownership map](references/autonomous-implementation.md#recovery-coverage-to-preserve) to retain established checks and identify consumer-specific gaps without duplicating suites.

For a visual relationship, choose fixture differences that would expose an incorrect rendering: different start times and durations with an overlap, a blocked task with a prerequisite, a submitted version followed by a newer draft, or unequal values on either side of a comparison. Use only cases relevant to the product. Trace the displayed position, size, count, grouping or stage back to the same records and transitions used by the controls; decoration alone does not satisfy [AUDHD-08](GUIDE.md#audhd-08-use-visuals-to-support-decisions). Record the result in the applicable rows below, alongside the normal task checks.

| Action | Expected result | Observed result | Status and evidence |
|---|---|---|---|
| Enter directly, follow search, use Back/Forward and return after interruption: “Where am I and what am I doing here?” | Heading, selected navigation and any breadcrumbs identify the subject and purpose and agree on the current task and scope; a static environment label does not substitute for location. | | |
| Browse without a query, compare the directory with authoritative page records and follow the task path; distinguish reachability from understandable organization | The directory accounts for authorized pages, including secondary and non-settings tasks. Selected tasks reveal useful content; groups reflect decisions and dependencies, including coupled controls and ambiguous names. | | |
| Inspect the first viewport and prominent regions at relevant widths, heights and enlargement; identify avoidable displacement and the value of repeated navigation | The current task, consequential state and useful next action are identifiable. Space devoted to a timeline, board or comparison helps an actual decision; routine history and unrelated workflows do not crowd it out. Record what remains below the first viewport rather than treating absence of overflow as sufficient. | | |
| Identify the next useful action and its expected effect; follow actionable status where present | The action's purpose is clear; subject, severity, consequence and remedy are presented together, with unchecked evidence and routine work distinct from confirmed problems. Status and log-remedy links reveal the relevant section/control, place focus meaningfully and retain drafts, filters and useful return state. A general correction request must not falsely identify one field as faulty. Informational values need no invented action. | | |
| Open and close contextual help and make the basic decision, including less-common and generated fields | Help is visually and semantically associated inside the relevant group and explains purpose, use/off cases, prerequisites and examples; closed help preserves essential units, state and consequences. Shared help works on direct entry. Optional teaching annotations describe delivered behavior, stay attached to their subject and preserve task controls and drafts when toggled; hiding focused teaching returns focus to its toggle. Record fallback-copy and demonstration gaps separately. | | |
| Find and edit a value, including units and a supported blank/zero case | Explain valid input, effect of changing the value and documented default versus recommendation. Coupled controls explain their combined behavior accurately. | | |
| Inspect effective behavior or preview, including a realistic sample that differs from current data | Recognized and saved values are distinct from platform applicability and observed effects. Proposed changes identify affected records using actual data; examples are labeled as samples. A request's approval does not imply delivery or completion of linked work. Established unavailability is explained before editing and unknown behavior stays unverified. Save a configuration change and exercise an allowed action, rejection and correction through its consuming workflow; revalidate earlier previews against current rules. Change permission during editing: proposals survive and both controls and mutation functions enforce the restriction. | | |
| Enter a record collection or operational log view, where in scope | Authorized initial data loads without a prerequisite Refresh. For warning triage, test counts across pages, acknowledgment versus resolution, retained history, new warnings and page-size changes under the [log guidance](GUIDE.md#readable-activity-and-warning-review). | | |
| Save and confirm the saved version; where concurrent writing and reload recovery are supported, let another writer save and reload the original draft; separately refresh a clean view | A conflicting draft retains its original baseline until deliberate reconciliation. A clean view adopts current data without inventing a conflict. Neither path silently loses newer edits. | | |
| Encounter rejection, a lost response after acceptance and failed follow-up verification in an authorized fixture; use visible recovery, reloading before reconciliation where durable recovery is promised | Recovery preserves the original identity/snapshot and newer draft for the declared lifetime. Completion appears beside its action with the observed outcome and record/version; repeating a check visibly updates its result or checked time. Inspect mutation counts to establish no duplicate effect; manually reusing an API key alone does not verify UI recovery. If the original outcome is unknown, explain that limit before any explicit permitted repeat. | | |
| Receive acknowledgment, fail the following status read, enter a newer draft and recover; separately recheck a previously verified receipt after it becomes unavailable | Known acceptance survives failed status reads and promised reload recovery; uncertainty does not erase acknowledgment or permit blind replay. Missing/expired receipts retain historical evidence while current overview and detail stop implying verified success. Read-only retries preserve the newer draft and mutation count. | | |
| Leave and resume with two drafts and local help open; where recovery is promised, reload on a secondary settings or Appearance page before using its return action | The return names the original subject and restores its anchor, help and useful focus as promised, alongside the drafts. Test field, section and overview origins; distinguish recovered data from recovered task context. | | |
| Connect selected source/detail, parent/children and action/result without color alone; inspect relevant time, prerequisite, stage or version comparisons | Labels and structure identify the records being compared. Time positions and lengths agree with the stated scale; short or crowded events retain readable details without distorting duration. Group counts match their filter scope; prerequisite links identify the actual constraint. An older approval stays attached to its submitted version when a newer draft exists. Text or list equivalents preserve meaning without color or precise visual estimation. | | |
| Check workspace destinations and local views; compare repeated breadcrumbs where provided | The current branch is visible without accumulating every previously visited branch. Explicit navigation disclosure choices remain distinguishable from automatic expansion. | | |
| Switch light/dark skins and text styles during pending work; preserve drafts, focus, filters and view | | | |
| Import/preview/cancel/apply/export preferences; distinguish unsupported requests and storage boundaries | | | |
| Compare pointer navigation focus with visible keyboard focus | | | |
| Recover task meaning and unfinished work after returning without context | | | |
| Complete with keyboard or other supported input | | | |
| Use narrow layout and enlarged text | The selected task and its relationships remain readable and operable. Where a dense visual reflows or uses a day, list or selected-item alternative, the same records, scale/units, state and actions remain available without necessary sideways navigation or dragging. Record actual browser zoom separately from root-text enlargement. | | |
| Measure contrast, target sizes and computed text sizes of labels, values, navigation and opened help; include compact density and record methods/results | Text follows the kit baseline or justified existing requirements; inherited body size alone is insufficient. | | |
| Check reduced motion and forced colors or other supported accessibility overrides | | | |
| Read labels and grouped choices; distinguish selection, focus, actions and disabled states | Counts remain visibly and semantically paired with labels when wrapping. A boundary, indentation or continuous edge makes each heading's scope evident. Verify these relationships without color and after reflow. | | |
| Identify independent settings and their active choices; compare previews with applied results | | | |
| Predict disclosure actions; find the current choice and required errors while sections are closed | | | |
| Open and close help without obscuring work or losing context | | | |
| Search, filter, reorder or switch comparison items without moving notes or decisions to another record, where applicable | Calendar/agenda, board/list or comparison views agree on record identity and state. Compact choices preserve necessary comparison; selecting one reveals and focuses its detail with a useful return path, without committing it. A multi-field availability search has an explicit initiating action and results tied to submitted criteria. Edit criteria during and after a search: late or old results must not represent the new criteria or authorize commitment. Invalid criteria must not draw a plausible proposal. Simple browsing may filter immediately. Counts declare the eligible scope; partial results name the missing portion, refresh failure retains the last-successful timestamp and retry, and empty results remain distinct from missing data. A confirmed workspace replacement invalidates pending responses. Confirm cancellation preserves unfinished work, and switching representation neither mutates records nor loses drafts or selected context. Starting a new item uses the selected context and asks before replacing an existing draft; changing a proposal invalidates any alternatives checked for the old proposal. | | |
| Identify dashboard priorities, metric scope/freshness and global versus local navigation or filters, where applicable | | | |
| Switch tabs/sub-tabs and expand related sections while retaining drafts, location and save scope, where applicable | | | |
| Find and reach an error inside hidden nested content; verify focus and accessible state, where applicable | Correction guidance names the field and relevant problem without unrelated possible causes; original input and unrelated drafts remain. Corrected field errors clear after validation passes; remedies cease to apply when their cause changes. | | |
| Skip preference questions and distinguish temporary choices from authorized storage, where applicable | | | |
| Validate profile structure and update/clear choices without erasing skipped values or crossing privacy boundaries; where browser storage is used, fail access, write and removal separately | Useful work remains possible where supported; persistence warnings appear immediately and survive unrelated updates; failed removal does not claim erasure; secret drafts are not stored. An explicitly memory-only example tests its declared reload reset rather than proving durable consumer recovery. | | |
| Interpret groups without color; verify selected cues and effective accessibility overrides, where applicable | | | |

Record UI evidence (presentation, semantics and control operation) separately from UX evidence (task understanding, effort, failure, recovery and return). Use Not applicable with a reason for save checks on read-only tasks. A visually correct state does not prove that the behavior producing it is correct.

Before concluding, ask: “What must the user read, remember, navigate or dismiss before they can do useful work—and which of those demands can we remove without losing capability or understanding?” Record material findings and tradeoffs here; retain useful orientation, necessary help, accessible targets and complete capability rather than forcing all work into the first viewport. Treat context as useful when removing it would make location or purpose harder to understand.

### Acceptance disposition

For substantial implementations, summarize the existing evidence here or in the task's current record. Start each applicable gate as Pending. Reuse scope details and evidence links instead of copying observations into a second report. A gate advances only after its required checks are exercised and defects repaired; entering a later phase does not close earlier gates.

| Gate | Status | Evidence and remaining requirement |
|---|---|---|
| A — Supported complete task paths | Pending | |
| B — Rendered representative workflow before pattern reuse | Pending | |
| C — Challenged state and recovery | Pending | |
| D — Complete task coverage and individual explanations | Pending | |
| E — Integrated rendered review and affected retests | Pending | |

Use Pass, Fail, Pending or Not applicable with a reason. For E, identify independent rendered review or the permitted sequential self-review fallback; source-only inspection cannot close it. Cite the build and observation that allowed pattern reuse at B; a later retrospective inspection must be labeled as such. Assess practical explanations using the rendered field, not its metadata or the reviewer's knowledge of the implementation.

**Disposition:** accepted within the recorded scope only when every required applicable outcome passes; otherwise unfinished, listing each failed/missing outcome, its dependency and next action. Separate optional participant feedback and unperformed platform checks from required checks; do not silently waive either or imply they passed. Report functional coverage, recovery, navigation, explanations and visual relationships separately when their results differ. A running server or passing suite does not close this record.

For dashboard builds, expose this disposition through the [visible build-review example](examples/administration/README.md#visible-build-review). Advance lights only from recorded milestone evidence, including all required task-specific checks; never use test counts or a manual “complete” toggle. Reopen invalidated gates and reset the 24-hour completion clock on a changed build. Check hover, keyboard/touch disclosure, unavailable evidence, interrupted timing and reappearance separately. The lights identify the review method; they do not turn self-review into independent certification.

### User feedback

#### Returning without memory

Using only the interface and its help, ask the reviewer to explain:

- Where am I, what am I doing here, and what item or scope is selected?
- What has happened, and how current is that information?
- What will each relevant action do, and when?
- Is the work saved, and where?
- How can a mistake be recovered, and what are the limits?
- What can be done next?

Record missing or incorrect answers, where help was sought, and prior familiarity with the implementation. Attribute supplied observations to their source; label agent walkthroughs as inspection, not user feedback. If no user participated, leave user checks pending. Do not require a person to demonstrate memory difficulties to participate.

For observed-use evaluation, ask intended users to complete a few bounded workflows, including recovery or return where relevant. Include differing or conflicting preferences and retain unsuccessful attempts and rejected designs. Record instruction-following results, accessibility checks and observed experience separately; none substitutes for the others.

#### Difficulty and tradeoffs

- Observed difficulty or preference, in the participant's terms:
- Task and conditions under which it occurred:
- Alternative tested and outcome:
- What the user had to remember, infer or recover:
- Repeated decisions, view switches or interruptions needed to finish:
- Added friction or capability lost through the proposed fix:
- Evidence type: proposal, personal experience, observed difficulty, tested change or external source:
- Consent and privacy considerations for sharing this evidence:

Do not require a diagnosis or public disclosure of disability to accept feedback. One person's preference is valuable evidence, not a universal rule.

### Outcome and follow-up

- Implementation status:
- Deployment status:
- Verified behavior and remaining gaps:
- Exception, alternative and review condition:
- Next action and responsible person or team:

For each finding, connect the difficulty to a relevant rule, a focused recommendation and a concrete check. “No change justified by available evidence” is a valid result.

Use claims supported by this record. Passing these checks does not establish clinical benefit or certify accessibility conformance.

## Worked review example

**Illustrative completed record:** the observations below are invented to demonstrate recording mixed results, not executed evidence about this toolkit or a real application. Replace them with actual observations when reviewing a product.

**Task and context:** Save Mira's permissions in fictional build `demo-r1`, using a desktop browser, keyboard and disposable mock service. Combine the button, save, pending-operation, feedback and verification rows in one record. Saving stores configuration; effective access requires a separate check. The submitted snapshot is version 8; the user makes a newer edit while that request is pending.

| Action/check | Expected result | Observed result in this fictional example | Status and evidence |
|---|---|---|---|
| Identify the Save action | Label and nearby context identify the person, saved scope and separate verification step. | “Save permissions” appears in Mira's editor with the save destination and check requirement visible. | Pass for this rendered state — visual and semantic inspection; AUDHD-01, 04, 09. |
| Operate by keyboard | Reach and activate Save with visible focus and one request. | Keyboard activation submits once; focus remains in the editor. | Pass for this interaction — browser exercise; AUDHD-05, 11. |
| Persist the submitted snapshot | Acknowledgment and readback identify version 8, not the newer edit. | Mock service readback matches version 8; the newer draft remains in the editor. | Pass within the mock — request/readback evidence; AUDHD-06. Production persistence remains untested. |
| Interpret feedback after newer editing | Completion of version 8 still leaves the newer draft marked unsaved. | The interface says “Saved” without identifying the older version; the response handler clears the dirty flag regardless of later edits. | Fail — browser observation and source inspection; AUDHD-06, 07. The source finding can still be reported if runtime access is later unavailable. |
| Verify effective permissions | Check allowed and denied access for saved version 8. | No effective-access service is connected to the fixture. | Pending — outcome not exercised; AUDHD-12. Successful storage does not prove effective access. |

**Result:** Fix the misleading acknowledgment and repeat that transition check. Verify effective permissions in a suitable environment before claiming the task outcome. Narrow layout, assistive technologies and participant understanding are outside the exercised evidence and remain Pending; the component has no single overall Pass score.

## Executable evidence record

- Stage: initial / repair (including repairs to newly generated work):
- Mutation tasks and per-task recovery scenario results:
- Coverage per task: control implemented / locally exercised / external integration verified; required level:
- Visible verification scope and unverified areas:
- Current build and acceptance-configuration fingerprints:
- Schema-2 record and required check IDs:
- Automated invocation/result artifacts versus rendered observation artifacts:
- Reviewer identity and self-review/independent method:
- Before expansion: A/B disposition and preserved milestone artifact (missing history stays Pending):
- Before repair: captured baseline and repair-stage applicability:
- Representative review timing: before reuse / reassessed with preserved milestone / retrospective / unknown:
- Capability scope and before/after comparison, followed by behavioral retests:
- Explicit task-contract applicability reasons (unperformed is Pending):
- Remaining required checks, next action and optional evidence limits:

Follow the [local review workflow](references/review-tooling.md). A historical acknowledgment is not current verification; a missing receipt does not authorize replay. Inspect the named return after reload, not just preserved draft contents. Inspect the lights after evidence becomes unavailable and while the page remains open.
