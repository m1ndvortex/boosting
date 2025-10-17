import React from 'react';
import './Earnings.css';

export const Earnings: React.FC = () => {
  return (
    <div className="advertiser-earnings">
      <div className="advertiser-earnings__header">
        <h1 className="advertiser-earnings__title">Earnings</h1>
        <p className="advertiser-earnings__subtitle">
          Track your earnings from completed orders
        </p>
      </div>

      <div className="advertiser-earnings__stats">
        <div className="advertiser-earnings__stat-card">
          <div className="advertiser-earnings__stat-icon">💰</div>
          <div className="advertiser-earnings__stat-content">
            <div className="advertiser-earnings__stat-value">$1,245</div>
            <div className="advertiser-earnings__stat-label">Total USD Earnings</div>
          </div>
        </div>

        <div className="advertiser-earnings__stat-card">
          <div className="advertiser-earnings__stat-icon">🏆</div>
          <div className="advertiser-earnings__stat-content">
            <div className="advertiser-earnings__stat-value">450,000G</div>
            <div className="advertiser-earnings__stat-label">Total Gold Earnings</div>
          </div>
        </div>

        <div className="advertiser-earnings__stat-card">
          <div className="advertiser-earnings__stat-icon">💎</div>
          <div className="advertiser-earnings__stat-content">
            <div className="advertiser-earnings__stat-value">25,000,000﷼</div>
            <div className="advertiser-earnings__stat-label">Total Toman Earnings</div>
          </div>
        </div>
      </div>

      <div className="advertiser-earnings__content">
        <div className="advertiser-earnings__empty">
          <div className="advertiser-earnings__empty-icon">📊</div>
          <h2 className="advertiser-earnings__empty-title">Earnings Dashboard Coming Soon</h2>
          <p className="advertiser-earnings__empty-text">
            Detailed earnings analytics and reports will be available here.
          </p>
        </div>
      </div>
    </div>
  );
};