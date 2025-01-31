const db = require('../db/knex');

const treeMember = {
    addMember: async (data) => {
        return db('treeMembers').insert(data, ['id']);
    },

    getAllMembers:async () => {
        return db('treeMembers').select('*');
    }
};

module.exports = treeMember;