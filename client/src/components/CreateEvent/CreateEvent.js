import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
import { ReactComponent as UploadIcon } from '../../assets/upload.svg';

function CreateEventPopup({ trigger }) {
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
        {/* fill out info about event */}
          <form onSubmit={handleSubmit(data => onSubmit(data, close))} style={styles.FormStyle}>
            <div style={{ textAlign: 'center', fontFamily: 'Alata' }}>
              <h2 style={{ marginTop: '0px' }}>Create New Event</h2>
            </div>

            <ul style={styles.ListStyle}>
                {/* required fields */}
            <div style={styles.TitleDateSection}>
               <li style={styles.ItemStyle}>
                <label>
                  *Title:
                  <input {...register("title", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                </label>
              </li>
              <li style={styles.ItemStyle}>
                <label>
                  *Date:
                  <input {...register("date", { required: true })} type="date" placeholder="" style={styles.DateFieldStyle} required />
                </label>
              </li> 
            </div>
              

              {/* optional fields */}
              <br></br>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <li style={{alignContent: 'center', width: '70%'}}>
                  <textarea {...register("description")} type="text" placeholder="Add a description..." style={styles.TextAreaStyle} />
                </li>
              </div>
              

                {/* upload media button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    {/* TODO create handler */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="file" id="fileUpload" style={styles.FileUploadDefault} name="fileUpload"/>
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

export default CreateEventPopup;