const db = require('../db/knex');

const User = {
    register: async (userData) => {
        return db('users').insert(userData, ['id', 'firstName', 'lastName', 'email']);
    },

    findByEmail: async (email) => {
        return db('users').where({email}).first();
    },

    findById: async (id) => {
        return db('users').where({id}).first();
    }
};

module.exports = User;