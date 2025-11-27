const Relationship = require('../models/relationshipModel');
const User = require('../models/userModel');
const treeMember = require('../models/treeMemberModel');

const getRelationships = async (req, res) => {
    try{
        const { id} = req.params;
        const relationships = await Relationship.getRelationships(id);
        res.status(200).json(relationships);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching relationships'
        });
        
    }
};

const getRelationshipsByUser = async (req,res) => {
    try {
        const userId = await req.params.id;
        console.log('Fetching relationships for userId:', userId);
        const relationships = await Relationship.getRelationshipByUser(userId);
        res.status(200).json(relationships);
    }
    catch(error){
        console.error('Error in relationship fetch for user, ' + req.params.id + ':', error);
        res.status(500).json({
            error: 'Error fetching relationships'
        });
    }
};
const getRelationshipsByOtherUser = async (req,res) => {
    try {
        const {userId} = req.params;
        const relationships = await Relationship.getRelationshipByOtherUser(userId);
        res.status(200).json(relationships);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching relationships'
        });
    }
};

const addRelationship = async (req,res) =>{
    //need to add functionality to refuse a relationship if it already exists 
    try{
        let {person1_id, person2_id, relationshipType, relationshipStatus, side, userId} = req.body;
        
        console.log('addRelationship received:', {person1_id, person2_id, userId, typeof_person1_id: typeof person1_id});
        
        // Resolve person1_id if it's a UUID (user ID) - need to find the member ID for that user
        if (typeof person1_id === 'string' && person1_id.includes('-')) {
            const userIdInt = await User.resolveUserIdFromAuthUid(person1_id);
            if (!userIdInt) {
                return res.status(400).json({ error: 'Invalid person1_id: User not found' });
            }
            // Find the active member for this user
            const member = await treeMember.getActiveMemberId(userIdInt);
            if (!member) {
                return res.status(400).json({ error: 'No active member found for person1_id user' });
            }
            person1_id = member.id;
        }
        
        // Resolve person2_id if it's a UUID (user ID)
        if (typeof person2_id === 'string' && person2_id.includes('-')) {
            const userIdInt = await User.resolveUserIdFromAuthUid(person2_id);
            if (!userIdInt) {
                return res.status(400).json({ error: 'Invalid person2_id: User not found' });
            }
            // Find the active member for this user
            const member = await treeMember.getActiveMemberId(userIdInt);
            if (!member) {
                return res.status(400).json({ error: 'No active member found for person2_id user' });
            }
            person2_id = member.id;
        }
        
        // Resolve userId from UUID to integer
        if (userId && typeof userId === 'string' && userId.includes('-')) {
            userId = await User.resolveUserIdFromAuthUid(userId);
            if (!userId) {
                return res.status(400).json({ error: 'Invalid userId: User not found' });
            }
        }
        
        console.log('addRelationship resolved:', {person1_id, person2_id, userId});
        
        const newRelationship = await Relationship.addRelationship({
            person1_id, 
            person2_id, 
            relationshipType, 
            relationshipStatus, 
            side,
            userId
        });
        res.status(201).json({
            message: 'Relationship added successfully',
            member: newRelationship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error adding relationship',
            details: error.message
        });
    }
}

const filterBySide = async (req,res) => {
    try{
        const {id} = req.params;
        const {side} = req.query;

        if (!side || (side !== "paternal" && side !== "maternal" && side !== "both")){
            return res.status(400).json({
                error: "Invalid side parameter. Use 'paternal' or 'maternal'."
            });
        }
        const relatives = await Relationship.filterBySide(id, side);
        res.json(relatives);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching relationships'
        });
        
    }
};

const deleteByUser =  async (req, res) => {
    const {userId} = req.params;

    try{
        await Relationship.deleteByUser(userId);
    
        res.json({ 
          message: "Relationship deleted successfullyS"
        })
    
      }
      catch (error){
        console.error(error);
        res.status(500).json({error:"Error deleting relationship"})
      }

}




module.exports = {getRelationships,getRelationshipsByUser,getRelationshipsByOtherUser, addRelationship, filterBySide, deleteByUser};
