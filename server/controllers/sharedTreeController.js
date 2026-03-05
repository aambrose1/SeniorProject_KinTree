const treeMember = require('../models/treeMemberModel');
const relationship = require('../models/relationshipModel');
const sharedTrees = require('../models/sharedTreeModel');
const users = require('../models/userModel'); 
const crypto = require('crypto');
const { Resend } = require('resend');


const getSharedTreeById = async (req, res) => {
    try{
        const {id} = req.params;
        const trees = await sharedTrees.getSharedTreeById(id);
        res.status(200).json(trees);
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
        const trees = await sharedTrees.getSharedTreebySender(id);
        res.status(200).json(trees);
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
        const { id } = req.params;
        const trees = await sharedTrees.getSharedTreebyReciever(id);
        res.status(200).json(trees);
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
        const {senderID, receiverID, receiverEmail, perms, parentalSide, treeInfo, comment} = req.body;

        if (!["maternal", "paternal", "both"].includes(parentalSide)){
            return res.status(400).json({
                error: "Invalid parental side. Use maternal, paternal, or, both"
            });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        
        // Create the shared tree entry
        const newSharedTree = await sharedTrees.addSharedTree({
            senderID,
            receiverID: receiverID || null,
            receiverEmail: receiverEmail || null,
            perms,
            parentalSide,
            treeInfo,
            comment,
            token,
            status: receiverID ? 'accepted' : 'pending'
        });
        
        // If it's an email invitation (no receiverID), send invitation email
        if (!receiverID && receiverEmail) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const senderUser = await users.findById(senderID);
                const senderName = senderUser ? `${senderUser.firstname || senderUser.firstName || ''} ${senderUser.lastname || senderUser.lastName || ''}`.trim() : 'A family member';
                
                const invitationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?inviteToken=${token}`;
                
                const emailSubject = `${senderName} invited you to view their family tree`;
                const emailHtml = `
                    <h2>Family Tree Invitation</h2>
                    <p>${senderName} has invited you to view their family tree on KinTree.</p>
                    ${comment ? `<p><strong>Message from ${senderName}:</strong> ${comment}</p>` : ''}
                    <p>Click the link below to accept the invitation and create your account:</p>
                    <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>${invitationLink}</p>
                    <p>This invitation link is unique to you and can only be used once.</p>
                `;
                
                await resend.emails.send({
                    from: process.env.EMAIL_FROM || "KinTree <onboarding@resend.dev>",
                    to: [receiverEmail],
                    subject: emailSubject,
                    html: emailHtml
                });
                
                return res.status(201).json({
                    message: "Invitation sent successfully! The recipient will receive an email with instructions.",
                    object: newSharedTree
                });
            } catch (emailError) {
                console.error('Error sending invitation email:', emailError);
                // Still return success since the shared tree was created
                return res.status(201).json({
                    message: "Shared tree created but failed to send email invitation.",
                    object: newSharedTree,
                    emailError: emailError.message
                });
            }
        }
        
        return res.status(201).json({
            message: "Tree shared successfully.",
            object: newSharedTree
        });
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
        const { sharedTreeId } = req.params; // get the shared tree ID
        console.log('Request Body:', req.body);
        const { selectedMembers, receiverId } = req.body;
        console.log('Receiver ID:', receiverId);
        

        if (!selectedMembers || selectedMembers.length === 0) {
            return res.status(400).json({ error: 'No members selected to merge' });
        }

        // fetch the shared tree from the database
        const sharedTree = await sharedTrees.getSharedTreeById(sharedTreeId);
        if (!sharedTree) {
            return res.status(404).json({ error: 'Shared tree not found' });
        }
        const formatDateForMySQL = (dateString) => {
            if (!dateString) return null; // if no date, return null
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // extract YYYY-MM-DD
        };

        console.log('treeInfo:', sharedTree.treeInfo);

        // check if treeInfo exists and is an array
        if (!sharedTree.treeInfo || !Array.isArray(sharedTree.treeInfo)) {
            return res.status(400).json({ error: 'Tree information is missing or invalid' });
        }

        let treeInfo = sharedTree.treeInfo; // should be an array of members

        // loop through the selected members and add them to the tree
        for (const memberId of selectedMembers) {
            const relationship = treeInfo.find(rel => 
                rel.person1_id == memberId || rel.person2_id == memberId
            );

            if (!relationship) {
                console.log(`Member with ID ${memberId} not found in treeInfo.`);
                continue;
            }

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

const deleteSharedTree = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTree = await sharedTrees.deleteSharedTree(id);
        res.status(200).json({
            message: 'Shared tree deleted successfully',
            deletedTree
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error deleting shared tree'
        });
    }
};

// Process pending invitations when a user registers
const processPendingInvitations = async (req, res) => {
    try {
        const { email, userId } = req.body;
        
        if (!email || !userId) {
            return res.status(400).json({
                error: 'Email and userId are required'
            });
        }
        
        // Find all pending invitations for this email
        const pendingInvitations = await sharedTrees.getSharedTreeByEmail(email);
        
        if (!pendingInvitations || pendingInvitations.length === 0) {
            return res.status(200).json({
                message: 'No pending invitations found',
                count: 0
            });
        }
        
        // Update each invitation with the new user ID
        const updatedInvitations = [];
        for (const invitation of pendingInvitations) {
            const updated = await sharedTrees.updateSharedTreeReceiver(
                invitation.sharedtreeid,
                userId
            );
            updatedInvitations.push(updated);
        }
        
        return res.status(200).json({
            message: `Successfully processed ${updatedInvitations.length} pending invitation(s)`,
            count: updatedInvitations.length,
            invitations: updatedInvitations
        });
    } catch (error) {
        console.error('Error processing pending invitations:', error);
        res.status(500).json({
            error: 'Error processing pending invitations'
        });
    }
};

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = {getSharedTreeById, getSharedTreeByToken, getSharedTreeBySender, getSharedTreebyReciever,shareTree, assignNewMemberRelationship, mergeMembers, deleteSharedTree, processPendingInvitations }