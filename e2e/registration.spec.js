import { test, expect } from '@playwright/test';
import { CreateAccountPage } from './pages/CreateAccount';
import { LoginPage } from './pages/Login';

const makeUniqueEmail = () => `kintree.e2e.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;

const buildRegistrationData = (email) => ({
	firstname: 'E2E',
	lastname: 'Tester',
	birthdate: '1999-01-01',
	gender: 'F',
	email,
	country: 'USA',
	password: 'StrongPass1!',
});

// Flow #1

test.describe('Flow #1: Register a New Account', () => {
	test('loads the create account form', async ({ page }) => {
		const createAccountPage = new CreateAccountPage(page);

		await createAccountPage.goto();
		await createAccountPage.expectLoaded();
		await expect(page).toHaveURL(/\/register$/);
	});

	test('navigates to login from the registration page', async ({ page }) => {
		const createAccountPage = new CreateAccountPage(page);
		const loginPage = new LoginPage(page);

		await createAccountPage.goto();
		await createAccountPage.expectLoaded();

		await createAccountPage.loginLink.click();

		await expect(page).toHaveURL(/\/login$/);
		await loginPage.expectLoaded();
	});

	test('shows required-field validation when submitting an empty form', async ({ page }) => {
		const createAccountPage = new CreateAccountPage(page);

		await createAccountPage.goto();
		await createAccountPage.submit();

		await expect(page.getByText('First name is a required field.')).toBeVisible();
		await expect(page.getByText('Last name is a required field.')).toBeVisible();
		await expect(page.getByText('Birthdate is a required field.')).toBeVisible();
		await expect(page.getByText('Gender field is required')).toBeVisible();
		await expect(page.getByText('Email is a required field.')).toBeVisible();
		await expect(page.getByText('Country of residence is a required field.')).toBeVisible();
		await expect(page.getByText('Password is required')).toBeVisible();
	});

	test('shows email and password format validation errors for invalid inputs', async ({ page }) => {
		const createAccountPage = new CreateAccountPage(page);

		await createAccountPage.goto();
		await createAccountPage.fillRequiredFields({
			firstname: 'Test',
			lastname: 'User',
			birthdate: '1999-01-01',
			gender: 'M',
			email: 'invalid-email',
			country: 'USA',
			password: 'weak',
		});

		await createAccountPage.submit();

		await expect(page.getByText('Invalid email format.')).toBeVisible();
		await expect(
			page.getByText('Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character')
		).toBeVisible();
	});

	test('registers successfully and redirects to login', async ({ page }) => {
		const createAccountPage = new CreateAccountPage(page);
		const loginPage = new LoginPage(page);
		const email = makeUniqueEmail();

		await createAccountPage.goto();
		await createAccountPage.fillRequiredFields(buildRegistrationData(email));
		await createAccountPage.submit();

        await page.waitForURL(/\/login$/);
		await expect(page).toHaveURL(/\/login$/);
		await loginPage.expectLoaded();
	});

	test('shows an error when trying to register a duplicate email', async ({ page }) => {
		const createAccountPage = new CreateAccountPage(page);
		const duplicateEmail = makeUniqueEmail();

		await createAccountPage.goto();
		await createAccountPage.fillRequiredFields(buildRegistrationData(duplicateEmail));
		await createAccountPage.submit();
        await page.waitForURL(/\/login$/);
		await expect(page).toHaveURL(/\/login$/);

		await createAccountPage.goto();
		await createAccountPage.fillRequiredFields(buildRegistrationData(duplicateEmail));
		await createAccountPage.submit();
        await page.waitForURL(/\/register$/);
		await expect(page).toHaveURL(/\/register$/);
		await expect(page.getByText(/registered|exists|in use|already/i).first()).toBeVisible();
	});
});
