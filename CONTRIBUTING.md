# Contributing improvements

Help make the guide more useful by reporting a task, an observable difficulty and a proposed improvement. Examples from different platforms, languages, accessibility needs and working preferences are welcome.

Use this repository's GitHub Issues for problems and proposals when available, or [join the Discord community](https://discord.gg/BY3BVkJ3Sq). Submit proposed document changes through a pull request when available. Do not put private evidence into a public issue or pull request.

## Contribution terms and attribution

By submitting original text or example configuration for inclusion, you agree to license that contribution under this project's [CC BY 4.0 license](LICENSE). You retain your copyright. Submit only material you have the right to contribute, identify adaptations and their sources, and retain required attribution. Include a preferred public attribution name or pseudonym if you want one supplied with your contribution; do not disclose someone else's identity without permission.

The [logo has separate permissions](LICENSE_SCOPE.md#separate-logo-permissions); contributing documentation does not grant rights to reuse or modify the logo beyond those permissions. Discuss proposed artwork changes with the maintainer before submitting them. Keep discussion respectful and focused on the task; a diagnosis or public disability disclosure is never required.

## Report an issue

Include the relevant rule ID, the task, what happened, what you expected and the environment. Say whether a finding comes from a personal preference, an observed usability session, an automated test or published research. If a pattern helped one task but harmed another, describe both.

Answer: **What did the person have to remember, infer or recover? What change helped, and what new burden did it introduce?** Label proposals, personal experience, observed difficulty, tested improvements and external sources distinctly. These describe evidence, not whose experience matters most. Include uncertainty and unsuccessful alternatives.

You do not need to disclose a diagnosis. Remove private account details and personal content from examples. Obtain permission before sharing another person's words, screenshots or recordings. Do not publish credentials or security-sensitive system details as evidence.

## Propose a change

- Keep the change focused and explain its effect on existing guidance.
- Identify UI concerns, UX concerns or both using the [project definitions](GUIDE.md#ui-and-ux-in-this-project). Keep shared presentation conventions in the visual standard and task outcomes in the interaction rules; link between them rather than duplicating requirements.
- Preserve rule IDs. New rules need new IDs; do not silently reuse a retired ID for a different meaning.
- Prefer examples and repeatable checks over unsupported claims about how all autistic people or people with ADHD think.
- Distinguish a formal accessibility requirement from a design preference or hypothesis. Cite primary sources when making standards or research claims.
- Keep framework-specific implementation details and branding details optional. The dark theme remains mandatory within adoption scope, with the documented accessibility overrides.
- Include failure and recovery behavior, not only the ideal screenshot.
- Use the [review template](REVIEW_TEMPLATE.md) when supplying implementation evidence.
- Use [worked examples](EXAMPLES.md) for concrete wording and tradeoffs. Model testing with the [evaluation pack](SKILL_EVALUATIONS.md) is deferred to v1.1; it is not a prerequisite for contributing. If supplying evaluation results, report actual outcomes, including unsupported claims or unnecessary changes.

## Review decisions

Maintainers should record accepted changes, reasons and affected versions. Where user needs conflict, consider a predictable choice or scoped alternative rather than declaring one preference universally correct. Describe unresolved findings honestly.

A rule change should explain whether existing reviews need rechecking. Editorial corrections need not imply that previous implementations are invalid. Keep dated evidence intact and link later findings that supersede it.

## Release preparation

Before release, check the [license scope and attribution](LICENSE_SCOPE.md), preserve the separate logo permissions, and verify relative links after copying the directory. Review the actual Git changes and history for private content, personal preference profiles, backups and credentials. Ignore rules do not remove files already tracked by Git. Publish the documentation as a v1.0 practitioner draft with the stated evidence limits; the deferred model evaluations are not a release prerequisite.
