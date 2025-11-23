import { React, useState, useEffect, useRef } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { set, useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context
import { addRelationship }from '../../utils/relationUtil.js';
import { familyTreeService } from '../../services/familyTreeService';

//                                 john              jane            parent                  jane is john's mom
async function AddTreeMember (userId, accountUserId, relativeUserId, relativeRelationship, accountUserName, treeData, results, currentAccountID, gender) {
  const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));
  // maybe - check if account user is already in tree, return error if they are (user will need to delete them and re-add)
  console.log(treeIndex);
  // Link relative to user; 
  console.log("relative id" + relativeUserId);
  console.log("account id" + accountUserId);
  console.log("Initializing treeIndex:", treeIndex);

  if (treeIndex[`${accountUserId}`]) {
    throw new Error(`${accountUserName} is already in your family tree.`); // Re-throw the error to be caught by onSubmit
  }
  // Initialize user in tree
  treeIndex[`${accountUserId}`] = {
      "id": `${accountUserId}`,
      "data": {
        "first name": `${accountUserName.split(" ")[0]}`,
        "last name": `${accountUserName.split(" ")[1]}`,
        "gender": `${gender}`
      },
      "rels": {}
    };

  try {
    // Add the primary relationship
    // TODO: Figure out if this is necessary given that family-chart does this automatically
    await addRelationship(treeIndex, accountUserId, relativeUserId, relativeRelationship);
    
    // Update the tree info in the database in order of addition
    let updatedTreeData = [...treeData];
    const newAccountUser = treeIndex[`${accountUserId}`];
    updatedTreeData.push(newAccountUser);

    console.log("Updated tree data after adding relationship:", updatedTreeData);
    await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);
  } catch (error) {
    console.error("Error updating tree info:", error.message);
    throw new Error("Error updating your tree."); // Re-throw the error to be caught by onSubmit
  }
}

                          // populated from Account.js
function AddToTreePopup({ trigger, accountUserName, accountUserId, currentUserAccountRelationshipType, userId, gender }) {
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
      try { 
        // get family members
        results.current = await familyTreeService.getFamilyMembersByUserId(currentAccountID)
        console.log("Results.current members:", results.current);
      
        // get tree data
        const data = await familyTreeService.getFamilyTreeByUserId(currentAccountID);
        setTreeData(data);
        console.log("Fetched tree data:", data);
      } catch (error) {
        setErrorMessage("Error getting tree data: " + error.message);
        return;
      }
    }
    fetchResults();
  }, [currentAccountID]);

  useEffect(() => {
    if (!treeData || !results.current.length) {
        console.log("treeData or results.current is empty");
        return;
    }

    // populate filteredResults
    if (Array.isArray(treeData)) {
      try {
          filteredResults.current = results.current.filter(obj1 =>
              treeData.some(obj2 => Number(obj2.id) === (Number(obj1.memberuserid) || Number(obj1.id)))
          );
          console.log("Filtered Results:", filteredResults.current);
        } catch (error) {
            console.error("Error parsing treeData:", error);
            return;
        }
      }
      
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
            await AddTreeMember(userId, accountUserId, data.selectedMember, data.memberRelationshipType, accountUserName, treeData, results, currentAccountID, gender);
            reset();
            close();
            return window.location.href = `/tree`;
        } catch (error) {
            console.error("Error adding member to tree:", error.message);
            setErrorMessage(error.message || "Failed to add member to tree." );
            return;
        }
    };

    // populate search results
    useEffect(() => {
        const fetchResults = () => {
          const filtered = filteredResults.current.filter(member => 
              member.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || 
              member.lastname.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSearchResults(filtered); // update searchResults with the filtered array
          // console.log("Filtered Search Results:", filtered);
      };
    
        fetchResults();
      }, [searchTerm, selectedMember, accountUserId]);

    useEffect(() => {
      reset({ selectedMember: "" });
      setSearchResults([]);
      setErrorMessage("");
      setSearchTerm("");
    }, [reset]);

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
                      <div key={result?.memberuserid ? result?.memberuserid : result.id} style={styles.ListingStyle}>
                        <label>
                          <input
                            type="radio"
                            name="selectedMember"
                            value={result?.memberuserid ? result?.memberuserid : result.id}
                            {...register("selectedMember", { required: true })}
                          />
                          <Link to={`/account/${result?.memberuserid ? result?.memberuserid : result.id}`} style={{ marginLeft: '10px' }}>
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