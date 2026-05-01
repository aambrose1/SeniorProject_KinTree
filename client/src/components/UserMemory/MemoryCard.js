//MemoryCard.js
import React from 'react';
import EditMemoryPopup from './EditMemory';
import * as styles from './styles'; 

const MemoryCard = ({ memory, onDeleted, onUpdated }) => {

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/memories/${memory.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleted(memory.id);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete'}`);
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px', width: '300px', backgroundColor: '#f9f9f9' }}>
      <img 
        src={memory.file_url} 
        alt="Memory" 
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
      />
      <p style={{ marginTop: '10px', fontWeight: 'bold', fontFamily: 'Alata' }}>{memory.date}</p>
      <p style={{ fontFamily: 'Alata' }}>{memory.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
        <EditMemoryPopup memory={memory} onMemoryUpdated={onUpdated} />

        {/* The Delete Button */}
        <button 
          onClick={handleDelete}
          style={{ 
            backgroundColor: '#e63946', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            padding: '5px 10px', 
            cursor: 'pointer',
            fontFamily: 'Alata'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MemoryCard;