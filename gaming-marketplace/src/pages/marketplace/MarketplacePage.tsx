import React from 'react';
import { Header } from '../../components/layout/Header';
import './MarketplacePage.css';

export const MarketplacePage: React.FC = () => {
  return (
    <div className="marketplace-page">
      <Header
        title="Marketplace"
        subtitle="Browse and purchase gaming services"
      />
      
      <div className="marketplace-page__content">
        <div className="marketplace-page__placeholder">
          <div className="marketplace-page__icon">🛒</div>
          <h2>Marketplace Coming Soon</h2>
          <p>
            This is where you'll be able to browse and purchase gaming services
            from verified boosters and advertisers.
          </p>
          
          <div className="marketplace-page__features">
            <div className="marketplace-page__feature">
              <span className="marketplace-page__feature-icon">🔍</span>
              <span>Search & Filter Services</span>
            </div>
            <div className="marketplace-page__feature">
              <span className="marketplace-page__feature-icon">💰</span>
              <span>Multi-Currency Pricing</span>
            </div>
            <div className="marketplace-page__feature">
              <span className="marketplace-page__feature-icon">⭐</span>
              <span>Ratings & Reviews</span>
            </div>
            <div className="marketplace-page__feature">
              <span className="marketplace-page__feature-icon">📊</span>
              <span>Order Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};