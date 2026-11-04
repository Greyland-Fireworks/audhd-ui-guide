# Local executable review evidence

Toolkit 1.1.4 uses schema-version 2 review records. Guide rules are 1.1.4; framework and preference schemas retain their own versions. This is a local evidence workflow, not a certification or a claim that generated dashboards have improved.

The [shared core](../scripts/review-core.js) owns stable checks and A–E membership. It links to AUDHD-12 rather than maintaining another rulebook. Required outcomes use automated assertions, rendered observations, or both. Advisory observations stay outside the blocking set. Optional participant feedback and untested platforms remain explicitly separate.

## Start here: one implementation path

Use this sequence instead of reading every supporting document up front. Keep the [Guide](../GUIDE.md) authoritative; this page is the command path, not a second rulebook.

| Stage / prerequisite | Existing command and evidence | Stop until |
|---|---|---|
| A — Declare the task contract | `init`, then `record paths FILE`: actual rendered task paths, scope and verification levels. | A passes; raw screenshots alone are not a recorded review. |
| B — Build one representative slice after A | `run navigation`, `record navigation FILE`, `record workflow FILE`, then `milestone`. Operate the real task and return path before reuse. | A and B pass and `milestone` returns the preserved original artifact. |
| C — Exercise recovery after B | `run CHECK [CHECK...]` for applicable recovery IDs, then `record-batch MANIFEST` for checks requiring rendered observations. | Every declared mutation has its required cases; no generic suite-count substitution. |
| D — Expand the proven pattern after C | `run coverage`, then record coverage and explanations. Explanations require rendered evidence only. | Each task reaches its declared verification level. |
| E — Review the integrated interface after D | Run and record preservation (when applicable), review-lights and integrated checks; inspect `report`. | Required outcomes pass; evidence methods and limits are visible. |

All commands above use `node scripts/review.mjs --config review.config.json COMMAND`; run them from the consumer's configured toolkit location. `report` identifies missing outcomes without executing adapters. On an unchanged build, finish missing evidence; on a changed build, initialize again and reassess as described below.

**Before choosing the slice:** preserve the [deliverable contract](../SKILL.md#establish-the-task-and-scope). A validates the requested artifact and task paths, not merely whatever screen was built. For integrated review, use the [delivered-experience procedure](autonomous-implementation.md#challenge-the-delivered-experience); functional assertions and rendered usability remain separate requirements.

**When a pass is contradicted:** use `reopen GATE REASON` for the earliest affected gate, then record the new evidence and retest through the same commands. This applies without a source change. Preserve historical observations; reopening invalidates dependent acceptance and the completion clock.

**Before expansion:** run `status` and `milestone`. Do not reuse the representative pattern until A/B pass and the original B artifact exists. If expansion already happened without that milestone, record the omission and keep workflow timing Pending. A useful retrospective functional review cannot recreate before-reuse evidence. Do not backdate observations or relabel a later check as the missing original milestone.

**Before repairs:** capture `inventory capture OUTPUT` before changing existing output and declare `stage: "repair"` with `existingInterface.applicable: true`. This includes repairs during the first dashboard-building task. Compare the current after inventory and rerun behavior after the repair. A missing before baseline is incomplete evidence, not permission to mark preservation inapplicable.

**Choose evidence honestly:** control implemented, locally exercised and external integration verified are different levels. Select the required level from the task contract; unavailable required services remain Pending. If independent rendered review is unavailable, perform and name sequential self-review, with its limits. On Windows, a restricted executor's `EPERM` is an access limitation, not a failed product assertion; use the permitted execution path and retain the actual result. See [fallback and reassessment](#reassessment-and-review-fallback) for details.

## Finish the mission and hand it off

Keep the original request → outcome → minimum proof mapping in the existing coverage declaration. Use the [completion requirements](../GUIDE.md#completion-follows-the-requested-outcome) at every phase exit. Required Pending work remains actionable: continue feasible authorized tasks; otherwise name the concrete blocker and next action. Goals are optional execution support, not a prerequisite for completing the task.

At E, operate the exact startup command from the delivered working-directory context, then the normal supported task path. A static example may use its documented preview command and served entry; it does not acquire a production backend requirement. Challenge a consequential claim before reading the implementer's success narrative. Record actual native 200% zoom separately from CSS/text enlargement. For partial Apply, select faults at the real file/service boundaries and verify restoration rather than inferring it from a receipt.

Generate the handoff status with the existing `report` command after the last source/evidence change. Its output is a dated snapshot, never a live authority. Identify the build and canonical record in narrative notes and mark earlier all-pass summaries historical when reopening or changing builds. A stale-build report refuses current acceptance until initialization; old reviewer prose cannot override it.

## Upgrading review records to toolkit 1.1.4

Guide, toolkit and plugin are 1.1.4. Evidence remains schema 2, but the acceptance configuration is stricter. Add the fields below, reinitialize and provide fresh evidence; historical passes are not promoted. Existing consumer adapters need corresponding structured outcomes. An unavailable required check stays Pending.

Each `contract.coverage` entry now declares `outcome`, `requestReference` and `proof`, in addition to its existing `id` and `required` control/local/external level. `proof` is one of `control`, `saved`, `loaded`, `effect`, `task` in increasing order. Automated coverage results provide the achieved `proof` and a concrete `observation` per entry. A lower proof cannot close a higher requirement. The declaration itself still needs review against the original request; the tool cannot infer omitted intent.

```json
{"id":"capacity","required":"local","outcome":"Make requested game capacity available","requestReference":"Original operator request","proof":"effect"}
```

Declare `contract.partialApply` as `{ "applicable": true, "reason": "Apply writes multiple files and restarts consumers" }`, or `{ "applicable": false, "reason": "Memory-only edits; no files or services are changed" }` when that is the actual task boundary. This makes partial-apply rendered review blocking when applicable; memory-only examples do not acquire deployment requirements.

Rendered `integrated` evidence includes `requiredChecks`, with `delivered-startup`, `normal-path` and `native-zoom` entries, plus `partial-apply-recovery` when applicable. Each entry has `status` (Pass/Fail/Pending) and `observation` describing the exercised sequence and result. Include the corresponding local references using the existing evidence mechanism. Source inspection or an unavailable tool cannot substitute for these rendered checks.

New B milestones preserve the original record and A/B artifact bytes in content-addressed storage beneath the evidence directory. Changing working screenshots cannot erase those preserved bytes; missing or changed preserved artifacts block reuse. Old milestones without this bundle remain historical but cannot close current before-reuse verification through automatic reassessment. Preserve any historical timing omission; do not fabricate earlier review or copy current images as old evidence.

## Configure and initialize

Copy the shape of [Harbor's configuration](../examples/administration/review.config.json) into the consumer project. Declare actual source files/directories, task contract, evidence paths and explicit adapters. Include local assets, configuration and lockfiles. Missing inputs and paths outside the project root fail. Dependencies, caches, generated output, review evidence and common secret files are excluded. Do not select secrets or place them in evidence artifacts. The local static example can serve evidence references; publish only intentionally public, non-sensitive artifacts.

The current working toolkit requires these additional contract declarations. Existing schema-2 configurations must add them and reinitialize; old records remain historical, never automatically green:

```json
{
  "stage": "repair",
  "mutationTasks": ["configuration-save", "apply", "publish", "account-change"],
  "verificationScope": "Local test instance",
  "unverified": ["External delivery integrations", "Screen-reader inspection"],
  "partialApply": {"applicable": true, "reason": "Configuration apply restarts consumers"},
  "coverage": [
    {"id": "configuration", "required": "local", "outcome": "Change the running configuration", "requestReference": "Operator request", "proof": "effect"},
    {"id": "notification-delivery", "required": "external", "outcome": "Deliver the requested notification", "requestReference": "Operator request", "proof": "task"}
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

### Worked adapter: one assertion, two evidence methods

This example connects an existing consumer navigation assertion to `navigation`; it does not certify the other checks. Prerequisite: A already passes. Place the adapter and its local assertion helper inside selected source inputs. The helper must operate the actual interface and throw unless exact destination, help, focus and both drafts survive Appearance and keyboard return, with and without reload where persistence is promised. Test field and section origins; only a genuinely missing or invalid origin may use an explicitly named fallback, never a generic destination substituted for a valid field. A source-only inspection or fixture unrelated to the consumer is insufficient.

```js
// checks/navigation-adapter.mjs — adapt the import to your existing assertion.
import { writeFile } from 'node:fs/promises';
import { verifyNavigation } from './navigation-assertions.mjs';
const [checkId, build, result] = process.argv.slice(2);
if (checkId !== 'navigation') throw new Error('Unexpected check ID');
const evidence = { checkId, build, status: 'Pending', task: 'Edit configuration',
  route: '#configuration', observation: 'Assertion has not completed.' };
try {
  await verifyNavigation(); // Throws on a failed assertion; no aggregate-suite relabeling.
  evidence.status = 'Pass';
  evidence.observation = 'Exact return, help, focus and two drafts survived the tested detours.';
} catch (error) {
  evidence.status = 'Fail'; evidence.observation = String(error.message);
  process.exitCode = 1;
}
await writeFile(result, JSON.stringify(evidence));
```

Configure that assertion explicitly (replace the executable with your installed Node path if needed):

```json
{
  "navigation": {
    "executable": "node",
    "args": ["checks/navigation-adapter.mjs", "{checkId}", "{build}", "{result}"],
    "cwd": ".",
    "inputs": ["checks/navigation-adapter.mjs", "checks/navigation-assertions.mjs"],
    "timeoutMs": 60000,
    "result": "navigation.json",
    "runner": "Consumer navigation assertion"
  }
}
```

Use this entry under `adapters`, then run `run navigation`. Separately operate the rendered task and write its observation:

```json
{
  "checkId": "navigation", "build": "CURRENT_BUILD", "configHash": "CURRENT_CONFIG_HASH",
  "status": "Pending", "observedAt": "ACTUAL_OBSERVATION_TIME",
  "task": "Edit configuration", "route": "#configuration",
  "sequence": "Field help → Appearance → reload → keyboard return",
  "observation": "Replace with the observed destination, focus, help and draft results.",
  "reviewer": "ACTUAL_REVIEWER", "method": "self-review",
  "references": ["review/evidence/navigation-observation.png"]
}
```

Read current identities from the initialized identity file. Replace placeholders with actual observations and existing artifacts; set Pass only if the rendered requirement passed, or Fail if it failed. Then `record navigation review/evidence/navigation-rendered.json`. The adapter and rendered record close only navigation, not workflow timing or overall acceptance. Evidence file arguments are relative to the configured project root, not the shell directory.

For recovery, keep the existing consumer harness and parameterize it over the declared save/apply/publish/account/permission operations. Import `pendingDetails(checkId, contract)` to start every required task/scenario Pending. Set each scenario from its own executed assertion; record its actual route and observation. Assert submitted intent and surrounding work for actions without editable drafts. Unexecuted cases stay Pending and failures stay Fail. One shared handler or 20 passing tests cannot stand in for the complete per-task matrix. Use `record-batch` for the separate rendered records; it reduces commands, not evidence requirements.

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

The host must be **empty**: the component creates its summary, lights, guidance and evidence rows. Do not prepopulate fallback text or a summary, or mount twice into the same host. Mount once per host; invoke cleanup before removing that host. A new SPA mount uses a fresh empty host.

```html
<link rel="stylesheet" href="./vendor/acceptance-bar.css">
<details id="acceptance-review"
  data-identity="review/build.json" data-record="review/review.json"></details>
<script type="module">
  import { mountReviewBar } from './vendor/review-bar.js';
  const host = document.querySelector('#acceptance-review');
  const projectRoot = new URL('./', location.href);
  const cleanup = await mountReviewBar(host, {
    resourceBase: projectRoot, projectRoot
  });
  // Wire this to the SPA/component unmount lifecycle, if one exists.
  function unmountReview() { cleanup(); host.remove(); }
</script>
```

This example assumes the document is served from the consumer project root. For nested routes, supply the actual served root URL explicitly. Record/identity URLs resolve against `resourceBase`; artifact paths resolve against `projectRoot`. Copy `review-bar.js` and `review-core.js` together into the same local vendor directory, plus the stylesheet, preserving licenses. Include all three in source fingerprint selection. Serve the intended public evidence files, not the installed `.agents` skill tree or secrets. Do not copy Harbor's root-relative URLs into a differently hosted consumer unchanged. A static page needs no special unload handler; avoid stopping polling on a back/forward-cache pagehide without remounting on restoration.

Run consumer integration assertions against the actual mounted component: focused **closed** summary at retirement, open panel, blur/close, keyboard/touch disclosure, current-build change, unavailable/changed artifacts and periodic refresh. The [Harbor browser check](../examples/administration/acceptance-check.mjs) demonstrates test-owned synthetic records; adapt its routes to the consumer. Core unit tests alone cannot close the consumer `review-lights` check. Never inject faults into a live external service without authorization.

The bar refreshes every 30 seconds and when returning to the page. Missing/invalid evidence clears old passes and reveals the bar. It displays the build, required check and automated/self/independent review attribution. The correction guidance remains accessible through hover, keyboard and touch. It stays compact within the header; an open/focused panel remains available when the 24-hour interval expires.

The completion clock starts only at final acceptance, survives ordinary reads/reloads, and resets on invalidation or a new build. Clock rollback and future timestamps cannot hide the bar. A browser that observed unavailable evidence keeps the bar visible across same-tab reloads until a new completion interval is recorded. Its session-only interruption marker can prevent hiding but cannot grant a pass; unavailable browser storage keeps retirement conservative. There is no pass button or browser test runner.

Hashes and the CLI enforce evidence structure through the supported update path. An agent with file access can alter tests, records and code. They do not establish reviewer independence, truth of observations, participant suitability or output quality. The [evaluation procedure](../SKILL_EVALUATIONS.md) keeps first completed output and repairs separate; it is repository-only.
