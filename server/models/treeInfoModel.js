// treeInfoModel.js - model for treeInfo table (Supabase)
const supabase = require('../lib/supabase');

const treeInfo = {
    addObject: async (newData) => {
        console.log('addObject called with userid:', newData.userid, 'and object:', newData.object);
        const { data: inserted, error } = await supabase
            .from('treeinfo')
            .insert(newData)
            .select('*')
            .single();
        if (error) throw error;
        return inserted;
    },

    updateObject: async (userid, updateData) => {
        console.log('updateObject called with userid:', userid, 'and data:', updateData);
        const { data, error } = await supabase
            .from('treeinfo')
            .update(updateData)
            .eq('userid', userid)
            .select()
            .single();
        if (error) throw error;
        return data;
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
