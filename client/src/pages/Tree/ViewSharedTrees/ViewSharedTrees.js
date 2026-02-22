import React, { useState, useEffect } from 'react';
import * as styles from './styles';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';

// const defaultAvatar = require('../../../assets/default-avatar.png');

function ViewSharedTrees() {
    const [trees, setTrees] = useState([]);
    const [userData, setUserData] = useState([]);
    const { currentAccountID } = useCurrentUser();

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    };

    useEffect(() => {
        async function fetchTrees() {
            const response = await fetch(`http://localhost:5000/api/share-trees/receiver/${currentAccountID}`)
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
            const results = await fetchTrees();
            setTrees(results);
            const userData = await fetchUserData();
            setUserData(userData);
        };
        fetchData();
    }, [currentAccountID]);

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
                        <li key={tree.sharedtreeid} style={styles.ItemStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    {/* name and timestamp */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                                            {userData.find(user => user.id === tree.senderid)?.firstname}{' '}
                                            {userData.find(user => user.id === tree.senderid)?.lastname}
                                        </span>
                                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                                            {getTimeAgo(tree.sharedate)}
                                        </span>
                                    </div>
                                    
                                    {/* comment */}
                                    {tree?.comment && (
                                        <div style={{ color: '#333', lineHeight: '1.5' }}>
                                            "{tree?.comment}"
                                        </div>
                                    )}
                                </div>
                                {/* TO DO: Make this tree page work */}
                                <Link to={`/sharedtree/${tree.sharedtreeid}`} style={{ color: '#000', marginLeft: '15px', whiteSpace: 'nowrap' }}>
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