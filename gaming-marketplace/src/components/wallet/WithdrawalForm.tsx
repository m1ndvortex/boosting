// Withdrawal form component

import React, { useState } from 'react';
import type { Currency, Wallet, BankInformation } from '../../types';
import { WalletService } from '../../services/walletService';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import './WithdrawalForm.css';

interface WithdrawalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (
    amount: number,
    currency: Currency,
    paymentMethod: string,
    bankInfo?: BankInformation,
    notes?: string
  ) => Promise<void>;
  wallet: Wallet;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  isOpen,
  onClose,
  onWithdraw,
  wallet,
}) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('usd');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Bank information state
  const [bankInfo, setBankInfo] = useState<BankInformation>({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    cardNumber: '',
    iban: '',
    swiftCode: '',
    additionalInfo: '',
  });

  const paymentMethods = WalletService.getPaymentMethodsForCurrency(currency);
  const availableBalance = wallet.balances[currency];

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setPaymentMethod(''); // Reset payment method when currency changes
    setError('');
    setAmount(''); // Reset amount to avoid confusion
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate bank information for non-crypto withdrawals
    if (paymentMethod !== 'crypto' && paymentMethod !== 'ingame_transfer') {
      if (!bankInfo.bankName || !bankInfo.accountHolderName || !bankInfo.accountNumber) {
        setError('Please provide complete bank information');
        return;
      }
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onWithdraw(numAmount, currency, paymentMethod, bankInfo, requestNotes);
      // Reset form
      setAmount('');
      setPaymentMethod('');
      setRequestNotes('');
      setBankInfo({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        cardNumber: '',
        iban: '',
        swiftCode: '',
        additionalInfo: '',
      });
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
      setRequestNotes('');
      setBankInfo({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        cardNumber: '',
        iban: '',
        swiftCode: '',
        additionalInfo: '',
      });
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

  const formatBalance = (balance: number, curr: Currency): string => {
    switch (curr) {
      case 'gold':
        return `${balance.toLocaleString()} G`;
      case 'usd':
        return `$${balance.toFixed(2)}`;
      case 'toman':
        return `${balance.toLocaleString()} ﷼`;
      default:
        return balance.toString();
    }
  };

  const setMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Withdrawal">
      <form onSubmit={handleSubmit} className="withdrawal-form">
        {error && (
          <div className="withdrawal-form__error">
            {error}
          </div>
        )}

        <div className="withdrawal-form__field">
          <label className="withdrawal-form__label">Currency</label>
          <div className="withdrawal-form__currency-tabs">
            <button
              type="button"
              className={`withdrawal-form__currency-tab ${currency === 'gold' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('gold')}
            >
              <span>🪙 Gold (G)</span>
              <span className="withdrawal-form__balance">
                {formatBalance(wallet.balances.gold, 'gold')}
              </span>
            </button>
            <button
              type="button"
              className={`withdrawal-form__currency-tab ${currency === 'usd' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('usd')}
            >
              <span>💵 USD ($)</span>
              <span className="withdrawal-form__balance">
                {formatBalance(wallet.balances.usd, 'usd')}
              </span>
            </button>
            <button
              type="button"
              className={`withdrawal-form__currency-tab ${currency === 'toman' ? 'active' : ''}`}
              onClick={() => handleCurrencyChange('toman')}
            >
              <span>﷼ Toman (﷼)</span>
              <span className="withdrawal-form__balance">
                {formatBalance(wallet.balances.toman, 'toman')}
              </span>
            </button>
          </div>
        </div>

        <div className="withdrawal-form__field">
          <div className="withdrawal-form__amount-header">
            <label htmlFor="amount" className="withdrawal-form__label">
              Amount ({getCurrencySymbol(currency)})
            </label>
            <button
              type="button"
              className="withdrawal-form__max-button"
              onClick={setMaxAmount}
              disabled={loading || availableBalance === 0}
            >
              Max: {formatBalance(availableBalance, currency)}
            </button>
          </div>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount in ${currency.toUpperCase()}`}
            className="withdrawal-form__input"
            min="0"
            max={availableBalance}
            step={currency === 'usd' ? '0.01' : '1'}
            disabled={loading}
          />
        </div>

        <div className="withdrawal-form__field">
          <label className="withdrawal-form__label">Payment Method</label>
          <div className="withdrawal-form__payment-methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`withdrawal-form__payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
                disabled={loading}
              >
                <span className="withdrawal-form__payment-icon">{method.icon}</span>
                <span className="withdrawal-form__payment-name">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod && paymentMethod !== 'crypto' && paymentMethod !== 'ingame_transfer' && (
          <div className="withdrawal-form__bank-section">
            <h4 className="withdrawal-form__section-title">Bank Information</h4>
            <p className="withdrawal-form__section-description">
              Please provide your bank account details where you want to receive the payment
            </p>
            
            <div className="withdrawal-form__bank-grid">
              <div className="withdrawal-form__field">
                <label htmlFor="bankName" className="withdrawal-form__label">
                  Bank Name <span className="withdrawal-form__required">*</span>
                </label>
                <input
                  type="text"
                  id="bankName"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                  placeholder="e.g., Bank of America, Chase, Wells Fargo"
                  className="withdrawal-form__input"
                  disabled={loading}
                  required
                />
              </div>

              <div className="withdrawal-form__field">
                <label htmlFor="accountHolderName" className="withdrawal-form__label">
                  Account Holder Name <span className="withdrawal-form__required">*</span>
                </label>
                <input
                  type="text"
                  id="accountHolderName"
                  value={bankInfo.accountHolderName}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountHolderName: e.target.value })}
                  placeholder="Full name as per bank account"
                  className="withdrawal-form__input"
                  disabled={loading}
                  required
                />
              </div>

              <div className="withdrawal-form__field">
                <label htmlFor="accountNumber" className="withdrawal-form__label">
                  Account Number <span className="withdrawal-form__required">*</span>
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                  placeholder="Bank account number"
                  className="withdrawal-form__input"
                  disabled={loading}
                  required
                />
              </div>

              <div className="withdrawal-form__field">
                <label htmlFor="cardNumber" className="withdrawal-form__label">
                  Card Number (Optional)
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={bankInfo.cardNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, cardNumber: e.target.value })}
                  placeholder="16-digit card number"
                  className="withdrawal-form__input"
                  disabled={loading}
                />
              </div>

              <div className="withdrawal-form__field">
                <label htmlFor="iban" className="withdrawal-form__label">
                  IBAN (Optional)
                </label>
                <input
                  type="text"
                  id="iban"
                  value={bankInfo.iban}
                  onChange={(e) => setBankInfo({ ...bankInfo, iban: e.target.value })}
                  placeholder="International Bank Account Number"
                  className="withdrawal-form__input"
                  disabled={loading}
                />
              </div>

              <div className="withdrawal-form__field">
                <label htmlFor="swiftCode" className="withdrawal-form__label">
                  SWIFT/BIC Code (Optional)
                </label>
                <input
                  type="text"
                  id="swiftCode"
                  value={bankInfo.swiftCode}
                  onChange={(e) => setBankInfo({ ...bankInfo, swiftCode: e.target.value })}
                  placeholder="Bank identifier code"
                  className="withdrawal-form__input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="withdrawal-form__field">
              <label htmlFor="additionalInfo" className="withdrawal-form__label">
                Additional Information (Optional)
              </label>
              <textarea
                id="additionalInfo"
                value={bankInfo.additionalInfo}
                onChange={(e) => setBankInfo({ ...bankInfo, additionalInfo: e.target.value })}
                placeholder="Any additional information for the transfer"
                className="withdrawal-form__textarea"
                rows={2}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="withdrawal-form__field">
          <label htmlFor="requestNotes" className="withdrawal-form__label">
            Request Notes (Optional)
          </label>
          <textarea
            id="requestNotes"
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            placeholder="Add any notes or special instructions for your withdrawal request"
            className="withdrawal-form__textarea"
            rows={3}
            disabled={loading}
          />
        </div>

        {paymentMethod && (
          <div className="withdrawal-form__info">
            <div className="withdrawal-form__info-icon">⚠️</div>
            <div className="withdrawal-form__info-text">
              Withdrawal requests require admin approval. You will be notified once your request is processed. Processing time is typically 1-3 business days.
            </div>
          </div>
        )}

        <div className="withdrawal-form__actions">
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
            disabled={!amount || !paymentMethod || availableBalance === 0}
          >
            {loading ? 'Processing...' : `Request Withdrawal`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};