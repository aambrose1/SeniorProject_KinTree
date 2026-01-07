import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateAccount from './CreateAccount';
import { handleRegister } from '../../utils/authHandlers';
import { familyTreeService } from '../../services/familyTreeService';

// Mock authHandlers
vi.mock('../../utils/authHandlers');

// Mock familyTreeService
vi.mock('../../services/familyTreeService', () => ({
  familyTreeService: {
    createFamilyMember: vi.fn(),
    initializeTreeInfo: vi.fn(),
  },
}));

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('CreateAccount', () => {

  const fillRequiredFields = async (user, data = {}) => {
    await user.type(screen.getByLabelText(/First Name/i), data.firstname ?? 'John');
    await user.type(screen.getByLabelText(/Last Name/i), data.lastname ?? 'Doe');
    await user.type(screen.getByLabelText(/Email/i), data.email ?? 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), data.password ?? 'Password123!');
    await user.type(screen.getByLabelText(/Birthdate/i), data.birthdate ?? '1990-01-01');
    await user.selectOptions(screen.getByLabelText(/Gender/i), data.gender ?? 'M');
    await user.type(screen.getByLabelText(/Country/i), data.country ?? 'USA');
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the create account form', () => {
      render(<CreateAccount />);
      
      expect(screen.getByRole('heading', { level: 1, name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<CreateAccount />);
      
      expect(screen.getByLabelText(/Birthdate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Zip Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<CreateAccount />);
      
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    it('renders login link', () => {
      render(<CreateAccount />);
      
      expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
      expect(screen.getByText(/Login here/i)).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('displays error for missing required firstname', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('First name is a required field.')).toBeInTheDocument();
      });
    });

    it('displays error for missing required lastname', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Last name is a required field.')).toBeInTheDocument();
      });
    });

    it('displays error for missing required email', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is a required field.')).toBeInTheDocument();
      });
    });

    it('displays error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const emailInput = screen.getByLabelText(/Email/i);
      await user.type(emailInput, 'invalidemail');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
      });
    });

    it('displays error for missing required password', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('displays error for invalid password format', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const passwordInput = screen.getByLabelText(/Password/i);
      await user.type(passwordInput, 'weak');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Must Contain 8 Characters/i)).toBeInTheDocument();
      });
    });

    it('displays error for missing required birthdate', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid date.')).toBeInTheDocument();
      });
    });

    it('displays error for missing required gender', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a valid option')).toBeInTheDocument();
      });
    });

    it('displays error for missing required country', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Country of residence is a required field.')).toBeInTheDocument();
      });
    });

    it('displays error for invalid phone number format', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const phoneInput = screen.getByLabelText(/Phone/i);
      await user.type(phoneInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid phone number format.')).toBeInTheDocument();
      });
    });

    it('displays error for invalid zip code format', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const zipcodeInput = screen.getByLabelText(/Zip Code/i);
      await user.type(zipcodeInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid zip code format.')).toBeInTheDocument();
      });
    });
  });

  describe('successful form submission', () => {

    

    it('submits minimal required fields and calls handleRegister with expected metadata', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        user: { id: 'auth-xyz' },
        data: { user: { id: 'auth-xyz' } }
      };
      handleRegister.mockResolvedValue(mockResponse);
      familyTreeService.createFamilyMember.mockResolvedValue({});
      familyTreeService.initializeTreeInfo.mockResolvedValue({});

      render(<CreateAccount />);

      await fillRequiredFields(user);

      await user.click(screen.getByRole('button', { name: /Create Account/i }));

      await waitFor(() => {
        expect(handleRegister).toHaveBeenCalledTimes(1);
      });
  });

  it('submits all fields and builds location correctly', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      user: { id: 'auth-full' },
      data: { user: { id: 'auth-full' } }
    };
    handleRegister.mockResolvedValue(mockResponse);
    familyTreeService.createFamilyMember.mockResolvedValue({});
    familyTreeService.initializeTreeInfo.mockResolvedValue({});

    render(<CreateAccount />);

    const formData = {
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      password: 'StrongPass1!',
      birthdate: '1985-12-24',
      gender: 'F',
      address: '456 Oak Ave',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      phonenum: '555-987-6543',
      zipcode: '98101',
    };

    await fillRequiredFields(user, formData);
    await user.type(screen.getByLabelText(/Address/i), formData.address);
    await user.type(screen.getByLabelText(/City/i), formData.city);
    await user.type(screen.getByLabelText(/State/i), formData.state);
    await user.type(screen.getByLabelText(/Phone/i), formData.phonenum);
    await user.type(screen.getByLabelText(/Zip Code/i), formData.zipcode);

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(handleRegister).toHaveBeenCalledTimes(1);
      expect(familyTreeService.createFamilyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          firstname: 'Alice',
          lastname: 'Smith',
          birthdate: expect.any(Date),
          location: 'Seattle, WA, USA',
          phonenumber: '555-987-6543',
          userid: 'auth-full',
          memberuserid: 'auth-full',
          gender: 'F',
        })
      );
    });
  });

  it('submits the form by pressing Enter in a field', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      user: { id: 'auth-enter' },
      data: { user: { id: 'auth-enter' } }
    };
    handleRegister.mockResolvedValue(mockResponse);
    familyTreeService.createFamilyMember.mockResolvedValue({});
    familyTreeService.initializeTreeInfo.mockResolvedValue({});

    render(<CreateAccount />);

    await fillRequiredFields(user);
    const countryInput = screen.getByLabelText(/Country/i);
    await user.type(countryInput, '{enter}');

    await waitFor(() => {
      expect(handleRegister).toHaveBeenCalledTimes(1);
    });
  });
  });

  describe('error handling', () => {


    it('displays error message when registration fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      handleRegister.mockRejectedValue(new Error(errorMessage));

      render(<CreateAccount />);
      
      await fillRequiredFields(user);
      
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('clears previous error messages on new submission', async () => {
      const user = userEvent.setup();
      handleRegister.mockRejectedValueOnce(new Error('First error'));

      render(<CreateAccount />);
      
      await fillRequiredFields(user);
      
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      handleRegister.mockResolvedValueOnce({ user: { id: '123' } });
      familyTreeService.createFamilyMember.mockResolvedValue({});
      familyTreeService.initializeTreeInfo.mockResolvedValue({});

      await user.click(screen.getByRole('button', { name: /Create Account/i }));
      
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('UI interactions', () => {
    it('changes button color on hover', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const button = screen.getByRole('button', { name: /Create Account/i });
      
      await user.hover(button);
      
      expect(button).toHaveStyle({ backgroundColor: '#2d4a33' });
    });

    it('resets button color on mouse leave', async () => {
      const user = userEvent.setup();
      render(<CreateAccount />);
      
      const button = screen.getByRole('button', { name: /Create Account/i });
      
      await user.hover(button);
      await user.unhover(button);
      
      expect(button).toHaveStyle({ backgroundColor: '#3a5a40' });
    });
  });

  describe('additional submission and error scenarios', () => {
  
    it('submits minimal required fields and calls handleRegister with expected metadata', async () => {
      const user = userEvent.setup();
      handleRegister.mockResolvedValue({ user: { id: 'auth-xyz' } });
      familyTreeService.createFamilyMember.mockResolvedValue({});
      familyTreeService.initializeTreeInfo.mockResolvedValue({});
  
      render(<CreateAccount />);
  
      await fillRequiredFields(user);
  
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
  
      await waitFor(() => {
        expect(handleRegister).toHaveBeenCalledTimes(1);
        expect(handleRegister).toHaveBeenCalledWith(
          'test@example.com',
          'Password123!',
          expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
            birthdate: expect.any(Date),
            country: 'USA',
            gender: 'M',
          })
        );
      });
  
      await waitFor(() => {
        expect(familyTreeService.createFamilyMember).toHaveBeenCalledTimes(1);
        expect(familyTreeService.createFamilyMember).toHaveBeenCalledWith(
          expect.objectContaining({
            firstname: 'John',
            lastname: 'Doe',
            birthdate: expect.any(Date),
            userid: 'auth-xyz',
            memberuserid: 'auth-xyz',
            gender: 'M',
          })
        );
        expect(familyTreeService.initializeTreeInfo).toHaveBeenCalledWith(
          'auth-xyz',
          expect.objectContaining({
            firstname: 'John',
            lastname: 'Doe',
            userid: 'auth-xyz',
            memberuserid: 'auth-xyz',
          }),
          'auth-xyz'
        );
      });
    });
  
    it('submits all fields and builds location correctly', async () => {
      const user = userEvent.setup();
      handleRegister.mockResolvedValue({ user: { id: 'auth-full' } });
      familyTreeService.createFamilyMember.mockResolvedValue({});
      familyTreeService.initializeTreeInfo.mockResolvedValue({});
  
      render(<CreateAccount />);
  
      const formData = {
        firstname: 'Alice',
        lastname: 'Smith',
        email: 'alice@example.com',
        password: 'StrongPass1!',
        birthdate: '1985-12-24',
        gender: 'F',
        address: '456 Oak Ave',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        phonenum: '555-987-6543',
        zipcode: '98101',
      };
  
      await fillRequiredFields(user, formData);
      await user.type(screen.getByLabelText(/Address/i), formData.address);
      await user.type(screen.getByLabelText(/City/i), formData.city);
      await user.type(screen.getByLabelText(/State/i), formData.state);
      await user.type(screen.getByLabelText(/Phone/i), formData.phonenum);
      await user.type(screen.getByLabelText(/Zip Code/i), formData.zipcode);
  
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
  
      await waitFor(() => {
        expect(familyTreeService.createFamilyMember).toHaveBeenCalledWith({
          firstname: 'Alice',
          lastname: 'Smith',
          birthdate: expect.any(Date),
          location: 'Seattle, WA, USA',
          phonenumber: '555-987-6543',
          userid: 'auth-full',
          memberuserid: 'auth-full',
          gender: 'F',
        });
      });
  
      await waitFor(() => {
        expect(familyTreeService.initializeTreeInfo).toHaveBeenCalledWith(
          'auth-full',
          expect.objectContaining({
            firstname: 'Alice',
            lastname: 'Smith',
            userid: 'auth-full',
            memberuserid: 'auth-full',
          }),
          'auth-full'
        );
      });
    });
  
    it('submits the form by pressing Enter in a field', async () => {
      const user = userEvent.setup();
      handleRegister.mockResolvedValue({ user: { id: 'auth-enter' } });
      familyTreeService.createFamilyMember.mockResolvedValue({});
      familyTreeService.initializeTreeInfo.mockResolvedValue({});
  
      render(<CreateAccount />);
  
      await fillRequiredFields(user);
      const countryInput = screen.getByLabelText(/Country/i);
      await user.type(countryInput, '{enter}');
  
      await waitFor(() => {
        expect(handleRegister).toHaveBeenCalledTimes(1);
      });
    });
  
    it('does not call family services when registration fails', async () => {
      const user = userEvent.setup();
      handleRegister.mockRejectedValue(new Error('Registration failed'));
  
      render(<CreateAccount />);
  
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
  
      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
        expect(familyTreeService.createFamilyMember).not.toHaveBeenCalled();
        expect(familyTreeService.initializeTreeInfo).not.toHaveBeenCalled();
      });
    });
  
    it('displays error when creating family member fails', async () => {
      const user = userEvent.setup();
      handleRegister.mockResolvedValue({ user: { id: 'auth-cfm' } });
      familyTreeService.createFamilyMember.mockRejectedValue(new Error('Create member failed'));
  
      render(<CreateAccount />);
  
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
  
      await waitFor(() => {
        expect(screen.getByText('Create member failed')).toBeInTheDocument();
        expect(familyTreeService.initializeTreeInfo).not.toHaveBeenCalled();
      });
    });
  
    it('displays error when initializing tree info fails', async () => {
      const user = userEvent.setup();
      handleRegister.mockResolvedValue({ user: { id: 'auth-init' } });
      familyTreeService.createFamilyMember.mockResolvedValue({});
      familyTreeService.initializeTreeInfo.mockRejectedValue(new Error('Init tree failed'));
  
      render(<CreateAccount />);
  
      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /Create Account/i }));
  
      await waitFor(() => {
        expect(screen.getByText('Init tree failed')).toBeInTheDocument();
      });
    });
  });
});