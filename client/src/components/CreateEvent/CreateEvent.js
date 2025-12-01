import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as UploadIcon } from '../../assets/upload.svg';
import React, { useState, useEffect } from 'react';
import supabase from "../../supabaseClient";

function CreateEventPopup({ trigger, onEventCreated }) {
  const { register, handleSubmit, reset } = useForm();

  // Local user state (safer than broken provider)
  const [currentUser, setCurrentUser] = useState(null);

  // Load Supabase user session
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error loading session:", error);
        return;
      }

      if (data?.session?.user) {
        const user = data.session.user;
        setCurrentUser({
          auth_uid: user.id,
          email: user.email,
        });
      } else {
        console.warn("No active user session found.");
      }
    };

    loadUser();
  }, []);

  // Create Event Submission
  const onSubmit = async (formData, close) => {
    if (!currentUser) {
      console.error("No current user — cannot create event.");
      return;
    }

    const newEvent = {
      title: formData.title,
      date: formData.date,
      description: formData.description || null,
      userid: currentUser.auth_uid,
    };

    const { data, error } = await supabase
      .from("event")
      .insert([newEvent])
      .select();

    if (error) {
      console.error("Error creating event:", error);
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

          {/* Close Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { reset(); close(); }}
              style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              <CloseIcon style={{ width: '40px', height: '40px', margin: '10px' }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
              <h2 style={{ marginTop: '0px' }}>Create New Event</h2>
            </div>

            <ul style={styles.ListStyle}>
              <div style={styles.TitleDateSection}>
                <li style={styles.ItemStyle}>
                  <label>
                    *Title:
                    <input
                      {...register("title", { required: true })}
                      type="text"
                      style={styles.FieldStyle}
                      required
                    />
                  </label>
                </li>

                <li style={styles.ItemStyle}>
                  <label>
                    *Date:
                    <input
                      {...register("date", { required: true })}
                      type="date"
                      style={styles.DateFieldStyle}
                      required
                    />
                  </label>
                </li>
              </div>

              <br />

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <li style={{ alignContent: 'center', width: '70%' }}>
                  <textarea
                    {...register("description")}
                    placeholder="Add a description..."
                    style={styles.TextAreaStyle}
                  />
                </li>
              </div>

              {/* Upload Button (not implemented yet) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="file"
                    id="fileUpload"
                    style={styles.FileUploadDefault}
                  />
                  <label htmlFor="fileUpload" style={styles.GrayButtonStyle}>
                    Upload Media
                    <UploadIcon style={{ width: '20px', height: '20px', marginLeft: '10px' }} />
                  </label>
                </div>
              </div>

            </ul>

            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle}>Post</button>
            </div>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default CreateEventPopup; 