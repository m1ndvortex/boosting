import React, { useState } from 'react';
import { AdminGoldDepositPanel } from '../../../components/admin/AdminGoldDepositPanel';
import { GoldDepositHistoryPanel } from '../../../components/admin/GoldDepositHistoryPanel';
import { ConversionFeeConfigPanel } from '../../../components/admin/ConversionFeeConfigPanel';

type MultiWalletTab = 'gold-deposit' | 'deposit-history' | 'conversion-fees';

export const MultiWalletManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MultiWalletTab>('gold-deposit');

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Multi-Wallet Management</h2>
        <p className="admin-section__description">
          Manage the multi-wallet system including gold deposits, conversion fees, and deposit history
        </p>
      </div>

      <div className="admin-section__content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'gold-deposit' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('gold-deposit')}
          >
            💰 Gold Deposits
          </button>
          <button
            className={`tab-button ${activeTab === 'deposit-history' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('deposit-history')}
          >
            📊 Deposit History
          </button>
          <button
            className={`tab-button ${activeTab === 'conversion-fees' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('conversion-fees')}
          >
            ⚙️ Conversion Fees
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'gold-deposit' && (
            <AdminGoldDepositPanel />
          )}
          
          {activeTab === 'deposit-history' && (
            <GoldDepositHistoryPanel />
          )}
          
          {activeTab === 'conversion-fees' && (
            <ConversionFeeConfigPanel />
          )}
        </div>
      </div>

      <style>{`
        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tab-button {
          padding: 12px 20px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.17s ease;
        }

        .tab-button:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tab-button--active {
          background: var(--accent-color);
          color: var(--text-primary);
          border-color: var(--accent-color);
        }

        .tab-content {
          min-height: 400px;
        }
      `}</style>
    </div>
  );
};