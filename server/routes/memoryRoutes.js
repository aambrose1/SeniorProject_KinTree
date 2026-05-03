// memoryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const memoryController = require('../controllers/memoryController');

// Configure multer to hold the incoming file in RAM temporarily
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/memories
// Creates a new memory (intercepts 'fileUpload' from FormData)
router.post('/', upload.single('fileUpload'), memoryController.handleCreateMemory);

// GET /api/memories/:profileID
// Gets all memories for a specific user by their profileID
router.get('/:profileID', memoryController.handleGetMemories);

// PUT /api/memories/:id
// Updates an existing memory by its memory ID
router.put('/:id', memoryController.handleUpdateMemory);

// DELETE /api/memories/:id
// Deletes a memory by its memory ID
router.delete('/:id', memoryController.handleDeleteMemory);

module.exports = router;