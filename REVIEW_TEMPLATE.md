# Interface review record

Copy this template for one bounded task. Remove personal information from public evidence; use synthetic content where possible.

## Short review for a focused change

Use this instead of the full record for a small, bounded issue. Include the rule ID, build and environment with the check. Expand to the full review when several states or an entire workflow are affected.

- **Task:**
- **Difficulty:**
- **Relevant rule IDs and evidence source:**
- **Aspect:** UI, UX or both; use the [project definitions](GUIDE.md#ui-and-ux-in-this-project).
- **Proposed change and affected layer:** wording/layout, interaction state, navigation, persistence or business logic.
- **Check and actual result:**
- **Remaining uncertainty:**

A proposed check is Pending until performed. A short review does not establish that the whole interface passes the guide.

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

## Procedure and results

Use Pass, Fail, Pending or Not applicable with a reason. Do not mark an unperformed check passed.

| Action | Expected result | Observed result | Status and evidence |
|---|---|---|---|
| Enter and identify current context | | | |
| Understand purpose and next actions without remembering the implementation | | | |
| Open contextual help and predict the control's effect in plain English | | | |
| Find and edit a value | | | |
| Inspect effective behavior or preview | | | |
| Save and confirm the saved version | | | |
| Encounter failure and recover | | | |
| Leave and resume | | | |
| Recover task meaning and unfinished work after returning without context | | | |
| Complete with keyboard or other supported input | | | |
| Use narrow layout and enlarged text | | | |
| Measure contrast and target sizes in relevant states; record combinations, method and results | | | |
| Check reduced motion and forced colors or other supported accessibility overrides | | | |
| Read labels and grouped choices; distinguish selection, focus, actions and disabled states | | | |
| Open and close help without obscuring work or losing context | | | |
| Filter, reorder or switch comparison items without moving notes or decisions to another record, where applicable | | | |
| Identify dashboard priorities, metric scope/freshness and global versus local navigation or filters, where applicable | | | |
| Switch tabs/sub-tabs and expand related sections while retaining drafts, location and save scope, where applicable | | | |
| Find and reach an error inside hidden nested content; verify focus and accessible state, where applicable | | | |
| Skip preference questions and distinguish temporary choices from authorized storage, where applicable | | | |
| Validate profile structure and update/clear choices without erasing skipped values or crossing privacy boundaries, where applicable | | | |
| Interpret groups without color; verify selected cues and effective accessibility overrides, where applicable | | | |

Record UI evidence (presentation, semantics and control operation) separately from UX evidence (task understanding, effort, failure, recovery and return). Use Not applicable with a reason for save checks on read-only tasks. A visually correct state does not prove that the behavior producing it is correct.

## User feedback

### Returning without memory

Using only the interface and its help, ask the reviewer to explain:

- What is this for, and what item or scope is selected?
- What has happened, and how current is that information?
- What will each relevant action do, and when?
- Is the work saved, and where?
- How can a mistake be recovered, and what are the limits?
- What can be done next?

Record missing or incorrect answers, where help was sought, and prior familiarity with the implementation. Attribute supplied observations to their source; label agent walkthroughs as inspection, not user feedback. If no user participated, leave user checks pending. Do not require a person to demonstrate memory difficulties to participate.

### Difficulty and tradeoffs

- Observed difficulty or preference, in the participant's terms:
- Task and conditions under which it occurred:
- Alternative tested and outcome:
- What the user had to remember, infer or recover:
- Repeated decisions, view switches or interruptions needed to finish:
- Added friction or capability lost through the proposed fix:
- Evidence type: proposal, personal experience, observed difficulty, tested change or external source:
- Consent and privacy considerations for sharing this evidence:

Do not require a diagnosis or public disclosure of disability to accept feedback. One person's preference is valuable evidence, not a universal rule.

## Outcome and follow-up

- Implementation status:
- Deployment status:
- Verified behavior and remaining gaps:
- Exception, alternative and review condition:
- Next action and responsible person or team:

For each finding, connect the difficulty to a relevant rule, a focused recommendation and a concrete check. “No change justified by available evidence” is a valid result.

Use claims supported by this record. Passing these checks does not establish clinical benefit or certify accessibility conformance.
