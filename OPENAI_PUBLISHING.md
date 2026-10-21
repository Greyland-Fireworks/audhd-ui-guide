# Publish the AuDHD UI Guide plugin

Prepared October 20, 2026. The package is not publicly published. Nothing in this workflow submits or publishes automatically.

## Build and inspect

From the repository checkout root, run `python scripts/package-plugin.py` (Python 3.9+ and Git; no new Python dependencies). Edit `plugin/plugin.json` in that checkout to change the manifest. Packaging tooling stays in the checkout. Plugin version 1.1.1 packages guide v1.01 with revised skill execution guidance; these version numbers serve different purposes.

The command generates `output/openai/audhd-ui-plugin/` and `output/openai/audhd-ui-guide-1.1.1.zip`. The ZIP has `plugin.json`, `skills/` and `assets/` directly at its root. Rebuild instead of editing generated files. Fixed ZIP timestamps and sorted entries make repeated builds identical with the same sources and Python/compression runtime.

The source root contains the editable `audhd_uiux_icon_v2.svg` and optimized PNG exports: `audhd_uiux_icon_256.png` (256×256), `audhd_uiux_icon_2048.png` (2048×2048), and `audhd_uiux_icon_1280x640px.png` (1280×640, under 1 MB) for GitHub social sharing. The plugin composer icon and skill's small icon use the 256px export; the plugin logo and skill's large icon use the 2048px export. Skill icon paths in `agents/openai.yaml` resolve from the skill directory. The SVG and square exports are packaged; the social image stays in the checkout. Packaging uses the checked-in exports and needs no image-processing dependency.

The source allowlist retains the guide, preferences, schemas, reference gallery, runnable examples and their existing checks. It excludes Git/GitHub metadata, local profiles, research notes, dependencies, build output and packaging tooling. The skill and its resources keep their relative paths. Supporting screenshots are reference material, not listing screenshots.

Run `npm run check:docs` and `npm test` for source validation. See [the validation record](PLUGIN_VALIDATION.md) for results and testing limits.

## Owner checklist

1. Choose the OpenAI organization and project that will own the plugin. Verify the individual or business identity in [organization settings](https://platform.openai.com/settings/organization/general). Organization owners can submit; other members need **Apps Management Write**. Confirm that Charles Beckwith, taken from the existing project attribution, is the intended publisher; the directory uses the selected verified identity. No email address or legal policies have been invented.
2. Open the [plugin submission portal](https://platform.openai.com/plugins), choose **Upload new or existing plugin**, select the verified Developer identity and the **Skills only** path, then upload the generated ZIP.
3. Inspect **Metadata & Skills** and wait for all skill safety/security scans to finish. Copy findings, fix source files, rebuild and re-upload until required validation issues are resolved. Review any normalization warnings before confirming them. Local checks do not replace portal validation.
4. Confirm the name, subtitle, description, category, starter prompts, unmodified logo and publisher identity. Check availability settings and any additional skills-only eligibility requirements shown by the portal. The existing license scope applies: documentation CC BY 4.0, code MIT, separate logo permissions. The packaged logo identifies this project with the existing attribution and repository link.
5. Test installation and invocation in the available ChatGPT and Codex environments before submission. Try a direct audit, an indirect UI design request and an unrelated request; also test an authorized improvement with behavior checks. Record actual results. Skills-only submissions do not require MCP credentials, MCP review cases, a demo recording or fabricated privacy/terms URLs. Complete any additional legitimate portal requirements.
6. Select the draft, choose **Submit for review**, and complete the required policy attestations. This is a manual owner action. Follow review status and resolve reviewer feedback.
7. After approval, select the approved version and **Publish**. Approval alone does not publish it.
8. Verify that users can find **AuDHD UI Guide** in the shared directory and install it in both ChatGPT and Codex where supported. In a fresh chat, select/name `audhd-ui-guide` and run a bounded audit. Confirm the packaged resources are available. Only then update the README to say it is published and add the verified listing link.
9. For updates, preserve the manifest name, increment `plugin/plugin.json`'s semantic version, rebuild the complete ZIP and upload it to the **existing** plugin. Review the new checks, complete applicable review and publish the approved version. Update documented ZIP filenames when the version changes.

**Updating GitHub alone does not update a published skills-only plugin.** The directory serves the submitted package snapshot; changed skills and assets require a new ZIP.

## Official references

- [Plugin packaging and portable manifest](https://developers.openai.com/plugins/build/plugins)
- [Skill format and supporting resources](https://developers.openai.com/plugins/build/skills)
- [Submission, publisher permissions, listing fields and updates](https://developers.openai.com/plugins/deploy/submission)
- [Validation errors, archive limits and skills-only requirements](https://developers.openai.com/plugins/deploy/submission-errors)
- [Plugin guidelines and eligibility](https://developers.openai.com/plugins/plugin-guidelines)
