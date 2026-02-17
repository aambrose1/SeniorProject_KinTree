import React, { useEffect, useMemo } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { useCurrentUser } from '../../CurrentUserProvider';

function EditFamilyMemberPopup({ trigger, memberData, relationshipData }) {
  const { currentUserID, currentAccountID } = useCurrentUser();

  // relationships requiring maternal/paternal
  const matPat = useMemo(() => [
    "parent", "cousin", "aunt", "uncle", "grandparent", "niece", "nephew"
  ], []);

  // form
  const {
    register,
    handleSubmit,
    reset,
    watch
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      relationship: '',
      matPat: '',
      location: '',
      birthday: '',
      deathDate: ''
    }
  });

  // watch relationship to toggle maternal/paternal
  const selectedRelationship = watch("relationship");

  // populate form when modal opens
  useEffect(() => {
    if (memberData) {
      reset({
        firstName: memberData.firstName || '',
        lastName: memberData.lastName || '',
        relationship: relationshipData?.relationshipType || '',
        matPat: relationshipData?.side || '',
        location: memberData.location || '',
        birthday: memberData.birthDate || '',
        deathDate: memberData.deathDate || ''
      });
    }
  }, [memberData, relationshipData, reset]);

  // close reset
  const closeModal = () => {
    reset();
  };

  // submit handler
  const onSubmitEdit = async (data) => {
    try {
      // 1️⃣ update family member
      await fetch(`http://localhost:5000/api/family-members/${memberData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthday || null,
          deathDate: data.deathDate || null,
          location: data.location || null,
        })
      });

      // 2️⃣ update relationship
      await fetch(`http://localhost:5000/api/relationships/${relationshipData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_id: currentUserID,
          person2_id: memberData.id,
          relationshipType: data.relationship,
          relationshipStatus: "active",
          side: data.matPat || null,
          userId: currentAccountID
        })
      });

      // refresh page
      window.location.reload();

    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  return (
    <Popup trigger={trigger} onClose={closeModal} modal>
      {close => (
        <div style={styles.DefaultStyle}>

          {/* CLOSE BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { closeModal(); close(); }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <CloseIcon style={{ width: '40px', height: '40px', margin: '10px' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmitEdit)} style={styles.FormStyle}>

            <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
              <h2>Edit Family Member</h2>
            </div>

            <ul style={styles.ListStyle}>

              {/* FIRST NAME */}
              <li style={styles.ItemStyle}>
                <label>
                  First Name:
                  <input {...register("firstName", { required: true })} style={styles.FieldStyle} />
                </label>
              </li>

              {/* LAST NAME */}
              <li style={styles.ItemStyle}>
                <label>
                  Last Name:
                  <input {...register("lastName", { required: true })} style={styles.FieldStyle} />
                </label>
              </li>

              {/* RELATIONSHIP */}
              <li style={styles.ItemStyle}>
                <label>
                  Relationship:
                  <select {...register("relationship", { required: true })} style={{ marginLeft: '10px' }}>
                    <option value="">Select</option>
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

              {/* MAT/PAT */}
              <div style={{
                marginTop: '10px',
                display: matPat.includes(selectedRelationship) ? 'block' : 'none'
              }}>
                <input type="radio" value="maternal" {...register("matPat")} /> Maternal
                <input type="radio" value="paternal" {...register("matPat")} /> Paternal
              </div>

              {/* LOCATION */}
              <li style={styles.ItemStyle}>
                <label>
                  Location:
                  <input {...register("location")} style={styles.FieldStyle} />
                </label>
              </li>

              {/* BIRTH DATE */}
              <li style={styles.ItemStyle}>
                <label>
                  Birth Date:
                  <input type="date" {...register("birthday")} style={styles.DateFieldStyle} />
                </label>
              </li>

              {/* DEATH DATE */}
              <li style={styles.ItemStyle}>
                <label>
                  Date of Death:
                  <input type="date" {...register("deathDate")} style={styles.DateFieldStyle} />
                </label>
              </li>

            </ul>

            {/* BUTTONS */}
            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle}>Save Changes</button>
              <button
                type="button"
                style={styles.GrayButtonStyle}
                onClick={() => { closeModal(); close(); }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}
    </Popup>
  );
}

export default EditFamilyMemberPopup;
