import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as ImportIcon } from '../../assets/import.svg';

// TODO: make form clear when dismissed by clicking outside of modal
//       make sync contact button functional

function AddFamilyMemberPopup({ trigger }) {
  const { register, setValue, handleSubmit, reset } = useForm();
  const [manual, setManual] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberRelationship, setSelectedMemberRelationship] = useState(null);

  let matPat = ["parent", "cousin", "aunt", "uncle", "grandparent", "niece", "nephew"];

  const closeModal = () => {
    setManual(false);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedMember(null);
    setSelectedMemberRelationship(null);
    reset();
  };

  // TODO: connect to backend
  const onSubmit = (data, close) => {
    console.log(data);
    reset();
    close();
  };

  useEffect(() => {
    if (searchTerm === "") {
      setSearchResults([]);
      return;
    }

    // Simulate an API call
    const fetchResults = async () => {
      // Replace this with your actual API call
      const results = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
        { id: 3, name: "Alice Johnson" }
      ].filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setSelectedMember(null);
      setSearchResults(results);
    };

    fetchResults();
  }, [searchTerm]);

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

            <form onSubmit={handleSubmit(data => onSubmit(data, close))}> 
              <div style={styles.MainContainerStyle}>
                <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
                  <h2 style={{ marginTop: '0px', margin: '0' }}>Add Family Member</h2>
                </div>
                
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
                            name="selectedMember"
                            value={result.id}
                            onChange={() => {
                              setSelectedMember(result.id);
                              setValue("selectedMember", result.id);
                            }}
                            checked={selectedMember === result.id}
                            // {...register("selectedMember", { required: true })} // TODO make work
                          />
                          <Link to={`/account/${result.id}`} style={{ marginLeft: '10px' }}>
                            {result.name}
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
                    <select style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }} defaultValue={''} onChange={e => setSelectedMemberRelationship(e.target.value)}>
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
                  <input type="radio" name="matPat" value="maternal" /> Maternal
                  <input type="radio" name="matPat" value="paternal" /> Paternal
                </div>

                {/* add button */}
                <div style={styles.ButtonDivStyle}>
                  <button type="submit" onClick={() => { close(); }} disabled={selectedMemberRelationship === null ? true : false} style={styles.ButtonStyle}>Add</button>
                </div>

                <div>
                  <button onClick={() => {setManual(true); setSelectedMember(null); setSelectedMemberRelationship(null);}} style={styles.GrayButtonStyle}>Can't find your family member?</button>
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
            <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
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
                    <select {...register("relationship", { required: true })} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }} defaultValue={''} onChange={e => setSelectedMemberRelationship(e.target.value)} required>
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
                  <input type="radio" name="matpatflag" value="maternal" /> Maternal
                  <input type="radio" name="matpatflag" value="paternal" /> Paternal
                </div>

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
                    <input {...register("birthday")} type="date" placeholder="" style={styles.DateFieldStyle} />
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
                    <input {...register("deathdate")} type="date" placeholder="" style={styles.DateFieldStyle} />
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