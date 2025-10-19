// Multi-Wallet Transaction History Component

import React, { useState, useMemo } from 'react';
import { Modal } from '../discord/Modal';
import type { MultiWalletTransaction, MultiWallet } from '../../types';
import './MultiWalletTransactionHistory.css';

interface MultiWalletTransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: MultiWalletTransaction[];
  multiWallet: MultiWallet;
}

export const MultiWalletTransactionHistory: React.FC<MultiWalletTransactionHistoryProps> = ({
  isOpen,
  onClose,
  transactions,
  multiWallet,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWallet, setFilterWallet] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'conversion', label: 'Conversions' },
    { value: 'purchase', label: 'Purchases' },
    { value: 'earning', label: 'Earnings' },
    { value: 'admin_deposit', label: 'Admin Deposits' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'failed', label: 'Failed' },
  ];

  // Get all available wallets for filtering
  const getWalletOptions = () => {
    const options = [{ value: 'all', label: 'All Wallets' }];
    
    // Add static wallets
    options.push(
      { value: 'static_usd', label: 'USD Wallet' },
      { value: 'static_toman', label: 'Toman Wallet' }
    );
    
    // Add gold wallets
    Object.values(multiWallet.goldWallets).forEach(goldWallet => {
      options.push({
        value: `gold_${goldWallet.realmId}`,
        label: `${goldWallet.realmName} Gold`
      });
    });
    
    return options;
  };

  const walletOptions = getWalletOptions();

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      
      // Wallet filtering
      let matchesWallet = true;
      if (filterWallet !== 'all') {
        const walletKey = `${transaction.walletType}_${transaction.walletId}`;
        matchesWallet = walletKey === filterWallet;
      }
      
      const matchesSearch = searchQuery === '' || 
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.paymentMethod && transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesType && matchesWallet && matchesStatus && matchesSearch;
    });
  }, [transactions, filterType, filterWallet, filterStatus, searchQuery]);

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit': return '💳';
      case 'withdrawal': return '🏦';
      case 'conversion': return '🔄';
      case 'purchase': return '🛒';
      case 'earning': return '💰';
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

  const formatCurrency = (amount: number, currency: string): string => {
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

  const getWalletName = (transaction: MultiWalletTransaction): string => {
    if (transaction.walletType === 'static') {
      return transaction.walletId === 'usd' ? 'USD Wallet' : 'Toman Wallet';
    } else {
      const goldWallet = multiWallet.goldWallets[transaction.walletId];
      return goldWallet ? `${goldWallet.realmName} Gold` : 'Unknown Gold Wallet';
    }
  };

  const getTransactionDetails = (transaction: MultiWalletTransaction): string[] => {
    const details: string[] = [];
    
    if (transaction.type === 'conversion') {
      if (transaction.fromWallet && transaction.toWallet) {
        details.push(`From: ${transaction.fromWallet}`);
        details.push(`To: ${transaction.toWallet}`);
      }
      if (transaction.conversionFee && transaction.conversionFee > 0) {
        details.push(`Fee: ${formatCurrency(transaction.conversionFee, transaction.currency)}`);
      }
    }
    
    if (transaction.goldType) {
      details.push(`Gold Type: ${transaction.goldType}`);
    }
    
    if (transaction.paymentMethod) {
      details.push(`Method: ${transaction.paymentMethod.replace('_', ' ')}`);
    }
    
    if (transaction.approvedBy) {
      details.push(`Approved by: ${transaction.approvedBy}`);
    }
    
    return details;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Multi-Wallet Transaction History" size="lg">
      <div className="multi-wallet-transaction-history">
        <div className="multi-wallet-transaction-history__header">
          <div className="multi-wallet-transaction-history__count">
            {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>

        <div className="multi-wallet-transaction-history__filters">
          <div className="multi-wallet-transaction-history__filter-row">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="multi-wallet-transaction-history__select"
            >
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filterWallet}
              onChange={(e) => setFilterWallet(e.target.value)}
              className="multi-wallet-transaction-history__select"
            >
              {walletOptions.map((wallet) => (
                <option key={wallet.value} value={wallet.value}>
                  {wallet.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="multi-wallet-transaction-history__select"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="multi-wallet-transaction-history__search"
          />
        </div>

        <div className="multi-wallet-transaction-history__list">
          {filteredTransactions.length === 0 ? (
            <div className="multi-wallet-transaction-history__empty">
              <div className="multi-wallet-transaction-history__empty-icon">📄</div>
              <div className="multi-wallet-transaction-history__empty-text">
                {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
              </div>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="multi-wallet-transaction-history__item">
                <div className="multi-wallet-transaction-history__item-icon">
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="multi-wallet-transaction-history__item-details">
                  <div className="multi-wallet-transaction-history__item-header">
                    <div className="multi-wallet-transaction-history__item-main">
                      <span className="multi-wallet-transaction-history__item-type">
                        {formatTransactionType(transaction.type)}
                      </span>
                      <span className="multi-wallet-transaction-history__item-wallet">
                        {getWalletName(transaction)}
                      </span>
                    </div>
                    <div className="multi-wallet-transaction-history__item-amount">
                      <span className={`multi-wallet-transaction-history__amount ${
                        transaction.type === 'withdrawal' || transaction.type === 'purchase' ? 'negative' : 'positive'
                      }`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'purchase' ? '-' : '+'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                      <span 
                        className="multi-wallet-transaction-history__item-status"
                        style={{ color: getStatusColor(transaction.status) }}
                      >
                        {formatStatus(transaction.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="multi-wallet-transaction-history__item-meta">
                    <span className="multi-wallet-transaction-history__item-id">
                      ID: {transaction.id}
                    </span>
                    <span className="multi-wallet-transaction-history__item-date">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {getTransactionDetails(transaction).length > 0 && (
                    <div className="multi-wallet-transaction-history__item-details-list">
                      {getTransactionDetails(transaction).map((detail, index) => (
                        <span key={index} className="multi-wallet-transaction-history__item-detail">
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};