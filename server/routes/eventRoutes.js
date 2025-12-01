// eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// POST /api/events
// Creates a new event
router.post('/', eventController.handleCreateEvent);

// GET /api/events/:auth_uid
// Gets all events for a specific user by their auth_uid
router.get('/:auth_uid', eventController.handleGetEvents);

module.exports = router;