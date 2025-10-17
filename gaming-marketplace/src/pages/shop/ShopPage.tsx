import React from 'react';
import { Header } from '../../components/layout/Header';
import './ShopPage.css';

export const ShopPage: React.FC = () => {
  return (
    <div className="shop-page">
      <Header
        title="Shop"
        subtitle="Game time products and subscriptions"
      />
      
      <div className="shop-page__content">
        <div className="shop-page__placeholder">
          <div className="shop-page__icon">🏪</div>
          <h2>Shop Coming Soon</h2>
          <p>
            Purchase game time and subscription products with your wallet balance
            or direct payment methods.
          </p>
          
          <div className="shop-page__features">
            <div className="shop-page__feature">
              <span className="shop-page__feature-icon">⏰</span>
              <span>Game Time Products</span>
            </div>
            <div className="shop-page__feature">
              <span className="shop-page__feature-icon">💳</span>
              <span>Dual Payment Options</span>
            </div>
            <div className="shop-page__feature">
              <span className="shop-page__feature-icon">🎫</span>
              <span>Instant Code Generation</span>
            </div>
            <div className="shop-page__feature">
              <span className="shop-page__feature-icon">📋</span>
              <span>Purchase History</span>
            </div>
          </div>
          
          <div className="shop-page__preview">
            <h3>Available Products</h3>
            <div className="shop-page__products">
              <div className="shop-page__product">
                <span className="shop-page__product-icon">🎮</span>
                <span className="shop-page__product-name">WoW 30 Days</span>
              </div>
              <div className="shop-page__product">
                <span className="shop-page__product-icon">🎮</span>
                <span className="shop-page__product-name">WoW 60 Days</span>
              </div>
              <div className="shop-page__product">
                <span className="shop-page__product-icon">🎮</span>
                <span className="shop-page__product-name">WoW 90 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};