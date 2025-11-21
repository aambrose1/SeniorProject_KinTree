// sharedTreeModel.js - the model for the sharedTrees table
// this file was replaced with the supabase model
const supabase = require('../lib/supabase');

// all functions for the sharedTree to interact with the database
const sharedTrees = {
    addSharedTree: async (data) => {
        // Table and column names are lowercase in Postgres
        const { data: inserted, error } = await supabase
            .from('sharedtrees')
            .insert([ data ])
            .select('*')
            .single();
        if (error) throw error;
        return inserted;
    },

    getALLSharedTree: async () => {
        const { data, error } = await supabase
            .from('sharedtrees')
            .select('*');
        if (error) throw error;
        return data;
    },

    getSharedTreeById: async (id) => {
        const { data, error } = await supabase
            .from('sharedtrees')
            .select('*')
            .eq('sharedtreeid', id)
            .single();
        if (error) throw error;
        return data;
    },

    getSharedTreebySender: async (id) => {
        const { data, error } = await supabase
            .from('sharedtrees')
            .select('*')
            .eq('senderid', id);
        if (error) throw error;
        return data;
    },

    getSharedTreebyReciever: async (id) => {
        const { data, error } = await supabase
            .from('sharedtrees')
            .select('*')
            .eq('recieverid', id);
        if (error) throw error;
        return data;
    },

    getSharedTreeByToken: async (token) => {
        const { data, error } = await supabase
            .from('sharedtrees')
            .select('*')
            .eq('token', token)
            .maybeSingle();
        if (error) throw error;
        return data;
    }
};

module.exports = sharedTrees;