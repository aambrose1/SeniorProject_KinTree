// eventController.js
const eventModel = require('../models/eventModel');
const User = require('../models/userModel'); // To resolve auth_uid to user_id

/**
 * Handle POST request to create a new event
 */
const handleCreateEvent = async (req, res) => {
  try {
    const { title, date, description, auth_uid } = req.body;

    // 1. Find the internal user ID from the Supabase auth_uid
    const userIdInt = await User.resolveUserIdFromAuthUid(auth_uid);
    if (!userIdInt) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Prepare event data
    const eventData = {
      title,
      date,
      description,
      userid: userIdInt,
    };

    // 3. Create the event
    const newEvent = await eventModel.createEvent(eventData);
    res.status(201).json(newEvent);

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
};

/**
 * Handle GET request to fetch all events for a user
 */
const handleGetEvents = async (req, res) => {
  try {
    const { auth_uid } = req.params;

    // 1. Find the internal user ID
    const userIdInt = await User.resolveUserIdFromAuthUid(auth_uid);
    if (!userIdInt) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Fetch events
    const events = await eventModel.getEventsByUserId(userIdInt);
    res.status(200).json(events);

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
};

/**
 * Handle PUT request to update an existing event
 */
const handleUpdateEvent = async (req, res) => {
  try {
    // Grab the event ID from the URL parameters
    const { id } = req.params; 
    // Grab the updated fields from the request body
    const { title, date, description } = req.body; 

    const updateData = { title, date, description };

    const updatedEvent = await eventModel.updateEvent(id, updateData);
    
    // Return the newly updated event to the frontend
    res.status(200).json(updatedEvent);

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
};

/**
 * Handle DELETE request to remove an event
 */
const handleDeleteEvent = async (req, res) => {
  try {
    // Grab the event ID from the URL parameters
    const { id } = req.params; 

    const deletedEvent = await eventModel.deleteEvent(id);
    
    // Send a success message back
    res.status(200).json({ message: 'Event deleted successfully', deletedEvent });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
};

module.exports = {
  handleCreateEvent,
  handleGetEvents,
  handleUpdateEvent,
  handleDeleteEvent, // Export the new controllers
};