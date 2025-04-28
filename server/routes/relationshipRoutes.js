const express = require('express');
const router = express.Router();
const { getRelationships, getRelationshipsByUser, getRelationshipsByOtherUser, addRelationship, filterBySide, deleteByUser} = require('../controllers/relationshipController');


router.post('/', addRelationship);
router.get('/:id', getRelationships);
routter.get('/user/:id', getRelationshipsByUser);
router.get('/assignedUser/:id', getRelationshipsByOtherUser);
router.get('/family-side/:id', filterBySide);
router.delete('/remove/:id', deleteByUser);

module.exports = router;