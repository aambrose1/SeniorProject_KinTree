// treeInfoModel.js - model for treeInfo table (Supabase)
const supabase = require('../lib/supabase');

const treeInfo = {
    addObject: async (data) => {
        console.log('addObject called with userid:', data.userid, 'and object:', data.object);
        const { inserted, error } = await supabase
            .from('treeinfo')
            .insert(data)
            .select('*')
            .single();
        if (error) throw error;
        return inserted;
    },

    updateObject: async (userid, data) => {
        const { data: updated, error } = await supabase
            .from('treeinfo')
            .update(data)
            .eq('userid', userid)
            .select('*')
            .single();
        if (error) throw error;
        return updated;
    },

    getObject: async (userid) => {
        const { data, error } = await supabase
            .from('treeinfo')
            .select('*')
            .eq('userid', userid)
            .maybeSingle();
        if (error) throw error;
        return data;
    },
};

module.exports = treeInfo;
