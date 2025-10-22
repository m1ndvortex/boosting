import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { WalletBalance } from '../../components/wallet/WalletBalance';
import { MultiWalletBalance } from '../../components/wallet/MultiWalletBalance';
import { GoldWalletManager } from '../../components/wallet/GoldWalletManager';
import { SuspendedGoldDisplay } from '../../components/wallet/SuspendedGoldDisplay';
import { WalletActions } from '../../components/wallet/WalletActions';
import { DepositForm } from '../../components/wallet/DepositForm';
import { WithdrawalForm } from '../../components/wallet/WithdrawalForm';
import { CurrencyConverter } from '../../components/wallet/CurrencyConverter';
import { TransactionHistory } from '../../components/wallet/TransactionHistory';
import { useWallet } from '../../contexts/WalletContext';
import { useMultiWallet } from '../../hooks/useMultiWallet';
import { useAuth } from '../../contexts/AuthContext';
import type { Currency } from '../../types';
import './WalletPage.css';

export const WalletPage: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: walletState, deposit, requestWithdrawal, convertCurrency } = useWallet();

  // Multi-wallet system
  const multiWallet = useMultiWallet(authState.user?.id || '');

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [useMultiWalletSystem, setUseMultiWalletSystem] = useState(true);

  const handleDeposit = async (amount: number, currency: Currency, paymentMethod: string) => {
    await deposit(amount, currency, paymentMethod);
  };

  const handleWithdraw = async (
    amount: number,
    currency: Currency,
    paymentMethod: string,
    bankInfo?: import('../../types').BankInformation,
    notes?: string
  ) => {
    await requestWithdrawal(amount, currency, paymentMethod, bankInfo, notes);
  };

  const handleConvert = async (fromCurrency: Currency, toCurrency: Currency, amount: number) => {
    await convertCurrency(fromCurrency, toCurrency, amount);
  };

  // Multi-wallet handlers
  const handleMultiWalletDeposit = async (walletType: 'static' | 'gold', walletId: string, amount: number, paymentMethod: string) => {
    // For now, use the legacy deposit method for static wallets
    // In a real implementation, this would be handled by the multi-wallet service
    if (walletType === 'static') {
      const currency = walletId as Currency;
      await deposit(amount, currency, paymentMethod);
    } else {
      // Handle gold wallet deposits - this would typically be admin-only
      console.log('Gold wallet deposit not implemented for users');
    }
  };

  const handleMultiWalletWithdraw = async (walletType: 'static' | 'gold', walletId: string, amount: number, paymentMethod: string) => {
    // For now, use the legacy withdrawal method for static wallets
    if (walletType === 'static') {
      const currency = walletId as Currency;
      await requestWithdrawal(amount, currency, paymentMethod);
    } else {
      // Handle gold wallet withdrawals
      console.log('Gold wallet withdrawal not fully implemented');
    }
  };

  const handleMultiWalletConvert = async (
    fromWalletType: 'static' | 'gold',
    fromWalletId: string,
    toWalletType: 'static' | 'gold',
    toWalletId: string,
    amount: number,
    goldType?: 'suspended' | 'withdrawable'
  ) => {
    if (fromWalletType === 'gold' && toWalletType === 'static') {
      // Convert gold to fiat
      await multiWallet.convertSuspendedGoldToFiat(fromWalletId, amount, toWalletId as 'usd' | 'toman');
    } else if (fromWalletType === 'gold' && toWalletType === 'gold') {
      // Convert between gold wallets
      await multiWallet.convertBetweenGoldWallets(fromWalletId, toWalletId, amount, goldType || 'withdrawable');
    } else if (fromWalletType === 'static' && toWalletType === 'static') {
      // Convert between static currencies
      const fromCurrency = fromWalletId as Currency;
      const toCurrency = toWalletId as Currency;
      await convertCurrency(fromCurrency, toCurrency, amount);
    } else {
      console.log('Conversion type not supported');
    }
  };

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="wallet-page">
        <Header
          title="Wallet"
          subtitle="Multi-currency wallet management"
        />
        <div className="wallet-page__content">
          <div className="wallet-page__error">
            <div className="wallet-page__error-icon">🔒</div>
            <h2>Authentication Required</h2>
            <p>Please log in to access your wallet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <Header
        title="Wallet"
        subtitle="Multi-currency wallet management"
      />

      <div className="wallet-page__content">
        {walletState.error && (
          <div className="wallet-page__error-banner">
            <span className="wallet-page__error-icon">⚠️</span>
            <span>{walletState.error}</span>
          </div>
        )}

        <div className="wallet-page__system-toggle">
          <button
            className={`wallet-page__toggle-btn ${!useMultiWalletSystem ? 'active' : ''}`}
            onClick={() => setUseMultiWalletSystem(false)}
          >
            Legacy Wallet
          </button>
          <button
            className={`wallet-page__toggle-btn ${useMultiWalletSystem ? 'active' : ''}`}
            onClick={() => setUseMultiWalletSystem(true)}
          >
            Multi-Wallet System
          </button>
        </div>

        <div className="wallet-page__grid">
          <div className="wallet-page__main">
            {useMultiWalletSystem ? (
              <>
                <MultiWalletBalance
                  wallet={multiWallet.wallet!}
                  loading={multiWallet.loading}
                />
                <GoldWalletManager
                  availableRealms={multiWallet.availableRealms}
                  userWallet={multiWallet.wallet!}
                  onAddWallet={multiWallet.addGoldWallet}
                  onRemoveWallet={multiWallet.removeGoldWallet}
                  loading={multiWallet.loading}
                />

                {/* Suspended Gold Display for each gold wallet with suspended gold */}
                {multiWallet.wallet && Object.values(multiWallet.wallet.goldWallets)
                  .filter(goldWallet => goldWallet.suspendedGold > 0)
                  .map(goldWallet => (
                    <SuspendedGoldDisplay
                      key={goldWallet.realmId}
                      goldWallet={goldWallet}
                      onConvertToFiat={(amount, currency) =>
                        multiWallet.convertSuspendedGoldToFiat(goldWallet.realmId, amount, currency)
                      }
                      loading={multiWallet.loading}
                    />
                  ))
                }
              </>
            ) : (
              <WalletBalance
                wallet={walletState.wallet!}
                loading={walletState.loading}
              />
            )}

            <WalletActions
              // Legacy props for backward compatibility
              onDeposit={useMultiWalletSystem ? undefined : () => setShowDepositForm(true)}
              onWithdraw={useMultiWalletSystem ? undefined : () => setShowWithdrawalForm(true)}
              onConvert={useMultiWalletSystem ? undefined : () => setShowConverter(true)}
              disabled={useMultiWalletSystem ? false : walletState.loading}

              // Multi-wallet props
              multiWallet={useMultiWalletSystem ? (multiWallet.wallet || undefined) : undefined}
              availableRealms={useMultiWalletSystem ? multiWallet.availableRealms : undefined}
              onMultiWalletDeposit={useMultiWalletSystem ? handleMultiWalletDeposit : undefined}
              onMultiWalletWithdraw={useMultiWalletSystem ? handleMultiWalletWithdraw : undefined}
              onMultiWalletConvert={useMultiWalletSystem ? handleMultiWalletConvert : undefined}
              onAddGoldWallet={useMultiWalletSystem ? multiWallet.addGoldWallet : undefined}
              onRemoveGoldWallet={useMultiWalletSystem ? multiWallet.removeGoldWallet : undefined}
              loading={useMultiWalletSystem ? multiWallet.loading : walletState.loading}
            />
          </div>

          <div className="wallet-page__sidebar">
            <TransactionHistory
              transactions={useMultiWalletSystem ? multiWallet.transactions : walletState.transactions}
              loading={useMultiWalletSystem ? multiWallet.loading : walletState.loading}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositForm
        isOpen={showDepositForm}
        onClose={() => setShowDepositForm(false)}
        onDeposit={handleDeposit}
      />

      <WithdrawalForm
        isOpen={showWithdrawalForm}
        onClose={() => setShowWithdrawalForm(false)}
        onWithdraw={handleWithdraw}
        wallet={walletState.wallet!}
      />

      <CurrencyConverter
        isOpen={showConverter}
        onClose={() => setShowConverter(false)}
        onConvert={handleConvert}
        wallet={walletState.wallet!}
      />
    </div>
  );
};