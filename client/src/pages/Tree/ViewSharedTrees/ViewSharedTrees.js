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
                <h1 style={{ margin: '0px' }}>Shared Trees</h1>
                <hr style={{ width: '50%', border: '1px solid #000', margin: '1px 0' }} />

                {/* dynamic list of results */}
                <ul style={styles.ListStyle}>
                    {trees?.map(tree => (
                        <li key={tree.sharedTreeID} style={styles.ItemStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {/* name */}
                                    <span>{userData.find(user => user.id === tree.senderID)?.username}</span>
                                </div>
                                <Link to={`/sharedtree/${tree.sharedTreeID}`} style={{ color: '#000' }}>
                                    View Tree
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            </div>
        </div>
    )
}

export default ViewSharedTrees;