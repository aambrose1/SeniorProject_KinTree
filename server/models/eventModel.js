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
      .from('events')
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
      .from('events')
      .select('*')
      .eq('user_id', userid)
      .order('date', { ascending: false }); // Show newest events first
    if (error) throw error;
    return data;
  },
};

module.exports = eventModel;