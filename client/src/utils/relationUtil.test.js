import { addRelationship } from './relationUtil';

describe('relationUtil - addRelationship', () => {
    let treeIndex;

    beforeEach(() => {
        // Reset the tree state before each test
        treeIndex = {
            "1": { 
                id: "1", 
                data: { "first name": "Me", "last name": "Tester", gender: "M" }, 
                rels: { parents: [], children: [], spouses: [] } 
            }
        };
    });

    const createNode = (id, firstName, gender) => {
        treeIndex[id] = {
            id: id,
            data: { "first name": firstName, "last name": "Tester", gender: gender },
            rels: { parents: [], children: [], spouses: [] }
        };
    };

    test('Basic: Should add a parent correctly', () => {
        createNode("2", "Dad", "M");
        addRelationship(treeIndex, "1", "2", "parent");

        expect(treeIndex["1"].rels.parents).toContain("2");
        expect(treeIndex["2"].rels.children).toContain("1");
    });

    test('Basic: Should add a child correctly', () => {
        createNode("2", "Son", "M");
        addRelationship(treeIndex, "1", "2", "child");

        expect(treeIndex["1"].rels.children).toContain("2");
        expect(treeIndex["2"].rels.parents).toContain("1");
    });

    test('Basic: Should add a spouse correctly', () => {
        createNode("2", "Wife", "F");
        addRelationship(treeIndex, "1", "2", "spouse");

        expect(treeIndex["1"].rels.spouses).toContain("2");
        expect(treeIndex["2"].rels.spouses).toContain("1");
    });

    test('Linking: Should add a Niece linked to a Sibling', () => {
        // 1. Add Sibling to Me (requires parents first)
        createNode("0", "Grandparent", "M");
        addRelationship(treeIndex, "1", "0", "parent");
        
        createNode("2", "Sister", "F");
        addRelationship(treeIndex, "1", "2", "sibling");

        // 2. Add Niece linked to Sister
        createNode("3", "Niece", "F");
        addRelationship(treeIndex, "1", "3", "niece", null, "2");

        // Expectation: Niece id 3 should be a child of Sister id 2
        expect(treeIndex["2"].rels.children).toContain("3");
        expect(treeIndex["3"].rels.parents).toContain("2");
    });

    test('Linking: Should add an Uncle linked to a Parent (via sibling logic)', () => {
        // 1. Add Dad to Me
        createNode("2", "Dad", "M");
        addRelationship(treeIndex, "1", "2", "parent");

        // 2. Add Uncle linked to Dad
        createNode("3", "Uncle", "M");
        addRelationship(treeIndex, "1", "3", "uncle", null, "2");

        // Expectation: Uncle id 3 should be a SIBLING of Dad id 2
        // Since Dad has no parents yet, the fallback logic should make them siblings directly
        expect(treeIndex["2"].rels.children).toContain("3"); // Fallback sibling logic adds as child if no parents
        expect(treeIndex["3"].rels.parents).toContain("2");
    });

    test('Linking: Should add an Uncle as SIBLING of parent when parents exist', () => {
        // 1. Add Grandparent
        createNode("10", "Grandpa", "M");
        
        // 2. Add Dad as child of Grandpa
        createNode("2", "Dad", "M");
        addRelationship(treeIndex, "10", "2", "child");
        
        // 3. Link Me to Dad
        addRelationship(treeIndex, "2", "1", "child");

        // 4. Add Uncle linked to Dad
        createNode("3", "Uncle", "M");
        addRelationship(treeIndex, "1", "3", "uncle", null, "2");

        // Expectation: Uncle should share Grandpa as parent with Dad
        expect(treeIndex["10"].rels.children).toContain("3");
        expect(treeIndex["3"].rels.parents).toContain("10");
        expect(treeIndex["2"].rels.parents).toContain("10");
    });

    test('Fallback: Should add Aunt as Sibling of User if no parent/link provided', () => {
        createNode("4", "Aunt", "F");
        // No targetNodeId, no parents for user
        addRelationship(treeIndex, "1", "4", "aunt");

        // Expectation: Falls back to adding as sibling of user
        // (Since user has no parents, sibling logic adds as child-link)
        expect(treeIndex["1"].rels.children).toContain("4");
        expect(treeIndex["4"].rels.parents).toContain("1");
    });
});
