import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { WalletBalance } from '@components/wallet/WalletBalance';

describe('WalletBalance Component', () => {
  const mockWallet = {
    userId: 'user-1',
    balances: {
      gold: 150000,
      usd: 250.50,
      toman: 10500000,
    },
    updatedAt: new Date(),
  };

  it('should display all currency balances with correct symbols', () => {
    render(<WalletBalance wallet={mockWallet} />);
    
    expect(screen.getByText(/150,000 G/)).toBeInTheDocument();
    expect(screen.getByText(/\$250\.50/)).toBeInTheDocument();
    expect(screen.getByText(/10,500,000 ﷼/)).toBeInTheDocument();
  });

  it('should format large numbers correctly', () => {
    const largeBalanceWallet = {
      ...mockWallet,
      balances: {
        gold: 1500000,
        usd: 1250.75,
        toman: 50000000,
      },
    };

    render(<WalletBalance wallet={largeBalanceWallet} />);
    
    expect(screen.getByText(/1,500,000 G/)).toBeInTheDocument();
    expect(screen.getByText(/\$1250\.75/)).toBeInTheDocument();
    expect(screen.getByText(/50,000,000 ﷼/)).toBeInTheDocument();
  });

  it('should handle zero balances', () => {
    const zeroBalanceWallet = {
      ...mockWallet,
      balances: {
        gold: 0,
        usd: 0,
        toman: 0,
      },
    };

    render(<WalletBalance wallet={zeroBalanceWallet} />);
    
    expect(screen.getByText(/0 G/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    expect(screen.getByText(/0 ﷼/)).toBeInTheDocument();
  });

  it('should apply correct CSS classes for styling', () => {
    render(<WalletBalance wallet={mockWallet} />);
    
    const container = screen.getByTestId('wallet-balance');
    expect(container).toHaveClass('wallet-balance');
  });

  it('should display currency labels', () => {
    render(<WalletBalance wallet={mockWallet} />);
    
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('Toman')).toBeInTheDocument();
  });
});