// memoryModel.js
const supabase = require('../lib/supabase');

const memoryModel = {
  /**
   * Creates a new memory record.
   * @param {object} memoryData - { description, date, file_url, file_type, profileID }
   * @returns {object} The newly created memory object
   */
  createMemory: async (memoryData) => {
    const { data: inserted, error } = await supabase
      .from('memories')
      .insert([memoryData])
      .select('*')
      .single();
    
    if (error) throw error;
    return inserted;
  },

  /**
   * Gets all memories for a specific profile.
   * @param {number} profileID - The integer ID of the profile.
   * @returns {Array<object>} A list of memory objects.
   */
  getMemoriesByProfileId: async (profileID) => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('profileID', profileID)
      .order('date', { ascending: false }); // Show newest memories first
    
    if (error) throw error;
    return data;
  },

  /**
   * Updates an existing memory.
   * @param {number|string} memoryId - The ID of the memory to update.
   * @param {object} updateData - Fields to update (e.g., description, date).
   * @returns {object} The updated memory object.
   */
  updateMemory: async (memoryId, updateData) => {
    const { data, error } = await supabase
      .from('memories')
      .update(updateData)
      .eq('id', memoryId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a specific memory.
   * @param {number|string} memoryId - The ID of the memory to delete.
   * @returns {object} The data of the deleted memory.
   */
  deleteMemory: async (memoryId) => {
    const { data, error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = memoryModel;