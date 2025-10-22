import React, { useState } from 'react';
import type { ShopProduct, Currency, GoldWalletBalance } from '../../types';
import { ShopService } from '../../services/shopService';
import { useMultiWallet } from '../../contexts/MultiWalletContext';
import { Modal } from '../discord/Modal';
import { GoldWalletSelector } from '../wallet/GoldWalletSelector';
import './ProductCard.css';

export interface ProductCardProps {
  product: ShopProduct;
  onPurchase: (product: ShopProduct, currency: Currency, paymentMethod: 'wallet' | 'card', walletId?: string, goldType?: 'suspended' | 'withdrawable') => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPurchase,
  className = ''
}) => {
  const { state: multiWalletState } = useMultiWallet();
  const [showGoldWalletModal, setShowGoldWalletModal] = useState(false);
  const [selectedGoldWallet, setSelectedGoldWallet] = useState<string>('');
  const [selectedGoldType, setSelectedGoldType] = useState<'suspended' | 'withdrawable'>('withdrawable');

  const classes = [
    'product-card',
    className
  ].filter(Boolean).join(' ');

  const getAvailableGoldWallets = (): GoldWalletBalance[] => {
    if (!multiWalletState.wallet) return [];
    return Object.values(multiWalletState.wallet.goldWallets);
  };

  const handlePurchaseClick = (currency: Currency, paymentMethod: 'wallet' | 'card') => {
    if (currency === 'gold' && paymentMethod === 'wallet') {
      // Show gold wallet selection modal
      const goldWallets = getAvailableGoldWallets();
      if (goldWallets.length === 0) {
        // No gold wallets available, show error or redirect to wallet management
        alert('No gold wallets available. Please add a gold wallet first.');
        return;
      }
      
      // Set default selection to first wallet with sufficient funds
      const price = product.prices.gold;
      const suitableWallet = goldWallets.find(wallet => 
        wallet.withdrawableGold >= price || wallet.suspendedGold >= price
      );
      
      if (suitableWallet) {
        setSelectedGoldWallet(suitableWallet.realmId);
        setSelectedGoldType(suitableWallet.withdrawableGold >= price ? 'withdrawable' : 'suspended');
      } else {
        setSelectedGoldWallet(goldWallets[0].realmId);
        setSelectedGoldType('withdrawable');
      }
      
      setShowGoldWalletModal(true);
    } else {
      // Direct purchase for non-gold currencies or card payments
      onPurchase(product, currency, paymentMethod);
    }
  };

  const handleGoldWalletConfirm = () => {
    if (!selectedGoldWallet) return;
    
    onPurchase(product, 'gold', 'wallet', selectedGoldWallet, selectedGoldType);
    setShowGoldWalletModal(false);
  };

  const handleGoldWalletCancel = () => {
    setShowGoldWalletModal(false);
  };

  return (
    <div className={classes}>
      <div className="product-card__header">
        <div className="product-card__icon">🎮</div>
        <div className="product-card__info">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
          <div className="product-card__duration">
            <span className="product-card__duration-icon">⏰</span>
            <span>{product.durationDays} days</span>
          </div>
        </div>
      </div>

      <div className="product-card__pricing">
        <h4 className="product-card__pricing-title">Pricing</h4>
        <div className="product-card__prices">
          <div className="product-card__price">
            <span className="product-card__currency">Gold</span>
            <span className="product-card__amount">
              {ShopService.formatCurrency(product.prices.gold, 'gold')}
            </span>
          </div>
          <div className="product-card__price">
            <span className="product-card__currency">USD</span>
            <span className="product-card__amount">
              {ShopService.formatCurrency(product.prices.usd, 'usd')}
            </span>
          </div>
          <div className="product-card__price">
            <span className="product-card__currency">Toman</span>
            <span className="product-card__amount">
              {ShopService.formatCurrency(product.prices.toman, 'toman')}
            </span>
          </div>
        </div>
      </div>

      <div className="product-card__actions">
        <div className="product-card__payment-section">
          <h5 className="product-card__payment-title">Gold Payment</h5>
          <button
            className="product-card__buy-button product-card__buy-button--wallet"
            onClick={() => handlePurchaseClick('gold', 'wallet')}
          >
            <span className="product-card__button-icon">💰</span>
            Buy with Wallet
          </button>
        </div>

        <div className="product-card__payment-section">
          <h5 className="product-card__payment-title">USD Payment</h5>
          <div className="product-card__payment-buttons">
            <button
              className="product-card__buy-button product-card__buy-button--wallet"
              onClick={() => handlePurchaseClick('usd', 'wallet')}
            >
              <span className="product-card__button-icon">💰</span>
              Buy with Wallet
            </button>
            <button
              className="product-card__buy-button product-card__buy-button--card"
              onClick={() => handlePurchaseClick('usd', 'card')}
            >
              <span className="product-card__button-icon">💳</span>
              Buy with Card
            </button>
          </div>
        </div>

        <div className="product-card__payment-section">
          <h5 className="product-card__payment-title">Toman Payment</h5>
          <div className="product-card__payment-buttons">
            <button
              className="product-card__buy-button product-card__buy-button--wallet"
              onClick={() => handlePurchaseClick('toman', 'wallet')}
            >
              <span className="product-card__button-icon">💰</span>
              Buy with Wallet
            </button>
            <button
              className="product-card__buy-button product-card__buy-button--card"
              onClick={() => handlePurchaseClick('toman', 'card')}
            >
              <span className="product-card__button-icon">💳</span>
              Buy with Card
            </button>
          </div>
        </div>
      </div>

      {/* Gold Wallet Selection Modal */}
      <Modal
        isOpen={showGoldWalletModal}
        onClose={handleGoldWalletCancel}
        title="Select Gold Wallet"
        size="md"
      >
        <div className="product-card__gold-wallet-modal">
          <div className="product-card__modal-header">
            <h3 className="product-card__modal-title">Choose Gold Wallet for Purchase</h3>
            <div className="product-card__modal-product">
              <span className="product-card__modal-product-name">{product.name}</span>
              <span className="product-card__modal-product-price">
                {ShopService.formatCurrency(product.prices.gold, 'gold')}
              </span>
            </div>
          </div>

          <GoldWalletSelector
            goldWallets={getAvailableGoldWallets()}
            selectedWalletId={selectedGoldWallet}
            selectedGoldType={selectedGoldType}
            requiredAmount={product.prices.gold}
            onWalletChange={setSelectedGoldWallet}
            onGoldTypeChange={setSelectedGoldType}
            className="product-card__gold-wallet-selector"
          />

          <div className="product-card__modal-actions">
            <button
              type="button"
              className="discord-button discord-button--secondary"
              onClick={handleGoldWalletCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="discord-button discord-button--primary"
              onClick={handleGoldWalletConfirm}
              disabled={!selectedGoldWallet}
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};