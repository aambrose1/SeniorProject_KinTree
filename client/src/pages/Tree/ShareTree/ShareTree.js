import React, { useState, useEffect } from 'react';
import * as styles from './styles';
import { set, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';

function ShareTree() {
    const [searchTerm, setSearchTerm] = useState("");
    const [allSearchResults, setAllSearchResults] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [userData, setUserData] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    // const [email, setEmail] = useState("");
    const [treeInfo, setTreeInfo] = useState([]);
    const { register, handleSubmit, setValue } = useForm();

    const { currentUserID, currentAccountID } = useCurrentUser();

    async function onSubmitForm (data){
        console.log('Form data:', data);
        console.log('Selected member:', data.selectedMember);
        console.log('treeInfo:', treeInfo);
        fetch(`http://localhost:5000/api/share-trees/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senderID: currentAccountID,
                receiverID: data.selectedMember, // this will have to be a member ID
                recieverEmail: data.email,
                // comments: data.comments,
                perms: "view",
                parentalSide: "both",
                treeInfo: JSON.stringify(treeInfo),
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

    useEffect(() => {
        if (searchTerm === "") {
            setSearchResults([]);
            setSelectedMember(null);
            // setEmail("");
            return;
        }

        // retrieve family members
        const fetchResults = async () => {
            fetch(`http://localhost:5000/api/family-members/user/${currentAccountID}`)
            .then(async (response) => {
                if (response.ok) {
                    let responseData = await response.json();
                    console.log(responseData);
                    setAllSearchResults(responseData);
                    setSearchResults(responseData?.filter(member => member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || member.lastName.toLowerCase().includes(searchTerm.toLowerCase())));
                    setSelectedMember(null);
                    // setEmail("");
                } 
                else {
                    console.log('Error:', response);
                }
            });

            fetch(`http://localhost:5000/api/auth/users`)
            .then(async (response) => {
                if (response.ok) {
                    let responseData = await response.json();
                    console.log(responseData);
                    setUserData(responseData);
                } 
                else {
                    console.log('Error:', response);
                }
            });

            fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`)
            .then(async (response) => {
                if (response.ok) {
                    let responseData = await response.json();
                    console.log(responseData.object);
                    setTreeInfo(responseData.object);
                }
                else {
                    let errorData = await response.json();
                    console.log('Error:', errorData);
                }
            });
        };

        fetchResults();
    }, [searchTerm]);

    const handleRadioChange = (result) => {
        const selectedUser = userData.find(user => Number(user.id) === Number(allSearchResults.find(member => Number(member.id) === Number(result))?.memberUserId));
        if (selectedUser) {
            setValue("email", selectedUser.email);
        } 
        else {
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

                        {/* search results */}
                        <div style={styles.AddOptionsStyle}>
                        {searchResults?.length > 0 ? (
                            searchResults.map(result => (
                            <div key={result.id} style={styles.ListingStyle}>
                                <label>
                                <input
                                    type="radio"
                                    name="selectedMember"
                                    value={result.id}
                                    {...register("selectedMember", {
                                        required: true,
                                        onChange: (e) => handleRadioChange(e.target.value),
                                    })}
    
                                />
                                <Link to={`/account/${result.id}`} style={{ marginLeft: '10px' }}>
                                    {result.firstName} {result.lastName}
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

                        <li style={styles.ItemStyle}>
                            <label>Email Address:</label>
                            <input
                                {...register("email", { required: true })}
                                type="text"
                                defaultValue=""
                                // value={email || ""} // Dynamically update the value
                                // onChange={e => setEmail(e.target.value)} // Allow the user to edit the value
                                style={styles.FieldStyle}
                            />
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