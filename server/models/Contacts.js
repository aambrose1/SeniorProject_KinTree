const db = require("../db/knex");

const Contacts = {

    addContact: async (data) => {
        return db("contacts").insert(data);
    },

    addMultipleContacts: async (contacts) => {
        return db("contacts").insert(contacts);
    },

    getContactsByUser: async (userId) => {
        return db("contacts")
            .where("user_id", userId)
            .select("*");
    },

    getContactById: async (id) => {
        return db("contacts")
            .where("id", id)
            .first();
    },

    updateContact: async (id, data) => {
        return db("contacts")
            .where("id", id)
            .update(data);
    },

    deleteContact: async (id) => {
        return db("contacts")
            .where("id", id)
            .del();
    },

    deleteByUser: async (userId) => {
        return db("contacts")
            .where("user_id", userId)
            .del();
    }

};

module.exports = Contacts;