import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'npm run dev:server',
      url: 'http://127.0.0.1:8787/api/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev:client -- --host 127.0.0.1 --port 5173',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
})
