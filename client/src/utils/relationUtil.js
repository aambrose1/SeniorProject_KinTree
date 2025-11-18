export function addRelationship(treeIndex, accountUserId, relativeId, relationship) {
    if (!treeIndex[`${accountUserId}`] || !treeIndex[`${relativeId}`]) {
        throw new Error("Account user or relative not found in tree");
    }
    
    const accountUser = treeIndex[`${accountUserId}`]; // the user that the relationship is being added to
    const relative = treeIndex[`${relativeId}`]; // the user that is being added as a relationship

    switch (relationship) {
        case "parent": // Relative is the parent of the account user
            // Check if user already has maximum number of parents (2)
            if (accountUser.rels.parents && accountUser.rels.parents.length >= 2) {
                throw new Error(`${accountUser.data["first name"]} already has 2 parents in the tree`);
            }

            // Initialize parents array if it doesn't exist
            if (!accountUser.rels?.parents) {
                accountUser.rels.parents = [];
            }

            // Initialize children array for relative if it doesn't exist
            if (!relative.rels?.children) {
                relative.rels.children = [];
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

        case "child": // Relative is a child of the account user
            // Check if child already has maximum number of parents (2)
            if (relative.rels.parents && relative.rels.parents.length >= 2) {
                throw new Error(`${relative.data["first name"]} already has 2 parents in the tree`);
            }

            // Initialize parents array if it doesn't exist
            if (!relative.rels?.parents) {
                relative.rels.parents = [];
            }
            // Initialize children array for account user if it doesn't exist
            if (!accountUser.rels?.children) {
                accountUser.rels.children = [];
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

        case "sibling": // Relative is a sibling of the account user
            // Check if relative has at least one parent
            if (!relative.rels.parents || relative.rels.parents.length === 0) {
                throw new Error(`Cannot add as sibling: Selected member has no parents`);
            }

            // Initialize parents array if it doesn't exist
            if (!accountUser.rels?.parents) {
                accountUser.rels.parents = [];
            }

            // Add the relative's parents as the account user's parents
            relative.rels.parents.forEach(parentId => {
                const parent = treeIndex[`${parentId}`];
                if (!accountUser.rels.parents.includes(`${parentId}`)) {
                    accountUser.rels.parents.push(`${parentId}`);
                }
                if (!parent.rels.children.includes(`${accountUserId}`)) {
                    parent.rels.children.push(`${accountUserId}`);
                }
            });
            break;

        case "spouse": // Relative is a spouse of the account user
            // initialize spouses array if it doesn't exist
            if (!accountUser.rels?.spouses) {
                accountUser.rels.spouses = [];
            }
            if (!relative.rels?.spouses) {
                relative.rels.spouses = [];
            }

            // Add each other as spouses
            if (!accountUser.rels.spouses.includes(`${relativeId}`)) {
                accountUser.rels.spouses.push(`${relativeId}`);
            }
            if (!relative.rels.spouses.includes(`${accountUserId}`)) {
                relative.rels.spouses.push(`${accountUserId}`);
            }

            // Add relative's children to account user and make account user their parent
            if (relative.rels.children === undefined) break; // no children to add
            relative.rels?.children.forEach(childId => {

                const child = treeIndex[`${childId}`];
                
                // Initialize parents array if it doesn't exist
                if (!child.rels?.parents) {
                    child.rels.parents = [];
                }
                
                // Add account user as parent if not already present and child has less than 2 parents
                if (!child.rels.parents.includes(`${accountUserId}`) && child.rels.parents.length < 2) {
                    child.rels.parents.push(`${accountUserId}`);
                }
                // Initialize children array if it doesn't exist
                if (!accountUser.rels?.children) {
                    accountUser.rels.children = [];
                }

                // Add child to account user's children if not already present
                if (!accountUser.rels.children.includes(`${childId}`)) {
                    accountUser.rels.children.push(`${childId}`);
                }
            });
            break;

        default:
            throw new Error("Invalid relationship type");
    }

    return "Successfully added relationship";
}
