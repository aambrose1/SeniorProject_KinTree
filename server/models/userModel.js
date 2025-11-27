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
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_uid', authUid)
                .maybeSingle();
            if (error) {
                // If column doesn't exist yet, return null (user doesn't exist)
                if (error.message && error.message.includes('column') && error.message.includes('auth_uid')) {
                    console.warn('auth_uid column does not exist yet - please run the SQL migration');
                    return null;
                }
                throw error;
            }
            return data;
        } catch (error) {
            // If column doesn't exist, treat as user not found
            if (error.message && (error.message.includes('column') || error.message.includes('auth_uid'))) {
                console.warn('auth_uid column does not exist yet - please run the SQL migration');
                return null;
            }
            throw error;
        }
    },

    upsertByAuthUser: async ({ 
        auth_uid, 
        email, 
        username, 
        firstName, 
        lastName, 
        phoneNumber, 
        birthDate,
        displayName,
        address,
        city,
        state,
        country,
        zipcode,
        bio,
        profilePictureUrl
    }) => {
        if (!auth_uid || !email) {
            throw new Error('auth_uid and email are required');
        }

        // Use email as username if username not provided
        const finalUsername = username || email;

        // Check if user exists by auth_uid (created by trigger)
        let existingUser = await User.findByAuthUid(auth_uid);
        
        // If not found by auth_uid, check if user exists by email or username (from trigger)
        // The trigger might have created the user but with same username/email
        if (!existingUser) {
            // Check by email first (more reliable)
            const emailUser = await User.findByEmail(email);
            if (emailUser && emailUser.email === email) {
                existingUser = emailUser;
            } else {
                // Check by username as fallback
                const { data: usernameUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', finalUsername)
                    .maybeSingle();
                if (usernameUser) {
                    existingUser = usernameUser;
                }
            }
        }
        
        // Check for email/username conflicts if they're being updated
        if (existingUser) {
            // If found existing user, check if we need to update auth_uid (in case trigger didn't set it)
            if (!existingUser.auth_uid && auth_uid) {
                // Update auth_uid if missing
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ auth_uid })
                    .eq('id', existingUser.id);
                if (updateError) {
                    // Silent fail - auth_uid update failed but continue anyway
                }
                existingUser.auth_uid = auth_uid;
            }
            
            if (email && email !== existingUser.email) {
                // Check if new email already exists
                const emailConflict = await User.findByEmail(email);
                if (emailConflict && emailConflict.id !== existingUser.id) {
                    throw new Error('Email already exists');
                }
            }
            if (finalUsername && finalUsername !== existingUser.username) {
                // Check if new username already exists
                const { data: usernameConflict } = await supabase
                    .from('users')
                    .select('id')
                    .eq('username', finalUsername)
                    .neq('id', existingUser.id)
                    .maybeSingle();
                if (usernameConflict) {
                    throw new Error('Username already exists');
                }
            }
        }

        // Map to database column names (snake_case)
        // Convert empty strings to null for optional fields
        const normalizeValue = (v) => {
            if (v === undefined || v === null) return undefined; // Don't include undefined/null
            if (typeof v === 'string' && v.trim() === '') return null; // Convert empty strings to null
            return v;
        };

        const rawPayload = {
            auth_uid,
            email,
            username: finalUsername,
            firstname: normalizeValue(firstName),
            lastname: normalizeValue(lastName),
            phonenumber: normalizeValue(phoneNumber),
            birthdate: birthDate || null,
            display_name: normalizeValue(displayName),
            address: normalizeValue(address),
            city: normalizeValue(city),
            state: normalizeValue(state),
            country: normalizeValue(country),
            zipcode: normalizeValue(zipcode),
            bio: normalizeValue(bio),
            profile_picture_url: normalizeValue(profilePictureUrl),
        };
        
        // Remove undefined values (but keep null for explicit empty fields)
        // Keep required fields (email, username) always
        const payload = Object.fromEntries(
            Object.entries(rawPayload).filter(([k, v]) => {
                if (k === 'email' || k === 'username') return v !== undefined && v !== null;
                return v !== undefined; // Keep null values, remove undefined
            })
        );
        
        // If user exists (created by trigger), UPDATE it with extended data
        // Otherwise, INSERT new user
        if (existingUser) {
            // User already exists (trigger created it) - update with extended profile data
            const { data, error } = await supabase
                .from('users')
                .update(payload)
                .eq('id', existingUser.id)
                .select('*')
                .single();
            if (error) {
                throw error;
            }
            return data;
        } else {
            // User doesn't exist - insert new user
            // This should be rare since the trigger creates the user first
            try {
                const { data, error } = await supabase
                    .from('users')
                    .upsert([ payload ], { onConflict: 'auth_uid' })
                    .select('*')
                    .single();
                if (error) throw error;
                return data;
            } catch (upsertError) {
                // If upsert fails due to username/email conflict, try to find and update
                if (upsertError.code === '23505') { // Unique violation
                    // Try to find by email first
                    let conflictUser = await User.findByEmail(email);
                    if (!conflictUser) {
                        // If not found by email, try by username
                        const { data: usernameUser } = await supabase
                            .from('users')
                            .select('*')
                            .eq('username', finalUsername)
                            .maybeSingle();
                        conflictUser = usernameUser;
                    }
                    if (conflictUser) {
                        // Update the conflicting user (created by trigger)
                        const { data, error } = await supabase
                            .from('users')
                            .update(payload)
                            .eq('id', conflictUser.id)
                            .select('*')
                            .single();
                        if (error) throw error;
                        return data;
                    }
                }
                throw upsertError;
            }
        }
    },

    // Update user profile - database is source of truth
    updateUserProfile: async (authUid, profileData) => {
        // Check if user exists, if not create them
        let existingUser = await User.findByAuthUid(authUid);
        if (!existingUser) {
            // User doesn't exist in database yet - create them via upsert
            if (!profileData.email) {
                throw new Error('Email is required to create user profile');
            }
            // Use upsert to create the user
            existingUser = await User.upsertByAuthUser({
                auth_uid: authUid,
                email: profileData.email,
                username: profileData.username || profileData.email,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phoneNumber: profileData.phone_number,
                birthDate: profileData.birthdate,
                displayName: profileData.displayName,
                address: profileData.address,
                city: profileData.city,
                state: profileData.state,
                country: profileData.country,
                zipcode: profileData.zipcode,
                bio: profileData.bio,
                profilePictureUrl: profileData.profilePictureUrl,
            });
            return existingUser;
        }

        if (profileData.email && profileData.email !== existingUser.email) {
            const emailConflict = await User.findByEmail(profileData.email);
            if (emailConflict && emailConflict.id !== existingUser.id) {
                throw new Error('Email already exists');
            }
        }

        if (profileData.username && profileData.username !== existingUser.username) {
            const { data: usernameConflict } = await supabase
                .from('users')
                .select('id')
                .eq('username', profileData.username)
                .neq('id', existingUser.id)
                .maybeSingle();
            if (usernameConflict) {
                throw new Error('Username already exists');
            }
        }

        // Map frontend field names to database column names
        const dbPayload = {
            email: profileData.email,
            username: profileData.username,
            firstname: profileData.firstName,
            lastname: profileData.lastName,
            phonenumber: profileData.phone_number,
            birthdate: profileData.birthdate,
            display_name: profileData.displayName,
            address: profileData.address,
            city: profileData.city,
            state: profileData.state,
            country: profileData.country,
            zipcode: profileData.zipcode,
            bio: profileData.bio,
            profile_picture_url: profileData.profilePictureUrl,
        };

        // Remove undefined/null values
        const cleanPayload = Object.fromEntries(
            Object.entries(dbPayload).filter(([_, v]) => v !== undefined && v !== null)
        );

        const { data, error } = await supabase
            .from('users')
            .update(cleanPayload)
            .eq('auth_uid', authUid)
            .select('*')
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