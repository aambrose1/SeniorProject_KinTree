/**
 * Mock context value for CurrentUserContext used in tests
 */
export const defaultCurrentUserContext = {
    currentAccountID: '123',
    currentUserName: 'john@example.com',
    supabaseUser: { 
      id: 'auth-uid-123', 
      email: 'john@example.com',
      user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        birthdate: '1990-01-01',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        country: 'USA',
        phone_number: '228-555-1234',
        zipcode: '62701',
        gender: 'M',
      },
    },
    loading: false,
};