# Concept adoption and independent implementation

The [Laws of UX skills project](https://github.com/keysjoao/laws-of-ux-skills) inspired this project's clearer review modes, compact lookup and concise findings. We inspected its approach, then developed the following changes from our existing AUDHD rules and examples. We did not import its text, code, law catalog, numeric scoring or shipping verdicts.

| Observed idea | Our need and existing foundation | Independent implementation | Verification |
|---|---|---|---|
| Clearly separated review activities | Our skill already distinguishes review and implementation | Quick review and bounded workflow audit inside one skill | Routing and scope evaluation cases |
| Component-oriented lookup | The Guide already routes by difficulty and rule ID | [Interface lookup](interface-patterns.md) asks task questions and links our examples | Links and evidence requirements reviewed |
| Actionable findings | Our review template connects evidence, impact and checks | Problem/consequence → evidence/location → proposal → verification/uncertainty | Compare required findings and unsupported claims |

Substantive guidance remains grounded in [our Guide](../GUIDE.md) and its evidence boundaries. [W3C cognitive accessibility guidance](https://www.w3.org/TR/coga-usable/) informs task support. [Miller's Law's original guidance](https://lawsofux.com/millers-law/) warns against arbitrary seven-item limitations. Neither source establishes the efficacy of our implementation.

No numeric UX grade, fixed choice limit, automatic ship approval, compulsory animation or code-only definition of a valid finding is adopted. The framework extracts our own preference utilities and appearance assets, not upstream implementation.

Framework code remains MIT; this documentation remains CC BY 4.0 under the [existing license scope](../LICENSE_SCOPE.md). See [framework evidence](framework-evidence.md) for execution results and pending checks.

## Hallmark: engineering influence, independently implemented

Inspected upstream: [Nutlope/hallmark](https://github.com/Nutlope/hallmark), revision `4f6a46c6dc325d40ab268c93e25c7b96676ebccd`. Observed ideas include executable checks, explicit verification methods, before/after capability accounting and separation of workflow compliance from output quality.

The AuDHD toolkit already required A–E phase exits, representative-workflow review, practical explanations, accessibility, recovery, honest evidence limits and visible review lights. The additions independently implement these existing requirements as a shared acceptance core, build-bound schema-2 record, explicit local adapters, capability inventory and separate trial stages. Regressions cover missing/wrong/stale evidence, mutation recovery requirements, invalidation, timing, concurrent updates and capability loss.

No Hallmark prose, reviewer prompts, gate catalog, code, themes, assets, naming conventions or numerical scoring were copied or translated. Its aesthetic rules, marketing-page rules, forced variation and arbitrary navigation limits are not adopted. This attribution identifies influence, not endorsement, shared validation or proven improvement in generated-dashboard quality.
