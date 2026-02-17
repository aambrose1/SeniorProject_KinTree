import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as UploadIcon } from '../../assets/upload.svg';
import { useCurrentUser } from '../../CurrentUserProvider'; 
import supabase from "../../supabaseClient";

function CreateEventPopup({ trigger, onEventCreated }) {
  const { register, handleSubmit, reset } = useForm();
  
  // Grab currentAccountID (the UUID) from context
  const { currentAccountID, currentUserName, loading } = useCurrentUser();

  const onSubmit = async (formData, close) => {
    // Check for currentAccountID because your table 'userid' column is a UUID
    if (!currentAccountID) {
      alert("User session not found. Please log in again.");
      return;
    }

    const newEvent = {
      title: formData.title,
      date: formData.date,
      description: formData.description || null,
      userid: currentAccountID, // Use the UUID to satisfy the database Foreign Key
    };

    const { data, error } = await supabase
      .from("event")
      .insert([newEvent])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      alert("Error: " + error.message);
      return;
    }

    if (onEventCreated) onEventCreated();
    reset();
    close();
  };

  return (
    <Popup trigger={trigger} modal>
      {close => (
        <div style={styles.DefaultStyle}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { reset(); close(); }}
              style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              <CloseIcon style={{ width: '40px', height: '40px', margin: '10px' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
              <h2 style={{ marginTop: '0px' }}>Create New Event</h2>
              <p style={{ fontSize: '12px' }}>Account: {currentUserName}</p>
            </div>

            <ul style={styles.ListStyle}>
              <div style={styles.TitleDateSection}>
                <li style={styles.ItemStyle}>
                  <label>*Title:
                    <input {...register("title", { required: true })} type="text" style={styles.FieldStyle} required />
                  </label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>*Date:
                    <input {...register("date", { required: true })} type="date" style={styles.DateFieldStyle} required />
                  </label>
                </li>
              </div>
              <br />
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <li style={{ alignContent: 'center', width: '70%' }}>
                  <textarea {...register("description")} placeholder="Add a description..." style={styles.TextAreaStyle} />
                </li>
              </div>
            </ul>

            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle} disabled={loading}>
                {loading ? "Loading..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default CreateEventPopup;