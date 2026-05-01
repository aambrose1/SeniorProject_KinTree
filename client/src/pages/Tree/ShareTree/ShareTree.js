import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as styles from './styles';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';
import { SERVER_URL } from '../../../config/urls';

function ShareTree() {
    const [searchTerm, setSearchTerm] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [memberError, setMemberError] = useState("");
    
    // Use refs to store fetched data (fetch once, use many times)
    const allMembersRef = useRef([]);
    const userDataRef = useRef([]);
    const treeInfoRef = useRef([]);
    
    const { register, handleSubmit, setValue, watch } = useForm();
    const { currentAccountID } = useCurrentUser();
    const selectedMember = watch("selectedMember");

    async function onSubmitForm (data){
        console.log('Form data:', data);
        console.log('Selected member:', data.selectedMember);
        console.log('Invite email:', inviteEmail);
        console.log('treeInfo:', treeInfoRef.current);
        
        // Validation: must have either a selected member or a valid email
        if (!data.selectedMember && !inviteEmail) {
            setMemberError("Please select a family member or enter an email address");
            return;
        }
        
        if (!data.selectedMember && inviteEmail && emailError) {
            return;
        }
        
        const requestBody = {
            senderID: currentAccountID,
            perms: "view",
            parentalSide: "both",
            treeInfo: JSON.stringify(treeInfoRef.current),
            comment: data.comments || ""
        };
        
        // Add either receiverID or receiverEmail based on what was provided
        if (data.selectedMember) {
            requestBody.receiverID = Number(data.selectedMember);
        } else if (inviteEmail) {
            requestBody.receiverEmail = inviteEmail;
        }
        
        fetch(`${SERVER_URL}/api/share-trees/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
        .then(async (response) => {
            if (response.ok) {
                let responseData = await response.json();
                console.log(responseData);
                alert(responseData.message);
                window.location.href = '/';
            }
            else {
                let errorData = await response.json();
                console.log('Error:', errorData);
                alert('Error sharing tree: ' + (errorData.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('Error sharing tree: ' + error.message);
        });
    }

    // Fetch all data once on mount
    useEffect(() => {
        const fetchData = async () => {
            // Fetch family members
            fetch(`${SERVER_URL}/api/family-members/user/${currentAccountID}`)
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
            fetch(`${SERVER_URL}/api/auth/users`)
                .then(async (response) => {
                    if (response.ok) {
                        let responseData = await response.json();
                        userDataRef.current = responseData;
                    } else {
                        console.log('Error fetching users:', response);
                    }
                });

            // Fetch tree info
            fetch(`${SERVER_URL}/api/tree-info/${currentAccountID}`)
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
            setInviteEmail("");
            setEmailError("");
            setMemberError("");
        }
    }, [searchTerm, setValue]);

    // Clear invite email when a member is selected
    useEffect(() => {
        if (selectedMember) {
            setInviteEmail("");
            setEmailError("");
            setMemberError("");
            setValue("email", "");
        }
    }, [selectedMember, setValue]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInviteEmailChange = (e) => {
        const email = e.target.value;
        setInviteEmail(email);
        
        if (email && !validateEmail(email)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
            setValue("email", email);
            setValue("selectedMember", null);
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
                                    {...register("selectedMember")}
    
                                />
                                <Link to={`/account/${result?.memberuserid}`} style={{ marginLeft: '10px' }}>
                                    {result.firstname} {result.lastname}
                                </Link>
                                </label>
                            </div>
                            ))
                        ) : searchTerm !== "" ? (
                            <div style={styles.ListingStyle}>
                                <label style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                                    User not found. Invite via email:
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        style={{ 
                                            width: '95%', 
                                            padding: '10px', 
                                            borderRadius: '5px', 
                                            border: emailError ? '1px solid red' : '1px solid #ccc', 
                                            fontFamily: 'Alata', 
                                            marginTop: '5px' 
                                        }}
                                        value={inviteEmail}
                                        onChange={handleInviteEmailChange}
                                    />
                                    {emailError && (
                                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                                            {emailError}
                                        </div>
                                    )}
                                </label>
                            </div>
                        ) : null}
                        </div>
                        </li>
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