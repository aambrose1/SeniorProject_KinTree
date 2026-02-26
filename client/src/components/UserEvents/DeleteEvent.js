import React from 'react';
import supabase from "../../supabaseClient";

export async function deleteEvent(eventId, onDeleted) {
  const confirmed = window.confirm("Are you sure you want to delete this event?");
  
  if (confirmed) {
    const { error } = await supabase
      .from("event")
      .delete()
      .eq("id", eventId);

    if (error) {
      alert("Error deleting event: " + error.message);
    } else {
      if (onDeleted) onDeleted(eventId); // refreshes the dashboard list
    }
  }
}

