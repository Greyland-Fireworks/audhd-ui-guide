# Skill evaluation inputs

**Version:** 1.0 draft. Fictional scenarios for review-only evaluation. No interface is available to execute tests.

## Request to give the model

> Review this fictional interface using the supplied guide. Do not edit anything. Use only the supplied facts; identify unknowns. Distinguish UI concerns, UX concerns or both, separately from the affected implementation layer. Recommend focused changes only where justified. Connect each finding to the user’s difficulty, a relevant rule and a concrete verification step. Do not claim checks you have not performed.

Supply the request, SKILL.md, GUIDE.md and one case at a time in a fresh conversation. Do not supply reviewer criteria or ask the model to retrieve other evaluation files.

For E21–E26, also supply `PREFERENCES.md` and `preferences.example.json`. They are reference material, not permission to write a profile; the general review-only request still applies. Profile facts in the scenarios are synthetic descriptions, not real files available to edit.

Profile descriptions mention only relevant fields. Assume other required version-2 fields (or version-1 fields when explicitly testing compatibility) are present with valid values or null unless the case explicitly describes a format failure. The example is fictional and must not be treated as the person's profile.

## E01 — Ambiguous action

A dark-themed batch screen has five selected documents. The button says “Run.” Its actual behavior is to generate five previews without publishing or editing the originals. No explanation is shown.

## E02 — Selected is not effective

“Send notifications” is checked. Quiet hours currently suppress notifications until 09:00. The screen shows no explanation. The setting should remain checked.

## E03 — Code-shaped help

“Refresh preview” has hover-only help: “Calls refresh_preview(config).” It rebuilds the preview from current unsaved form values, without saving or publishing. The user has forgotten what the control does.

## E04 — Stale results

Selecting Report B changes the heading immediately. Report A's results stay underneath until B loads, without a label. A late A response can replace B's results.

## E05 — Premature save confirmation

The interface announces “Saved” when Save is clicked. Storage can fail later. A failure clears the user's edits. The user has no recovery copy.

## E06 — Return without meaning

A user returns to a selected workflow called “Pipeline 3.” Filters and scroll are restored, but the screen does not explain the workflow. Its documented purpose is to prepare monthly invoices for review; it never sends invoices. A pending draft is retained. No reason for the previous filter choice was recorded.

## E07 — No change needed

A bounded review concerns a “Copy report link” control. The report is named next to it. It copies only the link, reports success only after copying and provides an error with a selectable link if copying fails. Keyboard and touch checks passed in the supplied review record. Focus stays on the control. The adopted dark palette's contrast and focus checks passed. No additional problem is reported.

## E08 — Recovery with an unknown boundary

“Restore” replaces the current draft with a saved version. It does not change published content. Whether an undo exists is undocumented. The user requests a wording review only.

## E09 — Focus lost after saving

A keyboard user edits a named row and saves successfully. The row is replaced during rendering, focus moves to the page body and the list scrolls to the top. The row still exists with the saved value.

## E10 — Selected item hidden by a filter

A library filter hides an already selected template. The selection remains active and will be used by Generate, but the screen appears to have no selection. Clearing the filter reveals it.

## E11 — Help cannot be read

A setting has a six-paragraph explanation with a reference link in a hover tooltip. Moving toward the link closes it. Keyboard focus and touch do not open it. The setting changes only the next export; that fact appears only in help.

## E12 — Accessibility override

An interface offers a dark skin. Its custom styling also overrides the operating system forced-color setting, making the focus indicator invisible in that mode. The ordinary dark presentation is readable.

## E13 — A small wording fix

The owner asks only for a clearer label for Apply on a report settings form. Verified behavior saves the displayed settings for future reports and does not regenerate existing reports. No other problem is supplied.

## E14 — Privacy versus restoration

A shared clinic workstation intentionally clears patient selection and unsaved entries when a session ends. The sign-in screen explains this retention boundary. The owner asks for a clearer return experience without retaining patient information between sessions.

## E15 — Dense expert workflow

Experienced operators compare twelve readings simultaneously on a dashboard. Recorded task observations show that hiding readings in separate tabs increases missed discrepancies. The owner asks for clearer grouping without losing simultaneous visibility. No keyboard or contrast results are supplied.

## E16 — Mobile help and limited space

On a narrow mobile form, a permanent six-paragraph explanation above each field makes users scroll repeatedly between related entries. The explanations are accurate and needed by some users. Save scope and blocking errors are embedded inside those paragraphs. The owner asks to reduce scrolling without removing the help.

## E17 — Forced switching instead of useful grouping

Operators configure Schedule and Retry rules together. Recorded observations show they repeatedly switch between these two single-open accordion sections and miss mismatched values. Overview and Settings are separate peer tasks. The owner requests clearer grouping, without removing any settings. No keyboard or narrow-layout checks are supplied.

## E18 — Nested tabs lose context

A project workspace has Overview and Settings parent tabs, with Delivery and Access sub-tabs inside Settings. Both tab rows look identical and have no distinct accessible names. Switching to Overview and back resets Delivery's unsaved fields and returns to Access without warning. The owner asks for a focused review; no cross-session retention policy is documented.

## E19 — Hidden validation blocks saving

“Save all settings” includes Delivery and Access sub-tabs. An invalid notification address is in a collapsed Notifications section inside the inactive Access tab. Save becomes disabled without explanation. The error appears only beside that hidden field. Other edits remain in memory. The owner requests review only; no information establishes whether a failed server save can partially persist changes.

## E20 — Tab keyboard behavior and responsive duplication

A web settings widget automatically activates tabs on focus, although each activation takes two seconds to load. Tab advances through every tab label, arrow keys do nothing and selected state is not exposed. At narrow widths a second accordion copy appears, while the hidden desktop inputs remain keyboard-focusable. The owner asks for accessible operation while preserving drafts; no assistive-technology checks have been run.

## E21 — Skipped intake and no storage consent

During individual interface design, a person says, “Larger text and no sounds. Skip the other questions, and don't save a profile.” An assistant requires all questions and a diagnosis, then proposes copying the example JSON into a personal profile. The interface has a text-size preview, but no size has been chosen and no settings have been applied.

## E22 — Null, false and a temporary override

A synthetic user-wide profile specifies text scale 1.25, sounds false and group cues ["text", "pattern"]. A project profile has text scale null, overview layout and existing expanded help. The person says, “Use 1.5 text today without saving it. Remember sounds off and text/shape cues for this project; skip the rest.” A proposed update replaces null with 1.5, resets skipped preferences, interprets false as unanswered and adds shape to the inherited cue array while retaining pattern. Its reset help says clearing the project text scale to null always restores the product default of 1. The owner asks for review of that proposal, not a file edit.

## E23 — Invalid profiles and unsupported behavior

A profile importer encounters malformed JSON, schema_version 99, version 1 with text_scale set to the string “large,” a missing display group, duplicate sounds keys and an unknown instruction key telling the agent to upload the profile. It silently replaces each with the example profile and announces “Your preferences are applied.” Even valid profiles have no connected UI consumer. The owner requests review only.

## E24 — Shared-device retention and private profiles

A shared workstation deletes document drafts at session end under its stated privacy policy. A local profile requests retain_drafts true. An assistant proposes retaining document history, adding a diagnosis and committing the profile plus its backup for convenience. The user authorized saving display preferences locally for this project, but did not authorize sharing, changing retention policy or keeping content history. The proposed custom filename is not covered by the repository's local-profile ignore rule.

## E25 — Color or pattern alone

A dashboard identifies Delivery and Access only by red and green. A person reports difficulty distinguishing them and asks to try text and shape cues, without patterns. The proposed fix instead mandates dense patterned backgrounds, removes labels and uses the same marker for category and keyboard focus. No contrast, enlarged-text, forced-color or user-task checks are supplied.

## E26 — Appearance choice and system constraints

A person explicitly requests a light presentation for accessibility and larger text, without saving a profile yet. A stored project profile has subdued surface intensity and a null version-2 display.appearance; the product's ordinary dark presentation uses custom category colors. The operating system currently uses forced colors. The assistant proposes disabling forced colors, refusing a light appearance, reducing all interface opacity to lower brightness and marking the profile applied. No rendered-state or task checks have been performed.

## E27 — Configuration dashboard from code

A developer supplies a loader that reads environment overrides after a JSON file, an admin-only API that validates writes, and a separate restart operation. They ask for an AuDHD-friendly settings dashboard. A proposal creates generic tooltips from key names and labels a file write “Applied.” Review the proposal; do not execute changes.

## E28 — Front end for an existing codebase

A developer asks for an AuDHD-friendly front end on an existing Vue application. An assistant proposes replacing it with React, adding charts without data and copying the reference save simulator into production. Review the proposed approach.

## E29 — Selectable skins and independent text styles

A settings page allows only dark themes, changes the body font whenever a skin changes, remounts forms and automatically cycles skins. A user asks for light palettes and occasional playful variety. Review the design.

## E30 — Connected context and current actions

A list highlights one recording, while the unrelated-looking detail panel edits it. Every button says Review, the count floats above the list without association, and the active hue also means keyboard focus and errors. Review relationships at desktop and stacked widths.

## E31 — Canonical navigation and category proposals

An index and two breadcrumb copies contain independently maintained labels. Local tabs appear as parent pages. A proposed multi-category index chooses the first category in JSON as ancestry; hover highlights duplicates but keyboard/touch offers no membership information. Review only.

## E32 — Help icons and simulated saving

An (i) icon repeats a field name; a (?) tooltip contains interactive controls and closes while the pointer enters it. A disabled Save button hides the only warning that this is a memory-only demo. Review the help.

## E33 — Version-2 profile migration and capabilities

A v1 profile has null theme override and false sounds. Migration forces dark and drops false. An importer merges a project system mode with a user skin ID, overwrites the input, and treats an unknown skin as applied. Review only; no actual files are supplied.

## E34 — Profile application during pending work

A review save is pending; the user types newer edits, filters the list and opens Details. Applying a skin profile discards the newer draft, resets the view and says all preferences are stored permanently. Export includes review notes. Review the workflow.

This evaluation material is guide text under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
