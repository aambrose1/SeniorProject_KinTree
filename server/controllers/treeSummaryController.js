const userInfo = require('../models/userModel');
const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');
const backupInfo = require('../models/backupModel');
const treeSummary = require('../models/treeSummaryModel');

const updateUserTreeSummary = async (req, res) => {
    const { userId } = req.params;
    try {
        // Resolve UUID to integer if needed
        const User = require('../models/userModel');
        const userIdInt = await User.resolveUserIdFromAuthUid(userId) || userId;
        
        const members = await treeMember.getMembersByUser(userIdInt);
        const relationships = await relationship.getRelationshipByUser(userIdInt);

        const summary = { members, relationships};

        const existing = await treeSummary.getSummaryByUser(userIdInt);

        if(existing){
            await treeSummary.updateSummary(userIdInt, summary);
        }
        else{
            await treeSummary.createSummary(userIdInt, summary);
        }
        res.json({
            message: 'Tree summary updated'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to update tree summary',
            details: error.message
        });
    }

};