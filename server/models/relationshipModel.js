const db = require('../db/knex');

const Relationships = {
    addRelationship: async (data) => {
        return db('relationships').insert(data);
    },

    getRelationships:async () => {
        return db('relationships').where('person_id', personId).onWhere('person2_id', personId);
    }
};

module.exports = Relationships;
