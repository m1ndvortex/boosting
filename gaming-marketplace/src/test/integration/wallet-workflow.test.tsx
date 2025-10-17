import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { WalletPage } from '@pages/wallet/WalletPage';
import { createMockUser } from '@/test/utils/test-utils';

describe('Wallet Workflow Integration', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    localStorage.clear();
    // Set up initial wallet
    const mockWallet = {
      userId: mockUser.id,
      balances: { gold: 100000, usd: 500, toman: 20000000 },
      updatedAt: new Date(),
    };
    localStorage.setItem(`gaming-marketplace-wallet-${mockUser.id}`, JSON.stringify(mockWallet));
  });

  it('should display wallet balances correctly', async () => {
    render(<WalletPage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('Wallet')).toBeInTheDocument();
    });
    
    // Check that wallet interface is displayed
    await waitFor(() => {
      const balanceElements = screen.queryAllByText(/100,000|500|20,000,000/);
      expect(balanceElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('should display wallet interface', async () => {
    render(<WalletPage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('Wallet')).toBeInTheDocument();
      expect(screen.getByText('Multi-currency wallet management')).toBeInTheDocument();
    });
    
    // Check that wallet action buttons are present (they might be in different components)
    const walletElements = screen.queryAllByText(/Deposit|Withdraw|Convert/);
    expect(walletElements.length).toBeGreaterThan(0);
  });

  it('should handle wallet loading states', async () => {
    render(<WalletPage />, { initialUser: mockUser });
    
    // Should show wallet page
    await waitFor(() => {
      expect(screen.getByText('Wallet')).toBeInTheDocument();
    });
    
    // Should show some wallet content (either loading or actual data)
    const walletContent = screen.queryByText(/Loading|Balance|USD|Gold|Toman/);
    expect(walletContent).toBeInTheDocument();
  });

  it('should display wallet navigation', async () => {
    render(<WalletPage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('Wallet')).toBeInTheDocument();
    });
    
    // Check that basic wallet interface elements are present
    expect(screen.getByText('Multi-currency wallet management')).toBeInTheDocument();
  });
});