import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MultiWalletBalance } from '../../../components/wallet/MultiWalletBalance';
import type { MultiWallet } from '../../../types';

// Mock data
const mockWallet: MultiWallet = {
  userId: 'test-user',
  staticWallets: {
    usd: { balance: 100.50, currency: 'usd' },
    toman: { balance: 50000, currency: 'toman' }
  },
  goldWallets: {
    'kazzak-gold': {
      realmId: 'kazzak-gold',
      realmName: 'Kazzak',
      gameName: 'World of Warcraft',
      suspendedGold: 500,
      withdrawableGold: 1000,
      totalGold: 1500,
      suspendedDeposits: [
        {
          id: 'deposit-1',
          amount: 500,
          depositedAt: new Date('2024-01-01'),
          withdrawableAt: new Date('2024-03-01'),
          depositedBy: 'admin-1',
          status: 'suspended' as const
        }
      ]
    }
  },
  updatedAt: new Date('2024-01-15')
};

describe('MultiWalletBalance', () => {

  it('should display static wallets with visual indicators', () => {
    render(
      <MultiWalletBalance
        wallet={mockWallet}
      />
    );

    // Check static wallets section
    expect(screen.getByText('Fiat Currencies')).toBeInTheDocument();
    expect(screen.getByText('Static Wallets')).toBeInTheDocument();
    
    // Check USD wallet
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getAllByText('Permanent')).toHaveLength(2); // Both USD and Toman have permanent badges
    expect(screen.getByText('$100.50')).toBeInTheDocument();
    expect(screen.getByText('US Dollar • Always Available')).toBeInTheDocument();
    
    // Check Toman wallet
    expect(screen.getByText('Toman')).toBeInTheDocument();
    expect(screen.getByText('50,000 ﷼')).toBeInTheDocument();
    expect(screen.getByText('Iranian Toman • Always Available')).toBeInTheDocument();
  });

  it('should display gold wallets with suspended vs withdrawable breakdown', () => {
    render(
      <MultiWalletBalance
        wallet={mockWallet}
      />
    );

    // Check gold wallets section
    expect(screen.getByText('Game Gold Wallets')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Wallets')).toBeInTheDocument();
    
    // Check gold wallet details
    expect(screen.getByText('Kazzak Gold')).toBeInTheDocument();
    expect(screen.getByText('Removable')).toBeInTheDocument();
    expect(screen.getByText('🎮 World of Warcraft • Kazzak')).toBeInTheDocument();
    
    // Check gold breakdown
    expect(screen.getByText('Total Gold:')).toBeInTheDocument();
    expect(screen.getByText('1,500 G')).toBeInTheDocument();
    expect(screen.getByText('Withdrawable:')).toBeInTheDocument();
    expect(screen.getByText('1,000 G')).toBeInTheDocument();
    expect(screen.getByText('Suspended:')).toBeInTheDocument();
    expect(screen.getAllByText('500 G')).toHaveLength(2); // One in breakdown, one in deposits
  });

  it('should display suspended deposits with status indicators', () => {
    render(
      <MultiWalletBalance
        wallet={mockWallet}
      />
    );

    // Check suspended deposits section
    expect(screen.getByText('Suspended Deposits')).toBeInTheDocument();
    
    // Check deposit details - there should be 500 G in both the breakdown and deposits list
    const depositElements = screen.getAllByText('500 G');
    expect(depositElements.length).toBe(2); // One in breakdown, one in deposits list
  });



  it('should show loading state', () => {
    render(
      <MultiWalletBalance
        wallet={mockWallet}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('multi-wallet-balance')).toBeInTheDocument();
  });

  it('should show empty state when no gold wallets exist', () => {
    const emptyWallet: MultiWallet = {
      ...mockWallet,
      goldWallets: {}
    };

    render(
      <MultiWalletBalance
        wallet={emptyWallet}
      />
    );

    expect(screen.getByText('No Gold Wallets Yet')).toBeInTheDocument();
    expect(screen.getByText('Add game-specific gold wallets to manage your in-game currencies')).toBeInTheDocument();
  });

  it('should have proper wallet type indicators', () => {
    render(
      <MultiWalletBalance
        wallet={mockWallet}
      />
    );

    // Check for wallet type data attributes
    const staticWallets = screen.getAllByTestId('multi-wallet-balance')[0].querySelectorAll('[data-wallet-type="static"]');
    const goldWallets = screen.getAllByTestId('multi-wallet-balance')[0].querySelectorAll('[data-wallet-type="gold"]');
    
    expect(staticWallets.length).toBe(2); // USD and Toman
    expect(goldWallets.length).toBe(1); // Kazzak Gold
  });
});