import React, { useState } from 'react';
import { MarketplaceService } from '../../services/marketplaceService';
import type { ServiceListing } from '../../services/marketplaceService';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { Modal } from '../discord/Modal';
import type { Currency } from '../../types';
import './PurchaseModal.css';

interface PurchaseModalProps {
  service: ServiceListing;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  service,
  onClose,
  onPurchaseComplete
}) => {
  const { state: authState } = useAuth();
  const { state: walletState, deductForPurchase } = useWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('usd');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number, currency: Currency) => {
    switch (currency) {
      case 'gold':
        return `${price.toLocaleString()}G`;
      case 'usd':
        return `$${price}`;
      case 'toman':
        return `﷼${price.toLocaleString()}`;
      default:
        return `${price}`;
    }
  };

  const getBalance = (currency: Currency): number => {
    if (!walletState.wallet) return 0;
    return walletState.wallet.balances[currency];
  };

  const getPrice = (currency: Currency): number => {
    return service.prices[currency];
  };

  const hasInsufficientFunds = (currency: Currency): boolean => {
    return getBalance(currency) < getPrice(currency);
  };

  const handlePurchase = async () => {
    if (!authState.user) {
      setError('You must be logged in to make a purchase');
      return;
    }

    if (hasInsufficientFunds(selectedCurrency)) {
      setError(`Insufficient ${selectedCurrency.toUpperCase()} balance`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Deduct payment from wallet
      await deductForPurchase(
        getPrice(selectedCurrency),
        selectedCurrency,
        `service_${service.id}`
      );

      // Create order
      await MarketplaceService.purchaseService(
        service.id,
        authState.user.id,
        selectedCurrency
      );

      onPurchaseComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Purchase Service"
      className="purchase-modal"
    >
      <div className="purchase-modal__content">
        {/* Service Summary */}
        <div className="purchase-modal__service">
          <div className="purchase-modal__service-header">
            <span className="purchase-modal__game-icon">{service.game.icon}</span>
            <div className="purchase-modal__service-info">
              <h3 className="purchase-modal__service-title">{service.title}</h3>
              <div className="purchase-modal__service-meta">
                <span>{service.game.name}</span>
                <span>•</span>
                <span>{service.serviceType.name}</span>
              </div>
            </div>
          </div>
          
          <div className="purchase-modal__provider">
            <span className="purchase-modal__provider-label">Provider:</span>
            <span className="purchase-modal__provider-name">
              {service.advertiser.username}#{service.advertiser.discriminator}
            </span>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="purchase-modal__currency-selection">
          <h4 className="purchase-modal__section-title">Select Payment Currency</h4>
          
          <div className="purchase-modal__currency-options">
            {(['usd', 'gold', 'toman'] as Currency[]).map(currency => {
              const price = getPrice(currency);
              const balance = getBalance(currency);
              const insufficient = hasInsufficientFunds(currency);
              
              return (
                <label
                  key={currency}
                  className={`purchase-modal__currency-option ${
                    selectedCurrency === currency ? 'selected' : ''
                  } ${insufficient ? 'insufficient' : ''}`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={currency}
                    checked={selectedCurrency === currency}
                    onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                    disabled={insufficient}
                  />
                  
                  <div className="purchase-modal__currency-info">
                    <div className="purchase-modal__currency-price">
                      {formatPrice(price, currency)}
                    </div>
                    <div className="purchase-modal__currency-balance">
                      Balance: {formatPrice(balance, currency)}
                    </div>
                    {insufficient && (
                      <div className="purchase-modal__insufficient-notice">
                        Insufficient funds
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="purchase-modal__summary">
          <h4 className="purchase-modal__section-title">Purchase Summary</h4>
          
          <div className="purchase-modal__summary-row">
            <span>Service Price:</span>
            <span className="purchase-modal__summary-price">
              {formatPrice(getPrice(selectedCurrency), selectedCurrency)}
            </span>
          </div>
          
          <div className="purchase-modal__summary-row">
            <span>Current Balance:</span>
            <span>
              {formatPrice(getBalance(selectedCurrency), selectedCurrency)}
            </span>
          </div>
          
          <div className="purchase-modal__summary-row purchase-modal__summary-row--total">
            <span>Remaining Balance:</span>
            <span className="purchase-modal__summary-remaining">
              {formatPrice(
                getBalance(selectedCurrency) - getPrice(selectedCurrency),
                selectedCurrency
              )}
            </span>
          </div>
        </div>

        {/* Purchase Info */}
        <div className="purchase-modal__info">
          <div className="purchase-modal__info-item">
            <span className="purchase-modal__info-icon">🔒</span>
            <span>Payment will be held in escrow until service completion</span>
          </div>
          <div className="purchase-modal__info-item">
            <span className="purchase-modal__info-icon">⏱️</span>
            <span>Estimated completion: {service.completionTime}</span>
          </div>
          <div className="purchase-modal__info-item">
            <span className="purchase-modal__info-icon">📋</span>
            <span>You can track progress in your orders page</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="purchase-modal__error">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="purchase-modal__actions">
          <button
            type="button"
            className="discord-button discord-button--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="button"
            className="discord-button discord-button--primary"
            onClick={handlePurchase}
            disabled={loading || hasInsufficientFunds(selectedCurrency)}
          >
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </Modal>
  );
};