import React, { useState, useEffect, useMemo } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { useCurrentUser } from '../../CurrentUserProvider';
import { supabase } from '../../supabaseClient';

function EditFamilyMemberPopup({ trigger, memberId, onSaved }) {
  const { currentUserID, currentAccountID } = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('basic');
  const [relationshipData, setRelationshipData] = useState(null);

  const matPat = useMemo(
    () => ['parent', 'cousin', 'aunt', 'uncle', 'grandparent', 'niece', 'nephew'],
    []
  );

  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  const {
    register: registerRel,
    handleSubmit: handleSubmitRel,
    reset: resetRel,
    watch: watchRel
  } = useForm();

  const selectedRelationship = watchRel('relationship');

  useEffect(() => {
    const loadMemberData = async () => {
      if (!memberId) return;

      try {
        setLoading(true);

        const { data: member, error: memberError } = await supabase
          .from('family_members')
          .select('*')
          .eq('id', memberId)
          .single();

        if (memberError) throw memberError;

        const { data: relationship, error: relationshipError } = await supabase
          .from('relationships')
          .select('*')
          .eq('person2_id', memberId)
          .single();

        if (relationshipError) throw relationshipError;

        setRelationshipData(relationship);

        reset({
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          location: member.location || '',
          birthday: member.birthDate || '',
          birthplace: member.birthplace || '',
          deathdate: member.deathDate || ''
        });

        resetRel({
          relationship: relationship.relationshipType || '',
          matPat: relationship.side || ''
        });
      } catch (err) {
        console.error('Error loading family member:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMemberData();
  }, [memberId, reset, resetRel]);

  const closeModal = (close) => {
    reset();
    resetRel();
    close();
  };

  const onSubmitBasic = async (data) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          firstName: data.firstName,
          lastName: data.lastName,
          location: data.location || null,
          birthDate: data.birthday || null,
          birthplace: data.birthplace || null,
          deathDate: data.deathdate || null
        })
        .eq('id', memberId);

      if (error) throw error;

      if (onSaved) onSaved();
    } catch (err) {
      console.error('Error updating family member:', err.message);
    }
  };

  const onSubmitRelationship = async (data) => {
    try {
      if (!relationshipData?.id) return;

      const { error } = await supabase
        .from('relationships')
        .update({
          person1_id: currentUserID,
          person2_id: memberId,
          relationshipType: data.relationship,
          relationshipStatus: 'active',
          side: matPat.includes(data.relationship) ? data.matPat : null,
          userId: currentAccountID
        })
        .eq('id', relationshipData.id);

      if (error) throw error;

      if (onSaved) onSaved();
    } catch (err) {
      console.error('Error updating relationship:', err.message);
    }
  };

  return (
    <Popup trigger={trigger} modal>
      {(close) => (
        <div style={styles.DefaultStyle}>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => closeModal(close)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <CloseIcon style={{ width: '40px', height: '40px', margin: '10px' }} />
            </button>
          </div>

          <h2 style={{ textAlign: 'center', marginTop: '0', fontFamily: 'Alata' }}>
            Edit Family Member
          </h2>

          {loading ? (
            <p style={{ textAlign: 'center', fontFamily: 'Alata' }}>Loading...</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <button
                  type="button"
                  onClick={() => setView('basic')}
                  style={view === 'basic' ? styles.ButtonStyle : styles.GrayButtonStyle}
                >
                  Basic Info
                </button>

                <button
                  type="button"
                  onClick={() => setView('relationship')}
                  style={view === 'relationship' ? styles.ButtonStyle : styles.GrayButtonStyle}
                >
                  Relationship
                </button>
              </div>

              {view === 'basic' && (
                <form onSubmit={handleSubmit(onSubmitBasic)} style={styles.FormStyle}>
                  <ul style={styles.ListStyle}>
                    <li style={styles.ItemStyle}>
                      <label>
                        First Name:
                        <input
                          {...register('firstName', { required: true })}
                          type="text"
                          style={styles.FieldStyle}
                        />
                      </label>
                    </li>

                    <li style={styles.ItemStyle}>
                      <label>
                        Last Name:
                        <input
                          {...register('lastName', { required: true })}
                          type="text"
                          style={styles.FieldStyle}
                        />
                      </label>
                    </li>

                    <li style={styles.ItemStyle}>
                      <label>
                        Location:
                        <input
                          {...register('location')}
                          type="text"
                          style={styles.FieldStyle}
                        />
                      </label>
                    </li>

                    <li style={styles.ItemStyle}>
                      <label>
                        Birth Date:
                        <input
                          {...register('birthday')}
                          type="date"
                          style={styles.DateFieldStyle}
                        />
                      </label>
                    </li>

                    <li style={styles.ItemStyle}>
                      <label>
                        Place of Birth:
                        <input
                          {...register('birthplace')}
                          type="text"
                          style={styles.FieldStyle}
                        />
                      </label>
                    </li>

                    <li style={styles.ItemStyle}>
                      <label>
                        Date of Death:
                        <input
                          {...register('deathdate')}
                          type="date"
                          style={styles.DateFieldStyle}
                        />
                      </label>
                    </li>
                  </ul>

                  <div style={styles.ButtonDivStyle}>
                    <button type="submit" style={styles.ButtonStyle}>
                      Save
                    </button>

                    <button
                      type="button"
                      style={styles.GrayButtonStyle}
                      onClick={() => closeModal(close)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {view === 'relationship' && (
                <form onSubmit={handleSubmitRel(onSubmitRelationship)} style={styles.FormStyle}>
                  <ul style={styles.ListStyle}>
                    <li style={styles.ItemStyle}>
                      <label>
                        Relationship:
                        <select
                          {...registerRel('relationship', { required: true })}
                          style={{
                            fontFamily: 'Alata',
                            marginLeft: '10px',
                            width: '145px'
                          }}
                        >
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

                    {matPat.includes(selectedRelationship) && (
                      <li style={{ marginTop: '10px' }}>
                        <input
                          type="radio"
                          value="maternal"
                          {...registerRel('matPat')}
                        />{' '}
                        Maternal

                        <input
                          type="radio"
                          value="paternal"
                          {...registerRel('matPat')}
                          style={{ marginLeft: '10px' }}
                        />{' '}
                        Paternal
                      </li>
                    )}
                  </ul>

                  <div style={styles.ButtonDivStyle}>
                    <button type="submit" style={styles.ButtonStyle}>
                      Save
                    </button>

                    <button
                      type="button"
                      style={styles.GrayButtonStyle}
                      onClick={() => closeModal(close)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </Popup>
  );
}

export default EditFamilyMemberPopup;