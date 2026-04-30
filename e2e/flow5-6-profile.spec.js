import { test, expect } from '@playwright/test';

const appUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000';
const authFile = 'playwright/.auth/user.json';

test.use({ storageState: authFile });

async function getSupabaseAuthUid(page) {
  return page.evaluate(() => {
    const authKey = Object.keys(localStorage).find((key) => key.includes('auth-token'));
    if (!authKey) return null;

    try {
      const rawValue = localStorage.getItem(authKey);
      if (!rawValue) return null;

      const parsed = JSON.parse(rawValue);
      return parsed?.currentSession?.user?.id || parsed?.session?.user?.id || parsed?.user?.id || null;
    } catch {
      return null;
    }
  });
}

test('Flow #5: view own profile data', async ({ page }) => {
  await page.goto('/account');

  await expect(page.getByRole('heading', { name: /my profile/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /personal information/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^address$/i })).toBeVisible();
  await expect(page.getByText(/E2E Setup/i)).toBeVisible();
  await expect(page.getByText(/Starkville, MS, USA/i)).toBeVisible();
  await expect(page.getByText(/6625550101/i)).toBeVisible();
});

test('Flow #6: edit own profile and persist changes', async ({ page }) => {
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: /my profile/i })).toBeVisible();

  const authUid = await getSupabaseAuthUid(page);
  expect(authUid).toBeTruthy();

  const updateResponse = await page.request.put(`${apiUrl}/api/auth/profile`, {
    data: {
      auth_uid: authUid,
      bio: 'Updated bio for flow 6',
    },
  });

  expect(updateResponse.ok()).toBeTruthy();

  await page.goto('/account');
  await expect(page.getByText(/Updated bio for flow 6/i)).toBeVisible();
});