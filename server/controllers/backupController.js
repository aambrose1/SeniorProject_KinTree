
const userInfo = require('../models/userModel');
const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');
const backupInfo = require('../models/backupModel');
const backupUser = async (id) => {
    try{
        const user = await db('users').where({id: id}).first();
        if(!user) {
            return { error: "User not found"};
        }
        const tree = await db('treeMembers').where({id});
        const relationships = await db('relationships').where({person1_id: id});
        const sharedTrees = await db('sharedTrees').where({senderId: id}).orWhere({recieverId: id});

        const data = {
            user, 
            tree,
            relationships,
            sharedTrees
        };

        backupInfo.addBackup(id, data);
        res.json({
            message: 'Backup completed'
        });
    }
    catch (error){
        console.error(error);
        res.status(500).json({
            error: 'Error backing up data'
        });
    }
};

const restoreUser = async (req,res) => {
    try{
        const {id} = req.params;

        const backupData = JSON.parse(backup.backupData);

        const existingUser = await userInfo.findById(id);
        if(!existingUser){
            return res.status(404).json({
                error: "User not found. No data to restore"
            })
        }

        const backup = await backupInfo.getLatestBackup(id);
        if(!backup) {
            return res.status(404).json({
                error: "No backup available"
            })
        }

        for( const member of backupData.treeMember) {
            const exists= await treeMember.getMemberById(id)
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

        for (const tree of backupData.sharedTrees) {
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