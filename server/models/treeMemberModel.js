// treeMemberModel.js - the model for the treeMembers table
// this file was replaced with the supabase model
const supabase = require('../lib/supabase');

// all functions for the treeMember to interact with the database
const treeMember = {
    addMember: async (data) => {
        console.log('addMember received data:', data);
        // Map camelCase to lowercase column names for Postgres
        const mappedData = {
            firstname: data.firstName || data.firstname,
            lastname: data.lastName || data.lastname,
            birthdate: data.birthDate || data.birthdate,
            deathdate: data.deathDate || data.deathdate,
            location: data.location,
            phonenumber: data.phoneNumber || data.phonenumber,
            userid: data.userId || data.userid,
            memberuserid: data.memberUserId || data.memberuserid,
            gender: data.gender
        };
        // // Remove undefined/null values
        // Object.keys(mappedData).forEach(key => mappedData[key] === undefined && delete mappedData[key]);
        
        // Validate that userid is an integer (not a UUID)
        if (mappedData.userid && (typeof mappedData.userid === 'string' && mappedData.userid.includes('-'))) {
            throw new Error(`Invalid userid: expected integer, got UUID: ${mappedData.userid}`);
        }
        if (mappedData.memberuserid && (typeof mappedData.memberuserid === 'string' && mappedData.memberuserid.includes('-'))) {
            throw new Error(`Invalid memberuserid: expected integer, got UUID: ${mappedData.memberuserid}`);
        }
        
        console.log('addMember mappedData:', mappedData);
        const { data: inserted, error } = await supabase
            .from('treemembers')
            .insert([ mappedData ])
            .select('id')
            .single();
        if (error) {
            console.error('addMember Supabase error:', error);
            throw error;
        }
        return inserted;
    },

    getAllMembers: async () => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*');
        if (error) throw error;
        return data;
    },

    getAllMembersbyId: async (id) => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*')
            .eq('userid', id);
        if (error) throw error;
        return data;
    },

    getMemberById: async (id) => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*')
            .eq('userid', id)
            .eq('memberuserid', id)
            .single();
        if (error) throw error;
        return data;
    },

    getMembersByUser: async (userId) => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*')
            .eq('userid', userId);
        if (error) throw error;
        return data;
    },

    getMembersByOtherUser: async (userId) => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*')
            .not('userid', 'eq', userId);
        if (error) throw error;
        return data;
    },
    
    // i cant get this to workkkkkkk
    updateMemberInfo: async (id, data) => {
        // Map camelCase to lowercase column names for Postgres
        const mappedData = {};
        if (data.firstName !== undefined) mappedData.firstname = data.firstName;
        if (data.lastName !== undefined) mappedData.lastname = data.lastName;
        if (data.birthDate !== undefined) mappedData.birthdate = data.birthDate;
        if (data.deathDate !== undefined) mappedData.deathdate = data.deathDate;
        if (data.location !== undefined) mappedData.location = data.location;
        if (data.phoneNumber !== undefined) mappedData.phonenumber = data.phoneNumber;
        if (data.userId !== undefined) mappedData.userid = data.userId;
        if (data.memberUserId !== undefined) mappedData.memberuserid = data.memberUserId;
        // Also handle lowercase variants
        if (data.firstname !== undefined) mappedData.firstname = data.firstname;
        if (data.lastname !== undefined) mappedData.lastname = data.lastname;
        if (data.birthdate !== undefined) mappedData.birthdate = data.birthdate;
        if (data.deathdate !== undefined) mappedData.deathdate = data.deathdate;
        if (data.phonenumber !== undefined) mappedData.phonenumber = data.phonenumber;
        if (data.userid !== undefined) mappedData.userid = data.userid;
        if (data.memberuserid !== undefined) mappedData.memberuserid = data.memberuserid;
        const { data: updated, error } = await supabase
            .from('treemembers')
            .update(mappedData)
            .eq('id', id)
            .select('*')
            .single();
        if (error) throw error;
        return updated;
    },

    assignNewMemberRelationship: async (recieverId, getMemberById, relationshipType) => {
        // Update an existing relationship record tying two members together
        const { error } = await supabase
            .from('relationships')
            .update({ relationshipType })
            .match({ person1_id: recieverId, person2_id: getMemberById });
        if (error) throw error;
        return { success: true };
    },

    deleteByUser: async (userId) => {
        const { error } = await supabase
            .from('treemembers')
            .delete()
            .eq('userid', userId);
        if (error) throw error;
    },
      
    getActiveMemberId: async (id) => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*')
            .eq('userid', id)
            .eq('memberuserid', id)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    getMemberbyMemberId: async (id) => {
        const { data, error } = await supabase
            .from('treemembers')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) throw error;
        return data;
    }
};

module.exports = treeMember;
