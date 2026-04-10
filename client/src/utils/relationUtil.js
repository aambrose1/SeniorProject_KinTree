/**
 * Maps extended relationship types to the fundamental tree relationships
 * that family-chart can represent (parent, child, spouse, sibling).
 */
export function mapToTreeRelationship(relationship) {
    const mapping = {
        'parent': 'parent',
        'mother': 'parent',
        'father': 'parent',
        'child': 'child',
        'daughter': 'child',
        'son': 'child',
        'spouse': 'spouse',
        'wife': 'spouse',
        'husband': 'spouse',
        'sibling': 'sibling',
        'sister': 'sibling',
        'brother': 'sibling',
        'grandparent': 'grandparent',
        'grandmother': 'grandparent',
        'grandfather': 'grandparent',
        'grandchild': 'child',
        'granddaughter': 'child',
        'grandson': 'child',
        'aunt': 'aunt_uncle',
        'uncle': 'aunt_uncle',
        'niece': 'niece_nephew',
        'nephew': 'niece_nephew',
        'cousin': 'cousin',
    };
    return mapping[relationship] || relationship;
}

function ensureAllRelationshipLists(node) {
    if (!node.rels) node.rels = {};
    if (!node.rels.parents) node.rels.parents = [];
    if (!node.rels.children) node.rels.children = [];
    if (!node.rels.spouses) node.rels.spouses = [];
}

function getPreferredParentId(node, side) {
    const parents = node.rels?.parents || [];
    if (parents.length === 0) return null;
    if (side === 'maternal') return parents[0] || null;
    if (side === 'paternal') return parents[1] || parents[0] || null;
    return parents[0] || null;
}

/**
 * Creates a "Ghost Node" in the tree to bridge relationship gaps.
 */
function createGhostNode(rel, targetId, treeIndex) {
    const targetNode = treeIndex[targetId];
    const targetName = targetNode?.data["first name"] || "Member";
    
    // If the target node is 'You' (or has no parents/children and is root-like), use "Your"
    // In our app, if the target has a real database ID that matches the current account, it's "You"
    // For simplicity, we can check if the targetName is what we typically see for root
    const rootFirstName = targetNode?.data["first name"];
    const name = (rootFirstName === "You" || !targetNode?.rels?.parents?.length && !targetNode?.data.isGhost) 
        ? `Your ${rel.charAt(0).toUpperCase() + rel.slice(1)}`
        : `${rel.charAt(0).toUpperCase() + rel.slice(1)} of ${targetName}`;

    const ghostId = `ghost_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    treeIndex[ghostId] = {
        id: ghostId,
        data: {
            "first name": `${name}`,
            "last name": "(Ghost)",
            "gender": "Unknown",
            "isGhost": true
        },
        rels: {
            parents: [],
            children: [],
            spouses: []
        }
    };
    return ghostId;
}

/**
 * Checks for circular relationships (simple ancestor check).
 */
function isAncestor(treeIndex, potentialAncestorId, nodeId, visited = new Set()) {
    if (potentialAncestorId === nodeId) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    const node = treeIndex[nodeId];
    if (!node || !node.rels?.parents) return false;

    return node.rels.parents.some(parentId => isAncestor(treeIndex, potentialAncestorId, parentId, visited));
}

/**
 * Relationship Strategy Handlers
 * Returns an object with { success: boolean, summary: string, warnings: array }
 */
const STRATEGIES = {
    parent: (treeIndex, subjectId, relativeId) => {
        const subject = treeIndex[subjectId];
        const relative = treeIndex[relativeId];
        
        if (isAncestor(treeIndex, subjectId, relativeId)) {
            throw new Error(`Circular relationship detected: ${relative.data["first name"]} cannot be a parent of ${subject.data["first name"]}.`);
        }

        if (subject.rels.parents.length >= 2 && !subject.rels.parents.includes(relativeId)) {
            throw new Error(`${subject.data["first name"]} already has 2 parents.`);
        }

        if (!subject.rels.parents.includes(relativeId)) subject.rels.parents.push(relativeId);
        if (!relative.rels.children.includes(subjectId)) relative.rels.children.push(subjectId);
        
        // AUTO-SPOUSE: If subject now has 2 parents, link them as spouses
        if (subject.rels.parents.length === 2) {
            const p1Id = subject.rels.parents[0];
            const p2Id = subject.rels.parents[1];
            const p1 = treeIndex[p1Id];
            const p2 = treeIndex[p2Id];
            if (p1 && p2) {
                if (!p1.rels.spouses.includes(p2Id)) p1.rels.spouses.push(p2Id);
                if (!p2.rels.spouses.includes(p1Id)) p2.rels.spouses.push(p1Id);
            }
        }

        return { success: true, summary: `Linked ${relative.data["first name"]} as parent of ${subject.data["first name"]}` };
    },

    child: (treeIndex, subjectId, relativeId) => {
        const subject = treeIndex[subjectId];
        const relative = treeIndex[relativeId];

        if (isAncestor(treeIndex, relativeId, subjectId)) {
            throw new Error(`Circular relationship detected: ${relative.data["first name"]} cannot be a child of ${subject.data["first name"]}.`);
        }

        if (relative.rels.parents.length >= 2 && !relative.rels.parents.includes(subjectId)) {
            throw new Error(`${relative.data["first name"]} already has 2 parents.`);
        }

        if (!subject.rels.children.includes(relativeId)) subject.rels.children.push(relativeId);
        if (!relative.rels.parents.includes(subjectId)) relative.rels.parents.push(subjectId);

        // AUTO-SPOUSE: If the new child already has another parent, link them as spouses
        if (relative.rels.parents.length === 2) {
            const p1Id = relative.rels.parents[0];
            const p2Id = relative.rels.parents[1];
            const p1 = treeIndex[p1Id];
            const p2 = treeIndex[p2Id];
            if (p1 && p2) {
                if (!p1.rels.spouses.includes(p2Id)) p1.rels.spouses.push(p2Id);
                if (!p2.rels.spouses.includes(p1Id)) p2.rels.spouses.push(p1Id);
            }
        }

        return { success: true, summary: `Linked ${relative.data["first name"]} as child of ${subject.data["first name"]}` };
    },

    sibling: (treeIndex, subjectId, relativeId) => {
        const subject = treeIndex[subjectId];
        const relative = treeIndex[relativeId];
        let summary = "";
        let warnings = [];

        // Try to share existing parents
        if (subject.rels.parents.length > 0) {
            subject.rels.parents.forEach(parentId => {
                const parent = treeIndex[parentId];
                if (!relative.rels.parents.includes(parentId)) relative.rels.parents.push(parentId);
                if (parent) {
                    ensureAllRelationshipLists(parent);
                    if (!parent.rels.children.includes(relativeId)) parent.rels.children.push(relativeId);
                }
            });
            summary = `Linked ${relative.data["first name"]} as sibling of ${subject.data["first name"]} via shared parents.`;
        } 
        else {
            // GHOST NODE FIX: Create a placeholder parent instead of making them child/parent
            console.log("No parents found for sibling link. Creating ghost parent.");
            const ghostId = createGhostNode("parent", subjectId, treeIndex);
            
            // Link subject to ghost
            subject.rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(subjectId);
            
            // Link relative to ghost
            relative.rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(relativeId);
            
            summary = `Linked ${relative.data["first name"]} as sibling of ${subject.data["first name"]} via new ghost parent.`;
            warnings.push("Created a placeholder parent node to establish sibling connection.");
        }

        return { success: true, summary, warnings };
    },

    spouse: (treeIndex, subjectId, relativeId) => {
        const subject = treeIndex[subjectId];
        const relative = treeIndex[relativeId];

        if (!subject.rels.spouses.includes(relativeId)) subject.rels.spouses.push(relativeId);
        if (!relative.rels.spouses.includes(subjectId)) relative.rels.spouses.push(subjectId);

        return { success: true, summary: `Linked ${relative.data["first name"]} and ${subject.data["first name"]} as spouses.` };
    },

    grandparent: (treeIndex, subjectId, relativeId, side) => {
        const subject = treeIndex[subjectId];
        const targetParentId = getPreferredParentId(subject, side);

        if (!targetParentId) {
            // GHOST NODE FIX: Create a placeholder parent to attach the grandparent to
            const ghostName = side === 'maternal' ? "Mother" : (side === 'paternal' ? "Father" : "Parent");
            const ghostId = createGhostNode(side === 'maternal' ? "mother" : (side === 'paternal' ? "father" : "parent"), subjectId, treeIndex);
            
            // Link subject to ghost (Parent)
            subject.rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(subjectId);
            
            // Link relative to ghost as parent (Grandparent)
            return STRATEGIES.parent(treeIndex, ghostId, relativeId);
        }

        return STRATEGIES.parent(treeIndex, targetParentId, relativeId);
    },

    aunt_uncle: (treeIndex, subjectId, relativeId, side, targetNodeId) => {
        // If targetNodeId (e.g. Mom) is provided, link relative as Sibling of Mom
        const bridgeId = targetNodeId || getPreferredParentId(treeIndex[subjectId], side);
        
        if (!bridgeId) {
            // Create ghost parent first
            const ghostName = side === 'maternal' ? "Mother" : "Father";
            const ghostId = createGhostNode(side === 'maternal' ? "mother" : "father", subjectId, treeIndex);
            treeIndex[subjectId].rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(subjectId);
            
            return STRATEGIES.sibling(treeIndex, ghostId, relativeId);
        }

        return STRATEGIES.sibling(treeIndex, bridgeId, relativeId);
    },

    cousin: (treeIndex, subjectId, relativeId, side, targetNodeId) => {
        // Cousin = Child of an Aunt/Uncle
        // If targetNodeId (Aunt) is provided, link relative as Child of Aunt
        if (targetNodeId) {
            return STRATEGIES.child(treeIndex, targetNodeId, relativeId);
        }

        // Fallback: try to find an aunt/uncle on the correct side
        const ghostId = createGhostNode("relative", subjectId, treeIndex);
        STRATEGIES.aunt_uncle(treeIndex, subjectId, ghostId, side); // link ghost aunt to subject
        
        return STRATEGIES.child(treeIndex, ghostId, relativeId);
    },

    niece_nephew: (treeIndex, subjectId, relativeId, side, targetNodeId) => {
        // Niece/Nephew = Child of a Sibling
        if (targetNodeId) {
            return STRATEGIES.child(treeIndex, targetNodeId, relativeId);
        }

        // For now, ghost node
        const ghostId = createGhostNode("sibling", subjectId, treeIndex);
        STRATEGIES.sibling(treeIndex, subjectId, ghostId);
        
        return STRATEGIES.child(treeIndex, ghostId, relativeId);
    }
};

/**
 * Main entry point for adding relationships to the tree index.
 */
export function addRelationship(treeIndex, accountUserId, relativeId, relationship, side = null, targetNodeId = null) {
    const accountUser = treeIndex[`${accountUserId}`]; 
    const relative = treeIndex[`${relativeId}`];
    
    if (!accountUser || !relative) {
        throw new Error("One or more persons not found in tree index.");
    }

    // Determine subject: Mother/Father/Spouse always link to the account user.
    // Others (Aunt/Uncle/Cousin) might bridge via a targetNodeId.
    const isDirectRel = ["mother", "father", "spouse", "child", "sibling", "parent"].includes(relationship.toLowerCase());
    const subjectId = (targetNodeId && treeIndex[targetNodeId] && !isDirectRel) ? `${targetNodeId}` : `${accountUserId}`;

    ensureAllRelationshipLists(accountUser);
    ensureAllRelationshipLists(relative);
    if (targetNodeId && treeIndex[targetNodeId]) ensureAllRelationshipLists(treeIndex[targetNodeId]);

    let treeRelationship = mapToTreeRelationship(relationship);
    
    // If a bridge target is provided, we simplify the relationship logic
    // (e.g., adding a "Grandmother" via your "Mother" is just adding a "Parent" to that Mother)
    if (targetNodeId && treeIndex[targetNodeId] && !isDirectRel) {
        const simplification = {
            'grandparent': 'parent',
            'aunt_uncle': 'sibling',
            'cousin': 'child',
            'niece_nephew': 'child'
        };
        if (simplification[treeRelationship]) {
            console.log(`Simplifying ${treeRelationship} to ${simplification[treeRelationship]} because bridge [${targetNodeId}] is present.`);
            treeRelationship = simplification[treeRelationship];
        }
    }

    console.log(`AddRelationship [${relationship}] for ${relative.data["first name"]}. Mapping to: ${treeRelationship}`);

    const strategy = STRATEGIES[treeRelationship];
    if (strategy) {
        try {
            return strategy(treeIndex, subjectId, relativeId, side, targetNodeId);
        } catch (err) {
            console.error(`Strategy error for ${treeRelationship}:`, err.message);
            throw err;
        }
    }

    // Default Fallback
    console.warn(`No strategy for relationship: ${relationship}. Falling back to default child link.`);
    return STRATEGIES.child(treeIndex, accountUserId, relativeId);
}

/**
 * Removes a node and its relationships.
 */
export function removeNodeFromTree(treeIndex, nodeId) {
    const stringId = `${nodeId}`;
    if (!treeIndex[stringId]) return;

    Object.values(treeIndex).forEach(node => {
        if (!node.rels) return;
        if (node.rels.parents) node.rels.parents = node.rels.parents.filter(id => `${id}` !== stringId);
        if (node.rels.children) node.rels.children = node.rels.children.filter(id => `${id}` !== stringId);
        if (node.rels.spouses) node.rels.spouses = node.rels.spouses.filter(id => `${id}` !== stringId);
    });

    delete treeIndex[stringId];
}

/**
 * Rebuilds the tree from DB records.
 */
export function rebuildTreeFromDatabase(members, relationships) {
    const treeIndex = {};

    members.forEach(member => {
        const idStr = `${member.id}`;
        treeIndex[idStr] = {
            id: idStr,
            data: {
                "first name": member.firstname,
                "last name": member.lastname,
                "gender": member.gender || ""
            },
            rels: { parents: [], children: [], spouses: [] }
        };
    });

    relationships.forEach(rel => {
        try {
            addRelationship(treeIndex, rel.person1_id, rel.person2_id, rel.relationshiptype, rel.side);
        } catch (err) {
            console.warn(`Relationship rebuild error: ${err.message}`, rel);
        }
    });

    return Object.values(treeIndex);
}
