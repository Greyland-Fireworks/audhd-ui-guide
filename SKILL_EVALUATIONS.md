# Skill evaluation procedure

A separate [framework integration comparison](references/evaluations/2026-10-24-framework/README.md) records newly executed current/candidate trials and preserves their failures. Its two extra quick-review cases and comparative protocol are separate from the 35-case historical pack below; those results do not silently replace the supplied October 20 evidence or establish implementation/user benefit.

**Version:** v1.01 · **Historical supplied-review dataset:** 35 authored scenarios; six supplied outcomes inspected, 29 Pending in that dataset. The separate comparison linked above adds version-specific evidence without converting these counts into blanket passes. New model trials require a separate explicit request.

This pack tests interpretation and review quality, not accessibility conformance or real interface operation.

## Implementation comparison — 2026-10-28

The user separately authorized a [repeated ntfy implementation comparison](references/evaluations/2026-10-28-consolidation/README.md). It holds the original prompt, source release, model and effort constant across two frozen toolkit versions, with reviewer material outside the build checkouts. Its task-outcome, setup and participant findings remain separate from the historical review-only scenarios below. Neither provisioning nor automated toolkit checks establish generated-interface quality.

## October 25 design-default extension — Pending

E36–E39 add four authored cases to the unchanged 35-case historical dataset: first-pass design, optional collection disclosure with a required-correction exception, peer hierarchy and preview accuracy, and optional versus essential explanations. The pack now contains 39 cases. All four new cases are unrun; historical outcomes and archived comparisons remain unchanged. Editorial validation does not establish model behavior or user benefit.

For these cases, supply only the skill, Guide and the individual input. Use the case-specific design/review request rather than converting E36 into a review-only task. Keep the rubric out of evaluated contexts and record fresh first responses and settings as described below. Do not use this conversation's coached examples as independent evaluation evidence.

## Explicitly requested model testing

For implementation comparisons, preserve the first completed output and its evidence before coaching or repair. Record subsequent audit/fix/retest stages separately; compare equivalent stages and retain failures. Record functional coverage, recovery, navigation, explanation quality and rendered organization separately rather than ranking by option counts, test totals or test number. Keep the exact prompt, environment assistance, toolkit content hashes and reviewer input boundaries with each run. An uncommitted toolkit snapshot needs its patch and packaged-file hashes as well as its base commit. Provisioning a new folder does not authorize launching its model trial.

Further trials are deferred work, not a requirement for using or publishing this practitioner draft. Do not ask contributors to run the whole pack before giving ordinary feedback. See [current evidence](#current-evidence) for the supplied review results and their limits.

Start with E03, E07 and E08 in fresh conversations. Give each model the standard request, skill, guide and one scenario; for E21–E26, include the preference documentation and example JSON specified below. Save its first response without coaching, then have a separate reviewer use the rubric. Record model/date, inputs, document revisions and outcomes. If practical, compare with the same scenarios without the skill, recording exactly which references each condition receives, and later expand to other cases or configurations. Report missed problems, disproportionate fixes and unsupported claims separately. Do not infer demonstrated user benefit from successful text reviews.

The procedure below remains optional; ordinary skill use and contributions do not require running this pack. Separately authorized comparisons are recorded above.

E27–E34 add broad developer requests, connected context, appearance, navigation, help and profile/workflow scenarios. E34 has a supplied review response; E27–E33 remain Pending. No implemented behavior or skill activation success is inferred. Supply preference documentation for E29, E33 and E34 as well.

E35 adds recognition-based collection discovery, retained search scope and reset continuity. Its supplied response mostly meets the rubric, with less explicit keyboard/narrow-layout test sequences. This does not establish real-interface behavior or user benefit.

### Coverage limits

E01–E26 cover fictional review recommendations, including dashboard comparison, help, accessibility overrides, recovery and scope restraint. E17–E20 add pattern choice, nested tab context, hidden validation and responsive keyboard access. E21–E26 add preference intake, skipped questions, storage consent, profile validation/precedence, privacy and redundant visual cues. They do not test skill discovery, the `audhd audit` trigger and target selection, authorized implementation, design deliverables or actual interface operation. Treat those behaviors as untested; successful text reviews would not validate them. Editorial consistency and link checks are separate from model evaluation. Run model evaluations only when explicitly requested.

The preference cases assess recommendations using synthetic descriptions, not actual profile reads/writes or rendered preference effects. They include null/false distinctions, skipped updates, array replacement, clearing/inheritance, invalid structure, embedded instructions and privacy/override conflicts. The public references have bounded runtime integration; these model cases supply only synthetic descriptions, and JSON syntax alone does not establish application.

## Keep inputs and answers separate

1. Open [evaluation inputs](EVALUATION_INPUTS.md). Give the model the request, one scenario, `SKILL.md` and `GUIDE.md` in a fresh conversation. Do not attach this whole folder or grant access to the reviewer files for this evaluation.
   For E21–E26, also supply [PREFERENCES.md](PREFERENCES.md) and [preferences.example.json](preferences.example.json). Keep the task review-only and give no access to actual personal profiles. Do not supply the worked examples as expected answers.
2. Keep the [reviewer rubric](EVALUATION_RUBRIC.md) outside that conversation. Do not have the evaluated model read it or grade its own response as independent evidence.
3. Save the exact response and evaluate it against the rubric. Record UI and UX reasoning, unsupported claims and unnecessary work, as well as useful findings. Treat suggested checks as proposals, not performed tests. Accept equivalent reasoning without requiring literal UI/UX headings.
4. If comparing skill revisions, keep scenarios and model settings consistent. Preserve failures. One successful answer does not establish reliability.

Use public or synthetic inputs only. A model that has already read the rubric cannot supply a blind evaluation of these cases. An editorial self-review may identify problems but must be labelled as such.

## Record each evaluation

- Date, model/version and available settings:
- Guide/skill revision or content hashes:
- Preference documentation and example JSON revisions/hashes when supplied:
- Case ID and exact supplied input:
- Exact response or evidence location:
- Reviewer and rubric revision:

| Case | UI criteria and reasoning | UX criteria and reasoning | Unsupported claims | Added friction or scope expansion | Evidence and next action |
|---|---|---|---|---|---|
| One row per evaluated case | | | | | |

Mark unrun cases Pending. If a response invents behavior, claims tests it did not perform or exceeds authorization, retain the failure even if its suggested wording is good. Revise the narrow instruction involved and rerun affected cases without turning one failure into a blanket rule.

## Current evidence

The [supplied October 20 review archive and October 21 assessment](references/evaluations/2026-10-20-readiness/README.md) preserve exact inputs, responses, document snapshots and reported methodology. Inspection against the rubric supports “meets core criteria” for E03, E07, E08, E26 and E34, and “mostly meets” for E35. The other 29 cases remain Pending. These are supplied review outcomes; no new blind trials were run during reconciliation.

The report describes separate subagent contexts with first responses reviewed by the parent. Precise model build/settings and execution logs are unavailable; no repeated runs or without-skill comparison were provided. The standard prompt itself requests many assessed behaviors. Do not present these results as an isolated measure of skill benefit, an independently reproduced run, implementation reliability or user suitability. The separately reported unreadable Light demonstration remains unresolved; successful text reviews do not erase it.

This evaluation material is guide text under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Saved trial records and comparisons

Use repository-only `scripts/trial-report.mjs RECORD.json [RECORD.json ...]` to produce a compact Markdown comparison from saved observations. Schema version 1 requires `id`, exact `prompt`, `toolkitHash`, `firstCompleted` and `repairs`. Record `modelSettings` and `environmentAssistance` when known; absent information remains Unknown.

Each stage records `stage` (`first-completed` for the first output, distinct repair names afterward), `build`, `reviewerMethod`, `evidence`, `workflowTiming` (timely, retrospective or unknown), and separate `outcomes` for functional coverage, recovery, navigation, explanations and organization. Preserve the original first-output artifact before coaching. A report cannot establish provenance that was never recorded; missing transcript evidence remains unknown. Do not substitute the repaired output for the first output or rank trials by test number, option counts, aggregate passes or aesthetic scores.

Only synthetic records exercise the reporting helper. Trial outputs, reviewer datasets and this helper stay out of the consumer package. Running the helper is not authorization for a model evaluation.
