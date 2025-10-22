import React, { useState } from 'react';
import type { Transaction, User } from '../../../types';

export const FinancialManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'deposits'>('withdrawals');

  // Mock users for reference
  const users: User[] = [
    {
      id: 'user_2',
      discordId: '234567890123456789',
      username: 'ProBooster',
      discriminator: '1234',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      email: 'probooster@example.com',
      roles: [],
      createdAt: new Date('2024-01-05'),
    },
    {
      id: 'user_3',
      discordId: '345678901234567890',
      username: 'ServiceProvider',
      discriminator: '5678',
      avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
      email: 'serviceprovider@example.com',
      roles: [],
      createdAt: new Date('2024-01-08'),
    },
  ];

  // Mock withdrawal requests
  const [withdrawalRequests, setWithdrawalRequests] = useState<Transaction[]>([
    {
      id: 'txn_1',
      walletId: 'wallet_2',
      userId: 'user_2',
      type: 'withdrawal',
      amount: 250,
      currency: 'usd',
      status: 'pending_approval',
      paymentMethod: 'PayPal',
      createdAt: new Date('2024-01-22T10:30:00'),
    },
    {
      id: 'txn_2',
      walletId: 'wallet_3',
      userId: 'user_3',
      type: 'withdrawal',
      amount: 150000,
      currency: 'toman',
      status: 'pending_approval',
      paymentMethod: 'Iranian Bank Card',
      createdAt: new Date('2024-01-22T14:15:00'),
      // Bank information example
      bankInformation: {
        bankName: 'Bank Mellat',
        accountHolderName: 'Service Provider',
        accountNumber: '1234567890123456',
        cardNumber: '6037-9971-1234-5678',
      },
    },
    {
      id: 'txn_3',
      walletId: 'wallet_2',
      userId: 'user_2',
      type: 'withdrawal',
      amount: 5000,
      currency: 'gold',
      status: 'pending_approval',
      paymentMethod: 'In-Game Transfer',
      createdAt: new Date('2024-01-21T16:45:00'),
    },
  ]);

  // Mock deposit history (view only)
  const depositHistory: Transaction[] = [
    {
      id: 'txn_4',
      walletId: 'wallet_2',
      userId: 'user_2',
      type: 'deposit',
      amount: 100,
      currency: 'usd',
      status: 'completed',
      paymentMethod: 'Credit Card',
      createdAt: new Date('2024-01-20T09:15:00'),
    },
    {
      id: 'txn_5',
      walletId: 'wallet_3',
      userId: 'user_3',
      type: 'deposit',
      amount: 50000,
      currency: 'toman',
      status: 'completed',
      paymentMethod: 'Iranian Bank Card',
      createdAt: new Date('2024-01-19T11:30:00'),
    },
    {
      id: 'txn_6',
      walletId: 'wallet_2',
      userId: 'user_2',
      type: 'deposit',
      amount: 2000,
      currency: 'gold',
      status: 'completed',
      paymentMethod: 'Crypto Wallet',
      createdAt: new Date('2024-01-18T15:20:00'),
    },
    {
      id: 'txn_7',
      walletId: 'wallet_3',
      userId: 'user_3',
      type: 'deposit',
      amount: 75,
      currency: 'usd',
      status: 'completed',
      paymentMethod: 'Credit Card',
      createdAt: new Date('2024-01-17T13:45:00'),
    },
  ];

  const getUserByWalletId = (walletId: string) => {
    // Mock mapping - in real app this would be a proper lookup
    const userMap: Record<string, User> = {
      'wallet_2': users[0],
      'wallet_3': users[1],
    };
    return userMap[walletId];
  };

  const formatCurrency = (amount: number, currency: string) => {
    switch (currency) {
      case 'usd':
        return `$${amount.toLocaleString()}`;
      case 'toman':
        return `﷼${amount.toLocaleString()}`;
      case 'gold':
        return `${amount.toLocaleString()}G`;
      default:
        return `${amount}`;
    }
  };

  const handleApproveWithdrawal = (transactionId: string) => {
    setWithdrawalRequests(prev => prev.map(txn => 
      txn.id === transactionId 
        ? { ...txn, status: 'completed' as const, approvedBy: 'admin_user' }
        : txn
    ));
  };

  const handleRejectWithdrawal = (transactionId: string) => {
    setWithdrawalRequests(prev => prev.map(txn => 
      txn.id === transactionId 
        ? { ...txn, status: 'failed' as const }
        : txn
    ));
  };

  const pendingWithdrawals = withdrawalRequests.filter(txn => txn.status === 'pending_approval');
  const processedWithdrawals = withdrawalRequests.filter(txn => txn.status !== 'pending_approval');

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Financial Management</h2>
        <p className="admin-section__description">
          Manage withdrawal approvals and view deposit history
        </p>
      </div>

      <div className="admin-section__content">
        {/* Financial Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">⏳</div>
            <div className="stat-card__value">{pendingWithdrawals.length}</div>
            <div className="stat-card__label">Pending Withdrawals</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">💸</div>
            <div className="stat-card__value">
              ${pendingWithdrawals
                .filter(txn => txn.currency === 'usd')
                .reduce((sum, txn) => sum + txn.amount, 0)
                .toLocaleString()}
            </div>
            <div className="stat-card__label">Pending USD</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📈</div>
            <div className="stat-card__value">{depositHistory.length}</div>
            <div className="stat-card__label">Total Deposits</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">💰</div>
            <div className="stat-card__value">
              ${depositHistory
                .filter(txn => txn.currency === 'usd')
                .reduce((sum, txn) => sum + txn.amount, 0)
                .toLocaleString()}
            </div>
            <div className="stat-card__label">Total USD Deposits</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'withdrawals' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            💸 Withdrawals
          </button>
          <button
            className={`tab-button ${activeTab === 'deposits' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('deposits')}
          >
            📈 Deposit History
          </button>
        </div>

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <>
            {/* Pending Withdrawals */}
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">
                  Pending Withdrawals ({pendingWithdrawals.length})
                </h3>
              </div>
              <div className="admin-card__content">
                {pendingWithdrawals.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Request Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingWithdrawals.map((transaction) => {
                        const user = getUserByWalletId(transaction.walletId);
                        return (
                          <tr key={transaction.id}>
                            <td>
                              {user && (
                                <div className="user-info">
                                  <img 
                                    src={user.avatar} 
                                    alt={user.username}
                                    className="user-avatar"
                                  />
                                  <div>
                                    <div className="user-name">
                                      {user.username}#{user.discriminator}
                                    </div>
                                    <div className="user-email">{user.email}</div>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="amount-info">
                                <span className="amount-value">
                                  {formatCurrency(transaction.amount, transaction.currency)}
                                </span>
                                <span className="currency-badge">
                                  {transaction.currency.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td>{transaction.paymentMethod}</td>
                            <td>{transaction.createdAt.toLocaleDateString()}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="action-button action-button--approve"
                                  onClick={() => handleApproveWithdrawal(transaction.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="action-button action-button--reject"
                                  onClick={() => handleRejectWithdrawal(transaction.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state__icon">✅</div>
                    <div className="empty-state__title">No Pending Withdrawals</div>
                    <div className="empty-state__description">
                      All withdrawal requests have been processed
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recently Processed Withdrawals */}
            {processedWithdrawals.length > 0 && (
              <div className="admin-card">
                <div className="admin-card__header">
                  <h3 className="admin-card__title">Recently Processed</h3>
                </div>
                <div className="admin-card__content">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Processed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedWithdrawals.slice(0, 10).map((transaction) => {
                        const user = getUserByWalletId(transaction.walletId);
                        return (
                          <tr key={transaction.id}>
                            <td>
                              {user && (
                                <div className="user-info">
                                  <img 
                                    src={user.avatar} 
                                    alt={user.username}
                                    className="user-avatar"
                                  />
                                  <div>
                                    <div className="user-name">
                                      {user.username}#{user.discriminator}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td>{formatCurrency(transaction.amount, transaction.currency)}</td>
                            <td>
                              <span className={`status-badge ${
                                transaction.status === 'completed' 
                                  ? 'status-badge--active' 
                                  : 'status-badge--rejected'
                              }`}>
                                {transaction.status === 'completed' ? 'Approved' : 'Rejected'}
                              </span>
                            </td>
                            <td>{transaction.createdAt.toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                Deposit History ({depositHistory.length})
              </h3>
              <p className="admin-card__subtitle">
                View-only history of instant deposits (no approval required)
              </p>
            </div>
            <div className="admin-card__content">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {depositHistory.map((transaction) => {
                    const user = getUserByWalletId(transaction.walletId);
                    return (
                      <tr key={transaction.id}>
                        <td>
                          {user && (
                            <div className="user-info">
                              <img 
                                src={user.avatar} 
                                alt={user.username}
                                className="user-avatar"
                              />
                              <div>
                                <div className="user-name">
                                  {user.username}#{user.discriminator}
                                </div>
                                <div className="user-email">{user.email}</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="amount-info">
                            <span className="amount-value">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </span>
                            <span className="currency-badge">
                              {transaction.currency.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td>{transaction.paymentMethod}</td>
                        <td>{transaction.createdAt.toLocaleDateString()}</td>
                        <td>
                          <span className="status-badge status-badge--active">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tab-button {
          padding: 12px 20px;
          background: var(--discord-bg-secondary);
          color: var(--discord-text-secondary);
          border: 1px solid var(--discord-bg-tertiary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.17s ease;
        }

        .tab-button:hover {
          background: var(--discord-bg-tertiary);
          color: var(--discord-text-primary);
        }

        .tab-button--active {
          background: var(--discord-accent);
          color: var(--discord-text-primary);
          border-color: var(--discord-accent);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .user-email {
          font-size: 12px;
          color: var(--discord-text-muted);
        }

        .amount-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .amount-value {
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .currency-badge {
          font-size: 11px;
          color: var(--discord-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-card__subtitle {
          font-size: 13px;
          color: var(--discord-text-muted);
          margin: 4px 0 0 0;
        }
      `}</style>
    </div>
  );
};