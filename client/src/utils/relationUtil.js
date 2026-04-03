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
        'aunt': 'parent',      // place as same generation as parents
        'uncle': 'parent',     // place as same generation as parents
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

export function addRelationship(treeIndex, accountUserId, relativeId, relationship, side = null) {
    if (!treeIndex[`${accountUserId}`] || !treeIndex[`${relativeId}`]) {
        throw new Error("Account user or relative not found in tree");
    }

    const accountUser = treeIndex[`${accountUserId}`]; // the user that the relationship is being added to
    const relative = treeIndex[`${relativeId}`]; // the user that is being added as a relationship

    // Ensure all relationship lists exist upfront
    ensureAllRelationshipLists(accountUser);
    ensureAllRelationshipLists(relative);

    // Map extended relationship types to fundamental tree relationships
    const treeRelationship = mapToTreeRelationship(relationship);
    console.log(`Mapping relationship "${relationship}" to tree relationship "${treeRelationship}"`);

    if (relationship === 'grandparent') {
        const targetParentId = getPreferredParentId(accountUser, side);

        if (!targetParentId) {
            console.warn(`No parent found for grandparent relationship, falling back to direct parent placement.`);

            if (accountUser.rels.parents.length >= 2) {
                throw new Error(`${accountUser.data["first name"]} already has 2 parents in the tree`);
            }

            if (!relative.rels.children.includes(`${accountUserId}`)) {
                relative.rels.children.push(`${accountUserId}`);
            }

            if (!accountUser.rels.parents.includes(`${relativeId}`)) {
                accountUser.rels.parents.push(`${relativeId}`);
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
        case "parent": { // Relative is the parent of the account user
            // Check if user already has maximum number of parents (2)
            if (accountUser.rels.parents.length >= 2) {
                throw new Error(`${accountUser.data["first name"]} already has 2 parents in the tree`);
            }

            // Add user as a child to relative
            if (!relative.rels.children.includes(`${accountUserId}`)) {
                relative.rels.children.push(`${accountUserId}`);
            }

            // Add relative as parent of account user
            if (!accountUser.rels.parents.includes(`${relativeId}`)) {
                accountUser.rels.parents.push(`${relativeId}`);
            }
            break;
        }

        case "child": { // Relative is a child of the account user
            // Check if child already has maximum number of parents (2)
            if (relative.rels.parents.length >= 2) {
                throw new Error(`${relative.data["first name"]} already has 2 parents in the tree`);
            }

            // Add relative as child to user
            if (!accountUser.rels.children.includes(`${relativeId}`)) {
                accountUser.rels.children.push(`${relativeId}`);
            }

            // Add user as parent of relative
            if (!relative.rels.parents.includes(`${accountUserId}`)) {
                relative.rels.parents.push(`${accountUserId}`);
            }
            break;
        }

        case "sibling": { // Relative is a sibling of the account user
            // If relative has parents, share those parents
            if (relative.rels.parents.length > 0) {
                // Add the relative's parents as the account user's parents
                relative.rels.parents.forEach(parentId => {
                    const parent = treeIndex[`${parentId}`];
                    if (!accountUser.rels.parents.includes(`${parentId}`)) {
                        accountUser.rels.parents.push(`${parentId}`);
                    }
                    if (parent) {
                        ensureAllRelationshipLists(parent);
                        if (!parent.rels.children.includes(`${accountUserId}`)) {
                            parent.rels.children.push(`${accountUserId}`);
                        }
                    }
                });
            }
            // If relative has no parents, share the account user's parents
            else if (accountUser.rels.parents.length > 0) {
                accountUser.rels.parents.forEach(parentId => {
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
            // If neither has parents, fall back to a simple parent-child link so the node still appears
            else {
                console.warn(`Neither user has parents to share for sibling relationship. Adding as child instead.`);
                if (!accountUser.rels.children.includes(`${relativeId}`)) {
                    accountUser.rels.children.push(`${relativeId}`);
                }
                if (!relative.rels.parents.includes(`${accountUserId}`)) {
                    relative.rels.parents.push(`${accountUserId}`);
                }
            }
            break;
        }

        case "spouse": { // Relative is a spouse of the account user
            // Add each other as spouses
            if (!accountUser.rels.spouses.includes(`${relativeId}`)) {
                accountUser.rels.spouses.push(`${relativeId}`);
            }
            if (!relative.rels.spouses.includes(`${accountUserId}`)) {
                relative.rels.spouses.push(`${accountUserId}`);
            }

            // Add relative's children to account user and make account user their parent
            if (relative.rels.children.length > 0) {
                relative.rels.children.forEach(childId => {
                    const child = treeIndex[`${childId}`];
                    ensureAllRelationshipLists(child);

                    // Add account user as parent if not already present and child has less than 2 parents
                    if (!child.rels.parents.includes(`${accountUserId}`) && child.rels.parents.length < 2) {
                        child.rels.parents.push(`${accountUserId}`);
                    }

                    // Add child to account user's children if not already present
                    if (!accountUser.rels.children.includes(`${childId}`)) {
                        accountUser.rels.children.push(`${childId}`);
                    }
                });
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

