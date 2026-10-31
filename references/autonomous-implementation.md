# Autonomous implementation gates

Use this procedure for substantial dashboard implementation under the [six-step skill workflow](../SKILL.md#execution-workflow). The [Guide](../GUIDE.md) owns outcomes; this reference sequences execution. Reuse the current plan and [review record](../REVIEW_TEMPLATE.md#procedure-and-results), not a second checklist or a report per phase. A focused edit can combine phases while retaining the checks relevant to its consequences. Review-only requests do not authorize edits.

Continue automatically when the applicable exit evidence is established. Give concise progress updates: what changed, what was checked and what comes next. Ask only for consequential decisions that cannot be resolved from authorization or available evidence. Do not make participant exercises, approval of routine choices or repeated “continue” prompts prerequisites. Optional feedback can inform later refinement without transferring verification responsibility to the user.

## Phase exits

### A — Establish capabilities and complete tasks

Inspect supported application interfaces and existing behavior before choosing screens. For each requested task identify the intended outcome, capabilities, platform restrictions, records/settings, state ownership and visible completion/recovery path. Distinguish draft, saved, effective, submitted and verified state. Trace discovery through completion and return, grouping destinations by decisions rather than configuration-key prefixes.

**Exit evidence:** every in-scope task has a supported implementation path or a specific limitation with its dependency. Editable fields do not establish record management. An identified limitation remains a gap, not completion or permission to reduce scope.

### B — Build and inspect a representative slice

Implement one complete relevant workflow before repeating its layout. Include navigation and current location, practical help for an unfamiliar choice, units and combined effects for coupled values, applicable loading/empty/unavailable/error states, and an action with observable completion and recovery. Do not add irrelevant states or controls merely to populate the slice.

**Exit evidence:** exercise the workflow in a browser and inspect desktop and narrow renderings. Subject, purpose, important state and next action belong together. Record interaction results and visual observations separately; code review or a screenshot alone cannot satisfy this gate.

### C — Challenge state and recovery before scaling

Use controlled fixtures to challenge acceptance followed by a failed response or status read, newer editing during a pending operation, concurrent writers, stale verification and navigation/appearance changes during unfinished work. Select cases applicable to the actual persistence and mutation contracts. An in-memory example does not prove reload recovery.

**Exit evidence:** assert accepted operation identity, submitted snapshot, newer draft and mutation counts. Retries discover outcomes without duplicating accepted effects. Distinguish known success, uncertainty, failure and historical evidence. A newer draft survives; a clean refresh does not invent a conflict. Recovery must be reachable through the interface, not just an internal API test.

### D — Extend proven patterns

Complete remaining authorized tasks. Reuse working patterns while preserving differences in decisions, timing and consequences. Review generated labels and fallback help individually for purpose, use/off cases, units and examples where needed. Avoid mechanically repeating one large form or hiding every advanced capability.

**Exit evidence:** coverage accounts for the complete requested outcomes, coherent destinations and task-specific verification. Configuration uses its consuming workflow, access uses effective permissions and delivery uses the intended destination. A generic health check cannot certify unrelated behavior.

### E — Independently accept the integrated result

Where available, a reviewer who did not implement the relevant change inspects the integrated build. Give them the user task and acceptance criteria, not only the implementer's account. Review separately:

- Functional coverage, state integrity and recovery.
- Navigation, practical explanations and visual relationships.
- Keyboard behavior, responsive presentation and accessibility states.
- Accuracy and limits of verification claims.

**Exit evidence:** resolve required-outcome defects and rerun affected checks after integration. Record the reviewer, scope, findings and retests. If no independent agent is available, perform these responsibilities sequentially and identify the self-review fallback. Unperformed screen-reader/platform or participant checks remain pending. Neither fallback nor pending evidence may be presented as independent review or proven comprehension.

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
