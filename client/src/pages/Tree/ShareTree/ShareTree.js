import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as styles from './styles';
import { set, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';

function ShareTree() {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Use refs to store fetched data (fetch once, use many times)
    const allMembersRef = useRef([]);
    const userDataRef = useRef([]);
    const treeInfoRef = useRef([]);
    
    const { register, handleSubmit, setValue } = useForm();
    const { currentAccountID, currentUserName } = useCurrentUser();

    async function onSubmitForm (data){
        console.log('Form data:', data);
        console.log('Selected member:', data.selectedMember);
        console.log('treeInfo:', treeInfoRef.current);
        fetch(`http://localhost:5000/api/share-trees/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senderID: currentAccountID,
                receiverID: Number(data.selectedMember), // this will have to be a member ID
                perms: "view",
                parentalSide: "both",
                treeInfo: JSON.stringify(treeInfoRef.current),
                comment: data.comments || ""
            })})
        .then(async (response) => {
            if (response.ok) {
                let responseData = await response.json();
                console.log(responseData);
                window.location.href = '/';
            }
            else {
                let errorData = await response.json();
                console.log('Error:', errorData);
            }
        });
    }

    // Fetch all data once on mount
    useEffect(() => {
        const fetchData = async () => {
            // Fetch family members
            fetch(`http://localhost:5000/api/family-members/user/${currentAccountID}`)
                .then(async (response) => {
                    if (response.ok) {
                        let responseData = await response.json();
                        console.log('Family members:', responseData);
                        // only other users
                        allMembersRef.current = responseData?.filter(member => member.memberuserid) || [];
                    } else {
                        console.log('Error fetching family members:', response);
                    }
                });

            // Fetch users
            fetch(`http://localhost:5000/api/auth/users`)
                .then(async (response) => {
                    if (response.ok) {
                        let responseData = await response.json();
                        userDataRef.current = responseData;
                    } else {
                        console.log('Error fetching users:', response);
                    }
                });

            // Fetch tree info
            fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`)
                .then(async (response) => {
                    if (response.ok) {
                        let responseData = await response.json();
                        treeInfoRef.current = responseData.object;
                    } else {
                        let errorData = await response.json();
                        console.log('Error fetching tree info:', errorData);
                    }
                });
        };

        fetchData();
    }, [currentAccountID]);

    // Compute filtered search results based on searchTerm
    const searchResults = useMemo(() => {
        if (searchTerm === "") {
            return [];
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return allMembersRef.current.filter(member => 
            member.firstname?.toLowerCase().includes(lowerSearchTerm) || 
            member.lastname?.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm]);

    // Reset selection when search term changes
    useEffect(() => {
        if (searchTerm === "") {
            setValue("email", "");
            setValue("selectedMember", null);
        }
    }, [searchTerm, setValue]);

    const handleRadioChange = (resultId) => {
        console.log('Selected member ID:', resultId);
        const selectedUser = userDataRef.current.find(user => 
            Number(user.id) === resultId);
        console.log('Selected user:', selectedUser);
        if (selectedUser) {
            setValue("email", selectedUser.email);
            setValue("selectedMember", selectedUser.id);
        } else {
            setValue("email", "");
        }
    };

    return (
        <div style={styles.DefaultStyle}>
            <div style={{width: '150px'}}></div>
            <div style={styles.RightSide}>
            <div style={styles.ContainerStyle}>
                {/* title */}
                <h1 style={{ margin: '0px' }}>Share Tree</h1>
                <hr style={{ width: '50%', border: '1px solid #000', margin: '1px 0' }} />

                {/* form */}
                <form onSubmit={handleSubmit(data => onSubmitForm(data))} style={styles.FormStyle}>
                    <ul style={styles.ListStyle}>
                        <li style={styles.ItemStyle}>
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Search for a family member..."
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'Alata' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* search results for active family members (users) */}
                        <div style={styles.AddOptionsStyle}>
                        {searchResults?.length > 0 ? (
                            searchResults.map(result => (
                            <div key={result.memberuserid} style={styles.ListingStyle}>
                                <label>
                                <input
                                    type="radio"
                                    name="selectedMember"
                                    value={result.memberuserid}
                                    {...register("selectedMember", {
                                        required: true,
                                        onChange: handleRadioChange(result?.memberuserid),
                                    })}
    
                                />
                                <Link to={`/account/${result?.memberuserid}`} style={{ marginLeft: '10px' }}>
                                    {result.firstname} {result.lastname}
                                </Link>
                                </label>
                            </div>
                            ))
                        ) : (
                            <div style={styles.ListingStyle}>
                            No Results
                            </div>
                        )}
                        </div>
                        </li>
                        {/*TO DO: Add option to share with non-users by email. Will prompt them to register/log in */}
                        <li style={styles.ItemStyle}>
                            <label>
                                Comments:
                            </label>
                            <textarea {...register("comments")} type="text" style={styles.TextAreaStyle} />
                        </li>
                    </ul>
                    <button type="submit" style={styles.ButtonStyle}>Share</button>
                </form>
            </div>
            </div>
        </div>
    )
}

export default ShareTree;