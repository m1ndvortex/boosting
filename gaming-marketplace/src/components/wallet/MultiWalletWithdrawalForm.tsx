// Multi-Wallet Withdrawal Form Component

import React, { useState } from 'react';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import { WalletService } from '../../services/walletService';
import type { MultiWallet } from '../../types';
import './MultiWalletWithdrawalForm.css';

interface MultiWalletWithdrawalFormProps {
  isOpen: boolean;
  onClose: () => void;
  multiWallet: MultiWallet;
  onWithdraw: (walletType: 'static' | 'gold', walletId: string, amount: number, paymentMethod: string) => Promise<void>;
}

export const MultiWalletWithdrawalForm: React.FC<MultiWalletWithdrawalFormProps> = ({
  isOpen,
  onClose,
  multiWallet,
  onWithdraw,
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
        { 
          id: 'usd', 
          name: 'USD Wallet', 
          symbol: '$', 
          icon: '💵',
          balance: multiWallet.staticWallets.usd.balance,
          withdrawableBalance: multiWallet.staticWallets.usd.balance
        },
        { 
          id: 'toman', 
          name: 'Toman Wallet', 
          symbol: '﷼', 
          icon: '﷼',
          balance: multiWallet.staticWallets.toman.balance,
          withdrawableBalance: multiWallet.staticWallets.toman.balance
        },
      ];
    } else {
      return Object.values(multiWallet.goldWallets).map(goldWallet => ({
        id: goldWallet.realmId,
        name: goldWallet.realmName + ' Gold',
        symbol: 'G',
        icon: '🪙',
        gameName: goldWallet.gameName,
        balance: goldWallet.totalGold,
        withdrawableBalance: goldWallet.withdrawableGold,
        suspendedBalance: goldWallet.suspendedGold
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
  const availableWallets = getAvailableWallets();
  const selectedWallet = availableWallets.find(w => w.id === walletId);
  const availableBalance = selectedWallet?.withdrawableBalance || 0;

  const handleWalletTypeChange = (newType: 'static' | 'gold') => {
    setWalletType(newType);
    const newWallets = newType === 'static' 
      ? [{ id: 'usd' }, { id: 'toman' }]
      : Object.keys(multiWallet.goldWallets).map(id => ({ id }));
    setWalletId(newWallets[0]?.id || '');
    setPaymentMethod('');
    setError('');
    setAmount('');
  };

  const handleWalletChange = (newWalletId: string) => {
    setWalletId(newWalletId);
    setPaymentMethod('');
    setError('');
    setAmount('');
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

    if (numAmount > availableBalance) {
      setError('Insufficient withdrawable balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onWithdraw(walletType, walletId, numAmount, paymentMethod);
      setAmount('');
      setPaymentMethod('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal request failed');
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

  const formatBalance = (balance: number): string => {
    if (walletType === 'static') {
      return walletId === 'usd' ? balance.toFixed(2) : balance.toLocaleString();
    }
    return balance.toLocaleString();
  };

  const setMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Withdraw from Multi-Wallet">
      <form onSubmit={handleSubmit} className="multi-wallet-withdrawal-form">
        {error && (
          <div className="multi-wallet-withdrawal-form__error">
            {error}
          </div>
        )}

        <div className="multi-wallet-withdrawal-form__field">
          <label className="multi-wallet-withdrawal-form__label">Wallet Type</label>
          <div className="multi-wallet-withdrawal-form__wallet-type-tabs">
            <button
              type="button"
              className={`multi-wallet-withdrawal-form__wallet-type-tab ${walletType === 'static' ? 'active' : ''}`}
              onClick={() => handleWalletTypeChange('static')}
            >
              💰 Static Wallets
            </button>
            <button
              type="button"
              className={`multi-wallet-withdrawal-form__wallet-type-tab ${walletType === 'gold' ? 'active' : ''}`}
              onClick={() => handleWalletTypeChange('gold')}
              disabled={Object.keys(multiWallet.goldWallets).length === 0}
            >
              🪙 Gold Wallets
            </button>
          </div>
        </div>

        <div className="multi-wallet-withdrawal-form__field">
          <label className="multi-wallet-withdrawal-form__label">Select Wallet</label>
          <div className="multi-wallet-withdrawal-form__wallet-selection">
            {availableWallets.length === 0 ? (
              <div className="multi-wallet-withdrawal-form__no-wallets">
                {walletType === 'gold' ? 'No gold wallets available. Add one first.' : 'No wallets available.'}
              </div>
            ) : (
              availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  className={`multi-wallet-withdrawal-form__wallet-option ${walletId === wallet.id ? 'active' : ''}`}
                  onClick={() => handleWalletChange(wallet.id)}
                  disabled={loading}
                >
                  <span className="multi-wallet-withdrawal-form__wallet-icon">{wallet.icon}</span>
                  <div className="multi-wallet-withdrawal-form__wallet-info">
                    <span className="multi-wallet-withdrawal-form__wallet-name">{wallet.name}</span>
                    {'gameName' in wallet && (
                      <span className="multi-wallet-withdrawal-form__wallet-game">{wallet.gameName}</span>
                    )}
                    <div className="multi-wallet-withdrawal-form__wallet-balances">
                      <span className="multi-wallet-withdrawal-form__withdrawable">
                        Withdrawable: {formatBalance(wallet.withdrawableBalance)} {wallet.symbol}
                      </span>
                      {walletType === 'gold' && 'suspendedBalance' in wallet && wallet.suspendedBalance > 0 && (
                        <span className="multi-wallet-withdrawal-form__suspended">
                          Suspended: {formatBalance(wallet.suspendedBalance)} {wallet.symbol}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {walletId && selectedWallet && (
          <>
            <div className="multi-wallet-withdrawal-form__field">
              <div className="multi-wallet-withdrawal-form__amount-header">
                <label htmlFor="amount" className="multi-wallet-withdrawal-form__label">
                  Amount ({getCurrencySymbol()})
                </label>
                <button
                  type="button"
                  className="multi-wallet-withdrawal-form__max-button"
                  onClick={setMaxAmount}
                  disabled={loading || availableBalance === 0}
                >
                  Max: {formatBalance(availableBalance)} {getCurrencySymbol()}
                </button>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount`}
                className="multi-wallet-withdrawal-form__input"
                min="0"
                max={availableBalance}
                step={walletType === 'static' && walletId === 'usd' ? '0.01' : '1'}
                disabled={loading}
              />
            </div>

            <div className="multi-wallet-withdrawal-form__field">
              <label className="multi-wallet-withdrawal-form__label">Payment Method</label>
              <div className="multi-wallet-withdrawal-form__payment-methods">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`multi-wallet-withdrawal-form__payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                    disabled={loading}
                  >
                    <span className="multi-wallet-withdrawal-form__payment-icon">{method.icon}</span>
                    <span className="multi-wallet-withdrawal-form__payment-name">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod && (
              <div className="multi-wallet-withdrawal-form__info">
                <div className="multi-wallet-withdrawal-form__info-icon">⚠️</div>
                <div className="multi-wallet-withdrawal-form__info-text">
                  Withdrawal requests require admin approval. You will be notified once your request is processed. 
                  Processing time is typically 1-3 business days.
                  {walletType === 'gold' && 'suspendedBalance' in selectedWallet && (selectedWallet.suspendedBalance as number) > 0 && (
                    <><br /><br />Note: Only withdrawable gold can be withdrawn directly. 
                    Suspended gold can be converted to USD/Toman with fees.</>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="multi-wallet-withdrawal-form__actions">
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
            disabled={!amount || !paymentMethod || !walletId || availableBalance === 0}
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};