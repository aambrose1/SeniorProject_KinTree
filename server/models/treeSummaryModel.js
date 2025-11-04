// treeSummaryModel.js - model for tree summaries (Supabase)
// Note: This table may need to be created in Supabase if it doesn't exist
const supabase = require('../lib/supabase');

const treeSummary = {
    getSummaryByUser: async (userId) => {
        // Resolve UUID to integer if needed
        let userIdInt = userId;
        if (typeof userId === 'string' && userId.includes('-')) {
            const User = require('./userModel');
            userIdInt = await User.resolveUserIdFromAuthUid(userId);
            if (!userIdInt) return null;
        }
        const { data, error } = await supabase
            .from('usertreesummaries')
            .select('*')
            .eq('userid', userIdInt)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    createSummary: async (userId, userData) => {
        // Resolve UUID to integer if needed
        let userIdInt = userId;
        if (typeof userId === 'string' && userId.includes('-')) {
            const User = require('./userModel');
            userIdInt = await User.resolveUserIdFromAuthUid(userId);
            if (!userIdInt) throw new Error('User not found');
        }
        const { data, error } = await supabase
            .from('usertreesummaries')
            .insert([{ userid: userIdInt, currenttreesummary: userData }])
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },
    
    updateSummary: async (userId, userData) => {
        // Resolve UUID to integer if needed
        let userIdInt = userId;
        if (typeof userId === 'string' && userId.includes('-')) {
            const User = require('./userModel');
            userIdInt = await User.resolveUserIdFromAuthUid(userId);
            if (!userIdInt) throw new Error('User not found');
        }
        const { data, error } = await supabase
            .from('usertreesummaries')
            .update({ currenttreesummary: userData })
            .eq('userid', userIdInt)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    }
};

module.exports = treeSummary;