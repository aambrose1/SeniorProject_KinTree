const db = require('../db/knex');
const Relationships = require('./relationshipModel');

const sharedTrees ={
    addSharedTree: async(data) => {
        return db('sharedTrees').insert(data, ['id', 'token'])
    },

    getALLSharedTree: async () => {
        return db('sharedTrees').select('*');
    },
    

    getSharedTreeById: async(id) =>{
        return db('sharedTrees').where('sharedTreeID',id).first();
    },

    getSharedTreebySender: async(id) => {
        return db('sharedTrees').where('senderId', id);
    },

    getSharedTreebyReciever: async(id) => {
        return db('sharedTrees').where({ recieverId: id }).select('*');
    },

    getSharedTreeByToken: async (token) => {
        return db('sharedTrees').where('token', token).first();
    },

    shareTree: async(data) => {
        return db('relationship').where('person1_id', personId).andWhere('side','side');
    },

    mergeTree: async(id, data) => {
        for (const member of data){
            await db('treeMembers').insert({
                owner_id: recieverID,
                name : member.name,
                relationship: member.relationship,
            });
        }
        return {message: "Members merged successfully"};

    },

    getMemberstoMerge: async(senderId, recieverId) => {
        return db('sharedTrees').where(senderId, senderId).select('*');
    }


};

module.exports = sharedTrees;