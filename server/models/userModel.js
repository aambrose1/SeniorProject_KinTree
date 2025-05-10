const db = require('../db/knex');
const { get } = require('../routes/treeMemberRoute');

const User = {
    register: async (userData) => {
        return db('users').insert(userData, ['id', 'firstName', 'lastName', 'email']);
    },

    findByEmail: async (email) => {
        return db('users').where({email}).first();
    },

    findById: async (id) => {
        return db('users').where({id}).first();
    },

    updateUserInfo: async(id, userData) => {
        return db('users').insert(userData, '').where({id}).first().insert(userData, []);
    },


    deleteUser: async (id) => {
        return db('users').where({id}).del();
    },

    getAllUsers: async () => {
        return db('users').select('*');
    },

};

module.exports = User;