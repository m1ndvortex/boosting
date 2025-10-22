// Deposit form component

import React, { useState } from 'react';
import type { Currency } from '../../types';
import { WalletService } from '../../services/walletService';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import './DepositForm.css';

interface DepositFormProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, currency: Currency, paymentMethod: string) => Promise<void>;
}

export const DepositForm: React.FC<DepositFormProps> = ({
  isOpen,
  onClose,
  onDeposit,
}) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('usd');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = WalletService.getPaymentMethodsForCurrency(currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setPaymentMethod(''); // Reset payment method when currency changes
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
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
      await onDeposit(numAmount, currency, paymentMethod);
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

  const getCurrencySymbol = (curr: Currency): string => {
    switch (curr) {
      case 'gold': return 'G';
      case 'usd': return '$';
      case 'toman': return '﷼';
      default: return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Deposit Funds">
      <form onSubmit={handleSubmit} className="deposit-form">
        {error && (
          <div className="deposit-form__error">
            {error}
          </div>
        )}

        <div className="deposit-form__field">
          <label className="deposit-form__label">Currency</label>
          <div className="deposit-form__currency-tabs">
            <button
              type="button"
              className={`deposit-form__currency-tab ${currency === 'gold' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('gold')}
            >
              🪙 Gold (G)
            </button>
            <button
              type="button"
              className={`deposit-form__currency-tab ${currency === 'usd' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('usd')}
            >
              💵 USD ($)
            </button>
            <button
              type="button"
              className={`deposit-form__currency-tab ${currency === 'toman' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('toman')}
            >
              ﷼ Toman (﷼)
            </button>
          </div>
        </div>

        <div className="deposit-form__field">
          <label htmlFor="amount" className="deposit-form__label">
            Amount ({getCurrencySymbol(currency)})
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount in ${currency.toUpperCase()}`}
            className="deposit-form__input"
            min="0"
            step={currency === 'usd' ? '0.01' : '1'}
            disabled={loading}
          />
        </div>

        <div className="deposit-form__field">
          <label className="deposit-form__label">Payment Method</label>
          <div className="deposit-form__payment-methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`deposit-form__payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
                disabled={loading}
              >
                <span className="deposit-form__payment-icon">{method.icon}</span>
                <span className="deposit-form__payment-name">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod && (
          <div className="deposit-form__info">
            <div className="deposit-form__info-icon">ℹ️</div>
            <div className="deposit-form__info-text">
              Deposits are processed instantly. You will be redirected to the payment gateway to complete your transaction.
            </div>
          </div>
        )}

        <div className="deposit-form__actions">
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
            disabled={!amount || !paymentMethod}
          >
            {loading ? 'Processing...' : `Deposit ${getCurrencySymbol(currency)}${amount || '0'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};