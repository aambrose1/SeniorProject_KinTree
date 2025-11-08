export const familyTreeService = {
    /**
     * 
     * @param {*} memberData 
     * @returns treeMemberId
     */
    async createFamilyMember(memberData) {
        const response = await fetch(`http://localhost:5000/api/family-members/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: memberData.firstName,
                lastName: memberData.lastName,
                birthdate: memberData.birthdate,
                email: memberData.email,
                location: memberData.location,
                phoneNumber: memberData.phoneNumber,
                userId: memberData.userId, // who added this member
                memberUserId: memberData.memberUserId, // the member's user account (if exists)
                gender: memberData.gender,
            }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to create family member');
        }
        return responseData; // returns memberId
    },
    /**
     * 
     * @param {*} memberId 
     * @param {*} memberData 
     * @param {*} userId 
     * @returns treeInfo Object
     */
    async initializeTreeInfo(memberId, memberData, userId) {
        const response = await fetch(`http://localhost:5000/api/tree-info/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                object: [{
                    "id": memberId,
                    "data": {
                        "first name": memberData.firstName,
                        "last name": memberData.lastName,
                        "gender": memberData.gender,
                    },
                    "rels": {
                        "children": [],
                        "spouses": [],
                    }
                }],
                userId: userId, // who is creating the tree
            }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to add member to tree');
        }
        return responseData;
    },

    async getFamilyMembersByUserId(userId) {
        const response = await fetch(`http://localhost:5000/api/family-members/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to fetch family members');
        }
        return responseData; // returns all family members of the user
    },

    async getRegisteredUsers() {
        const response = await fetch(`http://localhost:5000/api/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
        throw new Error('Failed to fetch registered users');
        }

        return response.json();
    }
};