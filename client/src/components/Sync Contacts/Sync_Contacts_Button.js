const handleSyncContacts = async () => {
  try {
    // 1. Ask for permission
    const allow = window.confirm("Allow access to contacts?");
    if (!allow) {
      alert("Permission denied. No contacts synced.");
      return;
    }

    // 2. Mock contacts (since browser can't access real ones)
    const syncedContacts = [
      {
        firstName: "John",
        lastName: "Doe",
        relationship: "sibling",
        location: "New York",
        birthday: "1995-05-10"
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        relationship: "cousin",
        location: "California",
        birthday: "1998-08-22"
      }
    ];

    console.log("Synced Contacts:", syncedContacts);

    // 3. OPTIONAL: send to backend
    try {
      await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(syncedContacts)
      });
    } catch (err) {
      console.warn("Backend not connected, continuing...");
    }

    // 4. Auto-fill the first contact into your manual form
    const firstContact = syncedContacts[0];

    if (firstContact) {
      // fill your react-hook-form fields
      document.querySelector('input[name="firstName"]').value = firstContact.firstName;
      document.querySelector('input[name="lastName"]').value = firstContact.lastName;

      const relationshipSelect = document.querySelector('select[name="relationship"]');
      if (relationshipSelect) relationshipSelect.value = firstContact.relationship;

      const locationInput = document.querySelector('input[name="location"]');
      if (locationInput) locationInput.value = firstContact.location;

      const birthdayInput = document.querySelector('input[name="birthday"]');
      if (birthdayInput) birthdayInput.value = firstContact.birthday;
    }

    // 5. Feedback to user
    alert("Contacts synced and form auto-filled!");

  } catch (error) {
    console.error("Error syncing contacts:", error);
    alert("Something went wrong while syncing contacts.");
  }
};