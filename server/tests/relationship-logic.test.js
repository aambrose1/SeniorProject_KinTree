
// --- MOCK RELATIONSHIP ENGINE (Matching relationUtil.js exactly) ---

function mapToTreeRelationship(relationship) {
    const mapping = {
        'parent': 'parent', 'mother': 'parent', 'father': 'parent',
        'child': 'child', 'daughter': 'child', 'son': 'child',
        'spouse': 'spouse', 'wife': 'spouse', 'husband': 'spouse',
        'sibling': 'sibling', 'sister': 'sibling', 'brother': 'sibling',
        'grandparent': 'grandparent', 'grandmother': 'grandparent', 'grandfather': 'grandparent',
        'grandchild': 'child', 'granddaughter': 'child', 'grandson': 'child',
        'aunt': 'aunt_uncle', 'uncle': 'aunt_uncle',
        'niece': 'niece_nephew', 'nephew': 'niece_nephew', 'cousin': 'cousin',
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
    // Simple logic: we'll assume the 0th is maternal and 1st is paternal for this test simulation
    if (side === 'maternal') return parents[0] || null;
    if (side === 'paternal') return parents[1] || parents[0] || null;
    return parents[0] || null;
}

function createGhostNode(treeIndex, label, gender = "Unknown") {
    const ghostId = `ghost_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    treeIndex[ghostId] = {
        id: ghostId,
        data: { "first name": label, "last name": "(Ghost)", "gender": gender, "isGhost": true },
        rels: { parents: [], children: [], spouses: [] }
    };
    return ghostId;
}

function isAncestor(treeIndex, potentialAncestorId, nodeId, visited = new Set()) {
    if (potentialAncestorId === nodeId) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    const node = treeIndex[nodeId];
    if (!node || !node.rels?.parents) return false;
    return node.rels.parents.some(parentId => isAncestor(treeIndex, potentialAncestorId, parentId, visited));
}

const STRATEGIES = {
    parent: (treeIndex, subjectId, relativeId) => {
        const subject = treeIndex[subjectId];
        const relative = treeIndex[relativeId];
        if (isAncestor(treeIndex, subjectId, relativeId)) throw new Error(`Circular`);
        if (!subject.rels.parents.includes(relativeId)) subject.rels.parents.push(relativeId);
        if (!relative.rels.children.includes(subjectId)) relative.rels.children.push(subjectId);
        return { success: true, summary: `Linked ${relative.data["first name"]} as parent` };
    },
    sibling: (treeIndex, subjectId, relativeId) => {
        const subject = treeIndex[subjectId];
        const relative = treeIndex[relativeId];
        if (subject.rels.parents.length > 0) {
            subject.rels.parents.forEach(parentId => {
                const parent = treeIndex[parentId];
                if (!relative.rels.parents.includes(parentId)) relative.rels.parents.push(parentId);
                if (parent && !parent.rels.children.includes(relativeId)) parent.rels.children.push(relativeId);
            });
            return { success: true, summary: `Linked ${relative.data["first name"]} as sibling` };
        } else {
            const ghostId = createGhostNode(treeIndex, `Parent of ${subject.data["first name"]}`);
            subject.rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(subjectId);
            relative.rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(relativeId);
            return { success: true, summary: `Linked ${relative.data["first name"]} as sibling via GHOST` };
        }
    },
    grandparent: (treeIndex, subjectId, relativeId, side) => {
        const subject = treeIndex[subjectId];
        const targetParentId = getPreferredParentId(subject, side);
        if (!targetParentId) {
            const ghostId = createGhostNode(treeIndex, `${side} Parent`);
            subject.rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(subjectId);
            return STRATEGIES.parent(treeIndex, ghostId, relativeId);
        }
        return STRATEGIES.parent(treeIndex, targetParentId, relativeId);
    },
    aunt_uncle: (treeIndex, subjectId, relativeId, side, targetNodeId) => {
        const bridgeId = targetNodeId || getPreferredParentId(treeIndex[subjectId], side);
        if (!bridgeId) {
            const ghostId = createGhostNode(treeIndex, `${side} Parent`);
            treeIndex[subjectId].rels.parents.push(ghostId);
            treeIndex[ghostId].rels.children.push(subjectId);
            return STRATEGIES.sibling(treeIndex, ghostId, relativeId);
        }
        return STRATEGIES.sibling(treeIndex, bridgeId, relativeId);
    }
};

function addRelationship(treeIndex, accountUserId, relativeId, relationship, side = null, targetNodeId = null) {
    const treeRelationship = mapToTreeRelationship(relationship);
    const strategy = STRATEGIES[treeRelationship];
    ensureAllRelationshipLists(treeIndex[accountUserId]);
    ensureAllRelationshipLists(treeIndex[relativeId]);
    return strategy(treeIndex, accountUserId, relativeId, side, targetNodeId);
}

// --- TEST SCENARIO ---

const treeIndex = {
    "123": { id: "123", data: { "first name": "Self" }, rels: { parents: [], children: [], spouses: [] } }
};

function logState(label) {
    console.log(`\n--- ${label} ---`);
    Object.values(treeIndex).forEach(node => {
        console.log(`${node.data["first name"]} (${node.id}) -> Parents: [${node.rels.parents}], Children: [${node.rels.children}]`);
    });
}

// 1. Add Mother
treeIndex["1"] = { id: "1", data: { "first name": "Mother" }, rels: { parents: [], children: [], spouses: [] } };
addRelationship(treeIndex, "123", "1", "mother", "maternal");
logState("Step 1: Added Mother");

// 2. Add Father
treeIndex["2"] = { id: "2", data: { "first name": "Father" }, rels: { parents: [], children: [], spouses: [] } };
addRelationship(treeIndex, "123", "2", "father", "paternal");
logState("Step 2: Added Father");

// 3. Add Paternal Grandpa
treeIndex["3"] = { id: "3", data: { "first name": "Paternal Grandpa" }, rels: { parents: [], children: [], spouses: [] } };
addRelationship(treeIndex, "123", "3", "grandfather", "paternal");
logState("Step 3: Added Paternal Grandpa");

// 4. Add Maternal Aunt
treeIndex["4"] = { id: "4", data: { "first name": "Maternal Aunt" }, rels: { parents: [], children: [], spouses: [] } };
addRelationship(treeIndex, "123", "4", "aunt", "maternal");
logState("Step 4: Added Maternal Aunt");

// --- FINAL VERIFICATION ---
console.log("\n--- Final Verification ---");
const fatherNode = treeIndex["2"];
const grandpaNode = treeIndex["3"];
const motherNode = treeIndex["1"];
const auntNode = treeIndex["4"];

if (fatherNode.rels.parents.includes("3") && grandpaNode.rels.children.includes("2")) {
    console.log("✅ Paternal Grandpa successfully linked to Father.");
} else {
    console.error("❌ Grandpa Link Failed!");
}

if (motherNode.rels.parents.length > 0 && auntNode.rels.parents.length > 0 && 
    motherNode.rels.parents[0] === auntNode.rels.parents[0]) {
    console.log("✅ Maternal Aunt successfully linked as sibling of Mother via Ghost parent.");
} else {
    console.error("❌ Aunt Link Failed!");
}
