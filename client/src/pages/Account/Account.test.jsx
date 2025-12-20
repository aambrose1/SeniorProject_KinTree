import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Account from './Account';
import { currentContext } from '../../CurrentUserProvider';
import { defaultCurrentUserContext } from '../../../mocks/currentUserMock';
import { familyTreeService } from '../../services/familyTreeService';

// Mock fetch globally from calls in Account.jsx
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the familyTreeService functions used in Account.jsx
vi.mock('../../services/familyTreeService', () => ({
  familyTreeService: {
    getFamilyMemberByFamilyMemberId: vi.fn(),
    getFamilyMembersByUserId: vi.fn(),
    getFamilyTreeByUserId: vi.fn(),
  },
}));

// Mock AddToTreePopup. Also, internal behavior not important here
vi.mock('../../components/AddToTree/AddToTree', () => ({
  default: ({ trigger }) => trigger,
}));

// Helper to render Account with user context and router
const renderAccount = (contextValue = defaultCurrentUserContext, id = '123') => {
  return render(
    <currentContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[`/account/${id}`]}>
        <Routes>
          <Route path="/account/:id" element={<Account />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </currentContext.Provider>
  );
};

describe('Account', () => {
  const setupOwnerMocks = () => {
    // Mock fetching user's own data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        id: '123',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        birthdate: '1990-01-01',
        gender: 'M',
        auth_uid: 'auth-uid-123'
      }),
    });
    
    familyTreeService.getFamilyMembersByUserId.mockResolvedValue([
      {
        id: 1,
        userid: 123,
        memberuserid: 123,
      }
    ]);

    familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
      { id: '123' }
    ]);

    // Mock relationships fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
  };

  const setupOtherUserMocks = () => {
    // Mock fetching another user's data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        id: '456',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane@example.com',
        birthdate: '1992-02-02',
        gender: 'F',
        auth_uid: 'auth-uid-456'
      }),
    });

    

    familyTreeService.getFamilyMembersByUserId.mockResolvedValue([
      {
        id: 1,
        userid: 123,
        memberuserid: 123,
      },
      {
        id: 2,
        userid: 123,
        memberuserid: 456,
      }
    ]);

    familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
      { id: '123' },
      { id: '456' }
    ]);

    // Mock relationships fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([
        {
          person1_id: 1,
          person2_id: 2,
          relationshiptype: 'sibling'
        }
      ]),
    });
  };

  const setupMemberMocks = () => {
    // Mock user not found (404)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'User not found' }),
    });

    familyTreeService.getFamilyMemberByFamilyMemberId.mockResolvedValue({
      id: 3,
      firstname: 'Grandma',
      lastname: 'Smith',
      birthdate: '1950-01-01',
      gender: 'F',
      userid: '123',
      memberuserid: null
    });

    familyTreeService.getFamilyMembersByUserId.mockResolvedValue([
      {
        id: 1,
        userid: 123,
        memberuserid: 123,
      },
      {
        id: 2,
        userid: 123,
        memberuserid: 456,
      },
      {
        id: 3,
        userid: 123,
        memberuserid: null,
      }
    ]);

    familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
      { id: '123' },
      { id: '456' },
      { id: '3' }
    ]);

    // Mock relationships fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([
        {
          person1_id: 1,
          person2_id: 3,
          relationshiptype: 'parent'
        }
      ]),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('authentication', () => {
    it('redirects to login when user is not authenticated', async () => {
      const unauthenticatedContext = {
        currentAccountID: '',
        supabaseUser: null,
        loading: false,
      };

      await act(async () => {
        renderAccount(unauthenticatedContext);
      });
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('does not redirect when loading', async () => {
      const loadingContext = {
        currentAccountID: '',
        supabaseUser: null,
        loading: true,
      };

      await act(async () => {
        renderAccount(loadingContext);
      });

      await expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('viewing own Account page', () => {

    it('displays user\'s name after loading', async () => {
      setupOwnerMocks();

      await act(async () => {
        await renderAccount(defaultCurrentUserContext);
      });

      await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    });

    it('displays \'you\' as relationship type when viewing own account', async () => {
      setupOwnerMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext);
      });

      await waitFor(() => {
        expect(screen.getByText('You')).toBeInTheDocument();
      });
    });

    it('displays Profile Information section', async () => {
      setupOwnerMocks();

      act(() => {
        renderAccount(defaultCurrentUserContext);
      });

      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('displays birthdate in Basic Information section', async () => {
      setupOwnerMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext);
      });
      await waitFor(async () => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument();
        expect(await screen.findByText(new Date('1990-01-01').toLocaleDateString())).toBeInTheDocument();
      });
    });

    it('doesn\'t display Add To Tree button when viewing own account', async () => {
      setupOwnerMocks();
      await act(async () => {
        renderAccount(defaultCurrentUserContext);
      });

      await waitFor(() => {
        expect(screen.queryByText('Add To Tree')).not.toBeInTheDocument();
      });
    });
  });

  describe('viewing another user account', () => {
    it('displays other user\'s name after loading', async () => {
      setupOtherUserMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext, '456');
      });

      await waitFor(async () => {
        expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
      });
    });
    it('displays Add To Tree button when viewing another account', async () => {
      setupOtherUserMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext, '456');
      });

      await waitFor(() => {
        expect(screen.getByText('Add To Tree')).toBeInTheDocument();
      });
    });

    it('displays relationship type when viewing another account', async () => {
      setupOtherUserMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext, '456');
      });

      await waitFor(async () => {
        expect(await screen.findByText('Sibling')).toBeInTheDocument();
      });
    });

    it('displays Remove from Tree button when viewing account', async () => {
      setupOtherUserMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext, '456');
      });

      await waitFor(() => {
        expect(screen.getByText('Remove from Tree')).toBeInTheDocument();
      });
    });
  });

  describe('family member (non-user) account', () => {
    it('displays family member data when user is not found in user db', async () => {
      setupMemberMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext, '3');
      });

      await waitFor(async () => {
        expect(await screen.findByText('Grandma Smith')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('displays error message when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });
      familyTreeService.getFamilyMembersByUserId.mockResolvedValue([]);
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([]);
      mockFetch.mockResolvedValue([]);

      await act(async () => {
        renderAccount(defaultCurrentUserContext);
      });

      await waitFor(async () => {
        expect(await screen.findByText('Unknown User')).toBeInTheDocument();
      });

    });
  });

  describe('profile information display', () => {
    it('displays other user\'s email in profile information', async () => {
      setupOtherUserMocks();

      await act(async () => {
        renderAccount(defaultCurrentUserContext, '456');
      });

      await waitFor(async () => {
        expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays "Not provided" when email is missing', async () => {
      setupMemberMocks();

      await act(async () => { 
        renderAccount(defaultCurrentUserContext, '3'); 
      });

      await waitFor(() => {
        expect(screen.getByText('Not provided')).toBeInTheDocument();
      });
    });

    it('displays Basic Information section for other user', async () => {
      setupOtherUserMocks();

      await act(async () => { 
        renderAccount(defaultCurrentUserContext, '456'); 
      });

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument();
      });
    });

    it('displays Address Information section for other user', async () => {
      setupOtherUserMocks();

      await act(async () => { 
        renderAccount(defaultCurrentUserContext, '456'); 
      });

      await waitFor(() => {
        expect(screen.getByText('Address Information')).toBeInTheDocument();
      });
    });
  });
});