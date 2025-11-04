// backupModel.js - model for backups table (Supabase)
const supabase = require('../lib/supabase');

const backup = {
    addBackup: async(userId, data) => {
        // Resolve UUID to integer if needed
        let userIdInt = userId;
        if (typeof userId === 'string' && userId.includes('-')) {
            const User = require('./userModel');
            userIdInt = await User.resolveUserIdFromAuthUid(userId);
            if (!userIdInt) throw new Error('User not found');
        }
        const { data: inserted, error } = await supabase
            .from('backups')
            .insert([{ userid: userIdInt, backupdata: data }])
            .select('*')
            .single();
        if (error) throw error;
        return inserted;
    },
    getBackups: async (id) => {
        const { data, error } = await supabase
            .from('backups')
            .select('*')
            .eq('backupid', id);
        if (error) throw error;
        return data;
    },
    getLatestBackup: async (userId) => {
        // Resolve UUID to integer if needed
        let userIdInt = userId;
        if (typeof userId === 'string' && userId.includes('-')) {
            const User = require('./userModel');
            userIdInt = await User.resolveUserIdFromAuthUid(userId);
            if (!userIdInt) throw new Error('User not found');
        }
        const { data, error } = await supabase
            .from('backups')
            .select('*')
            .eq('userid', userIdInt)
            .order('createdat', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        return data;
    }
};

module.exports = backup;