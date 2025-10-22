// Suspended Gold Display Component - Shows suspended gold with conversion options

import React, { useState, useEffect } from 'react';
import type { GoldWalletBalance } from '../../types';
import { MultiWalletService } from '../../services/multiWalletService';
// import { ConversionFeeService } from '../../services/conversionFeeService';
import './SuspendedGoldDisplay.css';

interface SuspendedGoldDisplayProps {
  goldWallet: GoldWalletBalance;
  onConvertToFiat: (amount: number, currency: 'usd' | 'toman') => void;
  loading?: boolean;
}

interface ConversionPreview {
  originalAmount: number;
  feeAmount: number;
  netGoldAmount: number;
  exchangeRate: number;
  finalFiatAmount: number;
  feePercentage: number;
}

export const SuspendedGoldDisplay: React.FC<SuspendedGoldDisplayProps> = ({
  goldWallet,
  onConvertToFiat,
  loading = false
}) => {
  const [showConversionForm, setShowConversionForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'toman'>('usd');
  const [conversionAmount, setConversionAmount] = useState<string>('');
  const [conversionPreview, setConversionPreview] = useState<ConversionPreview | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate conversion preview when amount or currency changes
  useEffect(() => {
    const calculatePreview = async () => {
      const amount = parseFloat(conversionAmount);
      if (!amount || amount <= 0 || amount > goldWallet.suspendedGold) {
        setConversionPreview(null);
        return;
      }

      setPreviewLoading(true);
      try {
        const preview = await MultiWalletService.getConversionPreview(
          amount,
          'gold',
          selectedCurrency,
          'suspended'
        );
        setConversionPreview(preview);
      } catch (error) {
        console.error('Error calculating conversion preview:', error);
        setConversionPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    };

    if (conversionAmount && showConversionForm) {
      const debounceTimer = setTimeout(calculatePreview, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setConversionPreview(null);
    }
  }, [conversionAmount, selectedCurrency, goldWallet.suspendedGold, showConversionForm]);

  const formatGoldAmount = (amount: number): string => {
    return `${amount.toLocaleString()} G`;
  };

  const formatCurrency = (amount: number, currency: 'usd' | 'toman'): string => {
    switch (currency) {
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()} ﷼`;
      default:
        return amount.toString();
    }
  };

  const getTimeUntilWithdrawable = (withdrawableAt: Date): string => {
    const timeLeft = withdrawableAt.getTime() - currentTime.getTime();
    
    if (timeLeft <= 0) return 'Available now';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getTimeProgress = (depositedAt: Date, withdrawableAt: Date): number => {
    const totalTime = withdrawableAt.getTime() - depositedAt.getTime();
    const elapsedTime = currentTime.getTime() - depositedAt.getTime();
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  const handleStartConversion = () => {
    if (goldWallet.suspendedGold <= 0) return;
    setShowConversionForm(true);
    setConversionAmount('');
    setConversionPreview(null);
    setShowConfirmation(false);
  };

  const handleCancelConversion = () => {
    setShowConversionForm(false);
    setConversionAmount('');
    setConversionPreview(null);
    setShowConfirmation(false);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setConversionAmount(sanitized);
  };

  const handleMaxAmount = () => {
    setConversionAmount(goldWallet.suspendedGold.toString());
  };

  const handlePreviewConversion = () => {
    if (conversionPreview) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmConversion = () => {
    if (conversionPreview && !loading) {
      onConvertToFiat(conversionPreview.originalAmount, selectedCurrency);
      handleCancelConversion();
    }
  };

  const isValidAmount = (): boolean => {
    const amount = parseFloat(conversionAmount);
    return amount > 0 && amount <= goldWallet.suspendedGold;
  };

  if (goldWallet.suspendedGold <= 0) {
    return (
      <div className="suspended-gold-display" data-testid="suspended-gold-display">
        <div className="suspended-gold-display__header">
          <div className="suspended-gold-display__title">
            <span className="suspended-gold-display__icon">⏳</span>
            <h3>Suspended Gold</h3>
          </div>
        </div>
        <div className="suspended-gold-display__empty">
          <div className="suspended-gold-display__empty-icon">✅</div>
          <h4>No Suspended Gold</h4>
          <p>All your gold in this wallet is available for withdrawal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suspended-gold-display" data-testid="suspended-gold-display">
      <div className="suspended-gold-display__header">
        <div className="suspended-gold-display__title">
          <span className="suspended-gold-display__icon">⏳</span>
          <h3>Suspended Gold</h3>
          <span className="suspended-gold-display__amount">
            {formatGoldAmount(goldWallet.suspendedGold)}
          </span>
        </div>
        {!showConversionForm && (
          <button 
            className="suspended-gold-display__convert-btn"
            onClick={handleStartConversion}
            disabled={loading || goldWallet.suspendedGold <= 0}
          >
            <span className="suspended-gold-display__convert-icon">💱</span>
            Convert to Fiat
          </button>
        )}
      </div>

      <div className="suspended-gold-display__info">
        <div className="suspended-gold-display__info-item">
          <span className="suspended-gold-display__info-icon">ℹ️</span>
          <div className="suspended-gold-display__info-text">
            <strong>Suspended gold</strong> cannot be withdrawn directly but can be converted to USD or Toman with additional fees.
          </div>
        </div>
      </div>

      {/* Suspended Deposits List */}
      <div className="suspended-gold-display__deposits">
        <div className="suspended-gold-display__deposits-header">
          <h4>Deposit History</h4>
          <span className="suspended-gold-display__deposits-count">
            {goldWallet.suspendedDeposits.filter(d => d.status === 'suspended').length} active
          </span>
        </div>
        
        <div className="suspended-gold-display__deposits-list">
          {goldWallet.suspendedDeposits.map(deposit => {
            const progress = getTimeProgress(new Date(deposit.depositedAt), new Date(deposit.withdrawableAt));
            const timeRemaining = getTimeUntilWithdrawable(new Date(deposit.withdrawableAt));
            const isExpired = new Date(deposit.withdrawableAt) <= currentTime;
            
            return (
              <div 
                key={deposit.id} 
                className={`suspended-gold-display__deposit ${deposit.status} ${isExpired ? 'expired' : ''}`}
              >
                <div className="suspended-gold-display__deposit-header">
                  <div className="suspended-gold-display__deposit-amount">
                    <span className="suspended-gold-display__deposit-icon">
                      {isExpired ? '✅' : '⏳'}
                    </span>
                    {formatGoldAmount(deposit.amount)}
                  </div>
                  <div className="suspended-gold-display__deposit-status">
                    {isExpired ? 'Available Now' : timeRemaining}
                  </div>
                </div>
                
                {!isExpired && (
                  <div className="suspended-gold-display__deposit-progress">
                    <div className="suspended-gold-display__progress-bar">
                      <div 
                        className="suspended-gold-display__progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="suspended-gold-display__progress-text">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>
                )}
                
                <div className="suspended-gold-display__deposit-details">
                  <div className="suspended-gold-display__deposit-date">
                    Deposited: {new Date(deposit.depositedAt).toLocaleDateString()}
                  </div>
                  <div className="suspended-gold-display__deposit-date">
                    {isExpired ? 'Became' : 'Becomes'} withdrawable: {new Date(deposit.withdrawableAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion Form */}
      {showConversionForm && (
        <div className="suspended-gold-display__conversion-form">
          <div className="suspended-gold-display__form-header">
            <h4>Convert Suspended Gold</h4>
            <p>Convert your suspended gold to fiat currency with additional fees</p>
          </div>
          
          <div className="suspended-gold-display__form-content">
            <div className="suspended-gold-display__form-row">
              <div className="suspended-gold-display__form-group">
                <label className="suspended-gold-display__form-label">
                  Amount to Convert
                </label>
                <div className="suspended-gold-display__amount-input">
                  <input
                    type="text"
                    value={conversionAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter amount..."
                    className="suspended-gold-display__input"
                    disabled={loading}
                  />
                  <span className="suspended-gold-display__input-suffix">G</span>
                  <button 
                    className="suspended-gold-display__max-btn"
                    onClick={handleMaxAmount}
                    disabled={loading}
                  >
                    MAX
                  </button>
                </div>
                <div className="suspended-gold-display__input-info">
                  Available: {formatGoldAmount(goldWallet.suspendedGold)}
                </div>
              </div>
              
              <div className="suspended-gold-display__form-group">
                <label className="suspended-gold-display__form-label">
                  Target Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as 'usd' | 'toman')}
                  className="suspended-gold-display__select"
                  disabled={loading}
                >
                  <option value="usd">USD ($)</option>
                  <option value="toman">Toman (﷼)</option>
                </select>
              </div>
            </div>

            {/* Conversion Preview */}
            {(conversionPreview || previewLoading) && (
              <div className="suspended-gold-display__preview">
                <div className="suspended-gold-display__preview-header">
                  <h5>Conversion Preview</h5>
                  {previewLoading && (
                    <div className="suspended-gold-display__preview-loading">
                      Calculating...
                    </div>
                  )}
                </div>
                
                {conversionPreview && !previewLoading && (
                  <div className="suspended-gold-display__preview-content">
                    <div className="suspended-gold-display__preview-row">
                      <span className="suspended-gold-display__preview-label">
                        Original Amount:
                      </span>
                      <span className="suspended-gold-display__preview-value">
                        {formatGoldAmount(conversionPreview.originalAmount)}
                      </span>
                    </div>
                    
                    <div className="suspended-gold-display__preview-row fee">
                      <span className="suspended-gold-display__preview-label">
                        Conversion Fee ({conversionPreview.feePercentage}%):
                      </span>
                      <span className="suspended-gold-display__preview-value fee">
                        -{formatGoldAmount(conversionPreview.feeAmount)}
                      </span>
                    </div>
                    
                    <div className="suspended-gold-display__preview-row">
                      <span className="suspended-gold-display__preview-label">
                        Net Gold Amount:
                      </span>
                      <span className="suspended-gold-display__preview-value">
                        {formatGoldAmount(conversionPreview.netGoldAmount)}
                      </span>
                    </div>
                    
                    <div className="suspended-gold-display__preview-row">
                      <span className="suspended-gold-display__preview-label">
                        Exchange Rate:
                      </span>
                      <span className="suspended-gold-display__preview-value">
                        1 G = {formatCurrency(conversionPreview.exchangeRate, selectedCurrency)}
                      </span>
                    </div>
                    
                    <div className="suspended-gold-display__preview-row final">
                      <span className="suspended-gold-display__preview-label">
                        You Will Receive:
                      </span>
                      <span className="suspended-gold-display__preview-value final">
                        {formatCurrency(conversionPreview.finalFiatAmount, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="suspended-gold-display__form-actions">
              {!showConfirmation ? (
                <>
                  <button 
                    className="suspended-gold-display__preview-btn"
                    onClick={handlePreviewConversion}
                    disabled={!isValidAmount() || previewLoading || loading || !conversionPreview}
                  >
                    {previewLoading ? 'Calculating...' : 'Preview Conversion'}
                  </button>
                  <button 
                    className="suspended-gold-display__cancel-btn"
                    onClick={handleCancelConversion}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="suspended-gold-display__confirm-btn"
                    onClick={handleConfirmConversion}
                    disabled={loading || !conversionPreview}
                  >
                    {loading ? 'Converting...' : 'Confirm Conversion'}
                  </button>
                  <button 
                    className="suspended-gold-display__back-btn"
                    onClick={() => setShowConfirmation(false)}
                    disabled={loading}
                  >
                    Back to Edit
                  </button>
                </>
              )}
            </div>

            {/* Confirmation Warning */}
            {showConfirmation && conversionPreview && (
              <div className="suspended-gold-display__confirmation-warning">
                <div className="suspended-gold-display__warning-icon">⚠️</div>
                <div className="suspended-gold-display__warning-content">
                  <h5>Confirm Conversion</h5>
                  <p>
                    You are about to convert <strong>{formatGoldAmount(conversionPreview.originalAmount)}</strong> suspended gold 
                    to <strong>{formatCurrency(conversionPreview.finalFiatAmount, selectedCurrency)}</strong>.
                  </p>
                  <p>
                    A conversion fee of <strong>{formatGoldAmount(conversionPreview.feeAmount)}</strong> ({conversionPreview.feePercentage}%) 
                    will be deducted from your gold before conversion.
                  </p>
                  <p className="suspended-gold-display__warning-note">
                    <strong>This action cannot be undone.</strong>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};