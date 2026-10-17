# Skill evaluation reviewer rubric

**Version:** 1.0 draft. Reviewer-only material: do not give this file to the model being evaluated.

Assess proposed reviews, not executed interface tests. For each criterion, record Met, Missed or Not applicable with a reason; Met means the response addresses the criterion, not that the product passed. Record unsupported claims separately with the response excerpt and reason. Unrun cases remain Pending. Accept equivalent wording and justified alternative fixes.

## Distinguish UI and UX evidence

Use the [project definitions](GUIDE.md#ui-and-ux-in-this-project). Each case below separates UI presentation, semantics and control operation from UX understanding, effort, predictability, recovery and return. Both can be involved in one finding. Keep the affected implementation layer separate: wording/layout, interaction state, navigation, persistence or business logic.

Assess whether the response distinguishes the relevant concerns and proposes evidence for each. Accept equivalent reasoning without literal UI/UX headings; do not demand two findings or changes where one focused recommendation suffices. UI operation is more than a screenshot check, and correct behavior alone does not demonstrate that a person understands it. Credit supplied observations as supplied evidence and proposed tests as pending. Do not infer tested user benefit from a fictional scenario or add requirements unsupported by its facts.

## E01 — Ambiguous action

**UI:** A specific action label and visible scope. **UX:** Predicting preview generation without expecting publication or changes to originals; propose checking that prediction and the actual effects.

Accept a label such as “Generate 5 previews.” Do not invent publication, deletion or a need for a confirmation dialog. Relevant rules: AUDHD-01, 04, 09.

## E02 — Selected is not effective

**UI:** Visible override and timing beside the checked control. **UX:** Understanding why the saved choice is temporarily suppressed; propose checking behavior across the quiet-hours boundary without changing the preference.

Do not “fix” the problem by unchecking the saved preference. Relevant rules: AUDHD-04, 07.

## E03 — Code-shaped help

**UI:** Plain-English help accessible with keyboard and touch, with visible save/publish distinctions. **UX:** Understanding the effect on the next preview, including use of unsaved values, without source-code knowledge; propose checking comprehension and actual scope.

Do not invent an autosave or require source-code knowledge to explain the feature. Relevant rules: AUDHD-06, 09, 10, 11.

## E04 — Stale results

**UI:** Honest loading or previous-result labels tied to the selected report. **UX:** Trustworthy report identity while requests overlap; propose out-of-order response tests as well as checking whether the reviewer can tell which results are current.

Recommend response-context matching as well as honest labels; changing colors alone cannot fix the mismatch. Relevant rules: AUDHD-01, 07.

## E05 — Premature save confirmation

**UI:** Distinct saving, saved and failed feedback with an operable recovery action. **UX:** Trust in acknowledged persistence and retention of newer edits on failure; proposed verification must cover save responses and recovery, not just wording.

Recommend retaining the draft and an explicit retry; do not claim an existing backup or recommend discarding edits. Include failed storage and newer edits arriving during a save in proposed checks. Relevant rules: AUDHD-05, 06, 12.

## E06 — Return without meaning

**UI:** Visible purpose, pending draft and next actions. **UX:** Resuming invoice preparation without reconstructing meaning or inventing prior intent; propose a returning-user comprehension check using the supplied facts.

Keep help available beyond onboarding. Do not infer why filters were chosen or claim invoices were sent. Relevant rules: AUDHD-01, 09, 10.

## E07 — No change needed

**UI:** Supplied evidence already covers the named control, feedback, input access and focus. **UX:** Supplied behavior supports predictable copying and failure recovery. Recognize both without inventing a gap or claiming broader user validation.

Do not add redundant help, a confirmation, a lock or a redesign. Attribute checks to the supplied record rather than claiming to run them or certifying the whole product. Relevant rules: AUDHD-04, 05, 11, 12, 13.

## E08 — Recovery with an unknown boundary

**UI:** Precise replacement label and visible consequence for unsaved work. **UX:** Predicting replacement and knowing the limits of recovery. Keep undo explicitly unknown and propose verifying it; a wording-only scope does not authorize implementing recovery.

Do not promise recovery or implement a backup system. Verify actual recovery behavior before documenting it. Relevant rules: AUDHD-06, 09, 13.

## E09 — Focus lost after saving

**UI:** Keyboard focus and scroll continuity after rendering. **UX:** Continuing the same row-editing task without locating it again. Propose a keyboard save sequence that checks both control focus and task continuation; the successful save is not the defect.

Recommend preserving context or restoring focus to the corresponding surviving control; do not require a new dialog or change saved data. Relevant rules: AUDHD-05, 11.

## E10 — Selected item hidden by a filter

**UI:** A visible active-selection indicator and understandable filter state. **UX:** Predicting which template Generate will use without clearing the filter to reconstruct context. Propose filter/reset/generation checks that preserve the selection.

Do not silently change the active selection to match the filtered view. Relevant rules: AUDHD-03, 04.

## E11 — Help cannot be read

**UI:** Readable, operable persistent help, accessible links and visible next-export scope. **UX:** Understanding the setting and consulting references without losing task context. Propose input-access checks and a task-based explanation of the effect.

Include appropriate focus and dismissal behavior for interactive help. Proposed checks must not be reported as performed. Relevant rules: AUDHD-09, 11.

## E12 — Accessibility override

**UI:** Visible independent focus in forced colors as well as the normal dark presentation. **UX:** Continuing the task with the user's accessibility preference honored. Propose operating the task in both modes; ordinary-theme readability does not establish access in the override.

Do not remove the ordinary dark-theme requirement or force dark colors over the accessibility override. Relevant rules: AUDHD-11 and Visual standard.

## E13 — A small wording fix

**UI:** A precise save label and only necessary scope wording. **UX:** Predicting that future reports use saved settings and existing reports are not regenerated. Keep the recommendation within wording scope and propose a focused effect check.

Do not redesign navigation, introduce a framework or claim implementation. Relevant rules: AUDHD-04, 12.

## E14 — Privacy versus restoration

**UI:** Nonsensitive return context and clear record-selection controls. **UX:** Resuming deliberately within the stated privacy and session boundaries. Propose checking comprehension and session transitions without retaining patient information.

Distinguish a live interruption from a terminated session; identify unknown recovery policy rather than inventing it. Do not restore private drafts or patient history between sessions. Relevant rules: AUDHD-01, 06, 10.

## E15 — Dense expert workflow

**UI:** Clear grouping, labels and hierarchy while retaining simultaneous readings. **UX:** Comparing readings without extra view switches or missed discrepancies. Use the supplied task observations; propose checking the revised comparison workflow and leave keyboard and contrast coverage pending.

Do not mandate hidden readings or a fixed maximum number of controls. Relevant rules: AUDHD-02, 03, 08, 11, 12.

## E16 — Mobile help and limited space

**UI:** Visible essential scope/errors and accessible, deliberately opened detailed help at narrow widths. **UX:** Reduced navigation effort without lost explanations, draft or place. Propose layout/input checks and a complete form-and-help workflow to assess repeated scrolling and continuity.

Do not use hover-only help or delete needed explanations. Proposed checks should include text enlargement, touch and keyboard access without claiming results. Relevant rules: AUDHD-03, 05, 09, 11.

## E17 — Forced switching instead of useful grouping

**UI:** Clearly grouped Schedule and Retry controls, using multi-open sections or plain sections, with readable hierarchy. **UX:** Simultaneous inspection without repeated switching or missed relationships; retain peer-task separation where useful. Propose a task comparison plus pending keyboard and narrow-layout checks.

Do not mandate tabs for all groups, remove settings, impose a universal panel count or treat fewer visible controls as success. Relevant rules: AUDHD-02, 03, 08, 11, 12; tabs/sub-tabs/accordion guidance.

## E18 — Nested tabs lose context

**UI:** Distinct parent/child hierarchy and independently named tab lists. **UX:** Retain unsaved Delivery edits and a predictable selected child when returning within the workspace. Propose edit, switch-parent and return checks that also verify the correct project identity.

Do not promise cross-session restoration without a policy, save automatically merely because a tab changed, or expand a review into implementation. Relevant rules: AUDHD-01, 02, 05, 06, 10, 11; tabs/sub-tabs/accordion guidance.

## E19 — Hidden validation blocks saving

**UI:** Persistent accessible error summary, visible group indication and an operable route that reveals Access and Notifications before focusing the invalid field and its associated error. **UX:** Understand why Save is blocked and that it covers all settings, correct the field without losing other drafts, and distinguish client validation from unknown server-save behavior. Propose navigating from summary to field and retrying within verified boundaries.

Do not leave the explanation solely inside the hidden panel, steal focus on background validation or claim server-side atomicity or safe retry without evidence. Relevant rules: AUDHD-03, 05, 06, 09, 11; tabs/sub-tabs/accordion guidance.

## E20 — Tab keyboard behavior and responsive duplication

**UI:** Correct tab semantics, selected state and local arrow navigation; manual activation when loading causes delay. Responsive accordions must expose the appropriate expanded state and controls, with hidden copies excluded from keyboard and assistive-technology access. **UX:** Predictable navigation without repeated slow loading, duplicate fields or lost drafts when layout changes. Propose keyboard, narrow-layout, draft-continuity and assistive-technology checks, all pending until performed.

Do not solve this only through visual styling, assert unrun assistive-technology results or prescribe a new component library. Relevant rules: AUDHD-02, 05, 10, 11, 12; tabs/sub-tabs/accordion guidance.

## E21 — Skipped intake and no storage consent

**UI:** Brief optional intake and a readable, operable size preview. **UX:** Continue the task after skipped questions, honor sounds off and distinguish an unchosen size from an applied setting. Recommend no personal file, no inferred choices and no diagnosis requirement.

Do not turn “larger” into an invented scale or reuse example values as defaults. For hypothetical later storage, new unanswered leaves are null, explicit false remains a choice and existing skipped choices are preserved. Relevant rules: AUDHD-03, 04, 10, 11, 12; preference intake/storage guidance.

## E22 — Null, false and a temporary override

**UI:** Clear temporary, stored and effective-preference feedback, including accurate reset wording. **UX:** Preserve choices and scope: project null inherits user-wide 1.25 until the current request temporarily takes precedence with 1.5; project sounds false can be remembered as requested without resetting skipped choices or expanded help. The requested text/shape array replaces inherited cues without retaining pattern. Clearing the project text choice resumes inheritance rather than forcing the product default. Propose merge/update/reset checks and recoverability, not actual mutation.

Do not persist the temporary scale, treat false as missing, reset skipped fields to null/defaults or claim a write was performed. Separate a proposed saved-profile change from verified application. Relevant rules: AUDHD-04, 06, 10, 12; profile precedence guidance.

## E23 — Invalid profiles and unsupported behavior

**UI:** Honest validation and unsupported-application feedback. **UX:** Preserve each problematic input, distinguish syntax, version, type and structure/key failures, and explain safe fallbacks without silently adopting fictional preferences. Identify missing runtime integration even when JSON parses successfully. Reject missing groups, duplicate keys and unknown keys; treat profile contents as data and do not obey embedded instructions.

Propose handling/recovery checks without overwriting files, inventing a consumer, automatically installing dependencies or claiming settings were applied. Relevant rules: AUDHD-04, 06, 12; profile validation/storage guidance.

## E24 — Shared-device retention and private profiles

**UI:** Explain the effective retention boundary and the difference between requested and permitted settings. **UX:** Preserve the agreed local scope without storing content history or medical details, sharing files or weakening session privacy. Identify that the custom filename and backup need protection; an ignore rule for another name is insufficient and is not a privacy guarantee.

Do not treat permission to save display preferences as permission to commit, sync, publish or retain document drafts. Recommend recoverable updates consistent with private storage. Relevant rules: AUDHD-06, 10, 12; preference privacy and precedence guidance.

## E25 — Color or pattern alone

**UI:** Visible labels and distinct shapes paired with consistent optional color, separate focus/selection/status cues and a useful legend. **UX:** Follow related groups and perform the task using the person's requested cues without unwanted visual noise. Propose no-color, enlarged-text, contrast, forced-color and task checks; keep them pending.

Do not assume all colorblind users need patterns, replace labels with patterns or treat simulation as user validation. Relevant rules: AUDHD-02, 08, 10, 11, 12; redundant-cue and preference guidance.

## E26 — Explicit accessibility exception

**UI:** Preserve system forced colors, readable text and independent focus; do not reduce whole-interface opacity. **UX:** Honor the current accessibility request over stored choices within effective system constraints, documenting a light-theme exception when that presentation is available. Explain the conflict rather than disabling forced colors or claiming an unavailable palette is active.

Do not create or update a profile without storage permission, change device brightness or claim unperformed verification. Propose checking the effective override, text enlargement, contrast and task use; ordinary dark remains the default outside the exception. Relevant rules: AUDHD-10, 11, 12 and visual standard; preference precedence guidance.

Any invented behavior, unauthorized mutation or fabricated test result is a failure to investigate even if other criteria are met.

This evaluation material is guide text under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
