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

### Procedure and results

Use Pass, Fail, Pending or Not applicable with a reason. Do not mark an unperformed check passed.

| Evidence available | What it supports and what remains open |
|---|---|
| Supplied description or screenshot | Findings about the supplied facts or visible state; behavior, semantics and task success remain unverified unless separately evidenced |
| Code inspection | Findings about implementation and likely failure paths; runtime behavior and user understanding still need relevant checks |
| Executed interaction checks | Observed results for the tested build, environment and sequence; do not generalize to untested modes or user suitability |
| Supplied or directly observed user feedback | Understanding, effort and outcomes under the recorded conditions; preserve source and limits rather than claiming universal benefit |

Select applicable [component roles](references/component-review-matrix.md) and [detailed checks](references/ui-readiness-checks.md); combine roles such as button + save + pending operation. Record selected checks below or in an existing task record, not a duplicate checklist. Name the control, state/transition and relevant rule with the evidence.

Split mixed results: a label may pass while persistence remains Pending. Include meaningful differences between shared-component instances and verify the intended task outcome. The [worked example](#worked-review-example) demonstrates a single record with mixed results.

For navigation or layout work, trace a representative task's starting point, decisions, destinations, transitions and completion evidence here or in the existing plan. For implementations, compare the planned path with the delivered path; reviews trace the existing interface. Record reachability separately from task coherence; functioning links do not prove that someone can find and complete the task. An agent walkthrough remains inspection, with participant understanding Pending until observed.

| Action | Expected result | Observed result | Status and evidence |
|---|---|---|---|
| Enter directly, follow search, use Back/Forward and return after interruption: “Where am I and what am I doing here?” | Heading, selected navigation and any breadcrumbs identify the subject and purpose and agree on the current task and scope; a static environment label does not substitute for location. | | |
| Browse without a query, then follow the affected task path; distinguish reachability from understandable organization | The multipage directory includes secondary tasks. Selected tasks reveal useful content; groups reflect decisions and dependencies, including coupled controls and ambiguous names. | | |
| Inspect the first viewport and prominent regions at relevant widths, heights and enlargement; identify avoidable displacement and the value of repeated navigation | | | |
| Identify the next useful action and its expected effect; follow actionable status where present | The action's purpose is clear. Status links reveal the relevant section/control, place focus meaningfully and retain drafts, filters and useful return state. Informational values need no invented action. | | |
| Open and close contextual help and make the basic decision, including less-common and generated fields | Help is associated within the task's region and explains purpose, use/off cases, prerequisites and examples; closed help preserves essential context. Shared help works on direct entry. Record fallback-copy gaps separately. | | |
| Find and edit a value, including units and a supported blank/zero case | Explain valid input, effect of changing the value and documented default versus recommendation. Coupled controls explain their combined behavior accurately. | | |
| Inspect effective behavior or preview | Recognized and saved values are distinct from platform applicability and observed effects. Established unavailability is explained before editing; unknown behavior stays unverified. | | |
| Enter a record collection or operational log view, where in scope | Authorized initial data loads without a prerequisite Refresh. For warning triage, test counts across pages, acknowledgment versus resolution, retained history, new warnings and page-size changes under the [log guidance](GUIDE.md#readable-activity-and-warning-review). | | |
| Save and confirm the saved version | | | |
| Encounter failure and recover | | | |
| Leave and resume | | | |
| Connect selected source/detail, parent/children and action/result without color alone | | | |
| Check workspace destinations and local views; compare repeated breadcrumbs where provided | | | |
| Switch light/dark skins and text styles during pending work; preserve drafts, focus, filters and view | | | |
| Import/preview/cancel/apply/export preferences; distinguish unsupported requests and storage boundaries | | | |
| Compare pointer navigation focus with visible keyboard focus | | | |
| Recover task meaning and unfinished work after returning without context | | | |
| Complete with keyboard or other supported input | | | |
| Use narrow layout and enlarged text | | | |
| Measure contrast and target sizes in relevant states; record combinations, method and results | | | |
| Check reduced motion and forced colors or other supported accessibility overrides | | | |
| Read labels and grouped choices; distinguish selection, focus, actions and disabled states | | | |
| Identify independent settings and their active choices; compare previews with applied results | | | |
| Predict disclosure actions; find the current choice and required errors while sections are closed | | | |
| Open and close help without obscuring work or losing context | | | |
| Filter, reorder or switch comparison items without moving notes or decisions to another record, where applicable | | | |
| Identify dashboard priorities, metric scope/freshness and global versus local navigation or filters, where applicable | | | |
| Switch tabs/sub-tabs and expand related sections while retaining drafts, location and save scope, where applicable | | | |
| Find and reach an error inside hidden nested content; verify focus and accessible state, where applicable | | | |
| Skip preference questions and distinguish temporary choices from authorized storage, where applicable | | | |
| Validate profile structure and update/clear choices without erasing skipped values or crossing privacy boundaries, where applicable | | | |
| Interpret groups without color; verify selected cues and effective accessibility overrides, where applicable | | | |

Record UI evidence (presentation, semantics and control operation) separately from UX evidence (task understanding, effort, failure, recovery and return). Use Not applicable with a reason for save checks on read-only tasks. A visually correct state does not prove that the behavior producing it is correct.

Before concluding, ask: “What must the user read, remember, navigate or dismiss before they can do useful work—and which of those demands can we remove without losing capability or understanding?” Record material findings and tradeoffs here; retain useful orientation, necessary help, accessible targets and complete capability rather than forcing all work into the first viewport. Treat context as useful when removing it would make location or purpose harder to understand.

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
