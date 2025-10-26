const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const { update } = require('../db/knex');

// format dates to YYYY-MM-DD
const formatDate = (dateValue) => {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null; // Invalid date
    
    // Extract YYYY-MM-DD from the date object
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // month starts at zero
    const day = String(d.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

const addTreeMember = async (req, res) => {
    try {
        const { firstName, lastName, birthDate, deathDate, location, phoneNumber, relationships, userId, memberUserId, gender } = req.body;

        const formattedBirthDate = formatDate(birthDate);
        const formattedDeathDate = formatDate(deathDate);

        // ensure all necessary fields are passed in the request body
        const [newMember] = await treeMember.addMember({
            firstName,
            lastName,
            birthDate: formattedBirthDate,
            deathDate: formattedDeathDate,
            location,
            phoneNumber,
            userId,
            memberUserId,
            gender
        });

        // if there are relationships, add them to the database
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

        // check if the family member exists
        const existingMember = await treeMember.getMemberById(id);  // Fixed typo here

        if (!existingMember) {
            return res.status(404).json({
                error: 'Family member not found'
            });
            //this works 
        }

        
        for (let key in updateData) {
            // delete empty or undefined fields from updateData
            if (updateData[key] === '' || updateData[key] === undefined) {
                delete updateData[key];
            }
            // Verify YYYY-MM-DD format before sending it to the database
            if (key === 'birthDate') { updateData.birthDate = formatDate(updateData.birthDate);}
            if (key === 'deathDate') { updateData.deathDate = formatDate(updateData.deathDate);}
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No new data to update"
            });
            //this works 
        }

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

const getMembersByUser = async (req,res) =>{
    try{

        const { userId } = req.params;
        const members = await treeMember.getMembersByUser(userId)
        console.log(members);
        res.status(200).json(members);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching members'
        });
        
    }
};

const getMembersByOtherUser = async (req,res) =>{
    try{
        const { userId} = req.params;
        const members = await treeMember.getMembersByOtherUser(userId)
        res.status(200).json(members);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching members'
        });
        
    }
};


const deleteByUser =  async (req, res) => {
    const {userId} = req.params;

    try{
        await treeMember.deleteByUser(userId);
    
        res.json({ 
          message: "Family member deleted successfullyS"
        })
    
      }
      catch (error){
        console.error(error);
        res.status(500);json({error:"Error deleting family member"})
      }

}
const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await treeMember.getMemberById(id);
        if (!member) {
            return res.status(404).json({ error: 'Family member not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching family member' });
    }
};

const getActiveMemberId = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await treeMember.getActiveMemberId(id);
        if (!member) {
            return res.status(404).json({ error: 'Family member not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching family member' });
    }
}

module.exports = { addTreeMember, editTreeMember, getMembersByUser, getMembersByOtherUser, deleteByUser, getMemberById, getActiveMemberId };  

