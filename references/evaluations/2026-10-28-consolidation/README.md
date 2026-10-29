# Consolidated toolkit implementation comparison

Date: October 28, 2026. User-authorized comparison. **Status: four first outputs preserved; bounded in-app task review complete; participant and native accessibility checks Pending.** The consolidated version retained the exercised core workflows and finished sooner in these runs, but did not establish a consistent interface-quality improvement. This is a small repeated implementation study, not a statistical demonstration of user benefit or accessibility conformance.

## Frozen conditions

| Item | Fixed value |
|---|---|
| Baseline toolkit | Test 9's installed snapshot, commit `8a76734e03819e979415eca9e31d7cc396baaadf`; all 124 installed file hashes match its original provisioning manifest |
| Candidate toolkit | Commit `079d6f5094a55831f2400f523321f25268166c88`, installed from the frozen plugin's skill directory |
| Candidate plugin | SHA-256 `da7cc47e388399237f8fdb45ba23c504e2aaceffb26ffa7bbb61762d03a9dd5f` |
| ntfy source | `v2.34.0`, commit `9f1d2ea44e412fef4552382a47479fec1984e5ea` |
| Model and effort | `gpt-6-astra`, `xhigh`, verified from Test 9's recorded session settings |
| Starting state | Pristine pinned ntfy checkout plus project-local skill; no runtime, dependencies, generated dashboard, task instructions or implementation hints |
| Repetitions | Two per toolkit version, ordered baseline/candidate/candidate/baseline |

The condition changes both guidance and its distribution contents. This comparison cannot isolate the effect of shorter wording from other edits. Historical Test 9 is contextual evidence, not one of the fresh repeated runs. Record the actual client, tools, model identifier, timestamps, approvals and any follow-up messages for each run. A shared model alias does not establish an immutable server-side model build. Do not claim equivalence to the historical app harness if a different client is used.

Exact user prompt, with no reviewer criteria appended:

> Use the audhd-ui-guide skill to build a polished, stylized AuDHD-friendly configuration dashboard for ntfy. Connect it to a local test instance and verify that it works.

Provisioning records, frozen artifacts, per-file hashes and the run-to-condition mapping remain outside all four build folders under local `output/consolidation-comparison/`. They are not included in either installed skill. The folders contain no `AGENTS.md` added by setup. Existing ntfy Tests 1–9 remain unchanged. Preserve the first completed output, failures and clarification requests before any coaching or fixes. Record differences in network, cache or machine contention rather than treating elapsed time as a pure measure of model or toolkit quality.

### Execution notes

The app tool could create chats only in registered projects; these new folders were not registered. Native app inspection timed out awaiting app-access approval. The comparison therefore uses fresh `codex exec` sessions for both conditions, with the same explicit `workspace-write` sandbox and `on-request` approval setting. This client differs from the historical Test 9 app run. Sessions overlap on one machine; elapsed times are affected by shared load and caches. Compare setup decisions and additional dependencies separately from duration.

Each receives this identical additional environment boundary, separately from the unchanged user prompt:

> For this task, work only in the current checkout. Use only a dedicated loopback instance, data and processes created for this checkout. Do not connect to, stop, or modify services or files belonging to other checkouts. Use an available loopback port and verify process ownership before testing. Do not read other implementations or evaluation records outside the checkout.

A first CLI preflight combined mutually exclusive approval/sandbox flags and exited before a model turn. Automatic approval review rejected the proposed automatic-approval flag correction; that rejected action was not performed. The successful launch instead retains explicit workspace-write sandboxing and on-request approvals, without automatic approvals or a sandbox bypass. Preserve those setup failures as harness evidence, not toolkit outcomes. The first-response event logs and actual session settings remain in the local run records. CLI logging and configuration are described in the official [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

All four sessions encountered blocked runtime downloads. With explicit user approval, the same ntfy 2.34.0 Windows executable was supplied to each at `.comparison-runtime/ntfy.exe`. Its SHA-256 is `474857ba987623859b9935394f3bdb3e9f9a4b2796d40488c831be219a3c0d1e`; the cached release archive matched its retained checksum, and the executable reported version 2.34.0. Pre-assistance event logs were preserved. These are assisted-setup runs: retain the earlier download failures as environment evidence, and do not count supplied infrastructure as autonomous setup success. Identical setup-only follow-up messages were attempted but rejected because the CLI sessions still had active writers. All four subsequently discovered and used the executable during their original turn, so another message was unnecessary. No follow-up message reached a builder. The attempted message, provenance and assistance timestamp are in local `output/consolidation-comparison/runtime-assistance.json`.

Runs 02 and 04 stopped serving after their CLI sessions ended. The reviewer restarted their documented Node server commands, using the existing output and dedicated loopback ports, without rebuilding or editing source. Treat this as a handoff/environment limitation; the record does not establish whether the launcher or CLI process cleanup caused it. Runs 01 and 03 remained available. Initial tabs opened during implementation could retain older draft baselines; final baseline reviews used fresh tabs. In run 03, a stale-revision rejection was recovered through Refresh saved values without losing the proposed edit. Its initial cause was not isolated from that earlier browser state.

## Review complete tasks

Use the existing [component matrix](../../component-review-matrix.md), [configuration contract](../../../packages/audhd-ui-framework/CONFIGURATION.md) and [review record](../../../REVIEW_TEMPLATE.md). Record Pass, Fail, Pending or Not applicable with a reason for each actual outcome; use no aggregate UX score. Apply the same tasks and evidence boundaries to every result.

| Task or question | Evidence to inspect |
|---|---|
| Identify the current server and task on entry and return | Overview, heading, selected navigation and scope agree; ordinary status links reveal the owning task/control and preserve a useful return state |
| Change a safe setting and establish its effect | Draft, saved, effective and verified states remain distinct; persistence and apply/restart behavior are checked against the dedicated instance |
| Manage a synthetic user and restricted topic | Actual supported administration operations and allowed/denied access checks; provisioning fields do not stand in for record management |
| Configure and test delivery | The intended local publish/subscribe outcome is observed; advertised external destinations retain explicit prerequisite and verification gaps until tested |
| Recover after a saved operation's verification fails | The completed operation and version remain recorded; retry repeats the check without another mutation; newer edits remain intact |
| Choose unfamiliar settings | Inspect curated and generated/fallback help for meaning, relevance, choices and prerequisites; reconcile group ownership and platform applicability with source behavior |
| Navigate at narrow widths, short heights and enlarged text | All primary destinations, including Appearance, remain reachable; peer tasks are discoverable before long detail; hidden controls can be revealed and focused |
| Assess the first viewport | Useful state, orientation and actions precede avoidable copy; repeated navigation contributes context or a useful shortcut |
| Assess setup efficiency and coverage | Separate setup from implementation time; record additional dependencies, unnecessary infrastructure, source-backed coverage decisions and unfinished requested capabilities |

Do not substitute generic health, a successful save response or the builder's claimed verification for the relevant task outcome. Only exercise mutations and failure injection in the new disposable instances. Never test against an existing ntfy checkout or unrelated service. Keep fixtures synthetic and redact credentials from evidence.

## Participant walkthrough

After outputs are available, use neutral run labels and vary the presentation order. Ask the user to start without an implementation explanation:

1. Identify where they are, what server is affected and what they can do here.
2. Find an unfamiliar setting, explain its purpose and choose whether to change it.
3. Complete a safe configuration task, then determine whether it is saved and effective.
4. Leave during unfinished work and return after a break; find the relevant task and resume.
5. Recover from a verification failure in the controlled fixture.

Record hesitation, wrong turns, outside information needed, lost context and the user's words. Do not correct them while measuring an uncoached attempt; record any assistance as assistance. Prior familiarity and personal preferences matter. An agent cannot supply the user's comprehension evidence, and one person's result does not establish universal suitability.

## Accessibility and failure diagnosis

Use the existing [manual accessibility checklist](../../manual-accessibility-checklist.md) for native keyboard, actual 200%/400% browser zoom, NVDA/Firefox and system accessibility settings. Record the precise interface and environment tested. Automated viewport enlargement and forced-colors emulation remain separate evidence. Restore any temporary browser or operating-system settings; leave unavailable or unperformed checks Pending.

The user requested the in-app browser for this review. Native-browser and OS accessibility checks remain Pending; in-app observations cannot establish their results. No browser zoom or OS accessibility settings were changed. Firefox was opened during preparation; its close action was refused after detected user input, so it was left alone. The initial in-app preview request timed out. Restarting only the three review-owned, loopback-only preview servers outside the shell sandbox restored access; they were stopped after the bounded example checks. This was a preview-environment issue, not an observed interface failure.

For each consequential failure, distinguish missing guidance, conflicting guidance, failure to retrieve it, failure to apply it, and a runtime/platform defect. Preserve the instruction, observed behavior and uncertainty. Change the toolkit only where that evidence supports a change, then rerun the affected task; do not treat every implementation error as a request for more instructions.

## Run record

All four CLI sessions exited successfully. Each accounts for 103 registered settings, offers the 24 supplied skins and uses the supplied ntfy executable. Counts below describe editable fields, not complete user-task coverage.

| Run | Condition | Implementation and elapsed time | Editable settings | Independent task review |
|---|---|---|---:|---|
| 01 | Baseline | Node standard library; no frontend build; 67.5 min | 38 | Core task checks Pass; horizontal primary navigation Fail |
| 02 | Candidate | Node standard library; no frontend build; 49.3 min | 35 | Core task checks Pass; complete mobile menu Pass for exercised path |
| 03 | Candidate | Python standard library; no frontend build; 49.2 min | 33 | Core task checks Pass after draft reconciliation; horizontal primary navigation Fail |
| 04 | Baseline | React/Vite client with Node server; 66.5 min | 42 | Core task checks Pass; mobile drawer focus sequence Fail |

Elapsed time is launch-to-exit, including setup, implementation and verification. It is not setup time alone. No recorded command launched Docker. Both candidate runs avoided a frontend dependency installation, as did baseline run 01. Run 04 added a React/Vite build. Shared load, caches, different implementations and different amounts of verification prevent a causal speed or cost claim.

First-output source archives exclude dependencies and runtime data. The local manifests retain individual file hashes, Git patches and final responses:

| Run | Source files preserved | Archive SHA-256 |
|---|---:|---|
| 01 | 16 | `6950d8fc898331f3e3cb23c40f064334b7328bba3bc3c53d733e7ec93fd13d68` |
| 02 | 19 | `da56daa0935eae0110cf3de832f1f5bd507e5fb0a201995992a63fe97ea404db` |
| 03 | 16 | `6dddea1b2970a992fa6fc9457e86dba5c7299089b2042a98bed3578b8849f62d` |
| 04 | 14 | `652c9721b49b0593f1a204aac4c1ca191735573942cc84489a64e7c91eeccf43` |

### Independently observed outcomes

The reviewer used the in-app browser at approximately 1280 × 720 and a measured 360 × 640 viewport. Source and catalogue inspection supplemented rendered observations. All mutations used synthetic records and the four new local instances; no implementation was corrected during review.

| Check | Observed result and limit |
|---|---|
| Configure → review → save/apply → inspect | **Pass in all four:** changed message retention to 13h, observed the restart result, and read back persisted configuration. Run 01 began at 24h; the others at 12h. Run 02 visibly separated saved 13h from running 12h before Apply. This verifies persistence/startup, not expiration after 13 hours. |
| Create user → restrict topic → test effective access | **Pass in all four:** created a synthetic account and write-only topic rule; publishing returned an accepted receipt while read-back returned 403. This does not independently certify role changes, password rotation, tokens or every permission combination. |
| Recover verification without repeating the mutation | **Pass in all four:** kept the accepted receipt, entered a newer unsent message, navigated to grant read access, returned and verified the original ID. A read-only query found exactly one retained message on each synthetic topic, including after restart. The newer message remained unsent. |
| Status → owning control | **Pass for the sampled retention link in 02, 03 and 04:** revealed and focused the exact field. **Fail in 01:** its retention summary was static; the user had to choose a category or search. Broader status-link coverage remains unverified. |
| Narrow primary navigation | **Fail in 01 and 03:** horizontal strips hide most primary destinations. **Pass for 02's exercised menu:** a complete vertical list, Appearance last, Tab from the toggle enters its first link. **Mixed in 04:** a vertically scrollable drawer includes Appearance, but Tab from its toggle moved to the page search behind the open drawer. |
| Available space | All four show useful state near entry, but all retain large panels and introductory material. Run 01's idle fixed save bar further reduces mobile working space. Run 03 repeats a recovery/scope sidebar across settings. These observations do not establish that the layouts minimize effort for the intended user. |
| State age after another configuration save | Run 03 labels older verified receipts in activity as older settings. Run 02 qualifies the detailed receipt as a previous running configuration, while its overview card still says Read back without that qualification. A historically successful check must not imply current configuration verification. |

Each narrow page's document width was within the viewport. That did **not** establish usable navigation: nested horizontal overflow in 01 and 03 and the drawer focus problem in 04 were visible only through rendered/interaction review. Screenshots are retained locally as `run-XX-overview.png`, `run-XX-mobile.png` and `run-XX-recovery.png`; bounded catalogue and receipt evidence is in `reviewed-state.json`. Synthetic records remain in these disposable instances for follow-up. Source preservation checks are separate from these intentional runtime-data changes.

After the independent review, every preserved source file still matched its first-output hash, all four installed skill copies still matched their input manifests, and the frozen candidate archive retained its recorded checksum. Documentation links/anchors, skill validation and whitespace checks passed for that evidence update. The unchanged runtime suites were not rerun for documentation-only edits. At that checkpoint the participant walkthrough was Pending; its subsequent findings are recorded below.

### Comparative interpretation

- **Coverage:** no core-workflow loss was observed, and no overall expansion was demonstrated. Every run implements supported account administration instead of substituting database-path settings. Candidate field counts are lower partly because they withhold inactive email budgets; the baselines allow editing them with inactivity explanations. All runs leave external integrations unconnected under the shared isolation boundary. Tier/reservation management remains incomplete; run 03 explicitly marks that workflow unfinished rather than exposing only its enable switch. Do not infer completeness from either the 103-option inventory or editable-field totals.
- **Orientation and navigation:** run 02 provides the strongest task hierarchy in this sample, with named secondary destinations throughout and account management inside Users & access. Run 03 provides secondary account tasks but keeps other domains as long lists. Run 01 splits Access & accounts from People & permissions at the primary level. Run 04 keeps them together but has limited secondary navigation. These are individual implementation differences, not a consistent condition-wide win.
- **Explanations and applicability:** the agent initially judged sampled explanations for retention, request budgets and targeted logging useful, and all four explicitly identify Unix sockets as unavailable on Windows. That judgment did not establish comprehension: the participant follow-up below found substantial difficulty with request budgets and other technical explanations. Run 02's reservation explanation still relies on a technical tier reference; run 03 puts unrelated unavailable settings into Configuration reference; baseline run 04 retains raw source phrases for managed paths. Neither curated text nor source provenance alone establishes usable decision help.
- **Verification recovery:** the exercised accepted/failed-check/repaired-check sequence works in both conditions. The consolidated package preserved this capability; these runs do not show it improved the outcome. Builders report additional automated checks, but those reports are distinct from the independent checks above.
- **Setup efficiency:** candidate completion was shorter in these two repetitions, but autonomous runtime acquisition was blocked for every run. One baseline added a frontend build; the other did not. The setup assistance and verification differences make a broad efficiency claim premature.

### Failure diagnosis and next decision

The [navigation requirement](../../../GUIDE.md#keep-navigation-levels-distinct), [responsive interaction reference](../../interface-patterns.md#operate-accessibly-across-layouts), [practical-language requirement](../../../GUIDE.md#practical-interface-language) and [status-first overview guidance](../../../GUIDE.md#status-first-operational-overviews) already cover the observed layout problems. Event logs show the explicit no-horizontal-primary-navigation instruction returned in command output for both 01 and 03; run 03 also retrieved a targeted Guide excerpt. This supports **retrieved but not applied/verified**, rather than a missing requirement. It does not reveal the model's internal attention or reasoning.

Run 03 reported its rendered/keyboard checks Pending after browser access was rejected. Runs 01 and 04 reported mobile checks, but those checks did not catch the observed navigation defects. Their validation evidence was insufficient for the navigation-quality claim. Runtime download restrictions and the two stopped launchers are environment/handoff evidence, not reasons to add interface rules. Catalogue fallback help and incomplete secondary navigation are failures to realize existing outcomes; attribution to wording alone remains unresolved.

The independent-review recommendation was to retain the consolidation without claiming a validated quality improvement, then seek participant evidence rather than duplicate existing rules. The follow-up below refines that recommendation. Native screen-reader, actual browser zoom, system accessibility, external delivery and exhaustive feature verification remain **Pending**. No existing ntfy test was changed.

Report per-run outcomes and recurring failures, including unsuccessful attempts. With two runs per condition, describe directional evidence and variability; do not claim statistical significance or attribute differences solely to the toolkit.

## Participant feedback and editorial follow-up

On October 28, the participant reviewed run 04, then run 02, and began run 01 in the in-app browser. Run 03's participant review and completion of run 01 remain Pending. These were guided, iterative sessions with prior exposure and discussion, not blind or independent first-use trials. The feedback concerns recognition, effort and preferred organization; it does not repeat the earlier mutation/recovery tests. Local structured notes retain the participant's comments separately from interpretations and proposed layouts. No generated dashboard implementation was revised.

| Area | Observed participant feedback | Editorial response and limit |
|---|---|---|
| Orientation and copy | Generic server labels did not establish the system's purpose. Technical shorthand, domain words and ambiguous states required outside context. Repeated configuration headings added reading without orientation. | Clarify subject and purpose through shared context; retain useful explanations while removing repeated introductions. This refines existing AUDHD-01, 02 and 09 outcomes. |
| Discovery and hierarchy | Run 02's browsable settings catalogue and task tabs were helpful. Run 04's name-based search and duplicated categories were not. Run 02 still grouped write-performance settings with retention and hid all content on unavailable task pages. | Restore the multipage directory requirement and distinguish a page index from a settings catalogue. Strengthen checks for actual decision grouping and useful content after task selection. |
| Overview and navigation | Routine activity and notification-test promotion crowded overviews. Run 01 feedback favored collapsible repeated Configuration links and Appearance adjacent to the other menu entries. | Keep substantial workflows/history in focused destinations. Appearance stays last in the menu without being isolated at the viewport bottom. Group collapse preserves current context and discovery. |
| Decision help | Numeric values lacked scale, examples, unit syntax, blank-value meaning and an explanation of coupled effects. Monitoring descriptions still required technical knowledge. Detached small help text was easy to miss. | Expand existing decision checks with concrete use/off examples and verified input semantics. Keep expandable help within the setting's region; an information toggle supports a concise view once familiar. No universal capacity recommendations or fixed initial help state are inferred. |
| Data and diagnostics | Requiring Refresh to initially list users was unnecessary; otherwise the account page was clear. Raw logs were unreadable. The participant requested warning triage, acknowledgment without erasure and selectable page size. | Distinguish initial loading from later refresh. Add a conditional log-reading/triage contract with truthful counts, severity, acknowledgment scope and retained history. These proposed interactions have not been implemented or validated. |
| Action discoverability | Save/apply/verify instructions appeared without visible corresponding controls or an explanation of when they would appear. | Check that instructions match reachable actions and their conditions; do not add unrelated permanent action panels. |

The index audit found a specific consolidation regression: the earlier Guide described a browsable index, while the consolidated navigation paragraph explicitly made it optional. This weakened discovery guidance, although it cannot explain run 04's omission because run 04 used the earlier snapshot. The revised Guide now requires a complete directory for multipage workspaces while leaving repeated breadcrumbs optional. Most other findings expose insufficient application or verification of existing rules, rather than proving that more prose alone will correct generated output.

The authorized editorial update integrates these distinctions into the existing 13 rules, 50 readiness checks, review workflow and fictional written examples. It adds no preference schema, runtime API or mandatory report format. Frozen comparison inputs and outputs remain separate from the revised toolkit. These changes require future implementation and participant checks before any improvement claim; no additional model evaluations were run as part of the update.

Editorial validation passed: documentation links/anchors and identity checks, UTF-8 skill validation, and whitespace checks. A consistency walkthrough covered multipage versus focused-page discovery, collapsed navigation versus hidden task content, optional help versus essential consequences, units/blank values/coupled timing, initial loading versus refresh, warning acknowledgment versus resolution, and last-in-menu placement versus spatial separation. These are checks of the instructions, not behavioral tests. Runnable examples, palette data and runtime code were unchanged, so their suites and builds were not rerun. The frozen candidate archive still matched its recorded checksum.
