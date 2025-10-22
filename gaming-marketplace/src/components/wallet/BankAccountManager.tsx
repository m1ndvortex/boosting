// Bank Account Management Component for Users

import React, { useState, useEffect } from 'react';
import type { BankInformation } from '../../types';
import { WalletService } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import './BankAccountManager.css';

interface SavedBankAccount extends BankInformation {
  id: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  nickname?: string; // e.g., "My Chase Account", "PayPal Account"
}

export const BankAccountManager: React.FC = () => {
  const { state } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [accounts, setAccounts] = useState<SavedBankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavedBankAccount | null>(null);
  const [formData, setFormData] = useState<Partial<SavedBankAccount>>({
    nickname: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    cardNumber: '',
    iban: '',
    swiftCode: '',
    additionalInfo: '',
  });

  useEffect(() => {
    loadAccounts();
  }, [state.user?.id]);

  const loadAccounts = () => {
    if (!state.user?.id) return;
    const userAccounts = WalletService.getBankAccounts(state.user.id);
    setAccounts(userAccounts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.user?.id) {
      showError('Authentication Error', 'You must be logged in');
      return;
    }

    if (!formData.nickname || !formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingAccount) {
        // Update existing account
        WalletService.updateBankAccount(state.user.id, editingAccount.id, formData as BankInformation);
        showSuccess('Updated', 'Bank account updated successfully');
      } else {
        // Add new account
        const isFirstAccount = accounts.length === 0;
        WalletService.saveBankAccount(state.user.id, formData as BankInformation, isFirstAccount);
        showSuccess('Added', 'Bank account added successfully');
      }
      
      loadAccounts();
      resetForm();
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to save bank account');
    }
  };

  const handleDelete = (accountId: string) => {
    if (!state.user?.id) return;
    
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        WalletService.deleteBankAccount(state.user.id, accountId);
        showSuccess('Deleted', 'Bank account deleted successfully');
        loadAccounts();
      } catch (error) {
        showError('Error', error instanceof Error ? error.message : 'Failed to delete bank account');
      }
    }
  };

  const handleSetDefault = (accountId: string) => {
    if (!state.user?.id) return;
    
    try {
      WalletService.setDefaultBankAccount(state.user.id, accountId);
      showSuccess('Updated', 'Default bank account set successfully');
      loadAccounts();
    } catch (error) {
      showError('Error', error instanceof Error ? error.message : 'Failed to set default account');
    }
  };

  const handleEdit = (account: SavedBankAccount) => {
    setEditingAccount(account);
    setFormData({
      nickname: account.nickname,
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumber: account.accountNumber,
      cardNumber: account.cardNumber,
      iban: account.iban,
      swiftCode: account.swiftCode,
      additionalInfo: account.additionalInfo,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      nickname: '',
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      cardNumber: '',
      iban: '',
      swiftCode: '',
      additionalInfo: '',
    });
    setEditingAccount(null);
    setShowAddForm(false);
  };

  const maskAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  return (
    <div className="bank-account-manager">
      <div className="bank-account-header">
        <h3>💳 Saved Bank Accounts</h3>
        <p className="bank-account-subtitle">
          Manage your bank accounts for faster withdrawals
        </p>
      </div>

      {/* Account List */}
      {accounts.length > 0 ? (
        <div className="bank-account-list">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className={`bank-account-card ${account.isDefault ? 'default' : ''}`}
            >
              <div className="account-header">
                <div className="account-name">
                  <span className="account-icon">🏦</span>
                  <div>
                    <h4>{account.nickname || account.bankName}</h4>
                    <p className="account-bank-name">{account.bankName}</p>
                  </div>
                </div>
                {account.isDefault && (
                  <span className="default-badge">✓ Default</span>
                )}
              </div>

              <div className="account-details">
                <div className="account-detail">
                  <span className="detail-label">Account Holder:</span>
                  <span className="detail-value">{account.accountHolderName}</span>
                </div>
                <div className="account-detail">
                  <span className="detail-label">Account Number:</span>
                  <span className="detail-value">{maskAccountNumber(account.accountNumber)}</span>
                </div>
                {account.cardNumber && (
                  <div className="account-detail">
                    <span className="detail-label">Card Number:</span>
                    <span className="detail-value">{maskAccountNumber(account.cardNumber)}</span>
                  </div>
                )}
                {account.iban && (
                  <div className="account-detail">
                    <span className="detail-label">IBAN:</span>
                    <span className="detail-value">{account.iban}</span>
                  </div>
                )}
                {account.swiftCode && (
                  <div className="account-detail">
                    <span className="detail-label">SWIFT:</span>
                    <span className="detail-value">{account.swiftCode}</span>
                  </div>
                )}
              </div>

              <div className="account-actions">
                {!account.isDefault && (
                  <button 
                    className="action-btn set-default-btn"
                    onClick={() => handleSetDefault(account.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(account)}
                >
                  Edit
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-icon">🏦</p>
          <h4>No Bank Accounts</h4>
          <p>Add a bank account to enable faster withdrawals</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {!showAddForm && (
        <button 
          className="add-account-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Bank Account
        </button>
      )}

      {showAddForm && (
        <div className="bank-account-form">
          <h4>{editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}</h4>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Account Nickname * 
                <span className="field-hint">(e.g., "My Chase Account", "PayPal")</span>
              </label>
              <input
                type="text"
                value={formData.nickname || ''}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="Enter a nickname for this account"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., Chase Bank, PayPal, Bank Mellat"
                  required
                />
              </div>

              <div className="form-group">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  value={formData.accountHolderName || ''}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  placeholder="Full name as on account"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber || ''}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Bank account number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Card Number (Optional)</label>
                <input
                  type="text"
                  value={formData.cardNumber || ''}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="16-digit card number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>IBAN (Optional)</label>
                <input
                  type="text"
                  value={formData.iban || ''}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="For international transfers"
                />
              </div>

              <div className="form-group">
                <label>SWIFT Code (Optional)</label>
                <input
                  type="text"
                  value={formData.swiftCode || ''}
                  onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                  placeholder="For international transfers"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Additional Information (Optional)</label>
              <textarea
                value={formData.additionalInfo || ''}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Any additional details (e.g., branch name, routing number)"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
