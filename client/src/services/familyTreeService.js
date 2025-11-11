export const familyTreeService = {
    /**
     * 
     * @param {*} memberData 
     * @returns treeMember object
     */
    async createFamilyMember(memberData) {
        console.log('Creating family member with data:', memberData);
        const response = await fetch(`http://localhost:5000/api/family-members/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "firstname": memberData.firstname,
                "lastname": memberData.lastname,
                "birthdate": memberData.birthdate,
                "deathdate": memberData.deathdate,
                "location": memberData.location,
                "phonenumber": memberData.phonenum,
                "userid": memberData.userid, // who added this member
                "memberuserid": memberData.memberuserid, // the member's user account (if exists)
                "gender": memberData.gender,
            }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.log('Failed to create family member:', responseData.error);
            throw new Error(responseData.error);
        }
        return responseData; // returns member object
    },
    /**
     * 
     * @param {*} memberId 
     * @param {*} memberData 
     * @param {*} userId 
     * @returns treeInfo Object
     */
    async initializeTreeInfo(memberId, memberData, userid) {
        console.log('Initializing tree info for memberId:', memberId, 'with data:', memberData, 'for userId:', userid);
        const response = await fetch(`http://localhost:5000/api/tree-info/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                object: [{
                    "id": memberId,
                    "data": {
                        "first name": memberData.firstname,
                        "last name": memberData.lastname,
                        "gender": memberData.gender,
                    },
                    "rels": {
                    }
                }],
                userid: userid, // who is creating the tree
            }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.error('Failed to add member to tree:', responseData.error);
            throw new Error(responseData.error);
        }
        return responseData;
    },
    /**
     * 
     * @param {int} userId 
     * @returns JSON Object of the user's family members
     */
    async getFamilyMembersByUserId(userId) {
        const response = await fetch(`http://localhost:5000/api/family-members/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.error('Failed to fetch family members:', responseData.error);
            throw new Error(responseData.error || 'Failed to fetch family members');
        }
        return responseData; // returns all family members of the user
    },
    /**
     * 
     * @param {*} userId 
     * @returns the users primary treeMember object
     */
    async getFamilyMemberByUserId(userId) {
        const response = await fetch(`http://localhost:5000/api/family-members/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.error('Failed to fetch family member:', responseData.error);
            throw new Error(responseData.error || 'Failed to fetch family member');
        }
        return responseData;
    },
    /**
     * 
     * @returns JSON Array of all registered users
     */
    async getRegisteredUsers() {
        const response = await fetch(`http://localhost:5000/api/auth/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.error('Failed to fetch registered users:', responseData.error);
            throw new Error(responseData.error || 'Failed to fetch registered users');
        }

        return responseData;
    },
    /**
     * 
     * @param {int} userId 
     * @returns Array of the user's treeInfo Object
     */
    async getFamilyTreeByUserId(userId) {
        const response = await fetch(`http://localhost:5000/api/tree-info/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })  
        let responseData = await response.json();
        if (!response.ok) {
            console.error('Error in Loading Tree Data:', responseData.error);
            throw new Error(responseData.error || 'Failed to load family tree data');
        }
        const parsedData = JSON.parse(responseData.object);
        console.log("Tree data: ", parsedData);

        return parsedData;
    }
};