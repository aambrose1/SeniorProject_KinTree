import { expect } from '@playwright/test';

export class LoginPage {
	constructor(page) {
		this.page = page;

		this.heading = page.getByRole('heading', { name: /welcome back to kintree/i });
		this.subtitle = page.getByText(/enter your email and password to continue/i);

		this.emailInput = page.getByPlaceholder('Enter your email address');
		this.passwordInput = page.getByPlaceholder('Enter your password');
		this.signInButton = page.getByRole('button', { name: /^sign in$/i });

		this.rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });
		this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
		this.registerLink = page.getByRole('link', { name: /register/i });
		this.googleButton = page.getByRole('button', { name: /google/i });

		this.inlineError = page.locator('p').filter({ hasText: /invalid|error|failed|required/i }).first();

		this.mfaPrompt = page.getByText(/enter the 6-digit code from your authenticator app/i);
		this.mfaCodeInput = page.getByPlaceholder('123456');
		this.verifyButton = page.getByRole('button', { name: /^verify$/i });
	}

	async goto() {
		await this.page.goto('/login');
	}

	async expectLoaded() {
		await expect(this.heading).toBeVisible();
		await expect(this.emailInput).toBeVisible();
		await expect(this.passwordInput).toBeVisible();
		await expect(this.signInButton).toBeVisible();
	}

	async fillEmail(email) {
		await this.emailInput.fill(email);
	}

	async fillPassword(password) {
		await this.passwordInput.fill(password);
	}

	async fillCredentials({ email, password }) {
		if (email !== undefined) {
			await this.fillEmail(email);
		}
		if (password !== undefined) {
			await this.fillPassword(password);
		}
	}

	async submit() {
		await this.signInButton.click();
	}

	async login({ email, password }) {
		await this.fillCredentials({ email, password });
		await this.submit();
	}

	async setRememberMe(checked) {
		const isChecked = await this.rememberMeCheckbox.isChecked();
		if (isChecked !== checked) {
			await this.rememberMeCheckbox.click();
		}
	}

	async clickForgotPassword() {
		await this.forgotPasswordLink.click();
	}

	async clickRegister() {
		await this.registerLink.click();
	}

	async signInWithGoogle() {
		await this.googleButton.click();
	}

	async expectMfaStepVisible() {
		await expect(this.mfaPrompt).toBeVisible();
		await expect(this.mfaCodeInput).toBeVisible();
		await expect(this.verifyButton).toBeVisible();
	}

	async submitMfaCode(code) {
		await this.mfaCodeInput.fill(code);
		await this.verifyButton.click();
	}

	async expectErrorVisible() {
		await expect(this.inlineError).toBeVisible();
	}
}
