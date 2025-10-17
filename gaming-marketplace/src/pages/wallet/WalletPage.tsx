import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { WalletBalance } from '../../components/wallet/WalletBalance';
import { WalletActions } from '../../components/wallet/WalletActions';
import { DepositForm } from '../../components/wallet/DepositForm';
import { WithdrawalForm } from '../../components/wallet/WithdrawalForm';
import { CurrencyConverter } from '../../components/wallet/CurrencyConverter';
import { TransactionHistory } from '../../components/wallet/TransactionHistory';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Currency } from '../../types';
import './WalletPage.css';

export const WalletPage: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: walletState, deposit, requestWithdrawal, convertCurrency } = useWallet();
  
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  const handleDeposit = async (amount: number, currency: Currency, paymentMethod: string) => {
    await deposit(amount, currency, paymentMethod);
  };

  const handleWithdraw = async (amount: number, currency: Currency, paymentMethod: string) => {
    await requestWithdrawal(amount, currency, paymentMethod);
  };

  const handleConvert = async (fromCurrency: Currency, toCurrency: Currency, amount: number) => {
    await convertCurrency(fromCurrency, toCurrency, amount);
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

        <div className="wallet-page__grid">
          <div className="wallet-page__main">
            <WalletBalance 
              wallet={walletState.wallet!} 
              loading={walletState.loading}
            />
            
            <WalletActions
              onDeposit={() => setShowDepositForm(true)}
              onWithdraw={() => setShowWithdrawalForm(true)}
              onConvert={() => setShowConverter(true)}
              disabled={walletState.loading}
            />
          </div>
          
          <div className="wallet-page__sidebar">
            <TransactionHistory 
              transactions={walletState.transactions}
              loading={walletState.loading}
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