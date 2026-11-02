# Local executable review evidence

Toolkit 1.1.3 uses schema-version 2 review records. Guide rules remain v1.01; framework and preference schemas retain their own versions. This is a local evidence workflow, not a certification or a claim that generated dashboards have improved.

The [shared core](../scripts/review-core.js) owns stable checks and A–E membership. It links to AUDHD-12 rather than maintaining another rulebook. Required outcomes use automated assertions, rendered observations, or both. Advisory observations stay outside the blocking set. Optional participant feedback and untested platforms remain explicitly separate.

## Start here: one implementation path

Use this sequence instead of reading every supporting document up front. Keep the [Guide](../GUIDE.md) authoritative; this page is the command path, not a second rulebook.

| Stage | Do now | Continue when |
|---|---|---|
| A — Task contract | Declare tasks, mutation types, source inputs and required verification levels; initialize and record rendered task paths. | Required task paths pass. |
| B — One complete workflow | Build and operate one representative slice; run navigation and record its rendered review before reuse. | B passes; its original milestone is saved automatically. |
| C — Recovery | Exercise the scenario matrix below for each mutation task; record rendered recovery observations. | Applicable recovery assertions and rendered outcomes pass. |
| D — Expand | Extend the proven pattern; exercise consuming behavior and review individual explanations. | Each task reaches its declared verification level. |
| E — Integrated review | Compare repair inventories, retest behavior, inspect the actual mounted review bar and complete rendered review. | Required outcomes pass, with method and unverified scope visible. |

Start with `init`, use `report` to find the next missing outcome, and run only explicitly named adapters. A successful process exit is not overall acceptance. Freeze a before inventory before repairs, even for a dashboard created during this same task.

## Configure and initialize

Copy the shape of [Harbor's configuration](../examples/administration/review.config.json) into the consumer project. Declare actual source files/directories, task contract, evidence paths and explicit adapters. Include local assets, configuration and lockfiles. Missing inputs and paths outside the project root fail. Dependencies, caches, generated output, review evidence and common secret files are excluded. Do not select secrets or place them in evidence artifacts. The local static example can serve evidence references; publish only intentionally public, non-sensitive artifacts.

The current working toolkit requires these additional contract declarations. Existing schema-2 configurations must add them and reinitialize; old records remain historical, never automatically green:

```json
{
  "stage": "repair",
  "mutationTasks": ["configuration-save", "apply", "publish", "account-change"],
  "verificationScope": "Local test instance",
  "unverified": ["External delivery integrations", "Screen-reader inspection"],
  "coverage": [
    {"id": "configuration", "required": "local"},
    {"id": "notification-delivery", "required": "external"}
  ]
}
```

These are additions to the full contract in Harbor's configuration. Use `initial` only before an interface exists to preserve; `repair` requires `existingInterface.applicable: true`, including repairs to newly generated work. Declare every distinct mutation task; a read-only contract uses an empty list. A `control` requirement proves implemented controls, `local` also requires locally exercised behavior, and `external` additionally requires integration verification. Choose the level from the authorized task, not from available credentials. An unavailable required integration stays Pending; do not downgrade its requirement to get green lights. Keep `verificationScope` and `unverified` brief and accurate: they appear beside the lights, even when collapsed.

Harbor's contract is in-memory. Its reload reset is intentional, so it does not acquire a production persistence requirement. A persistent consumer cannot mark applicable mutation, durable-recovery or concurrency checks inapplicable. Other inapplicability decisions need a concrete task-contract reason. Missing tooling, backend access or an unperformed check is Pending, not Not applicable. The CLI validates the declared contract; it cannot independently establish that the declaration is truthful.

```sh
node scripts/review.mjs --config examples/administration/review.config.json init
node scripts/review.mjs --config examples/administration/review.config.json status
node scripts/review.mjs --config examples/administration/review.config.json report
```

Run initialization at every consumer build/start, before serving the dashboard. Harbor's `npm run build` includes this hook; run `npm run review:init` before a separate static preview. Restart/reinitialize after source changes during development. The generated build identity and record live under ignored `output/review/harbor/`. Opening an uninitialized static example leaves its lights Pending. Status and browser inspection never execute adapters.

The fingerprint covers sorted selected paths and contents plus selection configuration. A new build starts Pending and cannot inherit an old completion timestamp. Legacy records are copied byte-for-byte into historical evidence before initializing schema 2. They remain readable, but their prose cannot illuminate a current-build light. Historical phase timing is retained; retrospective review cannot claim the representative workflow was reviewed before reuse.

## Execute and record checks

```sh
node scripts/review.mjs --config review.config.json run navigation
node scripts/review.mjs --config review.config.json record navigation output/navigation-rendered.json
node scripts/review.mjs --config review.config.json reopen C "Recovery changed"
```

Adapters declare `inputs` (the executed assertion files and local helpers, each included in selected sources), an executable, argument array, working directory, timeout in milliseconds (at most 600000), result filename and runner identity. There is no shell command string or command discovery from evidence. Supported argument substitutions are `{build}`, `{checkId}` and `{result}`. Each invocation owns a fresh result directory. Only explicitly requested adapters execute. Configure assertions for the actual consumer; a toolkit fixture pass cannot certify its production behavior.

Batch explicit checks within a milestone; they run in canonical gate order, stop at the first automated non-pass, and cannot execute before preceding gates pass. They never fabricate the combined rendered half:

```sh
node scripts/review.mjs --config review.config.json run lost-response acknowledged-read missing-receipt
node scripts/review.mjs --config review.config.json record-batch output/recovery-reviews.json
node scripts/review.mjs --config review.config.json milestone
node scripts/review.mjs --config review.config.json record workflow output/current-workflow.json --milestone output/evidence/milestones/ORIGINAL_HASH.json
```

A rendered batch is an explicit array of `{ "checkId": "lost-response", "file": "output/lost-response-rendered.json" }` entries; an entry may also specify `milestone` for workflow reassessment. It stops on invalid input; earlier successful writes remain recorded. `milestone` returns the original build, observation time and content-addressed path saved automatically when B first passes with a before-reuse workflow. The reassessment command fills the historical reference while still requiring a fresh rendered observation for the current build. It cannot create an earlier milestone retrospectively. CLI output is compact; the full record remains on disk.

The adapter must write JSON with `checkId`, `build`, `status` (Pass, Fail or Pending), `task`, `route` and `observation`. The runner captures invocation, process exit, timeout, structured result and artifact hashes. Exit zero without the expected assertion is incomplete. Skipped, unrelated or failed checks cannot pass. An aggregate suite success must not be relabeled as an assertion it never exercised.

A rendered evidence file requires `checkId`, current `build` and `configHash`, `status`, `observedAt`, `task`, `route`, `sequence`, `observation`, named `reviewer`, `method` (`self-review` or `independent review`) and a nonempty array of local `references`. The representative `workflow` check requires `timing: "before-reuse"` when first performed. On a later build, use `timing: "reassessed"` with a fresh rendered observation and `priorMilestone` containing the original `build`, `observedAt` and `artifactPath` (also included in `references`). That hashed schema-2 artifact must preserve a passed B milestone and the original before-reuse observation. This preserves genuine phase history without pretending the current re-review happened before expansion. Retrospective observations without that earlier evidence remain historical/advisory and cannot close the timing requirement. Record actual UI operation, not source-only inspection. The record command cannot create automated evidence. Combined checks require both methods.

Recovery adapters also emit `taskResults`, one entry per declared mutation task, containing `id`, `route`, `observation` and a `scenarios` object. Each scenario below is an executed assertion with status Pass, Fail or Pending. Missing tasks/cases, duplicate tasks and a generic suite success cannot close a recovery check.

| Check | Required scenario identities |
|---|---|
| `lost-response` | `identity-and-snapshot`, `newer-draft`, `single-mutation`, `blocked-replay` |
| `acknowledged-read` | `accepted-before-read-failure`, `newer-draft`, `read-only-recovery`, `single-mutation` |
| `missing-receipt` | `acknowledged-unverified`, `unacknowledged-unknown`, `blocked-replay`, `read-only-recovery` |
| `reload` | `reload-identity-snapshot-acknowledgment`, `failed-read-after-reload`, `newer-draft`, `single-mutation` |

Import `recoveryScenarios` and `pendingDetails(checkId, contract)` from `scripts/review-core.js` to avoid duplicating the catalog in adapters. The helper produces Pending placeholders only. Set a case to Pass only after its assertion executes. Parameterize the actual consumer harness over the declared save/apply/publish/account tasks; a shared handler does not eliminate their distinct state transitions. For tasks without editable fields, assert the submitted intent and retained surrounding work instead of inventing a text draft. Attempt replay and check mutation counts; merely rendering a disabled control is insufficient. Distinguish an explicitly new operation from repeating accepted work when current verification is unavailable.

Coverage adapters also emit `coverage`: one `{ "id": "configuration", "control": "Pass", "local": "Pass", "external": "Pending" }` entry per contract coverage task. A passing result must satisfy every required level. These structured claims are checked against the hashed executed result, but cannot establish whether a dishonest assertion actually exercised the product.

Required checks include distinct acknowledged-read failure, missing receipt with and without acknowledgment, blocked replay, retained data, and named return context. Exercise the applicable field/section/overview returns and two-draft scenarios; a generic recovery statement does not substitute. Preserve known acceptance when current verification is unavailable. Never infer rejection or permission to replay from a missing receipt.

Updates use atomic replacement, an exclusive writer lock and a record-content comparison; a concurrent update is rejected. An interrupted writer may leave a lock: inspect the owning process and last valid record before manually removing a stale lock. Earlier-gate reassessment/reopening invalidates dependents. Status and the display recheck referenced artifacts. Changed or missing artifacts make evidence unavailable; status persists invalidation so restoring an artifact cannot reuse an interrupted completion interval.

## Reassessment and review fallback

On an unchanged build, rerun affected assertions in gate order; reassessing an earlier milestone invalidates its dependents. On a changed source/configuration build, initialize again and rerun applicable automated checks. Reuse historical artifacts as context and the preserved workflow milestone as history, not as fresh execution. No automatic affected-file inference or unchanged-evidence waiver is implemented. Batch commands reduce command overhead without weakening build binding.

If independent rendered review is unavailable, perform a separate sequential self-review: operate the task, inspect desktop/narrow/enlarged layouts and keyboard recovery, record the actual reviewer and `method: "self-review"`, and list unavailable platform or participant evidence. Source-only inspection cannot close a rendered requirement. Neither a separate source reviewer nor an automated screenshot is independent rendered review.

On Windows, invoke Node with an argument array and `shell: false`; use `pathToFileURL(resolve(path)).href` for dynamic module imports rather than importing a drive-letter path. Quote a configuration path containing spaces, for example `--config ".\work area\dashboard\review.config.json"`. Native browser zoom and a CSS text-size increase are different checks; identify which was exercised.

## Preserve capabilities

```sh
node scripts/review.mjs --config review.config.json inventory capture output/before.json
node scripts/review.mjs --config review.config.json inventory capture output/after.json
node scripts/review.mjs --config review.config.json inventory compare output/before.json output/after.json
```

Declare stable capability IDs, routes, synthetic states, selectors and behavioral-test references. Capture uses a fresh Playwright browser and reads semantic roles, accessible names, destinations and form associations. It does not submit forms, modify accounts, send notifications or inject live faults. Use test-owned fixture routes for conditional/permission states. The Harbor configuration is a small illustrative navigation scope; expand the scope before claiming complete preservation.

Lost destinations, recovery actions, returns, form associations and behavior references block comparison. Labels/grouping require rendered review. Unvisited routes make the result incomplete. Additions do not compensate for loss. Legitimate removals need JSON authorization entries with `id`, concrete `reason` and `authorization` reference. This records a claim of authorization, not proof of external approval.

To configure the automated `preservation` adapter, invoke `inventory compare BEFORE AFTER --result {result}` with this CLI and the same configuration. Capture the after inventory for the current source first. The combined acceptance check still needs rendered review. Run the existing behavioral checks after comparison: control presence does not prove functionality. The test-owned Harbor inventory fixture demonstrates removed navigation, recovery and return controls without touching any ntfy checkout.

## Display and evidence limits

Reuse `mountReviewBar(host, { resourceBase, projectRoot })` from [review-bar.js](../scripts/review-bar.js) instead of rewriting its retirement/fetch guards. The [Harbor entry point](../examples/administration/acceptance-bar.js) is a compatibility wrapper; copy its small mount call and stylesheet integration. Supply a `details#acceptance-review` host with `data-record` and `data-identity` URLs resolved against `resourceBase`; `projectRoot` resolves artifact paths. The returned cleanup function removes listeners and polling when an SPA unmounts it. These are read-only URLs serving initialized identities and records, not check-running endpoints.

Run consumer integration assertions against the actual mounted component: focused **closed** summary at retirement, open panel, blur/close, keyboard/touch disclosure, current-build change, unavailable/changed artifacts and periodic refresh. The [Harbor browser check](../examples/administration/acceptance-check.mjs) demonstrates test-owned synthetic records; adapt its routes to the consumer. Core unit tests alone cannot close the consumer `review-lights` check. Never inject faults into a live external service without authorization.

The bar refreshes every 30 seconds and when returning to the page. Missing/invalid evidence clears old passes and reveals the bar. It displays the build, required check and automated/self/independent review attribution. The correction guidance remains accessible through hover, keyboard and touch. It stays compact within the header; an open/focused panel remains available when the 24-hour interval expires.

The completion clock starts only at final acceptance, survives ordinary reads/reloads, and resets on invalidation or a new build. Clock rollback and future timestamps cannot hide the bar. A browser that observed unavailable evidence keeps the bar visible across same-tab reloads until a new completion interval is recorded. Its session-only interruption marker can prevent hiding but cannot grant a pass; unavailable browser storage keeps retirement conservative. There is no pass button or browser test runner.

Hashes and the CLI enforce evidence structure through the supported update path. An agent with file access can alter tests, records and code. They do not establish reviewer independence, truth of observations, participant suitability or output quality. The [evaluation procedure](../SKILL_EVALUATIONS.md) keeps first completed output and repairs separate; it is repository-only.
