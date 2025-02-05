import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as ImportIcon } from '../../assets/import.svg';

// TODO:
// make sync contact button functional

function AddFamilyMemberPopup({ trigger }) {
  const { register, handleSubmit, reset } = useForm();

  // TODO: connect to backend
  const onSubmit = (data, close) => {
    console.log(data);
    reset();
    close();
  };

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
          {/* fill out info about family member */}
          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
              <h2 style={{ marginTop: '0px' }}>Add Family Member</h2>
            </div>

            {/* sync contacts button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                {/* TODO create handler */}
                <button onClick={() => { close(); }} style={styles.GrayButtonStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{display: 'flex', }}>Sync Contact</div>
                        <ImportIcon style={{ width: '20px', height: '20px', margin: '0px 0px 0px 10px' }} />
                    </div>
                    
                </button>
            </div>

            <ul style={styles.ListStyle}>
                {/* required fields */}
              <li style={styles.ItemStyle}>
                <label>
                  *First Name:
                  <input {...register("firstName", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                </label>
              </li>
              <li style={styles.ItemStyle}>
                <label>
                  *Last Name:
                  <input {...register("lastName", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                </label>
              </li>

              {/* note: might need to consider adding options to connect new family member to previous ones, to more accurately place them on tree */}
              <li style={styles.ItemStyle}>
                <label>
                  *Relationship:
                  <select {...register("relationship", { required: true })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }} defaultValue={''} required>
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

              {/* optional fields */}
              <br></br>
              <li style={styles.ItemStyle}>
                <label>
                  Location:
                  <input {...register("location")} type="text" placeholder="" style={styles.FieldStyle} />
                </label>
              </li>
              <li style={styles.ItemStyle}>
                <label>
                  Birth Date:
                  <input {...register("birthday")} type="text" placeholder="" style={styles.FieldStyle} />
                </label>
              </li>
              <li style={styles.ItemStyle}>
                <label>
                  Place of Birth:
                  <input {...register("birthplace")} type="text" placeholder="" style={styles.FieldStyle} />
                </label>
              </li>
              <li style={styles.ItemStyle}>
                <label>
                  Date of Death:
                  <input {...register("deathdate")} type="text" placeholder="" style={styles.FieldStyle} />
                </label>
              </li>
            </ul>
            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle}>Add</button>
            </div>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default AddFamilyMemberPopup;