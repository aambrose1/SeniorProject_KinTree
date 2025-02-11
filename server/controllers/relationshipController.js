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
    const {person1_id, person2_id, relationshipType, relationshipStatus } = req.body;
    const [newRelationship] =  await Relationship.addRelationship({
        person1_id, 
        person2_id, 
        relationshipType, 
        relationshipStatus 
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



module.exports = {getRelationships, addRelationship};