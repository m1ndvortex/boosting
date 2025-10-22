// Wallet balance display component

import React from 'react';
import type { Wallet } from '../../types';
import './WalletBalance.css';

interface WalletBalanceProps {
  wallet: Wallet;
  loading?: boolean;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  wallet,
  loading = false,
}) => {
  const formatCurrency = (amount: number, currency: string): string => {
    switch (currency) {
      case 'gold':
        return `${amount.toLocaleString()} G`;
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()} ﷼`;
      default:
        return amount.toString();
    }
  };

  const getCurrencyIcon = (currency: string): string => {
    switch (currency) {
      case 'gold':
        return '🪙';
      case 'usd':
        return '💵';
      case 'toman':
        return '﷼';
      default:
        return '💰';
    }
  };

  const getCurrencyName = (currency: string): string => {
    switch (currency) {
      case 'gold':
        return 'Gold';
      case 'usd':
        return 'USD';
      case 'toman':
        return 'Toman';
      default:
        return currency;
    }
  };

  if (loading || !wallet) {
    return (
      <div className="wallet-balance" data-testid="wallet-balance">
        <div className="wallet-balance__header">
          <h2>Wallet Balance</h2>
          <div className="wallet-balance__loading">Loading...</div>
        </div>
        <div className="wallet-balance__currencies">
          {['gold', 'usd', 'toman'].map((currency) => (
            <div key={currency} className="wallet-balance__currency loading">
              <div className="wallet-balance__currency-icon">
                {getCurrencyIcon(currency)}
              </div>
              <div className="wallet-balance__currency-info">
                <div className="wallet-balance__currency-name">
                  {getCurrencyName(currency)}
                </div>
                <div className="wallet-balance__currency-amount">
                  <div className="skeleton-text">Loading...</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-balance" data-testid="wallet-balance">
      <div className="wallet-balance__header">
        <h2>Wallet Balance</h2>
        <div className="wallet-balance__updated">
          Last updated: {new Date(wallet.updatedAt).toLocaleString()}
        </div>
      </div>
      
      <div className="wallet-balance__currencies">
        <div className="wallet-balance__currency">
          <div className="wallet-balance__currency-icon">🪙</div>
          <div className="wallet-balance__currency-info">
            <div className="wallet-balance__currency-name">Gold</div>
            <div className="wallet-balance__currency-amount">
              {formatCurrency(wallet.balances.gold, 'gold')}
            </div>
            <div className="wallet-balance__currency-desc">In-game currency</div>
          </div>
        </div>
        
        <div className="wallet-balance__currency">
          <div className="wallet-balance__currency-icon">💵</div>
          <div className="wallet-balance__currency-info">
            <div className="wallet-balance__currency-name">USD</div>
            <div className="wallet-balance__currency-amount">
              ${formatCurrency(wallet.balances.usd, 'usd')}
            </div>
            <div className="wallet-balance__currency-desc">US Dollar</div>
          </div>
        </div>
        
        <div className="wallet-balance__currency">
          <div className="wallet-balance__currency-icon">﷼</div>
          <div className="wallet-balance__currency-info">
            <div className="wallet-balance__currency-name">Toman</div>
            <div className="wallet-balance__currency-amount">
              {formatCurrency(wallet.balances.toman, 'toman')}
            </div>
            <div className="wallet-balance__currency-desc">Iranian Toman</div>
          </div>
        </div>
      </div>
    </div>
  );
};