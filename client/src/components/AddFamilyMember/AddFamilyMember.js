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
import { addRelationship } from '../../utils/relationUtil';

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
  } = useForm({ defaultValues: { selectedMember: '', selectedMemberRelationship: '', matPat: '' } });

  // stored list of family members that require maternal/paternal distinction (maybe shift this to retrieval from backend, so that it can be updated without changing code)
  let matPat = useMemo(() => ["parent", "cousin", "aunt", "uncle", "grandparent", "niece", "nephew"], []);

  // manage mat/pat selector using currently selected relationship type
  const selectedMemberRelationship = watch("selectedMemberRelationship");
  var enableMatPat = useRef(false);
  useEffect(() => {
    if (matPat.includes(selectedMemberRelationship)) {
      enableMatPat.current = true;
    }
    else {
      enableMatPat.current = false;
    }
  }, [selectedMemberRelationship, matPat]);

  // second form -- manually add family member
  const {
    register: register2,
    watch: watch2,
    handleSubmit: handleSubmit2,
  } = useForm({ defaultValues: { firstName: '', lastName: '', relationship: '', matPat2: '', location: '', birthday: '', birthplace: '', deathdate: '', gender: '' } });

  const selectedManualRelationship = watch2("relationship");
  const [treeMembers, setTreeMembers] = useState([]);

  // relationships that require a "Connect To" link for proper placement
  const extendedRelations = useMemo(() => ({
    "cousin": { map: "child", label: "Parent of Cousin (Aunt/Uncle)", filter: ["aunt", "uncle"] },
    "niece": { map: "child", label: "Parent of Niece (Sibling)", filter: ["sibling"] },
    "nephew": { map: "child", label: "Parent of Nephew (Sibling)", filter: ["sibling"] },
    "aunt": { map: "sibling", label: "Sibling of Aunt (Parent)", filter: ["parent"] },
    "uncle": { map: "sibling", label: "Sibling of Uncle (Parent)", filter: ["parent"] },
    "grandparent": { map: "parent", label: "Child of Grandparent (Parent)", filter: ["parent"] },
    "grandchild": { map: "child", label: "Parent of Grandchild (Child)", filter: ["child"] }
  }), []);

  // Fetch all current tree members for the dropdown
  useEffect(() => {
    const loadTreeMembers = async () => {
      try {
        const members = await familyTreeService.getFamilyMembersByUserId(currentAccountID);
        setTreeMembers(members);
      } catch (err) {
        console.error("Failed to load tree members for dropdown", err);
      }
    };
    if (currentAccountID) loadTreeMembers();
  }, [currentAccountID]);



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
        console.log('Family members for user', currentAccountID, ':', family.current);
      } catch (error) {
        console.error('Error fetching family members for user', currentAccountID, error.message);
        setErrorMessage(error.message)
        return;
      }

      // populate users list
      try {
        const responseData = await familyTreeService.getRegisteredUsers();
        console.log('Registered users:', responseData);
        users.current = responseData.filter(user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !family.current.some(member => member.id === user.id));
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

      if (selectedUser.id === currentAccountID) {
        setErrorMessage("You cannot add yourself as a family member.");
        console.error("Attempted to add self as family member");
        return;
      }

      if (selectedUser && family.current.some(member => member.memberuserid === selectedUser.id)) {
        setErrorMessage("This user is already in your family tree.");
        console.error("Attempted to add existing family member:", selectedUser.username);
        return;
      }

      if (!selectedUser) {
        setErrorMessage("Selected user not found");
        console.error("Selected user not found in users list");
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
        gender: selectedUser.gender
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
      // determine final relationship and primary contact for mapping
      let finalRel = data.selectedMemberRelationship;
      let targetId = treeUserId;
      let isExtended = extendedRelations[data.selectedMemberRelationship];
      
      if (isExtended && data.connectTo) {
        finalRel = isExtended.map;
        targetId = Number(data.connectTo);
      }

      let relRequestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_id: targetId, 
          person2_id: treeMemberId, 
          relationshipType: finalRel,
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

      // --- Update treeinfo so the new member appears on the tree visualization ---
      try {
        const treeData = await familyTreeService.getFamilyTreeByUserId(currentAccountID);
        const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));

        // Use the treeMemberId as the node ID for the new member
        const newNodeId = `${treeMemberId}`;
        const accountNodeId = `${treeUserId}`;

        // Add new node to tree index
        treeIndex[newNodeId] = {
          "id": newNodeId,
          "data": {
            "first name": selectedUser.firstname,
            "last name": selectedUser.lastname,
            "gender": selectedUser.gender || ""
          },
          "rels": {}
        };

        // Add the relationship links in the tree data
        addRelationship(treeIndex, accountNodeId, newNodeId, data.selectedMemberRelationship, data.matPat || null, data.connectTo);

        // Persist updated tree
        const updatedTreeData = Object.values(treeIndex);
        await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);
        console.log('Tree info updated with new member');
      } catch (treeError) {
        console.error('Warning: Member added but tree visualization update failed:', treeError);
        // Don't throw - the member was still added successfully
      }

      reset();
      close();

      console.log(relData.message);
      return window.location.href = `/tree`; // redirect to tree page to see the update

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
      let memberData = {
        firstname: data.firstName,
        lastname: data.lastName,
        birthdate: data.birthDate,
        deathdate: data.deathDate,
        location: data.location || null,
        phonenumber: data.phoneNumber || null,
        userid: currentAccountID, // The user adding the family member
        memberuserid: null, // manually added members do not have associated user accounts
        gender: data.gender
      }

      // get account treemember id
      let treeUser = await familyTreeService.getFamilyMemberByUserId(currentAccountID);
      const treeUserId = treeUser.id;
      console.log(treeUserId, 'user treemember id');
      console.log('current Account ID', currentAccountID);

      // add new member to treemembers table
      const treeMember = await familyTreeService.createFamilyMember(memberData);
      const treeMemberId = treeMember.member.id;
      console.log('added user treeMemberId', treeMemberId);

      // add relationship to relationship table
      let finalRel = data.relationship;
      let targetId = treeUserId;
      let isExtended = extendedRelations[data.relationship];
      
      if (isExtended && data.connectTo2) {
        finalRel = isExtended.map;
        targetId = Number(data.connectTo2);
      }

      const relResponse = await fetch(`http://localhost:5000/api/relationships/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_id: targetId,
          person2_id: treeMemberId,
          relationshipType: finalRel,
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

      // --- Update treeinfo so the new member appears on the tree visualization ---
      try {
        const treeData = await familyTreeService.getFamilyTreeByUserId(currentAccountID);
        const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));

        // Use the treeMemberId as the node ID for the new member
        const newNodeId = `${treeMemberId}`;
        const accountNodeId = `${treeUserId}`;

        // Add new node to tree index
        treeIndex[newNodeId] = {
          "id": newNodeId,
          "data": {
            "first name": data.firstName,
            "last name": data.lastName,
            "gender": data.gender || ""
          },
          "rels": {}
        };

        // Add the relationship links in the tree data
        // new integration uses account user as the subject, new member = relative as the actor (newNode is account's <relationship> relative)
        addRelationship(treeIndex, accountNodeId, newNodeId, data.relationship, data.matPat2 || null, data.connectTo2);

        // Persist updated tree
        const updatedTreeData = Object.values(treeIndex);
        await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);
        console.log('Tree info updated with new manual member');
      } catch (treeError) {
        console.error('Warning: Member added but tree visualization update failed:', treeError);
        // Don't throw - the member was still added successfully
      }

      reset();
      close();
      return window.location.href = `/tree`; // redirect to tree page to see the update

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
                  <label>
                    Side:
                    <input type="radio" name="matPat" value="maternal" {...register("matPat", { required: matPat.includes(selectedMemberRelationship) })} style={{ marginLeft: '10px' }} /> Maternal
                    <input type="radio" name="matPat" value="paternal" {...register("matPat", { required: matPat.includes(selectedMemberRelationship) })} /> Paternal
                  </label>
                </div>

                {/* Extended relationship "Connect To" dropdown */}
                <div style={{ marginTop: '10px', display: extendedRelations[selectedMemberRelationship] ? 'block' : 'none' }}>
                  <label>
                    {extendedRelations[selectedMemberRelationship]?.label || "Connect To"}:
                    <select {...register("connectTo", { required: false })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '180px' }} defaultValue={''}>
                      <option value="">Skip / Link Later</option>
                      {treeMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.firstname} {member.lastname}</option>
                      ))}
                    </select>
                  </label>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '10px' }}>
                    * Link to an existing member for better accuracy.
                  </p>
                </div>

                {/* add button */}
                <div style={styles.ButtonDivStyle}>
                  <button type="submit" disabled={selectedMemberRelationship === null ? true : false} style={styles.ButtonStyle}>Add</button>
                </div>

                <div>
                  <button type="button" onClick={() => { setManual(true); }} style={styles.GrayButtonStyle}>Can't find your family member?</button>
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
                    <div style={{ display: 'flex', }}>Sync Contact</div>
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

                <div style={{ marginTop: '10px', display: matPat.includes(selectedManualRelationship) ? 'block' : 'none' }}>
                  <label>
                    Side:
                    <input type="radio" name="matPat2" value="maternal" {...register2("matPat2", { required: matPat.includes(selectedManualRelationship) })} style={{ marginLeft: '10px' }} /> Maternal
                    <input type="radio" name="matPat2" value="paternal" {...register2("matPat2", { required: matPat.includes(selectedManualRelationship) })} /> Paternal
                  </label>
                </div>

                {/* Extended relationship "Connect To" dropdown for manual entry */}
                <div style={{ marginTop: '10px', display: extendedRelations[selectedManualRelationship] ? 'block' : 'none' }}>
                  <label>
                    {extendedRelations[selectedManualRelationship]?.label || "Connect To"}:
                    <select {...register2("connectTo2", { required: false })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '180px' }} defaultValue={''}>
                      <option value="">Skip / Link Later</option>
                      {treeMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.firstname} {member.lastname}</option>
                      ))}
                    </select>
                  </label>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '10px' }}>
                    * Link to an existing member for better accuracy.
                  </p>
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