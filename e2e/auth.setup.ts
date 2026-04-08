import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. Navigate to the frontend login page
  await page.goto('http://localhost:3000/login');

  // 2. Login
  await page.getByRole('textbox', { name: 'Enter your email address' }).fill('e2e-test@msstate.edu');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('test123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // 3. Wait for the redirect to confirm the login was successful
  await page.waitForURL('http://localhost:3000/tree');
  await expect(page.getByTestId('family-chart')).toBeVisible();

  // 4. Save the cookies and local storage state to the file
  await page.context().storageState({ path: authFile });
});