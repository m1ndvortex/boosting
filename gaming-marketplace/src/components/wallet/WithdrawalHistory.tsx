// Withdrawal History Component - Shows user's withdrawal requests with status and evidence

import React, { useState, useEffect } from 'react';
import type { Transaction } from '../../types';
import { WalletService } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import './WithdrawalHistory.css';

export const WithdrawalHistory: React.FC = () => {
  const { state } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadWithdrawals();
  }, [state.user?.id]);

  const loadWithdrawals = () => {
    if (!state.user?.id) return;
    
    const allTransactions = WalletService.getAllWithdrawalRequests();
    const userWithdrawals = allTransactions.filter(t => t.userId === state.user?.id);
    setWithdrawals(userWithdrawals);
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: string; label: string; className: string }> = {
      pending_approval: { icon: '⏳', label: 'Pending', className: 'status-pending' },
      processing: { icon: '🔄', label: 'Processing', className: 'status-processing' },
      completed: { icon: '✅', label: 'Completed', className: 'status-completed' },
      rejected: { icon: '❌', label: 'Rejected', className: 'status-rejected' },
      failed: { icon: '⚠️', label: 'Failed', className: 'status-failed' },
    };
    
    return badges[status] || { icon: '❓', label: status, className: '' };
  };

  const formatCurrency = (amount: number, currency: string): string => {
    switch (currency.toLowerCase()) {
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()} ﷼`;
      case 'gold':
        return `${amount.toLocaleString()} G`;
      default:
        return `${amount} ${currency}`;
    }
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleString();
  };

  const maskAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  const openProofImage = (imageData: string) => {
    // Open image in new window
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>Payment Proof</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
            <img src="${imageData}" style="max-width:100%;max-height:100vh;"/>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="withdrawal-history">
      <div className="history-header">
        <h3>📤 Withdrawal History</h3>
        <p className="history-subtitle">Track your withdrawal requests and their status</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({withdrawals.length})
        </button>
        <button 
          className={filter === 'pending_approval' ? 'active' : ''}
          onClick={() => setFilter('pending_approval')}
        >
          ⏳ Pending ({withdrawals.filter(w => w.status === 'pending_approval').length})
        </button>
        <button 
          className={filter === 'processing' ? 'active' : ''}
          onClick={() => setFilter('processing')}
        >
          🔄 Processing ({withdrawals.filter(w => w.status === 'processing').length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          ✅ Completed ({withdrawals.filter(w => w.status === 'completed').length})
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          ❌ Rejected ({withdrawals.filter(w => w.status === 'rejected').length})
        </button>
      </div>

      {/* Withdrawal List */}
      {filteredWithdrawals.length > 0 ? (
        <div className="withdrawal-list">
          {filteredWithdrawals.map((withdrawal) => {
            const statusInfo = getStatusBadge(withdrawal.status);
            
            return (
              <div key={withdrawal.id} className="withdrawal-card">
                <div className="withdrawal-header">
                  <div className="withdrawal-amount">
                    <span className="amount">{formatCurrency(withdrawal.amount, withdrawal.currency)}</span>
                    <span className="payment-method">{withdrawal.paymentMethod}</span>
                  </div>
                  <span className={`status-badge ${statusInfo.className}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>

                <div className="withdrawal-details">
                  <div className="detail-row">
                    <span className="detail-label">Bank:</span>
                    <span className="detail-value">{withdrawal.bankInformation?.bankName || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Account:</span>
                    <span className="detail-value">
                      {withdrawal.bankInformation?.accountNumber 
                        ? maskAccountNumber(withdrawal.bankInformation.accountNumber)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Requested:</span>
                    <span className="detail-value">{formatDate(withdrawal.createdAt)}</span>
                  </div>
                </div>

                {/* Status-specific information */}
                {withdrawal.status === 'pending_approval' && (
                  <div className="status-message pending-message">
                    <p>⏳ Your withdrawal is being reviewed by our team. This usually takes 1-2 business days.</p>
                  </div>
                )}

                {withdrawal.status === 'processing' && (
                  <div className="status-message processing-message">
                    <p>🔄 Your withdrawal is being processed. Payment will be sent to your bank account soon.</p>
                  </div>
                )}

                {withdrawal.status === 'completed' && withdrawal.transactionEvidence && (
                  <div className="status-message completed-message">
                    <p>✅ Your withdrawal has been completed successfully!</p>
                    <button 
                      className="view-details-btn"
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                    >
                      View Transaction Details
                    </button>
                  </div>
                )}

                {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                  <div className="status-message rejected-message">
                    <p className="rejection-title">❌ Withdrawal Rejected</p>
                    <p className="rejection-reason">{withdrawal.rejectionReason}</p>
                  </div>
                )}

                {withdrawal.requestNotes && (
                  <div className="user-notes">
                    <strong>Your note:</strong> {withdrawal.requestNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-icon">📤</p>
          <h4>No Withdrawal Requests</h4>
          <p>You haven't made any withdrawal requests yet</p>
        </div>
      )}

      {/* Transaction Evidence Modal */}
      {selectedWithdrawal && (
        <div className="modal-overlay" onClick={() => setSelectedWithdrawal(null)}>
          <div className="evidence-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button className="close-btn" onClick={() => setSelectedWithdrawal(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="evidence-section">
                <h4>💰 Withdrawal Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Amount:</span>
                    <span className="info-value">
                      {formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Requested:</span>
                    <span className="info-value">{formatDate(selectedWithdrawal.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bank:</span>
                    <span className="info-value">{selectedWithdrawal.bankInformation?.bankName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Holder:</span>
                    <span className="info-value">{selectedWithdrawal.bankInformation?.accountHolderName}</span>
                  </div>
                </div>
              </div>

              {selectedWithdrawal.transactionEvidence && (
                <div className="evidence-section">
                  <h4>📄 Payment Evidence</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Transaction Code:</span>
                      <span className="info-value evidence-code">
                        {selectedWithdrawal.transactionEvidence.transactionCode}
                      </span>
                    </div>
                    {selectedWithdrawal.transactionEvidence.bankTransactionId && (
                      <div className="info-item">
                        <span className="info-label">Bank Reference:</span>
                        <span className="info-value evidence-code">
                          {selectedWithdrawal.transactionEvidence.bankTransactionId}
                        </span>
                      </div>
                    )}
                    {selectedWithdrawal.transactionEvidence.processedAt && (
                      <div className="info-item">
                        <span className="info-label">Processed On:</span>
                        <span className="info-value">
                          {formatDate(selectedWithdrawal.transactionEvidence.processedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedWithdrawal.transactionEvidence.proofImage && (
                    <div className="proof-image-section">
                      <h5>Payment Proof:</h5>
                      <button 
                        className="view-proof-btn"
                        onClick={() => openProofImage(selectedWithdrawal.transactionEvidence!.proofImage!)}
                      >
                        🖼️ View Payment Receipt
                      </button>
                    </div>
                  )}

                  {selectedWithdrawal.transactionEvidence.adminNotes && (
                    <div className="admin-notes-section">
                      <h5>Additional Notes:</h5>
                      <p>{selectedWithdrawal.transactionEvidence.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setSelectedWithdrawal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
