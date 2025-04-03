const express = require('express');
const router = express.Router();

const {getSharedTreeById, getSharedTreeByToken, getSharedTreeBySender, getSharedTreebyReciever,shareTree, assignNewMemberRelationship, mergeMembers } = require('../controllers/sharedTreeController');

router.get('/:id', getSharedTreeById);
router.get('/token/:token', getSharedTreeByToken);
router.get('/sender/:id', getSharedTreeBySender);
router.get('/receiver/:id', getSharedTreebyReciever);
router.post('/share', shareTree);
router.post('/merge/:sharedTreeId', mergeMembers);
router.post('/assign-relationship', assignNewMemberRelationship);

module.exports = router;


