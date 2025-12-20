/**
 * Mock /server/ API response templates for testing
 * Copy and paste into tests as needed to change
 */

// Auth API Mocks
export const mockAuthResponses = {
  // GET /api/auth/user/:id - Get user by ID
  getUserById: (userId) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      id: userId,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      birthdate: '1990-01-01',
      gender: 'M',
      auth_uid: 'auth-uid-123'
    }),
  }),

  // GET /api/auth/user/:id - User not found
  getUserNotFound: () => ({
    ok: false,
    status: 404,
    json: () => Promise.resolve({
      error: 'User not found'
    }),
  }),

  // GET /api/auth/users - Get all registered users
  getAllUsers: () => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve([
      {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        auth_uid: 'auth-uid-1'
      },
      {
        id: '2',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane@example.com',
        auth_uid: 'auth-uid-2'
      }
    ]),
  }),

  // Server error
  serverError: () => ({
    ok: false,
    status: 500,
    json: () => Promise.resolve({
      error: 'Internal server error'
    }),
  }),
};

// Family Member API Mocks
export const mockFamilyMemberResponses = {
  // POST /api/family-members - Create family member
  createFamilyMember: (memberData) => ({
    ok: true,
    status: 201,
    json: () => Promise.resolve({
      id: 'member-123',
      firstname: memberData.firstname,
      lastname: memberData.lastname,
      birthdate: memberData.birthdate,
      deathdate: memberData.deathdate,
      location: memberData.location,
      phonenumber: memberData.phonenum,
      userid: memberData.userid,
      memberuserid: memberData.memberuserid,
      gender: memberData.gender,
    }),
  }),

  // GET /api/family-members/user/:userId - Get all family members for user
  getFamilyMembersByUserId: (userId) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve([
      {
        id: 'member-1',
        firstname: 'Alice',
        lastname: 'Doe',
        birthdate: '1960-05-15',
        gender: 'F',
        userid: userId,
        memberuserid: null
      },
      {
        id: 'member-2',
        firstname: 'Bob',
        lastname: 'Doe',
        birthdate: '1958-03-20',
        gender: 'M',
        userid: userId,
        memberuserid: null
      }
    ]),
  }),

  // GET /api/family-members/active/:userId - Get primary family member
  getFamilyMemberByUserId: (userId) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      id: 'member-primary',
      firstname: 'John',
      lastname: 'Doe',
      birthdate: '1990-01-01',
      gender: 'M',
      userid: userId,
      memberuserid: userId
    }),
  }),

  // GET /api/family-members/member/:id - Get family member by member ID
  getFamilyMemberByFamilyMemberId: (memberId) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      id: memberId,
      firstname: 'Grandma',
      lastname: 'Smith',
      birthdate: '1950-01-01',
      deathdate: null,
      gender: 'F',
      userid: '123',
      memberuserid: null
    }),
  }),

  // Empty family members array
  emptyFamilyMembers: () => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
  }),
};

// Tree Info API Mocks
export const mockTreeInfoResponses = {
  // POST /api/tree-info - Initialize tree info
  initializeTreeInfo: (memberId, memberData, userId) => ({
    ok: true,
    status: 201,
    json: () => Promise.resolve({
      id: 'tree-123',
      object: [{
        id: memberId,
        data: {
          "first name": memberData.firstname,
          "last name": memberData.lastname,
          "gender": memberData.gender,
        },
        rels: {}
      }],
      userid: userId,
    }),
  }),

  // GET /api/tree-info/:userId - Get family tree by user ID
  getFamilyTreeByUserId: (userId) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      object: [
        {
          id: '1',
          data: {
            "first name": "John",
            "last name": "Doe",
            "gender": "M",
          },
          rels: {
            spouses: ['2'],
            children: ['3', '4']
          }
        },
        {
          id: '2',
          data: {
            "first name": "Jane",
            "last name": "Doe",
            "gender": "F",
          },
          rels: {
            spouses: ['1'],
            children: ['3', '4']
          }
        }
      ]
    }),
  }),

  // Empty tree
  emptyTree: () => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      object: []
    }),
  }),

  // PUT /api/tree-info/:userId - Update tree info
  updateTreeInfo: (userId, updatedData) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      object: {
        object: updatedData
      }
    }),
  }),
};

// Relationship API Mocks
export const mockRelationshipResponses = {
  // GET /api/relationships/user/:userId - Get relationships for user
  getRelationshipsByUserId: (userId) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve([
      {
        id: 'rel-1',
        user_id: userId,
        related_user_id: '456',
        relationship_type: 'parent',
        },
      {
        id: 'rel-2',
        user_id: userId,
        related_user_id: '789',
        relationship_type: 'sibling',
        }
    ]),
  }),

  // POST /api/relationships - Create relationship
  createRelationship: (relationshipData) => ({
    ok: true,
    status: 201,
    json: () => Promise.resolve({
      id: 'rel-new',
      user_id: relationshipData.user_id,
      related_user_id: relationshipData.related_user_id,
      relationship_type: relationshipData.relationship_type,
    }),
  }),

  // Empty relationships
  emptyRelationships: () => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
  }),
};