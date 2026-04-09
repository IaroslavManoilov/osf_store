import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npx nuxt dev --port 3000 --host 127.0.0.1',
        url: 'http://127.0.0.1:3000/catalog',
        reuseExistingServer: true,
        timeout: 180 * 1000
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
