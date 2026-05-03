import { expect, locator } from '@playwright/test';

export class CreateAccountPage {
	constructor(page) {
		this.page = page;

		this.title = page.getByRole('heading', { name: /create account/i });
		this.form = page.locator('form');
		this.errorMessage = page.getByText(/registration failed|error/i).first();

		this.firstNameInput = page.locator('#firstname');
		this.lastNameInput = page.locator('#lastname');
		this.birthdateInput = page.locator('#birthdate');
		this.genderSelect = page.locator('#gender');
		this.emailInput = page.locator('#email');
		this.addressInput = page.locator('#address');
		this.cityInput = page.locator('#city');
		this.stateInput = page.locator('#state');
		this.countryInput = page.locator('#country');
		this.zipcodeInput = page.locator('#zipcode');
		this.phoneInput = page.locator('#phonenum');
		this.passwordInput = page.locator('#password');

		this.createAccountButton = page.getByRole('button', { name: /create account/i });
		this.loginLink = page.getByRole('link', { name: /login here/i });
	}

	async goto() {
		await this.page.goto('/register');
	}

	async expectLoaded() {
		await expect(this.title).toBeVisible();
		await expect(this.form).toBeVisible();
		await expect(this.firstNameInput).toBeVisible();
		await expect(this.createAccountButton).toBeVisible();
	}

	async fillRequiredFields({
		firstname,
		lastname,
		birthdate,
		gender,
		email,
		country,
		password,
	}) {
		await this.firstNameInput.fill(firstname);
		await this.lastNameInput.fill(lastname);
		await this.birthdateInput.fill(birthdate);
		await this.genderSelect.selectOption(gender);
		await this.emailInput.fill(email);
		await this.countryInput.fill(country);
		await this.passwordInput.fill(password);
	}

	async fillOptionalFields({
		address,
		city,
		state,
		zipcode,
		phonenum,
	} = {}) {
		if (address !== undefined) {
			await this.addressInput.fill(address);
		}
		if (city !== undefined) {
			await this.cityInput.fill(city);
		}
		if (state !== undefined) {
			await this.stateInput.fill(state);
		}
		if (zipcode !== undefined) {
			await this.zipcodeInput.fill(zipcode);
		}
		if (phonenum !== undefined) {
			await this.phoneInput.fill(phonenum);
		}
	}

	async fillForm(data) {
		await this.fillRequiredFields(data);
		await this.fillOptionalFields(data);
	}

	async submit() {
		await this.createAccountButton.click();
	}
}
