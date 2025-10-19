import React, { useState } from 'react';
import type { GoldWalletBalance } from '../../types';
import './GoldWalletSelector.css';

interface GoldWalletSelectorProps {
  goldWallets: GoldWalletBalance[];
  selectedWalletId: string;
  selectedGoldType: 'suspended' | 'withdrawable';
  requiredAmount: number;
  onWalletChange: (walletId: string) => void;
  onGoldTypeChange: (goldType: 'suspended' | 'withdrawable') => void;
  className?: string;
}

export const GoldWalletSelector: React.FC<GoldWalletSelectorProps> = ({
  goldWallets,
  selectedWalletId,
  selectedGoldType,
  requiredAmount,
  onWalletChange,
  onGoldTypeChange,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const selectedWallet = goldWallets.find(wallet => wallet.realmId === selectedWalletId);
  
  const getAvailableBalance = (wallet: GoldWalletBalance, goldType: 'suspended' | 'withdrawable'): number => {
    return goldType === 'suspended' ? wallet.suspendedGold : wallet.withdrawableGold;
  };

  const hasInsufficientFunds = (wallet: GoldWalletBalance, goldType: 'suspended' | 'withdrawable'): boolean => {
    return getAvailableBalance(wallet, goldType) < requiredAmount;
  };

  const formatGoldAmount = (amount: number): string => {
    return `${amount.toLocaleString()}G`;
  };

  if (goldWallets.length === 0) {
    return (
      <div className={`gold-wallet-selector gold-wallet-selector--empty ${className}`}>
        <div className="gold-wallet-selector__empty-state">
          <span className="gold-wallet-selector__empty-icon">💰</span>
          <p className="gold-wallet-selector__empty-text">
            No gold wallets available. Add a gold wallet to pay with gold.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gold-wallet-selector ${className}`}>
      <div className="gold-wallet-selector__header">
        <h4 className="gold-wallet-selector__title">Select Gold Wallet</h4>
        <button
          type="button"
          className="gold-wallet-selector__toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="gold-wallet-selector__wallets">
        {goldWallets.map(wallet => {
          const isSelected = wallet.realmId === selectedWalletId;
          const withdrawableInsufficient = hasInsufficientFunds(wallet, 'withdrawable');
          const suspendedInsufficient = hasInsufficientFunds(wallet, 'suspended');
          const hasAnyFunds = wallet.withdrawableGold > 0 || wallet.suspendedGold > 0;

          return (
            <div
              key={wallet.realmId}
              className={`gold-wallet-selector__wallet ${
                isSelected ? 'gold-wallet-selector__wallet--selected' : ''
              } ${!hasAnyFunds ? 'gold-wallet-selector__wallet--empty' : ''}`}
            >
              <label className="gold-wallet-selector__wallet-label">
                <input
                  type="radio"
                  name="goldWallet"
                  value={wallet.realmId}
                  checked={isSelected}
                  onChange={(e) => onWalletChange(e.target.value)}
                  disabled={!hasAnyFunds}
                  className="gold-wallet-selector__wallet-input"
                />
                
                <div className="gold-wallet-selector__wallet-info">
                  <div className="gold-wallet-selector__wallet-header">
                    <span className="gold-wallet-selector__wallet-name">
                      {wallet.displayName || `${wallet.realmName} Gold`}
                    </span>
                    <span className="gold-wallet-selector__wallet-game">
                      {wallet.gameName}
                    </span>
                  </div>

                  <div className="gold-wallet-selector__wallet-balances">
                    <div className={`gold-wallet-selector__balance ${
                      withdrawableInsufficient ? 'gold-wallet-selector__balance--insufficient' : ''
                    }`}>
                      <span className="gold-wallet-selector__balance-label">Withdrawable:</span>
                      <span className="gold-wallet-selector__balance-amount">
                        {formatGoldAmount(wallet.withdrawableGold)}
                      </span>
                    </div>
                    
                    <div className={`gold-wallet-selector__balance ${
                      suspendedInsufficient ? 'gold-wallet-selector__balance--insufficient' : ''
                    }`}>
                      <span className="gold-wallet-selector__balance-label">Suspended:</span>
                      <span className="gold-wallet-selector__balance-amount">
                        {formatGoldAmount(wallet.suspendedGold)}
                      </span>
                    </div>
                  </div>

                  {showDetails && wallet.suspendedDeposits.length > 0 && (
                    <div className="gold-wallet-selector__deposits">
                      <h5 className="gold-wallet-selector__deposits-title">Suspended Deposits</h5>
                      {wallet.suspendedDeposits.slice(0, 3).map(deposit => (
                        <div key={deposit.id} className="gold-wallet-selector__deposit">
                          <span className="gold-wallet-selector__deposit-amount">
                            {formatGoldAmount(deposit.amount)}
                          </span>
                          <span className="gold-wallet-selector__deposit-date">
                            Available: {new Date(deposit.withdrawableAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {wallet.suspendedDeposits.length > 3 && (
                        <div className="gold-wallet-selector__deposit-more">
                          +{wallet.suspendedDeposits.length - 3} more deposits
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {selectedWallet && (
        <div className="gold-wallet-selector__gold-type">
          <h5 className="gold-wallet-selector__gold-type-title">Gold Type</h5>
          <div className="gold-wallet-selector__gold-type-options">
            <label className={`gold-wallet-selector__gold-type-option ${
              selectedGoldType === 'withdrawable' ? 'gold-wallet-selector__gold-type-option--selected' : ''
            } ${hasInsufficientFunds(selectedWallet, 'withdrawable') ? 'gold-wallet-selector__gold-type-option--insufficient' : ''}`}>
              <input
                type="radio"
                name="goldType"
                value="withdrawable"
                checked={selectedGoldType === 'withdrawable'}
                onChange={(e) => onGoldTypeChange(e.target.value as 'suspended' | 'withdrawable')}
                disabled={hasInsufficientFunds(selectedWallet, 'withdrawable')}
                className="gold-wallet-selector__gold-type-input"
              />
              <div className="gold-wallet-selector__gold-type-info">
                <span className="gold-wallet-selector__gold-type-label">Use Withdrawable Gold</span>
                <span className="gold-wallet-selector__gold-type-balance">
                  {formatGoldAmount(selectedWallet.withdrawableGold)} available
                </span>
                {hasInsufficientFunds(selectedWallet, 'withdrawable') && (
                  <span className="gold-wallet-selector__insufficient-notice">
                    Insufficient funds (need {formatGoldAmount(requiredAmount)})
                  </span>
                )}
              </div>
            </label>

            <label className={`gold-wallet-selector__gold-type-option ${
              selectedGoldType === 'suspended' ? 'gold-wallet-selector__gold-type-option--selected' : ''
            } ${hasInsufficientFunds(selectedWallet, 'suspended') ? 'gold-wallet-selector__gold-type-option--insufficient' : ''}`}>
              <input
                type="radio"
                name="goldType"
                value="suspended"
                checked={selectedGoldType === 'suspended'}
                onChange={(e) => onGoldTypeChange(e.target.value as 'suspended' | 'withdrawable')}
                disabled={hasInsufficientFunds(selectedWallet, 'suspended')}
                className="gold-wallet-selector__gold-type-input"
              />
              <div className="gold-wallet-selector__gold-type-info">
                <span className="gold-wallet-selector__gold-type-label">Use Suspended Gold</span>
                <span className="gold-wallet-selector__gold-type-balance">
                  {formatGoldAmount(selectedWallet.suspendedGold)} available
                </span>
                {hasInsufficientFunds(selectedWallet, 'suspended') && (
                  <span className="gold-wallet-selector__insufficient-notice">
                    Insufficient funds (need {formatGoldAmount(requiredAmount)})
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};