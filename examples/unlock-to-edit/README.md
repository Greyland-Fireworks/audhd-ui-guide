# Unlock-to-edit demonstrator

A standalone implementation of the [Guide's pattern](../../GUIDE.md#unlock-to-edit-interaction-pattern). Two fictional delivery settings have independent editing locks and restoration points. Ordinary controls remain directly editable. There is no server or live delivery service.

Each card has a 44px lock toggle in its upper-right corner. Closed/open padlock shapes show editing availability; an action hint appears on hover or keyboard focus. Accessible names identify the action and field, and the current editing state remains available to assistive technology. The icon changes to locked only after successful save verification.

From the repository root, after installing the existing project dependencies:

```sh
npx --no-install vite --host 127.0.0.1 --port 4186 --strictPort
```

Open `http://127.0.0.1:4186/examples/unlock-to-edit/`. In another terminal, run the repeatable isolated browser check:

```sh
node examples/unlock-to-edit/check.mjs
```

The check uses the existing Playwright installation and a fresh browser context, not the user's demo storage. Install the matching Chromium runtime if needed; configure `PLAYWRIGHT_BROWSERS_PATH` when using an existing browser cache. No new runtime dependencies or build step are required for this example.

## Try the complete task

1. Inspect or select a locked value. Unlock Retry limit, change `3` to `5`, then leave the field to autosave.
2. Open Response timeout independently. Visit **How saving works**, change appearance, and return. Both fields retain their values and editing state.
3. Restore Retry limit: it returns to the before-unlock value `3`, even after autosaving `5`, and stays open.
4. Under **Try failure and replacement**, select a blocked write, then choose **Lock editing**. The draft remains, editing stays open and save verification fails. Retry re-locking to save and close only that field.
5. Reload: verified values return with both fields locked. A new unlock starts a new restoration point.

Edits save on the native `change` event, not every keystroke. Each save writes both settings to this origin's `audhd-unlock-example-v1` localStorage entry and compares immediate readback. A verification mismatch may follow a successful write; the interface reports uncertainty. Browser storage is not durable backup or cross-tab conflict handling. The explicit export provides a text snapshot, including invalid/incomplete edits, with a selectable manual fallback; it is not an importable preset. Appearance and text size are session-only.

Intentional default replacement includes locked fields, then re-locks both after verification. Failure preserves the page's draft and restoration points. All settings are always applicable in this small example; dependent/inactive settings, arbitrary imports, multiple baselines and asynchronous server persistence are outside its scope.

## Observed checks — October 21, 2026

Chromium 156.0.8078.4, Node 22.22.2, Windows. The runnable check passed selection and blocked typing while locked; keyboard unlock; independent fields; committed-edit persistence; navigation/appearance continuity; restoration after autosave; blocked writes and mismatched verification; retry; recovery download; reload/fresh restoration points; invalid input; failed/successful bulk replacement; and an injected Storage.setItem denial reaching the real error path. These are synthetic application checks, not intended-user research or an independent model trial.

Visible enabled text sampled in light/dark states met 4.5:1 against computed surfaces. The example reflowed at 320 CSS pixels with 200% application text size, and keyboard focus remained visible with forced-colors/reduced-motion emulation. Light, dark and narrow forced-color screenshots were inspected. Local evidence is generated under `output/playwright/unlock-to-edit/`, including observations, screenshots and a recovery download.

Initial verification found horizontal overflow at 320 pixels with enlarged text: the text-size selector's intrinsic width and long feedback words exceeded the available space. Shorter percentage labels, constrained toolbar width and wrapping corrected it; reduced fixed padding and shorter visible actions improved the inspected narrow layout. The failed capture remains in local output. Initial sandbox network denial was an environment failure before page load; successful checks used loopback access.

Actual browser zoom, operating-system high contrast, screen-reader announcements, clipboard permission, other browser engines, cross-tab conflicts and intended-user understanding remain untested. No conformance certification, durable-storage guarantee or universal usability claim follows from these checks.
