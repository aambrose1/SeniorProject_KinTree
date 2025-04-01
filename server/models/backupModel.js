const db = require('../db/knex');

const backup = {
    addBackup: async(user, data) => {
        return db('backups').insert({'userId': user, 'backupData': data});
    },
    getBackups: async (id) => {
        return db('backups').where({id});
    },
    getLatestBackup: async (id) => {
        return db('backups').where({id}).orderBy('createdAt', 'desc').first();
    }
};

module.exports = backup;