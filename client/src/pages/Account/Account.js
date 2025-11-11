import { React, useEffect, useState } from 'react';
import * as styles from './styles';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import AddToTreePopup from '../../components/AddToTree/AddToTree';
import { useCurrentUser } from '../../CurrentUserProvider';
import { set } from 'react-hook-form';

const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
};

function Account() {
    const navigate = useNavigate(); // used to change route without refreshing page, used to prevent infinite refreshes
    const [ownAccount, setOwnAccount] = useState(false); // will be retrieved
    const [existsInTree, setExistsInTree] = useState(false); // will be retrieved
    const [relationshipType, setRelationshipType] = useState(''); // will be retrieved

    const { currentUserID, CurrentAccountID, supabaseUser, loading } = useCurrentUser();
    

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !supabaseUser) {
            navigate('/login');
        }
    }, [loading, supabaseUser, navigate]);
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

    // if no id is provided, retrieve current user's id and show that page
    useEffect(() => {
        if (!id && supabaseUser?.id) {
            // Fetch current user's data
            const fetchOwnUserData = async () => {
                const user = await fetch(`http://localhost:5000/api/auth/user/${supabaseUser.id}`);
                const userData = await user.json();
                setUserData(userData);
                setOwnAccount(true);
                navigate(`/account/${userData.id}`, { replace: true });
            }
            fetchOwnUserData();
        }
      }, [id, supabaseUser?.id, navigate]);

    
    // Fetch user info - check if it's a Supabase user or family member
    useEffect(() => {
        if (!id) return;
        const fetchUserData = async () => {
            try {
                const user = await fetch(`http://localhost:5000/api/auth/user/${id}`); // if the memberuserid matches a user in user db
                if (user.status === 404) { // user not found, so it must be a manually added member
                    // Fetch manually added member data
                    const member = await fetch(`http://localhost:5000/api/family-members/member/${id}`);
                    const memberData = await member.json();
                    setUserData({
                        id: id,
                        firstName: memberData.firstname,
                        lastName: memberData.lastname,
                        email: memberData.email || '',
                        birthdate: memberData.birthdate || '',
                        address: memberData.address || '', 
                        city: memberData.city || '',
                        state: memberData.state || '',
                        country: memberData.country || '',
                        phone_number: memberData.phonenumber || '',
                        zipcode: memberData.zipcode || '',
                        gender: memberData.gender || 'Unspecified'
                    });
                } else if (user.ok) { // user found in user db
                    const userData = await user.json();
                    setUserData(userData);
                    if (userData.auth_uid) {
                        checkOwnAccount();
                        console.log('Checked own account for auth_uid:', userData.auth_uid, 'vs', supabaseUser?.id);
                        if (ownAccount) return;
                    }
                    console.log('Fetched Supabase user data', userData);
                    // TODO: add fields in db for address, phone, etc. since there are not available outside of logged in user_metadata
                    setUserData({
                        id: id,
                        firstName: userData.firstname || 'User',
                        lastName: userData.lastname || '',
                        email: userData.email || '',
                        birthdate: userData.birthdate || '',
                        address: userData.address || '',
                        city: userData.city || '',
                        state: userData.state || '',
                        country: userData.country || '',
                        phone_number: userData.phone_number || '',
                        zipcode: userData.zipcode || '',
                        gender: userData.gender || 'Unspecified',
                        auth_uid: userData.auth_uid || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUserData({
                    id: id,
                    firstName: 'Unknown',
                    lastName: 'User',
                    email: '',
                });
            }
        };
        const checkOwnAccount = () => {
            // Check if this is the current logged in Account user
            if (userData?.auth_uid === supabaseUser?.id) {
                console.log('This is the own account');
                console.log('Supabase user data:', supabaseUser);
                setOwnAccount(true);
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
            }
            else {
                console.log('This is NOT the own account');
                setOwnAccount(false);
            }
        };
        fetchUserData();

    }, [id, supabaseUser, userData.auth_uid]);
    
    // determine relationship type
    useEffect(() => {
        
        // if not self, determine relationship to user
        fetch(`http://localhost:5000/api/relationships/${id}`, requestOptions)
            .then(async(response) => {
                if (response.ok) {
                    let relationships = await response.json(); // [{id: '', relationshipType: ''}, {}, {}]
                    console.log("relationships", relationships);
                    for (let i = 0; i < relationships.length; i++) {
                        if(relationships[i].person1_id === parseInt(currentUserID) && relationships[i].person2_id === parseInt(id)) {
                            // this is the relationship
                            setRelationshipType(relationships[i].relationshipType);
                            return;
                        }
                    }
                } 
                else {
                    // print message in return body
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }, [id, currentUserID, userData.id, supabaseUser?.id]);

    // check if user exists in tree
    useEffect(() => {
        if (!id || !supabaseUser?.id) return;

        fetch(`http://localhost:5000/api/tree-info/${supabaseUser.id}`, requestOptions)
            .then(async (response) => {
                if (response.ok) {
                    console.log("tree info response");
                    const treeMembers = await response.json(); // {id: accountID, object: []}
                    console.log(treeMembers);
                    for (let i = 0; i < treeMembers.object.length; i++) {
                        if (treeMembers.object[i].id === id) {
                            console.log("account exists in user's tree");
                            setExistsInTree(true);
                            return;
                        }
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Error fetching tree info:', errorData.message);
                }
            })
            .catch((error) => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [id, supabaseUser?.id]);

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <div style={{width: '150px'}}></div>

            <div style={styles.RightSide}>
            <div style={styles.ContainerStyle}>
                <div style={styles.HeadingContentStyle}>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                            <h1 style={styles.HeaderStyle}>{userData?.firstName} {userData?.lastName}</h1>
                            <p>{ownAccount ? "You" : (relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1))}</p>
                        </div>
                        
                        {/* if someone else's account, show buttons */}
                        {!ownAccount && (
                            <div style={styles.ButtonGroupStyle}>
                                <AddToTreePopup trigger={<button style={existsInTree ? styles.DisabledGreenButtonStyle : styles.GreenButtonStyle} disabled={existsInTree}>Add To Tree</button>} accountUserName={userData.firstName} accountUserId={id} userId={supabaseUser?.id} currentUserAccountRelationshipType={relationshipType} />
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
                    {!userData?.birthdate && !userData?.phone_number && !userData?.address && !userData?.city && !userData?.state && !userData?.zipcode && !userData?.country && (
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