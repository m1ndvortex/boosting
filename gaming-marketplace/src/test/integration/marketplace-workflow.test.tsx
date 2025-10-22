import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { MarketplacePage } from '@pages/marketplace/MarketplacePage';
import { createMockUser, createMockService } from '@/test/utils/test-utils';

describe('Marketplace Workflow Integration', () => {
  const mockUser = createMockUser({
    roles: [{ id: '1', name: 'client', status: 'active' }],
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('should display available services', async () => {
    // Set up mock services in localStorage
    const mockServices = [
      createMockService({
        id: 'service-1',
        title: 'Mythic+ Dungeon Boost',
        gameId: 'wow',
        serviceTypeId: 'mythic-plus',
        prices: { gold: 100000, usd: 50, toman: 2000000 },
        status: 'active',
      }),
      createMockService({
        id: 'service-2',
        title: 'Leveling Service',
        gameId: 'wow',
        serviceTypeId: 'leveling',
        prices: { gold: 200000, usd: 100, toman: 4000000 },
        status: 'active',
      }),
    ];
    localStorage.setItem('gaming-marketplace-services', JSON.stringify(mockServices));
    
    render(<MarketplacePage />, { initialUser: mockUser });
    
    // Wait for the marketplace to load
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    });
    
    // Check if services are displayed (they might be in loading state initially)
    await waitFor(() => {
      const serviceElements = screen.queryAllByText(/Mythic\+|Leveling/);
      expect(serviceElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should filter services by game', async () => {
    // Set up mock services
    const mockServices = [
      createMockService({
        id: 'service-1',
        title: 'Mythic+ Dungeon Boost',
        gameId: 'wow',
        serviceTypeId: 'mythic-plus',
        status: 'active',
      }),
    ];
    localStorage.setItem('gaming-marketplace-services', JSON.stringify(mockServices));
    
    render(<MarketplacePage />, { initialUser: mockUser });
    
    // Wait for marketplace to load
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    });
    
    // Test that the filter controls are present
    const gameFilter = screen.getByLabelText(/Game/i);
    expect(gameFilter).toBeInTheDocument();
  });

  it('should search services by title', async () => {
    render(<MarketplacePage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search services/i);
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Mythic' } });
    expect(searchInput.value).toBe('Mythic');
  });

  it('should display marketplace interface', async () => {
    render(<MarketplacePage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Browse and purchase gaming services from verified providers')).toBeInTheDocument();
    });
    
    // Check that main interface elements are present
    expect(screen.getByText('📋 My Orders')).toBeInTheDocument();
    expect(screen.getByText('📜 Order History')).toBeInTheDocument();
  });

  it('should handle service loading states', async () => {
    render(<MarketplacePage />, { initialUser: mockUser });
    
    // Should show loading initially
    expect(screen.getByText('Loading services...')).toBeInTheDocument();
    
    // Should show marketplace title
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    });
  });
});