import React, { useState, useEffect } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import { MultiWalletService } from '../../services/multiWalletService';
import { GameManagementService } from '../../services/gameManagementService';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingOverlay } from '../common/LoadingStates';
import type { User, GameRealm } from '../../types';
import './AdminGoldDepositPanel.css';

interface AdminGoldDepositPanelProps {
  className?: string;
}

interface DepositFormData {
  userId: string;
  realmId: string;
  amount: string;
}

// Mock users for now - in a real app this would come from a user service
const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    discordId: '123456789',
    username: 'TestUser1',
    discriminator: '0001',
    avatar: '',
    email: 'test1@example.com',
    roles: [{ id: 'role_1', name: 'booster', status: 'active' }],
    createdAt: new Date()
  },
  {
    id: 'user_2',
    discordId: '987654321',
    username: 'TestUser2',
    discriminator: '0002',
    avatar: '',
    email: 'test2@example.com',
    roles: [{ id: 'role_2', name: 'advertiser', status: 'active' }],
    createdAt: new Date()
  },
  {
    id: 'user_3',
    discordId: '456789123',
    username: 'TestUser3',
    discriminator: '0003',
    avatar: '',
    email: 'test3@example.com',
    roles: [{ id: 'role_3', name: 'client', status: 'active' }],
    createdAt: new Date()
  }
];

export const AdminGoldDepositPanel: React.FC<AdminGoldDepositPanelProps> = ({ className = '' }) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [availableRealms, setAvailableRealms] = useState<GameRealm[]>([]);
  const [formData, setFormData] = useState<DepositFormData>({
    userId: '',
    realmId: '',
    amount: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<DepositFormData>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load available realms on component mount
  useEffect(() => {
    loadAvailableRealms();
  }, []);

  const loadAvailableRealms = async () => {
    try {
      // Initialize the service if needed
      GameManagementService.initialize();
      const realms = GameManagementService.getAllActiveRealms();
      setAvailableRealms(realms);
    } catch (error) {
      console.error('Failed to load realms:', error);
      showError('Load Failed', 'Failed to load available realms. Please try again.');
    }
  };

  const validateForm = (data: DepositFormData): boolean => {
    const errors: Partial<DepositFormData> = {};

    if (!data.userId.trim()) {
      errors.userId = 'Please select a user';
    }

    if (!data.realmId.trim()) {
      errors.realmId = 'Please select a realm';
    }

    if (!data.amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Amount must be a positive number';
      } else if (amount > 1000000) {
        errors.amount = 'Amount cannot exceed 1,000,000 gold';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof DepositFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm(formData)) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmDeposit = async () => {
    if (!validateForm(formData)) return;

    setLoading(true);
    setShowConfirmDialog(false);

    try {
      const amount = parseFloat(formData.amount);
      const selectedUser = MOCK_USERS.find(u => u.id === formData.userId);
      const selectedRealm = availableRealms.find(r => r.id === formData.realmId);

      if (!selectedUser || !selectedRealm) {
        throw new Error('Invalid user or realm selection');
      }

      // Deposit gold using MultiWalletService
      await MultiWalletService.addSuspendedGold(
        formData.userId,
        formData.realmId,
        amount,
        'admin' // TODO: Get actual admin ID from auth context
      );

      // Reset form
      setFormData({
        userId: '',
        realmId: '',
        amount: ''
      });

      showSuccess(
        'Gold Deposited',
        `Successfully deposited ${amount.toLocaleString()} gold to ${selectedUser.username}'s ${selectedRealm.displayName} wallet. The gold will be suspended for 2 months.`
      );
    } catch (error: any) {
      console.error('Failed to deposit gold:', error);
      showError(
        'Deposit Failed',
        error.message || 'Failed to deposit gold. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  const selectedUser = MOCK_USERS.find(u => u.id === formData.userId);
  const selectedRealm = availableRealms.find(r => r.id === formData.realmId);
  const depositAmount = parseFloat(formData.amount) || 0;

  return (
    <LoadingOverlay isLoading={loading} message="Processing gold deposit...">
      <div className={`admin-gold-deposit-panel ${className}`}>
        <div className="admin-gold-deposit-panel__header">
          <h3 className="admin-gold-deposit-panel__title">Admin Gold Deposit</h3>
          <p className="admin-gold-deposit-panel__description">
            Deposit gold to user accounts with 2-month withdrawal restrictions. 
            Users can convert suspended gold to fiat currencies with fees before the restriction expires.
          </p>
        </div>

        <div className="admin-gold-deposit-panel__form">
          <div className="admin-gold-deposit-panel__form-fields">
            {/* User Selection */}
            <div className="admin-gold-deposit-panel__field">
              <label className="admin-gold-deposit-panel__label">
                Select User
              </label>
              <select
                className={`admin-gold-deposit-panel__select ${formErrors.userId ? 'admin-gold-deposit-panel__select--error' : ''}`}
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
              >
                <option value="">Choose a user...</option>
                {MOCK_USERS.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}#{user.discriminator} ({user.roles[0]?.name || 'No role'})
                  </option>
                ))}
              </select>
              {formErrors.userId && (
                <span className="admin-gold-deposit-panel__error">{formErrors.userId}</span>
              )}
            </div>

            {/* Realm Selection */}
            <div className="admin-gold-deposit-panel__field">
              <label className="admin-gold-deposit-panel__label">
                Select Realm
              </label>
              <select
                className={`admin-gold-deposit-panel__select ${formErrors.realmId ? 'admin-gold-deposit-panel__select--error' : ''}`}
                value={formData.realmId}
                onChange={(e) => handleInputChange('realmId', e.target.value)}
              >
                <option value="">Choose a realm...</option>
                {availableRealms.map(realm => (
                  <option key={realm.id} value={realm.id}>
                    {realm.gameName} - {realm.realmName}
                  </option>
                ))}
              </select>
              {formErrors.realmId && (
                <span className="admin-gold-deposit-panel__error">{formErrors.realmId}</span>
              )}
            </div>

            {/* Amount Input */}
            <div className="admin-gold-deposit-panel__field">
              <Input
                label="Gold Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                error={formErrors.amount}
                placeholder="Enter amount (e.g., 10000)"
                helperText="Gold will be suspended for 2 months from deposit date"
                min="1"
                max="1000000"
                step="1"
                fullWidth
              />
            </div>
          </div>

          {/* Deposit Summary */}
          {formData.userId && formData.realmId && depositAmount > 0 && (
            <div className="admin-gold-deposit-panel__summary">
              <h4 className="admin-gold-deposit-panel__summary-title">Deposit Summary</h4>
              <div className="admin-gold-deposit-panel__summary-details">
                <div className="admin-gold-deposit-panel__summary-row">
                  <span className="admin-gold-deposit-panel__summary-label">User:</span>
                  <span className="admin-gold-deposit-panel__summary-value">
                    {selectedUser?.username}#{selectedUser?.discriminator}
                  </span>
                </div>
                <div className="admin-gold-deposit-panel__summary-row">
                  <span className="admin-gold-deposit-panel__summary-label">Realm:</span>
                  <span className="admin-gold-deposit-panel__summary-value">
                    {selectedRealm?.displayName}
                  </span>
                </div>
                <div className="admin-gold-deposit-panel__summary-row">
                  <span className="admin-gold-deposit-panel__summary-label">Amount:</span>
                  <span className="admin-gold-deposit-panel__summary-value">
                    {depositAmount.toLocaleString()} gold
                  </span>
                </div>
                <div className="admin-gold-deposit-panel__summary-row">
                  <span className="admin-gold-deposit-panel__summary-label">Status:</span>
                  <span className="admin-gold-deposit-panel__summary-value admin-gold-deposit-panel__summary-value--suspended">
                    Suspended for 2 months
                  </span>
                </div>
                <div className="admin-gold-deposit-panel__summary-row">
                  <span className="admin-gold-deposit-panel__summary-label">Withdrawable Date:</span>
                  <span className="admin-gold-deposit-panel__summary-value">
                    {new Date(Date.now() + (2 * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="admin-gold-deposit-panel__actions">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!formData.userId || !formData.realmId || !formData.amount || depositAmount <= 0}
            >
              Deposit Gold
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="admin-gold-deposit-panel__dialog-overlay">
            <div className="admin-gold-deposit-panel__dialog">
              <div className="admin-gold-deposit-panel__dialog-header">
                <h4>Confirm Gold Deposit</h4>
              </div>
              <div className="admin-gold-deposit-panel__dialog-content">
                <p>
                  Are you sure you want to deposit <strong>{depositAmount.toLocaleString()} gold</strong> to{' '}
                  <strong>{selectedUser?.username}#{selectedUser?.discriminator}</strong>'s{' '}
                  <strong>{selectedRealm?.displayName}</strong> wallet?
                </p>
                <div className="admin-gold-deposit-panel__dialog-warning">
                  <p>⚠️ This gold will be suspended for 2 months and cannot be directly withdrawn until {new Date(Date.now() + (2 * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}.</p>
                  <p>The user can convert it to USD/Toman with additional fees before the restriction expires.</p>
                </div>
              </div>
              <div className="admin-gold-deposit-panel__dialog-actions">
                <Button variant="secondary" onClick={handleCancelConfirm}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmDeposit}>
                  Confirm Deposit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
};