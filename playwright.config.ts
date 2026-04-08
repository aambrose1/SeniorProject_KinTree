import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the code
  forbidOnly: !!process.env.CI,
  // Retry failing tests twice on CI to handle random network flakes
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000', 
    trace: 'on-first-retry',
  },

  projects: [
    // setup project for auth state
    { 
      name: 'setup', 
      testMatch: /.*\.setup\.ts/ 
    },
    // chromium project to run tests after setup
    {   
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'], 
    },
  ],
});