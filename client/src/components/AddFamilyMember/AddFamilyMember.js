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
import { SERVER_URL } from '../../config/urls';
import { relationshipService } from '../../services/relationshipService';
import { addRelationship } from '../../utils/relationUtil';

// TODO: make form clear when dismissed by clicking outside of modal
//       make sync contact button functional

function AddFamilyMemberPopup({ trigger, userid }) {
  const [manual, setManual] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [treeInfo, setTreeInfo] = useState(null); // Full tree index for smart checks
  const [userTreeId, setUserTreeId] = useState(null); // The tree-node ID for "You"
  const { currentUserID, currentAccountID } = useCurrentUser();

  var family = useRef([]);
  var users = useRef([]);

  // first form -- search for existing user
  const {
    register,
    reset,
    watch,
    handleSubmit,
    setValue,
  } = useForm({ defaultValues: { selectedMember: '', selectedMemberRelationship: '', matPat: '' } });

  // second form -- manually add family member
  const {
    register: register2,
    watch: watch2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
  } = useForm({ defaultValues: { firstName: '', lastName: '', relationship: '', matPat2: '', location: '', birthday: '', birthplace: '', deathdate: '', gender: '' } });

  // stored list of family members that require maternal/paternal distinction
  let matPat = useMemo(() => ["parent", "mother", "father", "cousin", "aunt", "uncle", "grandparent", "grandmother", "grandfather", "niece", "nephew"], []);

  // manage mat/pat selector using currently selected relationship type
  const selectedMemberRelationship = watch("selectedMemberRelationship");
  
  // Reusable logic for both forms
  const getSideChoiceType = (rel) => {
    const fixed = { "mother": "maternal", "father": "paternal" };
    const required = ["grandparent", "grandmother", "grandfather", "aunt", "uncle", "cousin", "niece", "nephew", "parent"];
    if (fixed[rel]) return { status: 'fixed', value: fixed[rel] };
    if (required.includes(rel)) return { status: 'required' };
    return { status: 'none' };
  };

  useEffect(() => {
    const choice = getSideChoiceType(selectedMemberRelationship);
    if (choice.status === 'fixed') {
      setValue("matPat", choice.value);
    }
  }, [selectedMemberRelationship, setValue]);

  var enableMatPat = useRef(false);
  useEffect(() => {
    const choice = getSideChoiceType(selectedMemberRelationship);
    enableMatPat.current = (choice.status === 'required');
  }, [selectedMemberRelationship]);

  const selectedManualRelationship = watch2("relationship");
  const selectedManualMatPat = watch2("matPat2");

  useEffect(() => {
    // Auto-set gender and side based on relationship selection
    const genderMap = {
      "mother": "F", "father": "M",
      "sister": "F", "brother": "M",
      "aunt": "F", "uncle": "M",
      "niece": "F", "nephew": "M",
      "grandmother": "F", "grandfather": "M",
      "daughter": "F", "son": "M"
    };
    if (genderMap[selectedManualRelationship]) {
      setValue2("gender", genderMap[selectedManualRelationship]);
    }

    // Auto-set side for unambiguous relationships
    if (selectedManualRelationship === "mother") {
      setValue2("matPat2", "maternal");
    } else if (selectedManualRelationship === "father") {
      setValue2("matPat2", "paternal");
    }
  }, [selectedManualRelationship, setValue2]);

  // Determine if the "Side" selector should be shown
  const isSideChoiceNeeded = (rel) => {
    const multiSideRel = ["grandparent", "grandmother", "grandfather", "aunt", "uncle", "cousin"];
    // Mother and Father have fixed sides, and Siblings/Nieces/Nephews are relative to your branch
    if (rel === "mother" || rel === "father" || rel === "sibling" || rel === "niece" || rel === "nephew") return false;
    return multiSideRel.includes(rel);
  };
  const [treeMembers, setTreeMembers] = useState([]);

  // relationships that require or benefit from a "Connect To" link for proper placement
  const extendedRelations = relationshipService.EXTENDED_RELATIONS;

  // Fetch all current tree members for the dropdown
  useEffect(() => {
    const loadTreeMembers = async () => {
      try {
        const [members, fullTree, userTreeMember] = await Promise.all([
          familyTreeService.getFamilyMembersByUserId(currentAccountID),
          familyTreeService.getFamilyTreeByUserId(currentAccountID),
          familyTreeService.getFamilyMemberByUserId(currentAccountID)
        ]);
        setTreeMembers(members);
        setUserTreeId(userTreeMember?.id);
        const index = Object.fromEntries(fullTree.map(p => [p.id, p]));
        setTreeInfo(index);
      } catch (err) {
        console.error("Failed to load tree data for smart detection", err);
      }
    };
    if (currentAccountID) loadTreeMembers();
  }, [currentAccountID]);

  // Smart detection now handled by relationshipService

  const smartTarget = useMemo(() => {
    return relationshipService.findSmartTarget(treeInfo, userTreeId, selectedMemberRelationship || "", watch("matPat") || "");
  }, [selectedMemberRelationship, watch("matPat"), treeInfo, userTreeId]);

  useEffect(() => {
    if (smartTarget) {
      setValue("connectTo", smartTarget);
    }
  }, [smartTarget, setValue]);

  const smartTargetManual = useMemo(() => {
    return relationshipService.findSmartTarget(treeInfo, userTreeId, selectedManualRelationship || "", watch2("matPat2") || "");
  }, [selectedManualRelationship, watch2("matPat2"), treeInfo, userTreeId]);

  useEffect(() => {
    if (smartTargetManual) {
      setValue2("connectTo2", smartTargetManual);
    }
  }, [smartTargetManual, setValue2]);



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

      const existingMember = family.current.find(member => member.memberuserid === selectedUser.id);
      
      if (!selectedUser) {
        setErrorMessage("Selected user not found");
        console.error("Selected user not found in users list");
        return;
      }

      if (!selectedUser) {
        setErrorMessage("Selected user not found");
        console.error("Selected user not found in users list");
        return;
      }

      // Relationship Hint: Mother/Father selection should override the profile's gender 
      // to ensure the tree visualization is correct.
      const relHint = relationshipService.EXTENDED_RELATIONS[data.selectedMemberRelationship];
      const finalGender = relHint?.gender || selectedUser.gender;

      const selectedUserData = {
        firstname: selectedUser.firstname,
        lastname: selectedUser.lastname,
        birthdate: selectedUser.birthdate || null,
        deathdate: selectedUser.deathdate || null,
        location: selectedUser.location || null,
        phonenumber: selectedUser.phonenumber || null,
        userid: currentAccountID, // The user adding the family member
        memberuserid: selectedUser.id, // Existing user's ID
        gender: finalGender
      };

      // get account treemember id
      let treeUser = await familyTreeService.getFamilyMemberByUserId(currentAccountID);
      const treeUserId = treeUser.id;

      let treeMemberId;
      if (existingMember) {
        console.log('Member already exists, using existing ID:', existingMember.id);
        treeMemberId = existingMember.id;
      } else {
        const treeMemberRes = await familyTreeService.createFamilyMember(selectedUserData);
        treeMemberId = treeMemberRes.member.id;
      }

      // Resolve relationships to create across the database
      // IMPORTANT: Use treeUserId (the member ID), not currentAccountID (the user ID)
      const relsToCreate = relationshipService.getRequiredDBRelationships(
        treeUserId,
        treeMemberId,
        data.selectedMemberRelationship,
        data.connectTo,
        data.matPat || null
      );
      
      console.log('Relationships to create (Existing):', relsToCreate);

      for (const rel of relsToCreate) {
        const relRes = await fetch(`http://localhost:5000/api/relationships/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...rel,
            relationshipStatus: "active",
            userId: currentAccountID
          })
        });
        if (!relRes.ok) {
          const relData = await relRes.json();
          console.error('SERVER RELATIONSHIP ERROR:', relData);
          const errorMsg = relData.details || relData.error || 'Failed to add relationship';
          throw new Error(errorMsg);
        }
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
            "gender": finalGender || ""
          },
          "rels": {}
        };

        // Add the relationship links in the tree data
        const res = addRelationship(treeIndex, accountNodeId, newNodeId, data.selectedMemberRelationship, data.matPat || null, data.connectTo);

        // Persist updated tree
        const updatedTreeData = Object.values(treeIndex);
        await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);
        console.log('Tree info updated with new member');
        
        // Show success summary
        const dbLinkCount = relsToCreate.length;
        const mainRel = data.selectedMemberRelationship;
        let factualSummary = `Added as your ${mainRel.charAt(0).toUpperCase() + mainRel.slice(1)}`;
        if (dbLinkCount > 1 && data.connectTo) {
          const partnerName = treeInfo[data.connectTo]?.data["first name"] || "Partner";
          factualSummary += ` and linked to ${partnerName}`;
        }

        setResult({
            ...res,
            name: `${selectedUser.firstname} ${selectedUser.lastname}`,
            summary: factualSummary,
            dbStatus: `Saved ${dbLinkCount} relationship record(s) to Database`,
            treeStatus: "Tree visualization data updated successfully"
        });
      } catch (treeError) {
        console.error('Warning: Member added but tree visualization update failed:', treeError);
        setResult({
            success: true,
            name: `${selectedUser.firstname} ${selectedUser.lastname}`,
            summary: "Member added to database, but visualization failed to update.",
            dbStatus: "Success",
            treeStatus: "Failed: " + treeError.message
        });
      }

      reset();
      // close(); // Don't close immediately, let user see summary
      // return window.location.href = `/tree`; 

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
      // Final gender enforcement for manual entry
      const relHint2 = relationshipService.EXTENDED_RELATIONS[data.relationship];
      const finalGender2 = relHint2?.gender || data.gender;

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
        gender: finalGender2
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

      // Resolve relationships to create across the database
      // IMPORTANT: Use treeUserId (the member ID), not currentAccountID (the user ID)
      const relsToCreate = relationshipService.getRequiredDBRelationships(
        treeUserId,
        treeMemberId,
        data.relationship,
        data.connectTo2,
        data.matPat2 || null
      );
      
      console.log('Relationships to create (Manual):', relsToCreate);

      for (const rel of relsToCreate) {
        const relRes = await fetch(`http://localhost:5000/api/relationships/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...rel,
            relationshipStatus: "active",
            userId: currentAccountID
          })
        });
        if (!relRes.ok) {
          const relData = await relRes.json();
          console.error('SERVER RELATIONSHIP ERROR (Manual):', relData);
          const errorMsg = relData.details || relData.error || 'Failed to add relationship';
          throw new Error(errorMsg);
        }
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
            "first name": data.firstName,
            "last name": data.lastName,
            "gender": finalGender2 || ""
          },
          "rels": {}
        };

        // Add the relationship links in the tree data
        // new integration uses account user as the subject, new member = relative as the actor (newNode is account's <relationship> relative)
        const res = addRelationship(treeIndex, accountNodeId, newNodeId, data.relationship, data.matPat2 || null, data.connectTo2);

        // Persist updated tree
        const updatedTreeData = Object.values(treeIndex);
        await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);
        console.log('Tree info updated with new manual member');

        // Show success summary
        const dbLinkCount = relsToCreate.length;
        const mainRel = data.relationship;
        let factualSummary = `Added as your ${mainRel.charAt(0).toUpperCase() + mainRel.slice(1)}`;
        if (dbLinkCount > 1 && data.connectTo2) {
          const partnerName = treeInfo[data.connectTo2]?.data["first name"] || "Partner";
          factualSummary += ` and linked to ${partnerName}`;
        }

        setResult({
            ...res,
            name: `${data.firstName} ${data.lastName}`,
            summary: factualSummary,
            dbStatus: `Saved ${dbLinkCount} relationship record(s)`,
            treeStatus: "Tree structure updated"
        });
      } catch (treeError) {
        console.error('Warning: Member added but tree visualization update failed:', treeError);
        setResult({
            success: true,
            name: `${data.firstName} ${data.lastName}`,
            summary: "Member added, but tree update failed.",
            dbStatus: "Success",
            treeStatus: "Failed"
        });
      }

      reset();
      // close(); 
      // return window.location.href = `/tree`; 

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
              <button onClick={() => { reset(); setResult(null); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <CloseIcon style={{ width: '40px', height: '40px', margin: '10px 10px 0px 10px' }} />
              </button>
            </div>

            {result ? (
              <div style={styles.MainContainerStyle}>
                <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
                  <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>Member Added!</h2>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f1f8e9', 
                    borderRadius: '8px',
                    border: '1px solid #c5e1a5',
                    textAlign: 'left',
                    marginBottom: '20px'
                  }}>
                    <p><strong>Name:</strong> {result.name}</p>
                    <p><strong>Action:</strong> {result.summary}</p>
                    
                    {result.warnings?.length > 0 && (
                      <div style={{ marginTop: '10px', color: '#af6000' }}>
                        <p><strong>Note:</strong></p>
                        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                          {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}

                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #ccc', fontSize: '13px', color: '#666' }}>
                        <p><strong>Database:</strong> {result.dbStatus}</p>
                        <p><strong>Tree Visualization:</strong> {result.treeStatus}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { 
                      if (window.refreshTree) {
                        window.refreshTree();
                      }
                      reset(); 
                      setResult(null); 
                      close(); 
                    }} 
                    style={{ ...styles.ButtonStyle, width: '100%' }}
                  >
                    Return to Tree
                  </button>
                </div>
              </div>
            ) : (
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
                      <option value="mother">Mother</option>
                      <option value="father">Father</option>
                      <option value="sibling">Sibling</option>
                      <option value="cousin">Cousin</option>
                      <option value="aunt">Aunt</option>
                      <option value="uncle">Uncle</option>
                      <option value="grandmother">Grandmother</option>
                      <option value="grandfather">Grandfather</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="niece">Niece</option>
                      <option value="nephew">Nephew</option>
                    </select>
                  </label>
                </div>

                {isSideChoiceNeeded(selectedMemberRelationship) && (
                  <div style={{ marginTop: '10px' }}>
                    <label>
                      Side:
                      <input type="radio" value="maternal" {...register("matPat", { required: true })} style={{ marginLeft: '10px' }} /> Maternal
                      <input type="radio" value="paternal" {...register("matPat", { required: true })} /> Paternal
                    </label>
                  </div>
                )}

                {/* Extended relationship "Connect To" dropdown - Hide if auto-detected for ANY relationship */}
                <div style={{ 
                  marginTop: '10px', 
                  display: (extendedRelations[selectedMemberRelationship] && !smartTarget) 
                           ? 'block' : 'none' 
                }}>
                  <label>
                    {extendedRelations[selectedMemberRelationship]?.label || "Connect To"}:
                    <select {...register("connectTo", { required: false })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '180px' }} defaultValue={''}>
                      <option value="">Skip / Link Later</option>
                      {treeMembers
                        .filter(m => String(m.id) !== String(currentAccountID))
                        .map(member => (
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
          )}

            {/* ----------------------- */}
          </div>

          {/* manual content */}

          <div style={{ display: manual ? 'block' : 'none' }}>
            {/* close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { reset(); setResult(null); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <CloseIcon style={{ width: '40px', height: '40px', margin: '10px 10px 0px 10px' }} />
              </button>
            </div>

            {/* fill out info about family member */}
            {result ? (
               <div style={styles.MainContainerStyle}>
               <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
                 <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>Member Added!</h2>
                 <div style={{ 
                   padding: '20px', 
                   backgroundColor: '#f1f8e9', 
                   borderRadius: '8px',
                   border: '1px solid #c5e1a5',
                   textAlign: 'left',
                   marginBottom: '20px'
                 }}>
                   <p><strong>Name:</strong> {result.name}</p>
                   <p><strong>Action:</strong> {result.summary}</p>
                   
                   {result.warnings?.length > 0 && (
                     <div style={{ marginTop: '10px', color: '#af6000' }}>
                       <p><strong>Note:</strong></p>
                       <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                         {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                       </ul>
                     </div>
                   )}

                   <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #ccc', fontSize: '13px', color: '#666' }}>
                       <p><strong>Database:</strong> {result.dbStatus}</p>
                       <p><strong>Tree Visualization:</strong> {result.treeStatus}</p>
                   </div>
                 </div>

                 <button 
                   onClick={() => { 
                     if (window.refreshTree) {
                       window.refreshTree();
                     }
                     reset(); 
                     setResult(null); 
                     close(); 
                   }} 
                   style={{ ...styles.ButtonStyle, width: '100%' }}
                 >
                   Return to Tree
                 </button>
               </div>
             </div>
            ) : (
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
                      <option value="mother">Mother</option>
                      <option value="father">Father</option>
                      <option value="sibling">Sibling</option>
                      <option value="cousin">Cousin</option>
                      <option value="aunt">Aunt</option>
                      <option value="uncle">Uncle</option>
                      <option value="grandmother">Grandmother</option>
                      <option value="grandfather">Grandfather</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="niece">Niece</option>
                      <option value="nephew">Nephew</option>
                    </select>
                  </label>
                </li>

                 {isSideChoiceNeeded(selectedManualRelationship) && (
                  <div style={{ marginTop: '10px' }}>
                    <label>
                      Side:
                      <input type="radio" value="maternal" {...register2("matPat2", { required: true })} style={{ marginLeft: '10px' }} /> Maternal
                      <input type="radio" value="paternal" {...register2("matPat2", { required: true })} /> Paternal
                    </label>
                  </div>
                 )}

                {/* Extended relationship "Connect To" dropdown for manual entry - Hide if auto-detected */}
                <div style={{ 
                  marginTop: '10px', 
                  display: (extendedRelations[selectedManualRelationship] && !smartTargetManual) 
                           ? 'block' : 'none' 
                }}>
                  <label>
                    {extendedRelations[selectedManualRelationship]?.label || "Connect To"}:
                    <select {...register2("connectTo2", { required: false })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '180px' }} defaultValue={''}>
                      <option value="">Skip / Link Later</option>
                      {treeMembers
                        .filter(m => String(m.id) !== String(currentAccountID))
                        .map(member => (
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
          )}
          </div>
        </div>
      )}
    </Popup>
  );
}

export default AddFamilyMemberPopup;