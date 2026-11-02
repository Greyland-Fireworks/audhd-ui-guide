# Autonomous implementation gates

Use this procedure for substantial dashboard implementation under the [six-step skill workflow](../SKILL.md#execution-workflow). The [Guide](../GUIDE.md) owns outcomes; this reference sequences execution. Reuse the current plan and [review record](../REVIEW_TEMPLATE.md#procedure-and-results), not a second checklist or a report per phase. A focused edit can combine phases while retaining the checks relevant to its consequences. Review-only requests do not authorize edits.

Continue automatically when the applicable exit evidence is established. Give concise progress updates: what changed, what was checked and what comes next. Ask only for consequential decisions that cannot be resolved from authorization or available evidence. Do not make participant exercises, approval of routine choices or repeated “continue” prompts prerequisites. Optional feedback can inform later refinement without transferring verification responsibility to the user.

## Phase exits

For each exit, attach the task/control and route, build, reviewer, evidence method, observed result and repair/retest reference to the existing review rows. Use Pass, Fail, Pending or Not applicable with a reason. A required failed or unperformed check blocks acceptance of that outcome; unrelated passes cannot offset it. Continue independent authorized work, but do not replicate a layout whose representative slice failed or declare the integrated task verified while required evidence is missing. If tooling is unavailable, name the blocked check and dependency; a self-review fallback still requires the same rendered interactions. These are agent-owned checks, not requests for user approval.

Keep the [acceptance disposition](../REVIEW_TEMPLATE.md#acceptance-disposition) current at each exit, before starting dependent work. At completion, name unresolved gates and the concrete next action instead of treating them as optional follow-ups. A previously passed gate reopens when a change invalidates its evidence; rerun the affected check rather than resetting unrelated gates. Use this record to decide whether dependent work can start; no automated test count certifies rendered quality.

### A — Establish capabilities and complete tasks

Inspect supported application interfaces and existing behavior before choosing screens. For each requested task identify the intended outcome, capabilities, platform restrictions, records/settings, state ownership and visible completion/recovery path. Distinguish draft, saved, effective, submitted and verified state. Trace discovery through completion and return, grouping destinations by decisions rather than configuration-key prefixes.

**Exit evidence:** every in-scope task has a supported implementation path or a specific limitation with its dependency. Editable fields do not establish record management. An identified limitation remains a gap, not completion or permission to reduce scope.

Keep option inventory and task completion separate in the same record: for each requested outcome, identify discovery, decision, action, observed effect and recovery. Logging configuration does not establish event reading or warning triage; an account database path does not establish account administration. Classify limitations as platform restrictions, missing dependencies or unfinished implementation rather than counting all three as delivered coverage.

### B — Build and inspect a representative slice

Implement one complete relevant workflow before repeating its layout. Include navigation and current location, practical help for an unfamiliar choice, units and combined effects for coupled values, applicable loading/empty/unavailable/error states, and an action with observable completion and recovery. Do not add irrelevant states or controls merely to populate the slice.

**Exit evidence:** exercise the workflow in a browser and inspect desktop and narrow renderings. Subject, purpose, important state and next action belong together. Record interaction results and visual observations separately; code review or a screenshot alone cannot satisfy this gate.

Choose a slice that exposes the difficult design decisions: an unfamiliar choice and coupled values where the product has them. Follow primary and secondary navigation without relying on a remembered search term. Open help, inspect below the first viewport, and change each coupled value to check its combined effect. Repair unclear grouping, unexplained terminology or detached feedback before repeating the pattern. Do not choose only the easiest form to justify every other layout.

### C — Challenge state and recovery before scaling

Use controlled fixtures to challenge acceptance followed by a failed response or status read, newer editing during a pending operation, concurrent writers, stale verification and navigation/appearance changes during unfinished work. Select cases applicable to the actual persistence and mutation contracts. An in-memory example does not prove reload recovery.

**Exit evidence:** assert accepted operation identity, submitted snapshot, newer draft and mutation counts. Retries discover outcomes without duplicating accepted effects. Distinguish known success, uncertainty, failure and historical evidence. A newer draft survives; a clean refresh does not invent a conflict. Recovery must be reachable through the interface, not just an internal API test.

### D — Extend proven patterns

Complete remaining authorized tasks. Reuse working patterns while preserving differences in decisions, timing and consequences. Avoid mechanically repeating one large form or hiding every advanced capability.

**Exit evidence:** coverage accounts for the complete requested outcomes, coherent destinations and task-specific verification. Configuration uses its consuming workflow, access uses effective permissions and delivery uses the intended destination. A generic health check cannot certify unrelated behavior.

Review unfamiliar labels and explanations individually, including generated, fallback and read-only entries. Explain purpose, when to use or leave off, units, consequences and a concrete example where needed; do not substitute another unexplained term. Keep essential information visible when help is closed. Record deficient fields and their corrections in the existing rows; populated help metadata is not a pass. Inspect directory category membership and sibling order, and group coupled controls as one visibly bounded decision with their combined effect. A complete list or zero document overflow does not establish understandable organization.

### E — Independently accept the integrated result

Where available, a reviewer who did not implement the relevant change inspects the integrated build. Give them the user task and acceptance criteria, not only the implementer's account. Review separately:

- Functional coverage, state integrity and recovery.
- Navigation, practical explanations and visual relationships.
- Keyboard behavior, responsive presentation and accessibility states.
- Accuracy and limits of verification claims.

**Exit evidence:** resolve required-outcome defects and rerun affected checks after integration. Record the reviewer, scope, findings and retests. If no independent agent is available, perform these responsibilities sequentially and identify the self-review fallback. Unperformed screen-reader/platform or participant checks remain pending. Neither fallback nor pending evidence may be presented as independent review or proven comprehension.

Give the reviewer access to the rendered build and controlled fixtures. Require evidence for task discovery, explanations, coupled-control relationships and visible completion/recovery as well as source findings. Exercise consequential forms through their browser controls; API success cannot close their interaction checks. Record source-only review as source-only, leaving rendered acceptance Pending. Keep functional coverage, recovery, navigation, explanations and visual organization as separate results; a later test number, more options or a larger test suite establishes no overall improvement.

## Dashboard review lights

Include the five A–E review lights in dashboard builds by default, starting with the first runnable shell. Reuse the shared display through the [small Harbor implementation and update tool](../examples/administration/README.md#visible-build-review), or adapt it to the consumer's existing stack without adding a framework. The lights expose the existing acceptance disposition; they are not an optional teaching overlay and must remain available with Guide notes off. Reviews and unrelated focused edits do not acquire this implementation requirement. Record an explicit user exclusion when applicable.

1. **Initialize the current build.** Create a Pending record and bind both the dashboard and its review record to a source fingerprint from the consumer's build/start process. Include relevant source/configuration inputs; exclude the review record itself and generated evidence to avoid an update loop. Reset the completion clock on a changed build. Harbor's build/start hook emits its actual source fingerprint; consumer integrations must do the same. Reassess previously recorded evidence for the new build before advancing its lights; explain reused observations and rerun invalidated checks.
2. **Advance at actual phase exits.** Use the same evidence as the acceptance record: build, task/route, check, observation, reviewer, method and evidence reference. Use the supplied updater or an equivalent validated writer, enforcing milestone order and required checks; the browser has no manual pass switches. Keep required failures and missing checks unlit. Reopening a gate also reopens dependent gates and resets the clock. Do not mark all lights passed at handoff merely because the server starts or tests pass. Use the canonical check set and declared readonly, memory or persistent task contract; preserve every applicable recovery check above and below. Never invent a passing exercise for an unsupported operation.
3. **Give the user a correction path.** Hover guidance must say: “If any of these lights are not illuminated, re-run your dashboard-building sequence with high effort to correct it.” Make the same guidance and named unfinished checks available by keyboard and touch, with accessible labels and status cues beyond color. Explain that the user selects high effort in their coding agent; the dashboard cannot change it. Keep the bar compact enough that task controls remain usable in the initial narrow viewport, and retain drafts and focus while evidence refreshes.
4. **Retire the bar honestly.** After all required gates have passed continuously for 24 hours on the same build, hide the bar while retaining the evidence record. Reopened gates, invalid/unavailable evidence and a new build make it visible again. Persist the completion timestamp across reload; never backdate it or shorten the interval to make a trial look finished. Keep an open/focused evidence panel until the user closes it. Missing evidence must default to unverified, not green.
5. **Verify the consumer integration.** Exercise Pending → Pass, refused advancement with missing evidence/prior gates, reopening, new-build invalidation, unavailable evidence, reload and the 24-hour boundary with a controlled clock. Inspect the rendered bar and correction details on desktop/narrow screens and through keyboard input. Preserve production timing and the actual review record when testing. Record simulated time separately from elapsed observation. These checks verify the mechanism; they do not establish that the dashboard passed A–E. In the handoff, report the actual lights, remaining checks and review method.

An LLM with source write access can bypass a local writer. The lights report evidence attributed to a reviewer, not independent certification. Identify sequential self-review explicitly; stronger authority separation requires an independently controlled reviewer or CI publisher. Do not create a remote service or grant permissions merely to add this indicator. If the build binding or required integration checks are incomplete, leave the relevant acceptance outcome unfinished rather than presenting a disconnected decorative bar as working enforcement.

Use the [executable review workflow](review-tooling.md) for schema-2 evidence, explicit assertion adapters and capability comparisons. Declare each mutation task and required control/local/external verification level using the [ordered command path](review-tooling.md#start-here-one-implementation-path). Repair stages require a capability baseline even for newly generated dashboards. Keep reviewer method and unverified scope visible beside completion. A general recovery pass cannot close the separate missing-receipt, acknowledged-read and named-return outcomes. Keep prior-build observations historical and record actual review timing before pattern reuse.

## Ownership and coordination

Use at most three concurrent specialists alongside the orchestrator, only where independent review or bounded parallel work adds value.

| Responsibility | Ownership and handoff |
|---|---|
| Orchestrator | Own scope, architecture, shared state contracts, sequential integration and final acceptance; reconcile evidence and unresolved limitations. |
| Workflow specialist | Implement explicitly assigned tasks/files, explanations, navigation and completion states; hand off changed areas, delivered behavior and executed checks. |
| State/recovery specialist | Inspect mutation boundaries, concurrency, persistence and retries; provide reproductions, invariant failures and regression results. |
| Usability/accessibility specialist | Independently inspect rendered grouping, orientation, focus, keyboard and responsive behavior; tie findings to screens and interactions. |

Establish shared state contracts and explicit file ownership before parallel edits. Do not edit the same owning module concurrently. Integrate sequentially and run integrated checks; an isolated agent pass is insufficient. Require executed evidence rather than “looks good” summaries. Resolve disagreements against requirements and observed behavior. After two unsuccessful repair cycles on one defect, reassess the cause or assignment rather than repeat superficial patches. When specialist tools are unavailable, retain these responsibilities sequentially in one agent.

## Evidence and automation

Before extending regression coverage, classify proposed cases as covered, partially covered, missing or not applicable to the example's persistence model. Identify the owning implementation/check and extend it rather than duplicate suites. A consumer defect under an existing rule does not establish a missing toolkit requirement.

### Recovery coverage to preserve

The following existing owners are starting points, not certification of a consumer. Record applicability and current execution evidence in the same review rows. Preserve substantive assertions when adapting labels or layout. All listed checks run through `npm run validate:toolkit`.

| Transition and invariant | Existing check and boundary |
|---|---|
| Lost save outcome versus received acknowledgment followed by failed status read; newer draft; reload; visible read-only recovery; one mutation | [Persistent fixture check](../tests/persistent-recovery-check.mjs). Persistent simulated service/journal, not a production backend or Harbor persistence. |
| Dirty baseline survives another writer and reload until deliberate reconciliation; clean refresh adopts current data without a false conflict | [Persistent fixture check](../tests/persistent-recovery-check.mjs). Consumers must exercise their actual concurrency contract. |
| Two drafts, open help and immutable submitted snapshot survive Appearance, reload and a named return to field, section or overview; focus returns to that subject | [Persistent fixture check](../tests/persistent-recovery-check.mjs). Simulated local journal; consumer routes, retention boundaries and real records need their own checks. |
| Accepted identity and submitted snapshot survive verification failure; missing receipt retains historical evidence; repeated checks update evidence without resending | [Harbor recovery check](../examples/administration/recovery-check.mjs). Memory-only simulation, explicitly resets on reload. |
| Initial load failure differs from empty results; failed refresh retains records/freshness; older responses cannot replace newer results | [Notebook checks](../examples/administration/notes-tools-check.mjs) and [room-search checks](../examples/administration/schedule-check.mjs). In-memory collections. |
| Storage access, write and removal fail separately; useful memory work and truthful persistence warnings survive unrelated updates | [Persistent fixture check](../tests/persistent-recovery-check.mjs). A failed removal must not claim erasure. |
| Dynamic results, same-route error focus and appearance/help detours preserve useful context | [Harbor navigation checks](../examples/administration/check.mjs) and [recovery checks](../examples/administration/recovery-check.mjs). Consumer reload/return-anchor behavior remains a separate check where durable recovery is promised. |

Do not replace one failure with a superficially similar case: a lost acknowledgment differs from a failed read after acknowledgment; recovered values differ from a recovered task location. Verify the consumer's serialized journal contains the original submitted snapshot and acknowledgment as well as its operation ID; an in-memory field does not establish reload recovery. For durable consumers, combine two drafts and open help with an Appearance detour, reload and named return, checking field/section/overview origins. Harbor's declared reset cannot stand in for that evidence.

For each consumer collection that can refresh (such as accounts or tokens), exercise the rendered list's initial failure, empty success and failed refresh after populated success. Retain previously loaded records and freshness with a stale/error indication after failure; do not replace the only copy of useful records with an error string. Existing notebook/room checks establish example behavior only, not coverage of every consumer list.

Use existing deterministic runners, deferred responses, injectable faults and clocks where supported. Check mutation counts and retained work; avoid arbitrary timing sleeps. Preserve substantive existing assertions when labels or markup change. Routine aggregate validation must retain failure output/artifacts, fail for required executed failures, identify unavailable/skipped checks and avoid rewriting tracked gallery captures or historical records.

Browser inspection remains a separate gate: inspect arrival, a populated record below the first viewport, local help, errors, completion, loading/stale/unavailable data, narrow layouts and actual 200% browser zoom. Exercise keyboard focus and supported forced-color/reduced-motion modes. Record unavailable modes rather than substituting root-text enlargement for browser zoom. Use a separate inspection tab when the user's workspace has in-memory work.

Report four evidence categories separately: automated behavior; agent visual/keyboard inspection; screen-reader/platform checks; participant feedback. An automated pass is not proof of understandable grouping, user suitability or production integration. A later controlled generation comparison is separate work, not implied by these checks.

## Where simplification must stop

Apply the [priority hierarchy](../GUIDE.md#priority-hierarchy-and-conflicts) and [outcome-value allocation](../GUIDE.md#allocate-effort-by-outcome-value). Reduce unnecessary machinery, not coverage, usable explanations or verification. In particular:

- Keep visual relationships that explain time, scope, comparison and dependencies; prose alone may force the user to reconstruct them.
- Retain purpose, units, examples and consequences, with optional detail locally disclosed. Native controls still need readable sizing, labels and rendered inspection.
- Keep meaningful tasks visible, unavailable capabilities discoverable and distinct decisions appropriately separated.
- Preserve structured activity presentation, actionable recovery, intent-focused comments and optional teaching content where required.
- Do not ship a reduced workflow and ask whether the user wants the remainder, accept a happy-path test for multi-stage recovery, or replace inspection with a reviewer's unchecked assurances.

The governing constraint is: simplify the implementation without making the user perform the missing work.
