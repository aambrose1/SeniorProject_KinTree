import React, { useState, useEffect } from 'react';
import * as styles from './styles';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';

// const defaultAvatar = require('../../../assets/default-avatar.png');

function ViewSharedTrees() {
    const [trees, setTrees] = useState([]);
    const [userData, setUserData] = useState([]);
    const { currentUserID, currentAccountID } = useCurrentUser();

    useEffect(() => {
        async function fetchResults() {
            const response = await fetch(`http://localhost:5000/api/share-trees/receiver/${currentUserID}`)
            if (response.ok) {
                let responseData = await response.json();
                console.log(responseData);
                return responseData;
            } 
            else {
                console.log('Error:', response);
            }
        }
    
        async function fetchUserData() {
            const response = await fetch(`http://localhost:5000/api/auth/users/`);
            if (response.ok) {
                const userData = await response.json();
                return userData;
            } 
            else {
                console.error(`Error fetching user data`);
                return null;
            }
        }

        const fetchData = async () => {
            const results = await fetchResults();
            setTrees(results);
            const userData = await fetchUserData();
            setUserData(userData);
        };
        fetchData();
    }, [currentUserID]);

    return (
        <div style={styles.DefaultStyle}>
            <div style={{width: '150px'}}></div>
            <div style={styles.RightSide}>
            <div style={styles.ContainerStyle}>
                {/* title */}
                <h1 style={{ margin: '0px', color: 'var(--text-color)' }}>Shared Trees</h1>
                <hr style={{ width: '50px', border: 'none', height: '2px', backgroundColor: 'var(--kt-green-primary)', margin: 'var(--space-2) 0 var(--space-6) 0' }} />

                {/* dynamic list of results */}
                <ul style={styles.ListStyle}>
                    {trees && trees.length > 0 ? (
                        trees.map(tree => (
                            <li key={tree.sharedTreeID} style={styles.ItemStyle} className="kt-card-interactive">
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                                            {userData.find(user => user.id === tree.senderID)?.username || 'Someone'}'s Tree
                                        </span>
                                    </div>
                                    <Link 
                                        to={`/sharedtree/${tree.sharedTreeID}`} 
                                        className="kt-button kt-button-primary"
                                        style={{ padding: '6px 16px', textDecoration: 'none', fontSize: '13px' }}
                                    >
                                        View Tree
                                    </Link>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: 'var(--space-8) var(--space-4)',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-4)'
                        }}>
                             <div style={{ fontSize: '40px', opacity: 0.5 }}>🌳</div>
                             <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>No shared trees yet.</p>
                             <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px', lineHeight: '1.5' }}>
                                Invite family members and start building your story together!
                             </p>
                        </div>
                    )}
                </ul>
            </div>
            </div>
        </div>
    )
}

export default ViewSharedTrees;