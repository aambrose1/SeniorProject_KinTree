import React from 'react';
// We no longer need the supabase client here!

export async function deleteEvent(eventId, onDeleted) {
  const confirmed = window.confirm("Are you sure you want to delete this event?");
  
  if (confirmed) {
    console.log("THE EVENT ID IS:", eventId);
    try {
      // Send the DELETE request with the eventId in the URL
      // Update the localhost URL if your server runs on a different port
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      // If successful, trigger the callback to refresh the dashboard list
      if (onDeleted) onDeleted(eventId); 

    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event: " + error.message);
    }
  }
}