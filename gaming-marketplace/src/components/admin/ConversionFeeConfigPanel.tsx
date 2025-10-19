import React, { useState, useEffect } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import { ConversionFeeService } from '../../services/conversionFeeService';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingOverlay } from '../common/LoadingStates';
import type { ConversionFeeConfig } from '../../types';
import './ConversionFeeConfigPanel.css';

interface ConversionFeeConfigPanelProps {
  className?: string;
}

interface FeeFormData {
  usdFee: string;
  tomanFee: string;
}

export const ConversionFeeConfigPanel: React.FC<ConversionFeeConfigPanelProps> = ({ className = '' }) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConversionFeeConfig | null>(null);
  const [formData, setFormData] = useState<FeeFormData>({
    usdFee: '',
    tomanFee: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FeeFormData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [feeHistory, setFeeHistory] = useState<ConversionFeeConfig[]>([]);

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const currentConfig = ConversionFeeService.getConversionFeeConfig();
      setConfig(currentConfig);
      
      // Set form data to current values
      setFormData({
        usdFee: currentConfig.suspendedGoldToUsd.toString(),
        tomanFee: currentConfig.suspendedGoldToToman.toString()
      });
    } catch (error) {
      console.error('Failed to load conversion fee configuration:', error);
      showError('Load Failed', 'Failed to load conversion fee configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const history = ConversionFeeService.getConversionFeeHistory();
      setFeeHistory(history);
    } catch (error) {
      console.error('Failed to load fee history:', error);
      showError('Load Failed', 'Failed to load fee history. Please try again.');
    }
  };

  const validateForm = (data: FeeFormData): boolean => {
    const errors: Partial<FeeFormData> = {};

    // Validate USD fee
    if (!data.usdFee.trim()) {
      errors.usdFee = 'USD fee is required';
    } else {
      const usdFee = parseFloat(data.usdFee);
      if (isNaN(usdFee)) {
        errors.usdFee = 'USD fee must be a valid number';
      } else if (usdFee < 0) {
        errors.usdFee = 'USD fee cannot be negative';
      } else if (usdFee > 100) {
        errors.usdFee = 'USD fee cannot exceed 100%';
      }
    }

    // Validate Toman fee
    if (!data.tomanFee.trim()) {
      errors.tomanFee = 'Toman fee is required';
    } else {
      const tomanFee = parseFloat(data.tomanFee);
      if (isNaN(tomanFee)) {
        errors.tomanFee = 'Toman fee must be a valid number';
      } else if (tomanFee < 0) {
        errors.tomanFee = 'Toman fee cannot be negative';
      } else if (tomanFee > 100) {
        errors.tomanFee = 'Toman fee cannot exceed 100%';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleStartEdit = () => {
    if (!config) return;
    
    setFormData({
      usdFee: config.suspendedGoldToUsd.toString(),
      tomanFee: config.suspendedGoldToToman.toString()
    });
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!config) return;
    
    setFormData({
      usdFee: config.suspendedGoldToUsd.toString(),
      tomanFee: config.suspendedGoldToToman.toString()
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const usdFee = parseFloat(formData.usdFee);
      const tomanFee = parseFloat(formData.tomanFee);

      const updatedConfig = await ConversionFeeService.updateConversionFees(
        usdFee,
        tomanFee,
        'admin' // TODO: Get actual admin ID from auth context
      );

      setConfig(updatedConfig);
      setIsEditing(false);
      
      showSuccess(
        'Configuration Updated',
        `Conversion fees updated successfully. USD: ${usdFee}%, Toman: ${tomanFee}%`
      );
    } catch (error: any) {
      console.error('Failed to update conversion fees:', error);
      showError(
        'Update Failed',
        error.message || 'Failed to update conversion fees. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!config) return;

    setLoading(true);
    try {
      const updatedConfig = config.isActive
        ? await ConversionFeeService.disableConversionFees('admin')
        : await ConversionFeeService.enableConversionFees('admin');

      setConfig(updatedConfig);
      
      showSuccess(
        'Status Updated',
        `Conversion fees ${updatedConfig.isActive ? 'enabled' : 'disabled'} successfully.`
      );
    } catch (error: any) {
      console.error('Failed to toggle conversion fees:', error);
      showError(
        'Update Failed',
        error.message || 'Failed to update conversion fee status. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset conversion fees to default values? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const defaultConfig = await ConversionFeeService.resetToDefaults('admin');
      setConfig(defaultConfig);
      
      setFormData({
        usdFee: defaultConfig.suspendedGoldToUsd.toString(),
        tomanFee: defaultConfig.suspendedGoldToToman.toString()
      });
      
      setIsEditing(false);
      
      showSuccess(
        'Reset Complete',
        'Conversion fees have been reset to default values.'
      );
    } catch (error: any) {
      console.error('Failed to reset conversion fees:', error);
      showError(
        'Reset Failed',
        error.message || 'Failed to reset conversion fees. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    if (!showHistory) {
      await loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const calculateExampleConversion = (amount: number, currency: 'usd' | 'toman'): { fee: number; net: number } => {
    if (!config) return { fee: 0, net: amount };
    
    const feePercentage = currency === 'usd' ? config.suspendedGoldToUsd : config.suspendedGoldToToman;
    const fee = (amount * feePercentage) / 100;
    const net = amount - fee;
    
    return { fee, net };
  };

  if (!config) {
    return (
      <LoadingOverlay isLoading={true} message="Loading configuration...">
        <div className={`conversion-fee-config-panel ${className}`}>
          <div className="conversion-fee-config-panel__loading">
            Loading conversion fee configuration...
          </div>
        </div>
      </LoadingOverlay>
    );
  }

  return (
    <LoadingOverlay isLoading={loading} message="Updating configuration...">
      <div className={`conversion-fee-config-panel ${className}`}>
        <div className="conversion-fee-config-panel__header">
          <h3 className="conversion-fee-config-panel__title">Conversion Fee Configuration</h3>
          <p className="conversion-fee-config-panel__description">
            Configure fees applied when users convert suspended gold to fiat currencies before the 2-month restriction expires.
          </p>
        </div>

        {/* Current Configuration */}
        <div className="conversion-fee-config-panel__current">
          <div className="conversion-fee-config-panel__current-header">
            <h4>Current Configuration</h4>
            <div className="conversion-fee-config-panel__status">
              <span className={`conversion-fee-config-panel__status-badge ${config.isActive ? 'conversion-fee-config-panel__status-badge--active' : 'conversion-fee-config-panel__status-badge--inactive'}`}>
                {config.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="conversion-fee-config-panel__current-values">
            <div className="conversion-fee-config-panel__fee-display">
              <div className="conversion-fee-config-panel__fee-item">
                <span className="conversion-fee-config-panel__fee-label">USD Conversion Fee:</span>
                <span className="conversion-fee-config-panel__fee-value">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.usdFee}
                      onChange={(e) => handleInputChange('usdFee', e.target.value)}
                      error={formErrors.usdFee}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0.0"
                    />
                  ) : (
                    `${config.suspendedGoldToUsd}%`
                  )}
                </span>
              </div>
              
              <div className="conversion-fee-config-panel__fee-item">
                <span className="conversion-fee-config-panel__fee-label">Toman Conversion Fee:</span>
                <span className="conversion-fee-config-panel__fee-value">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.tomanFee}
                      onChange={(e) => handleInputChange('tomanFee', e.target.value)}
                      error={formErrors.tomanFee}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0.0"
                    />
                  ) : (
                    `${config.suspendedGoldToToman}%`
                  )}
                </span>
              </div>
            </div>

            <div className="conversion-fee-config-panel__meta">
              <p className="conversion-fee-config-panel__meta-item">
                <strong>Last Updated:</strong> {config.updatedAt.toLocaleString()}
              </p>
              <p className="conversion-fee-config-panel__meta-item">
                <strong>Updated By:</strong> {config.updatedBy}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="conversion-fee-config-panel__actions">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleShowHistory}>
                {showHistory ? 'Hide History' : 'View History'}
              </Button>
              <Button variant="secondary" onClick={handleResetToDefaults}>
                Reset to Defaults
              </Button>
              <Button 
                variant={config.isActive ? 'danger' : 'success'} 
                onClick={handleToggleActive}
              >
                {config.isActive ? 'Disable Fees' : 'Enable Fees'}
              </Button>
              <Button variant="primary" onClick={handleStartEdit}>
                Edit Configuration
              </Button>
            </>
          )}
        </div>

        {/* Example Calculations */}
        <div className="conversion-fee-config-panel__examples">
          <h4>Example Conversions</h4>
          <p className="conversion-fee-config-panel__examples-description">
            Examples showing how fees are applied to suspended gold conversions:
          </p>
          
          <div className="conversion-fee-config-panel__examples-grid">
            {[1000, 5000, 10000].map(amount => {
              const usdExample = calculateExampleConversion(amount, 'usd');
              const tomanExample = calculateExampleConversion(amount, 'toman');
              
              return (
                <div key={amount} className="conversion-fee-config-panel__example-card">
                  <h5>{amount.toLocaleString()} Suspended Gold</h5>
                  
                  <div className="conversion-fee-config-panel__example-conversion">
                    <div className="conversion-fee-config-panel__example-row">
                      <span>To USD:</span>
                      <span>
                        {usdExample.net.toFixed(2)} gold 
                        <small>(fee: {usdExample.fee.toFixed(2)})</small>
                      </span>
                    </div>
                    
                    <div className="conversion-fee-config-panel__example-row">
                      <span>To Toman:</span>
                      <span>
                        {tomanExample.net.toFixed(2)} gold 
                        <small>(fee: {tomanExample.fee.toFixed(2)})</small>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History */}
        {showHistory && (
          <div className="conversion-fee-config-panel__history">
            <h4>Configuration History</h4>
            
            {feeHistory.length === 0 ? (
              <p className="conversion-fee-config-panel__history-empty">
                No configuration history available.
              </p>
            ) : (
              <div className="conversion-fee-config-panel__history-list">
                {feeHistory.slice(0, 10).map((historyConfig, index) => (
                  <div key={`${historyConfig.id}-${historyConfig.updatedAt.getTime()}`} className="conversion-fee-config-panel__history-item">
                    <div className="conversion-fee-config-panel__history-header">
                      <span className="conversion-fee-config-panel__history-date">
                        {historyConfig.updatedAt.toLocaleString()}
                      </span>
                      <span className="conversion-fee-config-panel__history-user">
                        by {historyConfig.updatedBy}
                      </span>
                      {index === 0 && (
                        <span className="conversion-fee-config-panel__history-current">Current</span>
                      )}
                    </div>
                    <div className="conversion-fee-config-panel__history-values">
                      <span>USD: {historyConfig.suspendedGoldToUsd}%</span>
                      <span>Toman: {historyConfig.suspendedGoldToToman}%</span>
                      <span className={`conversion-fee-config-panel__history-status ${historyConfig.isActive ? 'active' : 'inactive'}`}>
                        {historyConfig.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
};