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
      user_id: userIdInt,
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

module.exports = {
  handleCreateEvent,
  handleGetEvents,
};