import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { OrderService } from '../../../../services/orderService';
import type { Order } from '../../../../types';
import './MyEarnings.css';

export const MyEarnings: React.FC = () => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, [state.user?.id]);

  const loadEarnings = async () => {
    if (!state.user?.id) return;
    
    try {
      setLoading(true);
      const boosterOrders = await OrderService.getBoosterOrders(state.user.id);
      setOrders(boosterOrders);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalEarnings = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const totals = {
      gold: 0,
      usd: 0,
      toman: 0
    };

    completedOrders.forEach(order => {
      totals[order.currency] += order.pricePaid;
    });

    return totals;
  };

  const formatCurrency = (amount: number, currency: string) => {
    switch (currency) {
      case 'gold':
        return `${amount.toLocaleString()}G`;
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()}﷼`;
      default:
        return `${amount}`;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'var(--discord-success)';
      case 'in_progress':
        return 'var(--discord-accent)';
      case 'evidence_submitted':
        return 'var(--discord-warning)';
      default:
        return 'var(--discord-text-secondary)';
    }
  };

  const totals = calculateTotalEarnings();
  const completedOrders = orders.filter(order => order.status === 'completed');
  const pendingOrders = orders.filter(order => 
    ['assigned', 'in_progress', 'evidence_submitted', 'under_review'].includes(order.status)
  );

  if (loading) {
    return (
      <div className="my-earnings__loading">
        <div className="my-earnings__loading-spinner"></div>
        <p>Loading your earnings...</p>
      </div>
    );
  }

  return (
    <div className="my-earnings">
      <div className="my-earnings__header">
        <h1 className="my-earnings__title">My Earnings</h1>
        <p className="my-earnings__subtitle">
          Track your completed orders and total earnings
        </p>
      </div>

      <div className="my-earnings__summary">
        <div className="my-earnings__summary-card">
          <h2 className="my-earnings__summary-title">Total Earnings</h2>
          <div className="my-earnings__totals">
            <div className="my-earnings__total-item">
              <span className="my-earnings__total-amount">{formatCurrency(totals.gold, 'gold')}</span>
              <span className="my-earnings__total-label">Gold</span>
            </div>
            <div className="my-earnings__total-item">
              <span className="my-earnings__total-amount">{formatCurrency(totals.usd, 'usd')}</span>
              <span className="my-earnings__total-label">USD</span>
            </div>
            <div className="my-earnings__total-item">
              <span className="my-earnings__total-amount">{formatCurrency(totals.toman, 'toman')}</span>
              <span className="my-earnings__total-label">Toman</span>
            </div>
          </div>
        </div>

        <div className="my-earnings__stats">
          <div className="my-earnings__stat-card">
            <div className="my-earnings__stat-icon">✅</div>
            <div className="my-earnings__stat-content">
              <div className="my-earnings__stat-value">{completedOrders.length}</div>
              <div className="my-earnings__stat-label">Completed Orders</div>
            </div>
          </div>

          <div className="my-earnings__stat-card">
            <div className="my-earnings__stat-icon">⏳</div>
            <div className="my-earnings__stat-content">
              <div className="my-earnings__stat-value">{pendingOrders.length}</div>
              <div className="my-earnings__stat-label">Pending Orders</div>
            </div>
          </div>

          <div className="my-earnings__stat-card">
            <div className="my-earnings__stat-icon">⭐</div>
            <div className="my-earnings__stat-content">
              <div className="my-earnings__stat-value">4.8</div>
              <div className="my-earnings__stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-earnings__orders">
        <h2 className="my-earnings__section-title">Recent Orders</h2>
        
        {orders.length === 0 ? (
          <div className="my-earnings__empty">
            <div className="my-earnings__empty-icon">💰</div>
            <h3 className="my-earnings__empty-title">No Earnings Yet</h3>
            <p className="my-earnings__empty-text">
              Complete your first order to start earning!
            </p>
          </div>
        ) : (
          <div className="my-earnings__order-list">
            {orders.map((order) => (
              <div key={order.id} className="my-earnings__order-card">
                <div className="my-earnings__order-header">
                  <div className="my-earnings__order-id">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </div>
                  <div 
                    className="my-earnings__order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="my-earnings__order-content">
                  <div className="my-earnings__order-info">
                    <div className="my-earnings__order-amount">
                      {formatCurrency(order.pricePaid, order.currency)}
                    </div>
                    <div className="my-earnings__order-date">
                      {order.createdAt.toLocaleDateString()}
                    </div>
                  </div>

                  {order.completedAt && (
                    <div className="my-earnings__completion-date">
                      Completed: {order.completedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};