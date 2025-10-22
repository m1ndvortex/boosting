// Multi-Wallet Balance Display Component

import React from 'react';
import type { MultiWallet } from '../../types';
import './MultiWalletBalance.css';

interface MultiWalletBalanceProps {
  wallet: MultiWallet;
  loading?: boolean;
}

export const MultiWalletBalance: React.FC<MultiWalletBalanceProps> = ({
  wallet,
  loading = false
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



  const getWalletTypeIndicator = (type: 'static' | 'gold'): string => {
    return type === 'static' ? '🏦' : '🎮';
  };

  const getGoldStatusIcon = (type: 'suspended' | 'withdrawable' | 'total'): string => {
    switch (type) {
      case 'suspended':
        return '⏳';
      case 'withdrawable':
        return '✅';
      case 'total':
        return '💰';
      default:
        return '💰';
    }
  };



  const getTimeUntilWithdrawable = (withdrawableAt: Date): string => {
    const now = new Date();
    const timeLeft = withdrawableAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Available now';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  if (loading || !wallet) {
    return (
      <div className="multi-wallet-balance" data-testid="multi-wallet-balance">
        <div className="multi-wallet-balance__header">
          <h2>Multi-Wallet Balance</h2>
          <div className="multi-wallet-balance__loading">Loading...</div>
        </div>
        <div className="multi-wallet-balance__skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }



  return (
    <div className="multi-wallet-balance" data-testid="multi-wallet-balance">
      <div className="multi-wallet-balance__header">
        <h2>Multi-Wallet Balance</h2>
        <div className="multi-wallet-balance__updated">
          Last updated: {new Date(wallet.updatedAt).toLocaleString()}
        </div>
      </div>

      {/* Static Wallets */}
      <div className="multi-wallet-balance__section">
        <div className="multi-wallet-balance__section-header">
          <h3>
            <span className="multi-wallet-balance__section-icon">{getWalletTypeIndicator('static')}</span>
            Fiat Currencies
          </h3>
          <div className="multi-wallet-balance__wallet-type-badge static">
            Static Wallets
          </div>
        </div>
        <div className="multi-wallet-balance__static-wallets">
          <div className="multi-wallet-balance__wallet static" data-wallet-type="static">
            <div className="multi-wallet-balance__wallet-header">
              <div className="multi-wallet-balance__wallet-icon">💵</div>
              <div className="multi-wallet-balance__wallet-info">
                <div className="multi-wallet-balance__wallet-name">
                  USD
                  <span className="multi-wallet-balance__wallet-status-badge permanent">
                    Permanent
                  </span>
                </div>
                <div className="multi-wallet-balance__wallet-amount">
                  ${wallet.staticWallets.usd.balance.toFixed(2)}
                </div>
                <div className="multi-wallet-balance__wallet-desc">US Dollar • Always Available</div>
              </div>
            </div>
          </div>

          <div className="multi-wallet-balance__wallet static" data-wallet-type="static">
            <div className="multi-wallet-balance__wallet-header">
              <div className="multi-wallet-balance__wallet-icon">﷼</div>
              <div className="multi-wallet-balance__wallet-info">
                <div className="multi-wallet-balance__wallet-name">
                  Toman
                  <span className="multi-wallet-balance__wallet-status-badge permanent">
                    Permanent
                  </span>
                </div>
                <div className="multi-wallet-balance__wallet-amount">
                  {formatCurrency(wallet.staticWallets.toman.balance, 'toman')}
                </div>
                <div className="multi-wallet-balance__wallet-desc">Iranian Toman • Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Wallets */}
      <div className="multi-wallet-balance__section">
        <div className="multi-wallet-balance__section-header">
          <h3>
            <span className="multi-wallet-balance__section-icon">{getWalletTypeIndicator('gold')}</span>
            Game Gold Wallets
          </h3>
          <div className="multi-wallet-balance__wallet-type-badge dynamic">
            Dynamic Wallets
          </div>
        </div>

        <div className="multi-wallet-balance__gold-wallets">
          {Object.values(wallet.goldWallets).length === 0 ? (
            <div className="multi-wallet-balance__empty">
              <div className="multi-wallet-balance__empty-icon">🎮</div>
              <h4>No Gold Wallets Yet</h4>
              <p>Add game-specific gold wallets to manage your in-game currencies</p>
            </div>
          ) : (
            Object.values(wallet.goldWallets).map(goldWallet => (
              <div key={goldWallet.realmId} className="multi-wallet-balance__wallet gold" data-wallet-type="gold">
                <div className="multi-wallet-balance__wallet-header">
                  <div className="multi-wallet-balance__wallet-icon">🪙</div>
                  <div className="multi-wallet-balance__wallet-info">
                    <div className="multi-wallet-balance__wallet-name">
                      {goldWallet.realmName} Gold
                      <span className="multi-wallet-balance__wallet-status-badge removable">
                        Removable
                      </span>
                    </div>
                    <div className="multi-wallet-balance__wallet-game">
                      🎮 {goldWallet.gameName} • {goldWallet.realmName}
                    </div>
                  </div>

                </div>

                <div className="multi-wallet-balance__gold-breakdown">
                  <div className="multi-wallet-balance__gold-item primary">
                    <div className="multi-wallet-balance__gold-label-with-icon">
                      <span className="multi-wallet-balance__gold-icon">{getGoldStatusIcon('total')}</span>
                      <span className="multi-wallet-balance__gold-label">Total Gold:</span>
                    </div>
                    <span className="multi-wallet-balance__gold-amount total">
                      {formatCurrency(goldWallet.totalGold, 'gold')}
                    </span>
                  </div>
                  
                  <div className="multi-wallet-balance__gold-item">
                    <div className="multi-wallet-balance__gold-label-with-icon">
                      <span className="multi-wallet-balance__gold-icon">{getGoldStatusIcon('withdrawable')}</span>
                      <span className="multi-wallet-balance__gold-label">Withdrawable:</span>
                    </div>
                    <span className="multi-wallet-balance__gold-amount withdrawable">
                      {formatCurrency(goldWallet.withdrawableGold, 'gold')}
                    </span>
                  </div>
                  
                  <div className="multi-wallet-balance__gold-item">
                    <div className="multi-wallet-balance__gold-label-with-icon">
                      <span className="multi-wallet-balance__gold-icon">{getGoldStatusIcon('suspended')}</span>
                      <span className="multi-wallet-balance__gold-label">Suspended:</span>
                    </div>
                    <span className="multi-wallet-balance__gold-amount suspended">
                      {formatCurrency(goldWallet.suspendedGold, 'gold')}
                    </span>
                  </div>
                </div>

                {goldWallet.suspendedDeposits.length > 0 && (
                  <div className="multi-wallet-balance__suspended-info">
                    <div className="multi-wallet-balance__suspended-header">
                      <span className="multi-wallet-balance__suspended-icon">⏳</span>
                      <h5>Suspended Deposits</h5>
                    </div>
                    <div className="multi-wallet-balance__deposits-list">
                      {goldWallet.suspendedDeposits.map(deposit => (
                        <div key={deposit.id} className={`multi-wallet-balance__deposit ${deposit.status}`}>
                          <div className="multi-wallet-balance__deposit-amount">
                            <span className="multi-wallet-balance__deposit-icon">
                              {deposit.status === 'suspended' ? '⏳' : '✅'}
                            </span>
                            {formatCurrency(deposit.amount, 'gold')}
                          </div>
                          <div className="multi-wallet-balance__deposit-status">
                            {deposit.status === 'suspended' 
                              ? getTimeUntilWithdrawable(new Date(deposit.withdrawableAt))
                              : 'Available Now'
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};