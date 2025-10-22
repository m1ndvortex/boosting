import React from 'react';

export const DashboardHome: React.FC = () => {
  // Mock data for platform statistics
  const stats = {
    totalUsers: 1247,
    activeServices: 89,
    pendingOrders: 23,
    totalRevenue: 15420,
    pendingWithdrawals: 8,
    activeGames: 3,
  };

  const recentActivity = [
    { id: 1, type: 'order', message: 'New order #ORD-1001 created', time: '2 minutes ago' },
    { id: 2, type: 'user', message: 'User "NewBooster" requested Booster role', time: '15 minutes ago' },
    { id: 3, type: 'withdrawal', message: 'Withdrawal request for $250 pending approval', time: '1 hour ago' },
    { id: 4, type: 'service', message: 'New Mythic+ service created by TeamLeader', time: '2 hours ago' },
    { id: 5, type: 'order', message: 'Order #ORD-998 completed successfully', time: '3 hours ago' },
  ];

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Dashboard Overview</h2>
        <p className="admin-section__description">
          Key metrics and platform statistics at a glance
        </p>
      </div>

      <div className="admin-section__content">
        {/* Key Metrics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">👥</div>
            <div className="stat-card__value">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-card__label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">🎮</div>
            <div className="stat-card__value">{stats.activeServices}</div>
            <div className="stat-card__label">Active Services</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📋</div>
            <div className="stat-card__value">{stats.pendingOrders}</div>
            <div className="stat-card__label">Pending Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">💰</div>
            <div className="stat-card__value">${stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-card__label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">⏳</div>
            <div className="stat-card__value">{stats.pendingWithdrawals}</div>
            <div className="stat-card__label">Pending Withdrawals</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">🎯</div>
            <div className="stat-card__value">{stats.activeGames}</div>
            <div className="stat-card__label">Active Games</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Recent Activity</h3>
          </div>
          <div className="admin-card__content">
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-item__icon">
                      {activity.type === 'order' && '📋'}
                      {activity.type === 'user' && '👤'}
                      {activity.type === 'withdrawal' && '💸'}
                      {activity.type === 'service' && '🎮'}
                    </div>
                    <div className="activity-item__content">
                      <div className="activity-item__message">{activity.message}</div>
                      <div className="activity-item__time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">📊</div>
                <div className="empty-state__title">No Recent Activity</div>
                <div className="empty-state__description">
                  Platform activity will appear here as it happens
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Quick Actions</h3>
          </div>
          <div className="admin-card__content">
            <div className="quick-actions">
              <button className="admin-button">
                🎮 Add New Game
              </button>
              <button className="admin-button admin-button--secondary">
                👥 Review Role Requests
              </button>
              <button className="admin-button admin-button--secondary">
                💰 Approve Withdrawals
              </button>
              <button className="admin-button admin-button--secondary">
                📋 Review Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--discord-bg-tertiary);
          border-radius: 6px;
        }

        .activity-item__icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .activity-item__content {
          flex: 1;
        }

        .activity-item__message {
          font-size: 14px;
          color: var(--discord-text-primary);
          margin-bottom: 4px;
        }

        .activity-item__time {
          font-size: 12px;
          color: var(--discord-text-muted);
        }

        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
      `}</style>
    </div>
  );
};