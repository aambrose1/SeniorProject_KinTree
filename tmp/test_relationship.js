const fetch = require('node-fetch');

async function testRelationshipFetch() {
    const viewerId = '639da69a-65b3-4f9e-a89c-35cd759c8b7c'; // Replace with a valid auth_uid from your DB
    const profileId = 'some-other-uuid'; // Replace with another valid auth_uid

    console.log(`Testing relationship fetch between ${viewerId} and ${profileId}...`);

    try {
        const response = await fetch(`http://localhost:5000/api/relationships/between/${viewerId}/${profileId}`);
        const data = await response.json();

        console.log('Response Status:', response.status);
        console.log('Relationship Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('SUCCESS: Backend endpoint responded correctly.');
        } else {
            console.error('FAILED: Backend endpoint returned an error.');
        }
    } catch (error) {
        console.error('ERROR during fetch:', error.message);
    }
}

// Note: This script requires the server to be running.
// testRelationshipFetch();
