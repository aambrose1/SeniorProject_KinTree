import React, { useState, useEffect, useMemo } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { useCurrentUser } from '../../CurrentUserProvider';

function EditFamilyMemberPopup({ trigger, memberId, onSaved }) {
  const { currentUserID } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("basic"); 

  const [memberData, setMemberData] = useState(null);
  const [relationshipData, setRelationshipData] = useState(null);

  const matPat = useMemo(() => ["parent", "cousin", "aunt", "uncle", "grandparent", "niece", "nephew"], []);

  

  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  const {
    register: registerRel,
    handleSubmit: handleSubmitRel,
    reset: resetRel
  } = useForm();



  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const memberRes = await fetch(`http://localhost:5000/api/family-members/${memberId}`);
        const memberJson = await memberRes.json();

        const relRes = await fetch(`http://localhost:5000/api/relationships/member/${memberId}`);
        const relJson = await relRes.json();

        setMemberData(memberJson);
        setRelationshipData(relJson);

        // preload forms
        reset({
          firstName: memberJson.firstName,
          lastName: memberJson.lastName,
          location: memberJson.location,
          birthday: memberJson.birthDate,
          birthplace: memberJson.birthplace,
          deathdate: memberJson.deathDate
        });

        resetRel({
          relationship: relJson.relationshipType,
          matPat: relJson.side
        });

      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    if (memberId) load();
  }, [memberId, reset, resetRel]);

  // ----------- CLOSE HANDLER -----------

  const closeModal = (close) => {
    reset();
    resetRel();
    close();
  };

  // ----------- SAVE BASIC INFO -----------

  const onSubmitBasic = async (data) => {
    try {
      const res = await fetch(`http://localhost:5000/api/family-members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          location: data.location || null,
          birthDate: data.birthday || null,
          birthplace: data.birthplace || null,
          deathDate: data.deathdate || null
        })
      });

      if (res.ok) onSaved && onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  

  const onSubmitRelationship = async (data) => {
    try {
      const res = await fetch(`http://localhost:5000/api/relationships/${relationshipData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipType: data.relationship,
          side: matPat.includes(data.relationship) ? data.matPat : null,
          relationshipStatus: "active"
        })
      });

      if (res.ok) onSaved && onSaved();

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <Popup trigger={trigger} modal>
      {(close) => (
        <div style={styles.DefaultStyle}>

          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => closeModal(close)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
              <CloseIcon style={{ width: '40px', height: '40px', margin: '10px' }} />
            </button>
          </div>

          <h2 style={{ textAlign: "center", marginTop: "0", fontFamily: "Alata" }}>
            Edit Family Member
          </h2>

          {/* Tab Selector */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
            <button
              onClick={() => setView("basic")}
              style={view === "basic" ? styles.ButtonStyle : styles.GrayButtonStyle}
            >
              Basic Info
            </button>
            <button
              onClick={() => setView("relationship")}
              style={view === "relationship" ? styles.ButtonStyle : styles.GrayButtonStyle}
            >
              Relationship
            </button>
          </div>

          {/* BASIC INFO FORM */}
          {view === "basic" && (
            <form onSubmit={handleSubmit(onSubmitBasic)} style={styles.FormStyle}>
              <ul style={styles.ListStyle}>
                <li style={styles.ItemStyle}>
                  <label>
                    First Name:
                    <input {...register("firstName")} type="text" style={styles.FieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Last Name:
                    <input {...register("lastName")} type="text" style={styles.FieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Location:
                    <input {...register("location")} type="text" style={styles.FieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Birth Date:
                    <input {...register("birthday")} type="date" style={styles.DateFieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Place of Birth:
                    <input {...register("birthplace")} type="text" style={styles.FieldStyle} />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>
                    Date of Death:
                    <input {...register("deathdate")} type="date" style={styles.DateFieldStyle} />
                  </label>
                </li>
              </ul>

              <div style={styles.ButtonDivStyle}>
                <button type="submit" style={styles.ButtonStyle}>Save</button>
              </div>
            </form>
          )}

          {/* RELATIONSHIP FORM */}
          {view === "relationship" && (
            <form onSubmit={handleSubmitRel(onSubmitRelationship)} style={styles.FormStyle}>
              <ul style={styles.ListStyle}>
                <li style={styles.ItemStyle}>
                  <label>
                    Relationship:
                    <select {...registerRel("relationship")} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }}>
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

                {/* Maternal/paternal only shown when needed */}
                {matPat.includes(relationshipData.relationshipType) && (
                  <li style={{ marginTop: "10px" }}>
                    <input type="radio" value="maternal" {...registerRel("matPat")} /> Maternal
                    <input type="radio" value="paternal" {...registerRel("matPat")} style={{ marginLeft: "10px" }} /> Paternal
                  </li>
                )}
              </ul>

              <div style={styles.ButtonDivStyle}>
                <button type="submit" style={styles.ButtonStyle}>Save</button>
              </div>
            </form>
          )}

        </div>
      )}
    </Popup>
  );
}

export default EditFamilyMemberPopup;