import { React, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as styles from './styles';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import { useCurrentUser } from '../../CurrentUserProvider';
import { supabase } from '../../utils/supabaseClient';
import { handleLogout } from '../../utils/authHandlers';

function Account() {
    const navigate = useNavigate(); // used to change route without refreshing page, used to prevent infinite refreshes
    const [ownAccount, setOwnAccount] = useState(false); // will be retrieved
    const [editingSection, setEditingSection] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const fileInputRef = useRef(null);

    const { supabaseUser, loading } = useCurrentUser();
    
    // takes id from url path
    let { id } = useParams();

    const [userData, setUserData] = useState({
        id: id,
        displayName: '',
        firstName: 'Loading...',
        lastName: '',
        email: '',
        birthdate: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone_number: '',
        zipcode: '',
        profilePictureUrl: ''
    });
    const [formValues, setFormValues] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        birthdate: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone_number: '',
        zipcode: '',
        bio: '',
        profilePictureUrl: ''
    });
    const displayName = useMemo(() => {
        if (userData.displayName) return userData.displayName;
        const parts = [userData.firstName, userData.lastName].filter(Boolean);
        if (parts.length) return parts.join(' ');
        return 'User';
    }, [userData.displayName, userData.firstName, userData.lastName]);
    const summaryLocation = useMemo(() => {
        return [userData.city, userData.state, userData.country].filter(Boolean).join(', ');
    }, [userData.city, userData.state, userData.country]);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
    const [backendUserId, setBackendUserId] = useState(null);
    const [deleteState, setDeleteState] = useState({ loading: false, error: '', success: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [totpFactorId, setTotpFactorId] = useState('');
    const [totpQr, setTotpQr] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [totpStatus, setTotpStatus] = useState('');
    const [totpLoading, setTotpLoading] = useState(false);
    const [totpVerified, setTotpVerified] = useState(false);
    const totpStatusIsError = useMemo(() => {
        if (!totpStatus) return false;
        return /error|fail|unable|invalid|problem|could not/i.test(totpStatus);
    }, [totpStatus]);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState('');
    const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);

    // // if no id is provided, retrieve current user's id and show that page
    useEffect(() => {
        setErrorMessage('');
        console.log('Id params not passed in')
        if (!id) {
            // Fetch current user's data
            const fetchOwnUserData = async () => {
                const user = await fetch(`http://localhost:5000/api/auth/user/${supabaseUser.id}`);
                const fetchedUserData = await user.json();
                setUserData(fetchedUserData);
                setOwnAccount(true);
                navigate(`/account/${fetchedUserData.id}`, { replace: true });
            }
            fetchOwnUserData();
        }
      }, [id, supabaseUser?.id, navigate]);

        // Check if this is the current Supabase user
        if (id === supabaseUser?.id) {
            // Database is source of truth - fetch from database first
            fetch(`http://localhost:5000/api/auth/user/email/${encodeURIComponent(supabaseUser.email)}`)
                .then(async (response) => {
                    if (response.ok) {
                        const dbUser = await response.json();
                        // Map database fields to frontend format
                        setUserData({
                            id: dbUser.id,
                            displayName: dbUser.display_name || '',
                            firstName: dbUser.firstname || dbUser.firstName || 'User',
                            lastName: dbUser.lastname || dbUser.lastName || '',
                            email: dbUser.email || supabaseUser.email,
                            birthdate: dbUser.birthdate || dbUser.birthDate || '',
                            address: dbUser.address || '',
                            city: dbUser.city || '',
                            state: dbUser.state || '',
                            country: dbUser.country || '',
                            phone_number: dbUser.phonenumber || dbUser.phoneNumber || '',
                            zipcode: dbUser.zipcode || '',
                            bio: dbUser.bio || '',
                            profilePictureUrl: dbUser.profile_picture_url || ''
                        });
                    } else {
                        // Fallback to auth metadata if database lookup fails
                        console.warn('Database lookup failed, using auth metadata');
                        const metadata = supabaseUser.user_metadata || {};
                        setUserData({
                            id: supabaseUser.id,
                            displayName: metadata.display_name || '',
                            firstName: metadata.first_name || 'User',
                            lastName: metadata.last_name || '',
                            email: supabaseUser.email,
                            birthdate: metadata.birthdate || '',
                            address: metadata.address || '',
                            city: metadata.city || '',
                            state: metadata.state || '',
                            country: metadata.country || '',
                            phone_number: metadata.phone_number || '',
                            zipcode: metadata.zipcode || '',
                            bio: metadata.bio || '',
                            profilePictureUrl: metadata.profile_picture_url || ''
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user from database:', error);
                    // Fallback to auth metadata
                    const metadata = supabaseUser.user_metadata || {};
                    setUserData({
                        id: supabaseUser.id,
                        displayName: metadata.display_name || '',
                        firstName: metadata.first_name || 'User',
                        lastName: metadata.last_name || '',
                        email: supabaseUser.email,
                        birthdate: metadata.birthdate || '',
                        address: metadata.address || '',
                        city: metadata.city || '',
                        state: metadata.state || '',
                        country: metadata.country || '',
                        phone_number: metadata.phone_number || '',
                        zipcode: metadata.zipcode || '',
                        bio: metadata.bio || '',
                        profilePictureUrl: metadata.profile_picture_url || ''
                    });
                });
            setOwnAccount(true);
            return;
        }
    }, [loading, supabaseUser, navigate]);

    // Fetch user info - check if it's a Supabase user or family member
    useEffect(() => {
        if (!id || !currentAccountID) return;
        console.log("current account id:", currentAccountID);
        console.log("viewing account id:", id);
        setErrorMessage('');
        const fetchUserData = async () => {
            try {
                
                const user = await fetch(`http://localhost:5000/api/auth/user/${id}`);

        fetch(`http://localhost:5000/api/family-members/${id}`, requestOptions)
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        displayName: data.displayName || '',
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        birthdate: data.birthdate,
                        address: data.address,
                        city: data.city,
                        state: data.state,
                        country: data.country,
                        phone_number: data.phone_number,
                        zipcode: data.zipcode,
                        id: data.id,
                        memberUserId: data.memberUserId,
                        profilePictureUrl: data.profilePictureUrl || '',
                        bio: data.bio || ''
                    });
                } else {
                    console.error('Error fetching user data:', response);
                    // If family member not found, show basic info
                    setUserData({
                        id: id,
                        displayName: '',
                        firstName: 'Unknown',
                        lastName: 'User',
                        email: '',
                    });
                }
            })
            .catch((error) => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [id, supabaseUser]);
        
    useEffect(() => {
        if (editingSection === null) {
            setFormValues({
                displayName: userData.displayName || '',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                birthdate: userData.birthdate ? userData.birthdate.split('T')[0] : '',
                address: userData.address || '',
                city: userData.city || '',
                state: userData.state || '',
                country: userData.country || '',
                phone_number: userData.phone_number || '',
                zipcode: userData.zipcode || '',
                bio: userData.bio || '',
                profilePictureUrl: userData.profilePictureUrl || ''
            });
            if (profilePicturePreview) {
                URL.revokeObjectURL(profilePicturePreview);
            }
            setProfilePicturePreview('');
            setProfilePictureFile(null);
            setRemoveProfilePicture(false);
        }
    }, [editingSection, userData, profilePicturePreview]);

    useEffect(() => {
        let isMounted = true;
        if (!ownAccount || !supabaseUser?.email) {
            setBackendUserId(null);
            return;
        }

        const loadBackendUserId = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/user/email/${encodeURIComponent(supabaseUser.email)}`);
                if (!isMounted) {
                    return;
                }
                if (response.ok) {
                    const data = await response.json();
                    setBackendUserId(data?.id ?? null);
                } else {
                    setBackendUserId(null);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to load backend user id:', error);
                }
            }
        };

        loadBackendUserId();

        return () => {
            isMounted = false;
        };
    }, [ownAccount, supabaseUser?.email]);

    const loadTotpFactors = useCallback(async () => {
        if (!supabaseUser?.id) return;
        try {
            const { data: factorsData, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;
            const verified = factorsData?.all?.find((f) => f.factor_type === 'totp' && f.status === 'verified');
            const unverified = factorsData?.all?.find((f) => f.factor_type === 'totp' && f.status === 'unverified');
            if (verified) {
                setTotpVerified(true);
                setTotpFactorId(verified.id);
                setTotpQr('');
            } else if (unverified) {
                setTotpVerified(false);
                setTotpFactorId(unverified.id);
                setTotpQr('');
            } else {
                setTotpVerified(false);
                setTotpFactorId('');
                setTotpQr('');
            }
        } catch (error) {
            console.error('Load factors error:', error);
            setTotpStatus(error.message || 'Unable to load multi-factor settings.');
        }
    }, [supabaseUser?.id]);

    // Check email verification status
    const checkEmailVerification = useCallback(async () => {
        if (!supabaseUser) return;
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            setEmailVerified(user?.email_confirmed_at ? true : false);
        } catch (error) {
            console.error('Error checking email verification:', error);
        }
    }, [supabaseUser]);

    useEffect(() => {
        if (!ownAccount || !supabaseUser?.id) return;
        loadTotpFactors();
        checkEmailVerification();
    }, [ownAccount, supabaseUser?.id, loadTotpFactors, checkEmailVerification]);

    useEffect(() => {
        if (ownAccount) return;
        setTotpFactorId('');
        setTotpQr('');
        setTotpCode('');
        setTotpStatus('');
        setTotpVerified(false);
        setTotpLoading(false);
    }, [ownAccount]);

    const handleFieldChange = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStartEditing = (section) => {
        setSaveError('');
        setSaveSuccess('');
        setEditingSection(section);
    };

    const handleCancelEditing = () => {
        setSaveError('');
        setSaveSuccess('');
        setEditingSection(null);
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        if (!ownAccount || !supabaseUser) return;

        setIsSaving(true);
        setSaveError('');
        setSaveSuccess('');

        try {
            let nextProfileUrl = userData.profilePictureUrl || '';

            if (profilePictureFile) {
                // Use FormData for efficient file upload (bypasses RLS via backend)
                const formData = new FormData();
                formData.append('file', profilePictureFile);
                formData.append('auth_uid', supabaseUser.id);

                // Upload via backend using service role (bypasses RLS)
                const uploadResponse = await fetch('http://localhost:5000/api/auth/upload-profile-picture', {
                    method: 'POST',
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json().catch(() => ({}));
                    throw new Error(errorData?.error || errorData?.details || 'Failed to upload profile picture');
                }

                const uploadResult = await uploadResponse.json();
                nextProfileUrl = uploadResult.publicUrl || '';
            } else if (removeProfilePicture && userData.profilePictureUrl) {
                try {
                    const pathFromUrl = userData.profilePictureUrl.split('/profile-pictures/')[1];
                    if (pathFromUrl) {
                        await supabase.storage
                            .from('profile-pictures')
                            .remove([pathFromUrl]);
                    }
                } catch (removeError) {
                    console.warn('Unable to remove old avatar:', removeError);
                }
                nextProfileUrl = '';
            }

            // Update database first (source of truth)
            const profilePayload = {
                auth_uid: supabaseUser.id,
                email: supabaseUser.email, // Keep existing email unless explicitly changed
                username: supabaseUser.email, // Use email as username for now
                displayName: formValues.displayName?.trim() || null,
                firstName: formValues.firstName?.trim() || null,
                lastName: formValues.lastName?.trim() || null,
                birthdate: formValues.birthdate || null,
                address: formValues.address?.trim() || null,
                city: formValues.city?.trim() || null,
                state: formValues.state?.trim() || null,
                country: formValues.country?.trim() || null,
                phone_number: formValues.phone_number?.trim() || null,
                zipcode: formValues.zipcode?.trim() || null,
                bio: formValues.bio?.trim() || null,
                profilePictureUrl: nextProfileUrl || null
            };

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profilePayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData?.error || errorData?.details || 'Failed to update profile';
                console.error('Profile update error:', errorData);
                throw new Error(errorMsg);
            }

            const updatedUser = await response.json();

            // Map database fields back to frontend format
            setUserData((prev) => ({
                ...prev,
                displayName: updatedUser.display_name || '',
                firstName: updatedUser.firstname || '',
                lastName: updatedUser.lastname || '',
                birthdate: updatedUser.birthdate || '',
                address: updatedUser.address || '',
                city: updatedUser.city || '',
                state: updatedUser.state || '',
                country: updatedUser.country || '',
                phone_number: updatedUser.phonenumber || '',
                zipcode: updatedUser.zipcode || '',
                bio: updatedUser.bio || '',
                profilePictureUrl: updatedUser.profile_picture_url || '',
                email: updatedUser.email || prev.email
            }));

            setSaveSuccess('Profile updated successfully.');
            setEditingSection(null);
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaveError(error.message || 'Something went wrong while saving your profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfileImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleProfileImageChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        if (profilePicturePreview) {
            URL.revokeObjectURL(profilePicturePreview);
        }
        setProfilePictureFile(file);
        setProfilePicturePreview(URL.createObjectURL(file));
        setRemoveProfilePicture(false);
    };

    const handleRemoveProfileImage = () => {
        if (profilePicturePreview) {
            URL.revokeObjectURL(profilePicturePreview);
        }
        setProfilePicturePreview('');
        setProfilePictureFile(null);
        setRemoveProfilePicture(true);
    };

    const startTotpEnroll = async () => {
        if (!ownAccount) return;
        setTotpStatus('');
        setTotpLoading(true);
        try {
            if (totpVerified) {
                setTotpStatus('Two-factor authentication is already enabled.');
                return;
            }
            if (totpFactorId && !totpVerified) {
                setTotpStatus('A setup is pending. Enter the code below or start over.');
                            return;
                        }
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (error) throw error;
            setTotpFactorId(data.id);
            setTotpQr(data.totp?.qr_code || '');
        } catch (error) {
            console.error('Enroll error:', error);
            setTotpStatus(error.message || 'Unable to start authenticator setup.');
        } finally {
            setTotpLoading(false);
        }
    };

    const verifyTotp = async () => {
        if (!ownAccount || !totpFactorId || !totpCode) return;
        setTotpLoading(true);
        setTotpStatus('');
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
            if (challengeError) throw challengeError;
            const challengeId = challengeData?.id;
            const { error } = await supabase.auth.mfa.verify({ factorId: totpFactorId, challengeId, code: totpCode });
            if (error) throw error;
            setTotpStatus('Two-factor authentication enabled.');
            setTotpCode('');
            setTotpQr('');
            await loadTotpFactors();
        } catch (error) {
            console.error('TOTP verify error:', error);
            setTotpStatus(error.message || 'Verification failed.');
        } finally {
            setTotpLoading(false);
        }
    };

    const disableTotp = async () => {
        if (!ownAccount || !totpFactorId) return;
        setTotpLoading(true);
        setTotpStatus('');
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
            if (error) throw error;
            setTotpStatus('Two-factor authentication disabled.');
            setTotpFactorId('');
            setTotpVerified(false);
            setTotpQr('');
            setTotpCode('');
            await loadTotpFactors();
        } catch (error) {
            console.error('Disable TOTP error:', error);
            setTotpStatus(error.message || 'Failed to disable authenticator.');
        } finally {
            setTotpLoading(false);
        }
    };

    const restartTotpEnroll = async () => {
        if (!ownAccount) return;
        setTotpStatus('');
        setTotpLoading(true);
        try {
            if (totpFactorId) {
                const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
                if (error) throw error;
            }
            setTotpFactorId('');
            setTotpQr('');
            setTotpCode('');
            setTotpLoading(false);
            await startTotpEnroll();
        } catch (error) {
            console.error('Restart TOTP error:', error);
            setTotpLoading(false);
            setTotpStatus(error.message || 'Could not restart setup.');
        }
    };

    const resendVerificationEmail = async () => {
        if (!ownAccount || !supabaseUser?.email) return;
        setEmailVerificationLoading(true);
        setEmailVerificationStatus('');
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: supabaseUser.email,
                options: {
                    emailRedirectTo: `${window.location.origin}/account/${supabaseUser.id}`
                }
            });
            if (error) throw error;
            setEmailVerificationStatus('Verification email sent! Please check your inbox and click the confirmation link.');
            // Refresh verification status after a delay
            setTimeout(() => {
                checkEmailVerification();
            }, 2000);
        } catch (error) {
            console.error('Resend verification email error:', error);
            setEmailVerificationStatus(error.message || 'Failed to send verification email.');
        } finally {
            setEmailVerificationLoading(false);
        }
    };

    const handleSignOut = async () => {
        await handleLogout();
    };

    const handleDeleteAccountClick = () => {
        setShowDeleteConfirm(true);
        setDeleteState({ loading: false, error: '', success: '' });
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setDeleteState({ loading: false, error: '', success: '' });
    };

    const handleDeleteAccount = async () => {
        if (!ownAccount || !supabaseUser) return;

        setDeleteState({ loading: true, error: '', success: '' });
        setShowDeleteConfirm(false);

        try {
            // Delete profile picture from storage if it exists
            if (userData.profilePictureUrl) {
                try {
                    const pathFromUrl = userData.profilePictureUrl.split('/profile-pictures/')[1];
                    if (pathFromUrl) {
                        await supabase.storage
                            .from('profile-pictures')
                            .remove([pathFromUrl]);
                    }
                } catch (storageError) {
                    console.warn('Unable to delete profile picture:', storageError);
                    // Continue with account deletion even if picture deletion fails
                }
            }

            // Get backend user ID
            let apiUserId = backendUserId;
            if (!apiUserId && supabaseUser.email) {
                const response = await fetch(`http://localhost:5000/api/auth/user/email/${encodeURIComponent(supabaseUser.email)}`);
                if (response.ok) {
                    const data = await response.json();
                    apiUserId = data?.id;
                    setBackendUserId(data?.id ?? null);
                }
            }

            if (!apiUserId) {
                throw new Error('Unable to locate your account record for deletion.');
            }

            // Delete account from backend (handles database, tree members, relationships, and Supabase auth)
            console.log('Attempting to delete account - User ID:', apiUserId);
            const response = await fetch(`http://localhost:5000/api/auth/remove/${apiUserId}`, {
                method: 'DELETE'
            });
            
            console.log('Delete account response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Delete account error response:', errorData);
                throw new Error(errorData?.error || errorData?.details || 'Failed to delete account.');
            }

            const result = await response.json().catch(() => ({}));
            console.log('Delete account success:', result);

            // Logout and redirect to login
            await handleLogout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Delete account error:', error);
            setDeleteState({ loading: false, error: error.message || 'Failed to delete account.', success: '' });
            setShowDeleteConfirm(true); // Show dialog again on error
        }
    };

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <div style={{width: '150px'}}></div>
            <div style={styles.RightSide}>
                
            <div style={styles.ContainerStyle}>
                {/* User Information Section */}
                <div style={{padding: '20px 0', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <section style={styles.CardStyle}>
                        <div style={styles.CardHeader}>
                            <div>
                                <h2 style={styles.CardTitle}>My Profile</h2>
                                <p style={styles.CardSubtitle}>Your public profile details</p>
                            </div>
                            {ownAccount && (
                                editingSection === 'profile' ? (
                                    <div style={styles.HeaderActionGroup}>
                                        <button
                                            type="button"
                                            onClick={handleCancelEditing}
                                            disabled={isSaving}
                                            style={{...styles.TertiaryButton, opacity: isSaving ? 0.7 : 1}}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            style={{...styles.PrimaryButton, opacity: isSaving ? 0.7 : 1}}
                                        >
                                            {isSaving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleStartEditing('profile')}
                                        style={styles.EditButton}
                                    >
                                        Edit
                                    </button>
                                )
                            )}
                        </div>
                        <div style={styles.ProfileCardBody}>
                            <div style={styles.AvatarBlock}>
                                <div style={styles.AvatarWrapper}>
                                    {profilePicturePreview || userData.profilePictureUrl ? (
                                        <img
                                            src={profilePicturePreview || userData.profilePictureUrl}
                                            alt={`${displayName} avatar`}
                                            style={styles.AvatarImage}
                                        />
                                    ) : (
                                        <div style={styles.AvatarFallback}>
                                            {displayName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    {ownAccount && editingSection === 'profile' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleProfileImageClick}
                                                style={styles.AvatarAction}
                                            >
                                                Change Photo
                                            </button>
                                            {(userData.profilePictureUrl || profilePicturePreview) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveProfileImage}
                                                    style={{...styles.AvatarAction, backgroundColor: '#fde8e8', color: '#9b1c1c'}}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                style={{display: 'none'}}
                                            />
                                        </>
                                    )}
                                </div>
                                <div style={styles.ProfileSummary}>
                                    {editingSection === 'profile' ? (
                                        <div style={styles.FieldColumn}>
                                            <label style={styles.FieldLabel}>Display name</label>
                                            <input
                                                type="text"
                                                value={formValues.displayName}
                                                onChange={(e) => handleFieldChange('displayName', e.target.value)}
                                                style={styles.FieldStyle}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 style={styles.ProfileName}>{displayName}</h3>
                                        </div>
                                    )}
                                    <div style={styles.ProfileMeta}>
                                        {summaryLocation && <span>{summaryLocation}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={styles.CardStyle}>
                        <div style={styles.CardHeader}>
                            <div>
                                <h2 style={styles.CardTitle}>Personal information</h2>
                                <p style={styles.CardSubtitle}>Basics about you</p>
                            </div>
                            {ownAccount && (
                                editingSection === 'personal' ? (
                                    <div style={styles.HeaderActionGroup}>
                                        <button
                                            type="button"
                                            onClick={handleCancelEditing}
                                            disabled={isSaving}
                                            style={{...styles.TertiaryButton, opacity: isSaving ? 0.7 : 1}}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            style={{...styles.PrimaryButton, opacity: isSaving ? 0.7 : 1}}
                                        >
                                            {isSaving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleStartEditing('personal')}
                                        style={styles.EditButton}
                                    >
                                        Edit
                                    </button>
                                )
                        )}
                    </div>

                        {editingSection === 'personal' ? (
                            <form onSubmit={handleSaveProfile} style={styles.FormGrid}>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>First Name</label>
                                    <input
                                        type="text"
                                        value={formValues.firstName}
                                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>Last Name</label>
                                    <input
                                        type="text"
                                        value={formValues.lastName}
                                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>Email Address</label>
                                    <input
                                        type="email"
                                        value={userData.email}
                                        disabled
                                        style={{...styles.FieldStyle, backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>Phone</label>
                                    <input
                                        type="tel"
                                        value={formValues.phone_number}
                                        onChange={(e) => handleFieldChange('phone_number', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>Birthdate</label>
                                    <input
                                        type="date"
                                        value={formValues.birthdate}
                                        onChange={(e) => handleFieldChange('birthdate', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumnFull}>
                                    <label style={styles.FieldLabel}>Bio</label>
                                    <textarea
                                        value={formValues.bio}
                                        onChange={(e) => handleFieldChange('bio', e.target.value)}
                                        style={{...styles.FieldStyle, minHeight: '90px', resize: 'vertical'}}
                                        placeholder="Tell others about yourself"
                                    />
                                </div>
                            </form>
                        ) : (
                            <div style={styles.ReadOnlyGrid}>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>First Name</span>
                                    <span style={styles.ReadOnlyValue}>{userData.firstName || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>Last Name</span>
                                    <span style={styles.ReadOnlyValue}>{userData.lastName || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>Email Address</span>
                                    <span style={styles.ReadOnlyValue}>{userData.email || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>Phone</span>
                                    <span style={styles.ReadOnlyValue}>{userData.phone_number || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>Birthdate</span>
                                    <span style={styles.ReadOnlyValue}>
                                        {userData.birthdate ? (() => {
                                            const dateStr = userData.birthdate.split('T')[0];
                                            const [year, month, day] = dateStr.split('-');
                                            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                                        })() : '—'}
                                    </span>
                                </div>
                                <div style={styles.ReadOnlyColumnFull}>
                                    <span style={styles.ReadOnlyLabel}>Bio</span>
                                    <span style={styles.ReadOnlyValue}>{userData.bio || '—'}</span>
                                </div>
                </div>
                        )}
                    </section>

                    <section style={styles.CardStyle}>
                        <div style={styles.CardHeader}>
                            <div>
                                <h2 style={styles.CardTitle}>Address</h2>
                                <p style={styles.CardSubtitle}>Where you call home</p>
                            </div>
                            {ownAccount && (
                                editingSection === 'address' ? (
                                    <div style={styles.HeaderActionGroup}>
                                        <button
                                            type="button"
                                            onClick={handleCancelEditing}
                                            disabled={isSaving}
                                            style={{...styles.TertiaryButton, opacity: isSaving ? 0.7 : 1}}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            style={{...styles.PrimaryButton, opacity: isSaving ? 0.7 : 1}}
                                        >
                                            {isSaving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleStartEditing('address')}
                                        style={styles.EditButton}
                                    >
                                        Edit
                                    </button>
                                )
                            )}
                        </div>

                        {editingSection === 'address' ? (
                            <form onSubmit={handleSaveProfile} style={styles.FormGrid}>
                                <div style={styles.FieldColumnFull}>
                                    <label style={styles.FieldLabel}>Street address</label>
                                    <input
                                        type="text"
                                        value={formValues.address}
                                        onChange={(e) => handleFieldChange('address', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>City</label>
                                    <input
                                        type="text"
                                        value={formValues.city}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>State / Region</label>
                                    <input
                                        type="text"
                                        value={formValues.state}
                                        onChange={(e) => handleFieldChange('state', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>ZIP / Postal Code</label>
                                    <input
                                        type="text"
                                        value={formValues.zipcode}
                                        onChange={(e) => handleFieldChange('zipcode', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                                <div style={styles.FieldColumn}>
                                    <label style={styles.FieldLabel}>Country</label>
                                    <input
                                        type="text"
                                        value={formValues.country}
                                        onChange={(e) => handleFieldChange('country', e.target.value)}
                                        style={styles.FieldStyle}
                                    />
                                </div>
                            </form>
                        ) : (
                            <div style={styles.ReadOnlyGrid}>
                                <div style={styles.ReadOnlyColumnFull}>
                                    <span style={styles.ReadOnlyLabel}>Street address</span>
                                    <span style={styles.ReadOnlyValue}>{userData.address || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>City</span>
                                    <span style={styles.ReadOnlyValue}>{userData.city || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>State / Region</span>
                                    <span style={styles.ReadOnlyValue}>{userData.state || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>ZIP / Postal Code</span>
                                    <span style={styles.ReadOnlyValue}>{userData.zipcode || '—'}</span>
                                </div>
                                <div style={styles.ReadOnlyColumn}>
                                    <span style={styles.ReadOnlyLabel}>Country</span>
                                    <span style={styles.ReadOnlyValue}>{userData.country || '—'}</span>
                                </div>
                            </div>
                        )}
                    </section>

                    <section style={styles.CardStyle}>
                        <div style={styles.CardHeader}>
                            <div>
                                <h2 style={styles.CardTitle}>Account security</h2>
                                <p style={styles.CardSubtitle}>Protect your KinTree account</p>
                            </div>
                        </div>
                        {ownAccount ? (
                            <div style={styles.SecurityContent}>
                                <div style={styles.SecurityBlock}>
                                    <div style={styles.SecurityHeadingRow}>
                                        <h3 style={styles.SecurityTitle}>Authenticator app</h3>
                                        <span style={totpVerified ? styles.StatusPillSuccess : styles.StatusPillMuted}>
                                            {totpVerified ? 'Enabled' : 'Not enabled'}
                                        </span>
                                    </div>
                                    <p style={styles.HelpText}>
                                        Add a time-based one-time password (TOTP) authenticator for an extra layer of security.
                                    </p>
                                    {totpVerified ? (
                                        <div style={styles.SecurityActions}>
                                            <button
                                                type="button"
                                                onClick={disableTotp}
                                                disabled={totpLoading}
                                                style={{...styles.SecondaryButton, opacity: totpLoading ? 0.7 : 1}}
                                            >
                                                {totpLoading ? 'Working…' : 'Disable authenticator'}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {!totpFactorId && (
                                                <div style={styles.SecurityActions}>
                                                    <button
                                                        type="button"
                                                        onClick={startTotpEnroll}
                                                        disabled={totpLoading}
                                                        style={{...styles.PrimaryButton, opacity: totpLoading ? 0.7 : 1}}
                                                    >
                                                        {totpLoading ? 'Starting…' : 'Set up authenticator'}
                                                    </button>
                                                </div>
                                            )}
                                            {totpFactorId && totpQr && (
                                                <div style={styles.SecuritySteps}>
                                                    <img alt="Authenticator QR code" src={totpQr} style={styles.TotpQr} />
                                                    <p style={styles.HelpText}>
                                                        Scan the QR code with Google Authenticator, Duo, or another TOTP app. Enter the 6-digit code to finish setup.
                                                    </p>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="123456"
                                                        value={totpCode}
                                                        onChange={(e) => setTotpCode(e.target.value)}
                                                        style={{...styles.FieldStyle, width: '220px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px'}}
                                                    />
                                                    <div style={styles.SecurityActions}>
                                                        <button
                                                            type="button"
                                                            onClick={verifyTotp}
                                                            disabled={totpLoading || !totpCode}
                                                            style={{...styles.PrimaryButton, opacity: totpLoading ? 0.7 : 1}}
                                                        >
                                                            {totpLoading ? 'Verifying…' : 'Verify code'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={restartTotpEnroll}
                                                            disabled={totpLoading}
                                                            style={{...styles.TertiaryButton, opacity: totpLoading ? 0.7 : 1}}
                                                        >
                                                            Start over
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {totpFactorId && !totpQr && (
                                                <div style={styles.SecuritySteps}>
                                                    <p style={styles.HelpText}>
                                                        Enter a 6-digit code from your authenticator app to complete setup.
                                                    </p>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="123456"
                                                        value={totpCode}
                                                        onChange={(e) => setTotpCode(e.target.value)}
                                                        style={{...styles.FieldStyle, width: '220px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px'}}
                                                    />
                                                    <div style={styles.SecurityActions}>
                                                        <button
                                                            type="button"
                                                            onClick={verifyTotp}
                                                            disabled={totpLoading || !totpCode}
                                                            style={{...styles.PrimaryButton, opacity: totpLoading ? 0.7 : 1}}
                                                        >
                                                            {totpLoading ? 'Verifying…' : 'Verify code'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={restartTotpEnroll}
                                                            disabled={totpLoading}
                                                            style={{...styles.TertiaryButton, opacity: totpLoading ? 0.7 : 1}}
                                                        >
                                                            Start over
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {totpStatus && (
                                        <div style={totpStatusIsError ? styles.ErrorBanner : styles.SuccessBanner}>
                                            {totpStatus}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.SecurityBlock}>
                                    <div style={styles.SecurityHeadingRow}>
                                        <h3 style={styles.SecurityTitle}>Email verification</h3>
                                        <span style={emailVerified ? styles.StatusPillSuccess : styles.StatusPillMuted}>
                                            {emailVerified ? 'Verified' : 'Not verified'}
                                        </span>
                                    </div>
                                    <p style={styles.HelpText}>
                                        {emailVerified 
                                            ? 'Your email address has been verified. This helps secure your account.'
                                            : 'Verify your email address to help secure your account and receive important notifications.'}
                                    </p>
                                    {!emailVerified && (
                                        <div style={styles.SecurityActions}>
                                            <button
                                                type="button"
                                                onClick={resendVerificationEmail}
                                                disabled={emailVerificationLoading}
                                                style={{...styles.PrimaryButton, opacity: emailVerificationLoading ? 0.7 : 1}}
                                            >
                                                {emailVerificationLoading ? 'Sending…' : 'Send verification email'}
                                            </button>
                                        </div>
                                    )}
                                    {emailVerificationStatus && (
                                        <div style={emailVerificationStatus.toLowerCase().includes('sent') ? styles.SuccessBanner : styles.ErrorBanner}>
                                            {emailVerificationStatus}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.SecurityBlock}>
                                    <div style={styles.SecurityHeadingRow}>
                                        <h3 style={styles.SecurityTitle}>Sign out</h3>
                                    </div>
                                    <p style={styles.HelpText}>Sign out of KinTree on this device.</p>
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        style={styles.SecondaryButton}
                                    >
                                        Sign out
                                    </button>
                    </div>

                                <div style={styles.SecurityBlock}>
                                    <div style={styles.SecurityHeadingRow}>
                                        <h3 style={styles.SecurityTitle}>Delete account</h3>
                                    </div>
                                    <p style={styles.DangerNote}>
                                        Permanently remove your KinTree account and personal data. This cannot be undone.
                                    </p>
                                    {deleteState.error && (
                                        <div style={styles.ErrorBanner}>{deleteState.error}</div>
                                    )}
                                    {deleteState.success && (
                                        <div style={styles.SuccessBanner}>{deleteState.success}</div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccountClick}
                                        disabled={deleteState.loading}
                                        style={{...styles.DangerButton, opacity: deleteState.loading ? 0.7 : 1}}
                                    >
                                        {deleteState.loading ? 'Deleting…' : 'Delete account'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={styles.HelpText}>Only the account owner can manage security settings.</p>
                        )}
                    </section>

                    {(saveError || saveSuccess) && (
                        <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {saveError && (
                                <div style={styles.ErrorBanner}>
                                    {saveError}
                                </div>
                            )}
                            {saveSuccess && (
                                <div style={styles.SuccessBanner}>
                                    {saveSuccess}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* Delete Account Confirmation Dialog */}
            {showDeleteConfirm && (
                <div style={styles.ModalOverlay} onClick={handleDeleteCancel}>
                    <div style={styles.ModalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.ModalTitle}>Delete Account</h2>
                        <p style={styles.ModalMessage}>
                            Are you sure you want to permanently delete your KinTree account? This action cannot be undone.
                        </p>
                        <p style={styles.ModalWarning}>
                            This will permanently delete:
                        </p>
                        <ul style={styles.ModalList}>
                            <li>Your account and all personal information</li>
                            <li>Your profile picture</li>
                            <li>All your family tree data</li>
                            <li>All your relationships</li>
                        </ul>
                        {deleteState.error && (
                            <div style={styles.ErrorBanner}>{deleteState.error}</div>
                        )}
                        <div style={styles.ModalActions}>
                            <button
                                type="button"
                                onClick={handleDeleteCancel}
                                disabled={deleteState.loading}
                                style={{...styles.TertiaryButton, opacity: deleteState.loading ? 0.7 : 1}}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteState.loading}
                                style={{...styles.DangerButton, opacity: deleteState.loading ? 0.7 : 1}}
                            >
                                {deleteState.loading ? 'Deleting…' : 'Yes, delete my account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Account;