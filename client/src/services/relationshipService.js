/**
 * RelationshipService handles the business logic for family tree connections.
 * It manages "smart detection" (identifying partners/parents) and determines
 * which database relationships should be created based on user selection.
 */

export const relationshipService = {
    /**
     * Maps user-friendly relationship labels to shared database/visualization logic.
     */
    EXTENDED_RELATIONS: {
        "parent": { map: "parent", label: "Spouse of Parent", filter: ["parent", "spouse"] },
        "mother": { map: "parent", label: "Husband/Partner (Existing Father)", filter: ["parent", "spouse"], gender: "F" },
        "father": { map: "parent", label: "Wife/Partner (Existing Mother)", filter: ["parent", "spouse"], gender: "M" },
        "spouse": { map: "spouse", label: "Existing Children?", filter: ["child"] },
        "child": { map: "child", label: "Other Parent?", filter: ["spouse", "parent"] },
        "cousin": { map: "child", label: "Parent of Cousin (Aunt/Uncle)", filter: ["aunt", "uncle", "sibling"] },
        "niece": { map: "child", label: "Parent of Niece (Sibling)", filter: ["sibling"], gender: "F" },
        "nephew": { map: "child", label: "Parent of Nephew (Sibling)", filter: ["sibling"], gender: "M" },
        "aunt": { map: "sibling", label: "Sibling of Aunt (Parent)", filter: ["parent"], gender: "F" },
        "uncle": { map: "sibling", label: "Sibling of Uncle (Parent)", filter: ["parent"], gender: "M" },
        "grandparent": { map: "parent", label: "Child of Grandparent (Parent)", filter: ["parent"] },
        "grandmother": { map: "parent", label: "Child of Grandmother (Parent)", filter: ["parent"], gender: "F" },
        "grandfather": { map: "parent", label: "Child of Grandfather (Parent)", filter: ["parent"], gender: "M" },
        "grandchild": { map: "child", label: "Parent of Grandchild (Child)", filter: ["child"] },
        "sibling": { map: "sibling", label: "Link to Parent", filter: ["parent"] },
        "sister": { map: "sibling", label: "Link to Parent", filter: ["parent"], gender: "F" },
        "brother": { map: "sibling", label: "Link to Parent", filter: ["parent"], gender: "M" }
    },

    /**
     * Resolves the "Smart Target" - the existing member who should be bridged.
     * @param {Object} treeInfo The indexed tree data (id -> node)
     * @param {string} currentUserId The ID of the user adding the member
     * @param {string} relationshipType The selected relationship (e.g., 'mother')
     * @param {string} side Maternal/Paternal distinction
     * @returns {string|null} The ID of the bridge member or null
     */
    findSmartTarget(treeInfo, currentUserId, relationshipType, side) {
        if (!treeInfo || !currentUserId) return null;

        const userNode = treeInfo[String(currentUserId)];
        if (!userNode) return null;

        const parents = userNode.rels?.parents || [];
        const isRealNode = (id) => !String(id).startsWith('ghost_');

        // CASE: Adding Mother when Father exists
        if (relationshipType === 'mother' && parents.length > 0) {
            // Find a parent who is Male
            return parents.find(pId => isRealNode(pId) && treeInfo[pId]?.data?.gender === 'M') || parents.find(isRealNode) || null;
        }

        // CASE: Adding Father when Mother exists
        if (relationshipType === 'father' && parents.length > 0) {
            // Find a parent who is Female
            return parents.find(pId => isRealNode(pId) && treeInfo[pId]?.data?.gender === 'F') || parents.find(isRealNode) || null;
        }

        // CASE: Adding Sibling
        if (["sibling", "sister", "brother"].includes(relationshipType)) {
            return parents.find(isRealNode) || null; // Link to first available real parent
        }

        // CASE: Grandparents, Aunts, Uncles (Recursive through parents)
        if (relationshipType.includes("grand") || ["aunt", "uncle", "cousin"].includes(relationshipType)) {
            if (parents.length === 0) return null;
            
            if (side === "maternal") {
                // Find Mother
                return parents.find(pId => isRealNode(pId) && treeInfo[pId]?.data?.gender === 'F') || parents.find(isRealNode) || null;
            }
            if (side === "paternal") {
                // Find Father
                return parents.find(pId => isRealNode(pId) && treeInfo[pId]?.data?.gender === 'M') || parents.find(isRealNode) || null;
            }
        }

        return null;
    },

    /**
     * Determines which database relationship records need to be created.
     * @param {string} currentUserId The user ID adding the member
     * @param {string} newMemberId The ID of the newly created member
     * @param {string} relationshipType The user's selection
     * @param {string} connectToId The ID of the auto-detected or manually selected partner
     * @param {string} side Maternal/Paternal/null
     * @returns {Array} List of relationship objects to POST to the DB
     */
    getRequiredDBRelationships(currentUserId, newMemberId, relationshipType, connectToId, side = null) {
        const rels = [];
        const config = this.EXTENDED_RELATIONS[relationshipType];
        const safeConnectToId = String(connectToId || '').startsWith('ghost_') ? null : connectToId;
        
        // 1. Specialized Logic for Mothers/Fathers
        if (relationshipType === 'mother' || relationshipType === 'father') {
            // New Mother/Father is ALWAYS a parent of the Current User
            rels.push({
                person1_id: currentUserId,
                person2_id: newMemberId,
                relationshipType: 'parent',
                side: relationshipType === 'mother' ? 'maternal' : 'paternal'
            });

            // If a partner (connectToId) was found, ALSO link them as spouses
            if (safeConnectToId) {
                rels.push({
                    person1_id: safeConnectToId,
                    person2_id: newMemberId,
                    relationshipType: 'spouse',
                    side: null
                });
            }
        } 
        // 2. Specialized Logic for Siblings
        else if (["sibling", "sister", "brother"].includes(relationshipType)) {
            if (safeConnectToId) {
                // Link sibling to the parent identified
                rels.push({
                    person1_id: safeConnectToId,
                    person2_id: newMemberId,
                    relationshipType: 'parent',
                    side: null
                });
            } else {
                // No parent found? Default to a generic sibling link to the User
                rels.push({
                    person1_id: currentUserId,
                    person2_id: newMemberId,
                    relationshipType: config?.map || 'sibling',
                    side: null
                });
            }
        }
        // 3. Default Case (Spouse, Child, Grandparent, etc.)
        else {
             // If connectToId is provided, we map via that person
               const target = safeConnectToId || currentUserId;
             rels.push({
                person1_id: target,
                person2_id: newMemberId,
                relationshipType: config?.map || relationshipType,
                side: side
             });
        }

        return rels;
    }
};
