import React from 'react';
import type { ShopProduct, Currency } from '../../types';
import { ShopService } from '../../services/shopService';
import './ProductCard.css';

export interface ProductCardProps {
  product: ShopProduct;
  onPurchase: (product: ShopProduct, currency: Currency, paymentMethod: 'wallet' | 'card') => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPurchase,
  className = ''
}) => {
  const classes = [
    'product-card',
    className
  ].filter(Boolean).join(' ');

  const handlePurchaseClick = (currency: Currency, paymentMethod: 'wallet' | 'card') => {
    onPurchase(product, currency, paymentMethod);
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
    </div>
  );
};