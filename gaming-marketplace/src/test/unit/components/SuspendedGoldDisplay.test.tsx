// SuspendedGoldDisplay Component Tests

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { SuspendedGoldDisplay } from '../../../components/wallet/SuspendedGoldDisplay';
import type { GoldWalletBalance } from '../../../types';

// Mock the services
vi.mock('../../../services/multiWalletService', () => ({
  MultiWalletService: {
    getConversionPreview: vi.fn()
  }
}));

vi.mock('../../../services/conversionFeeService', () => ({
  ConversionFeeService: {
    getConversionFeePercentage: vi.fn(() => 5.0)
  }
}));

const mockGoldWallet: GoldWalletBalance = {
  realmId: 'test-realm',
  realmName: 'Test Realm',
  gameName: 'Test Game',
  suspendedGold: 1000,
  withdrawableGold: 500,
  totalGold: 1500,
  suspendedDeposits: [
    {
      id: 'deposit-1',
      amount: 600,
      depositedAt: new Date('2024-10-01'),
      withdrawableAt: new Date('2024-12-01'),
      depositedBy: 'admin-1',
      status: 'suspended'
    },
    {
      id: 'deposit-2',
      amount: 400,
      depositedAt: new Date('2024-10-15'),
      withdrawableAt: new Date('2024-12-15'),
      depositedBy: 'admin-1',
      status: 'suspended'
    }
  ]
};

const mockEmptyGoldWallet: GoldWalletBalance = {
  realmId: 'empty-realm',
  realmName: 'Empty Realm',
  gameName: 'Empty Game',
  suspendedGold: 0,
  withdrawableGold: 1000,
  totalGold: 1000,
  suspendedDeposits: []
};

describe('SuspendedGoldDisplay', () => {
  const mockOnConvertToFiat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders suspended gold information correctly', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    expect(screen.getByTestId('suspended-gold-display')).toBeInTheDocument();
    expect(screen.getByText('Suspended Gold')).toBeInTheDocument();
    expect(screen.getByText('1,000 G')).toBeInTheDocument();
    expect(screen.getByText('Convert to Fiat')).toBeInTheDocument();
  });

  it('displays empty state when no suspended gold', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockEmptyGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    expect(screen.getByText('No Suspended Gold')).toBeInTheDocument();
    expect(screen.getByText('All your gold in this wallet is available for withdrawal')).toBeInTheDocument();
  });

  it('shows deposit history with correct information', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    expect(screen.getByText('Deposit History')).toBeInTheDocument();
    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText('600 G')).toBeInTheDocument();
    expect(screen.getByText('400 G')).toBeInTheDocument();
  });

  it('opens conversion form when convert button is clicked', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    const convertButton = screen.getByText('Convert to Fiat');
    fireEvent.click(convertButton);

    expect(screen.getByText('Convert Suspended Gold')).toBeInTheDocument();
    expect(screen.getByText('Amount to Convert')).toBeInTheDocument();
    expect(screen.getByText('Target Currency')).toBeInTheDocument();
  });

  it('handles amount input correctly', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    // Open conversion form
    fireEvent.click(screen.getByText('Convert to Fiat'));

    const amountInput = screen.getByPlaceholderText('Enter amount...');
    fireEvent.change(amountInput, { target: { value: '500' } });

    expect(amountInput).toHaveValue('500');
  });

  it('sets max amount when MAX button is clicked', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    // Open conversion form
    fireEvent.click(screen.getByText('Convert to Fiat'));

    const maxButton = screen.getByText('MAX');
    fireEvent.click(maxButton);

    const amountInput = screen.getByPlaceholderText('Enter amount...');
    expect(amountInput).toHaveValue('1000');
  });

  it('allows currency selection', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    // Open conversion form
    fireEvent.click(screen.getByText('Convert to Fiat'));

    const currencySelect = screen.getByDisplayValue('USD ($)');
    fireEvent.change(currencySelect, { target: { value: 'toman' } });

    expect(currencySelect).toHaveValue('toman');
  });

  it('cancels conversion form when cancel is clicked', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    // Open conversion form
    fireEvent.click(screen.getByText('Convert to Fiat'));
    expect(screen.getByText('Convert Suspended Gold')).toBeInTheDocument();

    // Cancel form
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Convert Suspended Gold')).not.toBeInTheDocument();
  });

  it('disables convert button when loading', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
        loading={true}
      />
    );

    const convertButton = screen.getByText('Convert to Fiat');
    expect(convertButton).toBeDisabled();
  });

  it('shows available amount in form', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    // Open conversion form
    fireEvent.click(screen.getByText('Convert to Fiat'));

    expect(screen.getByText('Available: 1,000 G')).toBeInTheDocument();
  });

  it('displays progress bars for suspended deposits', () => {
    // Create a wallet with future dates so deposits are still suspended
    const futureGoldWallet: GoldWalletBalance = {
      ...mockGoldWallet,
      suspendedDeposits: [
        {
          id: 'deposit-1',
          amount: 600,
          depositedAt: new Date('2024-10-01'),
          withdrawableAt: new Date('2025-12-01'), // Future date
          depositedBy: 'admin-1',
          status: 'suspended'
        },
        {
          id: 'deposit-2',
          amount: 400,
          depositedAt: new Date('2024-10-15'),
          withdrawableAt: new Date('2025-12-15'), // Future date
          depositedBy: 'admin-1',
          status: 'suspended'
        }
      ]
    };

    render(
      <SuspendedGoldDisplay
        goldWallet={futureGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    const progressBars = document.querySelectorAll('.suspended-gold-display__progress-bar');
    expect(progressBars).toHaveLength(2);
  });

  it('shows deposit dates correctly', () => {
    render(
      <SuspendedGoldDisplay
        goldWallet={mockGoldWallet}
        onConvertToFiat={mockOnConvertToFiat}
      />
    );

    expect(screen.getByText('10/1/2024')).toBeInTheDocument();
    expect(screen.getByText('10/15/2024')).toBeInTheDocument();
  });
});