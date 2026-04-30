import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { LoginPage } from './pages/Login';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const appUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

const resetEmail = process.env.E2E_RESET_EMAIL || `flow4-reset-${Date.now()}@example.com`;
const initialPassword = process.env.E2E_RESET_INITIAL_PASSWORD || 'ResetPass1!';
const newPassword = process.env.E2E_RESET_NEW_PASSWORD || 'ResetPass2!';

test.use({ storageState: { cookies: [], origins: [] } });

async function deleteUserByEmail(email) {
  const { data } = await supabase.auth.admin.listUsers();
  const user = data?.users?.find((entry) => entry.email === email);
  if (user) {
    await supabase.auth.admin.deleteUser(user.id);
  }
}

async function createResetUser() {
  await deleteUserByEmail(resetEmail);

  const { data, error } = await supabase.auth.admin.createUser({
    email: resetEmail,
    password: initialPassword,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function buildRecoveryLink(email) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${appUrl}/update-password`,
    },
  });

  if (error) {
    throw error;
  }

  return data?.properties?.action_link || data?.action_link || data?.properties?.actionLink;
}

test.describe('Flow #4: Password Reset and Update Password', () => {
  let resetUser;

  test.beforeAll(async () => {
    resetUser = await createResetUser();
  });

  test.afterAll(async () => {
    if (resetUser?.id) {
      await supabase.auth.admin.deleteUser(resetUser.id);
    } else {
      await deleteUserByEmail(resetEmail);
    }
  });

  test('submits a reset request, follows the recovery link, and updates the password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    // authenticate user
    await loginPage.goto();
    await loginPage.login({ email: resetEmail, password: initialPassword });
    await expect(resetUser).toBeTruthy();

    await page.goto('/reset-password');
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();

    await page.getByPlaceholder('Enter your email address').fill(resetEmail);
    await expect(page.getByPlaceholder('Enter your email address')).toHaveValue(resetEmail);
    await page.getByRole('button', { name: /send reset email/i }).click();
    await expect(page.getByText(/check your email for a reset link/i)).toBeVisible();

    const recoveryLink = await buildRecoveryLink(resetEmail);
    if (!recoveryLink) {
      throw new Error('Supabase did not return a recovery link for Flow 4.');
    }

    await page.goto(recoveryLink);
    await expect(page).toHaveURL(/\/update-password/);
    await expect(page.getByRole('heading', { name: /update password/i })).toBeVisible();

    await page.getByPlaceholder('Enter new password').fill(newPassword);
    await page.getByRole('button', { name: /update password/i }).click();

    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoaded();
  });

  test('shows password validation errors on the update form', async ({ page }) => {
    await page.goto('/update-password');

    await expect(page.getByRole('heading', { name: /update password/i })).toBeVisible();
    await page.getByRole('button', { name: /update password/i }).click();

    await expect(page.getByText(/password is required/i)).toBeVisible();
  });
});