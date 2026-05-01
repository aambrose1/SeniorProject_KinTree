// memoryController.js
const memoryModel = require('../models/memoryModel');
const supabase = require('../lib/supabase'); // Needed here to access Storage

/**
 * Handle POST request to create a new memory with an image
 */
const handleCreateMemory = async (req, res) => {
  try {
    console.log("BACKEND RECEIVED BODY:", req.body);

    const { description, date, profileID } = req.body;
    const file = req.file; 

    // STRICT CHECK: Reject if no profileID is provided
    if (!profileID) {
      return res.status(400).json({ error: 'profileID is strictly required.' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    // Prepare file path for Supabase Storage (strictly using profileID)
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
    const filePath = `${profileID}/${fileName}`;

    // Upload the file buffer to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('memory-files') 
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) throw storageError;

    // Get the Public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('memory-files')
      .getPublicUrl(filePath);

    // Prepare data for the database (strictly using profileID)
    const memoryData = {
      description,
      date,
      file_url: publicUrl,
      file_type: file.mimetype,
      profileID: profileID, 
    };

    // Create the memory record
    const newMemory = await memoryModel.createMemory(memoryData);
    res.status(201).json(newMemory);

  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Error creating memory' });
  }
};

/**
 * Handle GET request to fetch all memories for a profile
 */
const handleGetMemories = async (req, res) => {
  try {
    const { profileID } = req.params;
    
    const memories = await memoryModel.getMemoriesByProfileId(profileID);
    res.status(200).json(memories);

  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Error fetching memories' });
  }
};

/**
 * Handle PUT request to update an existing memory (text fields only)
 */
const handleUpdateMemory = async (req, res) => {
  try {
    const { id } = req.params; 
    const { description, date } = req.body; 

    const updateData = { description, date };

    const updatedMemory = await memoryModel.updateMemory(id, updateData);
    res.status(200).json(updatedMemory);

  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Error updating memory' });
  }
};

/**
 * Handle DELETE request to remove a memory
 */
const handleDeleteMemory = async (req, res) => {
  try {
    const { id } = req.params; 

    // Note: This currently only deletes the database row. 
    // To be fully clean, also use supabase.storage.from(...).remove() 
    // to delete the actual image file using the file path.
    const deletedMemory = await memoryModel.deleteMemory(id);
    res.status(200).json({ message: 'Memory deleted successfully', deletedMemory });

  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Error deleting memory' });
  }
};

module.exports = {
  handleCreateMemory,
  handleGetMemories,
  handleUpdateMemory,
  handleDeleteMemory, 
};