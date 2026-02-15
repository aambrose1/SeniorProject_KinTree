// relationshipModel.js - the model for the relationships table
// this file was replaced with the supabase model
const supabase = require('../lib/supabase');

// all functions for the relationship to interact with the database
const Relationships = {
    addRelationship: async (data) => {
        // Map camelCase to lowercase column names for Postgres
        const mappedData = {
            person1_id: data.person1_id || data.person1Id,
            person2_id: data.person2_id || data.person2Id,
            relationshiptype: data.relationshipType || data.relationshiptype,
            relationshipstatus: data.relationshipStatus || data.relationshipstatus,
            side: data.side,
            userid: data.userId || data.userid,
        };

        // Remove undefined/null values
        Object.keys(mappedData).forEach(key => mappedData[key] === undefined && delete mappedData[key]);
        const { data: inserted, error } = await supabase
            .from('relationships')
            .insert([ mappedData ])
            .select('*')
            .single();
        if (error) throw error;
        return inserted;
    },

    updateRelationship: async (person1Id, person2Id, updates) => {
        // Map camelCase fields to database column names
        const mappedUpdates = {
            person1_id: updates.person1_id || updates.person1Id,
            person2_id: updates.person2_id || updates.person2Id,
            relationshiptype: updates.relationshipType || updates.relationshiptype,
            relationshipstatus: updates.relationshipStatus || updates.relationshipstatus,
            side: updates.side,
            userid: updates.userId || updates.userid,
        };

        // Remove undefined values so we only update what is provided
        Object.keys(mappedUpdates).forEach(
            key => mappedUpdates[key] === undefined && delete mappedUpdates[key]
        );

        const { data, error } = await supabase
            .from('relationships')
            .update(mappedUpdates)
            .eq('person1_id', person1Id)
            .eq('person2_id', person2Id)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    },
  
    getRelationships: async (personId) => {
        // person1_id = personId OR person2_id = personId
        const { data, error } = await supabase
            .from('relationships')
            .select('*')
            .or(`person1_id.eq.${personId},person2_id.eq.${personId}`);
        if (error) throw error;
        return data;
    },

    filterBySide: async (personId, side) => {
        const { data, error } = await supabase
            .from('relationships')
            .select('*')
            .eq('person1_id', personId)
            .eq('side', side);
        if (error) throw error;
        return data;
    },

    getRelationshipbyId: async (personId) => {
        const { data, error } = await supabase
            .from('relationships')
            .select('*')
            .eq('person1_id', personId)
            .eq('person2_id', personId);
        if (error) throw error;
        return data;
    },

    getRelationshipByUser: async (userId) => {
        const { data, error } = await supabase
            .from('relationships')
            .select('*')
            .eq('userid', userId);
        if (error) throw error;
        return data;
    },

    getRelationshipByOtherUser: async (userId) => {
        const { data, error } = await supabase
            .from('relationships')
            .select('*')
            .not('userid', 'eq', userId);
        if (error) throw error;
        return data;
    },

    deleteByUser: async (userId) => {
        const { error } = await supabase
            .from('relationships')
            .delete()
            .eq('userid', userId);
        if (error) throw error;
    }
};

module.exports = Relationships;
