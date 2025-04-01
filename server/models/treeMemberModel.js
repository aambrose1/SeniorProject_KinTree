const db = require('../db/knex');

const treeMember = {
    addMember: async (data) => {
        return db('treeMembers').insert(data, ['id']);
    },

    getAllMembers: async () => {
        return db('treeMembers').select('*');
    },

    getMemberById: async (id) => {  // Fixed the typo
        return db('treeMembers').where({ id }).first();
    },

    updateMemberInfo: async (id, data) => {
        await db('treeMembers').where({ id }).update(data);
        const updatedRecord = await  db('treeMembers').where({ id }).first();  // Return updated record
        return updatedRecord;
    }
};

module.exports = treeMember;
