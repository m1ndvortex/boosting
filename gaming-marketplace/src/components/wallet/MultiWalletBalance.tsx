// Multi-Wallet Balance Display Component

import React, { useState } from 'react';
import type { MultiWallet, GameRealm } from '../../types';
import { MultiWalletService } from '../../services/multiWalletService';
import './MultiWalletBalance.css';

interface MultiWalletBalanceProps {
  wallet: MultiWallet;
  loading?: boolean;
  availableRealms?: GameRealm[];
  onAddWallet?: (realmId: string) => void;
  onRemoveWallet?: (realmId: string) => void;
}

export const MultiWalletBalance: React.FC<MultiWalletBalanceProps> = ({
  wallet,
  loading = false,
  availableRealms = [],
  onAddWallet,
  onRemoveWallet
}) => {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState('');

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

  const handleAddWallet = () => {
    if (selectedRealm && onAddWallet) {
      onAddWallet(selectedRealm);
      setSelectedRealm('');
      setShowAddWallet(false);
    }
  };

  const handleRemoveWallet = (realmId: string) => {
    if (onRemoveWallet) {
      const goldWallet = wallet.goldWallets[realmId];
      if (goldWallet.totalGold > 0) {
        const confirmed = window.confirm(
          `This wallet has ${goldWallet.totalGold} gold. Are you sure you want to remove it?`
        );
        if (!confirmed) return;
      }
      onRemoveWallet(realmId);
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

  const availableRealmsForAdd = availableRealms.filter(
    realm => !wallet.goldWallets[realm.id]
  );

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
        <h3>Fiat Currencies</h3>
        <div className="multi-wallet-balance__static-wallets">
          <div className="multi-wallet-balance__wallet static">
            <div className="multi-wallet-balance__wallet-icon">💵</div>
            <div className="multi-wallet-balance__wallet-info">
              <div className="multi-wallet-balance__wallet-name">USD</div>
              <div className="multi-wallet-balance__wallet-amount">
                {formatCurrency(wallet.staticWallets.usd.balance, 'usd')}
              </div>
              <div className="multi-wallet-balance__wallet-desc">US Dollar</div>
            </div>
          </div>

          <div className="multi-wallet-balance__wallet static">
            <div className="multi-wallet-balance__wallet-icon">﷼</div>
            <div className="multi-wallet-balance__wallet-info">
              <div className="multi-wallet-balance__wallet-name">Toman</div>
              <div className="multi-wallet-balance__wallet-amount">
                {formatCurrency(wallet.staticWallets.toman.balance, 'toman')}
              </div>
              <div className="multi-wallet-balance__wallet-desc">Iranian Toman</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Wallets */}
      <div className="multi-wallet-balance__section">
        <div className="multi-wallet-balance__section-header">
          <h3>Game Gold Wallets</h3>
          {availableRealmsForAdd.length > 0 && (
            <button 
              className="multi-wallet-balance__add-btn"
              onClick={() => setShowAddWallet(!showAddWallet)}
            >
              + Add Wallet
            </button>
          )}
        </div>

        {showAddWallet && (
          <div className="multi-wallet-balance__add-form">
            <select 
              value={selectedRealm} 
              onChange={(e) => setSelectedRealm(e.target.value)}
              className="multi-wallet-balance__realm-select"
            >
              <option value="">Select a game realm...</option>
              {availableRealmsForAdd.map(realm => (
                <option key={realm.id} value={realm.id}>
                  {realm.displayName}
                </option>
              ))}
            </select>
            <div className="multi-wallet-balance__add-actions">
              <button 
                onClick={handleAddWallet}
                disabled={!selectedRealm}
                className="multi-wallet-balance__confirm-btn"
              >
                Add
              </button>
              <button 
                onClick={() => setShowAddWallet(false)}
                className="multi-wallet-balance__cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="multi-wallet-balance__gold-wallets">
          {Object.values(wallet.goldWallets).length === 0 ? (
            <div className="multi-wallet-balance__empty">
              <div className="multi-wallet-balance__empty-icon">🎮</div>
              <h4>No Gold Wallets Yet</h4>
              <p>Add game-specific gold wallets to manage your in-game currencies</p>
            </div>
          ) : (
            Object.values(wallet.goldWallets).map(goldWallet => (
              <div key={goldWallet.realmId} className="multi-wallet-balance__wallet gold">
                <div className="multi-wallet-balance__wallet-header">
                  <div className="multi-wallet-balance__wallet-icon">🪙</div>
                  <div className="multi-wallet-balance__wallet-info">
                    <div className="multi-wallet-balance__wallet-name">
                      {goldWallet.realmName} Gold
                    </div>
                    <div className="multi-wallet-balance__wallet-game">
                      {goldWallet.gameName}
                    </div>
                  </div>
                  <button 
                    className="multi-wallet-balance__remove-btn"
                    onClick={() => handleRemoveWallet(goldWallet.realmId)}
                    title="Remove wallet"
                  >
                    ×
                  </button>
                </div>

                <div className="multi-wallet-balance__gold-breakdown">
                  <div className="multi-wallet-balance__gold-item">
                    <span className="multi-wallet-balance__gold-label">Total:</span>
                    <span className="multi-wallet-balance__gold-amount total">
                      {formatCurrency(goldWallet.totalGold, 'gold')}
                    </span>
                  </div>
                  
                  <div className="multi-wallet-balance__gold-item">
                    <span className="multi-wallet-balance__gold-label">Withdrawable:</span>
                    <span className="multi-wallet-balance__gold-amount withdrawable">
                      {formatCurrency(goldWallet.withdrawableGold, 'gold')}
                    </span>
                  </div>
                  
                  <div className="multi-wallet-balance__gold-item">
                    <span className="multi-wallet-balance__gold-label">Suspended:</span>
                    <span className="multi-wallet-balance__gold-amount suspended">
                      {formatCurrency(goldWallet.suspendedGold, 'gold')}
                    </span>
                  </div>
                </div>

                {goldWallet.suspendedDeposits.length > 0 && (
                  <div className="multi-wallet-balance__suspended-info">
                    <h5>Suspended Deposits:</h5>
                    {goldWallet.suspendedDeposits.map(deposit => (
                      <div key={deposit.id} className="multi-wallet-balance__deposit">
                        <span>{formatCurrency(deposit.amount, 'gold')}</span>
                        <span className="multi-wallet-balance__deposit-status">
                          {deposit.status === 'suspended' 
                            ? getTimeUntilWithdrawable(new Date(deposit.withdrawableAt))
                            : 'Available'
                          }
                        </span>
                      </div>
                    ))}
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