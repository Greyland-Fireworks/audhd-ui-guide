# Recording review references

[Specification](SPEC.md) · [Acceptance evidence](ACCEPTANCE.md) · [Adapter boundaries](../../references/framework-adapters.md) · [Guide](../../GUIDE.md)

Two independently implemented interfaces review three fictional recordings. React uses React Aria provisionally; Svelte 5 uses Bits UI provisionally. Both support canonical navigation, contextual help, 24 skins, four text styles and explicit preference import/export. Reviews and preferences are session-only; simulated save acknowledgment is not a server or file save. Export downloads preferences only.

From the repository root, with Node 22.12+ and npm:

```sh
npm ci
npm run dev:react
```

Run `npm run dev:svelte` in another terminal. The default development addresses are `http://127.0.0.1:4173/` and `http://127.0.0.1:4174/`. If those ports already host another copy, stop that copy deliberately or pass a different port: `npm run dev --workspace recording-review-react-reference -- --port 4193`. No hosted demo is implied.

```sh
npm run build
npm test
npm run check:palettes
npm run check:docs
npx playwright install chromium firefox webkit
npm run test:browser
```

Browser checks use isolated ports 4183–4185 and fresh contexts, never the user's development tabs. Python 3 runs the palette check. Test results, traces and screenshots are local ignored output. No backend, login, telemetry, automatic profile storage or external fonts are included.

Shared files contain fictional data, page records, color mappings, choice descriptions and the recording-demo capability declaration. Both demos use the framework’s capability inspector and import/preview controller. Each framework still owns review state, simulated save completion, navigation, focus and preference application. Do not key/remount the workspace by appearance. Current dependency versions are pinned in the root lockfile; library choice remains provisional despite runnable examples.

A new demo session starts with Guillermo and Skin headings text. The choice labeled Default follows the device’s light/dark setting. Imported light/dark preferences map to Paperwhite/Guillermo; the picker shows each named skin only once. These are demonstration choices. See [profile boundaries](../../PREFERENCES.md#reference-application-boundaries) for supported values and unapplied requests. Full Angular/Vue apps, multiple-category index paths, cross-highlighting and automatic persistence remain deferred.

## Entry and status links

An empty address opens Workspace. Failed saves, pending saves and unsaved reviews appear before the complete destination index. Each row links to its named review, restoring task focus without clearing filters or drafts. Pending saves capture a snapshot; newer edits can remain unsaved even after that snapshot succeeds. These summaries use each adapter’s existing state independently. Explicit recording links still open that recording directly.

## Settings and simulated saves

Appearance choices start collapsed. Select **Show appearance choices** to open the previews; the summary keeps the current skin name, color bands and heading-font sample visible. Selecting a card applies it immediately for this session. **Hide appearance choices** closes the collection without changing the selection.

Text style, Text size, Spacing and Detailed help have separate groups. Detailed help currently opens or closes only “About these timings” on recording pages; it does not expand every info button. Spacing changes card padding and layout gaps, not line height. **Skin headings** uses the skin’s heading font; available local fonts determine the actual rendering. Importing a profile is different from choosing a card: import creates a preview, and **Apply for this session** applies it. **Portable preferences** contains import/export; exports contain preferences only.

**Save review** deliberately stays pending until you open **Demo save controls** and simulate completion or failure. Waiting does not finish it. This lets you test newer edits and navigation while a save is pending; completion still stores the result only in the open page. Reloading resets the demo.

See the [current validation summary](../../references/framework-evidence.md) and [manual checklist](../../references/manual-accessibility-checklist.md). Automated browser checks do not close the native accessibility gates.
