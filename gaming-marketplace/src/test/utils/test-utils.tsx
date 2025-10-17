import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { WalletProvider } from '@contexts/WalletContext';
import { WorkspaceProvider } from '@contexts/WorkspaceContext';
import { GameProvider } from '@contexts/GameContext';
import { OrderProvider } from '@contexts/OrderContext';
import { type User } from '@/types';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: User | null;
  initialRoute?: string;
}

const AllTheProviders = ({ 
  children, 
  initialUser = null 
}: { 
  children: React.ReactNode;
  initialUser?: User | null;
}) => {
  // Set up initial user in localStorage if provided
  if (initialUser) {
    localStorage.setItem('gaming-marketplace-user', JSON.stringify(initialUser));
    
    // Also set up wallet data for the user
    const walletKey = `gaming-marketplace-wallet-${initialUser.id}`;
    const existingWallet = localStorage.getItem(walletKey);
    if (!existingWallet) {
      const wallet = {
        userId: initialUser.id,
        balances: { 
          gold: 100000, 
          usd: 500, 
          toman: 20000000 
        },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(walletKey, JSON.stringify(wallet));
    }
  }

  return (
    <BrowserRouter>
      <AuthProvider initialUser={initialUser}>
        <GameProvider>
          <WalletProvider>
            <WorkspaceProvider>
              <OrderProvider>
                {children}
              </OrderProvider>
            </WorkspaceProvider>
          </WalletProvider>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialUser, initialRoute, ...renderOptions } = options;

  if (initialRoute) {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialUser={initialUser}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };

// Mock data helpers
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  discordId: '123456789',
  username: 'TestUser',
  discriminator: '1234',
  avatar: 'test-avatar.png',
  email: 'test@example.com',
  roles: [{ id: '1', name: 'client', status: 'active' }],
  createdAt: new Date(),
  ...overrides,
});

export const createMockService = (overrides = {}) => ({
  id: 'service-1',
  gameId: 'wow',
  serviceTypeId: 'mythic-plus',
  title: 'Mythic+ Boost',
  description: 'Professional mythic+ dungeon boost',
  prices: { gold: 100000, usd: 50, toman: 2000000 },
  workspaceType: 'personal' as const,
  workspaceOwnerId: 'test-user-1',
  createdBy: 'test-user-1',
  status: 'active' as const,
  createdAt: new Date(),
  game: {
    id: 'wow',
    name: 'World of Warcraft',
    icon: '🎮',
    slug: 'wow',
    isActive: true,
    serviceTypes: []
  },
  serviceType: {
    id: 'mythic-plus',
    gameId: 'wow',
    name: 'Mythic+ Dungeons',
    requiresAdmin: false,
    description: 'Mythic+ dungeon boost services',
    isActive: true
  },
  advertiser: {
    id: 'test-user-1',
    username: 'TestAdvertiser',
    discriminator: '1234',
    avatar: 'test-avatar.png',
    rating: 4.8,
    completedOrders: 150
  },
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  serviceId: 'service-1',
  buyerId: 'buyer-1',
  earningsRecipientId: 'seller-1',
  status: 'pending' as const,
  pricePaid: 50,
  currency: 'usd' as const,
  createdAt: new Date(),
  ...overrides,
});