// Authored teaching copy shared by the existing disclosure IDs. Rationale and
// exercise controls stay at their owning renderers; this table adds an adjacent
// takeaway and observation, never an action. AUDHD-03/09:
// ../../GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision.
// Source names point to the implementation, not evidence of production safety.
export const teachingContent = {
  'overview-design': {
    takeaway: 'Problems, unfinished drafts and unchecked access are separate queues. Problem emphasis identifies a known blocker or failure; an unchecked role means evidence is still missing.',
    check: 'Compare an unchecked account with a failed permission check. Only the failure should increase the problem count; follow its link to the affected account.',
    alternative: 'A monitoring console may prioritize failures more strongly than this coordination workspace. Keep routine work visible without giving it alarm styling.', source: 'app.js'
  },
  'navigation-design': {
    takeaway: 'The selected branch and linked breadcrumbs show where this task belongs. Warning badges report problems; ordinary counts describe records.',
    check: 'Open a nested task, edit a draft, follow an ancestor and use Back. The draft should remain. On a narrow screen, open Sections and find the same destinations.',
    alternative: 'A small single-task interface may not need nested navigation.', source: 'app.js'
  },
  'calendar-time-design': {
    takeaway: 'In the week timeline, position shows start time and length shows duration. Parallel events show simultaneous meetings; the narrow view keeps one day readable.',
    check: 'Compare a short and a long meeting with their written times. Inspect overlapping meetings in the busy scenario, then switch to the readable meeting list.',
    alternative: 'Use Agenda when scanning event details matters more than comparing free time.', source: 'schedule.js'
  },
  'calendar-month-design': {
    takeaway: 'Dates occupy consistent weekday columns. Selecting a date reveals its meetings below the grid without compressing their details into a tiny cell.',
    check: 'Cross a month boundary, select a date and compare its meeting count with the list. Repeat on a narrow screen.',
    alternative: 'Use Week to compare durations; a month cell does not encode event length.', source: 'schedule.js'
  },
  'calendar-agenda-design': {
    takeaway: 'Each date and its meetings share a boundary and inset. That edge shows where one day ends and the next begins.',
    check: 'Scan from the last meeting of one date to the next heading. At narrow widths, every meeting should still clearly belong to one date.', source: 'schedule.js'
  },
  'room-search-design': {
    takeaway: 'Find available rooms submits the requirements together. Editing a field changes the proposal, not the criteria behind the previous results.',
    check: 'Run a search, then change the time without submitting. The old results should be marked outdated and unavailable for continuing; search again to refresh them.',
    alternative: 'Immediate filtering is useful for a local list of known records. A multi-field availability check needs a clear submission boundary.', source: 'schedule.js'
  },
  'room-lanes-design': {
    takeaway: 'Compact room choices support comparison; selecting one reveals its schedule and next action. Availability describes the submitted requirements, not an unsaved edit.',
    check: 'Select another room and observe the detail heading receive focus. Nothing should be booked. Try a failed search: retained results must not appear freshly checked.', source: 'schedule.js'
  },
  'meeting-conflict-design': {
    takeaway: 'A proposal can become unavailable before it is saved. The error and alternatives stay beside the proposal so recovery does not require starting again.',
    check: 'Use the simulated conflict below on a suitable proposal. Choose an alternative, then cancel a discard confirmation: the edited meeting must remain.', source: 'schedule.js'
  },
  'task-board-design': {
    takeaway: 'Status columns place similar work together; each card keeps owner, due date and next action in the same order. The list view offers the same work without requiring dragging.',
    check: 'Switch between board and list. Open a blocked task and follow its prerequisite or request; compare the same record and status in both views.',
    alternative: 'Prefer a list when comparing many fields or reading sequentially. Columns are useful when the distribution of work matters.', source: 'work.js'
  },
  'task-ownership-guide': {
    takeaway: 'Dependencies are explicit links, not clues hidden in a task description. Approval of a related request does not prove the equipment arrived or the work finished.',
    check: 'Follow a blocked task’s request and approve its submitted details. Return to the task: changing its status remains a separate decision.', source: 'work.js'
  },
  'request-snapshot-guide': {
    takeaway: 'The stages identify the next decision. Submitted details and newer edits remain separate so an approval cannot silently cover changes the reviewer never saw.',
    check: 'Submit a request, edit a newer draft, then inspect the submitted details. They should still match the original submission.', source: 'work.js'
  },
  'notes-browse-design': {
    takeaway: 'Visible notes and notebook context support recognition before searching. Filtering narrows the collection without becoming the only way to discover it.',
    check: 'Filter by a title, open a note, then return. Check that the filter and notebook context remain available.', source: 'notes.js'
  },
  'note-edit-design': {
    takeaway: 'The saved note and your working draft have different owners. Save feedback stays beside the action; navigation and optional help do not silently save your text.',
    check: 'Edit text and notebook selection, navigate away and return. Both should survive as a draft; save deliberately and inspect the local receipt.', source: 'notes.js'
  },
  'note-version-design': {
    takeaway: 'The selected saved version and current version are compared side by side. Restoring creates a proposal you can inspect before saving it.',
    check: 'Restore an older version into a draft. Confirm the current saved note is unchanged until Save; cancel any replacement of an existing draft.',
    alternative: 'On narrow screens the comparisons stack in the same labeled order rather than squeeze text into thin columns.', source: 'notes.js'
  },
  'notebooks-design': {
    takeaway: 'Each count stays inside a group with its label. Notebook cards connect that summary to recognizable notes instead of making you interpret detached numbers.',
    check: 'Resize the page and compare Active, Archived and Trash counts with their associated notebook. Try partial results and look for the unavailable portion.', source: 'notes-tools.js'
  },
  'people-design': {
    takeaway: 'Account cards keep role consequences, check status and the relevant action together. An untested role is different from a failed access check.',
    check: 'Compare an account on Overview and Users & access. Its role, problem state and corrective destination should agree even when the list is filtered.', source: 'app.js'
  },
  'access-design': {
    takeaway: 'Saved access and proposed access are shown separately. Reader and Editor describe allowed actions beside the choices, before you save.',
    check: 'Choose a different role without saving. The saved role must stay unchanged; navigate away and back to confirm the proposal survives.', source: 'app.js'
  },
  'verification-design': {
    takeaway: 'A permission check tests one saved version. Repeating the check refreshes evidence without repeating the save or replacing a newer draft.',
    check: 'Check twice and compare the attempt receipts. Save a different role: the earlier result must no longer certify the new version. Recover from the optional failed check without another write.', source: 'app.js'
  },
  'workspace-defaults-design': {
    takeaway: 'Current and proposed settings share one decision group. The impact preview names notes affected by a smaller limit; existing text is never silently shortened.',
    check: 'Save a smaller limit, explicitly prepare the example draft below and attempt an oversized save. Correct the retained text and save again. Existing drafts keep their notebook.', source: 'notes-tools.js'
  },
  'request-policy-notes': {
    takeaway: 'Quantity and time form one allowance policy. The illustration explains it; acceptance or rejection of an actual simulated request demonstrates enforcement.',
    check: 'Fill and save the demonstration preset, exhaust the allowance, then advance the teaching clock and retry explicitly. Rejection must retain the draft; recovery of an accepted ID must not charge it again.', source: 'request-settings.js'
  },
  'transfer-design': {
    takeaway: 'A preview is a chance to inspect a file before applying it. Import checks the current rules again; exporting a JSON file is separate from requesting a simulated export.',
    check: 'Preview an import, lower the note limit, then apply. Oversized content must be rejected under the new limit rather than accepted using stale preview assumptions.', source: 'notes-tools.js'
  },
  'activity-reading': {
    takeaway: 'Severity describes an event; acknowledgment records that you saw it, not that its cause was resolved. New arrivals wait behind a notice so the rows you are reading stay still.',
    check: 'Acknowledge and restore a warning across pages. Generate another session action, return and reveal new entries explicitly; example history must remain separately counted.', source: 'activity.js'
  },
  'directory-design': {
    takeaway: 'Category cards and indented children expose the page hierarchy. You can browse without recalling a search term, and filtering keeps the matching destination’s ancestry.',
    check: 'Filter for a child page. Confirm its parent remains visible and the link reaches the correct task; clear the filter to browse all destinations.', source: 'app.js'
  },
  'appearance-design': {
    takeaway: 'Each preview uses its skin’s canonical colors and paired typography. The Current marker identifies the applied skin; keyboard focus identifies the choice you are exploring.',
    check: 'Leave an unfinished draft, select another skin and return to the task. The draft and task must remain intact. Tab through skins and distinguish focus from Current.',
    alternative: 'These paired looks follow this demo’s preference. An established product may have its own appearance and accessibility requirements.', source: 'app.js'
  },
  'scenario-design': {
    takeaway: 'Empty, failed, partial and stale results mean different things. Teaching controls change simulated conditions explicitly; opening these notes changes none of them.',
    check: 'Cancel a workspace replacement. Try a failed refresh and retry. Toggle configuration permission while editing: proposed values must remain, and restricted saves must be blocked.', source: 'scenario-ui.js'
  },
  'request-identity': {
    takeaway: 'An accepted request keeps its identity even when the response is lost. Recovery asks about that request rather than creating another one.',
    check: 'Simulate a lost response after acceptance, keep a newer draft, and recover the original request. Its ID and accepted count must stay unchanged.', source: 'recovery.js'
  },
  'failure-controls': {
    takeaway: 'Failure preparation is explicit and separate from recovery. Hiding Guide Notes must not remove the action needed to finish the task.',
    check: 'Select a failure for the next request, trigger it, then turn Guide Notes off. The ordinary recovery action should remain usable.', source: 'recovery.js'
  },
  'capabilities-design': {
    takeaway: 'Unavailable actions need a reason and an honest next step. A visible configuration field alone does not prove that a service can perform the task.',
    check: 'Compare editable, read-only and unavailable examples. Identify which action is possible now and which prerequisite is missing.', source: 'app.js'
  }
};
