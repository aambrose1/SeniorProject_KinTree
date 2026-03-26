// eventModel.js - model for events table
const supabase = require('../lib/supabase');
const User = require('./userModel'); // We'll need this to resolve user IDs

const eventModel = {
  /**
   * Creates a new event for a user.
   * @param {object} eventData - { title, date, description, user_id }
   * @returns {object} The newly created event object
   */
  createEvent: async (eventData) => {
    const { data: inserted, error } = await supabase
      .from('event')
      .insert([eventData])
      .select('*')
      .single();
    if (error) throw error;
    return inserted;
  },

  /**
   * Gets all events for a specific user.
   * @param {number} userid - The integer ID of the user.
   * @returns {Array<object>} A list of event objects.
   */
  getEventsByUserId: async (userid) => {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .eq('userid', userid)
      .order('date', { ascending: false }); // Show newest events first
    if (error) throw error;
    return data;
  },

/**
   * Updates an existing event.
   * @param {number|string} eventId - The ID of the event to update.
   * @param {object} updateData - An object containing the fields to update (title, date, description).
   * @returns {object} The updated event object.
   */
  updateEvent: async (eventId, updateData) => {
    const { data, error } = await supabase
      .from('event')
      .update(updateData)
      .eq('id', eventId)
      .select('*') // Grabs the newly updated data back from the DB
      .single();   // Returns the single object instead of an array

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a specific event.
   * @param {number|string} eventId - The ID of the event to delete.
   * @returns {object} The data of the deleted event.
   */
  deleteEvent: async (eventId) => {
    const { data, error } = await supabase
      .from('event')
      .delete()
      .eq('id', eventId)
      .select() // Optional: Returns the deleted row data just in case you need it
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = eventModel;