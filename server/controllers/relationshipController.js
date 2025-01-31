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

module.exports = {getRelationships};