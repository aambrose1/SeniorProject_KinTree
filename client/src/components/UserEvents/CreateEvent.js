import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as UploadIcon } from '../../assets/upload.svg';
import { useCurrentUser } from '../../CurrentUserProvider'; 
import { supabase } from "../../utils/supabaseClient";

function CreateEventPopup({ trigger, onEventCreated }) {
  const { register, handleSubmit, reset } = useForm();
  
  const { currentUserName, loading } = useCurrentUser();

  const onSubmit = async (formData, close) => {
    const { data: { session } } = await supabase.auth.getSession();
    const trueUuid = session?.user?.id;

    if (!trueUuid) {
      alert("User session not found.");
      return;
    }

    const eventPayload = {
      title: formData.title,
      date: formData.date,
      description: formData.description || null,
      auth_uid: trueUuid, 
    };

    console.log("FRONTEND: Sending payload to server ->", eventPayload);
    
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const newEventData = await response.json();

      if (onEventCreated && newEventData) onEventCreated(newEventData); 
      
      reset();
      close();
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Error creating event: " + error.message);
    }
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