// Wallet actions component

import React, { useState } from 'react';
import { Button } from '../discord/Button';
import { MultiWalletDepositForm } from './MultiWalletDepositForm';
import { MultiWalletWithdrawalForm } from './MultiWalletWithdrawalForm';
import { MultiWalletConverter } from './MultiWalletConverter';
import { MultiWalletTransactionHistory } from './MultiWalletTransactionHistory';
import type { MultiWallet, GameRealm } from '../../types';
import './WalletActions.css';

interface WalletActionsProps {
  // Legacy props for backward compatibility
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onConvert?: () => void;
  disabled?: boolean;
  
  // Multi-wallet props
  multiWallet?: MultiWallet;
  availableRealms?: GameRealm[];

  onMultiWalletDeposit?: (walletType: 'static' | 'gold', walletId: string, amount: number, paymentMethod: string) => Promise<void>;
  onMultiWalletWithdraw?: (walletType: 'static' | 'gold', walletId: string, amount: number, paymentMethod: string) => Promise<void>;
  onMultiWalletConvert?: (fromWalletType: 'static' | 'gold', fromWalletId: string, toWalletType: 'static' | 'gold', toWalletId: string, amount: number, goldType?: 'suspended' | 'withdrawable') => Promise<void>;
  onAddGoldWallet?: (realmId: string) => Promise<void>;
  onRemoveGoldWallet?: (realmId: string) => Promise<void>;
  loading?: boolean;
}

export const WalletActions: React.FC<WalletActionsProps> = ({
  // Legacy props
  onDeposit,
  onWithdraw,
  onConvert,
  disabled = false,
  
  // Multi-wallet props
  multiWallet,
  availableRealms = [],

  onMultiWalletDeposit,
  onMultiWalletWithdraw,
  onMultiWalletConvert,
  onAddGoldWallet: _onAddGoldWallet,
  onRemoveGoldWallet: _onRemoveGoldWallet,
  loading = false,
}) => {
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  const isMultiWalletMode = !!multiWallet;
  const isDisabled = disabled || loading;

  const handleDepositClick = () => {
    if (isMultiWalletMode) {
      setShowDepositForm(true);
    } else if (onDeposit) {
      onDeposit();
    }
  };

  const handleWithdrawClick = () => {
    if (isMultiWalletMode) {
      setShowWithdrawalForm(true);
    } else if (onWithdraw) {
      onWithdraw();
    }
  };

  const handleConvertClick = () => {
    if (isMultiWalletMode) {
      setShowConverter(true);
    } else if (onConvert) {
      onConvert();
    }
  };

  const handleTransactionHistoryClick = () => {
    setShowTransactionHistory(true);
  };

  return (
    <>
      <div className="wallet-actions">
        <div className="wallet-actions__header">
          <h3>Quick Actions</h3>
          <p>
            {isMultiWalletMode 
              ? 'Manage your multi-wallet system with deposits, withdrawals, conversions, and gold wallet management'
              : 'Manage your wallet with instant deposits, withdrawal requests, and currency conversions'
            }
          </p>
        </div>
        
        <div className="wallet-actions__buttons">
          <div className="wallet-actions__action">
            <Button
              variant="primary"
              onClick={handleDepositClick}
              disabled={isDisabled}
              className="wallet-actions__button"
            >
              <span className="wallet-actions__button-icon">💳</span>
              <div className="wallet-actions__button-content">
                <span className="wallet-actions__button-title">Deposit</span>
                <span className="wallet-actions__button-desc">
                  {isMultiWalletMode ? 'Add funds to any wallet' : 'Add funds instantly'}
                </span>
              </div>
            </Button>
          </div>
          
          <div className="wallet-actions__action">
            <Button
              variant="secondary"
              onClick={handleWithdrawClick}
              disabled={isDisabled}
              className="wallet-actions__button"
            >
              <span className="wallet-actions__button-icon">🏦</span>
              <div className="wallet-actions__button-content">
                <span className="wallet-actions__button-title">Withdraw</span>
                <span className="wallet-actions__button-desc">
                  {isMultiWalletMode ? 'Withdraw from any wallet' : 'Request withdrawal'}
                </span>
              </div>
            </Button>
          </div>
          
          <div className="wallet-actions__action">
            <Button
              variant="accent"
              onClick={handleConvertClick}
              disabled={isDisabled}
              className="wallet-actions__button"
            >
              <span className="wallet-actions__button-icon">🔄</span>
              <div className="wallet-actions__button-content">
                <span className="wallet-actions__button-title">Convert</span>
                <span className="wallet-actions__button-desc">
                  {isMultiWalletMode ? 'Convert between wallets' : 'Exchange currencies'}
                </span>
              </div>
            </Button>
          </div>

          {isMultiWalletMode && (
            <>
              <div className="wallet-actions__action">
                <Button
                  variant="secondary"
                  onClick={handleTransactionHistoryClick}
                  disabled={isDisabled}
                  className="wallet-actions__button"
                >
                  <span className="wallet-actions__button-icon">📊</span>
                  <div className="wallet-actions__button-content">
                    <span className="wallet-actions__button-title">History</span>
                    <span className="wallet-actions__button-desc">View wallet transactions</span>
                  </div>
                </Button>
              </div>

              {_onAddGoldWallet && (
                <div className="wallet-actions__action">
                  <Button
                    variant="accent"
                    onClick={() => {/* Gold wallet management is handled by GoldWalletManager component */}}
                    disabled={true}
                    className="wallet-actions__button wallet-actions__button--info"
                  >
                    <span className="wallet-actions__button-icon">🪙</span>
                    <div className="wallet-actions__button-content">
                      <span className="wallet-actions__button-title">Gold Wallets</span>
                      <span className="wallet-actions__button-desc">Managed above</span>
                    </div>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Multi-Wallet Forms */}
      {isMultiWalletMode && multiWallet && (
        <>
          <MultiWalletDepositForm
            isOpen={showDepositForm}
            onClose={() => setShowDepositForm(false)}
            multiWallet={multiWallet}
            availableRealms={availableRealms}
            onDeposit={onMultiWalletDeposit!}
          />

          <MultiWalletWithdrawalForm
            isOpen={showWithdrawalForm}
            onClose={() => setShowWithdrawalForm(false)}
            multiWallet={multiWallet}
            onWithdraw={onMultiWalletWithdraw!}
          />

          <MultiWalletConverter
            isOpen={showConverter}
            onClose={() => setShowConverter(false)}
            multiWallet={multiWallet}
            availableRealms={availableRealms}
            onConvert={onMultiWalletConvert!}
          />

          <MultiWalletTransactionHistory
            isOpen={showTransactionHistory}
            onClose={() => setShowTransactionHistory(false)}
            userId={multiWallet.userId}
            multiWallet={multiWallet}
          />
        </>
      )}
    </>
  );
};