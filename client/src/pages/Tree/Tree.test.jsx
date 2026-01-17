import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Tree from './Tree';
import { currentContext } from '../../CurrentUserProvider';
import { defaultCurrentUserContext } from '../../../mocks/currentUserMock';
import { familyTreeService } from '../../services/familyTreeService';
import * as f3 from 'family-chart';

// Mock the family-chart library
vi.mock('family-chart', () => ({
  createChart: vi.fn(() => ({
    setTransitionTime: vi.fn().mockReturnThis(),
    setCardXSpacing: vi.fn().mockReturnThis(),
    setCardYSpacing: vi.fn().mockReturnThis(),
    setShowSiblingsOfMain: vi.fn().mockReturnThis(),
    setSingleParentEmptyCard: vi.fn().mockReturnThis(),
    setOrientationVertical: vi.fn().mockReturnThis(),
    setCardHtml: vi.fn().mockReturnThis(),
    setCardDisplay: vi.fn().mockReturnThis(),
    setCardDim: vi.fn().mockReturnThis(),
    setMiniTree: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setOnHoverPathToMain: vi.fn().mockReturnThis(),
    setOnCardClick: vi.fn().mockReturnThis(),
    updateTree: vi.fn().mockReturnThis(),
  })),
}));

// Mock the familyTreeService
vi.mock('../../services/familyTreeService', () => ({
  familyTreeService: {
    getFamilyTreeByUserId: vi.fn(),
  },
}));

// Mock AddFamilyMemberPopup component
vi.mock('../../components/AddFamilyMember/AddFamilyMember', () => ({
  default: ({ trigger }) => <div data-testid="add-family-member-popup">{trigger}</div>,
}));

// Mock the PlusSign SVG
vi.mock('../../assets/plus-sign.svg', () => ({
  ReactComponent: () => <svg data-testid="plus-sign-icon" />,
}));

// Helper to render Tree with context and router
const renderTree = (contextValue = defaultCurrentUserContext, initialRoute = '/tree') => {
  return render(
    <currentContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/tree" element={<Tree />} />
          <Route path="/tree/*" element={<Tree />} />
          <Route path="/account/:id" element={<div>Account Page</div>} />
        </Routes>
      </MemoryRouter>
    </currentContext.Provider>
  );
};

describe('Tree Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Reset document body styles
    document.body.style.overflow = '';
    document.body.style.width = '';
  });

  afterEach(() => {
    // Clean up
    const chart = document.querySelector('#FamilyChart');
    if (chart) chart.innerHTML = '';
  });

  describe('Page Layout and Structure', () => {
    it('should render the Tree page with NavBar', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree();

      await waitFor(() => {
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
      });
    });

    it('should render the page title "Your Tree"', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your tree/i , level:1})).toBeInTheDocument();
      });
    });

    it('should display the family name based on user metadata', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /the doe family/i , level:2 })).toBeInTheDocument();
      });
    });

    it('should render the AddFamilyMemberPopup button', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree();

      await waitFor(() => {
        expect(screen.getByTestId('add-family-member-popup')).toBeInTheDocument();
        expect(screen.getByTestId('plus-sign-icon')).toBeInTheDocument();
      });
    });

    it('should set document body overflow to hidden', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree();

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.style.width).toBe('100%');
      });
    });
  });

  describe('FamilyTree Component - Data Fetching', () => {
    it('should fetch family tree data on mount', async () => {
      const mockTreeData = [
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } },
        { id: '2', data: { 'first name': 'Jane', 'last name': 'Doe' } }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);

      renderTree();

      await waitFor(() => {
        expect(familyTreeService.getFamilyTreeByUserId).toHaveBeenCalledWith('123');
      });
    });

    it('should create a family chart with fetched data', async () => {
      const mockTreeData = [
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);

      renderTree();

      await waitFor(() => {
        expect(f3.createChart).toHaveBeenCalledWith('#FamilyChart', mockTreeData);
      });
    });

    it('should configure the family chart with correct settings', async () => {
      const mockTreeData = [
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);
      
      const mockChartMethods = {
        setTransitionTime: vi.fn().mockReturnThis(),
        setCardXSpacing: vi.fn().mockReturnThis(),
        setCardYSpacing: vi.fn().mockReturnThis(),
        setShowSiblingsOfMain: vi.fn().mockReturnThis(),
        setSingleParentEmptyCard: vi.fn().mockReturnThis(),
        setOrientationVertical: vi.fn().mockReturnThis(),
        setCardHtml: vi.fn().mockReturnThis(),
        setCardDisplay: vi.fn().mockReturnThis(),
        setCardDim: vi.fn().mockReturnThis(),
        setMiniTree: vi.fn().mockReturnThis(),
        setStyle: vi.fn().mockReturnThis(),
        setOnHoverPathToMain: vi.fn().mockReturnThis(),
        setOnCardClick: vi.fn().mockReturnThis(),
        updateTree: vi.fn().mockReturnThis(),
      };
      
      f3.createChart.mockReturnValue(mockChartMethods);

      renderTree();

      await waitFor(() => {
        expect(mockChartMethods.setTransitionTime).toHaveBeenCalledWith(1000);
        expect(mockChartMethods.setCardXSpacing).toHaveBeenCalledWith(250);
        expect(mockChartMethods.setCardYSpacing).toHaveBeenCalledWith(150);
        expect(mockChartMethods.setShowSiblingsOfMain).toHaveBeenCalledWith(true);
        expect(mockChartMethods.setSingleParentEmptyCard).toHaveBeenCalledWith(false);
        expect(mockChartMethods.setOrientationVertical).toHaveBeenCalled();
        expect(mockChartMethods.updateTree).toHaveBeenCalledWith({ initial: true });
      });
    });

    it('should pass all members from treeData array to createChart', async () => {
      const mockTreeData = [
        { id: '1', data: { id: '101', 'first name': 'John', 'last name': 'Doe' } },
        { id: '2', data: { id: '102', 'first name': 'Jane', 'last name': 'Doe' } },
        { id: '3', data: { id: '103', 'first name': 'Jack', 'last name': 'Doe' } }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);

      renderTree();

      await waitFor(() => {
        expect(f3.createChart).toHaveBeenCalledWith('#FamilyChart', mockTreeData);
        expect(f3.createChart.mock.calls[0][1]).toHaveLength(3);
        expect(f3.createChart.mock.calls[0][1]).toEqual(mockTreeData);
      });
    });

    it('should include all member data fields when creating chart', async () => {
      const mockTreeData = [
        { 
          id: '1', 
          data: { 
            id: '101', 
            'first name': 'John', 
            'last name': 'Doe',
            gender: 'M',
            birthdate: '1990-01-01'
          } 
        },
        { 
          id: '2', 
          data: { 
            id: '102', 
            'first name': 'Jane', 
            'last name': 'Smith',
            gender: 'F',
            birthdate: '1992-05-15'
          } 
        }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);

      renderTree();

      await waitFor(() => {
        const chartCallData = f3.createChart.mock.calls[0][1];
        expect(chartCallData).toHaveLength(2);
        expect(chartCallData[0].data).toEqual(mockTreeData[0].data);
        expect(chartCallData[1].data).toEqual(mockTreeData[1].data);
      });
    });

    it('should handle large family trees with many members', async () => {
      const mockTreeData = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        data: {
          id: `${100 + i}`,
          'first name': `Member${i}`,
          'last name': 'Family'
        }
      }));
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);

      renderTree();

      await waitFor(() => {
        expect(f3.createChart).toHaveBeenCalledWith('#FamilyChart', mockTreeData);
        expect(f3.createChart.mock.calls[0][1]).toHaveLength(20);
      });
    });

    it('should preserve member order from treeData array', async () => {
      const mockTreeData = [
        { id: '3', data: { id: '103', 'first name': 'Charlie', 'last name': 'Doe' } },
        { id: '1', data: { id: '101', 'first name': 'Alice', 'last name': 'Doe' } },
        { id: '2', data: { id: '102', 'first name': 'Bob', 'last name': 'Doe' } }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);

      renderTree();

      await waitFor(() => {
        const chartCallData = f3.createChart.mock.calls[0][1];
        expect(chartCallData[0].data['first name']).toBe('Charlie');
        expect(chartCallData[1].data['first name']).toBe('Alice');
        expect(chartCallData[2].data['first name']).toBe('Bob');
      });
    });
  });

  describe('FamilyTree Component - Error Handling', () => {
    it('should display error message when no data is available', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([]);

      renderTree();

      await waitFor(() => {
        expect(screen.getByText(/no family tree data available to display/i)).toBeInTheDocument();
      });
    });

    it('should display error message when data is null', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(null);

      renderTree();

      await waitFor(() => {
        expect(screen.getByText(/no family tree data available to display/i)).toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      familyTreeService.getFamilyTreeByUserId.mockRejectedValueOnce(new Error('Network error'));
      familyTreeService.getFamilyTreeByUserId().catch(() => {}); // to avoid unhandled rejection
      renderTree();

      await waitFor(() => {
        expect(() => familyTreeService.getFamilyTreeByUserId.rejects.toThrow('Network error'));
        expect(() => familyTreeService.getFamilyTreeByUserId.toThrowError(/error/i));
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

      consoleErrorSpy.mockRestore();
    });

    it('should handle chart creation errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);
      
      f3.createChart.mockImplementation(() => {
        throw new Error('Chart creation failed');
      });

      renderTree();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error creating family tree chart'),
          expect.any(Error)
        );
        expect(screen.getByText(/failed to create family tree chart/i)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('FamilyTree Component - Card Click Behavior', () => {
    it('should navigate to account page when card is clicked', async () => {
      const mockTreeData = [
        { id: '1', data: { id: '123', 'first name': 'John', 'last name': 'Doe' } }
      ];
      
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue(mockTreeData);
      
      let capturedOnClick = null;
      const mockChartMethods = {
        setTransitionTime: vi.fn().mockReturnThis(),
        setCardXSpacing: vi.fn().mockReturnThis(),
        setCardYSpacing: vi.fn().mockReturnThis(),
        setShowSiblingsOfMain: vi.fn().mockReturnThis(),
        setSingleParentEmptyCard: vi.fn().mockReturnThis(),
        setOrientationVertical: vi.fn().mockReturnThis(),
        setCardHtml: vi.fn().mockReturnThis(),
        setCardDisplay: vi.fn().mockReturnThis(),
        setCardDim: vi.fn().mockReturnThis(),
        setMiniTree: vi.fn().mockReturnThis(),
        setStyle: vi.fn().mockReturnThis(),
        setOnHoverPathToMain: vi.fn().mockReturnThis(),
        setOnCardClick: vi.fn((fn) => {
          capturedOnClick = fn;
          return mockChartMethods;
        }),
        updateTree: vi.fn().mockReturnThis(),
      };
      
      f3.createChart.mockReturnValue(mockChartMethods);

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };

      renderTree();

      await waitFor(() => {
        expect(mockChartMethods.setOnCardClick).toHaveBeenCalled();
      });

      // Simulate card click
      if (capturedOnClick) {
        capturedOnClick(null, { data: { id: '456' } });
        expect(window.location.href).toBe('/account/456');
      }
    });
  });

  describe('Routing Behavior', () => {
    it('should render FamilyTree when on /tree route', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree(defaultCurrentUserContext, '/tree');

      await waitFor(() => {
        expect(screen.getByText(/your tree/i)).toBeInTheDocument();
        expect(screen.getByText(/the doe family/i)).toBeInTheDocument();
      });
    });

    it('should render Outlet when on nested route', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      render(
        <currentContext.Provider value={defaultCurrentUserContext}>
          <MemoryRouter initialEntries={['/tree/settings']}>
            <Routes>
              <Route path="/tree" element={<Tree />}>
                <Route path="settings" element={<div>Settings Page</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </currentContext.Provider>
      );

      await waitFor(() => {
        expect(screen.queryByText(/your tree/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Integration with Context', () => {
    it('should use currentAccountID from context', async () => {
      const customContext = {
        ...defaultCurrentUserContext,
        currentAccountID: '456',
      };

      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree(customContext);

      await waitFor(() => {
        expect(familyTreeService.getFamilyTreeByUserId).toHaveBeenCalledWith('456');
      });
    });

    it('should use supabaseUser metadata for family name', async () => {
      const customContext = {
        ...defaultCurrentUserContext,
        supabaseUser: {
          ...defaultCurrentUserContext.supabaseUser,
          user_metadata: {
            ...defaultCurrentUserContext.supabaseUser.user_metadata,
            last_name: 'Smith',
          },
        },
      };

      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree(customContext);

      await waitFor(() => {
        expect(screen.getByText(/the smith family/i)).toBeInTheDocument();
      });
    });

    it('should pass currentAccountID to AddFamilyMemberPopup', async () => {
      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      const { container } = renderTree();

      await waitFor(() => {
        expect(screen.getByTestId('add-family-member-popup')).toBeInTheDocument();
      });
    });
  });

  describe('Chart Cleanup', () => {
    it('should clean up existing chart before creating new one', async () => {
      // Create a mock existing chart
      const existingChart = document.createElement('div');
      existingChart.id = 'FamilyChart';
      existingChart.innerHTML = '<div>Old Chart</div>';
      document.body.appendChild(existingChart);

      familyTreeService.getFamilyTreeByUserId.mockResolvedValue([
        { id: '1', data: { 'first name': 'John', 'last name': 'Doe' } }
      ]);

      renderTree();

      await waitFor(() => {
        const chart = document.querySelector('#FamilyChart');
        expect(chart).toBeInTheDocument();
      });

      // Cleanup
      document.body.removeChild(existingChart);
    });
  });
});
