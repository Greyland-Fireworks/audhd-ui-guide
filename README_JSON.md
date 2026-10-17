# Example JSON preferences explained

[Back to the project overview](README.md) · [Preference intake and format](PREFERENCES.md) · [Example JSON file](preferences.example.json)

[preferences.example.json](preferences.example.json) illustrates one fictional configuration. It is not your profile, a set of recommended defaults or an automatic application setting. A product or agent must support each option and verify its effect. The authoritative format, storage rules and precedence are in [PREFERENCES.md](PREFERENCES.md#format-and-precedence).

The tables below use dotted paths to identify fields inside their JSON groups. For example, `sensory.sounds` means the `sounds` field inside the `sensory` object.

[How values work](#unanswered-questions-updates-and-privacy) · [File identity](#file-identity) · [Display](#display-and-group-identification) · [Layout](#layout) · [Motion and sound](#motion-and-sound) · [Attention](#attention-and-updates) · [Help](#help-and-task-support) · [Retention](#retention)

## Unanswered questions, updates and privacy

Every preference field accepts `null`, meaning **not specified at this level**. It is different from `false`, which is an explicit choice. Current explicit instructions take precedence over stored choices; specified project choices override user-wide choices; null falls through to user-wide choices or product defaults. System accessibility, privacy, permission and retention requirements remain constraints throughout.

For a new profile, unanswered leaves are null. For an existing profile, skipping a question leaves the saved value unchanged. Explicitly clearing a choice to null resumes inheritance rather than necessarily restoring the product default. A selected cue array replaces that field's inherited array; it is not appended to it. Temporary requests do not modify stored files unless the user also asks to remember them.

Save confirmed preferences only when asked, using `audhd-preferences.local.json` or the agreed location; keep the fictional example unchanged. Do not store diagnoses, credentials or content history. Protect personal files and recovery copies from unauthorized sharing; the conventional filename is ignored by this repository, but an ignore rule is not access control. See [storage and validation requirements](PREFERENCES.md#save-an-optional-json-profile) before writing or updating a profile.

## File identity

| Field | Example value | Meaning |
|---|---|---|
| `schema_version` | `1` | Identifies this documented format. Version 1 requires all groups and keys shown in the example. Unsupported versions need explicit handling rather than silent replacement. |
| `scope` | `"project"` | Applies the profile to the project associated with its agreed file location. `"user"` represents user-wide choices. This field does not identify a person, grant permissions or locate a profile automatically. |

## Display and group identification

| Field | Example value | What it controls when supported |
|---|---|---|
| `display.group_cues` | `["color", "text", "shape", "pattern"]` | Preferred redundant cues for related groups: color families, labels, shapes and restrained patterns. `"line_style"` is also available, for example solid versus dashed chart lines. Use a nonempty array of distinct supported choices. Text/semantic equivalents remain required even if omitted from the array; color or patterns alone are insufficient. |
| `display.surface_intensity` | `"subdued"` | Requests gentler surface/accent treatment using product tokens; `"standard"` uses the ordinary treatment. It does not change device brightness or permit lowering required contrast. |
| `display.contrast` | `"standard"` | Chooses ordinary accessible contrast or `"increased"` contrast. Neither value is proof that the actual interface meets accessibility requirements. |
| `display.text_scale` | `1.125` | Multiplies the product's base text size by 1.125, or 112.5%. Accepts positive finite numbers. It must not cap browser/OS text enlargement or zoom. |
| `display.line_height` | `1.6` | Requests line spacing of 1.6 times the text size. Accepts positive finite numbers; verify wrapping and readability with actual content. |
| `display.accessibility_theme_override` | `null` | No theme exception specified at this level. `"light"` requests a light accessibility exception; `"system"` follows the system theme as an explicit exception. System accessibility overrides such as forced colors remain honored. The guide's ordinary default remains dark. |

## Layout

| Field | Example value | What it controls when supported |
|---|---|---|
| `layout.density` | `"comfortable"` | Requests more spacious controls and panels; `"compact"` requests a denser arrangement. Both must retain readable text, usable targets and necessary controls. |
| `layout.view` | `"overview"` | Keeps a broader task overview visible; `"focused"` emphasizes the current task. Neither may hide essential context, errors or information needed for comparison. |
| `layout.multiple_sections_open` | `true` | Allows related accordion sections to stay open together. `false` requests a single-open arrangement where appropriate; it must not discard hidden edits or obstruct required comparisons. |

## Motion and sound

| Field | Example value | What it controls when supported |
|---|---|---|
| `sensory.reduce_motion` | `true` | Requests reduced nonessential animation. `false` expresses no additional reduction request, but does not override system reduced-motion settings or authorize distracting effects. |
| `sensory.autoplay` | `false` | Requests deliberate playback instead of automatic media playback. `true` is a preference for supported autoplay, subject to platform restrictions and accessibility needs. |
| `sensory.sounds` | `false` | Disables optional interface sounds. `true` requests them where available. Necessary feedback must remain available without sound. |

## Attention and updates

| Field | Example value | What it controls when supported |
|---|---|---|
| `attention.optional_notifications` | `"batched"` | Groups optional notices instead of interrupting for each one. Alternatives are `"immediate"` and `"off"`. Required notices still need appropriate presentation. This does not authorize creating reminders or scheduled automations. |
| `attention.live_updates` | `"manual"` | Requests deliberate refresh controls rather than automatically changing the work area; `"automatic"` requests supported automatic updates. Keep freshness honest and necessary status visible; neither option should unexpectedly move current work or focus. |

## Help and task support

| Field | Example value | What it controls when supported |
|---|---|---|
| `support.return_summary` | `true` | Shows concise orientation and unfinished-work context on return. `false` omits the optional summary, while essential scope and state remain visible. Do not invent history or past intent. |
| `support.step_guidance` | `null` | No choice specified. `true` requests optional step guidance or a checklist; `false` declines that extra guidance. Ordinary navigation and necessary instructions remain available. |
| `support.larger_targets` | `true` | Requests larger controls or more generous hit areas where supported. `false` does not permit targets below applicable accessibility requirements. |
| `support.help_detail` | `"expanded"` | Makes detailed help easier to keep open. `"concise"` prefers shorter initial explanations while retaining access to needed detail. Critical consequences must remain visible in either presentation. |

## Retention

| Field | Example value | What it controls when supported |
|---|---|---|
| `retention.remember_location` | `true` | Requests restoration of useful location, such as the selected tab, filters or scroll position. `false` declines optional location retention. Restoration must respect object identity, privacy and session policy. |
| `retention.retain_drafts` | `null` | No choice specified. `true` requests draft retention within permitted storage/session boundaries; `false` declines optional retention. This does not override privacy or security policy, imply durable backup or authorize silently deleting existing work. |
