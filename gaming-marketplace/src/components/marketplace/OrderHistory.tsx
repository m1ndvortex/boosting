import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceService } from '../../services/marketplaceService';

import type { Order } from '../../types';
import './OrderHistory.css';

interface OrderHistoryProps {
  userId: string;
}

interface OrderWithService extends Order {
  serviceName?: string;
  gameIcon?: string;
  gameName?: string;
  serviceTypeName?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadOrderHistory();
  }, [userId]);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const userOrders = await MarketplaceService.getUserPurchaseHistory(userId);
      
      // Enrich orders with service details
      const enrichedOrders: OrderWithService[] = await Promise.all(
        userOrders.map(async (order) => {
          try {
            const service = await MarketplaceService.getServiceDetails(order.serviceId);
            return {
              ...order,
              serviceName: service?.title || 'Unknown Service',
              gameIcon: service?.game.icon || '🎮',
              gameName: service?.game.name || 'Unknown Game',
              serviceTypeName: service?.serviceType.name || 'Unknown Type'
            };
          } catch {
            return {
              ...order,
              serviceName: 'Unknown Service',
              gameIcon: '🎮',
              gameName: 'Unknown Game',
              serviceTypeName: 'Unknown Type'
            };
          }
        })
      );
      
      setOrders(enrichedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedOrders = (): OrderWithService[] => {
    let filtered = orders;

    // Apply filter
    if (filter !== 'all') {
      filtered = orders.filter(order => order.status === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'price':
          aValue = a.pricePaid;
          bValue = b.pricePaid;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      const order = sortOrder === 'desc' ? -1 : 1;
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }
      return (aValue - bValue) * order;
    });

    return filtered;
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
        return 'Pending';
      case 'assigned':
        return 'Assigned';
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

  const formatPrice = (price: number, currency: string) => {
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

  const handleBackClick = () => {
    navigate('/marketplace');
  };

  const handleViewActiveOrdersClick = () => {
    navigate('/marketplace/orders');
  };

  const filteredOrders = getFilteredAndSortedOrders();

  if (loading) {
    return (
      <div className="order-history">
        <div className="order-history__loading">
          <div className="order-history__loading-spinner" />
          <p>Loading order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history">
        <div className="order-history__error">
          <h2>Error Loading Order History</h2>
          <p>{error}</p>
          <button 
            className="discord-button discord-button--primary"
            onClick={loadOrderHistory}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      {/* Header */}
      <div className="order-history__header">
        <div className="order-history__title-section">
          <button 
            className="order-history__back-button discord-button discord-button--secondary"
            onClick={handleBackClick}
          >
            ← Back to Marketplace
          </button>
          <h1 className="order-history__title">📜 Order History</h1>
          <p className="order-history__subtitle">
            Complete history of all your service orders
          </p>
        </div>
        
        <div className="order-history__actions">
          <button 
            className="discord-button discord-button--secondary"
            onClick={handleViewActiveOrdersClick}
          >
            📋 Active Orders
          </button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="order-history__controls">
        <div className="order-history__filters">
          <div className="order-history__filter-group">
            <label className="order-history__filter-label">Filter by Status:</label>
            <select 
              className="order-history__filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'rejected')}
            >
              <option value="all">All Orders</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="order-history__filter-group">
            <label className="order-history__filter-label">Sort by:</label>
            <select 
              className="order-history__filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'status')}
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="order-history__filter-group">
            <label className="order-history__filter-label">Order:</label>
            <select 
              className="order-history__filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="order-history__results-count">
          {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders List */}
      <div className="order-history__content">
        {filteredOrders.length === 0 ? (
          <div className="order-history__empty">
            <div className="order-history__empty-icon">📜</div>
            <h3>
              {filter === 'all' 
                ? 'No Order History' 
                : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`
              }
            </h3>
            <p>
              {filter === 'all'
                ? "You haven't placed any orders yet. Browse the marketplace to find services!"
                : `You don't have any ${filter} orders.`
              }
            </p>
            {filter === 'all' ? (
              <button 
                className="discord-button discord-button--primary"
                onClick={handleBackClick}
              >
                Browse Marketplace
              </button>
            ) : (
              <button 
                className="discord-button discord-button--secondary"
                onClick={() => setFilter('all')}
              >
                Show All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="order-history__table">
            <div className="order-history__table-header">
              <div className="order-history__table-cell order-history__table-cell--order">Order</div>
              <div className="order-history__table-cell order-history__table-cell--service">Service</div>
              <div className="order-history__table-cell order-history__table-cell--price">Price</div>
              <div className="order-history__table-cell order-history__table-cell--status">Status</div>
              <div className="order-history__table-cell order-history__table-cell--date">Date</div>
            </div>

            <div className="order-history__table-body">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-history__table-row">
                  <div className="order-history__table-cell order-history__table-cell--order">
                    <div className="order-history__order-id">
                      #{order.id.slice(-8).toUpperCase()}
                    </div>
                  </div>

                  <div className="order-history__table-cell order-history__table-cell--service">
                    <div className="order-history__service-info">
                      <span className="order-history__game-icon">{order.gameIcon}</span>
                      <div className="order-history__service-details">
                        <div className="order-history__service-name">{order.serviceName}</div>
                        <div className="order-history__service-meta">
                          {order.gameName} • {order.serviceTypeName}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-history__table-cell order-history__table-cell--price">
                    <div className="order-history__price">
                      {formatPrice(order.pricePaid, order.currency)}
                    </div>
                  </div>

                  <div className="order-history__table-cell order-history__table-cell--status">
                    <div 
                      className="order-history__status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="order-history__table-cell order-history__table-cell--date">
                    <div className="order-history__date">
                      <div className="order-history__date-primary">
                        {formatDate(order.createdAt)}
                      </div>
                      {order.completedAt && (
                        <div className="order-history__date-secondary">
                          Completed: {formatDate(order.completedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};