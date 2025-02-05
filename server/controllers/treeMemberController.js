const treeMember = require('../models/treeMemberModel');
const Relationship = require('../models/relationshipModel');

const addTreeMember = async(req, res) => {
    try{
        const{ firstName, lastName, birthDate, deathDate, relationships} = req.body;
        const [newMember] = await treeMember.addMember({ firstName, lastName, birthdate, deathDate, location, phoneNumber});

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

const editTreeMember = async(req,res) => {
    try{
        const {id} = req.params;
        const updateData = req.body;

        const existingMember = await treeMember.getMembeById(id);

        // if member is not found return error 
        if(!existingMember){
            return res.status(404).json({
                error: 'Family member not found'
            })
        }

        //delete empty data fields if they are not entered 
        for(let key in updateData ){
            if(updateData[key] === '' || updateData[key] === undefined) {
                delete updateData[key];
            }
        }

        if(Object.keys(updateData).length ===0) {
            return res.status(400).json({
                error: "No new data to update"
            });
        }

        const[updatedMember] = await treeMember.updateMemberInfo(id, updateData);

        res.status(400).json({
            message: 'Family member updated', member: updatedMember
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error updating family member'
        });
    }
}

module.exports = {addTreeMember};

