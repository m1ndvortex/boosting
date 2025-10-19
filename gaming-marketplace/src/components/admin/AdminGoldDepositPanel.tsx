import React, { useState, useEffect } from 'react';
import { Button } from '../discord/Button';
import { MultiWalletService } from '../../services/multiWalletService';
import { GameManagementService } from '../../services/gameManagementService';
import { MultiWalletValidationService } from '../../services/multiWalletValidationService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAdminOperation } from '../../hooks/useAsyncOperation';
import { useFormValidation } from '../../hooks/useFormValidation';
import { LoadingOverlay } from '../common/LoadingStates';
import { FormField, AmountField } from '../common/FormField';
import { UIErrorHandler } from '../../utils/errorHandling';
import type { User, GameRealm } from '../../types';
import './AdminGoldDepositPanel.css';

interface AdminGoldDepositPanelProps {
  className?: string;
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
  const { showError } = useNotifications();
  const { state: asyncState, executeAdminOperation } = useAdminOperation();
  const [availableRealms, setAvailableRealms] = useState<GameRealm[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [depositPreview, setDepositPreview] = useState<{
    user: User;
    realm: GameRealm;
    amount: number;
  } | null>(null);

  // Form validation setup
  const [formState, formActions] = useFormValidation({
    initialValues: {
      userId: '',
      realmId: '',
      amount: ''
    },
    validators: {
      userId: (value) => {
        if (!value || value.toString().trim().length === 0) {
          return {
            isValid: false,
            errors: [{
              field: 'userId',
              code: 'REQUIRED_FIELD_MISSING',
              message: 'Please select a user'
            }]
          };
        }
        return { isValid: true, errors: [] };
      },
      realmId: (value) => {
        if (!value || value.toString().trim().length === 0) {
          return {
            isValid: false,
            errors: [{
              field: 'realmId',
              code: 'REQUIRED_FIELD_MISSING',
              message: 'Please select a realm'
            }]
          };
        }
        return { isValid: true, errors: [] };
      },
      amount: (value, formData) => {
        const validation = MultiWalletValidationService.validateAdminGoldDeposit(
          formData.userId || '',
          formData.realmId || '',
          parseFloat(value.toString()) || 0,
          'admin' // Mock admin ID
        );
        
        return {
          isValid: validation.errors.filter(e => e.field === 'amount').length === 0,
          errors: validation.errors.filter(e => e.field === 'amount'),
          warnings: validation.warnings?.filter(w => w.field === 'amount')
        };
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
    debounceDelay: 500
  });

  // Load available realms on component mount
  useEffect(() => {
    loadAvailableRealms();
  }, []);

  const loadAvailableRealms = async () => {
    const { error } = await UIErrorHandler.withErrorHandling(async () => {
      // Initialize the service if needed
      GameManagementService.initialize();
      const realms = GameManagementService.getAllActiveRealms();
      setAvailableRealms(realms);
      return realms;
    }, {
      context: 'load_realms',
      showNotification: true,
      fallbackMessage: 'Failed to load available realms'
    });

    if (error) {
      showError('Load Failed', UIErrorHandler.getUserFriendlyMessage(error));
    }
  };

  const handleFormSubmit = async () => {
    // Validate form
    const validationResult = await formActions.validateForm();
    if (!validationResult.isValid) {
      showError('Validation Error', 'Please fix the form errors before submitting.');
      return;
    }

    // Prepare deposit preview
    const selectedUser = MOCK_USERS.find(u => u.id === formState.values.userId);
    const selectedRealm = availableRealms.find(r => r.id === formState.values.realmId);
    const amount = parseFloat(formState.values.amount);

    if (!selectedUser || !selectedRealm) {
      showError('Invalid Selection', 'Please select valid user and realm.');
      return;
    }

    setDepositPreview({
      user: selectedUser,
      realm: selectedRealm,
      amount
    });
    setShowConfirmDialog(true);
  };

  const confirmDeposit = async () => {
    if (!depositPreview) return;

    const result = await executeAdminOperation(
      () => MultiWalletService.addSuspendedGold(
        depositPreview.user.id,
        depositPreview.realm.id,
        depositPreview.amount,
        'admin' // Mock admin ID
      ),
      'deposit_gold',
      {
        successMessage: `Successfully deposited ${depositPreview.amount} gold to ${depositPreview.user.username}'s ${depositPreview.realm.displayName} wallet`
      }
    );

    if (result.success) {
      // Reset form
      formActions.reset();
      setShowConfirmDialog(false);
      setDepositPreview(null);
    }
  };

  const cancelDeposit = () => {
    setShowConfirmDialog(false);
    setDepositPreview(null);
  };

  const selectedUser = MOCK_USERS.find(u => u.id === formState.values.userId);
  const selectedRealm = availableRealms.find(r => r.id === formState.values.realmId);
  const depositAmount = parseFloat(formState.values.amount) || 0;

  return (
    <LoadingOverlay isLoading={asyncState.loading} message="Processing gold deposit...">
      <div className={`admin-gold-deposit-panel ${className}`} data-testid="admin-gold-deposit-panel">
        <div className="admin-gold-deposit-panel__header">
          <h3 className="admin-gold-deposit-panel__title">Admin Gold Deposit</h3>
          <p className="admin-gold-deposit-panel__description">
            Deposit gold to user accounts with 2-month withdrawal restrictions. 
            Users can convert suspended gold to fiat currencies with fees before the restriction expires.
          </p>
        </div>

        {asyncState.error && (
          <div className="admin-gold-deposit-panel__error-banner">
            <span className="admin-gold-deposit-panel__error-icon">⚠️</span>
            <span>{asyncState.error}</span>
          </div>
        )}

        <div className="admin-gold-deposit-panel__form">
          <div className="admin-gold-deposit-panel__form-fields">
            {/* User Selection */}
            <FormField
              label="Select User"
              name="userId"
              type="select"
              value={formState.values.userId}
              onChange={(value) => formActions.setValue('userId', value)}
              onBlur={() => formActions.markFieldTouched('userId')}
              error={formState.errors.userId}
              required
              disabled={asyncState.loading}
              options={MOCK_USERS.map(user => ({
                value: user.id,
                label: `${user.username}#${user.discriminator} (${user.roles[0]?.name || 'No role'})`
              }))}
              placeholder="Choose a user..."
              data-testid="user-select"
            />

            {/* Realm Selection */}
            <FormField
              label="Select Realm"
              name="realmId"
              type="select"
              value={formState.values.realmId}
              onChange={(value) => formActions.setValue('realmId', value)}
              onBlur={() => formActions.markFieldTouched('realmId')}
              error={formState.errors.realmId}
              required
              disabled={asyncState.loading}
              options={availableRealms.map(realm => ({
                value: realm.id,
                label: `${realm.gameName} - ${realm.realmName}`
              }))}
              placeholder="Choose a realm..."
              data-testid="realm-select"
            />

            {/* Amount Input */}
            <AmountField
              label="Gold Amount"
              name="amount"
              value={formState.values.amount}
              onChange={(value) => formActions.setValue('amount', value)}
              onBlur={() => formActions.markFieldTouched('amount')}
              error={formState.errors.amount}
              warning={formState.warnings.amount?.[0]}
              required
              disabled={asyncState.loading}
              currency="gold"
              minAmount={1}
              maxAmount={1000000}
              helpText="Gold will be suspended for 2 months from deposit date"
              data-testid="amount-input"
            />
          </div>

          {/* Deposit Summary */}
          {formState.values.userId && formState.values.realmId && depositAmount > 0 && (
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
              onClick={handleFormSubmit}
              disabled={!formState.isValid || asyncState.loading}
              loading={asyncState.loading}
              data-testid="deposit-button"
            >
              Deposit Gold
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && depositPreview && (
          <div className="admin-gold-deposit-panel__dialog-overlay">
            <div className="admin-gold-deposit-panel__dialog">
              <div className="admin-gold-deposit-panel__dialog-header">
                <h4>Confirm Gold Deposit</h4>
              </div>
              <div className="admin-gold-deposit-panel__dialog-content">
                <p>
                  Are you sure you want to deposit <strong>{depositPreview.amount.toLocaleString()} gold</strong> to{' '}
                  <strong>{depositPreview.user.username}#{depositPreview.user.discriminator}</strong>'s{' '}
                  <strong>{depositPreview.realm.displayName}</strong> wallet?
                </p>
                <div className="admin-gold-deposit-panel__dialog-warning">
                  <p>⚠️ This gold will be suspended for 2 months and cannot be directly withdrawn until {new Date(Date.now() + (2 * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}.</p>
                  <p>The user can convert it to USD/Toman with additional fees before the restriction expires.</p>
                </div>
              </div>
              <div className="admin-gold-deposit-panel__dialog-actions">
                <Button 
                  variant="secondary" 
                  onClick={cancelDeposit}
                  disabled={asyncState.loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={confirmDeposit}
                  loading={asyncState.loading}
                  data-testid="confirm-deposit-button"
                >
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