# Shared recording-review contract

[Run instructions](README.md) · [Evidence](ACCEPTANCE.md) · [Guide](../../GUIDE.md)

This specification defines observable outcomes, not a shared state engine. Fixtures are Harbor morning REC-001, Market loop REC-002 and Forest evening REC-003. Search covers name, date, map, seed and ID. Status/note drafts and simulated acknowledgments are per recording. Reload resets data; the hash restores valid location only.

| Checks | Required observable outcome | Rules |
|---|---|---|
| REF-01–02 | Truthful session boundary, initial state, scoped count and stable metadata search | AUDHD-01, 04, 07 |
| REF-03–06 | Filtering, record switching, disclosure and preferences preserve drafts and identity; filtered-out current item stays explicit | AUDHD-02, 03, 05, 10 |
| REF-07–11 | Pending save snapshots detach from later edits; failures/retries and stale completions remain scoped to the original attempt and record | AUDHD-04, 06, 07, 13 |
| REF-12–14 | Operable, readable relationships and controls at narrow/enlarged layouts, with redundant cues and supported system overrides | AUDHD-02, 08, 11, 12 |
| REF-15–16 | Complete-task/assistive-technology evidence is separate from inspection; reload truthfully resets memory-only reviews | AUDHD-10, 12 |
| NAV-01–06 | Accurate direct links, missing pages, manual local tabs, Back/Forward, top/bottom breadcrumbs, compact footer and hidden-view save recovery | AUDHD-01, 03, 05, 10, 11 |
| Appearance | All named skins and text styles apply without losing drafts, pending work, filters, record/view or focus; system follows only when selected | AUDHD-05, 10, 11 |
| Help | Real explanations, hover/keyboard/Escape, persistent click/tap detail, no hidden essential save limitation | AUDHD-04, 09, 11 |
| Profiles | Local strict parsing, v1 conversion preview, explicit session application, truthful unsupported requests and preference-only exports | AUDHD-04, 06, 10, 12, 13 |

Tests observe the rendered interface through shared scenarios and separately test each framework's state implementation. Passing a script does not establish every aspect of an entire REF group; consult the evidence record for actual coverage and pending manual checks.

## Relationships and navigation

The selected source card and its detail panel share an active-context surface, title accent and structural edge, driven by record ID. Unrelated cards remain neutral. A right/down connector follows reflow; current text, repeated identity and semantic associations remain when colors collapse. Collection labels introduce their actual lists, and “Reviewing…” returns to the open review. These are techniques implementing AUDHD-02, not required decoration for all products.

One static page map supplies the directory and canonical top/bottom breadcrumbs. Workspace destinations are links; Review/Recording details are manually activated local tabs. Footer sections are disclosed to reduce repetition; skip navigation bypasses repeated controls. Navigation moves focus deliberately, without forcing heading outlines after pointer activation. No initial autofocus or appearance-driven focus movement occurs.

## Proposed extension, not implemented

Multiple categories may reference the same stable page ID; future hover/focus cross-highlighting could expose all occurrences without scrolling or moving focus. Touch and nonvisual users would need persistent membership text. Membership does not establish ancestry. Canonical versus entry-category breadcrumbs, large-index disclosure and direct-link fallback need a separate decision before implementation. Authorization-filtered indexes, deep hierarchies and localization/RTL require their own integration checks.
