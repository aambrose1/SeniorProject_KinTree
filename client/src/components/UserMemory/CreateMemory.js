//CreateMemory.js
import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as UploadIcon } from '../../assets/upload.svg';

function CreateMemoryPopup({ trigger, profileID, onMemoryCreated }) { 
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data, close) => {
    try {
      // STRICT CHECK: Stop execution if profileID is missing from props
      if (!profileID) {
        alert("Error: A valid profile is required to create a memory.");
        return;
      }

      const formData = new FormData();
      
      formData.append('description', data.description);
      formData.append('date', data.date);
      
      // Unconditionally append profileID since we enforced it above
      formData.append('profileID', profileID);
      console.log("DEBUG: Appending profileID:", profileID);

      if (data.fileUpload && data.fileUpload.length > 0) {
        formData.append('fileUpload', data.fileUpload[0]);
      } else {
        alert("Please upload an image!");
        return;
      }

      const response = await fetch('http://localhost:5000/api/memories', { 
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully saved memory:', result);

      if (onMemoryCreated) {
        onMemoryCreated(result); 
      }

      reset();
      close();

    } catch (error) {
      console.error('Error creating memory:', error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  return (
    <Popup trigger={trigger} modal>
      {close => (
        <div style={styles.DefaultStyle}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { reset(); close(); }} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <CloseIcon style={{ width: '40px', height: '40px', margin: '10px 10px 0px 10px' }} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
              <h2 style={{ marginTop: '0px' }}>Create New Memory</h2>
            </div>

            <ul style={styles.ListStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <li style={{alignContent: 'center', width: '70%'}}>
                      <textarea {...register("description", { required: true })} placeholder="Add a caption..." style={styles.TextAreaStyle} required />
                    </li>
                </div>

                <br />

                <div style={styles.DateSection}>
                  <li style={styles.ItemStyle}>
                      <label>
                        *Date:
                        <input {...register("date", { required: true })} type="date" style={styles.DateFieldStyle} required />
                      </label>
                  </li> 
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                          {...register("fileUpload", { required: true })} 
                          type="file" 
                          id="fileUpload" 
                          style={styles.FileUploadDefault} 
                          accept="image/*" 
                        />
                        <label htmlFor="fileUpload" style={styles.GrayButtonStyle}>
                            Upload Media
                            <UploadIcon style={{ width: '20px', height: '20px', margin: '0px 0px 0px 10px' }} />
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

export default CreateMemoryPopup;