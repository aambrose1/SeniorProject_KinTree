// userModel.js - the model for the user table
// this file was replaced with the supabase model
const supabase = require('../lib/supabase');

// all functions for the user to interact with the database
const User = {
    register: async (userData) => {
        const { data, error } = await supabase
            .from('users')
            .insert([ userData ])
            .select('id, firstname, lastname, email, phonenumber, birthdate')
            .single();
        if (error) throw error;
        return data;
    },

    findByEmail: async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    findById: async (id) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    updateUserInfo: async (id, userData) => {
        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },

    deleteUser: async (id) => {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    getAllUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        if (error) throw error;
        return data;
    },
    
    findByAuthUid: async (authUid) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_uid', authUid)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    upsertByAuthUser: async ({ auth_uid, email, username, firstName, lastName, phoneNumber, birthDate, gender }) => {
        // Map to lowercase columns and drop null/undefined so we don't overwrite with nulls
        const rawPayload = {
            auth_uid,
            email,
            username,
            firstname: firstName,
            lastname: lastName,
            phonenumber: phoneNumber,
            birthdate: birthDate,
            gender: gender
        };
        const payload = Object.fromEntries(
            Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const { data, error } = await supabase
            .from('users')
            .upsert([ payload ], { onConflict: 'auth_uid' })
            .select('id, auth_uid, email, username, firstname, lastname, phonenumber, birthdate, gender')
            .single();
        if (error) throw error;
        return data;
    },
};

// Helper to resolve UUID (auth_uid) to integer user ID
const resolveUserIdFromAuthUid = async (authUidOrIntId) => {
    try {
    // If it's already an integer, return it
    if (!isNaN(authUidOrIntId) && !authUidOrIntId.toString().includes('-')) {
        return parseInt(authUidOrIntId);
    }
    // Otherwise look up by auth_uid
    const user = await User.findByAuthUid(authUidOrIntId);
    if (!user) return null;
    return user.id;
    } catch (error) {
        console.error('Error resolving user ID from auth_uid:', error);
        return null;
    }
};

User.resolveUserIdFromAuthUid = resolveUserIdFromAuthUid;

module.exports = User;