const userInfo = require('../models/userModel');
const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');
const backupInfo = require('../models/backupModel');
const treeSummary = require('../models/treeSummaryModel');

const updateUserTreeSummary = async (req, res) => {
    const { userId } = req.params;
    try {
        const members = await treeMember.getMemberByUser(userId);
        const relationships = await relationship.getRelationshipByUser(userId);

        const summary = { members, relationships};

        const existing =  treeSummary.getSummaryByUser(userId);

        if(existing){
            await treeSummary.updateSummary(userId, summary);
        }
        else{
            await treeSummary.createSummary(userId,summary)
        }
        res.json({
            message: 'Tree summary updated'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to update tree summary'
        });
    }

};