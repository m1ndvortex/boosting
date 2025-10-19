// Transaction history component

import React, { useState, useMemo } from 'react';
import type { Transaction, MultiWalletTransaction, Currency } from '../../types';
import './TransactionHistory.css';

interface TransactionHistoryProps {
  transactions: Transaction[] | MultiWalletTransaction[];
  loading?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'conversion', label: 'Conversions' },
    { value: 'purchase', label: 'Purchases' },
    { value: 'earning', label: 'Earnings' },
    { value: 'refund', label: 'Refunds' },
    { value: 'admin_deposit', label: 'Admin Deposits' },
  ];

  const currencies = [
    { value: 'all', label: 'All Currencies' },
    { value: 'gold', label: 'Gold (G)' },
    { value: 'usd', label: 'USD ($)' },
    { value: 'toman', label: 'Toman (﷼)' },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesCurrency = filterCurrency === 'all' || transaction.currency === filterCurrency;
      const matchesSearch = searchQuery === '' || 
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.paymentMethod && transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesType && matchesCurrency && matchesSearch;
    });
  }, [transactions, filterType, filterCurrency, searchQuery]);

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit': return '💳';
      case 'withdrawal': return '🏦';
      case 'conversion': return '🔄';
      case 'purchase': return '🛒';
      case 'earning': return '💰';
      case 'refund': return '↩️';
      case 'admin_deposit': return '👨‍💼';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'var(--discord-success)';
      case 'pending': return 'var(--discord-warning)';
      case 'pending_approval': return 'var(--discord-warning)';
      case 'failed': return 'var(--discord-danger)';
      default: return 'var(--discord-text-secondary)';
    }
  };

  const formatCurrency = (amount: number, currency: Currency): string => {
    switch (currency) {
      case 'gold':
        return `${amount.toLocaleString()} G`;
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()} ﷼`;
      default:
        return amount.toString();
    }
  };

  const formatTransactionType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="transaction-history">
        <div className="transaction-history__header">
          <h3>Transaction History</h3>
          <div className="transaction-history__loading">Loading transactions...</div>
        </div>
        <div className="transaction-history__skeleton">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="transaction-history__item skeleton">
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="transaction-history__header">
        <h3>Transaction History</h3>
        <div className="transaction-history__count">
          {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      <div className="transaction-history__filters">
        <div className="transaction-history__filter-group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="transaction-history__select"
          >
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="transaction-history__select"
          >
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions..."
          className="transaction-history__search"
        />
      </div>

      <div className="transaction-history__list">
        {filteredTransactions.length === 0 ? (
          <div className="transaction-history__empty">
            <div className="transaction-history__empty-icon">📄</div>
            <div className="transaction-history__empty-text">
              {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
            </div>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-history__item">
              <div className="transaction-history__item-icon">
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div className="transaction-history__item-details">
                <div className="transaction-history__item-header">
                  <span className="transaction-history__item-type">
                    {formatTransactionType(transaction.type)}
                  </span>
                  <span className="transaction-history__item-amount">
                    {transaction.type === 'withdrawal' || transaction.type === 'purchase' ? '-' : '+'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </span>
                </div>
                
                <div className="transaction-history__item-meta">
                  <span className="transaction-history__item-id">
                    ID: {transaction.id}
                  </span>
                  <span 
                    className="transaction-history__item-status"
                    style={{ color: getStatusColor(transaction.status) }}
                  >
                    {formatStatus(transaction.status)}
                  </span>
                </div>
                
                <div className="transaction-history__item-footer">
                  <span className="transaction-history__item-date">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </span>
                  {transaction.paymentMethod && (
                    <span className="transaction-history__item-method">
                      via {transaction.paymentMethod.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};