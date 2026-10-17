# AuDHD friendly interface guidance

<img src="audhd_uiux_icon_v1.png" alt="AuDHD project logo: overlapping pink and cream circuit motifs inside a turquoise circle" width="160" height="160">

Practical guidance for interfaces that are easier to understand, use, pause, resume and correct.

**Start with one task. You do not need to redesign everything at once.**

[Read the guide](GUIDE.md) · [Try a review](#try-one-small-review) · [Use the skill](#use-with-an-llm) · [Configure preferences](#personalize-the-interface)

**Status:** Version 1.0 draft · Updated October 17, 2026

## On this page

[What the guide covers](#what-you-will-find) · [Find a resource](#choose-your-next-step) · [Quick review](#try-one-small-review) · [Skill usage](#use-with-an-llm) · [Personalization](#personalize-the-interface) · [Project background](#different-people-need-different-things) · [Accessibility](#accessibility-and-safe-adoption) · [Community](#community) · [JSON reference](README_JSON.md) · [License](#license)

## What you will find

- **UX and UI guidance:** 13 interaction rules for understanding and completing tasks, plus a standard for layout, controls and visual states. Dedicated sections cover dashboards, tabs and accordion sections.
- **A mandatory dark theme:** restrained dark surfaces, readable light text and distinct focus and selection cues. Explicit accessibility overrides take precedence.
- **A repeatable review:** follow a complete task, including applicable failure, recovery and return states.
- **Help without remembered context:** clear plain-English explanations, brief accessible tooltips and persistent detailed help, even for someone who has forgotten how their own system works.

Use the guidance for websites, desktop applications, mobile apps, games and internal tools. No particular framework or plugin is required.

## Choose your next step

| I want to… | Open this |
|---|---|
| Understand the rules and visual treatment | [Combined guide](GUIDE.md) |
| Understand UI versus UX and where each is covered | [Project definitions](GUIDE.md#ui-and-ux-in-this-project) |
| Organize a dashboard with clear priorities and navigation | [Dashboard organization](GUIDE.md#dashboard-organization-and-hierarchy) |
| Group related tools and settings into tabs or expandable sections | [Tabs, sub-tabs and accordion sections](GUIDE.md#tabs-sub-tabs-and-accordion-sections) |
| Tailor colors, text, density, motion or interruption support | [Personalization overview](#personalize-the-interface) and [JSON reference](README_JSON.md) |
| Check an existing interface | [Review template](REVIEW_TEMPLATE.md) |
| See context, help and recovery in practice | [Worked examples](EXAMPLES.md) |
| Use the guide with an LLM | [Usage instructions](#use-with-an-llm) and [agent skill](SKILL.md) |
| Evaluate an LLM's use of the guide | [Skill evaluation pack](SKILL_EVALUATIONS.md) |
| Suggest a change or share evidence | [Contribution guidance](CONTRIBUTING.md) |
| Ask a question or discuss an example | [Discord community](https://discord.gg/BY3BVkJ3Sq) |

## Try one small review

1. **Choose a real task.** For example: edit a setting, save it, leave and return.
2. **Follow the task from beginning to end.** Include a mistake or failed save where you can test safely.
3. **Write down what happened.** Use the [review template](REVIEW_TEMPLATE.md), select the relevant rule IDs and identify one focused improvement.

Keep these questions nearby:

- Can I tell what I am editing and what the change affects?
- Can I see what is selected, what is taking effect and whether it saved?
- Can I recover a mistake without starting over?
- Can I return after an interruption and find my place?
- Can I operate the interface without relying on color, hover or a mouse alone?

## Use with an LLM

### Set up the skill

1. Copy this folder into your agent's documented skill directory, keeping the folder name `audhd-ui-guide`. Keep its supporting Markdown and JSON files together so the skill's relative references work.
2. Follow your agent's instructions for discovering or refreshing skills. Confirm that `audhd-ui-guide` is available through its skill picker or discovery mechanism, where provided. Simply cloning this repository does not guarantee that an agent will load the skill.
3. Open the project you want reviewed and name the screen or workflow. Provide relevant source files, screenshots or an accessible running interface as available. Explain the task users need to complete, any known difficulty and whether you want review, design or implementation.

Skill installation and explicit invocation syntax vary by tool. You can name the skill in your request:

> Use the audhd-ui-guide skill to review the report settings form. Focus on changing the destination, saving, recovering a failed save and returning later. Review only.

### Run a focused audit

Once the skill is available to the agent, type **`audhd audit`** as a request. The phrase is case-insensitive and is an instruction recognized by this skill, not a shell command or a separately installed slash command. If your agent does not discover it automatically, explicitly select or name `audhd-ui-guide` with the request.

| Request | Scope |
|---|---|
| `audhd audit` | The interface, change or task already under discussion; asks for a target if none can be identified |
| `audhd audit the publishing dashboard` | Dashboard hierarchy, metrics, alerts, navigation and the relevant task behavior |
| `audhd audit the settings form, especially failed saves and returning after an interruption` | The named form and workflow, with emphasis on recovery and continuity |

The audit is **review-only by default**. Expect prioritized findings that distinguish UI, UX or both, identify relevant rule IDs and evidence, and recommend focused changes and verification steps. Checks that cannot be performed remain pending. A screenshot can support visible-layout findings but cannot prove save behavior, keyboard access or user understanding. No findings is a valid outcome when the available evidence justifies no change; remaining evidence gaps must still be reported.

The trigger does not request a whole-project redesign, theme migration or model evaluation. To authorize implementation, say so explicitly and bound the change:

> Use the audhd-ui-guide skill. Audit the settings form, then fix misleading save feedback and inaccessible help. Preserve existing permissions and saved work; report the changes, actual checks and remaining gaps.

### Request design or implementation directly

An audit is optional. Name the skill and the work you want:

> Use the audhd-ui-guide skill to design a report dashboard. Separate summary metrics, actionable alerts, the review queue and optional diagnostics. Describe loading, failure and narrow-screen states; label behavior that still needs validation.

> Use the audhd-ui-guide skill to implement the agreed dashboard grouping changes in the existing components. Keep the task scope, navigation behavior and saved data intact.

The guide requires a dark theme within the established adoption scope and honors explicit accessibility overrides. A focused wording or interaction change does not authorize recoloring the entire application. State any project constraints or scoped exceptions in the request.

### Use without skill support

Attach `SKILL.md`, `GUIDE.md` and `REVIEW_TEMPLATE.md` to the conversation and use this prompt:

> Apply the attached AuDHD-friendly interface guide to [interface and task]. Follow the skill instructions, including the mandatory dark theme within the established adoption scope and accessibility overrides. Stay within this task and preserve existing behavior and saved work. Distinguish UI and UX concerns; report relevant rule IDs, evidence, checks performed and remaining gaps. Review only unless I ask you to implement changes.

Attach `EXAMPLES.md` when examples would help. For personalization work, also attach `PREFERENCES.md` and `preferences.example.json`; the JSON is a fictional reference, not a personal profile.

## Personalize the interface

For individual design or personalization, the skill offers a brief, optional intake about display and interaction needs. Answer only what matters, try a preview or skip the questions. A diagnosis is never required. For products serving many people, one person's preferences do not represent every user.

Options include color plus labels/shapes/patterns, text size and spacing, density, motion, sound, optional notifications, help detail and interruption recovery. The [preference guidance](PREFERENCES.md) explains the questions, storage rules and supported profile format.

To request a temporary adjustment:

> Use larger text and no optional sounds for this task. Skip the other preference questions and do not save a profile.

To remember confirmed choices:

> Save the text scale and sound preference we just agreed on for this project in audhd-preferences.local.json. Keep my other saved choices unchanged.

Saving a preference does not implement or verify it. The [example JSON](preferences.example.json) illustrates the format; the [JSON field reference](README_JSON.md) explains every option. Unsupported preferences must be reported. System accessibility overrides and privacy requirements remain in effect.

**Area for improvement:** Intake, profile handling and preference effects need real-user and integration testing. See the [documented follow-up](PREFERENCES.md#area-for-improvement-validate-personalization-in-practice).

## Different people need different things

AuDHD commonly refers to the co-occurrence of autism and ADHD. Some people want a focused view; others need a dense overview. Offer useful choices and test them with the people doing the work. You do not need to disclose a diagnosis to contribute.

This is a practitioner guide, not a clinical intervention or certification. Its specific patterns have not been established here through research with a representative group of AuDHD users. The mandatory dark theme is a design choice, not a claim that every AuDHD person prefers it.

The project is a **v1.0 draft**. Its 26 prepared model-evaluation scenarios remain unrun, with testing [deferred to v1.1](SKILL_EVALUATIONS.md#planned-for-v11-model-testing). Those evaluations are not required for ordinary use or feedback, and successful text reviews would not prove real-interface usability.

> [!NOTE]
> **Why I developed this guide**
>
> Despite the serious concerns about the social and ecological impacts of AI/ML, working with Large Language Models to develop software has been life-changing for me.
>
> Throughout my life, I tried several times to learn programming. But the way my AuDHD brain works made it difficult to retain and recall the information I needed in the moment to write code manually.
>
> The only languages I was ever able to work with were HTML and Terrapin Logo. I knew a great deal about computers and technology, even built huge interactive art projects for hacker conferences, but I always felt shut out of the driver’s seat, and making a computer do **exactly** what I wanted it to do.
>
> Over the last two years, I’ve built project after project using LLMs as coding assistants. Along the way, I developed many tools to help me do more. I created parts of this guide to help keep the interfaces they build organized and understandable to me, particularly backend dashboards. Due to the AuDHD memory constraints, I needed those interfaces customized to make sense when I frequently couldn’t remember how or why I had built certain features.
>
> I’m publishing this guide in the hope that it helps someone facing similar difficulties. Please join me on the [Discord server](https://discord.gg/BY3BVkJ3Sq) to connect with other AuDHD software creators.
>
> — Charles Beckwith, @fashiontechguru

## Accessibility and safe adoption

For web work, use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) as the formal accessibility reference, with Level AA as a baseline. [W3C cognitive accessibility guidance](https://www.w3.org/TR/coga-usable/) provides additional usability guidance. For native applications, use the platform's accessibility guidance and assistive technologies.

This guide supplements those resources. It does not replace a conformance evaluation. Report specific findings such as “Keyboard recovery tested in this build,” rather than “AuDHD compliant.”

Preserve existing product behavior, permissions, privacy and saved work when improving presentation. A collapsed panel is a view preference; approving or publishing content is a separate action.

## Community

[Join the Discord community](https://discord.gg/BY3BVkJ3Sq) to ask questions, share interface examples and discuss improvements.

For a structured proposal, include the task, relevant rule ID, what happened and what you would change. The [contribution guidance](CONTRIBUTING.md) explains how to share useful evidence without exposing private information.

## Example JSON preferences explained

The [JSON preference reference](README_JSON.md) explains every field in [preferences.example.json](preferences.example.json), including value types, example values, inheritance and privacy. These preferences describe requested behavior; applications and agents must implement and verify supported settings. See [PREFERENCES.md](PREFERENCES.md) for intake and storage guidance.

## License

The guide and skill text are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Read the [full license](LICENSE) and [scope and attribution notice](LICENSE_SCOPE.md), which also covers the documentation and example preference JSON and excludes the logo.

**Logo:** You may display the unmodified logo to identify, discuss or link to this project, with credit and a link to the project. Other uses, including unrelated product branding or merchandise, require prior written permission. Permission does not imply endorsement.

<details>
<summary>Project origin and version history</summary>

### Origin

This standalone guide combines 13 interaction rules and a visual standard, including a mandatory dark theme, for use across projects.

This repository includes the [license scope and attribution](LICENSE_SCOPE.md) and [contribution terms](CONTRIBUTING.md#contribution-terms-and-attribution). This practitioner draft retains the evidence limits described above.

### Version history

- **1.0 draft — October 17, 2026:** Combined project-independent guide, mandatory dark theme, contribution guidance and reusable review template. README includes project artwork, direct task links and a short review checklist.

</details>
