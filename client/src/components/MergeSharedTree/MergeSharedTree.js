import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from 'react-hook-form';
import * as styles from './styles';
import './popup.css';
import { ReactComponent as CloseIcon } from '../../assets/exit.svg';
const defaultAvatar = require('../../assets/default-avatar.png');

// TODO: make form clear when dismissed by clicking outside of modal

// data is in form of 
// { "id": "0", rels: { "father": "5", "mother": "6", "spouses": ["2"], "children": ["1"] }, "data": { "first name": "John", "last name": "Smith", "avatar": "<link>" } }
const CheckboxList = ({ items }) => {
    const { register } = useForm();
    return (
      <div style={styles.CheckboxListStyle}>
        {items.map((item, index) => (
          <label key={index} style={styles.ItemStyle}>
            <input {...register(`${item.id}`)} type="checkbox" value={item.id} />
            <img 
              src={item.data["avatar"] ? item.data["avatar"] : defaultAvatar}
              alt={`${item.data["first name"]} ${item.data["last name"]}`}
              style={{ width: '40px', height: '40px', margin: '0 10px', borderRadius: '50%' }} 
            />
            {`${item.data["first name"]} ${item.data["last name"]}`}
          </label>
        ))}
      </div>
    );
  };

function MergeSharedTreePopup({ trigger , data }) {
  const { handleSubmit, reset } = useForm();

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
            <div style={{ textAlign: 'center', fontFamily: 'Alata', padding: '20px' }}>
              <h2 style={{ marginTop: '0px' }}>Merge Shared Tree</h2>
              <p>Select family members that you would like to merge into your own base tree.</p>
            </div>

            {/* dynamically generated list of members, checkbox listings */}
            <CheckboxList items={data} />

            <div style={styles.ButtonDivStyle}>
              <button type="submit" style={styles.ButtonStyle}>Merge</button>
            </div>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default MergeSharedTreePopup;