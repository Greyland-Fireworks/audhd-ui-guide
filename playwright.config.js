import { defineConfig } from '@playwright/test';

const servers = [['react', 4183], ['svelte', 4184]];
export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  workers: 2,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { viewport: { width: 1440, height: 1080 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: servers.flatMap(([framework, port]) => ['chromium', 'firefox', 'webkit'].map(browserName => ({
    name: `${framework}-${browserName}`,
    testMatch: browserName === 'chromium' ? /.*\.spec\.js/ : /smoke\.spec\.js/,
    use: {
      browserName, baseURL: `http://127.0.0.1:${port}`,
      // Keep Firefox's last-tab window lifecycle out of context disposal.
      // On Windows it can race session restoration after a download, despite
      // successful application assertions. Contexts remain isolated per test.
      ...(browserName === 'firefox' ? { launchOptions: { firefoxUserPrefs: { 'browser.tabs.closeWindowWithLastTab': false } } } : {}),
    },
  }))),
  // Never reuse the user's 4173/4174 demos, even in local runs.
  webServer: [...servers.map(([framework, port]) => ({
    command: `npm run preview --workspace recording-review-${framework}-reference -- --port ${port}`,
    url: `http://127.0.0.1:${port}`, reuseExistingServer: false,
  })), { command: 'npx vite examples/skins --host 127.0.0.1 --port 4185 --strictPort', url: 'http://127.0.0.1:4185/preview.html', reuseExistingServer: false }],
});
