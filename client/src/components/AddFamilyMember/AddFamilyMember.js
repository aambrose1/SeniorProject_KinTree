import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { set, useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as ImportIcon } from '../../assets/import.svg';
import { useCurrentUser } from '../../CurrentUserProvider';
import { familyTreeService } from '../../services/familyTreeService';

// TODO: make form clear when dismissed by clicking outside of modal
//       make sync contact button functional

function AddFamilyMemberPopup({ trigger, userid }) {
  const [manual, setManual] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUserID, currentAccountID } = useCurrentUser();

  var family = useRef([]);
  var users = useRef([]);

  // first form -- search for existing user
  const {
    register,
    reset,
    watch,
    handleSubmit,
  } = useForm({defaultValues: {selectedMember: '', selectedMemberRelationship: '', matPat: ''}});

  // stored list of family members that require maternal/paternal distinction (maybe shift this to retrieval from backend, so that it can be updated without changing code)
  let matPat = useMemo(() => ["parent", "cousin", "aunt", "uncle", "grandparent", "niece", "nephew"], []);

  // manage mat/pat selector using currently selected relationship type
  const selectedMemberRelationship = watch("selectedMemberRelationship");
  var enableMatPat = useRef(false);
  useEffect(() => {
    if(matPat.includes(selectedMemberRelationship)) {
      enableMatPat.current = true;
    }
    else {
      enableMatPat.current = false;
    }
  }, [selectedMemberRelationship, matPat]);

  // second form -- manually add family member
  const {
    register: register2,
    handleSubmit: handleSubmit2,
  } = useForm({defaultValues: {firstName: '', lastName: '', relationship: '', matPat2: '', location: '', birthday: '', birthplace: '', deathdate: '', gender: ''}});



  // populate search results for existing user search
  useEffect(() => {
    setErrorMessage("");
    // no search term, clear results
    if (searchTerm === "") {
      setSearchResults([]);
      return;
    }

    const fetchResults = async () => {
      // get family members of current user
      try {
        family.current = await familyTreeService.getFamilyMembersByUserId(currentAccountID);
      } catch (error) {
        console.error('Error fetching family members for user', currentAccountID, error.message);
        setErrorMessage(error.message)
        return;
      }

      // populate users list
      try{
        const responseData = await familyTreeService.getRegisteredUsers();
        console.log('Registered users:', responseData);
        users.current = responseData.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !family.current.some(member => member.memberUserId === user.id));
        setSearchResults(users.current);
      } catch (error) {
        console.error('Error fetching users:', error.message);
        setErrorMessage(error.message);
        setSearchResults([]);
        return;
      }
    };

    fetchResults();
  }, [searchTerm, currentAccountID]);



  // reset variables on close
  const closeModal = () => {
    setManual(false);
    setSearchTerm("");
    setSearchResults([]);
    setErrorMessage("");
    reset();
  };

  // form submission (existing user)
  const onSubmitExisting = async (data, close) => {
    console.log("submit attempted");
    console.log("Form data:", data); // Log the form data to see what we're getting
    setErrorMessage("");
    try {
      const selectedUser = users.current.find(user => user.id === Number(data.selectedMember));
      // TODO : fetch metadata for user and add user data to treemember data
      
      if (!selectedUser) {
        setErrorMessage("Selected user not found");
        return;
      }

      const selectedUserData = {
        firstname: selectedUser.firstname,
        lastname: selectedUser.lastname,
        birthdate: selectedUser.birthdate || null,
        deathdate: selectedUser.deathdate || null,
        location: selectedUser.location || null,
        phonenumber: selectedUser.phonenumber || null,
        userid: currentAccountID, // The user adding the family member
        memberuserid: selectedUser.id, // Existing user's ID
        gender: selectedUser.gender || "F" // default for now lol
      };
      
       // get account treemember id
      let treeUser = await familyTreeService.getFamilyMemberByUserId(currentAccountID);
      const treeUserId = treeUser.id;
      console.log(treeUserId, 'user treemember id');
      console.log('current Account ID', currentAccountID);

      // add new member to treemembers table
      const treeMember = await familyTreeService.createFamilyMember(selectedUserData);
      const treeMemberId = treeMember.member.id;
      console.log('added user treeMemberId', treeMemberId);

      // relationship table uses id's from treeMembers table, not user ids!
      let relRequestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_id: treeUserId, // user adding the member (treemember id)
          person2_id: treeMemberId, // added member (treemember id)
          relationshipType: data.selectedMemberRelationship,
          relationshipStatus: "active",
          side: data.matPat || null,
          userId: currentAccountID
        })
      };
      const relResponse = await fetch(`http://localhost:5000/api/relationships/`, relRequestOptions); // add relationship   
      const relData = await relResponse.json();
      if (!relResponse.ok) {
        throw new Error(relData.error || 'Failed to add relationship');
      }

      reset();
      close();

      console.log(relData.message);
      return window.location.href = `/account/${selectedUser.id}`; // redirect to account page

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message);
    }
  };

  // form submission (manual entry)
  const onSubmitManual = async (data, close) => {
    console.log("submit attempted");
    // console.log("Form data:", data);
    setErrorMessage("");
    
    try {
      // add new member to family members table
      let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "firstName": data.firstName,
          "lastName": data.lastName,
          "birthDate": data.birthDate,
          "deathDate": data.deathDate,
          "location": data.location || null,
          "phoneNumber": data.phoneNumber || null,
          "userId": currentUserID, // The user adding the family member
          "memberUserId": null, // manually added members do not have associated user accounts
          "gender": data.gender 
        })
      };

      let treeUserId = currentUserID; // TODO: will retrieve this from a service or something
      let treeMemberId;

      const memberResponse = await fetch(`http://localhost:5000/api/family-members/`, requestOptions);
      const memberData = await memberResponse.json();
      
      if (!memberResponse.ok) {
        throw new Error(memberData.error || 'Failed to add family member');
      }
      
      console.log(memberData.message);
      treeMemberId = memberData.member;

      const relResponse = await fetch(`http://localhost:5000/api/relationships/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_id: treeUserId,
          person2_id: treeMemberId,
          relationshipType: data.relationship,
          relationshipStatus: "active",
          side: data.matPat2 || null,
          userId: userid,
        })
      });
      
      const relData = await relResponse.json();
      
      if (!relResponse.ok) {
        throw new Error(relData.error || 'Failed to add relationship');
      }
      
      console.log(relData.message);
      reset();
      close();
      return window.location.href = `/account/${treeMemberId}`;
      
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message);
    }
  };

  return (
    <Popup trigger={trigger} onClose={closeModal} modal>
      {close => (
        <div style={styles.DefaultStyle}>

          {/* default content */}

          <div style={{ display: manual ? 'none' : 'block' }}>
            {/* close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { reset(); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <CloseIcon style={{ width: '40px', height: '40px', margin: '10px 10px 0px 10px' }} />
              </button>
            </div>

            <form key={1} onSubmit={handleSubmit(data => onSubmitExisting(data, close))}> 
              <div style={styles.MainContainerStyle}>
                <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
                  <h2 style={{ marginTop: '0px', margin: '0' }}>Add Family Member</h2>
                </div>

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
                      <div key={result.id} style={styles.ListingStyle}>
                        <label>
                          <input
                            type="radio"
                            value={result.id}
                            {...register("selectedMember", { required: true })}
                          />
                          <Link to={`/account/${result.id}`} style={{ marginLeft: '10px' }}>
                            {result.username}
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

                {/* select relationship */}
                <div>
                  <label>
                    Relationship:
                    <select {...register("selectedMemberRelationship", { required: true })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }} defaultValue={''}>
                        <option value="" disabled hidden>Select</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="cousin">Cousin</option>
                        <option value="aunt">Aunt</option>
                        <option value="uncle">Uncle</option>
                        <option value="grandparent">Grandparent</option>
                        <option value="grandchild">Grandchild</option>
                        <option value="niece">Niece</option>
                        <option value="nephew">Nephew</option>
                    </select>
                  </label>
                </div>

                <div style={{ marginTop: '10px', display: matPat.includes(selectedMemberRelationship) ? 'block' : 'none' }}>
                  <input type="radio" name="matPat" value="maternal" {...register("matPat", { required: matPat.includes(selectedMemberRelationship) })}/> * Maternal
                  <input type="radio" name="matPat" value="paternal" {...register("matPat", { required: matPat.includes(selectedMemberRelationship) })}/> * Paternal
                </div>

                {/* add button */}
                <div style={styles.ButtonDivStyle}>
                  <button type="submit" disabled={selectedMemberRelationship === null ? true : false} style={styles.ButtonStyle}>Add</button>
                </div>

                <div>
                  <button type="button" onClick={() => {setManual(true);}} style={styles.GrayButtonStyle}>Can't find your family member?</button>
                </div>
              </div>
            </form>

              {/* ----------------------- */}
          </div>

          {/* manual content */}
          
          <div style={{ display: manual ? 'block' : 'none' }}>
            {/* close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { reset(); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <CloseIcon style={{ width: '40px', height: '40px', margin: '10px 10px 0px 10px' }} />
              </button>
            </div>

            {/* fill out info about family member */}
            <form key={2} onSubmit={handleSubmit2(data => onSubmitManual(data, close))} style={styles.FormStyle}>
              <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
                <h2 style={{ marginTop: '0px' }}>Manually Add Family Member</h2>
              </div>
    
              {/* sync contacts button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  {/* TODO create handler, backend (?) */}
                  <button onClick={() => { close(); }} style={styles.GrayButtonStyle}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{display: 'flex', }}>Sync Contact</div>
                          <ImportIcon style={{ width: '20px', height: '20px', margin: '0px 0px 0px 10px' }} />
                      </div>
                      
                  </button>
              </div>

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
    
              <ul style={styles.ListStyle}>
                  {/* required fields */}
                <li style={styles.ItemStyle}>
                  <label>
                    *First Name:
                    <input {...register2("firstName", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    *Last Name:
                    <input {...register2("lastName", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                  </label>
                </li>
                <li style={styles.ItemStyle} >
                  <label>*Gender:
                    <select {...register2("gender", { required: true })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '85px' }} defaultValue={''} required>
                        <option value="" disabled hidden>Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                  </label>
                </li>

                {/* note: might need to consider adding options to connect new family member to previous ones, to more accurately place them on tree */}
                <li style={styles.ItemStyle}>
                  <label>
                    *Relationship:
                    <select {...register2("relationship", { required: true })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }} defaultValue={''} required>
                      <option value="" disabled hidden>Select</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="cousin">Cousin</option>
                      <option value="aunt">Aunt</option>
                      <option value="uncle">Uncle</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="niece">Niece</option>
                      <option value="nephew">Nephew</option>
                    </select>
                  </label>
                </li>

                <div style={{ marginTop: '10px', display: matPat.includes(selectedMemberRelationship) ? 'block' : 'none' }}>
                  <input type="radio" name="matPat2" value="maternal" {...register2("matPat2", { required: matPat.includes(selectedMemberRelationship) })}/> Maternal
                  <input type="radio" name="matPat2" value="paternal" {...register2("matPat2", { required: matPat.includes(selectedMemberRelationship) })}/> Paternal
                </div>

                {/* optional fields */}
                <li style={styles.ItemStyle}>
                  <label>
                    Location:
                    <input {...register2("location")} type="text" placeholder="" style={styles.FieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Birth Date:
                    <input {...register2("birthDate")} type="date" placeholder="" style={styles.DateFieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Place of Birth:
                    <input {...register2("birthplace")} type="text" placeholder="" style={styles.FieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Date of Death:
                    <input {...register2("deathDate")} type="date" placeholder="" style={styles.DateFieldStyle} />
                  </label>
                </li>
              </ul>
              <div style={styles.ButtonDivStyle}>
                <button type="submit" style={styles.ButtonStyle}>Add</button>
                <button type="button" style={styles.GrayButtonStyle} onClick={() => { setManual(false); reset(); }}>Back</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Popup>
  );
}

export default AddFamilyMemberPopup;