import { React, useEffect, useState } from 'react';
import * as styles from './styles';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import AddToTreePopup from '../../components/AddToTree/AddToTree';
import { useCurrentUser } from '../../CurrentUserProvider';
import { set } from 'react-hook-form';
import {familyTreeService} from '../../services/familyTreeService';

const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
};

function Account() {
    const navigate = useNavigate(); // used to change route without refreshing page, used to prevent infinite refreshes
    const [ownAccount, setOwnAccount] = useState(false); // will be retrieved
    const [existsInTree, setExistsInTree] = useState(false); // will be retrieved
    const [relationshipType, setRelationshipType] = useState(''); // will be retrieved
    const [errorMessage, setErrorMessage] = useState('');
    const {currentAccountID, supabaseUser, loading } = useCurrentUser();
    
    // takes id from url path
    let { id } = useParams();

    const [userData, setUserData] = useState({
        id: '',
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
        gender: '',
        auth_uid: ''
    })

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

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !supabaseUser) {
            navigate('/login');
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

                // manually added treemember
                if (user.status === 404) {
                    let memberData = await familyTreeService.getFamilyMemberByFamilyMemberId(id);
                    setUserData({
                        id: id,
                        firstName: memberData.firstname || 'Family',
                        lastName: memberData.lastname || 'Member',
                        birthdate: memberData.birthdate || '', 
                        gender: memberData.gender || 'Unspecified',
                    });
                    setOwnAccount(false);
                // user found in db
                } else if (user.ok) { 
                    const fetchedUserData = await user.json();
                    if (fetchedUserData?.auth_uid) {
                        await checkOwnAccount();
                        console.log('Checked own account for auth_uid:', fetchedUserData.auth_uid, 'vs', supabaseUser?.id);
                        if (ownAccount) return;
                    }

                    // not the owner account
                    console.log('Fetched Supabase existing user data', fetchedUserData);
                    setUserData({
                        id: id,
                        firstName: fetchedUserData.firstname || 'User',
                        lastName: fetchedUserData.lastname || '',
                        email: fetchedUserData.email || '',
                        birthdate: fetchedUserData.birthdate || '',
                        gender: fetchedUserData.gender || 'Unspecified',
                        auth_uid: fetchedUserData.auth_uid || ''
                    });
                }
                else {
                    throw new Error( user.json().error || 'User not found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error.message);
                setErrorMessage(error.message);
                setUserData({
                    id: id,
                    firstName: 'Unknown',
                    lastName: 'User',
                    email: '',
                });
                setRelationshipType('No relationship found');
            }
        };

        const checkOwnAccount = () => {
            // Check if this is the current logged in Account user
            if (userData?.auth_uid === supabaseUser?.id) {
                console.log('This is the owner account');
                setUserData({
                    id: userData.id,
                    firstName: supabaseUser.user_metadata?.first_name || 'User',
                    lastName: supabaseUser.user_metadata?.last_name || '',
                    email: supabaseUser.email,
                    birthdate: supabaseUser.user_metadata?.birthdate || '',
                    address: supabaseUser.user_metadata?.address || '',
                    city: supabaseUser.user_metadata?.city || '',
                    state: supabaseUser.user_metadata?.state || '',
                    country: supabaseUser.user_metadata?.country || '',
                    phone_number: supabaseUser.user_metadata?.phone_number || '',
                    zipcode: supabaseUser.user_metadata?.zipcode || '',
                    gender: supabaseUser.user_metadata?.gender || '',
                    auth_uid: supabaseUser.id
                });
                setOwnAccount(true);
                return;
            }
            else {
                console.log('This is NOT the owner account');
                setOwnAccount(false);
                return;
            }
        };

        fetchUserData();

    }, [currentAccountID, id, ownAccount, supabaseUser, userData?.auth_uid, userData.id]);
    
    // determine relationship type
    useEffect(() => {
        if (!id || !supabaseUser?.id) return;
        if (ownAccount) setRelationshipType('You');
        // if not self, determine relationship to user
        // get current account's family treememberid and viewed account's family treememberid
        const fetchRelationship = async () => {
            let treeUserId = null;
            let treeMemberId = null;
            
            try {
                const treeData = await familyTreeService.getFamilyMembersByUserId(currentAccountID);
                
                for (let i = 0; i < treeData.length; i++) {
                    if (treeData[i].userid === parseInt(currentAccountID) && treeData[i].memberuserid === parseInt(currentAccountID)) {
                        treeUserId = treeData[i].id;
                        console.log("treeUserId (current signed in user) found:", treeUserId);
                    }
                    if (treeData[i].memberuserid === parseInt(id) && treeData[i].userid === parseInt(currentAccountID)) {
                        treeMemberId = treeData[i].id;
                        console.log("treeMemberId (existing user) found:", treeMemberId);
                    }
                    if (treeData[i].id === parseInt(id) && treeData[i].userid === parseInt(currentAccountID)) {
                        treeMemberId = treeData[i].id;
                        console.log("treeMemberId (manual member) found:", treeMemberId);
                    }
                }
                
                if (!treeUserId || !treeMemberId) {
                    console.log("Could not find both tree member IDs");
                    return;
                }

                console.log("treeUserId:", treeUserId, "treeMemberId:", treeMemberId);

                const response = await fetch(`http://localhost:5000/api/relationships/user/${currentAccountID}`, requestOptions);
                
                if (response.ok) {
                    let relationships = await response.json();
                    console.log("relationships", relationships);
                    
                    for (let i = 0; i < relationships.length; i++) {
                        if(relationships[i].person1_id === parseInt(treeUserId) && relationships[i].person2_id === parseInt(treeMemberId)) {
                            // this is the relationship
                            setRelationshipType(relationships[i].relationshiptype);
                            return;
                        }
                    }
                } else {
                    setErrorMessage('Error fetching relationships');
                    setRelationshipType('No relationship found');
                    console.log('Error fetching relationships:', response.error);
                }
            } catch (error) {
                setErrorMessage(error.message);
                console.error('Error in fetchRelationship:', error.message);
            }
        };

        fetchRelationship();

        }, [id, currentAccountID, userData.id, supabaseUser?.id, ownAccount]);

    // check if user exists in tree
    useEffect(() => {
        if (!id || !supabaseUser?.id) return;
        setErrorMessage('');

        const checkExistsInTree = async () => {
            try {
                const treeData = await familyTreeService.getFamilyTreeByUserId(currentAccountID)

                for (let i = 0; i < treeData.length; i++) {
                    if (Number(treeData[i].id) === Number(id)) {
                        console.log("account exists in user's tree");
                        setExistsInTree(true);
                        return;
                    }
                    else {
                        setExistsInTree(false);
                        console.log("account does not exist in user's tree");
                    }
                }
            } catch (error) {
                console.error("Error checking if account exists in tree:", error);
            }
        }
        checkExistsInTree();
    }, [currentAccountID, id, supabaseUser?.id]);

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <div style={{width: '150px'}}></div>
            <div style={styles.RightSide}>
                
            <div style={styles.ContainerStyle}>
                {/* Error message display */}
                  {errorMessage && (
                    <div style={{ 
                      backgroundColor: '#ffebee', 
                      color: '#c62828', 
                      padding: '10px', 
                      borderRadius: '5px', 
                      margin: '10px',
                      textAlign: 'center',
                      fontFamily: 'Alata',
                      border: '1px solid #ef5350'
                    }}>
                      {errorMessage}
                    </div>
                  )}
                <div style={styles.HeadingContentStyle}>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                            <h1 style={styles.HeaderStyle}>{userData?.firstName} {userData?.lastName}</h1>
                            <p>{ownAccount ? "You" : (relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1))}</p>
                        </div>
                        
                        {/* if someone else's account, show buttons */}
                        {!ownAccount && (
                            <div style={styles.ButtonGroupStyle}>
                                <AddToTreePopup trigger={<button style={existsInTree ? styles.DisabledGreenButtonStyle : styles.GreenButtonStyle} 
                                                disabled={existsInTree}>Add To Tree</button>} 
                                                accountUserName={`${userData.firstName} ${userData.lastName}`} 
                                                accountUserId={id} 
                                                userId={currentAccountID} 
                                                currentUserAccountRelationshipType={relationshipType}
                                                gender={userData.gender} 
                                            />
                                <button style={existsInTree ? styles.GreenButtonStyle : styles.DisabledGreenButtonStyle}>Remove from Tree</button>
                            </div>
                        )}
                    </div>

                    {/* divider line */}
                    <hr style={{ width: '100%', border: '1px solid #000', margin: '1px 0' }} />
                </div>

                {/* User Information Section */}
                <div style={{padding: '20px 0'}}>
                    <h2 style={{fontFamily: 'Alata', fontSize: '20px', marginBottom: '15px', color: '#3a5a40'}}>Profile Information</h2>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px'}}>
                        {/* Basic Info */}
                        <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px'}}>
                            <h3 style={{fontFamily: 'Alata', fontSize: '16px', marginBottom: '10px', color: '#3a5a40'}}>Basic Information</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                <div><strong>Email:</strong> {userData?.email || 'Not provided'}</div>
                                {userData?.birthdate && <div><strong>Birth Date:</strong> {new Date(userData.birthdate).toLocaleDateString()}</div>}
                                {userData?.phone_number && <div><strong>Phone:</strong> {userData.phone_number}</div>}
                            </div>
                        </div>

                        {/* Address Info */}
                        <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px'}}>
                            <h3 style={{fontFamily: 'Alata', fontSize: '16px', marginBottom: '10px', color: '#3a5a40'}}>Address Information</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {userData?.address && <div><strong>Address:</strong> {userData.address}</div>}
                                {(userData?.city || userData?.state) && (
                                    <div><strong>City, State:</strong> {[userData.city, userData.state].filter(Boolean).join(', ')}</div>
                                )}
                                {userData?.zipcode && <div><strong>ZIP Code:</strong> {userData.zipcode}</div>}
                                {userData?.country && <div><strong>Country:</strong> {userData.country}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Show message if no additional info is available */}
                    {ownAccount && !userData?.birthdate && !userData?.phone_number && !userData?.address && !userData?.city && !userData?.state && !userData?.zipcode && !userData?.country && (
                        <div style={{textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic'}}>
                            No additional profile information available. Update your profile to add more details.
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    )
}

export default Account;