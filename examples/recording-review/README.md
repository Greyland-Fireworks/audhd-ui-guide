# Recording review references

[Specification](SPEC.md) · [Acceptance evidence](ACCEPTANCE.md) · [Adapter boundaries](../../references/framework-adapters.md) · [Guide](../../GUIDE.md)

Two independently implemented interfaces review three fictional recordings. React uses React Aria provisionally; Svelte 5 uses Bits UI provisionally. Both support canonical navigation, contextual help, 22 skins, four text styles and explicit preference import/export. Reviews and preferences are session-only; simulated save acknowledgment is not a server or file save. Export downloads preferences only.

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

Shared files contain static fixtures, canonical page records, semantic token values and a stateless capability report. Each framework owns review state, save settlement, routing, focus and preference application. Do not key/remount the workspace by appearance. Current dependency versions are pinned in the root lockfile; library choice remains provisional despite runnable examples.

The default skin is Guillermo, with System text; light/dark presets map to Paperwhite/Guillermo. These are demonstration choices. See [profile boundaries](../../PREFERENCES.md#reference-application-boundaries) for supported values and unapplied requests. Full Angular/Vue apps, multiple-category index paths, cross-highlighting and automatic persistence remain deferred.
