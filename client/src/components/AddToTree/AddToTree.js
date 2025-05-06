import { React, useState, useEffect, useRef } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context

//                                 john              jane            parent                  jane is john's mom
function AddTreeMember (userId, accountUserId, relativeUserId, relativeRelationship, accountUserName, treeData, results, currentAccountID) {
  const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));

  // maybe - check if account user is already in tree, return error if they are (user will need to delete them and re-add)

  console.log("relative " + relativeUserId);
  console.log("account " + accountUserId);
  console.log(results.current.find(result => Number(result.id) === Number(accountUserId)))

  // intialize user in tree
  treeIndex[`${accountUserId}`] = {
      "id": `${accountUserId}`,
      "rels": {
        "children": [],
        "spouses": [],
      },
      "data": {
        "first name": `${accountUserName.split(" ")[0]}`,
        "last name": `${accountUserName.split(" ")[1]}`,
        "gender": `${results.current.find(result => Number(result.id) === Number(accountUserId))["gender"]}`
      }
    }


  if(relativeRelationship === "parent"){
    // add account user as child to relative
    treeIndex[`${relativeUserId}`]["rels"]["children"].push(`${accountUserId}`);
    // add relative as parent to account user
    if(treeIndex[`${relativeUserId}`]["data"]["gender"] === "M") {
      treeIndex[`${accountUserId}`]["rels"]["father"] = `${relativeUserId}`;
    }
    else if(treeIndex[`${relativeUserId}`]["data"]["gender"] === "F") {
      treeIndex[`${accountUserId}`]["rels"]["mother"] = `${relativeUserId}`;
    }
    else{
      console.log("no gender found");
    }
    // add relative's spouse(s) (if any) as parent to account user
    treeIndex[`${relativeUserId}`]["rels"]["spouses"].forEach(spouse => {
      if(treeIndex[`${spouse}`]["data"]["gender"] === "M") {
        treeIndex[`${accountUserId}`]["rels"]["father"] = `${spouse}`;
      }
      else if(treeIndex[`${spouse}`]["data"]["gender"] === "F") {
        treeIndex[`${accountUserId}`]["rels"]["mother"] = `${spouse}`;
      }
      else {
        console.log("no gender found");
      }
    });
    // add account user as child to relative's spouse(s) (if any)
    treeIndex[`${relativeUserId}`]["rels"]["spouses"].forEach(spouse => {
      treeIndex[`${spouse}`]["rels"]["children"].push(`${accountUserId}`);
    });
  }

  else if(relativeRelationship === "child") {
    // add account user as parent to relative
    if(treeIndex[`${accountUserId}`]["data"]["gender"] === "M"){
      treeIndex[`${relativeUserId}`]["rels"]["father"] = `${accountUserId}`;
    }
    else if(treeIndex[`${accountUserId}`]["data"]["gender"] === "F"){
      treeIndex[`${relativeUserId}`]["rels"]["mother"] = `${accountUserId}`;
    }
    else{
      console.log("no gender found");
    }
    // add relative as child to account user
    treeIndex[`${accountUserId}`]["rels"]["children"].push(`${relativeUserId}`);
    // add account user as spouse to relative's existing parent(s) (if any) + make account user parent of relative's siblings (if any)
    if(treeIndex[`${relativeUserId}`]["rels"]["father"] !== undefined && treeIndex[`${accountUserId}`]["data"]["gender"] === "F") { // make account user the wife
      treeIndex[`${relativeUserId}`["rels"]["father"]]["rels"]["spouses"].push(`${accountUserId}`);
      treeIndex[`${relativeUserId}`["rels"]["father"]]["rels"]["children"].forEach(child => { // make account user mother of relative's siblings
        if(child !== `${relativeUserId}`) {
          treeIndex[`${child}`]["rels"]["mother"] = `${accountUserId}`;
        }
      });
    }
    else if(treeIndex[`${relativeUserId}`]["rels"]["mother"] !== undefined && treeIndex[`${accountUserId}`]["data"]["gender"] === "M"){ // make account user the husband
      treeIndex[`${relativeUserId}`["rels"]["mother"]]["rels"]["spouses"].push(`${accountUserId}`);
      treeIndex[`${relativeUserId}`["rels"]["father"]]["rels"]["children"].forEach(child => { // make account user father of relative's siblings
        if(child !== `${relativeUserId}`) {
          treeIndex[`${child}`]["rels"]["father"] = `${accountUserId}`;
        }
      });
    }
    else{
      console.log("no gender found or no existing parent");
    }
  }

  else if(relativeRelationship === "sibling") {
    // add account user as child to relative's parent(s)
    if(treeIndex[`${relativeUserId}`]["rels"]["father"] !== undefined) {
      treeIndex[`${relativeUserId}`["rels"]["father"]]["rels"]["children"].push(`${accountUserId}`);
      treeIndex[`${accountUserId}`]["rels"]["father"] = `${treeIndex[`${relativeUserId}`]["rels"]["father"]}`;
    }
    if(treeIndex[`${relativeUserId}`]["rels"]["mother"] !== undefined) {
      treeIndex[`${relativeUserId}`["rels"]["mother"]]["rels"]["children"].push(`${accountUserId}`);
      treeIndex[`${accountUserId}`]["rels"]["mother"] = `${treeIndex[`${relativeUserId}`]["rels"]["mother"]}`;
    }
  }

  else if(relativeRelationship === "spouse") {
    // add account user as spouse to relative
    treeIndex[`${relativeUserId}`]["rels"]["spouses"].push(`${accountUserId}`);
    // add relative as spouse to account user
    treeIndex[`${accountUserId}`]["rels"]["spouses"].push(`${relativeUserId}`);
    // add account user as parent to relative's children (if any)
    treeIndex[`${relativeUserId}`]["rels"]["children"].forEach(child => {
      if(treeIndex[`${accountUserId}`]["data"]["gender"] === "M") {
        treeIndex[`${child}`]["rels"]["father"] = `${accountUserId}`;
      }
      else if(treeIndex[`${accountUserId}`]["data"]["gender"] === "F"){
        treeIndex[`${child}`]["rels"]["mother"] = `${accountUserId}`;
      }
      treeIndex[`${accountUserId}`]["rels"]["children"].push(`${child}`);
    });
  }

  else {
    console.log("Error: invalid relationship type");
  }

  let updatedTreeData = Object.values(treeIndex);
  console.log(treeData);
  console.log(updatedTreeData);

  let requestOptions = {
    method: 'PUT', // TODO change this back to PUT
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTreeData)
  };
  fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`, requestOptions)
    .then(async(response) => {
        if (response.ok) {
          console.log("Tree object updated successfully");
        }
        else{
          console.error('Error:', response);
        }
    });
}

function AddToTreePopup({ trigger, accountUserName, accountUserId, currentUserAccountRelationshipType, userId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
            console.log(results.current);
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
              console.log(responseData.object);
              setTreeData(responseData.object);
            }
            else {
              console.error('Error:', response);
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
  }, [treeData, results.current]);

    // form
    const {
        register,
        reset,
        watch,
        handleSubmit,
    } = useForm({defaultValues: {selectedMember: '', memberRelationshipType: ''}});

    let selectedMember = watch("selectedMember");

    const onSubmit = async (data, close) => {
        console.log(data);
        reset();
        close();
        // Wait for the API request to complete
        const response = await fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          // Parse the response and update `treeData`
          const treeResponse = await response.json();
          setTreeData(treeResponse.object);
          console.log(treeData);

          // Call AddTreeMember after the API request is complete
          return AddTreeMember(userId, accountUserId, data.selectedMember, data.memberRelationshipType, accountUserName, treeData, results, currentAccountID);
        } 
        else {
            // Handle errors from the API
            const errorData = await response.json();
            console.error('Error:', errorData.message);
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
            <button onClick={() => { reset(); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
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
                            What is this person's relationship to {accountUserName}?
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