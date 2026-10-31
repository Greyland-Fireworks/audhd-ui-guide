# Skin studies: color and typography workbench

An exploratory selector for six proposed skin families, with ten variants each. [Twenty-one selected combinations](../skins/README.md#selected-workbench-skins) are now installed in the kit's skin registry. The workbench retains all 60 original studies and independent mixing controls.

Open [index.html](index.html) directly, or serve the repository root with an ordinary static HTTP server. All runtime assets are local; no build, account or network service is required.

## Choose and combine

1. Choose a collection: Murica, Canto, Szechuan, Souk, Hacienda or Golden Child.
2. Compare its ten starting looks. **Use complete look** selects that variant's palette and both typefaces.
3. Use **Colors**, **Title** or **Body** to take only that part. The selectors above the gallery offer the same choices. Mixing stays within the collection.
4. **View your combination** returns to the live preview. Golden Child also offers brushed, polished and flat finishes.
5. Review **Selections to bring back** at the bottom. **Copy selections** produces a brief with exact variant IDs, typeface weights and hexadecimal colors. **Select text** is the fallback when clipboard access is unavailable.

Choosing a part includes that collection automatically. Uncheck **Include this combination in my selections** to omit it. One combination per collection is retained in browser storage at the current address. Browser settings can block storage; the page reports that condition. File and HTTP addresses have separate storage, so copy the brief before moving between them.

## Design references

| Collection | Direction |
| --- | --- |
| Murica | Ten light palettes exploring red, white, blue, denim, paper and American print/sign traditions. |
| Canto | Contemporary Hong Kong and Cantonese urban references: transit, harbor glass, tea counters, tile and signage. |
| Szechuan | Historical Chinese material and print references, including ink, celadon, cinnabar, lacquer and bronze. The requested name is retained; Mandarin is a language, not a single historical design period. |
| Souk | Distinct starting points from North African and Middle Eastern courtyards, tile, textiles, brass and markets. |
| Hacienda | South American courtyard, landscape, textile and urban color references. |
| Golden Child | Gold and brass palettes with deliberately unusual display faces and optional static metallic edges. |

These are contemporary design interpretations, not historical reconstructions or claims that a region has one visual identity. Each collection's **Design references** disclosure explains its scope. All Murica variants are light; the other collections include a darker alternative where useful.

## Palette and font provenance

[data.js](data.js) owns the proposed colors and pairings. Each palette has eight explicit roles: page, surface, ink, action, accent, ornament, success and danger. Muted text, separators and selection surfaces are derived from those colors. Action text chooses the higher-contrast white or near-black foreground. The metallic finish uses the palette's existing colors; it does not animate or sit behind body text.

The workbench shell reuses the kit's [canonical skin CSS](../../packages/audhd-ui-framework/skins.css). Preview colors are proposals authored for this request. The selected combinations have a full semantic token mapping and contrast checks in the canonical registry; unselected studies remain exploratory. A production interface still requires its own control-state and layout review.

The local collection contains **60 distinct title families and 16 body families** (76 WOFF2 files, approximately 1.39 MB). [fonts-manifest.json](fonts-manifest.json) records each file's family, weight, upstream source, byte count, SHA-256 digest and license path. Fonts come from Google Fonts; their individual SIL Open Font License texts are preserved in `fonts/licenses/`.

Only Latin preview subsets are included. A Noto, Amiri or other multilingual family's Latin preview does not demonstrate its Chinese or Arabic glyph coverage. These English-language studies do not imitate those scripts. Choosing a font for multilingual production requires the relevant subsets, language-specific rendering and layout checks. Display families are for titles; readable body families remain separately selectable during this exploration.

[fetch-fonts.py](fetch-fonts.py) is the explicit maintenance download script. It is not run by the page. Upstream fonts can change; the manifest identifies the exact downloaded files used for this study.

## Implementation decisions

| Demonstration | Owner | Guide relationship |
| --- | --- | --- |
| Addressable collections and visible current collection | [index.html](index.html), [app.js](app.js) | [AUDHD-01](../../GUIDE.md#audhd-01-keep-scope-and-location-visible) |
| Equal sample geometry, palette containment and outlined swatches | [style.css](style.css) | [AUDHD-02](../../GUIDE.md#audhd-02-make-hierarchy-clear-without-repetitive-headings), [AUDHD-08](../../GUIDE.md#audhd-08-use-visuals-to-support-decisions) |
| Independent choices survive group navigation and reload | [app.js](app.js) | [AUDHD-10](../../GUIDE.md#audhd-10-support-interruptions-and-working-preferences) |
| Exact, copyable brief and clipboard fallback | [app.js](app.js) | [AUDHD-06](../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable) |
| Font-load status rejects stale promises | [app.js](app.js) | [AUDHD-07](../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status) |
| Native controls, visible focus and wrapping collection navigation | [index.html](index.html), [style.css](style.css) | [AUDHD-11](../../GUIDE.md#audhd-11-keep-controls-readable-and-operable) |

The previews are visual samples, not working note applications. Real selection buttons live outside each sample. No kit preferences, existing examples or ntfy checkouts are changed by selecting a proposal.

## Checks performed

- Checked all 60 palettes across seven displayed text/background pairs each: all 420 pairs meet 4.5:1, with a lowest ratio of 4.53:1. This covers the sample text treatments, not every production control state.
- Verified independent color/title/body selection, collection switching, reload retention, Golden Child finishes and the generated selection brief. The copy action reported success; selectable text remains available as a fallback.
- Inspected rendered collections and the single-column gallery at 390px width; checked for horizontal overflow and visible keyboard focus.
- Validated JavaScript syntax, local font hashes/licenses, Guide anchors and whitespace. These checks do not establish accessibility conformance or participant comprehension.
