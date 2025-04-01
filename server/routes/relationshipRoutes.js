const express = require('express');
const router = express.Router();
const { getRelationships, addRelationship, filterBySide } = require('../controllers/relationshipController');


router.post('/', addRelationship);
router.get('/:id', getRelationships);
router.get('/family-side/:id', filterBySide);

module.exports = router;