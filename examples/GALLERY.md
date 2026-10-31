# Example screenshot gallery

Current captures below show operational entry screens, configuration decisions and focused workflows. The examples use fictional data; their READMEs describe simulation and persistence limits. Older October 19 captures are retained afterward as historical illustrations, not validation of the current UI.

## Current operational views

Captured with Chromium on Windows. The administration overview is from October 30, 2026; the room-search and note-settings captures below are from October 31. Recording and unlock-editor captures are from October 26. Administration desktop captures use 1440px width; recording desktop uses 1440 × 1080. Narrow captures use a 390 × 844 viewport. Unless marked ordinary text size, they use 200% root text size, which is not browser zoom. Screenshots were inspected for hierarchy, wrapping and unnecessary copy. See the [administration verification record](administration/README.md#verification-scope) and [recording acceptance evidence](recording-review/ACCEPTANCE.md) for executed checks and remaining limits.

**Team overview.** Today's meetings sit beside problems with direct remedies. Work ready to continue and routine administration checks remain separate from confirmed problems; an unchecked role does not raise the warning count.

![Harbor Team Hub overview with today's timeline, two actionable problems and work ready to continue.](screenshots/gallery-administration-overview.png)

[Administration at narrow width and enlarged text](screenshots/gallery-administration-overview-narrow.png)

**Room search.** Requirements are submitted explicitly. Compact room choices retain enough information to compare availability; the selected room reveals its schedule and next action. An unavailable room offers relevant alternatives. Editing requirements keeps the previous result visible but prevents continuing until another search succeeds.

![Room search showing submitted requirements, three room choices and the selected room's schedule.](screenshots/gallery-administration-rooms.png)

[Changed requirements with stale results](screenshots/gallery-administration-rooms-stale.png)

**Inline Guide Notes, October 31, 2026.** Optional italic takeaways stay beside their subject; expandable reasoning includes a concrete check and source links. The general introduction is collapsed to keep the task visible.

![Room-search teaching annotation expanded beside the requirements and results.](screenshots/gallery-administration-guide-room.png)

[Guide Notes at 390 × 844, ordinary text size](screenshots/gallery-administration-guide-narrow.png)

**Note settings.** Current and proposed settings share one group. The impact preview identifies saved notes above the proposed character limit without changing their content. A local restriction preserves the proposal while making the unavailable save action explicit.

![Current and proposed note settings with a character limit, affected-note links and save actions.](screenshots/gallery-administration-settings.png)

[Read-only configuration with the proposal retained](screenshots/gallery-administration-settings-readonly.png)

**Recording workspace.** The failed save appears once, with its named-record action. “Other unsaved reviews” excludes records already represented by failure or pending-save rows. The complete destination index follows operational status. The literal title replaces the repeated workspace eyebrow and introductory subtitle.

![React Workspace with a failed save, empty pending and other-unsaved groups, and the complete destination index below.](screenshots/gallery-react-overview.png)

[Svelte overview at narrow width and enlarged text](screenshots/gallery-svelte-overview-narrow.png)

**Focused editor.** Delivery settings remains the entry task. Lock, restoration and browser-storage limits remain explained; invalid entries link from the summary back to their fields. This capture shows valid values, so no error links are present.

![Delivery settings editor with literal heading, scoped locks, restoration controls and browser-local save status.](screenshots/gallery-unlock-editor.png)

## Historical appearance captures

The October 19 images below predate the current appearance bank and status-first entry. Captions describe their captured states. They are preserved for reference; current interfaces consume the canonical [framework appearance assets](../packages/audhd-ui-framework/README.md).

[Paperwhite walkthrough](#paperwhite-a-guided-tour) · [Guillermo review](#guillermo-the-same-work-in-a-dark-skin) · [Bubblegum preferences](#bubblegum-personal-appearance-choices) · [Cyberpunk directory](#cyberpunk-a-map-of-the-workspace)

## Paperwhite: a guided tour

**React · Paperwhite (light) · System text.** The user is reviewing Harbor morning and has an unsaved note. Red outlines and numbered markers are editorial annotations, not interface controls or error states.

1. **Breadcrumbs show ancestry.** Workspace → Recordings → Harbor morning appears at both the top and bottom, so users can orient themselves without scrolling back.
2. **Workspace navigation chooses a destination.** Recordings and Workspace preferences form the upper navigation level. The active destination has a visible underline.
3. **Local tabs choose a view of the current object.** Review and Recording details sit inside the recording workspace. They are subordinate views, not another set of global destinations.
4. **Optional explanation stays within reach.** “About these timings” expands supporting detail. The circled question-mark button offers clarification of review status. Essential timing meanings remain visible even when extra help is closed.
5. **The selected card and detail area belong together.** Matching surfaces, title colors and edge treatments connect them; the arrow points from the source toward its work area. Repeated identity and “Current recording” support recognition without color. “Reviewing Harbor morning” describes the current state.
6. **Save consequences are explicit.** The visible sentence explains that this demo saves only for the current page session. The circled exclamation-mark button offers additional explanation; it does not hide the limitation. “Unsaved changes” describes this draft honestly.

![Full-page Paperwhite review with numbered red outlines identifying breadcrumbs, workspace navigation, local tabs, optional help, connected source and detail, and save consequences.](screenshots/react-paperwhite-annotated.png)

[Open the annotated view at full size](screenshots/react-paperwhite-annotated.png) · [Open the original screenshot without annotations](screenshots/gallery-react-paperwhite.png)

These patterns illustrate AUDHD-01, 02, 04, 05, 06, 08 and 09 in the [Guide](../GUIDE.md). The required outcome is understandable relationships and behavior; these particular boxes, colors and layout are examples.

## Guillermo: the same work in a dark skin

**React · Guillermo (dark) · System text.** Compare this with Paperwhite: the current recording, note, navigation and layout remain the same. The active-context color links the source card and detail area, while the Save review action has its own treatment. Changing appearance should preserve work and context.

![Full-page Guillermo review: Harbor morning is current, the source and detail share a surface and turquoise accents, and a review note remains unsaved.](screenshots/gallery-react-guillermo.png)

[Open Guillermo at full size](screenshots/gallery-react-guillermo.png)

## Bubblegum: personal appearance choices

**Svelte 5 · Bubblegum (light) · Serif text.** Skin and text style are separate choices. Visible labels explain each setting, and circled information icons provide supplementary help. Import and export sit in a named Portable preferences section, with the local-file and session limits explained before the controls. The footer repeats orientation links in a compact form.

![Full-page Bubblegum preferences with Serif text, local profile import and export, and separate appearance, text style, size, spacing and help controls.](screenshots/gallery-svelte-bubblegum.png)

[Open Bubblegum at full size](screenshots/gallery-svelte-bubblegum.png)

## Cyberpunk: a map of the workspace

**Svelte 5 · Cyberpunk (dark) · System text.** All pages presents a hierarchical directory with a short explanation of each destination. Individual recordings appear beneath their parent collection, with identifiers and metadata to distinguish them. This is the canonical directory; multiple-category membership and cross-highlighting remain future work.

![Full-page Cyberpunk directory showing Recordings, its three individual recording destinations, and Workspace preferences with short descriptions.](screenshots/gallery-svelte-cyberpunk.png)

[Open Cyberpunk at full size](screenshots/gallery-svelte-cyberpunk.png)

The help icons are consistent SVG outlines that inherit each skin’s semantic colors. Their accessible button names and hover, keyboard and click/tap behavior remain independent of appearance.

## Explore and verify

- [Run React or Svelte locally](recording-review/README.md) to try navigation, help, review state and appearance changes. React Aria and Bits UI remain provisional choices.
- [Explore all 45 skins and chart palettes](skins/README.md). Light and dark appearances are personal choices, not universal AuDHD prescriptions.
- [Read acceptance results and pending checks](recording-review/ACCEPTANCE.md). Screenshots illustrate appearance; they do not establish keyboard accessibility, screen-reader usability or suitability for every person.

Captured October 19, 2026, using headless Chrome 155 on Windows at a 1280 × 900 CSS-pixel viewport, with full-page capture, Standard text size and Comfortable spacing. Full-page image heights vary. The [editable annotation source](screenshots/react-paperwhite-annotated.svg) preserves the original capture and adds vector outlines and numbers; the gallery displays its PNG rendering. Screenshots and annotations are documentation under [CC BY 4.0](../LICENSE_SCOPE.md).

[Return to README](../README.md)
