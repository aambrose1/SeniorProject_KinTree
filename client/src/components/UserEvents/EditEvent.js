import React from 'react';
import Popup from 'reactjs-popup';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { SERVER_URL } from '../../config/urls';

function EditEventPopup({ trigger, event, onEventUpdated }) {

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: event.title,
      date: event.date,
      description: event.description
    }
  });

  const onSubmit = async (formData, close) => {
    
    // 1. Prepare the payload
    const updatePayload = {
      title: formData.title,
      date: formData.date,
      description: formData.description
    };

    console.log(`FRONTEND: Sending PUT request for Event ID ${event.id} ->`, updatePayload);

    try {
      const response = await fetch(`${SERVER_URL}/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      const updatedEventData = await response.json();

      console.log("FRONTEND: Server responded with updated event ->", updatedEventData);

      if (onEventUpdated && updatedEventData) {
        onEventUpdated(updatedEventData); 
      } else if (onEventUpdated) {
        onEventUpdated({ ...event, ...formData }); 
      }
      close();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event: " + error.message);
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