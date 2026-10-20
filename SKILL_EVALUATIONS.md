# Skill evaluation procedure

**Version:** v1.01 · **Status:** 35 authored scenarios; all model outcomes remain Pending. Run only on a separate explicit request.

This pack tests interpretation and review quality, not accessibility conformance or real interface operation.

## Explicitly requested model testing

This is deferred work, not a requirement for using or publishing this practitioner draft. Do not ask contributors to run the whole pack before giving ordinary feedback.

Start with E03, E07 and E08 in fresh conversations. Give each model the standard request, skill, guide and one scenario; for E21–E26, include the preference documentation and example JSON specified below. Save its first response without coaching, then have a separate reviewer use the rubric. Record model/date, inputs, document revisions and outcomes. If practical, compare with the same scenarios without the skill, recording exactly which references each condition receives, and later expand to other cases or configurations. Report missed problems, disproportionate fixes and unsupported claims separately. Do not infer demonstrated user benefit from successful text reviews.

The procedure below is retained for that future work. No evaluation runs are scheduled or required now.

E27–E34 add broad developer requests, connected context, appearance, navigation, help and profile/workflow scenarios. Their review recommendations remain unrun; no implemented behavior or skill activation success is inferred. Supply preference documentation for E29, E33 and E34 as well.

E35 adds recognition-based collection discovery, retained search scope and reset continuity. Its model outcome remains Pending; it does not establish real-interface behavior or user benefit.

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

The scenarios and document structure have been reviewed during authoring. This is not an independent model evaluation. All E01–E35 model outcomes remain Pending (not authorized or run); no success rate is claimed. No runnable interface or interaction testing is included in this pack.

This evaluation material is guide text under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
