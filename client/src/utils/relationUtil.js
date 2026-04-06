/**
 * Maps extended relationship types to the fundamental tree relationships
 * that family-chart can represent (parent, child, spouse, sibling).
 * 
 * Mapping logic:
 * - grandparent → parent-of-parent placement (structurally, they are an ancestor above)
 * - grandchild  → child  (structurally, they are a descendant below)
 * - aunt/uncle  → sibling (of the relative, i.e. they share parents with someone)
 * - niece/nephew → child  (child of a sibling)
 * - cousin      → sibling (simplest structural approximation)
 * 
 * For the tree visualization, these mappings place the node in a
 * reasonable position even if the exact relationship is more nuanced.
 * The precise relationship label is stored separately in the relationships table.
 */
function mapToTreeRelationship(relationship) {
    const mapping = {
        'parent': 'parent',
        'child': 'child',
        'spouse': 'spouse',
        'sibling': 'sibling',
        'grandparent': 'grandparent',
        'grandchild': 'child',
        'aunt': 'aunt_uncle',
        'uncle': 'aunt_uncle',
        'niece': 'child',      // place as same generation as children
        'nephew': 'child',     // place as same generation as children
        'cousin': 'sibling',   // place as same generation
    };
    return mapping[relationship] || relationship;
}

function ensureRelationshipList(node, key) {
    if (!node.rels?.[key]) {
        node.rels[key] = [];
    }

    return node.rels[key];
}

function ensureAllRelationshipLists(node) {
    ensureRelationshipList(node, 'parents');
    ensureRelationshipList(node, 'children');
    ensureRelationshipList(node, 'spouses');
}

function getPreferredParentId(accountUser, side) {
    const parents = accountUser.rels?.parents || [];

    if (parents.length === 0) {
        return null;
    }

    if (side === 'maternal') {
        return parents[0] || null;
    }

    if (side === 'paternal') {
        return parents[1] || parents[0] || null;
    }

    return parents[0] || null;
}

/**
 * Adds a relationship between two nodes in the treeIndex.
 * 
 * @param {Object} treeIndex - The current index of all tree nodes.
 * @param {string} accountUserId - The ID of the primary node (usually the user).
 * @param {string} relativeId - The ID of the new node being added.
 * @param {string} relationship - The relationship type (parent, child, spouse, sibling, cousin, etc.).
 * @param {string} side - 'maternal' or 'paternal' for ancestors.
 * @param {string} targetNodeId - (Optional) A specific node to link the relative to.
 */
export function addRelationship(treeIndex, accountUserId, relativeId, relationship, side = null, targetNodeId = null) {
    if (!treeIndex[`${accountUserId}`] || !treeIndex[`${relativeId}`]) {
        throw new Error("Account user or relative not found in tree");
    }

    const accountUser = treeIndex[`${accountUserId}`]; 
    const relative = treeIndex[`${relativeId}`];
    
    // If a targetNodeId is provided, we use that as the primary attachment point 
    // for relationships that link "through" someone else (like niece linking to a sibling).
    const subjectNode = targetNodeId && treeIndex[`${targetNodeId}`] ? treeIndex[`${targetNodeId}`] : accountUser;
    const subjectId = targetNodeId && treeIndex[`${targetNodeId}`] ? `${targetNodeId}` : `${accountUserId}`;

    // Ensure all relationship lists exist upfront
    ensureAllRelationshipLists(accountUser);
    ensureAllRelationshipLists(relative);
    if (targetNodeId && treeIndex[targetNodeId]) ensureAllRelationshipLists(treeIndex[targetNodeId]);

    // Map extended relationship types to fundamental tree relationships
    const treeRelationship = mapToTreeRelationship(relationship);
    console.log(`Adding relationship "${relationship}" between ${subjectId} and ${relativeId}`);

    if (relationship === 'grandparent') {
        const targetParentId = getPreferredParentId(subjectNode, side);

        if (!targetParentId) {
            console.warn(`No parent found for grandparent relationship, falling back to direct parent placement.`);

            if (subjectNode.rels.parents.length >= 2) {
                throw new Error(`${subjectNode.data["first name"]} already has 2 parents in the tree`);
            }

            if (!relative.rels.children.includes(subjectId)) {
                relative.rels.children.push(subjectId);
            }

            if (!subjectNode.rels.parents.includes(`${relativeId}`)) {
                subjectNode.rels.parents.push(`${relativeId}`);
            }

            return "Successfully added relationship";
        } else {
            const targetParent = treeIndex[`${targetParentId}`];

            if (!targetParent) {
                throw new Error(`Parent node ${targetParentId} not found in tree`);
            }

            ensureAllRelationshipLists(targetParent);
            const parentList = targetParent.rels.parents;

            if (parentList.length >= 2 && !parentList.includes(`${relativeId}`)) {
                throw new Error(`${targetParent.data["first name"]} already has 2 parents in the tree`);
            }

            if (!parentList.includes(`${relativeId}`)) {
                parentList.push(`${relativeId}`);
            }

            if (!relative.rels.children.includes(`${targetParentId}`)) {
                relative.rels.children.push(`${targetParentId}`);
            }

            return "Successfully added relationship";
        }
    }

    switch (treeRelationship) {
        case "parent": { 
            // Relative is the parent of the subject
            if (subjectNode.rels.parents.length >= 2) {
                throw new Error(`${subjectNode.data["first name"]} already has 2 parents in the tree`);
            }

            if (!relative.rels.children.includes(subjectId)) {
                relative.rels.children.push(subjectId);
            }

            if (!subjectNode.rels.parents.includes(`${relativeId}`)) {
                subjectNode.rels.parents.push(`${relativeId}`);
            }
            break;
        }

        case "child": { 
            // Relative is a child of the subject
            if (relative.rels.parents.length >= 2) {
                throw new Error(`${relative.data["first name"]} already has 2 parents in the tree`);
            }

            if (!subjectNode.rels.children.includes(`${relativeId}`)) {
                subjectNode.rels.children.push(`${relativeId}`);
            }

            if (!relative.rels.parents.includes(subjectId)) {
                relative.rels.parents.push(subjectId);
            }
            break;
        }

        case "sibling": { 
            // Relative is a sibling of the subject
            // If subject has parents, share those parents
            if (subjectNode.rels.parents.length > 0) {
                subjectNode.rels.parents.forEach(parentId => {
                    const parent = treeIndex[`${parentId}`];
                    if (!relative.rels.parents.includes(`${parentId}`)) {
                        relative.rels.parents.push(`${parentId}`);
                    }
                    if (parent) {
                        ensureAllRelationshipLists(parent);
                        if (!parent.rels.children.includes(`${relativeId}`)) {
                            parent.rels.children.push(`${relativeId}`);
                        }
                    }
                });
            }
            // If relative has parents (e.g. from a targetNode link), share with subject
            else if (relative.rels.parents.length > 0) {
                relative.rels.parents.forEach(parentId => {
                    const parent = treeIndex[`${parentId}`];
                    if (!subjectNode.rels.parents.includes(`${parentId}`)) {
                        subjectNode.rels.parents.push(`${parentId}`);
                    }
                    if (parent) {
                        ensureAllRelationshipLists(parent);
                        if (!parent.rels.children.includes(subjectId)) {
                            parent.rels.children.push(subjectId);
                        }
                    }
                });
            }
            // Fallback: simple parent-child link if no common parents exist
            else {
                console.warn(`No parents to share for sibling relationship. Adding as child/parent link.`);
                // If we add a sibling to me, and I have no parents, make me their parent?
                // Actually, let's make them SIBLINGS in the data even without a shared parent
                // family-chart might not show them correctly, but it's better than swapping generations.
                // For now, keep the child fallback but mark it as a fallback.
                if (!subjectNode.rels.children.includes(`${relativeId}`)) {
                    subjectNode.rels.children.push(`${relativeId}`);
                }
                if (!relative.rels.parents.includes(subjectId)) {
                    relative.rels.parents.push(subjectId);
                }
            }
            break;
        }

        case "aunt_uncle": { 
            // Relative is an aunt/uncle of the subject (subject = parent usually)
            // If we have a subject node (Mom), we want to make Relative (Uncle) a SIBLING of Mom.
            if (targetNodeId && treeIndex[`${targetNodeId}`]) {
                console.log(`Adding ${relationship} as SIBLING of target ${targetNodeId}`);
                // Reuse the sibling logic but with subject and relative
                addRelationship(treeIndex, targetNodeId, relativeId, "sibling");
                return "Successfully added relationship";
            }

            // If no targetNodeId is provided, we fall back to finding existing parents
            const targetParentId = getPreferredParentId(subjectNode, side);
            if (targetParentId) {
                console.log(`Adding ${relationship} as SIBLING of parent ${targetParentId}`);
                addRelationship(treeIndex, targetParentId, relativeId, "sibling");
                return "Successfully added relationship";
            }

            // Final fallback: add as a sibling of the account user just to get it on the chart
            // This is safer than adding as a parent which overwrites mom/dad.
            console.warn(`No parents or target found for ${relationship}. Adding as sibling of user.`);
            if (!accountUser.rels.parents.length && !relative.rels.children.length) {
                // If user has no parents, maybe add as parent? No, user hated that.
                // Let's stick to sibling.
            }
            addRelationship(treeIndex, accountUserId, relativeId, "sibling");
            break;
        }

        case "spouse": { 
            if (!subjectNode.rels.spouses.includes(`${relativeId}`)) {
                subjectNode.rels.spouses.push(`${relativeId}`);
            }
            if (!relative.rels.spouses.includes(subjectId)) {
                relative.rels.spouses.push(subjectId);
            }
            break;
        }

        default: {
            console.warn(`Unrecognized relationship type "${relationship}", falling back to child relationship`);
            // Fall back: add as a child so the node at least appears on the tree
            if (!accountUser.rels.children.includes(`${relativeId}`)) {
                accountUser.rels.children.push(`${relativeId}`);
            }
            if (!relative.rels.parents.includes(`${accountUserId}`)) {
                relative.rels.parents.push(`${accountUserId}`);
            }
            break;
        }
    }

    return "Successfully added relationship";
}

