import { React, useState, useEffect, useRef } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context
import { addRelationship }from '../../utils/treeUtils.js';

//                                 john              jane            parent                  jane is john's mom
function AddTreeMember (userId, accountUserId, relativeUserId, relativeRelationship, accountUserName, treeData, results, currentAccountID) {
  const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));

  // maybe - check if account user is already in tree, return error if they are (user will need to delete them and re-add)

  // Link relative to user; 
  console.log("relative " + relativeUserId);
  console.log("account " + accountUserId);
  console.log(results.current.find(result => Number(result.id) === Number(accountUserId)))

  // Initialize user in tree
  treeIndex[`${accountUserId}`] = {
      "id": `${accountUserId}`,
      "rels": {
        "children": [],
        "spouses": [],
      },
      "data": {
        "first name": `${accountUserName.split(" ")[0]}`,
        "gender": `${results.current.find(result => Number(result.id) === Number(accountUserId))["gender"]}`
      }
    }

  // Add the primary relationship
  try {
    addRelationship(treeIndex, accountUserId, relativeUserId, relativeRelationship);
  } catch (error) {
    throw new Error(error.message); // Re-throw the error to be caught by onSubmit
  }

  let updatedTreeData = Object.values(treeIndex);
  console.log(treeData);
  console.log(updatedTreeData);

  let requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTreeData)
  };

  return fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`, requestOptions)
    .then(async(response) => {
        if (response.ok) {
          console.log("Tree object updated successfully");
          return true;
        }
        else{
          console.error('Error:', response);
          return false;
        }
    });
}

function AddToTreePopup({ trigger, accountUserName, accountUserId, currentUserAccountRelationshipType, userId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  var results = useRef([]);
  var filteredResults = useRef([]);
  const { currentAccountID } = useCurrentUser();
  const [treeData, setTreeData] = useState([]);
    
  // retrieve a list of all family members that are within the tree object
  useEffect(() => {
    const fetchResults = async () => {
      fetch(`http://localhost:5000/api/family-members/user/${currentAccountID}`)
        .then(async(response) => {
          if (response.ok) {
            results.current = await response.json();
            console.log('AddToTree Current Family Members:', results.current);
          }
          else {
            console.log('Error:', response);
          }
        })
        .then(() => {
        // grab tree object
        fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`)
          .then(async(response) => {
            if (response.ok) {
              let responseData = await response.json();
              console.log('AddToTree Current Tree Object Data:', responseData.object);
              setTreeData(responseData.object);
            }
            else {
              console.error('Error:', response);
              throw new Error('Error fetching tree data');
            }
          });
      })
    }
    fetchResults();
  }, [currentAccountID]);

  useEffect(() => {
    if (!treeData || !results.current.length) {
        console.log("treeData or results.current is empty");
        return;
    }

    // populate filteredResults
    filteredResults.current = results.current.filter((result) =>
      treeData.map((person) => Number(person.id)).includes(Number(result.id))
    );

    console.log("Filtered Results:", filteredResults.current);
  }, [treeData]);

    // form
    const {
        register,
        reset,
        watch,
        handleSubmit,
    } = useForm({defaultValues: {selectedMember: '', memberRelationshipType: ''}});

    let selectedMember = watch("selectedMember");

    const onSubmit = async (data, close) => {
        console.log("Submission data:", data);
        setErrorMessage(""); // Clear any previous error messages
        
        try {
            const result = await AddTreeMember(userId, accountUserId, data.selectedMember, data.memberRelationshipType, accountUserName, treeData, results, currentAccountID);
            if (!result) {
                setErrorMessage("Failed to update tree data.");
                return;
            }
            reset();
            close();
            return window.location.href = `/tree`;
        } catch (error) {
            console.error("Error adding member to tree:", error.message);
            setErrorMessage(error.message || "Failed to add member to tree.");
            return;
        }
    };

    // populate search results
    useEffect(() => {
        if (searchTerm === "") {
          setSearchResults([]);
          reset({ selectedMember: "" });
          return;
        }
    
        const fetchResults = () => {
          const filtered = filteredResults.current.filter(member => 
              member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
              member.lastName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSearchResults(filtered); // update searchResults with the filtered array
          // console.log("Filtered Search Results:", filtered);
      };
    
        fetchResults();
      }, [searchTerm, reset, selectedMember, accountUserId]);

      useEffect(() => {
        reset({ selectedMember: "" });
      }, [reset, searchTerm]);

  return (
    <Popup trigger={trigger} modal>
      {close => (
        <div style={styles.DefaultStyle}>
        {/* close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { reset(); setErrorMessage(""); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <CloseIcon style={{ width: '40px', height: '40px', margin: '10px 10px 0px 10px' }} />
            </button>
        </div>
          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <ul style={styles.ListStyle}>

                <div style={{ textAlign: 'center', fontFamily: 'Alata' , width: '100%'}}>
                  <h2 style={{margin: '0px'}}>Add to Tree</h2>
                    <p>To add {accountUserName} to your family tree, select an existing user on your family tree that is directly related to {accountUserName}.</p>
                </div>

                {/* divider line */}
                <hr style={{ width: '100%', border: '1px solid #000', margin: '10px 0' }} />
                
               {/* search for existing user */}
               <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <input
                      type="text"
                      placeholder="Search for a family member..."
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'Alata', margin: '10px' }}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* search results */}
                <div style={styles.AddOptionsStyle}>
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <div key={result?.id} style={styles.ListingStyle}>
                        <label>
                          <input
                            type="radio"
                            name="selectedMember"
                            value={result?.id}
                            {...register("selectedMember", { required: true })}
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

                {/* dropdown for relationship of this member to existing member */}
                <div style={{display: selectedMember === "" ? "none" : "flex"}}>
                    <li style={styles.ItemStyle}>
                        <label style={{ marginBottom: '10px' }}>
                            What is their relationship to {accountUserName}?
                        </label>
                        <select {...register("memberRelationshipType", { required: selectedMember !== null })} >
                                <option value="" disabled hidden>Select</option>
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                            </select>
                    </li>
                </div>
                {errorMessage && (
                    <div style={{ 
                        color: 'red', 
                        textAlign: 'center', 
                        padding: '10px',
                        marginTop: '10px',
                        fontFamily: 'Alata',
                        width: '100%'
                    }}>
                        {errorMessage}
                    </div>
                )}

            </ul>
            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle}>Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default AddToTreePopup;