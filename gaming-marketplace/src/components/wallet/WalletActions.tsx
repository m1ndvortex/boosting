// Wallet actions component

import React from 'react';
import { Button } from '../discord/Button';
import './WalletActions.css';

interface WalletActionsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onConvert: () => void;
  disabled?: boolean;
}

export const WalletActions: React.FC<WalletActionsProps> = ({
  onDeposit,
  onWithdraw,
  onConvert,
  disabled = false,
}) => {
  return (
    <div className="wallet-actions">
      <div className="wallet-actions__header">
        <h3>Quick Actions</h3>
        <p>Manage your wallet with instant deposits, withdrawal requests, and currency conversions</p>
      </div>
      
      <div className="wallet-actions__buttons">
        <div className="wallet-actions__action">
          <Button
            variant="primary"
            onClick={onDeposit}
            disabled={disabled}
            className="wallet-actions__button"
          >
            <span className="wallet-actions__button-icon">💳</span>
            <div className="wallet-actions__button-content">
              <span className="wallet-actions__button-title">Deposit</span>
              <span className="wallet-actions__button-desc">Add funds instantly</span>
            </div>
          </Button>
        </div>
        
        <div className="wallet-actions__action">
          <Button
            variant="secondary"
            onClick={onWithdraw}
            disabled={disabled}
            className="wallet-actions__button"
          >
            <span className="wallet-actions__button-icon">🏦</span>
            <div className="wallet-actions__button-content">
              <span className="wallet-actions__button-title">Withdraw</span>
              <span className="wallet-actions__button-desc">Request withdrawal</span>
            </div>
          </Button>
        </div>
        
        <div className="wallet-actions__action">
          <Button
            variant="accent"
            onClick={onConvert}
            disabled={disabled}
            className="wallet-actions__button"
          >
            <span className="wallet-actions__button-icon">🔄</span>
            <div className="wallet-actions__button-content">
              <span className="wallet-actions__button-title">Convert</span>
              <span className="wallet-actions__button-desc">Exchange currencies</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};