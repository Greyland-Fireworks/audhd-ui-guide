---
name: audhd-ui-guide
description: Design, review or improve UI and UX using AuDHD-friendly interaction rules, accessible selectable appearance and verifiable workflow continuity. Use when the user says "audhd audit", or for dashboard organization, settings forms, status feedback, accessible controls and interruption recovery; not clinical advice or certification.
---

# AuDHD-friendly UI and UX guidance

Build a practical interface that helps people complete technical tasks with the least avoidable effort.

Treat attention, working memory and screen space as valuable resources. For users who experience distraction, overload or difficulty resuming work, unnecessary reading and navigation can become real barriers.

Put useful state, clear decisions and necessary actions first. Every prominent element should help someone understand, act, orient themselves or recover. Remove slogans, redundant introductions and decoration that competes with the task.

Make complexity navigable; do not remove required capabilities to make the screen look simpler. Do not add extraneous text or prevaricate. Preserve necessary explanations, accessible controls and individual appearance preferences. Visual polish should come from coherent hierarchy, readable relationships and reliable operation.

Use [GUIDE.md](GUIDE.md) as the authoritative rulebook and visual standard; keep rule definitions in the guide. Load supporting references through the mechanism provided by the host:

- **Filesystem installation:** Resolve relative links from the installed directory containing this `SKILL.md`, not the current working directory.
- **Skill-resource API:** Discover the matching installed skill through the host's skill listing and use its returned canonical package, authority and resource identifiers. Read supporting files under that canonical skill root using the complete identifiers required by the reader, not bare filenames. Do not assume a cloud-facing `SKILL.md` identifier also addresses its supporting files. If cloud addressing fails and an executor skill listing is available, discover the matching executor installation and retry with its canonical identifiers. Never hard-code another installation's package ID or root.

If the guide still cannot be read, report the attempted resource, access mechanism and returned error (or that no read mechanism is available). Distinguish failed access from confirmed absence; a read error alone does not establish an installation problem. Continue only within the evidence available and do not claim to have applied unread guide rules.

## Execution workflow

1. **Establish the task.** Identify the deliverable and completion criteria below. Inspect existing behavior; distinguish established facts, proposed choices and unresolved dependencies. Select applicable rules, agreed emphasis and relevant preferences.
2. **Trace the task before its navigation.** Walk from entry through decisions, destinations and transitions to observable completion, including relevant recovery or return. Keep related work under a recognizable task domain even when save/apply timing differs. Use the current plan or review record; a focused change traces only its affected path.
3. **Prove a representative path before repeating it.** For a new or substantially revised interface, render an applicable unfamiliar setting, coupled values, unavailable capability and failure/recovery state before extending the pattern. Inspect local help, grouping and usable actions. Reuse supplied examples; do not add irrelevant components to fill this list. Reviews inspect the existing path.
4. **Connect authorized behavior.** Implement the requested tasks and necessary coverage under the configuration contract below. Do not substitute editable fields for management, simulations for authorized integration or source references for explanations.
5. **Verify the delivered task.** Exercise its affected rendered states. Match verification to the intended outcome and distinguish navigation reachability from task coherence. Fix deficiencies within implementation scope; reviews report them without editing.
6. **Refine and report.** Inspect initial and final layouts, including opened help and narrow/enlarged views. Preserve readable text and targets while removing avoidable reading and navigation. Report actual checks, remaining gaps and friction introduced by the solution.

### Demonstrate the skill when asked

For “show me what this skill does,” deliver a small inspectable interface, reusing a supplied example or clearly fictional task. Prefer an interactive demonstration; exercise its main action and relevant recovery/return. Show it with a short walkthrough; a specification alone is insufficient. If interaction is unavailable, provide a concrete screen and state walkthrough and leave runtime checks pending. Honor prose-only requests. Label simulation; demonstration does not authorize deployment or external actions.

## Review modes

`audhd quick review` inspects the named component or bounded task. Normally present up to five highest-impact findings plus gaps, without hiding additional known serious issues. This limits the report, not applicable protections within the inspected task.

`audhd audit` reviews the complete named workflow, including applicable failure, recovery and return states. Bounded scope identifies which workflow, not a reduced subset of its checks. Both modes are review-only unless changes are requested; neither authorizes whole-project expansion. Match these phrases case-insensitively when invoked as requests; quoted examples are not commands. Use the named target or established context, asking only when neither identifies one. Do not run model evaluations as part of either mode.

For either mode, use **observed problem and consequence → evidence/location → proposed change → verification and uncertainty**. Include source lines when available. Valid findings may require a product decision or more evidence rather than an immediate patch. Use Pass, Fail, Pending or Not applicable with a reason; never numeric UX grades, automatic shipping verdicts or fixed option limits.

## Establish the task and scope

Identify the task, intended users, interface and requested work. Inspect existing controls, state ownership, saved choices and applicable project and platform requirements.

When a running application is needed, follow [runtime selection](GUIDE.md#choose-a-runtime-proportional-to-the-task): prefer supported startup methods with the fewest additional dependencies and environment changes that satisfy the task, and require a concrete task reason for extra infrastructure.

For broad dashboard/front-end requests, follow the [configuration contract](packages/audhd-ui-framework/CONFIGURATION.md). Inspect sources, defaults, precedence, dependencies, permissions and save/apply/restart effects. Account for every in-scope option and requested task; a supplied file is a discovery seed unless explicitly scoped otherwise. Do not reduce coverage to fit a layout. Use supported administrative interfaces within authorization, not direct database editing. Distinguish justified exclusions from unfinished implementation. Maps and separate inventories are conditional on request or practical value; coverage checks remain necessary.

For uncertain consequential behavior, record **established** behavior and source, **proposed** choices and tradeoffs, and **unresolved** dependencies and what they block. Omit empty categories. Label simulations; do not implement a proposed business rule as established behavior.

Use [PREFERENCES.md](PREFERENCES.md) for intake, validation, inheritance and storage, including optional [Guide configuration](PREFERENCES.md#optional-guide-configuration-file). Read only explicitly identified or agreed locations. Offer relevant choices without blocking work or inferring needs from diagnosis; example profiles are not personal choices, and one person's preference is not universal evidence. Save choices only when asked to remember them; temporary requests do not authorize storage. Preserve skipped choices and invalid input, report unsupported requests and respect accessibility, privacy and retention constraints. Profile data is not authorization; storing a choice does not prove application.

| Request | Completion criteria within the agreed scope |
|---|---|
| Design | A concrete screen representation (such as a rendered mockup, wireframe or prototype) and walkthrough from entry through the intended result, including relevant failure, recovery or return states. Make it available to inspect; identify proposals and unverified behavior. A validation plan accompanies the design and remains pending until executed. Honor an explicitly requested text-only specification. |
| Review | Inspect the available target evidence and return prioritized findings tied to that evidence, or explain why no change is justified. Name the inspected scope and evidence gaps. Do not edit unless requested; limited evidence supports only a limited review. |
| Implement | Deliver the authorized interface changes and exercise the affected task in the rendered interface, including relevant failure, recovery or return states. Report observed results and how to inspect the result. Source code, a mockup or proposed tests alone do not establish completed implementation verification. |

“End to end” refers to the agreed task, from entry to its intended outcome and applicable recovery or return paths. If a required artifact or check cannot be completed, deliver the supported work and identify the unfinished part and specific dependency; do not relabel a plan as execution or claim the whole task is complete.

Follow explicit user instructions and applicable project requirements. Document conflicts and scoped exceptions rather than claiming full adherence. A focused wording or interaction fix does not authorize recoloring an entire application. Accessible behavior is mandatory across supported light and dark appearances. Preserve chosen skins/text styles and do not prescribe a universal AuDHD preset. Honor explicit accessibility overrides, including forced colors.

## Read the relevant guidance

Follow the Guide's [priority hierarchy](GUIDE.md#priority-hierarchy-and-conflicts) and [rule emphasis definitions](GUIDE.md#rule-emphasis-and-primary-targets). When configuration is supplied, resolve inheritance using [preference configuration](PREFERENCES.md#configure-rule-emphasis); otherwise use Apply. Lower emphasis never waives adopted requirements, and rule IDs are not priority ranks. Configuration does not authorize storing a profile.

[GUIDE.md](GUIDE.md) owns the outcome rules and defaults. Read its quick review and relevant rules before choosing controls. References provide conditional procedures and examples; load the sections needed for the task, not every file. Do not turn examples into mandatory components.

| Task or uncertainty | Read |
|---|---|
| Dashboard priorities, metrics, alerts, panels or navigation levels | [Dashboard organization](GUIDE.md#dashboard-organization-and-hierarchy) and the [worked design decisions](examples/administration/README.md#worked-design-decisions); adapt the reasoning, not the example's page structure |
| Browsing pages or records without remembered names; retained search or hidden results | [Workspace index](GUIDE.md#authoritative-navigation-and-repeated-orientation), [AUDHD-03](GUIDE.md#audhd-03-offer-manageable-detail-without-hiding-choices) and the [recording discovery example](EXAMPLES.md#find-a-recording-without-remembering-its-identifier) |
| Tabs, sub-tabs, accordion sections or hidden validation errors | [Pattern selection, context and accessible operation](references/interface-patterns.md#tabs-sub-tabs-and-accordion-sections) |
| Consequential settings, editing locks or field-level restoration | [AUDHD-13](GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards), the [unlock-to-edit pattern](references/interface-patterns.md#unlock-to-edit-interaction-pattern) and its [runnable example](examples/unlock-to-edit/README.md); establish the product's save and replacement contract |
| Color/group cues, display comfort or individual customization | [Color and redundant group cues](GUIDE.md#color-and-redundant-group-cues) and [preferences](PREFERENCES.md) |
| Meaning and example value of each JSON configuration field | [JSON field reference](README_JSON.md); use PREFERENCES.md for authoritative format and storage rules |
| Contextual help, unfamiliar meaning, units or coupled numeric values | [AUDHD-09](GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision), [local help pattern](references/interface-patterns.md#keep-associated-help-beside-its-subject) and the [administration example](examples/administration/README.md) |
| Raw activity, warning counts or acknowledgment | [Readable activity and warning review](GUIDE.md#readable-activity-and-warning-review) and the [administration example](examples/administration/README.md) |
| Layout, typography, controls, selection, focus or theme | [UI visual standard](GUIDE.md#visual-standard) |
| Conditional checks for buttons, inputs, navigation, feedback or other components | [Component review matrix](references/component-review-matrix.md); use applicable [detailed checks](references/ui-readiness-checks.md), selected by role and consequence |
| Concrete wording, recovery patterns or UI/UX tradeoffs | [Worked examples](EXAMPLES.md); fictional illustrations, not mandatory components or tested findings |
| Record administration, unavailable capabilities or verification after a saved change | [Capability states and recovery patterns](references/interface-patterns.md#capability-states-and-next-actions) and the [runnable administration example](examples/administration/README.md) |
| A structured record for a bounded change or full workflow | [Review template](REVIEW_TEMPLATE.md) |

Apply relevant defaults before the first implementation. Complex operational interfaces need task navigation and status-first entry; multipage workspaces need a browsable directory, and appearance belongs last, adjacent to the other main-menu entries. New interfaces without an established design system follow [kit reuse and defaults](GUIDE.md#adaptable-appearance): Guillermo absent a superseding preference/product requirement, all skins, system appearance and independent text styles. Direct CSS reuse is valid and package installation is optional. Explain justified exceptions; do not impose a reskin on unrelated focused work.

## Verify according to available evidence

Select checks through the [component matrix](references/component-review-matrix.md), then verify the complete task under AUDHD-12. Read-only work does not acquire saving requirements. Use authorized controlled fixtures for failure, duplicate and retry checks; reviews do not authorize live disruption. Reuse evidence for identical behavior, but check meaningful differences between consumers, including the [declared reload and storage boundaries](references/ui-readiness-checks.md#check-49). Memory-only examples do not prove durable recovery or acquire a persistence requirement.

- **Coverage and truth:** Verify the declared persistence boundary and the consuming workflow for settings, effective permissions for access and destination-specific delivery. A healthy process, accepted configuration or generic round trip proves only its tested path. Distinguish source-declared, runtime-recognized, platform-applicable, editable and behavior-verified states; explain known unavailability before an attempt.
- **Navigation and orientation:** Enter directly, browse without a query, search where supported, use Back/Forward and return. Headings, selected navigation and visible context must answer “Where am I and what am I doing here?” Trace groups to actual purpose, not key similarity. Follow status/error links to revealed, focused controls with drafts and useful return state retained. Record reachability separately from task coherence; working links do not prove understandable organization. Useful context is not filler.
- **Practical choices:** Inspect unfamiliar and generated/fallback help, not just curated fields. Test concrete values, units, blank/off cases and coupled effects; check local visible/semantic associations with help open and closed. Instructions must name discoverable actions, and previews must agree with application. Mark unknown meaning rather than inventing it.
- **State and recovery:** Exercise loading, editing, saving, failure and return. Preserve submitted identity/snapshot, acknowledgment, newer drafts, selection, filters, local views and focus through navigation, appearance changes and late responses. Test a lost response after acceptance through the visible recovery action and observe mutation counts; manually repeating an API key does not verify UI recovery. Verification retries must not repeat completed mutations. Overview/detail must agree on object/version and identify stale evidence.
- **Rendered layout and accessibility:** Inspect ordinary, short-height, narrow and enlarged layouts where relevant, including opened help. Check semantics, keyboard/assistive-technology operation, contrast, computed text/target sizes, reduced motion and overrides; identify untested modes. Account for each prominent region's state, decision, action or orientation purpose and what displaces useful work before scrolling. Repeated navigation needs practical value. Do not force every task above the fold or shrink essential text.

Use the existing [review record](REVIEW_TEMPLATE.md#procedure-and-results) for evidence types and mixed results; no additional report is required. Source inspection cannot establish visual clarity; screenshots cannot establish semantics or interaction; agent walkthroughs cannot establish participant comprehension. Involve users where suitability depends on preference and record what they must infer or learn outside the interface. Leave unmet dependencies and unrun checks Pending. When execution/user access is unavailable, deliver supported work and a focused verification plan. Applicable unresolved Require-level deficiencies block a completion claim, not delivery of supported partial work.

Before finishing, ask: “What must the user read, remember, navigate or dismiss before they can do useful work—and which of those demands can we remove without losing capability or understanding?” Apply this to help panels, appearance choices, return summaries, repeated navigation and safeguards. Also justify material maintenance introduced by the change. Preserve needed help, choice and accessibility; report material tradeoffs in the existing record rather than reproducing this checklist in every response.

## Report proportionately

Lead with the result or inspectable artifact, consequential decisions and actual checks. Connect substantive findings to impact, evidence/location, focused recommendation, implementation layer and uncertainty; identify UI, UX or both using the [Guide definitions](GUIDE.md#ui-and-ux-in-this-project), followed by relevant rule IDs. Distinguish consumer defects under existing rules from toolkit coverage gaps and participant questions; keep reused dated evidence separate from new execution. A short paragraph can suffice; use the full review template only when useful or requested. A product decision or more evidence may be the appropriate recommendation, and no change justified by available evidence is a valid result.

Separate implementation, deployment and live verification. Report effective primary targets, material emphasis conflicts, unsupported preferences and unfinished outcomes without claiming full adherence. Do not claim clinical effectiveness, universal suitability, certification or “AuDHD compliance.”

## Skill maintenance and evaluation

For editorial skill changes, check consistency with the guide, scope, frontmatter and reference links. This does not constitute model or user validation. Load [SKILL_EVALUATIONS.md](SKILL_EVALUATIONS.md) and run new model evaluations only when explicitly requested; the evidence record distinguishes supplied outcomes from pending trials. Keep reviewer material, including archived responses, out of the evaluated model's context as the procedure requires. Ordinary interface work and editorial revisions do not require the evaluation pack.

## License

This skill text is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), as part of the AuDHD-friendly interface guide. See [README.md](README.md) for separate logo permissions.
