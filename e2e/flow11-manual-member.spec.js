import { test, expect } from '@playwright/test';
import { deleteIfExists, getCurrentAccountId, seedManualFamilyMember } from './helpers/flowSeeds';

const appUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000';
const authFile = 'playwright/.auth/user.json';

async function getTreeObject(page, apiUrl, accountId) {
  const response = await page.request.get(`${apiUrl}/api/tree-info/${accountId}`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return Array.isArray(body.object) ? body.object : JSON.parse(body.object);
}

const uniqueSuffix = Date.now();
const manualMemberSeed = {
  firstname: 'FlowEleven',
  lastname: `Manual${uniqueSuffix}`,
  birthdate: '1993-03-03',
  deathdate: '',
  location: 'Starkville',
  phonenumber: '6625550104',
  gender: 'M',
};

test.use({ storageState: authFile });

let seededManualMember;
let currentAccountId;

test.beforeAll(async ({ browser }) => {
  currentAccountId = await getCurrentAccountId(browser, authFile, appUrl);
  seededManualMember = await seedManualFamilyMember(apiUrl, currentAccountId, manualMemberSeed);
});

test.afterAll(async () => {
  if (seededManualMember?.id) {
    await deleteIfExists(`${apiUrl}/api/family-members/${seededManualMember.id}`);
  }
});

test('Flow #11: add a manual family member', async ({ page }) => {
  await page.goto('/tree');

  await page.locator('.tree-plus-button').click();
  await expect(page.getByRole('heading', { name: /add family member/i })).toBeVisible();
  await page.getByRole('button', { name: /can't find your family member\?/i }).click();

  const manualForm = page.locator('form').filter({ has: page.getByRole('heading', { name: /manually add family member/i }) });

  await manualForm.getByLabel(/first name/i).fill(manualMemberSeed.firstname);
  await manualForm.getByLabel(/last name/i).fill(manualMemberSeed.lastname);
  await manualForm.getByLabel(/gender/i).selectOption('M');
  await manualForm.getByLabel(/relationship/i).selectOption('spouse');
  await manualForm.evaluate((form) => form.requestSubmit());

  await expect(page.getByRole('heading', { name: /member added!/i })).toBeVisible();

  await page.getByRole('button', { name: /return to tree/i }).click();
  await expect(page).toHaveURL(/\/tree$/);
  await expect(page.locator('#FamilyChart')).toContainText(new RegExp(`${manualMemberSeed.firstname}\\s*${manualMemberSeed.lastname}`, 'i'));

  const treeObject = await getTreeObject(page, apiUrl, currentAccountId);
  const inTreeObject = treeObject.some((node) =>
    node?.data?.['first name'] === manualMemberSeed.firstname &&
    node?.data?.['last name'] === manualMemberSeed.lastname
  );
  expect(inTreeObject).toBeTruthy();

  await page.goto('/family');
  await page.getByPlaceholder('Search for family members...').fill(manualMemberSeed.lastname);

  await expect(page.getByText(new RegExp(`${manualMemberSeed.firstname} ${manualMemberSeed.lastname}`, 'i')).first()).toBeVisible();
});