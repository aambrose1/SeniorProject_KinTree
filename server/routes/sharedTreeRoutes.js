const express = require('express');
const router = express.Router();

const {getSharedTreeById, getSharedTreeByToken, getSharedTreeBySender, getSharedTreebyReceiver,shareTree, assignNewMemberRelationship, mergeMembers, deleteSharedTree, sendEmail, processPendingInvitations, updateSharedTreeStatus } = require('../controllers/sharedTreeController');

router.get('/:id', getSharedTreeById);
router.get('/token/:token', getSharedTreeByToken);
router.get('/sender/:id', getSharedTreeBySender);
router.get('/receiver/:id', getSharedTreebyReceiver);
router.post('/share', shareTree);
router.post('/merge/:sharedTreeId', mergeMembers);
router.post('/assign-relationship', assignNewMemberRelationship);
router.post('/process-pending', processPendingInvitations);
router.patch('/:id/status', updateSharedTreeStatus);
router.delete('/:id', deleteSharedTree);

module.exports = router;


