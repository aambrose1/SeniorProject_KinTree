const express = require('express');
const router = express.Router();

// Import controllers
const { addTreeMember, editTreeMember } = require('../controllers/treeMemberController');

// Define routes
router.post('/', addTreeMember);  // Add family member
router.put('/:id', editTreeMember);  // Update member info (with id in params)

module.exports = router;

