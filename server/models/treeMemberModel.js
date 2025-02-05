const db = require('../db/knex');

const treeMember = {
    addMember: async (data) => {
        return db('treeMembers').insert(data, ['id']);
    },

    getAllMembers:async () => {
        return db('treeMembers').select('*');
    },

    getMembeById: async (id) => {
        return db('treeMembers').where({id}).first();
    },

    updateMemberInfo:  async (id, data) =>{
        return db('treeMembers').where({id}).update(data,['id', 'firstName', 'lastName' , 'birthDate', 'location', 'phoneNumber']);
        
    }
};

module.exports = treeMember;