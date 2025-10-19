// Multi-Wallet Converter Component

import React, { useState, useEffect } from 'react';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import { WalletService } from '../../services/walletService';
import { ConversionFeeService } from '../../services/conversionFeeService';
import type { MultiWallet, GameRealm } from '../../types';
import './MultiWalletConverter.css';

interface MultiWalletConverterProps {
  isOpen: boolean;
  onClose: () => void;
  multiWallet: MultiWallet;
  availableRealms: GameRealm[];
  onConvert: (fromWalletType: 'static' | 'gold', fromWalletId: string, toWalletType: 'static' | 'gold', toWalletId: string, amount: number, goldType?: 'suspended' | 'withdrawable') => Promise<void>;
}

interface WalletOption {
  id: string;
  name: string;
  type: 'static' | 'gold';
  symbol: string;
  icon: string;
  balance: number;
  withdrawableBalance?: number;
  suspendedBalance?: number;
  gameName?: string;
}

export const MultiWalletConverter: React.FC<MultiWalletConverterProps> = ({
  isOpen,
  onClose,
  multiWallet,
  availableRealms: _availableRealms,
  onConvert,
}) => {
  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [goldType, setGoldType] = useState<'suspended' | 'withdrawable'>('withdrawable');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get all available wallets
  const getAllWallets = (): WalletOption[] => {
    const wallets: WalletOption[] = [];

    // Add static wallets
    wallets.push({
      id: 'static_usd',
      name: 'USD Wallet',
      type: 'static',
      symbol: '$',
      icon: '💵',
      balance: multiWallet.staticWallets.usd.balance,
    });

    wallets.push({
      id: 'static_toman',
      name: 'Toman Wallet',
      type: 'static',
      symbol: '﷼',
      icon: '﷼',
      balance: multiWallet.staticWallets.toman.balance,
    });

    // Add gold wallets
    Object.values(multiWallet.goldWallets).forEach(goldWallet => {
      wallets.push({
        id: `gold_${goldWallet.realmId}`,
        name: `${goldWallet.realmName} Gold`,
        type: 'gold',
        symbol: 'G',
        icon: '🪙',
        balance: goldWallet.totalGold,
        withdrawableBalance: goldWallet.withdrawableGold,
        suspendedBalance: goldWallet.suspendedGold,
        gameName: goldWallet.gameName,
      });
    });

    return wallets;
  };

  const allWallets = getAllWallets();
  const fromWallet = allWallets.find(w => w.id === fromWalletId);
  const toWallet = allWallets.find(w => w.id === toWalletId);

  // Calculate available balance based on gold type selection
  const getAvailableBalance = (wallet: WalletOption | undefined): number => {
    if (!wallet) return 0;
    
    if (wallet.type === 'gold') {
      return goldType === 'suspended' 
        ? (wallet.suspendedBalance || 0)
        : (wallet.withdrawableBalance || 0);
    }
    
    return wallet.balance;
  };

  const availableBalance = getAvailableBalance(fromWallet);

  // Calculate conversion details
  const getConversionDetails = () => {
    if (!fromWallet || !toWallet || !amount) {
      return null;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return null;
    }

    // Get exchange rate
    const fromCurrency = fromWallet.type === 'static' 
      ? fromWallet.id.replace('static_', '') as 'usd' | 'toman'
      : 'gold';
    const toCurrency = toWallet.type === 'static'
      ? toWallet.id.replace('static_', '') as 'usd' | 'toman'
      : 'gold';

    const exchangeRate = WalletService.getExchangeRate(fromCurrency, toCurrency);
    let convertedAmount = numAmount * exchangeRate;
    let conversionFee = 0;

    // Apply conversion fee for suspended gold to fiat
    if (fromWallet.type === 'gold' && toWallet.type === 'static' && goldType === 'suspended') {
      const feeConfig = ConversionFeeService.getConversionFeeConfig();
      const feeRate = toCurrency === 'usd' ? feeConfig.suspendedGoldToUsd : feeConfig.suspendedGoldToToman;
      conversionFee = convertedAmount * (feeRate / 100);
      convertedAmount -= conversionFee;
    }

    return {
      exchangeRate,
      convertedAmount,
      conversionFee,
      fromCurrency,
      toCurrency,
    };
  };

  const conversionDetails = getConversionDetails();

  // Initialize wallet selection
  useEffect(() => {
    if (allWallets.length > 0 && !fromWalletId) {
      setFromWalletId(allWallets[0].id);
    }
    if (allWallets.length > 1 && !toWalletId) {
      const secondWallet = allWallets.find(w => w.id !== fromWalletId) || allWallets[1];
      setToWalletId(secondWallet.id);
    }
  }, [allWallets, fromWalletId, toWalletId]);

  const handleSwapWallets = () => {
    const tempFrom = fromWalletId;
    setFromWalletId(toWalletId);
    setToWalletId(tempFrom);
    setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !fromWalletId || !toWalletId) {
      setError('Please fill in all fields');
      return;
    }

    if (fromWalletId === toWalletId) {
      setError('Please select different wallets');
      return;
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

    if (!fromWallet || !toWallet) {
      setError('Invalid wallet selection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fromWalletType = fromWallet.type;
      const fromId = fromWallet.type === 'static' 
        ? fromWallet.id.replace('static_', '')
        : fromWallet.id.replace('gold_', '');
      
      const toWalletType = toWallet.type;
      const toId = toWallet.type === 'static'
        ? toWallet.id.replace('static_', '')
        : toWallet.id.replace('gold_', '');

      await onConvert(
        fromWalletType,
        fromId,
        toWalletType,
        toId,
        numAmount,
        fromWallet.type === 'gold' ? goldType : undefined
      );
      
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setError('');
      onClose();
    }
  };

  const setMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const formatBalance = (balance: number, symbol: string): string => {
    if (symbol === '$') {
      return `$${balance.toFixed(2)}`;
    } else if (symbol === '﷼') {
      return `${balance.toLocaleString()} ﷼`;
    } else {
      return `${balance.toLocaleString()} ${symbol}`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Convert Between Wallets">
      <form onSubmit={handleSubmit} className="multi-wallet-converter">
        {error && (
          <div className="multi-wallet-converter__error">
            {error}
          </div>
        )}

        <div className="multi-wallet-converter__section">
          <div className="multi-wallet-converter__field">
            <label className="multi-wallet-converter__label">From Wallet</label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="multi-wallet-converter__select"
              disabled={loading}
            >
              {allWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.icon} {wallet.name} ({formatBalance(wallet.balance, wallet.symbol)})
                </option>
              ))}
            </select>
            
            {fromWallet && (
              <div className="multi-wallet-converter__wallet-details">
                <span>Available: {formatBalance(availableBalance, fromWallet.symbol)}</span>
                {fromWallet.gameName && (
                  <span className="multi-wallet-converter__game-name">{fromWallet.gameName}</span>
                )}
              </div>
            )}
          </div>

          {fromWallet?.type === 'gold' && (fromWallet.suspendedBalance || 0) > 0 && (
            <div className="multi-wallet-converter__field">
              <label className="multi-wallet-converter__label">Gold Type</label>
              <div className="multi-wallet-converter__gold-type-tabs">
                <button
                  type="button"
                  className={`multi-wallet-converter__gold-type-tab ${goldType === 'withdrawable' ? 'active' : ''}`}
                  onClick={() => setGoldType('withdrawable')}
                  disabled={loading}
                >
                  Withdrawable ({formatBalance(fromWallet.withdrawableBalance || 0, 'G')})
                </button>
                <button
                  type="button"
                  className={`multi-wallet-converter__gold-type-tab ${goldType === 'suspended' ? 'active' : ''}`}
                  onClick={() => setGoldType('suspended')}
                  disabled={loading}
                >
                  Suspended ({formatBalance(fromWallet.suspendedBalance || 0, 'G')})
                </button>
              </div>
            </div>
          )}

          <div className="multi-wallet-converter__field">
            <div className="multi-wallet-converter__amount-header">
              <label htmlFor="amount" className="multi-wallet-converter__label">
                Amount
              </label>
              <button
                type="button"
                className="multi-wallet-converter__max-button"
                onClick={setMaxAmount}
                disabled={loading || availableBalance === 0}
              >
                Max
              </button>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="multi-wallet-converter__input"
              min="0"
              step={fromWallet?.symbol === '$' ? '0.01' : '1'}
              disabled={loading}
            />
          </div>

          <div className="multi-wallet-converter__swap">
            <button
              type="button"
              className="multi-wallet-converter__swap-button"
              onClick={handleSwapWallets}
              disabled={loading}
              title="Swap wallets"
            >
              ⇅
            </button>
          </div>

          <div className="multi-wallet-converter__field">
            <label className="multi-wallet-converter__label">To Wallet</label>
            <select
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              className="multi-wallet-converter__select"
              disabled={loading}
            >
              {allWallets.filter(w => w.id !== fromWalletId).map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.icon} {wallet.name} ({formatBalance(wallet.balance, wallet.symbol)})
                </option>
              ))}
            </select>
            
            {toWallet && (
              <div className="multi-wallet-converter__wallet-details">
                <span>Current: {formatBalance(toWallet.balance, toWallet.symbol)}</span>
                {toWallet.gameName && (
                  <span className="multi-wallet-converter__game-name">{toWallet.gameName}</span>
                )}
              </div>
            )}
          </div>

          {conversionDetails && (
            <div className="multi-wallet-converter__result">
              <div className="multi-wallet-converter__result-amount">
                You will receive: {formatBalance(conversionDetails.convertedAmount, toWallet?.symbol || '')}
              </div>
              {conversionDetails.conversionFee > 0 && (
                <div className="multi-wallet-converter__result-fee">
                  Conversion fee: {formatBalance(conversionDetails.conversionFee, toWallet?.symbol || '')}
                </div>
              )}
              <div className="multi-wallet-converter__result-rate">
                Rate: 1 {fromWallet?.symbol} = {conversionDetails.exchangeRate.toLocaleString()} {toWallet?.symbol}
              </div>
            </div>
          )}
        </div>

        <div className="multi-wallet-converter__actions">
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
            disabled={!amount || fromWalletId === toWalletId || availableBalance === 0}
          >
            {loading ? 'Converting...' : 'Convert'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};