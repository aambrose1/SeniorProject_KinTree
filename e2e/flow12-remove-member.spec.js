import { test, expect } from '@playwright/test';
import { getCurrentAccountId } from './helpers/flowSeeds';

const appUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000';
const authFile = 'playwright/.auth/user.json';

const uniqueSuffix = Date.now();
const removableMemberSeed = {
  firstname: 'FlowTwelve',
  lastname: `Remove${uniqueSuffix}`,
  birthdate: '1991-04-04',
  deathdate: '',
  location: 'Starkville',
  phonenumber: '6625550105',
  gender: 'F',
};

test.use({ storageState: authFile });

let currentAccountId;

async function getTreeObject(page, apiUrl, accountId) {
  const response = await page.request.get(`${apiUrl}/api/tree-info/${accountId}`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return Array.isArray(body.object) ? body.object : JSON.parse(body.object);
}

test.beforeAll(async ({ browser }) => {
  currentAccountId = await getCurrentAccountId(browser, authFile, appUrl);
});

test.afterAll(async () => {
  try {
    const response = await fetch(`${apiUrl}/api/family-members/user/${currentAccountId}`);
    if (!response.ok) return;
    const members = await response.json();
    const leftovers = (members || []).filter(
      (member) =>
        member?.firstname === removableMemberSeed.firstname &&
        member?.lastname === removableMemberSeed.lastname
    );

    for (const member of leftovers) {
      await fetch(`${apiUrl}/api/family-members/${member.id}`, { method: 'DELETE' });
    }
  } catch {
    // Best-effort cleanup only.
  }
});

test('Flow #12: remove family member and verify treeinfo updates on tree page', async ({ page }) => {
  await page.goto('/tree');

  await page.locator('.tree-plus-button').click();
  await expect(page.getByRole('heading', { name: /add family member/i })).toBeVisible();
  await page.getByRole('button', { name: /can't find your family member\?/i }).click();

  const manualForm = page.locator('form').filter({ has: page.getByRole('heading', { name: /manually add family member/i }) });
  await manualForm.getByLabel(/first name/i).fill(removableMemberSeed.firstname);
  await manualForm.getByLabel(/last name/i).fill(removableMemberSeed.lastname);
  await manualForm.getByLabel(/gender/i).selectOption('F');
  await manualForm.getByLabel(/relationship/i).selectOption('sibling');
  await manualForm.evaluate((form) => form.requestSubmit());

  await expect(page.getByRole('heading', { name: /member added!/i })).toBeVisible();
  await page.getByRole('button', { name: /return to tree/i }).click();
  await expect(page).toHaveURL(/\/tree$/);

  const memberNamePattern = new RegExp(`${removableMemberSeed.firstname}\\s*${removableMemberSeed.lastname}`, 'i');

  await expect(page.locator('#FamilyChart')).toContainText(memberNamePattern);

  const treeBefore = await getTreeObject(page, apiUrl, currentAccountId);
  const existedBefore = treeBefore.some((node) =>
    node?.data?.['first name'] === removableMemberSeed.firstname &&
    node?.data?.['last name'] === removableMemberSeed.lastname
  );
  expect(existedBefore).toBeTruthy();

  const targetCard = page.locator('#FamilyChart .card').filter({ hasText: memberNamePattern }).first();
  await targetCard.evaluate((card) => {
    const deleteButton = card.querySelector('.card-delete');
    if (!deleteButton) {
      throw new Error('Delete button not found on target card.');
    }
    deleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await expect(page.getByText(/remove family member\?/i)).toBeVisible();
  await page.getByRole('button', { name: /delete member/i }).click();

  await expect(page.getByText(new RegExp(`Successfully removed ${removableMemberSeed.firstname} ${removableMemberSeed.lastname}`, 'i'))).toBeVisible();
  await expect(page.locator('#FamilyChart')).not.toContainText(memberNamePattern);

  const treeAfter = await getTreeObject(page, apiUrl, currentAccountId);
  const existsAfter = treeAfter.some((node) =>
    node?.data?.['first name'] === removableMemberSeed.firstname &&
    node?.data?.['last name'] === removableMemberSeed.lastname
  );
  expect(existsAfter).toBeFalsy();
});