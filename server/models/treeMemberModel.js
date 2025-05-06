const db = require('../db/knex');

const treeMember = {
    addMember: async (data) => {
        return db('treeMembers').insert(data, ['id']);
    },

    getAllMembers: async () => {
        return db('treeMembers').select('*');
    },

    
    getAllMembersbyId: async (id) => {
        return db('treeMembers').where({id}).select('*');
    },

    getMemberById: async (id) => {  // Fixed the typo
        return db('treeMembers').where({ id }).first();
    },

    getMembersByUser: async (userId) => {
        return db('treeMembers').where({userId}).select('*');
    },
    
    updateMemberInfo: async (id, data) => {
        await db('treeMembers').where({ id }).update(data);
        const updatedRecord = await  db('treeMembers').where({ id }).first();  // Return updated record
        return updatedRecord;
    },
    assignNewMemberRelationship: async (recieverId, getMemberById, relationshipType) => {
        return db('treeMembers').where({person1_id: recieverId, person2_id: recieverId}).update({relationshipType: relationshipType})
    },

    getActiveMemberId: async (id) => {
        // userId and memberUserId are both equal to the id
        return db('treeMembers').where({userId: id, memberUserId: id}).first();
    }
};

module.exports = treeMember;
