
const userInfo = require('../models/userModel');
const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');
const backupInfo = require('../models/backupModel');

const backupUser = async (req, res) => {
    try{
        const { id } = req.params;
        // Resolve UUID to integer if needed
        const User = require('../models/userModel');
        const userIdInt = await User.resolveUserIdFromAuthUid(id) || id;
        
        const user = await userInfo.findById(userIdInt);
        if(!user) {
            return res.status(404).json({ error: "User not found"});
        }
        const tree = await treeMember.getMembersByUser(userIdInt);
        const relationships = await relationship.getRelationshipByUser(userIdInt);
        const sharedTree = await sharedTrees.getSharedTreebySender(userIdInt);

        const data = {
            user, 
            tree,
            relationships,
            sharedTree
        };

        await backupInfo.addBackup(userIdInt, JSON.stringify(data));
        res.json({
            message: 'Backup completed'
        });
    }
    catch (error){
        console.error(error);
        res.status(500).json({
            error: 'Error backing up data',
            details: error.message
        });
    }
};

const restoreUser = async (req, res) => {
    try{
        const {id} = req.params;
        // Resolve UUID to integer if needed
        const User = require('../models/userModel');
        const userIdInt = await User.resolveUserIdFromAuthUid(id) || id;
        
        const existingUser = await userInfo.findById(userIdInt);
        if(!existingUser){
            return res.status(404).json({
                error: "User not found. No data to restore"
            })
        }

        const backup = await backupInfo.getLatestBackup(userIdInt);
        if(!backup) {
            return res.status(404).json({
                error: "No backup available"
            })
        }
        
        const backupData = JSON.parse(backup.backupdata || backup.backupData);

        for( const member of backupData.tree) {
            const exists= await treeMember.getMemberById(member.id)
            if (!exists){
                await treeMember.addMember(member);
            }
    
        }
        for( const relation of backupData.relationships) {
            const exists = await relationship.getRelationshipbyId(relation.person1_id, relation.person2_id);
            if (!exists){
                await relationship.addRelationship(relation);
            }
        }

        for (const tree of backupData.sharedTree) {
            const exists = await sharedTrees.getSharedTreeById(tree.id);
            if (!exists){
                await sharedTrees.addSharedTree(tree);
            }
        }

        res.json({
            message: "Data that was backed up restored"
        })
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            error: "Error during restore"
        });
    }
};

module.exports = {backupUser, restoreUser};