import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { ServiceService } from '../../../../services/serviceService';
import type { Service, Order } from '../../../../types';
import './DashboardHome.css';

export const DashboardHome: React.FC = () => {
  const { state } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!state.user) return;
      
      try {
        const [userServices, userOrders] = await Promise.all([
          ServiceService.getUserServices(state.user.id),
          ServiceService.getUserOrders(state.user.id)
        ]);
        
        setServices(userServices);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [state.user]);

  if (loading) {
    return (
      <div className="dashboard-home__loading">
        <div className="dashboard-home__spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const activeServices = services.filter(s => s.status === 'active').length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  // const totalEarnings = orders
  //   .filter(o => o.status === 'completed')
  //   .reduce((sum, o) => sum + o.pricePaid, 0);

  return (
    <div className="dashboard-home">
      <div className="dashboard-home__header">
        <h1>Dashboard Home</h1>
        <p>Welcome back, {state.user?.username}! Here's your service overview.</p>
      </div>

      <div className="dashboard-home__stats">
        <div className="dashboard-home__stat-card">
          <div className="dashboard-home__stat-icon">⚙️</div>
          <div className="dashboard-home__stat-content">
            <h3>Active Services</h3>
            <p className="dashboard-home__stat-number">{activeServices}</p>
          </div>
        </div>

        <div className="dashboard-home__stat-card">
          <div className="dashboard-home__stat-icon">📋</div>
          <div className="dashboard-home__stat-content">
            <h3>Total Orders</h3>
            <p className="dashboard-home__stat-number">{totalOrders}</p>
          </div>
        </div>

        <div className="dashboard-home__stat-card">
          <div className="dashboard-home__stat-icon">⏳</div>
          <div className="dashboard-home__stat-content">
            <h3>Pending Orders</h3>
            <p className="dashboard-home__stat-number">{pendingOrders}</p>
          </div>
        </div>

        <div className="dashboard-home__stat-card">
          <div className="dashboard-home__stat-icon">✅</div>
          <div className="dashboard-home__stat-content">
            <h3>Completed Orders</h3>
            <p className="dashboard-home__stat-number">{completedOrders}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-home__content">
        <div className="dashboard-home__section">
          <h2>Recent Orders</h2>
          <div className="dashboard-home__orders">
            {orders.slice(0, 5).map((order) => {
              const service = services.find(s => s.id === order.serviceId);
              return (
                <div key={order.id} className="dashboard-home__order-item">
                  <div className="dashboard-home__order-info">
                    <h4>{service?.title || 'Unknown Service'}</h4>
                    <p>Order #{order.id.slice(-6)}</p>
                  </div>
                  <div className="dashboard-home__order-status">
                    <span className={`dashboard-home__status-badge dashboard-home__status-badge--${order.status}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="dashboard-home__order-price">
                    {order.pricePaid} {order.currency.toUpperCase()}
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && (
              <p className="dashboard-home__empty">No orders yet. Create some services to get started!</p>
            )}
          </div>
        </div>

        <div className="dashboard-home__section">
          <h2>Quick Actions</h2>
          <div className="dashboard-home__actions">
            <button className="dashboard-home__action-btn">
              <span className="dashboard-home__action-icon">➕</span>
              Create New Service
            </button>
            <button className="dashboard-home__action-btn">
              <span className="dashboard-home__action-icon">👥</span>
              Assign Boosters
            </button>
            <button className="dashboard-home__action-btn">
              <span className="dashboard-home__action-icon">📊</span>
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};