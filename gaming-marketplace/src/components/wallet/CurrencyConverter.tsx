// Currency converter component

import React, { useState, useEffect } from 'react';
import type { Currency, Wallet } from '../../types';
import { WalletService } from '../../services/walletService';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import './CurrencyConverter.css';

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (fromCurrency: Currency, toCurrency: Currency, amount: number) => Promise<void>;
  wallet: Wallet;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  isOpen,
  onClose,
  onConvert,
  wallet,
}) => {
  const [fromCurrency, setFromCurrency] = useState<Currency>('usd');
  const [toCurrency, setToCurrency] = useState<Currency>('gold');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencies: { value: Currency; label: string; symbol: string; icon: string }[] = [
    { value: 'gold', label: 'Gold', symbol: 'G', icon: '🪙' },
    { value: 'usd', label: 'USD', symbol: '$', icon: '💵' },
    { value: 'toman', label: 'Toman', symbol: '﷼', icon: '﷼' },
  ];

  const exchangeRate = WalletService.getExchangeRate(fromCurrency, toCurrency);
  const availableBalance = wallet.balances[fromCurrency];

  // Calculate conversion when amount or currencies change
  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const amount = parseFloat(fromAmount);
      const converted = amount * exchangeRate;
      setToAmount(converted.toFixed(toCurrency === 'usd' ? 2 : 0));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromCurrency, toCurrency, exchangeRate]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setError('');
  };

  const handleSwapCurrencies = () => {
    const tempFrom = fromCurrency;
    const tempFromAmount = fromAmount;
    
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    setFromAmount(toAmount);
    setToAmount(tempFromAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAmount) {
      setError('Please enter an amount to convert');
      return;
    }

    const numAmount = parseFloat(fromAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    if (fromCurrency === toCurrency) {
      setError('Please select different currencies');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConvert(fromCurrency, toCurrency, numAmount);
      setFromAmount('');
      setToAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFromAmount('');
      setToAmount('');
      setError('');
      onClose();
    }
  };

  const formatBalance = (balance: number, currency: Currency): string => {
    switch (currency) {
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
    setFromAmount(availableBalance.toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Convert Currency">
      <form onSubmit={handleSubmit} className="currency-converter">
        {error && (
          <div className="currency-converter__error">
            {error}
          </div>
        )}

        <div className="currency-converter__section">
          <div className="currency-converter__field">
            <label className="currency-converter__label">From</label>
            <div className="currency-converter__input-group">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
                className="currency-converter__select"
                disabled={loading}
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.icon} {currency.label} ({currency.symbol})
                  </option>
                ))}
              </select>
              <div className="currency-converter__amount-input">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0"
                  className="currency-converter__input"
                  min="0"
                  step={fromCurrency === 'usd' ? '0.01' : '1'}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="currency-converter__max-button"
                  onClick={setMaxAmount}
                  disabled={loading || availableBalance === 0}
                >
                  Max
                </button>
              </div>
            </div>
            <div className="currency-converter__balance">
              Available: {formatBalance(availableBalance, fromCurrency)}
            </div>
          </div>

          <div className="currency-converter__swap">
            <button
              type="button"
              className="currency-converter__swap-button"
              onClick={handleSwapCurrencies}
              disabled={loading}
              title="Swap currencies"
            >
              ⇅
            </button>
          </div>

          <div className="currency-converter__field">
            <label className="currency-converter__label">To</label>
            <div className="currency-converter__input-group">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as Currency)}
                className="currency-converter__select"
                disabled={loading}
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.icon} {currency.label} ({currency.symbol})
                  </option>
                ))}
              </select>
              <div className="currency-converter__amount-display">
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0"
                  className="currency-converter__input readonly"
                />
              </div>
            </div>
            <div className="currency-converter__balance">
              Current: {formatBalance(wallet.balances[toCurrency], toCurrency)}
            </div>
          </div>
        </div>

        {exchangeRate > 0 && fromCurrency !== toCurrency && (
          <div className="currency-converter__rate">
            <div className="currency-converter__rate-icon">📊</div>
            <div className="currency-converter__rate-text">
              Exchange Rate: 1 {currencies.find(c => c.value === fromCurrency)?.symbol} = {exchangeRate.toLocaleString()} {currencies.find(c => c.value === toCurrency)?.symbol}
            </div>
          </div>
        )}

        <div className="currency-converter__actions">
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
            disabled={!fromAmount || !toAmount || fromCurrency === toCurrency || availableBalance === 0}
          >
            {loading ? 'Converting...' : 'Convert Currency'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};