# Record administration and verification

A runnable fictional example of selecting a person, inspecting permissions, saving a contextual edit, verifying its outcome and returning to the filtered collection. It uses canonical skins and native controls without a framework or build step. All records, saves and permission checks are simulated in memory; reload resets them. It does not administer accounts, persist data or contact a permission service.

From the repository root, serve the example with the existing development dependencies:

```sh
npx --no-install vite --host 127.0.0.1 --port 4187 --strictPort
```

Open `/examples/administration/`. Run its isolated browser checks with:

```sh
node examples/administration/check.mjs
```

## Try the task

1. Search for Mira, open her record and inspect the saved Reader role. Change the draft to Editor. Visit Workspace settings and return through browser Back: the selected record and draft remain.
2. Clear the reason and save. Leave and return: the unresolved error remains attached to the person. Follow its link to focus the affected field without losing the role draft. Correct the reason: the error clears. Save; the result names a new saved version with verification pending.
3. Open **Try a verification failure**, enable it and verify. The saved change remains, and the failure setting stays with this person across navigation. Draft a different role, turn off the failure control and verify again. The check reports the saved role's allowed and denied operations; it does not save the newer draft or increment the save count.
4. Return to People. Focus returns to the person's link, and the search and unsaved indicator remain. Change appearance: all registered skins, system appearance and independent text styles are available without replacing the task view.
5. Visit Workspace settings. Common work comes first. The email dependency example is explicitly illustrative; it does not imply an implemented connector. Advanced detail distinguishes pending verification and missing implementation from genuine environment restrictions.
6. Make drafts for two people. Reset one person's draft to saved values: only that person's draft and validation error clear, focus returns to Role, and no save occurs. The other draft remains. The overview counts only verified current saved versions; a new save makes that record pending again.

## What to adapt

The [capability-state guidance](../../references/interface-patterns.md#capability-states-and-next-actions) describes useful distinctions, not a required status schema. A real product should name its actual dependencies and permitted next actions. Missing credentials need not prevent configuration; an implemented read-only verification should check the saved operation's identity or version, and stop with a useful result when it cannot establish the outcome.

Keep the existing product's persistence and authorization contracts. This example's memory-only save and synchronous permission check are deliberately simulated. It does not establish production durability, asynchronous concurrency handling, a real authorization boundary or delivery. Use the [configuration contract](../../packages/audhd-ui-framework/CONFIGURATION.md) for source coverage and task-specific runtime verification, and the [recording-review example](../recording-review/README.md) for pending asynchronous work.

## Verification scope

The browser check exercises field-linked recovery across navigation, version-aware verification status, retry without another mutation, per-record draft reset, filtered return with focus, Back/Forward, all registry skins, independent text style, narrow navigation and forced colors. Screenshots are written under ignored `output/playwright/administration/`. These checks establish the observed example behavior, not screen-reader usability, participant comprehension or production integration. No model evaluation is involved.

Executed in Chromium on October 26, 2026: the checks passed, including 390px navigation and record controls at 200% root text size. This text-size check is distinct from browser zoom and assistive-technology testing, which remain pending.

Code uses [MIT](../../LICENSE-CODE); documentation uses [CC BY 4.0](../../LICENSE).
