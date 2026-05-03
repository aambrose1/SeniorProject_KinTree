import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getCurrentAccountId(browser, authFile, appUrl) {
  const context = await browser.newContext({ storageState: authFile, baseURL: appUrl });
  const page = await context.newPage();

  await page.goto('/account');
  await page.waitForURL(/\/account\/[^/]+$/);
  const accountId = page.url().split('/').filter(Boolean).pop();

  await context.close();

  if (!accountId) {
    throw new Error('Unable to resolve current account ID from authenticated storage state.');
  }

  return accountId;
}

export async function seedRegisteredUser(apiUrl, seed) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: seed.email,
    password: seed.password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  const response = await fetch(`${apiUrl}/api/auth/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_uid: data.user.id,
      email: seed.email,
      username: seed.email,
      firstName: seed.firstname,
      lastName: seed.lastname,
      gender: seed.gender,
      phoneNumber: seed.phonenum,
      birthDate: seed.birthdate,
      displayName: `${seed.firstname} ${seed.lastname}`,
      address: seed.address,
      city: seed.city,
      state: seed.state,
      country: seed.country,
      zipcode: seed.zipcode,
    }),
  });

  const syncData = await response.json();
  if (!response.ok) {
    throw new Error(syncData?.error || syncData?.details || 'Failed to seed registered user.');
  }

  return {
    authUid: data.user.id,
    dbUserId: syncData.id,
    email: seed.email,
    firstname: seed.firstname,
    lastname: seed.lastname,
  };
}

export async function seedManualFamilyMember(apiUrl, accountId, seed) {
  const response = await fetch(`${apiUrl}/api/family-members/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstname: seed.firstname,
      lastname: seed.lastname,
      birthdate: seed.birthdate,
      deathdate: seed.deathdate,
      location: seed.location,
      phonenumber: seed.phonenumber,
      userid: accountId,
      memberuserid: null,
      gender: seed.gender,
    }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.error || responseData?.details || 'Failed to seed manual family member.');
  }

  return responseData.member || responseData;
}

export async function deleteIfExists(url, options = {}) {
  try {
    await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (error) {
    console.warn('Cleanup request failed:', error.message);
  }
}