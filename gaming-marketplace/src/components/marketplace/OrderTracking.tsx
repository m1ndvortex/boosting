import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceService } from '../../services/marketplaceService';

import type { Order } from '../../types';
import './OrderTracking.css';

interface OrderTrackingProps {
  userId: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const userOrders = await MarketplaceService.getUserPurchaseHistory(userId);
      // Sort by creation date, newest first
      const sortedOrders = userOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'pending':
        return 'var(--discord-warning)';
      case 'assigned':
        return 'var(--discord-accent)';
      case 'in_progress':
        return 'var(--discord-accent)';
      case 'evidence_submitted':
        return 'var(--discord-warning)';
      case 'under_review':
        return 'var(--discord-warning)';
      case 'completed':
        return 'var(--discord-success)';
      case 'rejected':
        return 'var(--discord-danger)';
      default:
        return 'var(--discord-text-secondary)';
    }
  };

  const getStatusText = (status: Order['status']): string => {
    switch (status) {
      case 'pending':
        return 'Pending Assignment';
      case 'assigned':
        return 'Assigned to Booster';
      case 'in_progress':
        return 'In Progress';
      case 'evidence_submitted':
        return 'Evidence Submitted';
      case 'under_review':
        return 'Under Review';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Order['status']): string => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'assigned':
        return '👤';
      case 'in_progress':
        return '🔄';
      case 'evidence_submitted':
        return '📸';
      case 'under_review':
        return '👀';
      case 'completed':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatPrice = (price: number, currency: 'gold' | 'usd' | 'toman') => {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getProgressPercentage = (status: Order['status']): number => {
    switch (status) {
      case 'pending':
        return 10;
      case 'assigned':
        return 25;
      case 'in_progress':
        return 50;
      case 'evidence_submitted':
        return 75;
      case 'under_review':
        return 85;
      case 'completed':
        return 100;
      case 'rejected':
        return 100;
      default:
        return 0;
    }
  };

  const handleBackClick = () => {
    navigate('/marketplace');
  };

  const handleViewHistoryClick = () => {
    navigate('/marketplace/history');
  };

  if (loading) {
    return (
      <div className="order-tracking">
        <div className="order-tracking__loading">
          <div className="order-tracking__loading-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking">
        <div className="order-tracking__error">
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
          <button 
            className="discord-button discord-button--primary"
            onClick={loadOrders}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      {/* Header */}
      <div className="order-tracking__header">
        <div className="order-tracking__title-section">
          <button 
            className="order-tracking__back-button discord-button discord-button--secondary"
            onClick={handleBackClick}
          >
            ← Back to Marketplace
          </button>
          <h1 className="order-tracking__title">📋 My Orders</h1>
          <p className="order-tracking__subtitle">
            Track the progress of your service orders
          </p>
        </div>
        
        <div className="order-tracking__actions">
          <button 
            className="discord-button discord-button--secondary"
            onClick={handleViewHistoryClick}
          >
            📜 View All History
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="order-tracking__content">
        {orders.length === 0 ? (
          <div className="order-tracking__empty">
            <div className="order-tracking__empty-icon">📋</div>
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet. Browse the marketplace to find services!</p>
            <button 
              className="discord-button discord-button--primary"
              onClick={handleBackClick}
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="order-tracking__orders">
            {orders.map(order => (
              <div key={order.id} className="order-tracking__order">
                {/* Order Header */}
                <div className="order-tracking__order-header">
                  <div className="order-tracking__order-info">
                    <h3 className="order-tracking__order-title">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <div className="order-tracking__order-meta">
                      <span>Placed on {formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span>{formatPrice(order.pricePaid, order.currency)}</span>
                    </div>
                  </div>
                  
                  <div className="order-tracking__order-status">
                    <div 
                      className="order-tracking__status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      <span className="order-tracking__status-icon">
                        {getStatusIcon(order.status)}
                      </span>
                      <span className="order-tracking__status-text">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="order-tracking__progress">
                  <div className="order-tracking__progress-bar">
                    <div 
                      className="order-tracking__progress-fill"
                      style={{ 
                        width: `${getProgressPercentage(order.status)}%`,
                        backgroundColor: getStatusColor(order.status)
                      }}
                    />
                  </div>
                  <div className="order-tracking__progress-text">
                    {getProgressPercentage(order.status)}% Complete
                  </div>
                </div>

                {/* Order Details */}
                <div className="order-tracking__order-details">
                  <div className="order-tracking__detail-item">
                    <span className="order-tracking__detail-label">Service ID:</span>
                    <span className="order-tracking__detail-value">{order.serviceId}</span>
                  </div>
                  
                  {order.boosterId && (
                    <div className="order-tracking__detail-item">
                      <span className="order-tracking__detail-label">Booster:</span>
                      <span className="order-tracking__detail-value">{order.boosterId}</span>
                    </div>
                  )}
                  
                  {order.completedAt && (
                    <div className="order-tracking__detail-item">
                      <span className="order-tracking__detail-label">Completed:</span>
                      <span className="order-tracking__detail-value">
                        {formatDate(order.completedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status-specific Information */}
                {order.status === 'pending' && (
                  <div className="order-tracking__status-info order-tracking__status-info--pending">
                    <span className="order-tracking__status-info-icon">⏳</span>
                    <span>Waiting for booster assignment. This usually takes a few minutes.</span>
                  </div>
                )}

                {order.status === 'assigned' && (
                  <div className="order-tracking__status-info order-tracking__status-info--assigned">
                    <span className="order-tracking__status-info-icon">👤</span>
                    <span>A booster has been assigned and will start working on your order soon.</span>
                  </div>
                )}

                {order.status === 'in_progress' && (
                  <div className="order-tracking__status-info order-tracking__status-info--progress">
                    <span className="order-tracking__status-info-icon">🔄</span>
                    <span>Your booster is actively working on your service.</span>
                  </div>
                )}

                {order.status === 'evidence_submitted' && (
                  <div className="order-tracking__status-info order-tracking__status-info--evidence">
                    <span className="order-tracking__status-info-icon">📸</span>
                    <span>Booster has submitted completion evidence. Under review.</span>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="order-tracking__status-info order-tracking__status-info--completed">
                    <span className="order-tracking__status-info-icon">✅</span>
                    <span>Service completed successfully! Payment has been released.</span>
                  </div>
                )}

                {order.status === 'rejected' && (
                  <div className="order-tracking__status-info order-tracking__status-info--rejected">
                    <span className="order-tracking__status-info-icon">❌</span>
                    <span>Evidence was rejected. Booster will resubmit or provide refund.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};