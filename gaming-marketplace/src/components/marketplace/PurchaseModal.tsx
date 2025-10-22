import React, { useState } from 'react';
import { MarketplaceService } from '../../services/marketplaceService';
import type { ServiceListing } from '../../services/marketplaceService';
import { useAuth } from '../../contexts/AuthContext';
import { useMultiWallet } from '../../contexts/MultiWalletContext';
import { Modal } from '../discord/Modal';
import type { Currency, GoldWalletBalance } from '../../types';
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
  const { state: multiWalletState, deductForPurchase } = useMultiWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('usd');
  const [selectedGoldWallet, setSelectedGoldWallet] = useState<string>('');
  const [selectedGoldType, setSelectedGoldType] = useState<'suspended' | 'withdrawable'>('withdrawable');
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
    if (!multiWalletState.wallet) return 0;
    
    if (currency === 'usd') {
      return multiWalletState.wallet.staticWallets.usd.balance;
    } else if (currency === 'toman') {
      return multiWalletState.wallet.staticWallets.toman.balance;
    } else if (currency === 'gold' && selectedGoldWallet) {
      const goldWallet = multiWalletState.wallet.goldWallets[selectedGoldWallet];
      if (!goldWallet) return 0;
      return selectedGoldType === 'suspended' ? goldWallet.suspendedGold : goldWallet.withdrawableGold;
    }
    return 0;
  };

  const getPrice = (currency: Currency): number => {
    return service.prices[currency];
  };

  const hasInsufficientFunds = (currency: Currency): boolean => {
    return getBalance(currency) < getPrice(currency);
  };

  const getAvailableGoldWallets = (): GoldWalletBalance[] => {
    if (!multiWalletState.wallet) return [];
    return Object.values(multiWalletState.wallet.goldWallets);
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

    if (selectedCurrency === 'gold' && !selectedGoldWallet) {
      setError('Please select a gold wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine wallet type and ID
      let walletType: 'static' | 'gold';
      let walletId: string;
      let goldType: 'suspended' | 'withdrawable' | undefined;

      if (selectedCurrency === 'gold') {
        walletType = 'gold';
        walletId = selectedGoldWallet;
        goldType = selectedGoldType;
      } else {
        walletType = 'static';
        walletId = selectedCurrency;
      }

      // Deduct payment from wallet
      await deductForPurchase(
        getPrice(selectedCurrency),
        walletType,
        walletId,
        `service_${service.id}`,
        goldType
      );

      // Create order
      await MarketplaceService.purchaseService(
        service.id,
        authState.user.id,
        selectedCurrency,
        selectedCurrency === 'gold' ? selectedGoldWallet : undefined,
        selectedCurrency === 'gold' ? selectedGoldType : undefined
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
              let balance = 0;
              let insufficient = true;
              
              if (currency === 'gold') {
                // For gold, we need to check if any gold wallet has sufficient funds
                const goldWallets = getAvailableGoldWallets();
                const hasGoldWallets = goldWallets.length > 0;
                if (hasGoldWallets && selectedGoldWallet) {
                  balance = getBalance(currency);
                  insufficient = hasInsufficientFunds(currency);
                } else {
                  insufficient = !hasGoldWallets;
                }
              } else {
                balance = getBalance(currency);
                insufficient = hasInsufficientFunds(currency);
              }
              
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
                    onChange={(e) => {
                      setSelectedCurrency(e.target.value as Currency);
                      if (e.target.value === 'gold') {
                        const goldWallets = getAvailableGoldWallets();
                        if (goldWallets.length > 0) {
                          setSelectedGoldWallet(goldWallets[0].realmId);
                        }
                      }
                    }}
                    disabled={insufficient}
                  />
                  
                  <div className="purchase-modal__currency-info">
                    <div className="purchase-modal__currency-price">
                      {formatPrice(price, currency)}
                    </div>
                    {currency !== 'gold' && (
                      <div className="purchase-modal__currency-balance">
                        Balance: {formatPrice(balance, currency)}
                      </div>
                    )}
                    {currency === 'gold' && getAvailableGoldWallets().length === 0 && (
                      <div className="purchase-modal__insufficient-notice">
                        No gold wallets available
                      </div>
                    )}
                    {currency !== 'gold' && insufficient && (
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

        {/* Gold Wallet Selection */}
        {selectedCurrency === 'gold' && (
          <div className="purchase-modal__gold-wallet-selection">
            <h4 className="purchase-modal__section-title">Select Gold Wallet</h4>
            
            <div className="purchase-modal__gold-wallets">
              {getAvailableGoldWallets().map(goldWallet => (
                <label
                  key={goldWallet.realmId}
                  className={`purchase-modal__gold-wallet-option ${
                    selectedGoldWallet === goldWallet.realmId ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="goldWallet"
                    value={goldWallet.realmId}
                    checked={selectedGoldWallet === goldWallet.realmId}
                    onChange={(e) => setSelectedGoldWallet(e.target.value)}
                  />
                  
                  <div className="purchase-modal__gold-wallet-info">
                    <div className="purchase-modal__gold-wallet-name">
                      {`${goldWallet.realmName} Gold`}
                    </div>
                    <div className="purchase-modal__gold-wallet-balances">
                      <div className="purchase-modal__gold-balance">
                        <span>Withdrawable: {goldWallet.withdrawableGold.toLocaleString()}G</span>
                      </div>
                      <div className="purchase-modal__gold-balance">
                        <span>Suspended: {goldWallet.suspendedGold.toLocaleString()}G</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Gold Type Selection */}
            {selectedGoldWallet && (
              <div className="purchase-modal__gold-type-selection">
                <h5 className="purchase-modal__subsection-title">Gold Type</h5>
                <div className="purchase-modal__gold-type-options">
                  <label className={`purchase-modal__gold-type-option ${selectedGoldType === 'withdrawable' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="goldType"
                      value="withdrawable"
                      checked={selectedGoldType === 'withdrawable'}
                      onChange={(e) => setSelectedGoldType(e.target.value as 'suspended' | 'withdrawable')}
                    />
                    <span>Use Withdrawable Gold</span>
                  </label>
                  <label className={`purchase-modal__gold-type-option ${selectedGoldType === 'suspended' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="goldType"
                      value="suspended"
                      checked={selectedGoldType === 'suspended'}
                      onChange={(e) => setSelectedGoldType(e.target.value as 'suspended' | 'withdrawable')}
                    />
                    <span>Use Suspended Gold</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

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
              {selectedCurrency === 'gold' && selectedGoldWallet ? (
                `${getBalance(selectedCurrency).toLocaleString()}G (${selectedGoldType})`
              ) : (
                formatPrice(getBalance(selectedCurrency), selectedCurrency)
              )}
            </span>
          </div>
          
          <div className="purchase-modal__summary-row purchase-modal__summary-row--total">
            <span>Remaining Balance:</span>
            <span className="purchase-modal__summary-remaining">
              {selectedCurrency === 'gold' && selectedGoldWallet ? (
                `${(getBalance(selectedCurrency) - getPrice(selectedCurrency)).toLocaleString()}G`
              ) : (
                formatPrice(
                  getBalance(selectedCurrency) - getPrice(selectedCurrency),
                  selectedCurrency
                )
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