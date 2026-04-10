const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const User = require('../models/userModel');
const supabase = require('../lib/supabase');

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
        const { firstname, lastname, birthdate, deathdate, location, phonenumber, userid, memberuserid, gender } = req.body;
        
        // Resolve UUIDs to integer user IDs - CRITICAL: database requires integers, not UUIDs
        console.log('addTreeMember received userId:', userid, typeof userid);
        const userIdInt = await User.resolveUserIdFromAuthUid(userid);
        console.log('Resolved userIdInt:', userIdInt, typeof userIdInt);
        if (!userIdInt) {
            return res.status(400).json({ 
                error: 'Invalid user ID. User not found in database. Please sync your account first.',
                received: userid
            });
        }

        const memberUserIdInt = memberuserid ? await User.resolveUserIdFromAuthUid(memberuserid) : null;
        if (memberuserid && !memberUserIdInt) {
            return res.status(400).json({ 
                error: 'Invalid member user ID. User not found in database.',
                received: memberuserid
            });
        }

        const formattedBirthDate = formatDate(birthdate);
        const formattedDeathDate = formatDate(deathdate);

        // ensure all necessary fields are passed in the request body
        const newMember = await treeMember.addMember({
            firstname: firstname,
            lastname: lastname,
            birthdate: formattedBirthDate,
            deathdate: formattedDeathDate,
            location: location,
            phonenumber: phonenumber,
            userid: userIdInt,  // Now guaranteed to be an integer
            memberuserid: memberUserIdInt || null,  // Now guaranteed to be an integer or null,
            gender: gender
        });


        // // if there are relationships, add them to the database
        // if (relationships && relationships.length > 0) {
        //     for (const rel of relationships) {
        //         // Ensure person2_id is an integer, not a UUID
        //         let person2_id = rel.person2_id;
        //         if (typeof person2_id === 'string' && person2_id.includes('-')) {
        //             // If it looks like a UUID, try to resolve it
        //             person2_id = await User.resolveUserIdFromAuthUid(person2_id);
        //             if (!person2_id) {
        //                 console.error('Could not resolve person2_id UUID:', rel.person2_id);
        //                 continue; // Skip this relationship
        //             }
        //         }
        //         await relationship.addRelationship({
        //             person1_id: newMember.id,
        //             person2_id: person2_id,
        //             relationshipType: rel.relationshipType || 'sibling',
        //             relationshipStatus: 'active',
        //             userId: userIdInt  // Need to include userId for the relationship
        //         });
        //     }
        // } 
        //relationship function does not work

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
        // Resolve UUID to integer user ID first
        const userIdInt = await User.resolveUserIdFromAuthUid(userId);
        if (!userIdInt) {
            return res.status(404).json({ error: 'User not found' });
        }
        const members = await treeMember.getMembersByUser(userIdInt)
        console.log(members);
        res.status(200).json(members);
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error fetching members',
            details: error.message
        });
        
    }
};

const getMembersByOtherUser = async (req,res) =>{
    try{
        const { userId} = req.params;
        const members = await treeMember.getMembeByOtherUser(userId)
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
        res.status(500).json({error:"Error deleting family member"})
      }

}

const deleteTreeMember = async (req, res) => {
    try {
        const { id } = req.params;
        
        // delete all relationships associated with this member
        await relationship.deleteRelationshipsByMemberId(id);
        
        // delete the member
        await treeMember.deleteMember(id);

        res.status(200).json({
            message: 'Family member and their relationships deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteTreeMember:', error);
        res.status(500).json({
            error: 'Error deleting family member',
            details: error.message
        });
    }
};
const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        // Resolve UUID to integer user ID first
        const userId = await User.resolveUserIdFromAuthUid(id);
        console.log('getMemberById resolved userId:', userId);
        if (!userId) {
            return res.status(200).json({});
        }
        const member = await treeMember.getMemberById(userId);
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
        // Resolve UUID to integer user ID first
        const userId = await User.resolveUserIdFromAuthUid(id);
        if (!userId) {
            return res.status(200).json({});
        }
        const member = await treeMember.getActiveMemberId(userId);
        // If none found, return empty object to avoid frontend JSON parse errors
        if (!member) return res.status(404).json({});
        res.status(200).json(member);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching family member', details: error.message });
    }
};

const getMemberbyMemberId = async (req, res) => {
    try {
        const id = await req.params.id;
        const member = await treeMember.getMemberbyMemberId(id);
            if (!member) {
                return res.status(404).json({ error: 'Family member not found' });
            }
            res.status(200).json(member);
    } catch (error) {
        console.error("Error in fetching family member by member id:", error);
        res.status(500).json({ error: 'Error fetching family member' });
    }
};

const clearFamilyTree = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = await User.resolveUserIdFromAuthUid(userId);
        if (!userIdInt) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1. Delete all relationships for this user
        await relationship.deleteByUser(userIdInt);

        // 2. Fetch the root member ID for this user (the one where memberuserid == userid)
        const rootMember = await treeMember.getActiveMemberId(userIdInt);
        const rootMemberId = rootMember ? rootMember.id : null;

        // 3. Delete all family members for this user EXCEPT the root member
        if (rootMemberId) {
            const { error: deleteError } = await supabase
                .from('treemembers')
                .delete()
                .eq('userid', userIdInt)
                .neq('id', rootMemberId);
            
            if (deleteError) throw deleteError;

            // 4. Reset the tree_info JSON to only contain the root member
            const initialTreeData = [{
                id: `${rootMemberId}`,
                data: {
                    "first name": rootMember.firstname,
                    "last name": rootMember.lastname,
                    "gender": rootMember.gender || "Unknown"
                },
                rels: {
                    parents: [],
                    children: [],
                    spouses: []
                }
            }];

            // We need direct DB update for tree_info
            const { error: infoError } = await supabase
                .from('treeinfo')
                .update({ object: initialTreeData })
                .eq('userid', userIdInt);
            
            if (infoError) throw infoError;
        }

        res.status(200).json({
            message: 'Family tree cleared successfully. Starting fresh with only your profile.'
        });
    } catch (error) {
        console.error('Error in clearFamilyTree:', error);
        res.status(500).json({
            error: 'Error resetting family tree',
            details: error.message
        });
    }
};

module.exports = { 
    addTreeMember, editTreeMember, getMembersByUser, 
    getMembersByOtherUser, deleteByUser, deleteTreeMember, 
    getMemberById, getActiveMemberId, getMemberbyMemberId,
    clearFamilyTree 
};  

