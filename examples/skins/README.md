# Dashboard skins

Open `preview.html` directly, or serve this directory with `python -m http.server 4175 --bind 127.0.0.1`. The preview has all 22 original skin names, optional text styles, shared active-context panels, labeled bar/line charts, data tables and scale swatches. It starts with Guillermo as an example, not a recommended universal default. Selection is session-only and does not persist.

## Use

Load `skins.css`, then apply `data-skin="guillermo"` and class `ui-skin` to an app root. `palette-data.json` supplies chooser names and light/dark metadata. Tokens also work in scoped previews. Set `data-type="expressive"`, `serif` or `mono` on that root to opt into alternative typography; omit it for system text. Display font names use local fallbacks; no fonts are bundled or downloaded.

```html
<section data-skin="guillermo" class="ui-skin">
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

## Verification and limits

Run `python check_palettes.py`. It checks text at 4.5:1 against page/panel/active surfaces, controls and focus at 3:1, button text at 4.5:1, categorical marks at 3:1 against the plot surface, sequential luminance and preview coverage. Decorative separators and low-valued ramp fills are not claimed to meet 3:1; use the control-border token for essential boundaries.

Similar hues can remain in a skin, so color alone cannot distinguish series, status, focus or selection. Forced-colors mode retains outlines, labels and line dashes; tables remain available when scale colors collapse. Actual chart implementations still require testing for zoom, keyboard operation, assistive technology and user understanding. Light and dark are equally supported; enjoyment and individual preference guide selection.

See the [current acceptance record](../recording-review/ACCEPTANCE.md) for executed checks and pending zoom, assistive-technology and participant evaluation. The React and Svelte references consume these tokens without sharing application state. CSS/preview code uses [MIT](../../LICENSE-CODE); this documentation uses CC BY 4.0.
