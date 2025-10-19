import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoldWalletManager } from '../../../components/wallet/GoldWalletManager';
import type { MultiWallet, GameRealm } from '../../../types';

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
      suspendedDeposits: []
    }
  },
  updatedAt: new Date('2024-01-15')
};

const mockEmptyWallet: MultiWallet = {
  userId: 'test-user',
  staticWallets: {
    usd: { balance: 100.50, currency: 'usd' },
    toman: { balance: 50000, currency: 'toman' }
  },
  goldWallets: {},
  updatedAt: new Date('2024-01-15')
};

const mockAvailableRealms: GameRealm[] = [
  {
    id: 'stormrage-gold',
    gameId: 'wow',
    gameName: 'World of Warcraft',
    realmName: 'Stormrage',
    displayName: 'Stormrage Gold',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin-1'
  },
  {
    id: 'ragnaros-gold',
    gameId: 'wow',
    gameName: 'World of Warcraft',
    realmName: 'Ragnaros',
    displayName: 'Ragnaros Gold',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin-1'
  },
  {
    id: 'gilgamesh-gil',
    gameId: 'ff14',
    gameName: 'Final Fantasy XIV',
    realmName: 'Gilgamesh',
    displayName: 'Gilgamesh Gil',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin-1'
  }
];

describe('GoldWalletManager', () => {
  const mockOnAddWallet = vi.fn();
  const mockOnRemoveWallet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with proper header and title', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    expect(screen.getByTestId('gold-wallet-manager')).toBeInTheDocument();
    expect(screen.getByText('Gold Wallet Manager')).toBeInTheDocument();
    expect(screen.getByText('Add and manage game-specific gold wallets')).toBeInTheDocument();
  });

  it('should show add wallet button when realms are available', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  it('should not show add wallet button when no realms are available', () => {
    render(
      <GoldWalletManager
        availableRealms={[]}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    expect(screen.queryByText('Add Gold Wallet')).not.toBeInTheDocument();
  });

  it('should display add wallet form when add button is clicked', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Gold Wallet')).toBeInTheDocument();
    expect(screen.getByText('Select a game realm to create a new gold wallet')).toBeInTheDocument();
    expect(screen.getByText('Select a game realm...')).toBeInTheDocument();
  });

  it('should group realms by game in the select dropdown', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    fireEvent.click(addButton);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check that options are grouped by game
    expect(screen.getByText('Stormrage (World of Warcraft)')).toBeInTheDocument();
    expect(screen.getByText('Ragnaros (World of Warcraft)')).toBeInTheDocument();
    expect(screen.getByText('Gilgamesh (Final Fantasy XIV)')).toBeInTheDocument();
  });

  it('should handle adding a new wallet', async () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    fireEvent.click(addButton);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'stormrage-gold' } });

    const confirmButton = screen.getByText('Add Wallet');
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    expect(mockOnAddWallet).toHaveBeenCalledWith('stormrage-gold');
  });

  it('should prevent adding duplicate wallets through UI filtering', () => {
    render(
      <GoldWalletManager
        availableRealms={[
          ...mockAvailableRealms,
          {
            id: 'kazzak-gold', // This realm already exists in mockWallet
            gameId: 'wow',
            gameName: 'World of Warcraft',
            realmName: 'Kazzak',
            displayName: 'Kazzak Gold',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            createdBy: 'admin-1'
          }
        ]}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    fireEvent.click(addButton);

    // Kazzak should not appear in the dropdown since it's already added
    expect(screen.queryByText('Kazzak (World of Warcraft)')).not.toBeInTheDocument();
    // But other realms should appear
    expect(screen.getByText('Stormrage (World of Warcraft)')).toBeInTheDocument();
  });

  it('should display existing gold wallets', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    expect(screen.getByTestId('gold-wallet-kazzak-gold')).toBeInTheDocument();
    expect(screen.getByText('Kazzak Gold')).toBeInTheDocument();
    expect(screen.getByText('World of Warcraft • Kazzak')).toBeInTheDocument();
    expect(screen.getAllByText('1,500 G')).toHaveLength(2); // Total gold appears in wallet and summary
    expect(screen.getAllByText('1,000 G')).toHaveLength(2); // Withdrawable appears in wallet and summary
    expect(screen.getAllByText('500 G')).toHaveLength(2); // Suspended appears in wallet and summary
  });

  it('should handle wallet removal with zero balance', () => {
    const walletWithZeroBalance: MultiWallet = {
      ...mockWallet,
      goldWallets: {
        'kazzak-gold': {
          ...mockWallet.goldWallets['kazzak-gold'],
          suspendedGold: 0,
          withdrawableGold: 0,
          totalGold: 0
        }
      }
    };

    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={walletWithZeroBalance}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const removeButton = screen.getByTitle('Remove wallet');
    fireEvent.click(removeButton);

    expect(mockOnRemoveWallet).toHaveBeenCalledWith('kazzak-gold');
  });

  it('should require confirmation for wallet removal with balance', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const removeButton = screen.getByTitle('Remove wallet');
    fireEvent.click(removeButton);

    // Should show confirmation UI
    expect(screen.getByText('Warning:')).toBeInTheDocument();
    expect(screen.getByText(/This wallet contains 1,500 G/)).toBeInTheDocument();
    expect(screen.getByTitle('Confirm removal')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel removal')).toBeInTheDocument();

    // Should not call remove yet
    expect(mockOnRemoveWallet).not.toHaveBeenCalled();
  });

  it('should confirm wallet removal after confirmation', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const removeButton = screen.getByTitle('Remove wallet');
    fireEvent.click(removeButton);

    const confirmButton = screen.getByTitle('Confirm removal');
    fireEvent.click(confirmButton);

    expect(mockOnRemoveWallet).toHaveBeenCalledWith('kazzak-gold');
  });

  it('should cancel wallet removal', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const removeButton = screen.getByTitle('Remove wallet');
    fireEvent.click(removeButton);

    const cancelButton = screen.getByTitle('Cancel removal');
    fireEvent.click(cancelButton);

    // Confirmation UI should disappear
    expect(screen.queryByText('Warning:')).not.toBeInTheDocument();
    expect(mockOnRemoveWallet).not.toHaveBeenCalled();
  });

  it('should show empty state when no gold wallets exist', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockEmptyWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    expect(screen.getByText('No Gold Wallets Yet')).toBeInTheDocument();
    expect(screen.getByText('Add game-specific gold wallets to manage your in-game currencies')).toBeInTheDocument();
  });

  it('should show message when no realms are available', () => {
    render(
      <GoldWalletManager
        availableRealms={[]}
        userWallet={mockEmptyWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    expect(screen.getByText('No additional realms available. Contact an admin to add more games and realms.')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    expect(screen.getByText('Gold Wallet Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Wallets')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 wallet
    expect(screen.getAllByText('Total Gold')).toHaveLength(2); // One in wallet card, one in summary
    expect(screen.getAllByText('1,500 G')).toHaveLength(2); // One in wallet card, one in summary
  });

  it('should show loading state', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('gold-wallet-manager')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
        loading={true}
      />
    );

    // In loading state, the component shows skeleton instead of buttons
    expect(screen.queryByText('Add Gold Wallet')).not.toBeInTheDocument();
  });

  it('should filter out already added realms from available options', () => {
    render(
      <GoldWalletManager
        availableRealms={[
          ...mockAvailableRealms,
          {
            id: 'kazzak-gold', // This realm already exists in mockWallet
            gameId: 'wow',
            gameName: 'World of Warcraft',
            realmName: 'Kazzak',
            displayName: 'Kazzak Gold',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            createdBy: 'admin-1'
          }
        ]}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    fireEvent.click(addButton);

    // Kazzak should not appear in the dropdown since it's already added
    expect(screen.queryByText('Kazzak (World of Warcraft)')).not.toBeInTheDocument();
    // But other realms should appear
    expect(screen.getByText('Stormrage (World of Warcraft)')).toBeInTheDocument();
  });

  it('should handle form cancellation', () => {
    render(
      <GoldWalletManager
        availableRealms={mockAvailableRealms}
        userWallet={mockWallet}
        onAddWallet={mockOnAddWallet}
        onRemoveWallet={mockOnRemoveWallet}
      />
    );

    const addButton = screen.getByText('Add Gold Wallet');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Gold Wallet')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Add New Gold Wallet')).not.toBeInTheDocument();
  });
});