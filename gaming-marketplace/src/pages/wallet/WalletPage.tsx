import React from 'react';
import { Header } from '../../components/layout/Header';
import './WalletPage.css';

export const WalletPage: React.FC = () => {
  return (
    <div className="wallet-page">
      <Header
        title="Wallet"
        subtitle="Multi-currency wallet management"
      />
      
      <div className="wallet-page__content">
        <div className="wallet-page__placeholder">
          <div className="wallet-page__icon">💰</div>
          <h2>Wallet Coming Soon</h2>
          <p>
            Manage your multi-currency wallet with Gold (G), USD ($), and Toman (﷼).
            Deposit, withdraw, convert currencies, and track all transactions.
          </p>
          
          <div className="wallet-page__features">
            <div className="wallet-page__feature">
              <span className="wallet-page__feature-icon">💳</span>
              <span>Instant Deposits</span>
            </div>
            <div className="wallet-page__feature">
              <span className="wallet-page__feature-icon">🏦</span>
              <span>Withdrawal Requests</span>
            </div>
            <div className="wallet-page__feature">
              <span className="wallet-page__feature-icon">🔄</span>
              <span>Currency Conversion</span>
            </div>
            <div className="wallet-page__feature">
              <span className="wallet-page__feature-icon">📊</span>
              <span>Transaction History</span>
            </div>
          </div>
          
          <div className="wallet-page__preview">
            <h3>Supported Currencies</h3>
            <div className="wallet-page__currencies">
              <div className="wallet-page__currency">
                <span className="wallet-page__currency-icon">🪙</span>
                <div className="wallet-page__currency-info">
                  <span className="wallet-page__currency-name">Gold (G)</span>
                  <span className="wallet-page__currency-desc">In-game currency</span>
                </div>
              </div>
              <div className="wallet-page__currency">
                <span className="wallet-page__currency-icon">💵</span>
                <div className="wallet-page__currency-info">
                  <span className="wallet-page__currency-name">USD ($)</span>
                  <span className="wallet-page__currency-desc">US Dollar</span>
                </div>
              </div>
              <div className="wallet-page__currency">
                <span className="wallet-page__currency-icon">﷼</span>
                <div className="wallet-page__currency-info">
                  <span className="wallet-page__currency-name">Toman (﷼)</span>
                  <span className="wallet-page__currency-desc">Iranian Toman</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};