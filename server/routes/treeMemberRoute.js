const express = require('express');
const router = express.Router();


const { addTreeMember, editTreeMember,getMembersByUser, getMembersByOtherUser, deleteByUser, getMemberById, getActiveMemberId} = require('../controllers/treeMemberController');

router.post('/', addTreeMember);
router.put('/:id', editTreeMember);
router.get('/user/:userId', getMembersByUser);
router.get('/:id', getMemberById);
router.get('/active/:id', getActiveMemberId);


module.exports = router;