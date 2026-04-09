const express = require('express');
const router = express.Router();


const { 
    addTreeMember, editTreeMember, getMembersByUser, 
    getMembersByOtherUser, deleteByUser, deleteTreeMember, 
    getMemberById, getActiveMemberId, getMemberbyMemberId,
    clearFamilyTree 
} = require('../controllers/treeMemberController');

router.post('/', addTreeMember);
router.put('/:id', editTreeMember);
router.delete('/clear/:userId', clearFamilyTree);
router.delete('/:id', deleteTreeMember);
router.get('/user/:userId', getMembersByUser);
router.get('/:id', getMemberById);
router.get('/active/:id', getActiveMemberId);
router.get('/member/:id', getMemberbyMemberId);


module.exports = router;