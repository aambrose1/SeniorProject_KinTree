// sharedTreeModel.js - the model for the sharedTrees table
// this file was replaced with the supabase model
const supabase = require('../lib/supabase');

// all functions for the sharedTree to interact with the database
const sharedTrees = {
    addSharedTree: async (treeData) => {
        console.log('Adding shared tree with data:', treeData);
        // Table and column names are lowercase in Postgres
        const { data, error } = await supabase
            .from('sharedtrees')
            .insert([
                {
                    senderid: treeData.senderID,
                    receiverid: treeData.receiverID,
                    perms: treeData.perms,
                    parentalside: treeData.parentalSide,
                    treeinfo: treeData.treeInfo,
                    sharedate: new Date().toISOString(),
                    comment: treeData.comment || null
                }
             ])
            .select('*')
            .single();
        if (error) throw error;
        return data;
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
            .eq('receiverid', id);
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