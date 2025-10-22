import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionEvidence } from '../../../types';
import { WalletService } from '../../../services/walletService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';

type FilterStatus = 'all' | 'pending_approval' | 'processing' | 'completed' | 'rejected' | 'failed';

export const FinancialManagementNew: React.FC = () => {
  const { state } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Transaction[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Evidence form state
  const [transactionCode, setTransactionCode] = useState('');
  const [bankTransactionId, setBankTransactionId] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [proofFileName, setProofFileName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  
  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadWithdrawals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [withdrawals, filterStatus, searchTerm]);

  const loadWithdrawals = () => {
    const allWithdrawals = WalletService.getAllWithdrawalRequests();
    setWithdrawals(allWithdrawals);
  };

  const applyFilters = () => {
    let filtered = withdrawals;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => w.status === filterStatus);
    }

    // Filter by search term (user email, username, bank name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w => 
        w.userEmail?.toLowerCase().includes(term) ||
        w.bankInformation?.accountHolderName?.toLowerCase().includes(term) ||
        w.bankInformation?.bankName?.toLowerCase().includes(term) ||
        w.bankInformation?.accountNumber?.includes(term)
      );
    }

    setFilteredWithdrawals(filtered);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleAddEvidence = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
    // Pre-fill if evidence exists
    if (transaction.transactionEvidence) {
      setTransactionCode(transaction.transactionEvidence.transactionCode || '');
      setBankTransactionId(transaction.transactionEvidence.bankTransactionId || '');
      setAdminNotes(transaction.transactionEvidence.adminNotes || '');
      setProofImage(transaction.transactionEvidence.proofImage || '');
      setProofFileName(transaction.transactionEvidence.proofFileName || '');
    } else {
      // Reset form
      setTransactionCode('');
      setBankTransactionId('');
      setAdminNotes('');
      setProofImage('');
      setProofFileName('');
    }
    
    setShowEvidenceModal(true);
  };

  const handleReject = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRejectionReason(transaction.rejectionReason || '');
    setShowRejectModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showError('Invalid File', 'Please upload JPG, PNG, or PDF.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'File size exceeds 5MB. Please upload a smaller file.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setProofImage(e.target?.result as string);
      setProofFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitEvidence = async () => {
    if (!selectedTransaction) return;

    // Validation
    if (!transactionCode.trim()) {
      showError('Missing Information', 'Transaction code is required.');
      return;
    }

    try {
      const evidence: TransactionEvidence = {
        transactionCode: transactionCode.trim(),
        bankTransactionId: bankTransactionId.trim() || undefined,
        proofImage: proofImage || undefined,
        proofFileName: proofFileName || undefined,
        adminNotes: adminNotes.trim() || undefined
      };

      // If transaction already has evidence, update it
      if (selectedTransaction.transactionEvidence) {
        await WalletService.updateTransactionEvidence(
          selectedTransaction.id,
          evidence,
          state.user?.id || 'admin'
        );
        showSuccess('Updated', 'Transaction evidence updated successfully.');
      } else {
        // Otherwise, approve with evidence
        await WalletService.approveWithdrawal(
          selectedTransaction.id,
          evidence,
          state.user?.id || 'admin'
        );
        showSuccess('Approved', 'Withdrawal approved and evidence added successfully.');
      }

      loadWithdrawals();
      setShowEvidenceModal(false);
      setShowDetailModal(false);
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to submit evidence.');
    }
  };

  const handleSubmitRejection = async () => {
    if (!selectedTransaction) return;

    if (!rejectionReason.trim()) {
      showError('Missing Information', 'Rejection reason is required.');
      return;
    }

    try {
      await WalletService.rejectWithdrawal(
        selectedTransaction.id,
        rejectionReason.trim(),
        state.user?.id || 'admin'
      );
      
      showSuccess('Rejected', 'Withdrawal rejected successfully.');
      loadWithdrawals();
      setShowRejectModal(false);
      setShowDetailModal(false);
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to reject withdrawal.');
    }
  };

  const handleSetProcessing = async (transaction: Transaction) => {
    try {
      await WalletService.setWithdrawalProcessing(
        transaction.id,
        state.user?.id || 'admin'
      );
      
      showSuccess('Updated', 'Withdrawal status updated to processing.');
      loadWithdrawals();
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to update status.');
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!window.confirm('Are you sure you want to delete this withdrawal request? This action cannot be undone.')) {
      return;
    }

    try {
      await WalletService.deleteWithdrawalRequest(transaction.id);
      showSuccess('Deleted', 'Withdrawal request deleted successfully.');
      loadWithdrawals();
      setShowDetailModal(false);
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to delete withdrawal request.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'pending_approval': 'status-badge',
      'processing': 'status-badge',
      'completed': 'status-badge status-badge--active',
      'rejected': 'status-badge status-badge--rejected',
      'failed': 'status-badge status-badge--rejected'
    };

    const statusLabels: Record<string, string> = {
      'pending_approval': 'Pending Approval',
      'processing': 'Processing',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'failed': 'Failed'
    };

    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
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

  const pendingCount = withdrawals.filter(w => w.status === 'pending_approval').length;

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Financial Management</h2>
        <p className="admin-section__description">
          View bank information, manage withdrawal requests with transaction evidence
        </p>
      </div>

      <div className="admin-section__content">
        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">⏳</div>
            <div className="stat-card__value">{pendingCount}</div>
            <div className="stat-card__label">Pending Withdrawals</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">✅</div>
            <div className="stat-card__value">{withdrawals.filter(w => w.status === 'completed').length}</div>
            <div className="stat-card__label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">🔄</div>
            <div className="stat-card__value">{withdrawals.filter(w => w.status === 'processing').length}</div>
            <div className="stat-card__label">Processing</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">❌</div>
            <div className="stat-card__value">{withdrawals.filter(w => w.status === 'rejected').length}</div>
            <div className="stat-card__label">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Withdrawal Requests ({filteredWithdrawals.length})</h3>
          </div>
          <div className="admin-card__content">
            <div className="filter-row" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--discord-bg-tertiary)',
                  background: 'var(--discord-bg-secondary)',
                  color: 'var(--discord-text-primary)',
                  minWidth: '200px'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </select>

              <input
                type="text"
                placeholder="Search by email, name, bank, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--discord-bg-tertiary)',
                  background: 'var(--discord-bg-secondary)',
                  color: 'var(--discord-text-primary)',
                  flex: 1
                }}
              />
            </div>

            {/* Table */}
            {filteredWithdrawals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">💸</div>
                <div className="empty-state__title">No Withdrawal Requests</div>
                <div className="empty-state__description">
                  {withdrawals.length === 0 
                    ? 'No withdrawal requests have been made yet.' 
                    : 'No requests match your filters.'}
                </div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Bank Name</th>
                    <th>Account</th>
                    <th>Status</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td>{withdrawal.userEmail || 'N/A'}</td>
                      <td>
                        <div className="amount-info">
                          <span className="amount-value">
                            {formatCurrency(withdrawal.amount, withdrawal.currency)}
                          </span>
                          <span className="currency-badge">
                            {withdrawal.currency.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>{withdrawal.paymentMethod}</td>
                      <td>{withdrawal.bankInformation?.bankName || 'N/A'}</td>
                      <td>
                        {withdrawal.bankInformation?.accountNumber 
                          ? maskAccountNumber(withdrawal.bankInformation.accountNumber)
                          : 'N/A'}
                      </td>
                      <td>{getStatusBadge(withdrawal.status)}</td>
                      <td>{formatDate(withdrawal.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--view"
                            onClick={() => handleViewDetails(withdrawal)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            View
                          </button>
                          {withdrawal.status === 'pending_approval' && (
                            <>
                              <button
                                className="action-button action-button--approve"
                                onClick={() => handleAddEvidence(withdrawal)}
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                              >
                                Approve
                              </button>
                              <button
                                className="action-button action-button--reject"
                                onClick={() => handleReject(withdrawal)}
                                style={{ fontSize: '12px', padding: '4px 8px' }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(withdrawal.status === 'processing' || withdrawal.status === 'completed') && withdrawal.transactionEvidence && (
                            <button
                              className="action-button action-button--view"
                              onClick={() => handleAddEvidence(withdrawal)}
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Edit Evidence
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3 className="modal__title">Withdrawal Request Details</h3>
                <button className="modal__close" onClick={() => setShowDetailModal(false)}>×</button>
              </div>

              <div className="modal__body">
                {/* Transaction Info */}
                <div className="detail-section">
                  <h4>Transaction Information</h4>
                  <div className="detail-grid">
                    <div className="detail-row">
                      <span className="detail-label">Transaction ID:</span>
                      <span className="detail-value">{selectedTransaction.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">User Email:</span>
                      <span className="detail-value">{selectedTransaction.userEmail || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Payment Method:</span>
                      <span className="detail-value">{selectedTransaction.paymentMethod}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{getStatusBadge(selectedTransaction.status)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Request Date:</span>
                      <span className="detail-value">{formatDate(selectedTransaction.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                {selectedTransaction.bankInformation && (
                  <div className="detail-section">
                    <h4>Bank Information</h4>
                    <div className="detail-grid">
                      <div className="detail-row">
                        <span className="detail-label">Bank Name:</span>
                        <span className="detail-value">{selectedTransaction.bankInformation.bankName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Account Holder:</span>
                        <span className="detail-value">{selectedTransaction.bankInformation.accountHolderName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Account Number:</span>
                        <span className="detail-value">{selectedTransaction.bankInformation.accountNumber}</span>
                      </div>
                      {selectedTransaction.bankInformation.cardNumber && (
                        <div className="detail-row">
                          <span className="detail-label">Card Number:</span>
                          <span className="detail-value">{selectedTransaction.bankInformation.cardNumber}</span>
                        </div>
                      )}
                      {selectedTransaction.bankInformation.iban && (
                        <div className="detail-row">
                          <span className="detail-label">IBAN:</span>
                          <span className="detail-value">{selectedTransaction.bankInformation.iban}</span>
                        </div>
                      )}
                      {selectedTransaction.bankInformation.swiftCode && (
                        <div className="detail-row">
                          <span className="detail-label">SWIFT Code:</span>
                          <span className="detail-value">{selectedTransaction.bankInformation.swiftCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Request Notes */}
                {selectedTransaction.requestNotes && (
                  <div className="detail-section">
                    <h4>Request Notes</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{selectedTransaction.requestNotes}</p>
                  </div>
                )}

                {/* Transaction Evidence */}
                {selectedTransaction.transactionEvidence && (
                  <div className="detail-section">
                    <h4>Transaction Evidence</h4>
                    <div className="detail-grid">
                      <div className="detail-row">
                        <span className="detail-label">Transaction Code:</span>
                        <span className="detail-value">{selectedTransaction.transactionEvidence.transactionCode}</span>
                      </div>
                      {selectedTransaction.transactionEvidence.bankTransactionId && (
                        <div className="detail-row">
                          <span className="detail-label">Bank Transaction ID:</span>
                          <span className="detail-value">{selectedTransaction.transactionEvidence.bankTransactionId}</span>
                        </div>
                      )}
                      {selectedTransaction.transactionEvidence.proofImage && (
                        <div className="detail-row">
                          <span className="detail-label">Proof Image:</span>
                          <span className="detail-value">
                            <a 
                              href={selectedTransaction.transactionEvidence.proofImage} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'var(--discord-accent)' }}
                            >
                              View Image ({selectedTransaction.transactionEvidence.proofFileName})
                            </a>
                          </span>
                        </div>
                      )}
                      {selectedTransaction.transactionEvidence.adminNotes && (
                        <div className="detail-row">
                          <span className="detail-label">Admin Notes:</span>
                          <span className="detail-value">{selectedTransaction.transactionEvidence.adminNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedTransaction.rejectionReason && (
                  <div className="detail-section" style={{ background: 'rgba(237, 66, 69, 0.1)' }}>
                    <h4>Rejection Reason</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{selectedTransaction.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="modal__footer">
                {selectedTransaction.status === 'pending_approval' && (
                  <>
                    <button
                      className="button button--success"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleAddEvidence(selectedTransaction);
                      }}
                    >
                      Approve with Evidence
                    </button>
                    <button
                      className="button button--primary"
                      onClick={() => handleSetProcessing(selectedTransaction)}
                    >
                      Set as Processing
                    </button>
                    <button
                      className="button button--danger"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleReject(selectedTransaction);
                      }}
                    >
                      Reject
                    </button>
                    <button
                      className="button button--danger"
                      onClick={() => handleDelete(selectedTransaction)}
                    >
                      Delete
                    </button>
                  </>
                )}
                {(selectedTransaction.status === 'processing' || selectedTransaction.status === 'completed') && (
                  <button
                    className="button button--primary"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleAddEvidence(selectedTransaction);
                    }}
                  >
                    {selectedTransaction.transactionEvidence ? 'Edit Evidence' : 'Add Evidence'}
                  </button>
                )}
                <button className="button button--secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Modal */}
        {showEvidenceModal && selectedTransaction && (
          <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3 className="modal__title">
                  {selectedTransaction.transactionEvidence ? 'Edit Transaction Evidence' : 'Add Transaction Evidence'}
                </h3>
                <button className="modal__close" onClick={() => setShowEvidenceModal(false)}>×</button>
              </div>

              <div className="modal__body">
                <div className="form-group">
                  <label htmlFor="transaction-code">
                    Transaction Code <span style={{ color: 'var(--discord-danger)' }}>*</span>
                  </label>
                  <input
                    id="transaction-code"
                    type="text"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    placeholder="Enter bank transaction code"
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bank-transaction-id">Bank Transaction ID</label>
                  <input
                    id="bank-transaction-id"
                    type="text"
                    value={bankTransactionId}
                    onChange={(e) => setBankTransactionId(e.target.value)}
                    placeholder="Optional bank reference number"
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="proof-image">Proof Image (Optional)</label>
                  <input
                    id="proof-image"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileUpload}
                    className="input"
                  />
                  <small style={{ color: 'var(--discord-text-muted)', fontSize: '12px' }}>
                    Max file size: 5MB. Accepted formats: JPG, PNG, PDF
                  </small>
                  {proofFileName && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--discord-success)' }}>Selected: {proofFileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setProofImage('');
                          setProofFileName('');
                        }}
                        style={{ 
                          padding: '2px 8px', 
                          fontSize: '12px',
                          background: 'var(--discord-danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="admin-notes">Admin Notes</label>
                  <textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any internal notes about this payment"
                    rows={4}
                    className="textarea"
                  />
                </div>
              </div>

              <div className="modal__footer">
                <button className="button button--primary" onClick={handleSubmitEvidence}>
                  {selectedTransaction.transactionEvidence ? 'Update Evidence' : 'Submit & Approve'}
                </button>
                <button className="button button--secondary" onClick={() => setShowEvidenceModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedTransaction && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3 className="modal__title">Reject Withdrawal Request</h3>
                <button className="modal__close" onClick={() => setShowRejectModal(false)}>×</button>
              </div>

              <div className="modal__body">
                <div className="form-group">
                  <label htmlFor="rejection-reason">
                    Rejection Reason <span style={{ color: 'var(--discord-danger)' }}>*</span>
                  </label>
                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this withdrawal is being rejected"
                    rows={5}
                    className="textarea"
                  />
                </div>
              </div>

              <div className="modal__footer">
                <button className="button button--danger" onClick={handleSubmitRejection}>
                  Confirm Rejection
                </button>
                <button className="button button--secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .modal {
          background: var(--discord-bg-primary);
          border-radius: 8px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        }

        .modal--large {
          max-width: 800px;
        }

        .modal__header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--discord-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal__title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .modal__close {
          background: none;
          border: none;
          color: var(--discord-text-muted);
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.17s ease;
        }

        .modal__close:hover {
          background: var(--discord-bg-tertiary);
          color: var(--discord-text-primary);
        }

        .modal__body {
          padding: 24px;
        }

        .modal__footer {
          padding: 16px 24px;
          border-top: 1px solid var(--discord-bg-tertiary);
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .detail-section {
          background: var(--discord-bg-secondary);
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--discord-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-grid {
          display: grid;
          gap: 12px;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 12px;
        }

        .detail-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--discord-text-muted);
        }

        .detail-value {
          font-size: 13px;
          color: var(--discord-text-primary);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .input,
        .textarea {
          width: 100%;
          padding: 10px 12px;
          background: var(--discord-bg-tertiary);
          border: 1px solid var(--discord-bg-modifier);
          border-radius: 4px;
          color: var(--discord-text-primary);
          font-size: 14px;
          font-family: inherit;
          transition: all 0.17s ease;
        }

        .input:focus,
        .textarea:focus {
          outline: none;
          border-color: var(--discord-accent);
        }

        .textarea {
          resize: vertical;
          min-height: 80px;
        }

        .button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.17s ease;
        }

        .button--primary {
          background: var(--discord-accent);
          color: white;
        }

        .button--primary:hover {
          background: var(--discord-accent-dark);
        }

        .button--secondary {
          background: var(--discord-bg-tertiary);
          color: var(--discord-text-primary);
        }

        .button--secondary:hover {
          background: var(--discord-bg-modifier);
        }

        .button--success {
          background: var(--discord-success);
          color: white;
        }

        .button--success:hover {
          opacity: 0.9;
        }

        .button--danger {
          background: var(--discord-danger);
          color: white;
        }

        .button--danger:hover {
          opacity: 0.9;
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
        }
      `}</style>
    </div>
  );
};
