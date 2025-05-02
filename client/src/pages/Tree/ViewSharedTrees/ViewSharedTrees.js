import React, { useState, useEffect } from 'react';
import * as styles from './styles';
import { Link } from 'react-router-dom';

const defaultAvatar = require('../../../assets/default-avatar.png');

function ViewSharedTrees() {
    const [trees, setTrees] = useState([]);

    // simulate API call for shared trees
    const fetchResults = async () => {
        return [
            { "id": "1", "data": {"first name": "John", "last name": "Doe", "avatar": "https://i.imgur.com/mfojszj.png"}, email: "john@gmail.com" },
            { "id": "2", "data": {"first name": "Jane", "last name": "Smith"}},
            { "id": "3", "data": {"first name": "Alice", "last name": "Johnson"}}
        ];
    };

    useEffect(() => {
        // Fetch results and update state
        const fetchData = async () => {
            const results = await fetchResults();
            setTrees(results);
        };
        fetchData();
    }, []); // no dependencies

    return (
        <div style={styles.DefaultStyle}>
            <div style={styles.ContainerStyle}>
                {/* title */}
                <h1 style={{ margin: '0px' }}>Shared Trees</h1>
                <hr style={{ width: '50%', border: '1px solid #000', margin: '1px 0' }} />

                {/* dynamic list of results */}
                <ul style={styles.ListStyle}>
                    {trees.map(tree => (
                        <li key={tree.id} style={styles.ItemStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {/* avatar */}
                                    <img
                                        src={tree.data?.avatar || defaultAvatar}
                                        alt="Avatar"
                                        style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                                    />
                                    {/* name */}
                                    <span>{`${tree["data"]["first name"]} ${tree["data"]["last name"]}`}</span>
                                </div>
                                <Link to={`/sharedtree/${tree.id}`} style={{ color: '#000' }}>
                                    View Tree
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default ViewSharedTrees;