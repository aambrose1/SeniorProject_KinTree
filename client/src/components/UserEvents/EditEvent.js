import React from 'react';
import Popup from 'reactjs-popup';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import supabase from "../../supabaseClient";

function EditEventPopup({ trigger, event, onEventUpdated }) {

    const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: event.title,
      date: event.date,
      description: event.description
    }
  });

  const onSubmit = async (formData, close) => {
    const { data, error } = await supabase
      .from("event")
      .update({
        title: formData.title,
        date: formData.date,
        description: formData.description
      })
      .eq("id", event.id)
      .select(); // 1. THIS IS REQUIRED to get the new data back

    if (error) {
      alert("Error updating event: " + error.message);
    } else {
      // 2. THIS IS THE FIX: We must pass data[0] back to the dashboard. 
      // If we just put onEventUpdated(), it sends 'undefined' and causes the crash!
      if (onEventUpdated && data && data.length > 0) {
        onEventUpdated(data[0]); 
      } else if (onEventUpdated) {
        // Fallback just in case Supabase select() fails but update succeeds
        onEventUpdated({ ...event, ...formData }); 
      }
      close();
    }
  };

  return (
    <Popup trigger={trigger} modal>
      {close => (
        <div style={styles.DefaultStyle}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={close} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
              <CloseIcon style={{ width: '30px', height: '30px' }} />
            </button>
          </div>
          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <h2 style={{ textAlign: 'center' }}>Edit Event</h2>
            <ul style={styles.ListStyle}>
                <li style={styles.ItemStyle}>
                  <label>Title: <input {...register("title")} style={styles.FieldStyle} /></label>
                </li>
                <li style={styles.ItemStyle}>
                  <label>Date: <input type="date" {...register("date")} style={styles.DateFieldStyle} /></label>
                </li>
                <li style={styles.ItemStyle}>
                  <textarea {...register("description")} style={styles.TextAreaStyle} />
                </li>
            </ul>
            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle}>Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default EditEventPopup;