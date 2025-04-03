const Relationship = require('../models/relationshipModel');

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

const addRelationship = async (req,res) =>{

    //need to add functionality to refuse a relationship if it already exists 
try{
    const {person1_id, person2_id, relationshipType, relationshipStatus, side, userId} = req.body;
    const [newRelationship] =  await Relationship.addRelationship({
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
        error: 'Error adding relationship'
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
}




module.exports = {getRelationships, addRelationship, filterBySide};