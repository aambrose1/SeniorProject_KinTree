const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');

const addTreeMember = async (req, res) => {
    try {
        const { firstName, lastName, birthDate, deathDate, location, phoneNumber, relationships } = req.body;

        // Ensure all necessary fields are passed in the request body
        const [newMember] = await treeMember.addMember({
            firstName,
            lastName,
            birthDate,
            deathDate,
            location,
            phoneNumber
        });
        /// need to fix that a value can be left empty (deathDate)

        // If there are relationships, add them to the database
        if (relationships && relationships.length > 0) {
            for (const rel of relationships) {
                await relationship.addRelationship({
                    person1_id: newMember.id,
                    person2_id: rel.person2_id,  // Corrected from 'relationship.person2_id' to 'rel.person2_id'
                    relationship_status: 'active'
                });
            }
        }
        //realtionship function does not work

        res.status(201).json({
            message: 'Family member added successfully',
            member: newMember
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error adding family member'
        });
    }
};
const editTreeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if the family member exists
        const existingMember = await treeMember.getMemberById(id);  // Fixed typo here

        if (!existingMember) {
            return res.status(404).json({
                error: 'Family member not found'
            });
            //this works 
        }

        // Delete empty or undefined fields from updateData
        for (let key in updateData) {
            if (updateData[key] === '' || updateData[key] === undefined) {
                delete updateData[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No new data to update"
            });
            //this works 
        }

        // Update the family member info
        const updatedMember = await treeMember.updateMemberInfo(id, updateData);
        res.status(200).json({  // Changed to 200 status code
            message: 'Family member updated successfully',
            member: updatedMember
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error updating family member',
        });
    }
};

module.exports = { addTreeMember, editTreeMember };  // Export both methods
