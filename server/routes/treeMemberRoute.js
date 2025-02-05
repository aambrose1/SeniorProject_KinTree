const express = require('express');
const {addFamilyMember} = require('../controllers/treeMemberController');
const { updateMemberInfo } = require('../models/treeMemberModel');

const router = express.Router();

router.post('/', addFamilyMember);
router.put('/', updateMemberInfo);

module.exports = router;