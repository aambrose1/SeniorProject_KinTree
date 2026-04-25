import { test as setup, expect } from '@playwright/test';
import { CreateAccountPage } from './pages/CreateAccount';
import { LoginPage } from './pages/Login';

const authFile = 'playwright/.auth/user.json';

const registrationEmail = process.env.E2E_SETUP_EMAIL || `e2e-setup-${Date.now()}@msstate.edu`;
const registrationPassword = process.env.E2E_SETUP_PASSWORD || 'StrongPass1!';

setup('authenticate', async ({ page }) => {
  const createAccountPage = new CreateAccountPage(page);
  const loginPage = new LoginPage(page);

  // 1. Register a fresh account through the UI so app-side profile/schema setup runs.
  await createAccountPage.goto();
  await createAccountPage.expectLoaded();
  await createAccountPage.fillForm({
    firstname: 'E2E',
    lastname: 'Setup',
    birthdate: '1999-01-01',
    gender: 'F',
    email: registrationEmail,
    country: 'USA',
    password: registrationPassword,
    address: '123 Test Lane',
    city: 'Starkville',
    state: 'MS',
    zipcode: '39759',
    phonenum: '6625550101',
  });
  await createAccountPage.submit();
  await expect(page).toHaveURL(/\/login$/);

  // 2. Login with the newly registered account.
  await loginPage.expectLoaded();
  await loginPage.login({
    email: registrationEmail,
    password: registrationPassword,
  });

  // 3. Wait for successful login redirect.
  await page.waitForURL(/\/$/);
  await expect(page.getByText(/Family Events/)).toBeVisible();

  // 4. Save the cookies and local storage state to the file
  await page.context().storageState({ path: authFile });
});