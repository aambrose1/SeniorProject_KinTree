const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reproduce() {
    console.log('=== KINTREE ERROR REPRODUCTION ===\n');

    console.log('--- STEP 1: Creating Test User via Supabase ---');
    const email = 'proof_test_' + Date.now() + '@gmail.com';
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { first_name: 'Proof', last_name: 'Test' }
    });

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    const authUid = authData.user.id;
    console.log('User created with Auth UID:', authUid);

    console.log('\n--- STEP 2: Syncing to Backend (Simulating CreateAccount.js) ---');
    const syncRes = await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_uid: authUid, email: email, username: 'auto' + Date.now(), firstName: 'Proof', lastName: 'Test' })
    });

    const provError = syncRes.headers.get('X-Provision-Error');
    if (provError) {
        console.error('PROVISION FAILED DETAILS (Header):', provError);
    }

    const syncData = await syncRes.json();
    console.log('Sync Response Status:', syncRes.status);
    if (!syncRes.ok) {
        console.error('SYNC FAILED DETAILS:');
        console.error(syncData);
    }

    const dbUserId = syncData.id;
    console.log('Database User ID:', dbUserId);

    console.log('\n--- STEP 3: Reproducing Tree Page Error (Object not found) ---');
    console.log('Frontend calls: GET /api/tree-info/' + authUid);
    const treeRes = await fetch('http://localhost:5000/api/tree-info/' + authUid);
    if (!treeRes.ok) {
        console.error('ERROR (Tree Page): Received HTTP ' + treeRes.status);
        console.error('Response Body:', await treeRes.text());
    } else {
        console.log('Success:', await treeRes.json());
    }

    console.log('\n--- STEP 4: Reproducing Family Member Error (Missing Active Member) ---');
    console.log('Frontend calls: GET /api/family-members/active/' + authUid);
    const memberRes = await fetch('http://localhost:5000/api/family-members/active/' + authUid);
    if (!memberRes.ok) {
        console.error('ERROR (Add Member): Received HTTP ' + memberRes.status);
        console.error('Response Body:', await memberRes.text());
    } else {
        console.log('Success:', await memberRes.json());
    }

    // Cleanup
    await supabase.auth.admin.deleteUser(authUid);
    console.log('\n=== Test complete and test user cleaned up. ===');
}

reproduce().catch(console.error);
