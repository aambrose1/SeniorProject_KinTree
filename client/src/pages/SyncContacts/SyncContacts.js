import { React, useState } from 'react';
import * as styles from './styles';

function SyncContacts() {
    const [contacts, setContacts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSyncContacts = () => {
        setLoading(true);

        fetch('http://localhost:5000/api/contacts/sync', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(async (response) => {
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
                console.log("Contacts synced:", data);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                setErrorMessage(errorData.message);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            setErrorMessage("Failed to sync contacts");
        })
        .finally(() => {
            setLoading(false);
        });
    };

    return (
        <div style={styles.Container}>
            <h2 style={styles.Header}>Sync Contacts</h2>

            {/* Sync Button */}
            <button 
                onClick={handleSyncContacts} 
                style={styles.ButtonStyle}
            >
                {loading ? "Syncing..." : "Sync Contacts"}
            </button>

            {/* Error Message */}
            {errorMessage && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                    {errorMessage}
                </p>
            )}

            {/* Contacts List */}
            <ul style={{ marginTop: '20px' }}>
                {contacts.map((contact, index) => (
                    <li key={index}>
                        {contact.name} - {contact.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SyncContacts;