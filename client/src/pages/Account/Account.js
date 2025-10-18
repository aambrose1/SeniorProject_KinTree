import { React, useEffect, useState } from 'react';
import * as styles from './styles';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import AddToTreePopup from '../../components/AddToTree/AddToTree';
import { CurrentUserProvider, useCurrentUser } from '../../contexts/CurrentUserContext';

function Account() {
    const [ownAccount, setOwnAccount] = useState(false); // will be retrieved
    const [existsInTree, setExistsInTree] = useState(false); // will be retrieved
    const [relationshipType, setRelationshipType] = useState(''); // will be retrieved

    const { currentUserID, fetchCurrentUserID, currentAccountID } = useCurrentUser();
    useEffect(() => {
        // define a regular function to call the async function
        const fetchData = async () => {
            await fetchCurrentUserID();
        };
    
        fetchData();
    }, [fetchCurrentUserID]);
    // takes id from url path
    let { id } = useParams();

    // if no id is provided, retrieve current user's id and show that page
    useEffect(() => {
        if (!id) {
            id = currentUserID;
            setOwnAccount(true);
            window.location.href = `/account/${currentUserID}`;
        }
    }, [id, currentUserID]);

    // TODO: query for data of account user & verify that userID of logged in user matches

    const [userData, setUserData] = useState({
        id: id,
        username: 'Loading...',
    })

    // fetch user info
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // find this person's account info
    useEffect(() => {
        if (!id) return;

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(`http://localhost:5000/api/family-members/${id}`, requestOptions)
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    console.error('Error fetching user data:', response);
                }
            })
            .catch((error) => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }, [id]);
        
    useEffect(() => {
        if(!userData.memberUserId){
            setOwnAccount(false);
        }
        else if(userData.userId === userData.memberUserId) {
            // don't fetch relationship
            setOwnAccount(true);
            return;
        }
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
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
                            return; // check this
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
        }, [id, currentUserID, userData.id]);

    // check if user exists in tree
    useEffect(() => {
        if (!id || !currentAccountID) return;

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`, requestOptions)
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
    }, [id, currentAccountID]);

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
                                <AddToTreePopup trigger={<button style={existsInTree ? styles.DisabledGreenButtonStyle : styles.GreenButtonStyle} disabled={existsInTree}>Add To Tree</button>} accountUserName={userData.firstName} accountUserId={id} userId={currentUserID} currentUserAccountRelationshipType={relationshipType} />
                                <button style={existsInTree ? styles.GreenButtonStyle : styles.DisabledGreenButtonStyle}>Remove from Tree</button>
                            </div>
                        )}
                    </div>

                    {/* divider line */}
                    <hr style={{ width: '100%', border: '1px solid #000', margin: '1px 0' }} />
                </div>
            </div>
            </div>
        </div>
    )
}

export default Account;