# Dashboard skins

Canonical CSS and palette data live in the [framework package](../../packages/audhd-ui-framework/README.md). The local stylesheet imports that source. Add `data-audhd-ui` to the same root as `data-skin` and `data-type`; unmarked sibling regions remain unstyled. The local palette registry is a byte-checked compatibility copy. Package installation is optional for this preview.

Open `preview.html` directly, or serve the repository root with `python -m http.server 4175 --bind 127.0.0.1` and open `/examples/skins/preview.html`. The preview has all 24 registered skins, optional text styles, shared active-context panels, labeled bar/line charts, data tables and scale swatches. It starts with Guillermo. Selection is session-only and does not persist.

For new interfaces without an established design system, [reuse the full registry and canonical styles](../../GUIDE.md#adaptable-appearance), with Guillermo as the initial product default absent an explicit preference or established product default. Offer all registered skins with representative previews, independent text styles and a system-appearance choice (Paperwhite for light, Guillermo for dark unless established requirements specify otherwise). Direct asset reuse does not require framework installation. Document justified brand, platform or technical exceptions; layouts and branding remain adaptable. These defaults are not claims of universal AuDHD suitability, and a focused unrelated change does not authorize reskinning an existing application.

## Green Ledger pair

| Skin ID | Appearance |
| --- | --- |
| `green-ledger-light` | Warm paper surfaces, deep green ink and forest-green actions; sage selection and purple focus. |
| `green-ledger-dark` | Deep forest surfaces, cream text, lime actions and mint selection; lavender focus. |

The pair combines the green palettes explored in the ntfy dashboard experiments into the existing token contract. Both include six categorical chart colors, sequential and diverging scales, status colors and essential control boundaries. Optional Skin headings use Georgia with local serif fallbacks; system body text and independent text-style choices remain available. Select either ID through the registry or `data-skin`. Guillermo remains the initial product default; the system mapping remains Paperwhite/Guillermo.

Token checks cover these skins on the same terms as the rest of the collection. Their green selection and success colors still need explicit labels; color alone does not establish state or chart identity. No diagnosis-specific benefit is claimed.

## Use

Load `skins.css`, then apply `data-audhd-ui` and `data-skin="guillermo"` and class `ui-skin` to an app root. `palette-data.json` supplies chooser names and light/dark metadata. For a nested preview card, put both `data-audhd-ui` and its own `data-skin` on the card; `data-skin` alone inherits the surrounding palette instead of applying a separate one. Set `data-type="expressive"`, `serif` or `mono` on that root to opt into alternative typography; omit it for system text. Display font names use local fallbacks; no fonts are bundled or downloaded.

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

## Verification and limits

Run `python check_palettes.py`. It checks text at 4.5:1 against page/panel/active surfaces, controls and focus at 3:1, button text at 4.5:1, categorical marks at 3:1 against the plot surface, sequential luminance and preview coverage. Decorative separators and low-valued ramp fills are not claimed to meet 3:1; use the control-border token for essential boundaries.

Similar hues can remain in a skin, so color alone cannot distinguish series, status, focus or selection. Forced-colors mode retains outlines, labels and line dashes; tables remain available when scale colors collapse. Actual chart implementations still require testing for zoom, keyboard operation, assistive technology and user understanding. Light and dark are equally supported; enjoyment and individual preference guide selection.

See the [current acceptance record](../recording-review/ACCEPTANCE.md) for executed checks and pending zoom, assistive-technology and participant evaluation. The React and Svelte references consume these tokens without sharing application state. CSS/preview code uses [MIT](../../LICENSE-CODE); this documentation uses CC BY 4.0.
