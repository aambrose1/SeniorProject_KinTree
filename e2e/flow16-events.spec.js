import { test, expect } from '@playwright/test';

const appUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const authFile = 'playwright/.auth/user.json';

test.use({ storageState: authFile });

test('Flow 16: Event Dashboard CRUD', async ({ page }) => {
  await page.goto('/');

  // Ensure dashboard loaded
  await expect(page.getByText(/Family Events/i)).toBeVisible();

  // Create an event
  const title = `E2E Event ${Date.now()}`;
  const date = '2026-05-01';
  const description = 'Created by Playwright Flow 16 test';

  await page.getByRole('button', { name: /Create Event/i }).click();
  await expect(page.getByRole('heading', { name: /Create New Event/i })).toBeVisible();

  // Fill the form
  await page.getByLabel(/Title/i).fill(title);
  await page.getByLabel(/Date/i).fill(date);
  await page.getByRole('textbox', { name: 'Add a description...' }).fill(description);

  await page.getByRole('button', { name: /Post/i }).click();

  // New event should appear in list
  await expect(page.getByText(title)).toBeVisible();

  // Edit the event: find the card and click Edit
  const card = page.locator('h2', { hasText: title }).first().locator('..');
  await card.getByRole('button', { name: /Edit/i }).click();
  await expect(page.getByRole('heading', { name: /Edit Event/i })).toBeVisible();

  const updatedTitle = `${title} (updated)`;
  await page.getByLabel(/Title/i).fill(updatedTitle);
  await page.getByRole('button', { name: /Save Changes/i }).click();

  await expect(page.getByText(updatedTitle)).toBeVisible();

  // Delete the event
  // Accept the confirmation dialog that the app shows
  page.on('dialog', async dialog => { await dialog.accept(); });
  const updatedCard = page.locator('h2', { hasText: updatedTitle }).first().locator('..');
  await updatedCard.getByRole('button', { name: /Delete/i }).click();

  // Ensure it's removed from the list
  await expect(page.getByText(updatedTitle)).not.toBeVisible();
});
