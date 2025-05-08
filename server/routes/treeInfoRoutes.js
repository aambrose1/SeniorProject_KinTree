const express = require('express');
const router = express.Router();

const { addObject, updateObject, getObject } = require('../controllers/treeInfoController');

router.post('/', addObject); 
router.put('/:id', updateObject);
router.get('/:id', getObject);

module.exports = router;

