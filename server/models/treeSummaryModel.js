const db = require('../db/knex');

const treeSummary = {
    getSummaryByUser: async (userId) => {
        return db('userTreeSummaries').where({userId}).first();
    },

    createSummary: async (userId, userData) =>{
        return db('userTreeSummaries').insert({'userId': userId, 'currentTreeSummary': userData});
    },
    
    updateSummary: async (userId, userData) =>{
        return db('userTreeSummaries').where({userId}).update({'currentTreeSummary': userData});
    }
};

module.exports = treeSummary;