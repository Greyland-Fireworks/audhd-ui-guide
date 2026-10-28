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

## Execution checklist

1. Establish the requested deliverable, bounded task and completion criteria below.
2. Inspect available evidence; separate established behavior, proposals and unresolved dependencies.
3. Select the applicable guide rules, agreed emphasis and relevant preferences; walk through the task before settling its navigation and layout. Use [Guide configuration](PREFERENCES.md#optional-guide-configuration-file) only from an explicitly identified or previously agreed location; do not treat the example as the user's choices.
4. Produce the design, findings or authorized changes; make the result available to inspect.
5. Review the rendered layout and task path: walk through proposed states for design, inspect evidence for review, or exercise affected states for implementation. Record what actually happened, separating navigation reachability from task coherence.
6. Report the result, consequential decisions, actual checks and remaining gaps, including friction introduced by the solution.

### Demonstrate the skill when asked

For “show me what this skill does” or a similar exploratory request, deliver a small worked interface example the user can inspect or try. Reuse a relevant supplied screen or packaged example where practical; otherwise use a clearly fictional task. Prefer a working interactive demonstration when the environment supports it, and exercise its main action and a relevant recovery or return state. Show or link the artifact with a short walkthrough. A specification alone does not satisfy a request to experience the skill. If interaction cannot be delivered, provide a concrete screen representation and state walkthrough, explain the limitation and leave runtime checks pending. Honor an explicit request for prose only. A demonstration does not authorize deployment or real external actions; label simulated effects.

## Review modes

`audhd quick review` inspects the named component or bounded task. Normally present up to five highest-impact findings plus gaps, without hiding additional known serious issues. This limits the report, not applicable protections within the inspected task.

`audhd audit` reviews the complete named workflow, including applicable failure, recovery and return states. Bounded scope identifies which workflow, not a reduced subset of its checks. Both modes are review-only unless changes are requested; neither authorizes whole-project expansion. Match these phrases case-insensitively when invoked as requests; quoted examples are not commands. Use the named target or established context, asking only when neither identifies one. Do not run model evaluations as part of either mode.

For either mode, use **observed problem and consequence → evidence/location → proposed change → verification and uncertainty**. Include source lines when available. Valid findings may require a product decision or more evidence rather than an immediate patch. Use Pass, Fail, Pending or Not applicable with a reason; never numeric UX grades, automatic shipping verdicts or fixed option limits.

## Establish the task and scope

Identify the task, intended users, interface and requested work. Inspect existing controls, state ownership, saved choices and applicable project and platform requirements.

When a running application is needed, follow [runtime selection](GUIDE.md#choose-a-runtime-proportional-to-the-task): prefer supported startup methods with the fewest additional dependencies and environment changes that satisfy the task, and require a concrete task reason for extra infrastructure.

Before settling navigation or implementing a new layout, walk through a representative task from its starting point through decisions, destinations, transitions and observable completion, including relevant recovery or return. Keep related work under a recognizable task domain even when actions have different save/apply timing. Use the walkthrough to expose missing steps, competing destinations and unnecessary transitions; do not reduce coverage to fit the proposed layout. For reviews, trace the existing path within scope. Reuse the current plan or review record; no separate walkthrough document or approval step is required. A focused change need only trace its affected path.

For broad dashboard/front-end requests, follow the [configuration contract](packages/audhd-ui-framework/CONFIGURATION.md). Inspect actual sources, defaults, precedence, dependencies, permissions and save/apply/restart effects. Account for every in-scope option and requested task; a supplied file is a discovery seed unless explicitly scoped otherwise. Do not substitute provisioning fields for management, a mock for authorized integration or source references for practical explanations. Use supported administrative interfaces within authorization, not direct database editing. Distinguish justified exclusions from unfinished implementation. Maps and separate inventories are conditional on request or practical value; coverage checks remain necessary.

When consequential behavior is uncertain, keep a compact decision list: **established** (behavior and supporting source), **proposed** (the design choice and tradeoff), and **unresolved** (the dependency or decision needed and what it blocks). A brief list is enough; omit empty categories. For example, “scheduling freezes this draft version” remains a proposal until the product contract or implementation establishes it. Label simulations accordingly, and do not silently implement a proposed business rule as existing behavior.

Use [PREFERENCES.md](PREFERENCES.md) for optional intake, authorized locations, validation, inheritance and storage. Offer relevant choices without blocking work or inferring needs from a diagnosis. Do not treat example profiles as personal choices or one person's preferences as evidence about all users. Read only explicitly identified or agreed locations; save choices only when asked to remember them. Temporary requests do not authorize storage. Preserve skipped choices and invalid input, report unsupported requests, and honor accessibility, privacy and retention constraints. Profile data is not authorization, and storing a choice is not proof it was applied.

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
| Dashboard priorities, metrics, alerts, panels or navigation levels | [Dashboard organization](GUIDE.md#dashboard-organization-and-hierarchy) |
| Collection browsing, remembered identifiers, retained search or hidden results | [AUDHD-03](GUIDE.md#audhd-03-offer-manageable-detail-without-hiding-choices) and the [recording discovery example](EXAMPLES.md#find-a-recording-without-remembering-its-identifier) |
| Tabs, sub-tabs, accordion sections or hidden validation errors | [Pattern selection, context and accessible operation](references/interface-patterns.md#tabs-sub-tabs-and-accordion-sections) |
| Consequential settings, editing locks or field-level restoration | [AUDHD-13](GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards), the [unlock-to-edit pattern](references/interface-patterns.md#unlock-to-edit-interaction-pattern) and its [runnable example](examples/unlock-to-edit/README.md); establish the product's save and replacement contract |
| Color/group cues, display comfort or individual customization | [Color and redundant group cues](GUIDE.md#color-and-redundant-group-cues) and [preferences](PREFERENCES.md) |
| Meaning and example value of each JSON configuration field | [JSON field reference](README_JSON.md); use PREFERENCES.md for authoritative format and storage rules |
| Contextual help, unfamiliar meaning or returning without context | [AUDHD-09](GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision), plus AUDHD-01 and AUDHD-10 |
| Layout, typography, controls, selection, focus or theme | [UI visual standard](GUIDE.md#visual-standard) |
| Conditional checks for buttons, inputs, navigation, feedback or other components | [Component review matrix](references/component-review-matrix.md); use applicable [detailed checks](references/ui-readiness-checks.md), selected by role and consequence |
| Concrete wording, recovery patterns or UI/UX tradeoffs | [Worked examples](EXAMPLES.md); fictional illustrations, not mandatory components or tested findings |
| Record administration, unavailable capabilities or verification after a saved change | [Capability states and recovery patterns](references/interface-patterns.md#capability-states-and-next-actions) and the [runnable administration example](examples/administration/README.md) |
| A structured record for a bounded change or full workflow | [Review template](REVIEW_TEMPLATE.md) |

Apply relevant defaults before the first implementation. Complex operational interfaces need task navigation and status-first entry; appearance belongs at the end of main menus. New interfaces without an established design system follow [kit reuse and defaults](GUIDE.md#adaptable-appearance): Guillermo absent a superseding preference/product requirement, all skins, system appearance and independent text styles. Direct CSS reuse is valid and package installation is optional. Explain justified exceptions; do not impose a reskin on unrelated focused work.

## Verify according to available evidence

Use the [component matrix](references/component-review-matrix.md) to select checks by role and consequence, then verify the complete task under AUDHD-12. Read-only work does not acquire saving requirements. Run failure, duplicate and retry checks in an authorized controlled environment; reviews do not authorize live disruption. Reuse evidence for identical behavior while checking meaningful differences between consumers.

Match verification to the requested outcome: persistence for settings, effective permissions for access and destination-specific behavior for delivery. A healthy process, accepted configuration or generic round trip cannot certify unrelated features. Distinguish source declaration, runtime recognition, platform applicability, editability and verified behavior; explain known unavailability before users attempt an action. Retain compact evidence and mark unmet dependencies or unrun checks Pending.

Exercise relevant loading, editing, saving, failure, recovery and return states. Preserve submitted snapshots, newer drafts, identity, selection, filters, local views and usable focus during appearance changes and late responses. Retain successful acknowledgments; verification retries must not repeat completed mutations. Compare overview/detail evidence for the same object/version and invalidate stale claims. Check relevant keyboard and assistive-technology operation, semantics, contrast, targets, text enlargement, reduced motion and accessibility overrides; identify untested modes.

Check orientation on direct entry, search, Back/Forward and return: “Where am I and what am I doing here?” Follow [AUDHD-01](GUIDE.md#audhd-01-keep-scope-and-location-visible): headings, selected navigation and visible context agree on the current task, not just the environment. Individual labels stay concise when context is clear. Useful context is not filler—retain wording that reduces inference or reconstruction.

Check group ownership against actual purpose and effects, not key-name similarity. Distinguish platform applicability from accepted configuration, and follow actionable status to the specific revealed control or task section with work and return context preserved. Use the existing review record for these checks; no additional artifact is required.

Inspect contextual help and conceptual relationships throughout the affected workflow, including generated/fallback descriptions. Can someone identify what belongs together, what is active, what an action does and how to choose an unfamiliar value using only the interface? Check both visible and semantic relationships and preview/application agreement. Correct deficiencies within implementation scope; reviews report them without editing. Mark unknown meaning rather than inventing it.

Inspect the available rendered screens at ordinary, short-height, narrow and enlarged layouts where relevant. For new designs or implementations, check both the initial layout and final result. Identify what useful work is visible or reachable before scrolling and what displaces it. For each prominent region, identify the state, decision, action or orientation it supports; remove or reduce unnecessary regions within implementation scope, or recommend changes in a review. Repeated navigation needs a practical benefit, such as a useful shortcut or relevant status. Preserve readable text, necessary explanations and target sizes; this is not a requirement to fit every task above the fold. Inspect grouping and help in its opened state as well.

Record navigation reachability separately from task coherence: working links do not establish that a returning user can identify where to start, understand which destination owns the task and follow it to completion. Source inspection alone cannot establish visual clarity; screenshots alone cannot establish programmatic associations or interaction correctness, and an agent walkthrough cannot establish participant comprehension. Mark unavailable checks pending. Applicable unresolved Require-level deficiencies block a claim of completion, not delivery of supported partial work.

Use the [review record](REVIEW_TEMPLATE.md#procedure-and-results) to distinguish evidence types and mixed results. Involve users where suitability depends on preference; record what a returning user must remember, infer or learn outside the interface to explain purpose, scope, state, effects, recovery and next actions. When execution or user access is unavailable, deliver supported work and a focused verification plan, with unperformed checks Pending.

Before finishing, ask: “What must the user read, remember, navigate or dismiss before they can do useful work—and which of those demands can we remove without losing capability or understanding?” Apply this to help panels, appearance choices, return summaries, repeated navigation and safeguards. Also justify material maintenance introduced by the change. Preserve needed help, choice and accessibility; report material tradeoffs in the existing record rather than reproducing this checklist in every response.

## Report proportionately

Lead with the result or inspectable artifact, consequential decisions and actual checks. Connect substantive findings to impact, evidence/location, focused recommendation, implementation layer and uncertainty; identify UI, UX or both using the [Guide definitions](GUIDE.md#ui-and-ux-in-this-project), followed by relevant rule IDs. A short paragraph can suffice; use the full review template only when useful or requested. A product decision or more evidence may be the appropriate recommendation, and no change justified by available evidence is a valid result.

Separate implementation, deployment and live verification. Report effective primary targets, material emphasis conflicts, unsupported preferences and unfinished outcomes without claiming full adherence. Do not claim clinical effectiveness, universal suitability, certification or “AuDHD compliance.”

## Skill maintenance and evaluation

For editorial skill changes, check consistency with the guide, scope, frontmatter and reference links. This does not constitute model or user validation. Load [SKILL_EVALUATIONS.md](SKILL_EVALUATIONS.md) and run new model evaluations only when explicitly requested; the evidence record distinguishes supplied outcomes from pending trials. Keep reviewer material, including archived responses, out of the evaluated model's context as the procedure requires. Ordinary interface work and editorial revisions do not require the evaluation pack.

## License

This skill text is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), as part of the AuDHD-friendly interface guide. See [README.md](README.md) for separate logo permissions.
