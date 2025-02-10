import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'ja-JP',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium', locale: 'ja-JP' },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], browserName: 'firefox', locale: 'ja-JP' },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], browserName: 'webkit', locale: 'ja-JP' },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], browserName: 'chromium', locale: 'ja-JP' },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'], browserName: 'webkit', locale: 'ja-JP' },
    },
  ],
}); 