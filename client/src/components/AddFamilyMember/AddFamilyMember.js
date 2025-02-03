import React from 'react';
import { Popup } from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css'
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';

// TODO:
// clear form when dismissed without submitting
// close form when submitted
// make close button functional
// add sync contact button (functionality will probably come later)

function AddFamilyMemberPopup ({ trigger }) {
    const { register, handleSubmit, reset } = useForm();

    // TODO: make this a real function + connect to backend
    const onSubmit = data => {
        console.log(data)
        // TODO close modal
        reset();
    };

    return(
        <Popup trigger={trigger} style={styles.DefaultStyle} modal>
            {/* close button */}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button style={{border: 'none', backgroundColor: 'transparent', cursor: 'pointer'}}>
                    <CloseIcon style={{width: '40px', height: '40px', margin: '10px 10px 0px 10px'}}/>
                </button>
            </div>
                {/* fill out info about family member */}
                <form onSubmit={handleSubmit(onSubmit)} style={styles.FormStyle}>
                    <div style={{textAlign: 'center', fontFamily: 'Alata'}}>
                        <h2 style={{marginTop: '0px'}}>Add Family Member</h2>
                    </div>
                    
                    <ul style={styles.ListStyle}>
                        {/* required fields */}
                        <li style={styles.ItemStyle}>
                            <label>
                            First Name:
                            <input {...register("firstName", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required/>
                            </label>
                        </li>
                        <li style={styles.ItemStyle}>
                            <label>
                            Last Name:
                            <input {...register("lastName", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required/>
                            </label>
                        </li>
                        <li style={styles.ItemStyle}>
                            <label>
                            Relationship:
                            <select {...register("relationship", { required: true })} style={{fontFamily: 'Alata', marginLeft: '10px', width: '145px'}} required>
                                <option value="none" defaultValue disabled hidden>Select</option>
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
        </Popup>
    )
}

export default AddFamilyMemberPopup;