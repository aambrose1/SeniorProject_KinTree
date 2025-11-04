// treeInfoModel.js - model for treeInfo table (Supabase)
const supabase = require('../lib/supabase');

const treeInfo = {
    addObject: async (data) => {
        const { data: inserted, error } = await supabase
            .from('treeinfo')
            .insert([ data ])
            .select('*')
            .single();
        if (error) throw error;
        return inserted;
    },

    updateObject: async (userId, data) => {
        const { data: updated, error } = await supabase
            .from('treeinfo')
            .update(data)
            .eq('userid', userId)
            .select('*')
            .single();
        if (error) throw error;
        return updated;
    },

    getObject: async (userId) => {
        const { data, error } = await supabase
            .from('treeinfo')
            .select('*')
            .eq('userid', userId)
            .maybeSingle();
        if (error) throw error;
        return data;
    },
};

module.exports = treeInfo;
