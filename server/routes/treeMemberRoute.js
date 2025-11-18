const express = require('express');
const router = express.Router();


const { addTreeMember, editTreeMember,getMembersByUser, getMembersByOtherUser, deleteByUser, getMemberById, getActiveMemberId, getMemberbyMemberId } = require('../controllers/treeMemberController');

router.post('/', addTreeMember);
router.put('/:id', editTreeMember);
router.get('/user/:userId', getMembersByUser);
router.get('/:id', getMemberById);
router.get('/active/:id', getActiveMemberId);
router.get('/member/:id', getMemberbyMemberId);


module.exports = router;