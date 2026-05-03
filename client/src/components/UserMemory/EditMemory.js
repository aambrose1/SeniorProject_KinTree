//EditMemory.js
import React from 'react';
import Popup from 'reactjs-popup';
import { useForm } from 'react-hook-form';
import * as styles from './styles';

function EditMemoryPopup({ memory, onMemoryUpdated }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      description: memory.description,
      date: memory.date
    }
  });

  const onSubmit = async (data, close) => {
    try {
      const response = await fetch(`http://localhost:5000/api/memories/${memory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedMemory = await response.json();
        onMemoryUpdated(updatedMemory);
        close();
      }
    } catch (error) {
      console.error("Error updating memory:", error);
    }
  };

  return (
    <Popup trigger={<button style={{cursor: 'pointer'}}>Edit</button>} modal>
      {close => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Edit Memory</h3>
          <form onSubmit={handleSubmit(d => onSubmit(d, close))}>
            <textarea {...register("description")} style={{width: '90%', height: '80px', marginBottom: '10px'}} />
            <input {...register("date")} type="date" style={{display: 'block', margin: '10px auto'}} />
            <button type="submit">Save Changes</button>
            <button type="button" onClick={close}>Cancel</button>
          </form>
        </div>
      )}
    </Popup>
  );
}

export default EditMemoryPopup;