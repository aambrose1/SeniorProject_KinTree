import { test, expect } from '@playwright/test';
import { deleteIfExists, getCurrentAccountId, seedRegisteredUser } from './helpers/flowSeeds';

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
const registeredUserSeed = {
  email: `flow10-user-${uniqueSuffix}@example.com`,
  password: 'ExistingPass1!',
  firstname: 'FlowTen',
  lastname: `User${uniqueSuffix}`,
  birthdate: '1992-02-02',
  gender: 'F',
  address: '10 Test Lane',
  city: 'Starkville',
  state: 'MS',
  country: 'USA',
  zipcode: '39759',
  phonenum: '6625550102',
};

test.use({ storageState: authFile });

let currentAccountId;
let seededRegisteredUser;

test.beforeAll(async ({ browser }) => {
  currentAccountId = await getCurrentAccountId(browser, authFile, appUrl);
  seededRegisteredUser = await seedRegisteredUser(apiUrl, registeredUserSeed);
});

test.afterAll(async () => {
  if (seededRegisteredUser?.dbUserId) {
    await deleteIfExists(`${apiUrl}/api/auth/remove/${seededRegisteredUser.dbUserId}`);
  }
});

test('Flow #10: add an existing registered user as a family member', async ({ page }) => {
  await page.goto('/tree');

  await page.locator('.tree-plus-button').click();
  await expect(page.getByRole('heading', { name: /add family member/i })).toBeVisible();

  const existingForm = page.locator('form').filter({ has: page.getByRole('heading', { name: /add family member/i }) });

  await existingForm.getByPlaceholder('Search for a family member...').fill(seededRegisteredUser.email);
  await expect(page.getByText(seededRegisteredUser.email)).toBeVisible();

  await existingForm.locator(`input[type="radio"][value="${seededRegisteredUser.dbUserId}"]`).check();
  await existingForm.getByLabel(/relationship/i).selectOption('sibling');
  await existingForm.evaluate((form) => form.requestSubmit());

  await expect(page.getByRole('heading', { name: /member added!/i })).toBeVisible();
  await page.getByRole('button', { name: /return to tree/i }).click();
  await expect(page).toHaveURL(/\/tree$/);
  await expect(page.locator('#FamilyChart')).toContainText(
    new RegExp(`${seededRegisteredUser.firstname}\\s*${seededRegisteredUser.lastname}`, 'i')
  );

  const treeObject = await getTreeObject(page, apiUrl, currentAccountId);
  const inTreeObject = treeObject.some((node) => {
    const first = node?.data?.['first name'] || node?.data?.firstname || '';
    const last = node?.data?.['last name'] || node?.data?.lastname || '';
    const fullName = node?.data?.name || `${first} ${last}`.trim();

    return (
      (first === seededRegisteredUser.firstname && last === seededRegisteredUser.lastname) ||
      fullName.toLowerCase().includes(`${seededRegisteredUser.firstname} ${seededRegisteredUser.lastname}`.toLowerCase())
    );
  });
  expect(inTreeObject).toBeTruthy();


  await page.goto('/family');
  await page.getByPlaceholder('Search for family members...').fill(seededRegisteredUser.lastname);

  await expect(page.getByText(`${seededRegisteredUser.firstname} ${seededRegisteredUser.lastname}`)).toBeVisible();
});