const express = require('express');
const router = express.Router();
const { getRelationships, getRelationshipsByUser, editRelationship, getRelationshipsByOtherUser, addRelationship, filterBySide, deleteByUser} = require('../controllers/relationshipController');


router.post('/', addRelationship);
router.get('/:id', getRelationships);
router.get('/user/:id', getRelationshipsByUser);
router.patch('/relationship/edit/:id', editRelationship);
router.get('/assignedUser/:id', getRelationshipsByOtherUser);
router.get('/family-side/:id', filterBySide);
router.delete('/remove/:id', deleteByUser);

module.exports = router;