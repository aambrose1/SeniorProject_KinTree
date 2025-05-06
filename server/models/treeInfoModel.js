const db = require('../db/knex');

const treeInfo = {
    addObject: async (data) => {
        return db('treeInfo').insert(data, ['id']);
    },

    updateObject: async (id, data) => {
        await db('treeInfo').where({ id }).update(data);
        const updatedObject = await db('treeInfo').where({ id }).first();
        return updatedObject;
    },

    getObject: async (id) => {
        return db('treeInfo').where({ id }).first();
    },
};

module.exports = treeInfo;
