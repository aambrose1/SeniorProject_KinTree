const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');

const addSharedTree = async (req, res) => {
    try{
        const { senderID, recieverID, perms, parentalSide,treeInfo } = req.body;

        const [newSharedTree] = await sharedTrees.addSharedTree({
            senderID,
            recieverID,
            perms,
            parentalSide,
            treeInfo
        });

        if (sharedTrees && sharedTrees.length > 0) {
            for (const tree of sharedTrees){
                await sharedTrees.addSharedTree({
                    senderID: newSharedTree.senderID,
                    recieverID: tree.recieverID,
                    parentalSide: tree.parentalSide
                });
            }
        }

        res.status(201).json({
            message: 'Added shared tree'
        })

    }
    catch (error){
        console.error(erro);
        res.status(500).json({
            error: "Error adding shared tree."
    });

    }
}

const getSharedTreeById = async (req, res) => {
    try{
        const { id} = req.params;
        const relationships = await sharedTrees.getSharedTreeById(id);
        res.status(200).json(sharedTrees);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching shared tree'
        });
        
    }
}

const getSharedTreeBySender = async (req, res) => {
    try{
        const { id} = req.params;
        const relationships = await sharedTrees.getSharedTreebySender(id);
        res.status(200).json(sharedTrees);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching shared tree by sender'
        });
        
    }
}

const getSharedTreebyReciever = async (req, res) => {
    try{
        const { id} = req.params;
        const relationships = await sharedTrees.getSharedTreebyReciever(id);
        res.status(200).json(sharedTrees);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching shared tree by reciever'
        });
        
    }
}

const shareTree = async (req,res) => {
    try{
        const {id} = req.params;
        const {side} = req.query;

        if(!side || (side !== "paternal" && side !== "maternal")){
            return res.status(400).json({
                error: "Invalid side. Use 'paternal' or 'maternal'."
            });

            const relatives = await sharedTrees.shareTree(id, side);
            res.json(relatives);

        }

    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error sharing tree'
        });
    }
};
const getMemberstoMerge = async( req,res) => {
    try{
        const {id} = req.params;
        const members = await sharedTrees.getMemberstoMerge(id);
        res.json(members);
    }
    catch(error){
        res.status(500).json({
            error: 'Error getting members to merge'
        });

    }
}

const assignNewMemberRelationship = async (req, res) => {
    try{
        const { recieverID, memberId, relationshipType} = req.body;
        await shareTree.assignNewMemberRelationship(recieverID,memberId,relationshipType);
        res.json({message: 'Relationshi[ assigning successful.'})

    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error assigning new relationship'
        });
    };

}
const mergeTree = async (req,res) => {
    try{
        const {id, selectedRelatives} = req.body;

        if(!selectedRelatives || selectedRelatives.length ===0){
            return res.status(400).json({
                error: "No relatives selected to merge"
            });
        }
        const result = await sharedTrees.mergeTree(id, selectedRelatives);
          res.json(result);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error merging shared tree'
        });
    };
};

