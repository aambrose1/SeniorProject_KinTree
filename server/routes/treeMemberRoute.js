const express = require('express');
const {addFamilyMember} = require('../controllers/treeMemberController');

const router = express.Router();

router.post('/', addFamilyMember);

module.exports = router;