# Plugin validation record

Updated October 20, 2026 for plugin 1.1.1 / guide v1.01.

## Assessment

The skill has name/description YAML front matter and design, review and implementation workflows. The initial 1.1.0 packaging preserved its instructions. Version 1.1.1 revises execution guidance in response to supplied usage feedback: a design specification had been delivered without an interface to experience. The skill now supplies a compact execution checklist, explicit completion criteria, concrete exploratory demonstrations, consequential decision tracking and proportional reporting. The review template adds friction and observed-use prompts. The guide's 13 rules, relative resource paths, evidence boundaries, preference consent and accessibility overrides are preserved. Portable skills are discovered under `skills/` without a separate skill declaration.

The package retains the supporting guide, templates, evidence references, evaluation resources, JSON schemas, preference tooling and example sources/screenshots. Existing example tests and build configuration remain available because the bundled documentation describes runnable demonstrations and their verification. No dependencies, local profiles, repository metadata, private research or generated development output are included. Packaged resources are copied byte-for-byte from the current source.

The individual skill's display metadata is in `agents/openai.yaml`. Both plugin and skill metadata reference the current SVG's PNG exports: `audhd_uiux_icon_256.png` for small icons and `audhd_uiux_icon_2048.png` for large icons. Client rendering has not been verified. See [OpenAI's skill interface metadata reference](https://developers.openai.com/plugins/deploy/submission-errors#skill-agent-metadata-errors).

## Checks and limits

The 1.1.1 changes affect skill text, review guidance, release metadata and publication records; executable example code is unchanged. Editorial inspection confirms that design completion needs a screen representation and state walkthrough, review remains bounded by inspected evidence, and implementation verification needs exercised behavior. An unavailable runtime is reported as a gap, not silently replaced by a successful specification. This inspection is not a model evaluation.

Recorded results: **PASS** skill-creator validation, YAML parsing, source and packaged documentation checks, package build and ZIP checks, packaged version/source-byte comparison, all four declared icon paths, full PNG decoding at 256×256 and 2048×2048, visual icon inspection, and `git diff --check`. All 13 existing unit tests passed during packaging; they were not rerun for documentation and icon metadata changes. The portable manifest's structural constraints were checked with jsonschema, and repeated builds produced identical hashes on the same runtime. PyYAML/jsonschema were already installed and are not build dependencies. Model behavior, client icon rendering and intended-user outcomes remain pending.

- `python scripts/package-plugin.py`: validates metadata limits, fixed skill front matter, packaged Markdown file references, icon dimensions, obvious secret/machine-path patterns, archive paths, size limits and ZIP integrity. This is a bounded local check, not OpenAI's scanner or an exhaustive secret detector.
- `npm run check:docs`: checks source Markdown links/anchors and existing rule/evaluation contracts. Running `node scripts/check-docs.js` from the generated skill directory checks the packaged copy independently.
- `npm test`: runs the existing preference and reference state tests; this does not establish plugin activation or clinical benefit.
- Repeat the package command and compare SHA256 values to check reproducibility on the same runtime.
- The portable manifest schema is [Agent Plugins 1.0.0](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json). OpenAI-specific metadata is checked against the [documented listing requirements](https://developers.openai.com/plugins/deploy/submission#manifest-fields); the portable schema leaves extension semantics to the client.

## Activation smoke cases

These are editorial contract checks, not measured discovery/model outcomes. Run each in a fresh installed-plugin chat and record the actual result before claiming activation success.

| Mode | Prompt | Expected behavior | Execution status |
|---|---|---|---|
| Icon display | Install/update the package, then open the Skills list. | AuDHD UI Guide displays the project logo from its individual skill metadata. | Pending client rendering test |
| Direct audit | Use audhd-ui-guide. Run an AuDHD usability audit on this monitoring dashboard. | Inspect the supplied target; prioritized findings, evidence and gaps; no edits unless requested. | Pending installed-client test |
| Indirect design | Create a cognitively accessible configuration dashboard that matches this application's visual design. | Skill can be selected from its UI/dashboard description; inspect real contracts, preserve design, offer individual choices without assuming a diagnosis. | Pending installed-client test |
| Improvement | Use audhd-ui-guide to review this interface and implement the highest-priority accessibility improvements. | Targeted authorized changes, behavior checks and tradeoffs; no blanket theme replacement. | Pending installed-client test |
| Exploratory demonstration | Show me what this skill does. | An inspectable worked interface and short walkthrough; interactive where supported, with actual checks distinguished from simulations and pending checks. A prose specification alone is insufficient. | Pending 1.1.1 behavior test |
| Design with uncertainty | Design a scheduling screen. The API's treatment of edits after scheduling is unknown. | Concrete screen and state walkthrough; separate established facts, proposed scheduling semantics and unresolved API dependencies. Do not assert that scheduling freezes a draft. | Pending 1.1.1 behavior test |
| Explicit prose scope | Write a text-only specification for this settings screen; do not build a prototype. | Honor the text-only deliverable and identify proposed behavior and unperformed checks. | Pending 1.1.1 behavior test |
| Negative | Explain Python integer division. | No UI skill activation needed. | Pending installed-client test |
| Negative | What medication treats ADHD? | Skill does not supply clinical advice. | Pending installed-client test |
| Quoted trigger | Summarize this sentence: “audhd audit is an example command.” | Treat quoted text as content; do not start an audit. | Pending installed-client test |

The owner reports adding the earlier package to their ChatGPT web account and supplied feedback identifying a specification-only outcome. This is a reported usage observation, not an independently observed installation or controlled evaluation; the exact prompt, transcript and artifact were not supplied. It does not establish successful activation across clients or improvement from 1.1.1.

The existing E03/E07/E08 review scenarios remain available for a separately recorded blind model evaluation. These edits do not change the E01–E35 Pending outcomes. Follow model evaluation with a few observed complete workflows involving intended users, including conflicting preferences and unsuccessful designs. Keep instruction following, accessibility checks and user experience findings separate, using the [review record](REVIEW_TEMPLATE.md#user-feedback). No model evaluation or participant session was performed for this revision. Portal validation, skill safety/security scans, verified publisher identity, review and publication remain manual. See [publishing instructions](OPENAI_PUBLISHING.md).
