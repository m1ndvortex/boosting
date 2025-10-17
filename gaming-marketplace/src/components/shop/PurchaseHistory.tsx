import React, { useState } from 'react';
import type { ShopOrder, ShopProduct } from '../../types';
import { ShopService } from '../../services/shopService';
import './PurchaseHistory.css';

export interface PurchaseHistoryProps {
  orders: ShopOrder[];
  products: ShopProduct[];
  className?: string;
}

export const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  orders,
  products,
  className = ''
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'refunded':
        return '↩️';
      default:
        return '❓';
    }
  };

  const getPaymentMethodIcon = (method: string): string => {
    switch (method) {
      case 'wallet':
        return '💰';
      case 'credit_card':
        return '💳';
      case 'crypto':
        return '₿';
      default:
        return '💳';
    }
  };

  const classes = [
    'purchase-history',
    className
  ].filter(Boolean).join(' ');

  if (orders.length === 0) {
    return (
      <div className={classes}>
        <div className="purchase-history__empty">
          <div className="purchase-history__empty-icon">📋</div>
          <h3>No Purchase History</h3>
          <p>You haven't made any shop purchases yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes}>
      <div className="purchase-history__header">
        <h3 className="purchase-history__title">Purchase History</h3>
        <span className="purchase-history__count">{orders.length} orders</span>
      </div>

      <div className="purchase-history__list">
        {orders.map((order) => (
          <div key={order.id} className="purchase-history__item">
            <div className="purchase-history__item-header">
              <div className="purchase-history__item-info">
                <h4 className="purchase-history__item-title">
                  {getProductName(order.productId)}
                </h4>
                <div className="purchase-history__item-meta">
                  <span className="purchase-history__order-number">
                    Order #{order.orderNumber}
                  </span>
                  <span className="purchase-history__date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <div className="purchase-history__item-status">
                <span className="purchase-history__status-icon">
                  {getStatusIcon(order.status)}
                </span>
                <span className="purchase-history__status-text">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="purchase-history__item-details">
              <div className="purchase-history__payment-info">
                <div className="purchase-history__payment-method">
                  <span className="purchase-history__payment-icon">
                    {getPaymentMethodIcon(order.paymentMethod)}
                  </span>
                  <span className="purchase-history__payment-text">
                    {order.paymentMethod === 'wallet' ? 'Wallet' : 'Card Payment'}
                  </span>
                </div>
                <div className="purchase-history__amount">
                  {ShopService.formatCurrency(order.pricePaid, order.currencyUsed)}
                </div>
              </div>

              {order.gameTimeCode && order.status === 'completed' && (
                <div className="purchase-history__code-section">
                  <div className="purchase-history__code-header">
                    <span className="purchase-history__code-label">Game Time Code:</span>
                  </div>
                  <div className="purchase-history__code-container">
                    <code className="purchase-history__code">
                      {order.gameTimeCode}
                    </code>
                    <button
                      className={`purchase-history__copy-button ${
                        copiedCode === order.gameTimeCode ? 'purchase-history__copy-button--copied' : ''
                      }`}
                      onClick={() => copyToClipboard(order.gameTimeCode!)}
                      title="Copy code"
                    >
                      {copiedCode === order.gameTimeCode ? '✅' : '📋'}
                    </button>
                  </div>
                  {copiedCode === order.gameTimeCode && (
                    <div className="purchase-history__copy-feedback">
                      Code copied to clipboard!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};