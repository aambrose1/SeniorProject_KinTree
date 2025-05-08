const express = require('express');
const router = express.Router();

// Import controllers
const { addTreeMember, editTreeMember,getMembersByUser, getMembersByOtherUser, deleteByUser, getMemberById, getActiveMemberId  } = require('../controllers/treeMemberController');

// Define routes
router.post('/', addTreeMember);  // Add family member
router.put('/:id', editTreeMember);  // Update member info (with id in params)
router.get('/user/:userId', getMembersByUser);
router.get('/:id', getMemberById);
router.get('/active/:id', getActiveMemberId); // Assuming this is the correct route for getting active member by ID

module.exports = router;