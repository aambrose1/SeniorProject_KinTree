const express = require('express');
const { getRelationships } = require('../controllers/relationshipController');

const router = express.Router();

router.get('/:id', getRelationships);

module.exports = router;