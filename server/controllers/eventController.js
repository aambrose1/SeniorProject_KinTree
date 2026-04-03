// eventController.js
const eventModel = require('../models/eventModel');
// We don't even need the UserModel anymore!

/**
 * Handle POST request to create a new event
 */
const handleCreateEvent = async (req, res) => {
  try {
    const { title, date, description, auth_uid } = req.body;

    const eventData = {
      title,
      date,
      description,
      userid: auth_uid, 
    };

    // Create the event
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
    
    const events = await eventModel.getEventsByUserId(auth_uid);
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
    const { id } = req.params; 
    const { title, date, description } = req.body; 

    const updateData = { title, date, description };

    const updatedEvent = await eventModel.updateEvent(id, updateData);
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
    const { id } = req.params; 

    const deletedEvent = await eventModel.deleteEvent(id);
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
  handleDeleteEvent, 
};