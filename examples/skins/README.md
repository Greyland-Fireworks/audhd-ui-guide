# Dashboard skins

Canonical CSS and palette data live in the [framework package](../../packages/audhd-ui-framework/README.md). The local stylesheet imports that source. Add `data-audhd-ui` to the same root as `data-skin` and `data-type`; unmarked sibling regions remain unstyled. The local palette registry is a byte-checked compatibility copy. Package installation is optional for this preview.

Open `preview.html` directly, or serve the repository root with `python -m http.server 4175 --bind 127.0.0.1` and open `/examples/skins/preview.html`. The preview has all 45 registered skins, optional text styles, shared active-context panels, labeled bar/line charts, data tables and scale swatches. It starts with Guillermo. Selection is session-only and does not persist.

For new interfaces without an established design system, [reuse the full registry and canonical styles](../../GUIDE.md#adaptable-appearance), with Guillermo as the initial product default absent an explicit preference or established product default. Offer all registered skins with representative previews, independent text styles and a system-appearance choice (Paperwhite for light, Guillermo for dark unless established requirements specify otherwise). Direct asset reuse does not require framework installation. Document justified brand, platform or technical exceptions; layouts and branding remain adaptable. These defaults are not claims of universal AuDHD suitability, and a focused unrelated change does not authorize reskinning an existing application.

## Selected workbench skins

The 21 selected designs bring the registry to **45 skins: 28 light and 17 dark**. The chosen page, surface, text, action, accent, ornament, success and danger colors are preserved from the workbench. Jade Tile changes only its page/background color to Harbor Glass’s `#eef6f3`; its other source colors remain intact. Murica combines Union Paper colors with Federal Ledger typography; Szechuan combines Bamboo Manuscript colors with Celadon Vessel typography; Brass Cabinet uses Brass Circuit’s title face with its own body face.

| Registered skin | Palette source | Title / body family |
| --- | --- | --- |
| Murica (`murica`) | M01 Union Paper | Libre Baskerville / Public Sans |
| Canto (`canto`) | C01 Harbor Glass | Space Grotesk / Noto Sans |
| Pearl River (`pearl-river`) | C07 Pearl River | Sora / IBM Plex Sans |
| Porcelain Studio (`porcelain-studio`) | C09 Porcelain Studio | Noto Sans HK / Noto Sans |
| Jade Tile (`jade-tile`) | C03 Jade Tile | Chivo / Source Sans 3 |
| Szechuan (`szechuan`) | S01 Bamboo Manuscript | Marcellus / Lato |
| Lacquer Cabinet (`lacquer-cabinet`) | S06 Lacquer Cabinet | Cormorant SC / Source Sans 3 |
| Tea Horse Road (`tea-horse-road`) | S04 Tea Horse Road | Forum / Work Sans |
| Peony Album (`peony-album`) | S10 Peony Album | GFS Didot / Figtree |
| Souk (`souk`) | K02 Brass & Indigo | El Messiri / Source Sans 3 |
| Damascus Inlay (`damascus-inlay`) | K04 Damascus Inlay | Noto Naskh Arabic / Noto Sans |
| Palm Shade (`palm-shade`) | K10 Palm Shade | Spectral / Figtree |
| Night Bazaar (`night-bazaar`) | K08 Night Bazaar | Yeseva One / DM Sans |
| Hacienda (`hacienda`) | H01 Andean Weave | Alegreya / Source Sans 3 |
| Patio Moderno (`patio-moderno`) | H03 Patio Moderno | Josefin Slab / Josefin Sans |
| Atacama Dusk (`atacama-dusk`) | H08 Atacama Dusk | Zilla Slab / IBM Plex Sans |
| Golden Child (`golden-child`) | G04 Gilded Play | Dela Gothic One / Figtree |
| Brass Cabinet (`brass-cabinet`) | G01 Brass Cabinet | Orbitron / Work Sans |
| Black Gold (`black-gold`) | G02 Black Gold | Cinzel Decorative / Manrope |
| Astral Foundry (`astral-foundry`) | G10 Astral Foundry | Fascinate / Nunito Sans |
| Brass Circuit (`brass-circuit`) | G07 Brass Circuit | Orbitron / IBM Plex Sans |

The [selection record](../../packages/audhd-ui-framework/skin-selections.json) records the exact sources, colors and font weights. The [font manifest](../../packages/audhd-ui-framework/fonts-manifest.json) records the 31 bundled font files, hashes, source URLs and individual OFL notices. These are Latin subsets used by this English-language interface; the collection does not claim Chinese or Arabic glyph coverage. Each family has an explicit fallback, and font loading never blocks task controls. Namespaced font families keep the earlier 24 skins’ fallback behavior intact.

Supplementary control borders, focus, muted text, active surfaces and chart scales are derived for the toolkit’s existing roles and checked separately. `--ui-ornament` preserves the selected decorative color; it is not a text or status contrast guarantee. The metallic themes use flat gold/brass colors on readable surfaces, not animated reflections. Independent text overrides remain available under the general appearance contract; the administration demo retains its explicit paired-look-only choice.

## Green Ledger pair

| Skin ID | Appearance |
| --- | --- |
| `green-ledger-light` | Warm paper surfaces, deep green ink and forest-green actions; sage selection and purple focus. |
| `green-ledger-dark` | Deep forest surfaces, cream text, lime actions and mint selection; lavender focus. |

The pair combines the green palettes explored in the ntfy dashboard experiments into the existing token contract. Both include six categorical chart colors, sequential and diverging scales, status colors and essential control boundaries. Optional Skin headings use Georgia with local serif fallbacks; system body text and independent text-style choices remain available. Select either ID through the registry or `data-skin`. Guillermo remains the initial product default; the system mapping remains Paperwhite/Guillermo.

Token checks cover these skins on the same terms as the rest of the collection. Their green selection and success colors still need explicit labels; color alone does not establish state or chart identity. No diagnosis-specific benefit is claimed.

## Use

Load `skins.css`, then apply `data-audhd-ui` and `data-skin="guillermo"` and class `ui-skin` to an app root. `palette-data.json` supplies chooser names and light/dark metadata. For a nested preview card, put both `data-audhd-ui` and its own `data-skin` on the card; `data-skin` alone inherits the surrounding palette instead of applying a separate one. Omitting `data-type` uses the skin’s default typography; the selected workbench skins include paired heading/body faces. Use `data-type="expressive"` for skin headings, or explicit `system`, `serif` or `mono` text overrides. Honor `--ui-font-heading-weight` when styling headings. Copy `fonts.css` and `fonts/` alongside canonical `skins.css` when reusing assets without installing the package. The bundled Latin-subset fonts load locally; missing glyphs and the earlier skins use their existing local fallbacks. No third-party font requests are needed.

```html
<section data-audhd-ui data-skin="guillermo" class="ui-skin">
  <article class="ui-panel ui-active">
    <p>Current dataset</p>
    <h2 class="ui-active-title">Weekly review</h2>
  </article>
</section>
```

| Role | Tokens / hooks | Meaning |
| --- | --- | --- |
| Reading | `--ui-page`, `--ui-surface`, `--ui-text`, `--ui-muted` | Opaque surfaces and readable text |
| Controls | `--ui-control-border`, `--ui-action`, `--ui-on-action` | Boundaries and actionable controls |
| Active context | `--ui-active-surface`, `--ui-active-accent` | Shared selected source/detail appearance; retain explicit current labels |
| Keyboard focus | `--ui-focus` | Temporary target; an offset outline remains distinct from persistent selection |
| Status | `--ui-success`, `--ui-warning`, `--ui-danger` | Always pair with meaningful text or symbols |
| Categories | `--ui-chart-series-1` through `6` | Stable category assignment; direct labels, shapes or dashes required |
| Quantities | `--ui-chart-seq-1` through `5` | Low to high; monotonically changing luminance |
| Deviations | `--ui-chart-div-1` through `5` | Negative through reference value to positive; define the center explicitly |
| Missing values | `--ui-chart-missing` | Use a dash/hatch and “No data”; never imply zero |

Inline SVG can consume variables directly. Canvas chart adapters must read resolved variables with `getComputedStyle(root).getPropertyValue('--ui-chart-series-1')` and redraw after skin changes. CSS does not implement a chart library or its keyboard behavior. Keep data, selection, focus, drafts and category identity intact when changing skins. For pie/stacked charts, add segment boundaries and direct labels; for scatter plots use marker shapes; for heatmaps provide numeric values and a table. Do not put text directly on ramp cells without separately checking its contrast.

## Text and control sizes

Palette tokens define appearance, not a complete layout. The optional [control stylesheet](../../packages/audhd-ui-framework/controls.css) supplies relative text and target sizes when imported with a `data-controls` marker on the same `data-audhd-ui` root. See [usage and override boundaries](../../packages/audhd-ui-framework/README.md#readable-control-defaults). Keep ordinary labels, controls and decision help readable; compact spacing must not reduce their text size. Verify the rendered result after application styles and user preferences apply.

## Source owners and review checks

| Boundary | Source owner | Rules and repeatable evidence |
| --- | --- | --- |
| Canonical palette reuse and opt-in styling | Local [skins.css](skins.css) imports [package CSS](../../packages/audhd-ui-framework/skins.css); no local token definitions | [Appearance contract](../../GUIDE.md#adaptable-appearance), [AUDHD-11](../../GUIDE.md#audhd-11-keep-controls-readable-and-operable). [check_palettes.py](check_palettes.py) checks registry/CSS consistency and contrast; [framework consumer checks](../../scripts/check-framework.mjs) separately test the opt-in boundary. |
| Reflowing preview panels, explicit selection/focus cues, static charts with exact-value tables and missing-data labels | [preview.html](preview.html): HTML and inline CSS | [AUDHD-02](../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings), [AUDHD-08](../../GUIDE.md#audhd-08-use-visuals-to-support-decisions). The palette-preview case in [full.spec.js](../../tests/browser/full.spec.js) switches every registered skin, checks table/missing-data availability and checks narrow reflow. |
| Session-only skin/text-style choices without replacing data or controls | [preview.html](preview.html): `choose` and native control handlers | [AUDHD-05](../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability), [AUDHD-07](../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status). The same browser case checks palette application and retained data labels. Source comments explain ownership; they do not certify screen-reader behavior or user understanding. |

## Verification and limits

Run `python check_palettes.py`. It checks text at 4.5:1 against page/panel/active surfaces, controls and focus at 3:1, button text at 4.5:1, categorical marks at 3:1 against the plot surface, sequential luminance and preview coverage. Decorative separators and low-valued ramp fills are not claimed to meet 3:1; use the control-border token for essential boundaries.

Similar hues can remain in a skin, so color alone cannot distinguish series, status, focus or selection. Forced-colors mode retains outlines, labels and line dashes; tables remain available when scale colors collapse. Actual chart implementations still require testing for zoom, keyboard operation, assistive technology and user understanding. Light and dark are equally supported; enjoyment and individual preference guide selection.

See the [current acceptance record](../recording-review/ACCEPTANCE.md) for executed checks and pending zoom, assistive-technology and participant evaluation. The React and Svelte references consume these tokens without sharing application state. CSS/preview code uses [MIT](../../LICENSE-CODE); this documentation uses CC BY 4.0.

October 30, 2026 comment audit: all 24 palette checks and the existing Chromium palette-preview case passed, including retained table/missing-data labels and narrow reflow. Removing comments from the before/after sources confirmed unchanged preview markup, styles and script. This pass adds no screen-reader, participant or browser-zoom evidence.
