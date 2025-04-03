const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');
const users = require('../models/userModel'); 
const crypto = require('crypto');


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

const getSharedTreeByToken = async (req, res) => {
    try{
        const { token} = req.params;
        const sharedTree = await sharedTrees.getSharedTreeByToken(token);
        if(!sharedTree){
            return res.status(404).json({
                error: "Shared tree does not found!"
            });   
        }

        const members = await treeMember.getMemberByUser(sharedTree.senderID);
        res.status(200).json({
            shareTree,
            TreeMembers: members
        });
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
        const {senderID, perms, parentalSide, recieverEmail} = req.body;

        if (!["maternal", "paternal", "both"].includes(parentalSide)){
            return res.status(400).json({
                error: "Invalid parental side. Use maternal, paternal, or, both"
            });
        }
        const token = crypto.randomBytes(16).toString('hex');
        const reciever = await users.findByEmail(recieverEmail)
        const relationships = await relationship.filterBySide(senderID,parentalSide);

        if(relationships.length === 0 ){
            return res.status(400).json({
                message: "No members found for the '${parentalSide}' side."
            });

        }
        const treeMembers = await Promise.all(
            relationships.map(async (relationship) => {
                // For each relationship, fetch the details of the tree members (person1 and person2)
                const person1Details = await treeMember.getMemberById(relationship.person1_id);
                const person2Details = await treeMember.getMemberById(relationship.person2_id);
        
        
                // Return the relationship along with both person details
                return {
                    ...relationship,
                    person1Details,
                    person2Details
                };
            })
        );
        

        if(reciever) {
            const [newSharedTree] = await sharedTrees.addSharedTree({
                senderID,
                recieverID: reciever.id,
                perms,
                parentalSide,
                treeInfo: JSON.stringify(treeMembers),
                token
            });

            return res.status(201).json({
                message: "Shared tree added",
                token: newSharedTree.token
            })
        }
        else{
            const [newSharedTree] = await sharedTrees.addSharedTree({
                senderID,
                recieverID: null,
                perms,
                parentalSide,
                treeInfo: JSON.stringify(treeMembers),
                token
            });
            return res.status(201).json({
                message: "Shared tree added. Reciever will be prompted to register/log in if needed.",
                token: newSharedTree.token
            })

        }
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error sharing tree'
        });
    }
};
const mergeMembers = async (req, res) => {
    try {
        const { sharedTreeId } = req.params; // Get the shared tree ID
        console.log('Request Body:', req.body);
        const { selectedMembers, receiverId } = req.body;
        console.log('Receiver ID:', receiverId);
        

        if (!selectedMembers || selectedMembers.length === 0) {
            return res.status(400).json({ error: 'No members selected to merge' });
        }

        // Fetch the shared tree from the database
        const sharedTree = await sharedTrees.getSharedTreeById(sharedTreeId);
        if (!sharedTree) {
            return res.status(404).json({ error: 'Shared tree not found' });
        }
        const formatDateForMySQL = (dateString) => {
            if (!dateString) return null; // If no date, return null
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        };

        // Log treeInfo to check its format
        console.log('treeInfo:', sharedTree.treeInfo);

        // Check if treeInfo exists and is an array
        if (!sharedTree.treeInfo || !Array.isArray(sharedTree.treeInfo)) {
            return res.status(400).json({ error: 'Tree information is missing or invalid' });
        }

        let treeInfo = sharedTree.treeInfo; // This should be an array of members

        // Loop through the selected members and add them to the tree
        for (const memberId of selectedMembers) {
            // Find the relationship that includes the selected member
            const relationship = treeInfo.find(rel => 
                rel.person1_id == memberId || rel.person2_id == memberId
            );

            if (!relationship) {
                console.log(`Member with ID ${memberId} not found in treeInfo.`);
                continue; // Skip to the next member
            }

            // Determine which person's details to add
            const memberDetails = relationship.person1_id == memberId 
                ? relationship.person1Details 
                : relationship.person2Details;

            if (!memberDetails) {
                console.log(`Details for member ID ${memberId} not found.`);
                continue;
            }
            const formattedBirthDate = formatDateForMySQL(memberDetails.birthDate);
            const formattedDeathDate = formatDateForMySQL(memberDetails.deathDate);

            // Add the member to the tree
            await treeMember.addMember({
                firstName: memberDetails.firstName,
                lastName: memberDetails.lastName,
                birthDate: formattedBirthDate,
                deathDate: formattedDeathDate,
                location: memberDetails.location,
                phoneNumber: memberDetails.phoneNumber,
                userId: receiverId
            });
            console.log(`Added member ${memberDetails.firstName} ${memberDetails.lastName} for receiverId ${receiverId}`);

        // Return success message
        res.status(200).json({ message: 'Members merged successfully' });
    }} catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error merging members' });
    }
};


const assignNewMemberRelationship = async (req, res) => {
    try{
        const { recieverID, memberId, relationshipType} = req.body;
        await treeMember.assignNewMemberRelationship(recieverID,memberId,relationshipType);
        res.json({message: 'Relationshi[ assigning successful.'})

    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error: 'Error assigning new relationship'
        });
    };

}


module.exports = {getSharedTreeById, getSharedTreeByToken, getSharedTreeBySender, getSharedTreebyReciever,shareTree, assignNewMemberRelationship, mergeMembers }