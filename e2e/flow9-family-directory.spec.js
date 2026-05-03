import { test, expect } from '@playwright/test';
import { deleteIfExists, getCurrentAccountId, seedManualFamilyMember } from './helpers/flowSeeds';

const appUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000';
const authFile = 'playwright/.auth/user.json';

const uniqueSuffix = Date.now();
const manualMemberSeed = {
  firstname: 'FlowNine',
  lastname: `Member${uniqueSuffix}`,
  birthdate: '1993-03-03',
  deathdate: '',
  location: 'Starkville',
  phonenumber: '6625550103',
  gender: 'M',
};

test.use({ storageState: authFile });

let seededManualMember;

test.beforeAll(async ({ browser }) => {
  const currentAccountId = await getCurrentAccountId(browser, authFile, appUrl);
  seededManualMember = await seedManualFamilyMember(apiUrl, currentAccountId, manualMemberSeed);
});

test.afterAll(async () => {
  if (seededManualMember?.id) {
    await deleteIfExists(`${apiUrl}/api/family-members/${seededManualMember.id}`);
  }
});

test('Flow #9: view family directory and open member profile', async ({ page }) => {
  await page.goto('/family');

  await expect(page.getByRole('heading', { name: /member list/i })).toBeVisible();

  await page.getByPlaceholder('Search for family members...').fill(manualMemberSeed.lastname);
  await expect(page.getByText(`${manualMemberSeed.firstname} ${manualMemberSeed.lastname}`)).toBeVisible();

  await page.getByRole('link', { name: /view/i }).click();

  await expect(page).toHaveURL(new RegExp(`/account/${seededManualMember.id}$`));
  await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: `${manualMemberSeed.firstname} ${manualMemberSeed.lastname}` })).toBeVisible();
});