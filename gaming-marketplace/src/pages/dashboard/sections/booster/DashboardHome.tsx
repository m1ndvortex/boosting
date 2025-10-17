import React from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import './DashboardHome.css';

export const DashboardHome: React.FC = () => {
  const { state } = useAuth();

  return (
    <div className="booster-dashboard-home">
      <div className="booster-dashboard-home__header">
        <h1 className="booster-dashboard-home__title">
          Welcome back, {state.user?.username}!
        </h1>
        <p className="booster-dashboard-home__subtitle">
          Booster Dashboard - Manage your assigned orders and track earnings
        </p>
      </div>

      <div className="booster-dashboard-home__stats">
        <div className="booster-dashboard-home__stat-card">
          <div className="booster-dashboard-home__stat-icon">📋</div>
          <div className="booster-dashboard-home__stat-content">
            <div className="booster-dashboard-home__stat-value">3</div>
            <div className="booster-dashboard-home__stat-label">Active Orders</div>
          </div>
        </div>

        <div className="booster-dashboard-home__stat-card">
          <div className="booster-dashboard-home__stat-icon">✅</div>
          <div className="booster-dashboard-home__stat-content">
            <div className="booster-dashboard-home__stat-value">12</div>
            <div className="booster-dashboard-home__stat-label">Completed Orders</div>
          </div>
        </div>

        <div className="booster-dashboard-home__stat-card">
          <div className="booster-dashboard-home__stat-icon">💰</div>
          <div className="booster-dashboard-home__stat-content">
            <div className="booster-dashboard-home__stat-value">$245</div>
            <div className="booster-dashboard-home__stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="booster-dashboard-home__stat-card">
          <div className="booster-dashboard-home__stat-icon">⭐</div>
          <div className="booster-dashboard-home__stat-content">
            <div className="booster-dashboard-home__stat-value">4.8</div>
            <div className="booster-dashboard-home__stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      <div className="booster-dashboard-home__recent">
        <h2 className="booster-dashboard-home__section-title">Recent Activity</h2>
        <div className="booster-dashboard-home__activity-list">
          <div className="booster-dashboard-home__activity-item">
            <div className="booster-dashboard-home__activity-icon">✅</div>
            <div className="booster-dashboard-home__activity-content">
              <div className="booster-dashboard-home__activity-title">
                Order #ORD-001 completed
              </div>
              <div className="booster-dashboard-home__activity-time">2 hours ago</div>
            </div>
          </div>

          <div className="booster-dashboard-home__activity-item">
            <div className="booster-dashboard-home__activity-icon">📋</div>
            <div className="booster-dashboard-home__activity-content">
              <div className="booster-dashboard-home__activity-title">
                New order assigned: Mythic+15 Weekly
              </div>
              <div className="booster-dashboard-home__activity-time">5 hours ago</div>
            </div>
          </div>

          <div className="booster-dashboard-home__activity-item">
            <div className="booster-dashboard-home__activity-icon">💰</div>
            <div className="booster-dashboard-home__activity-content">
              <div className="booster-dashboard-home__activity-title">
                Payment received: $25.00
              </div>
              <div className="booster-dashboard-home__activity-time">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};