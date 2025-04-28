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

    getMemberByUser: async (userId) => {
        return db('treeMembers').where({userId}).select('*');
    },

    getMembeByOtherUser: async (userId) => {
        return db('treeMembers').whereNot({userId}).select('*');

    },
    
    updateMemberInfo: async (id, data) => {
        await db('treeMembers').where({ id }).update(data);
        const updatedRecord = await  db('treeMembers').where({ id }).first();  // Return updated record
        return updatedRecord;
    },
    assignNewMemberRelationship: async (recieverId, getMemberById, relationshipType) => {
        return db('treeMembers').where({person1_id: recieverId, person2_id: recieverId}).update({relationshipType: relationshipType})
    },

    deleteByUser: async (userId) => {
        return db('treeMembers').where({userId}).del();
    }


};

module.exports = treeMember;
