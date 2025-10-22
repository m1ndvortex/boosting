import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { DiscordLogin } from '@pages/auth/DiscordLogin';
import { AppRouter } from '@components/routing/AppRouter';

describe('Authentication Workflow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should complete full authentication flow', async () => {
    render(<DiscordLogin />);
    
    // Should show Discord login interface
    expect(screen.getByText(/Sign in with Discord/i)).toBeInTheDocument();
    
    // Should show mock user selection
    expect(screen.getByText(/Select a user to simulate login/i)).toBeInTheDocument();
    
    // Select a mock user
    const clientUser = screen.getByText(/TestClient/);
    fireEvent.click(clientUser);
    
    // Should redirect after successful login
    await waitFor(() => {
      expect(localStorage.getItem('gaming-marketplace-user')).toBeTruthy();
    });
  });

  it('should assign client role to new users automatically', async () => {
    render(<DiscordLogin />);
    
    const newUser = screen.getByText(/NewUser/);
    fireEvent.click(newUser);
    
    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('gaming-marketplace-user') || '{}');
      expect(storedUser.roles).toContainEqual(
        expect.objectContaining({ name: 'client', status: 'active' })
      );
    });
  });

  it('should redirect admin users to admin dashboard', async () => {
    const adminUser = {
      id: 'admin-1',
      discordId: '987654321',
      username: 'AdminUser',
      discriminator: '0001',
      avatar: 'admin-avatar.png',
      email: 'admin@example.com',
      roles: [
        { id: '1', name: 'client' as const, status: 'active' as const },
        { id: '2', name: 'admin' as const, status: 'active' as const },
      ],
      createdAt: new Date(),
    };

    render(<AppRouter />, { initialUser: adminUser });
    
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
  });

  it('should redirect service provider users to service provider dashboard', async () => {
    const boosterUser = {
      id: 'booster-1',
      discordId: '555666777',
      username: 'BoosterUser',
      discriminator: '0002',
      avatar: 'booster-avatar.png',
      email: 'booster@example.com',
      roles: [
        { id: '1', name: 'client' as const, status: 'active' as const },
        { id: '3', name: 'booster' as const, status: 'active' as const },
      ],
      createdAt: new Date(),
    };

    render(<AppRouter />, { initialUser: boosterUser });
    
    await waitFor(() => {
      expect(screen.getByText(/🎮 Booster/)).toBeInTheDocument();
    });
  });

  it('should handle logout correctly', async () => {
    const testUser = {
      id: 'test-user',
      discordId: '123456789',
      username: 'TestUser',
      discriminator: '1234',
      avatar: 'test-avatar.png',
      email: 'test@example.com',
      roles: [{ id: '1', name: 'client' as const, status: 'active' as const }],
      createdAt: new Date(),
    };

    // Set initial user in localStorage
    localStorage.setItem('gaming-marketplace-user', JSON.stringify(testUser));

    render(<AppRouter />, { initialUser: testUser });
    
    // Find and click logout button (it's represented by an emoji)
    const logoutButton = screen.getByTitle('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('gaming-marketplace-user')).toBeNull();
      expect(screen.getByText(/Sign in with Discord/i)).toBeInTheDocument();
    });
  });
});