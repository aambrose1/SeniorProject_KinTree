import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/Login';

const validEmail = process.env.E2E_LOGIN_EMAIL || 'e2e-test@msstate.edu';
const validPassword = process.env.E2E_LOGIN_PASSWORD || 'test123!';

// Flow #2 should verify unauthenticated and post-login behavior.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Flow #2: Login with Email and Password', () => {
	const protectedRoute = '/family';

  test('signs in with valid credentials and redirects to home', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();

    await loginPage.login({ email: validEmail, password: validPassword });

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/Family Events/i)).toBeVisible();
  });

  test('remember me restores saved email on next login load', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();

    await loginPage.fillCredentials({ email: validEmail, password: validPassword });
    await loginPage.setRememberMe(true);
    await loginPage.submit();

    await expect(page).toHaveURL(/\/$/);

    // Navigate back to login in the same browser context to verify persistence.
    await page.goto('/login');
    await loginPage.expectLoaded();

    await expect(loginPage.emailInput).toHaveValue(validEmail);
  });

  test('shows an error for invalid credentials and remains on login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();

    await loginPage.login({
      email: `invalid-${Date.now()}@example.com`,
      password: 'WrongPassword1!',
    });

    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectErrorVisible();
  });

  test('redirects protected routes to login when unauthenticated', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto(protectedRoute);

    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoaded();
  });
});
