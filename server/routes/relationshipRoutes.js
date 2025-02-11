const express = require('express');
const router = express.Router();
const { getRelationships, addRelationship} = require('../controllers/relationshipController');

router.post('/', addRelationship);
router.get('/:id', getRelationships);

module.exports = router;