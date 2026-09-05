import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4317', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
  snapshotPathTemplate: '{testDir}/../fixtures/expected/{arg}{ext}',
  webServer: { command: 'pnpm dev --host 127.0.0.1 --port 4317 --strictPort', url: 'http://127.0.0.1:4317', reuseExistingServer: false },
});
