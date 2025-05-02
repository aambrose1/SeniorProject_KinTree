import { React, useEffect } from 'react';
import * as styles from './styles';
import { Link, useParams } from 'react-router-dom';
import AddToTreePopup from '../../components/AddToTree/AddToTree';
import { useCurrentUser } from '../../CurrentUserProvider';

function Account() {

    const { currentUser, fetchCurrentUser } = useCurrentUser();
    useEffect(() => fetchCurrentUser(), []);
    // takes id from url path
    const { id } = useParams();

    // query for data of account user & verify that userID of logged in user matches

    // hard coding for now -- TODO replace with real retrieval from treeMembers
    var userData = {
        id: id,
        username: 'Jessie Smith',
        password: '',
        email: 'jsmith@gmail.com',
    };
    var ownAccount = false; // this will be checked against the current user service
    var relationshipType = 'Sibling'; // will be retrieved
    var existsInTree = false; // will be retrieved

    // fetch user info
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    // TODO this endpoint does not exist
    // find this person's account info
    fetch(`http://localhost:5000/api/auth/users/${id}`, requestOptions)
        .then(async(response) => {
            if (response.ok) {
                userData = await response.json();
            } 
            else {
                console.error('Error:', response);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        })
        // determine how they are related
        .then(async() => {
            // if looking at own account
            if(userData.id === currentUser.id) {
                // process differently -- don't fetch relationship
                ownAccount = true;
            }
            else {
                // determine person's relationship to user
                fetch(`http://localhost:5000/api/auth/relationships/${id}`, requestOptions)
                .then(async(response) => {
                    if (response.ok) {
                        let relationships = await response.json();
                        for (let i = 0; i < relationships.length; i++) {
                            if(relationships[i].person1_id === currentUser.id || relationships[i].person2_id === currentUser.id) {
                                // this is the relationship
                                relationshipType = relationships[i].relationshipType;
                                return; // check this
                            }
                        }
                    } 
                    else {
                        // print message in return body
                        const errorData = await response.json();
                        console.error('Error:', errorData.message);
                        // show error message to user
                        // alert(errorData.message);
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                })
            }
        });

    // check if user is in tree already -- TODO this endpoint does not exist
    fetch(`http://localhost:5000/api/auth/family-members/${currentUser.id}`, requestOptions)
        .then(async(response) => {
            if (response.ok) {
                let treeMembers = await response.json();
                for (let i = 0; i < treeMembers.length; i++) {
                    if(treeMembers[i].userId === userData.id) { // if a tree member shares account id, then they're already in the user's tree
                        existsInTree = true;
                    }
                }
            }
            else {
                // print message in return body
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                // show error message to user
                // alert(errorData.message);
            }
        });


    return (
        <div style={styles.DefaultStyle}>
            <div style={{display: 'flex', justifyContent: 'flex-start', width: '100%'}}>
                <Link to="/tree" >Back to Tree</Link>
            </div>

            <div style={styles.ContainerStyle}>
                <div style={styles.HeadingContentStyle}>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                            <h1 style={styles.HeaderStyle}>{userData.username}</h1>
                            <p>{ownAccount ? "You" : (relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1))}</p>
                        </div>
                        
                        {/* if someone else's account, show buttons */}
                        {!ownAccount && (
                            <div style={styles.ButtonGroupStyle}>
                                <AddToTreePopup trigger={<button style={existsInTree ? styles.DisabledGreenButtonStyle : styles.GreenButtonStyle} disabled={existsInTree}>Add To Tree</button>} accountUserName={userData.username} accountUserId={id} userId={currentUser.id} currentUserAccountRelationshipType={relationshipType} />
                                <button style={existsInTree ? styles.GreenButtonStyle : styles.DisabledGreenButtonStyle}>Remove from Tree</button>
                            </div>
                        )}
                    </div>

                    {/* divider line */}
                    <hr style={{ width: '100%', border: '1px solid #000', margin: '1px 0' }} />
                </div>
            </div>
        </div>
    )
}

export default Account;