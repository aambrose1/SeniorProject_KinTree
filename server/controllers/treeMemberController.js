const treeMember = require('../models/treeMemberModel');
const Relationship = require('../models/relationshipModel');

const addTreeMember = async(req, res) => {
    try{
        const{ firstName, lastName, birthDate, deathDate, relationships} = req.body;
        const [newMember] = await treeMember.addMember({ firstName, lastName, birthdate, deathDate});

        if(relationships && relationships.length > 0) {
            for(const rel of relationships){
                await relationship.addRelationship({
                    person1_id: newMember.id,
                    person2_id: relationship.person2_id,
                    relationship_status: 'active'
                });
            }
        }
        res.status(201).json({
            message: 'Family member added', id: newMember.id
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error adding family member'
        });
    }
};

module.exports = {addTreeMember};