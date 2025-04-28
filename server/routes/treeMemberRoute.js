const express = require('express');
const router = express.Router();

// Import controllers
const { addTreeMember, editTreeMember,getMembersByUser, getMembersByOtherUser, deleteByUser  } = require('../controllers/treeMemberController');

// Define routes
router.post('/', addTreeMember);  // Add family member
router.put('/:id', editTreeMember);  // Update member info (with id in params)
router.get('/user/:id', getMembersByUser);
router.get('/assignedUser/:id', getMembersByOtherUser);
router.delete('/remove/:id', deleteByUser);

module.exports = router;

