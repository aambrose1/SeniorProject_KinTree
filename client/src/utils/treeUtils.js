export function addRelationship(treeIndex, accountUserId, relativeId, relationship) {
    if (!treeIndex[accountUserId] || !treeIndex[relativeId]) {
        throw new Error("Account user or relative not found in tree");
    }

    const accountUser = treeIndex[accountUserId]; // the user that the relationship is being added to
    const relative = treeIndex[relativeId]; // the user that is being added as a relationship

    switch (relationship) {
        case "parent": // Relative is the parent of the account user
            // Check if user already has a parent of this gender
            if (relative.data.gender === "M" && accountUser.rels.father) {
                throw new Error(`${accountUser.data["first name"]} already has a father in the tree`);
            }
            if (relative.data.gender === "F" && accountUser.rels.mother) {
                throw new Error(`${accountUser.data["first name"]} already has a mother in the tree`);
            }

            // Add user as a child to relative
            if (!relative.rels.children.includes(accountUserId)) {
                relative.rels.children.push(accountUserId);
            }

            // Set relative as father/mother of account user based on gender
            if (relative.data.gender === "M") {
                accountUser.rels.father = relativeId;
                if (!accountUser.rels.mother) {
                    accountUser.rels.mother = relative.rels.spouses[0] || null; // set mother as first spouse if exists
                }
            } else if (relative.data.gender === "F") {
                accountUser.rels.mother = relativeId;
                if (!accountUser.rels.father) {
                    accountUser.rels.father = relative.rels.spouses[0] || null; // set father as first spouse if exists
                }
            }
            break;

        case "child": // Relative is a child of the account user
            // Check if child already has a parent of this gender
            if (accountUser.data.gender === "M" && relative.rels.father) {
                throw new Error(`${relative.data["first name"]} already has a father in the tree`);
            }
            if (accountUser.data.gender === "F" && relative.rels.mother) {
                throw new Error(`${relative.data["first name"]} already has a mother in the tree`);
            }

            // Add relative as child to user
            if (!accountUser.rels.children.includes(relativeId)) {
                accountUser.rels.children.push(relativeId);
            }

            // Set user as father/mother of relative based on gender
            if (accountUser.data.gender === "M") {
                relative.rels.father = accountUserId;
            } else if (accountUser.data.gender === "F") {
                relative.rels.mother = accountUserId;
            }
            break;

        case "sibling": // Relative is a sibling of the account user
            // Check if relative has at least one parent
            if (!relative.rels.father && !relative.rels.mother) {
                throw new Error(`Cannot add as sibling: Selected member has no parents`);
            }

            if (relative.rels.father) { // Add the relative's father as the account user's father
                const fatherID = relative.rels.father;
                accountUser.rels.father = fatherID;
                const father = treeIndex[fatherID];
                if (!father.rels.children.includes(accountUserId)) {
                    father.rels.children.push(accountUserId);
                }
            }
            if (relative.rels.mother) { // Add the relative's mother as the account user's mother
                const motherID = relative.rels.mother;
                accountUser.rels.mother = motherID;
                const mother = treeIndex[motherID];
                if (!mother.rels.children.includes(accountUserId)) {
                    mother.rels.children.push(accountUserId);
                }
            }
            break;

        case "spouse": // Relative is a spouse of the account user
            // Add each other as spouses
            if (!accountUser.rels.spouses.includes(relativeId)) {
                accountUser.rels.spouses.push(relativeId);
            }
            if (!relative.rels.spouses.includes(accountUserId)) {
                relative.rels.spouses.push(accountUserId);
            }

            // Add relative's children to account user
            relative.rels.children.forEach(childId => {
                const child = treeIndex[childId];
                if (accountUser.data.gender === "M") {
                    child.rels.father = accountUserId;
                } else if (accountUser.data.gender === "F") {
                    child.rels.mother = accountUserId;
                }
                if (!accountUser.rels.children.includes(childId)) {
                    accountUser.rels.children.push(childId);
                }
            });
            break;

        default:
            throw new Error("Invalid relationship type");
    }

    return true;
}
