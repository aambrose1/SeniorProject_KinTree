import React, { useState } from 'react';
import * as styles from './styles';
import EditEventPopup from './EditEvent'; 
import { deleteEvent } from './DeleteEvent'; 
export function EventCard({ event, onRefresh }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const characterLimit = 150; 
  const description = event.description || "";
  const isLongText = description.length > characterLimit;

  const displayText = isExpanded 
    ? description 
    : description.substring(0, characterLimit) + (isLongText ? "..." : "");

  return (
    <div style={styles.CardContainer}>
      <h2 style={{ marginBottom: '5px' }}>{event.title}</h2>
      <p style={{ ...styles.TextStyle, fontSize: '0.85em', color: '#666', margin: '0' }}>
        {new Date(event.date).toLocaleDateString()}
      </p>

      <hr style={styles.Divider} />

      <p style={styles.TextStyle}>
        {displayText}
      </p>

      {isLongText && (
        <span 
          style={styles.ToggleText} 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </span>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
        
        {/* EDIT ACTION: */}
        <EditEventPopup 
          event={event} 
          onEventUpdated={onRefresh}
          trigger={<button style={styles.GrayButtonStyle}>Edit</button>} 
        />

        {/* DELETE ACTION: */}
        <button 
          style={{ ...styles.GrayButtonStyle, backgroundColor: '#ffcccc' }} 
          onClick={() => deleteEvent(event.id, onRefresh)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}