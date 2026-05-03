import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as styles from './styles';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';
import { SERVER_URL } from '../../../config/urls';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { AiOutlineCheckCircle } from 'react-icons/ai';

function ShareTree() {
    const [searchTerm, setSearchTerm] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [memberError, setMemberError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    
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
                setModalMessage(responseData.message || "Shared tree successfully!");
                setShowSuccessModal(true);
            }
            else {
                let errorData = await response.json();
                setModalMessage('Error sharing tree: ' + (errorData.error || 'Unknown error'));
                setShowSuccessModal(true);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            setModalMessage('Error sharing tree: ' + error.message);
            setShowSuccessModal(true);
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
            <div className="animate-in" style={styles.ContainerStyle}>
                {/* title */}
                <h1 style={{ margin: '0px', color: 'var(--text-color)' }}>Share Tree</h1>
                <hr style={{ width: '50px', border: 'none', height: '2px', backgroundColor: 'var(--kt-green-primary)', margin: 'var(--space-2) 0 var(--space-6) 0' }} />

                {/* form */}
                <form onSubmit={handleSubmit(data => onSubmitForm(data))} style={styles.FormStyle}>
                    <ul style={styles.ListStyle}>
                        <li style={styles.ItemStyle}>
                            <label style={styles.LabelStyle}>Search Family</label>
                            <input
                                type="text"
                                placeholder="Search for a family member..."
                                style={styles.InputStyle}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />

                            {/* search results for active family members (users) */}
                            <div style={styles.AddOptionsStyle}>
                            {searchResults?.length > 0 ? (
                                searchResults.map(result => (
                                <div key={result.memberuserid} style={styles.ListingStyle} className="kt-card-interactive">
                                    <label style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="selectedMember"
                                            style={{ cursor: 'pointer', accentColor: 'var(--kt-green-primary)' }}
                                            value={result.memberuserid}
                                            {...register("selectedMember")}
                                        />
                                        <Link 
                                            to={`/account/${result?.memberuserid}`} 
                                            style={{ marginLeft: '12px', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}
                                        >
                                            {result.firstname} {result.lastname}
                                        </Link>
                                    </label>
                                </div>
                                ))
                            ) : searchTerm !== "" ? (
                                <div style={{ ...styles.ListingStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                                        User not found. Invite via email:
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        style={{ 
                                            ...styles.InputStyle,
                                            borderColor: emailError ? 'var(--kt-danger)' : 'var(--input-border)',
                                            backgroundColor: 'var(--card-bg)'
                                        }}
                                        value={inviteEmail}
                                        onChange={handleInviteEmailChange}
                                    />
                                    {emailError && (
                                        <div style={{ color: 'var(--kt-danger)', fontSize: '12px', marginTop: '4px' }}>
                                            {emailError}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {searchTerm === "" ? "Start typing to find a family member..." : ""}
                                </div>
                            )}
                            </div>
                        </li>
                        
                        <li style={styles.ItemStyle}>
                            <label style={styles.LabelStyle}>
                                Comments:
                            </label>
                            <textarea 
                                {...register("comments")} 
                                style={styles.TextAreaStyle} 
                                placeholder="Add a note to your invitation..."
                            />
                        </li>
                    </ul>
                    <div style={{ marginTop: 'var(--space-8)', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" className="kt-button kt-button-primary" style={{ padding: '12px 40px' }}>
                            Share Tree
                        </button>
                    </div>
                </form>
            </div>
            </div>

            {/* Success/Error Modal */}
            <Popup
                open={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    if (!modalMessage.includes('Error')) window.location.href = '/';
                }}
                modal
                nested
                contentStyle={{ 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 'var(--space-8)', 
                    border: '1px solid var(--border-color)', 
                    boxShadow: 'var(--shadow-premium)',
                    width: '400px',
                    textAlign: 'center',
                    backgroundColor: 'var(--card-bg)'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ 
                        backgroundColor: modalMessage.includes('Error') ? 'rgba(180, 35, 24, 0.1)' : 'var(--kt-green-soft)', 
                        borderRadius: 'var(--radius-full)', 
                        width: '64px', 
                        height: '64px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}>
                        {modalMessage.includes('Error') ? (
                            <span style={{ fontSize: '32px', color: 'var(--kt-danger)' }}>⚠</span>
                        ) : (
                            <AiOutlineCheckCircle size={40} color="var(--kt-green-primary)" />
                        )}
                    </div>
                    
                    <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.5rem' }}>
                        {modalMessage.includes('Error') ? 'Oops!' : 'Success!'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {modalMessage}
                    </p>
                    
                    <button 
                        className="kt-button kt-button-primary"
                        style={{ marginTop: 'var(--space-4)', width: '100%' }}
                        onClick={() => {
                            setShowSuccessModal(false);
                            if (!modalMessage.includes('Error')) window.location.href = '/';
                        }}
                    >
                        {modalMessage.includes('Error') ? 'Try Again' : 'Done'}
                    </button>
                </div>
            </Popup>
        </div>
    )
}

export default ShareTree;