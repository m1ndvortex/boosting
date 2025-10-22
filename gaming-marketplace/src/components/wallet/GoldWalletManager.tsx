// Gold Wallet Manager Component - Dedicated interface for managing gold wallets

import React, { useState } from 'react';
import type { GameRealm, MultiWallet } from '../../types';
import './GoldWalletManager.css';

interface GoldWalletManagerProps {
  availableRealms: GameRealm[];
  userWallet: MultiWallet;
  onAddWallet: (realmId: string) => void;
  onRemoveWallet: (realmId: string) => void;
  loading?: boolean;
}

export const GoldWalletManager: React.FC<GoldWalletManagerProps> = ({
  availableRealms,
  userWallet,
  onAddWallet,
  onRemoveWallet,
  loading = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState('');
  const [confirmRemoval, setConfirmRemoval] = useState<string | null>(null);

  // Filter available realms to exclude already added ones
  const availableRealmsForAdd = availableRealms.filter(
    realm => !userWallet.goldWallets[realm.id]
  );

  // Group realms by game for better organization
  const realmsByGame = availableRealmsForAdd.reduce((acc, realm) => {
    if (!acc[realm.gameName]) {
      acc[realm.gameName] = [];
    }
    acc[realm.gameName].push(realm);
    return acc;
  }, {} as Record<string, GameRealm[]>);

  const handleAddWallet = () => {
    if (selectedRealm && !loading) {
      // Check for duplicate wallet (additional safety check)
      if (userWallet.goldWallets[selectedRealm]) {
        alert('This wallet already exists!');
        return;
      }

      onAddWallet(selectedRealm);
      setSelectedRealm('');
      setShowAddForm(false);
    }
  };

  const handleRemoveWallet = (realmId: string) => {
    if (loading) return;

    const goldWallet = userWallet.goldWallets[realmId];
    if (!goldWallet) return;

    // If wallet has balance, require confirmation
    if (goldWallet.totalGold > 0) {
      if (confirmRemoval === realmId) {
        // User has confirmed, proceed with removal
        onRemoveWallet(realmId);
        setConfirmRemoval(null);
      } else {
        // Show confirmation
        setConfirmRemoval(realmId);
      }
    } else {
      // No balance, remove immediately
      onRemoveWallet(realmId);
    }
  };

  const cancelRemoval = () => {
    setConfirmRemoval(null);
  };

  const formatGoldAmount = (amount: number): string => {
    return `${amount.toLocaleString()} G`;
  };

  const getGameIcon = (gameName: string): string => {
    const gameIcons: Record<string, string> = {
      'World of Warcraft': '⚔️',
      'Final Fantasy XIV': '🗡️',
      'Guild Wars 2': '🛡️',
      'Multi-Game': '🎮'
    };
    return gameIcons[gameName] || '🎮';
  };

  if (loading) {
    return (
      <div className="gold-wallet-manager" data-testid="gold-wallet-manager">
        <div className="gold-wallet-manager__header">
          <h3>Gold Wallet Manager</h3>
          <div className="gold-wallet-manager__loading">Loading...</div>
        </div>
        <div className="gold-wallet-manager__skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="gold-wallet-manager" data-testid="gold-wallet-manager">
      <div className="gold-wallet-manager__header">
        <div className="gold-wallet-manager__title">
          <h3>
            <span className="gold-wallet-manager__icon">🎮</span>
            Gold Wallet Manager
          </h3>
          <p className="gold-wallet-manager__subtitle">
            Add and manage game-specific gold wallets
          </p>
        </div>
        
        {availableRealmsForAdd.length > 0 && (
          <button 
            className="gold-wallet-manager__add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading}
          >
            <span className="gold-wallet-manager__add-icon">+</span>
            Add Gold Wallet
          </button>
        )}
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <div className="gold-wallet-manager__add-form">
          <div className="gold-wallet-manager__form-header">
            <h4>Add New Gold Wallet</h4>
            <p>Select a game realm to create a new gold wallet</p>
          </div>
          
          <div className="gold-wallet-manager__form-content">
            <select 
              value={selectedRealm} 
              onChange={(e) => setSelectedRealm(e.target.value)}
              className="gold-wallet-manager__realm-select"
              disabled={loading}
            >
              <option value="">Select a game realm...</option>
              {Object.entries(realmsByGame).map(([gameName, realms]) => (
                <optgroup key={gameName} label={gameName}>
                  {realms.map(realm => (
                    <option key={realm.id} value={realm.id}>
                      {realm.realmName} ({realm.gameName})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            
            <div className="gold-wallet-manager__form-actions">
              <button 
                onClick={handleAddWallet}
                disabled={!selectedRealm || loading}
                className="gold-wallet-manager__confirm-btn"
              >
                Add Wallet
              </button>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedRealm('');
                }}
                className="gold-wallet-manager__cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Gold Wallets */}
      <div className="gold-wallet-manager__wallets">
        {Object.values(userWallet.goldWallets).length === 0 ? (
          <div className="gold-wallet-manager__empty">
            <div className="gold-wallet-manager__empty-icon">🎮</div>
            <h4>No Gold Wallets Yet</h4>
            <p>Add game-specific gold wallets to manage your in-game currencies</p>
            {availableRealmsForAdd.length === 0 && (
              <p className="gold-wallet-manager__no-realms">
                No additional realms available. Contact an admin to add more games and realms.
              </p>
            )}
          </div>
        ) : (
          <div className="gold-wallet-manager__wallet-grid">
            {Object.values(userWallet.goldWallets).map(goldWallet => (
              <div 
                key={goldWallet.realmId} 
                className={`gold-wallet-manager__wallet ${confirmRemoval === goldWallet.realmId ? 'confirming-removal' : ''}`}
                data-testid={`gold-wallet-${goldWallet.realmId}`}
              >
                <div className="gold-wallet-manager__wallet-header">
                  <div className="gold-wallet-manager__wallet-icon">
                    {getGameIcon(goldWallet.gameName)}
                  </div>
                  <div className="gold-wallet-manager__wallet-info">
                    <div className="gold-wallet-manager__wallet-name">
                      {goldWallet.realmName} Gold
                    </div>
                    <div className="gold-wallet-manager__wallet-game">
                      {goldWallet.gameName} • {goldWallet.realmName}
                    </div>
                  </div>
                  
                  {confirmRemoval === goldWallet.realmId ? (
                    <div className="gold-wallet-manager__confirm-actions">
                      <button 
                        className="gold-wallet-manager__confirm-remove-btn"
                        onClick={() => handleRemoveWallet(goldWallet.realmId)}
                        disabled={loading}
                        title="Confirm removal"
                      >
                        ✓
                      </button>
                      <button 
                        className="gold-wallet-manager__cancel-remove-btn"
                        onClick={cancelRemoval}
                        disabled={loading}
                        title="Cancel removal"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="gold-wallet-manager__remove-btn"
                      onClick={() => handleRemoveWallet(goldWallet.realmId)}
                      disabled={loading}
                      title="Remove wallet"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="gold-wallet-manager__wallet-balance">
                  <div className="gold-wallet-manager__balance-item primary">
                    <span className="gold-wallet-manager__balance-label">
                      <span className="gold-wallet-manager__balance-icon">💰</span>
                      Total Gold
                    </span>
                    <span className="gold-wallet-manager__balance-amount total">
                      {formatGoldAmount(goldWallet.totalGold)}
                    </span>
                  </div>
                  
                  <div className="gold-wallet-manager__balance-breakdown">
                    <div className="gold-wallet-manager__balance-item">
                      <span className="gold-wallet-manager__balance-label">
                        <span className="gold-wallet-manager__balance-icon">✅</span>
                        Withdrawable
                      </span>
                      <span className="gold-wallet-manager__balance-amount withdrawable">
                        {formatGoldAmount(goldWallet.withdrawableGold)}
                      </span>
                    </div>
                    
                    <div className="gold-wallet-manager__balance-item">
                      <span className="gold-wallet-manager__balance-label">
                        <span className="gold-wallet-manager__balance-icon">⏳</span>
                        Suspended
                      </span>
                      <span className="gold-wallet-manager__balance-amount suspended">
                        {formatGoldAmount(goldWallet.suspendedGold)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirmation message for removal */}
                {confirmRemoval === goldWallet.realmId && goldWallet.totalGold > 0 && (
                  <div className="gold-wallet-manager__removal-warning">
                    <div className="gold-wallet-manager__warning-icon">⚠️</div>
                    <div className="gold-wallet-manager__warning-text">
                      <strong>Warning:</strong> This wallet contains {formatGoldAmount(goldWallet.totalGold)}. 
                      Removing it will permanently delete this balance. Are you sure?
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {Object.values(userWallet.goldWallets).length > 0 && (
        <div className="gold-wallet-manager__summary">
          <div className="gold-wallet-manager__summary-header">
            <h4>Gold Wallet Summary</h4>
          </div>
          <div className="gold-wallet-manager__summary-stats">
            <div className="gold-wallet-manager__stat">
              <span className="gold-wallet-manager__stat-label">Total Wallets</span>
              <span className="gold-wallet-manager__stat-value">
                {Object.values(userWallet.goldWallets).length}
              </span>
            </div>
            <div className="gold-wallet-manager__stat">
              <span className="gold-wallet-manager__stat-label">Total Gold</span>
              <span className="gold-wallet-manager__stat-value">
                {formatGoldAmount(
                  Object.values(userWallet.goldWallets).reduce(
                    (total, wallet) => total + wallet.totalGold, 
                    0
                  )
                )}
              </span>
            </div>
            <div className="gold-wallet-manager__stat">
              <span className="gold-wallet-manager__stat-label">Withdrawable</span>
              <span className="gold-wallet-manager__stat-value withdrawable">
                {formatGoldAmount(
                  Object.values(userWallet.goldWallets).reduce(
                    (total, wallet) => total + wallet.withdrawableGold, 
                    0
                  )
                )}
              </span>
            </div>
            <div className="gold-wallet-manager__stat">
              <span className="gold-wallet-manager__stat-label">Suspended</span>
              <span className="gold-wallet-manager__stat-value suspended">
                {formatGoldAmount(
                  Object.values(userWallet.goldWallets).reduce(
                    (total, wallet) => total + wallet.suspendedGold, 
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};