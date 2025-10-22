// Multi-Wallet Deposit Form Component

import React, { useState } from 'react';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import { WalletService } from '../../services/walletService';
import type { MultiWallet, GameRealm } from '../../types';
import './MultiWalletDepositForm.css';

interface MultiWalletDepositFormProps {
  isOpen: boolean;
  onClose: () => void;
  multiWallet: MultiWallet;
  availableRealms: GameRealm[];
  onDeposit: (walletType: 'static' | 'gold', walletId: string, amount: number, paymentMethod: string) => Promise<void>;
}

export const MultiWalletDepositForm: React.FC<MultiWalletDepositFormProps> = ({
  isOpen,
  onClose,
  multiWallet,
  availableRealms: _availableRealms,
  onDeposit,
}) => {
  const [walletType, setWalletType] = useState<'static' | 'gold'>('static');
  const [walletId, setWalletId] = useState<string>('usd');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available wallets based on type
  const getAvailableWallets = () => {
    if (walletType === 'static') {
      return [
        { id: 'usd', name: 'USD Wallet', symbol: '$', icon: '💵' },
        { id: 'toman', name: 'Toman Wallet', symbol: '﷼', icon: '﷼' },
      ];
    } else {
      return Object.values(multiWallet.goldWallets).map(goldWallet => ({
        id: goldWallet.realmId,
        name: goldWallet.realmName + ' Gold',
        symbol: 'G',
        icon: '🪙',
        gameName: goldWallet.gameName,
      }));
    }
  };

  const getCurrentCurrency = () => {
    if (walletType === 'static') {
      return walletId as 'usd' | 'toman';
    }
    return 'gold';
  };

  const paymentMethods = WalletService.getPaymentMethodsForCurrency(getCurrentCurrency());

  const handleWalletTypeChange = (newType: 'static' | 'gold') => {
    setWalletType(newType);
    setWalletId(newType === 'static' ? 'usd' : Object.keys(multiWallet.goldWallets)[0] || '');
    setPaymentMethod('');
    setError('');
  };

  const handleWalletChange = (newWalletId: string) => {
    setWalletId(newWalletId);
    setPaymentMethod('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod || !walletId) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onDeposit(walletType, walletId, numAmount, paymentMethod);
      setAmount('');
      setPaymentMethod('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setPaymentMethod('');
      setError('');
      onClose();
    }
  };

  const getCurrencySymbol = (): string => {
    if (walletType === 'static') {
      return walletId === 'usd' ? '$' : '﷼';
    }
    return 'G';
  };

  const availableWallets = getAvailableWallets();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Deposit to Multi-Wallet">
      <form onSubmit={handleSubmit} className="multi-wallet-deposit-form">
        {error && (
          <div className="multi-wallet-deposit-form__error">
            {error}
          </div>
        )}

        <div className="multi-wallet-deposit-form__field">
          <label className="multi-wallet-deposit-form__label">Wallet Type</label>
          <div className="multi-wallet-deposit-form__wallet-type-tabs">
            <button
              type="button"
              className={`multi-wallet-deposit-form__wallet-type-tab ${walletType === 'static' ? 'active' : ''}`}
              onClick={() => handleWalletTypeChange('static')}
            >
              💰 Static Wallets
            </button>
            <button
              type="button"
              className={`multi-wallet-deposit-form__wallet-type-tab ${walletType === 'gold' ? 'active' : ''}`}
              onClick={() => handleWalletTypeChange('gold')}
              disabled={Object.keys(multiWallet.goldWallets).length === 0}
            >
              🪙 Gold Wallets
            </button>
          </div>
        </div>

        <div className="multi-wallet-deposit-form__field">
          <label className="multi-wallet-deposit-form__label">Select Wallet</label>
          <div className="multi-wallet-deposit-form__wallet-selection">
            {availableWallets.length === 0 ? (
              <div className="multi-wallet-deposit-form__no-wallets">
                {walletType === 'gold' ? 'No gold wallets available. Add one first.' : 'No wallets available.'}
              </div>
            ) : (
              availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  className={`multi-wallet-deposit-form__wallet-option ${walletId === wallet.id ? 'active' : ''}`}
                  onClick={() => handleWalletChange(wallet.id)}
                  disabled={loading}
                >
                  <span className="multi-wallet-deposit-form__wallet-icon">{wallet.icon}</span>
                  <div className="multi-wallet-deposit-form__wallet-info">
                    <span className="multi-wallet-deposit-form__wallet-name">{wallet.name}</span>
                    {'gameName' in wallet && (
                      <span className="multi-wallet-deposit-form__wallet-game">{wallet.gameName}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {walletId && (
          <>
            <div className="multi-wallet-deposit-form__field">
              <label htmlFor="amount" className="multi-wallet-deposit-form__label">
                Amount ({getCurrencySymbol()})
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount`}
                className="multi-wallet-deposit-form__input"
                min="0"
                step={walletType === 'static' && walletId === 'usd' ? '0.01' : '1'}
                disabled={loading}
              />
            </div>

            <div className="multi-wallet-deposit-form__field">
              <label className="multi-wallet-deposit-form__label">Payment Method</label>
              <div className="multi-wallet-deposit-form__payment-methods">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`multi-wallet-deposit-form__payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                    disabled={loading}
                  >
                    <span className="multi-wallet-deposit-form__payment-icon">{method.icon}</span>
                    <span className="multi-wallet-deposit-form__payment-name">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod && (
              <div className="multi-wallet-deposit-form__info">
                <div className="multi-wallet-deposit-form__info-icon">ℹ️</div>
                <div className="multi-wallet-deposit-form__info-text">
                  Deposits are processed instantly. You will be redirected to the payment gateway to complete your transaction.
                </div>
              </div>
            )}
          </>
        )}

        <div className="multi-wallet-deposit-form__actions">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!amount || !paymentMethod || !walletId || availableWallets.length === 0}
          >
            {loading ? 'Processing...' : `Deposit ${getCurrencySymbol()}${amount || '0'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};