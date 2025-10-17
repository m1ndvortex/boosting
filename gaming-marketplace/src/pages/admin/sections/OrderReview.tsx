import React, { useState } from 'react';
import type { Order, OrderEvidence, User, Service } from '../../../types';

interface OrderWithDetails extends Order {
  service: Service;
  buyer: User;
  booster?: User;
}

export const OrderReview: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Mock users
  const users: User[] = [
    {
      id: 'user_1',
      discordId: '123456789012345678',
      username: 'ClientUser',
      discriminator: '0001',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      email: 'client@example.com',
      roles: [],
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'user_2',
      discordId: '234567890123456789',
      username: 'ProBooster',
      discriminator: '1234',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      email: 'probooster@example.com',
      roles: [],
      createdAt: new Date('2024-01-05'),
    },
  ];

  // Mock services
  const services: Service[] = [
    {
      id: 'service_1',
      gameId: 'game_1',
      serviceTypeId: 'st_1',
      title: 'Mythic+ 15 Completion',
      description: 'Complete a Mythic+ 15 dungeon',
      prices: { gold: 2000, usd: 20, toman: 840000 },
      workspaceType: 'personal',
      workspaceOwnerId: 'user_3',
      createdBy: 'user_3',
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
  ];

  // Mock orders with evidence
  const [ordersWithEvidence, setOrdersWithEvidence] = useState<OrderWithDetails[]>([
    {
      id: 'order_1',
      serviceId: 'service_1',
      buyerId: 'user_1',
      boosterId: 'user_2',
      earningsRecipientId: 'user_3',
      status: 'evidence_submitted',
      pricePaid: 20,
      currency: 'usd',
      evidence: {
        orderId: 'order_1',
        imageFile: new File([''], 'screenshot1.png', { type: 'image/png' }),
        notes: 'Successfully completed Mythic+ 15 Tazavesh dungeon. Key was completed in time with a score of 2847. All loot was distributed to the client as requested.',
        uploadedBy: 'user_2',
        uploadedAt: new Date('2024-01-22T14:30:00'),
      },
      createdAt: new Date('2024-01-20T10:00:00'),
      service: services[0],
      buyer: users[0],
      booster: users[1],
    },
    {
      id: 'order_2',
      serviceId: 'service_1',
      buyerId: 'user_1',
      boosterId: 'user_2',
      earningsRecipientId: 'user_3',
      status: 'under_review',
      pricePaid: 2000,
      currency: 'gold',
      evidence: {
        orderId: 'order_2',
        imageFile: new File([''], 'screenshot2.jpg', { type: 'image/jpeg' }),
        notes: 'Leveling service completed. Character leveled from 60 to 70 as requested. All quests in Dragonflight zones completed.',
        uploadedBy: 'user_2',
        uploadedAt: new Date('2024-01-21T16:45:00'),
      },
      createdAt: new Date('2024-01-19T09:15:00'),
      service: services[0],
      buyer: users[0],
      booster: users[1],
    },
  ]);

  const formatCurrency = (amount: number, currency: string) => {
    switch (currency) {
      case 'usd':
        return `$${amount.toLocaleString()}`;
      case 'toman':
        return `﷼${amount.toLocaleString()}`;
      case 'gold':
        return `${amount.toLocaleString()}G`;
      default:
        return `${amount}`;
    }
  };

  const handleApproveOrder = (orderId: string) => {
    setOrdersWithEvidence(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'completed' as const }
        : order
    ));
  };

  const handleRejectOrder = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const confirmRejectOrder = () => {
    if (selectedOrder) {
      setOrdersWithEvidence(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'rejected' as const }
          : order
      ));
    }
    setShowRejectModal(false);
    setSelectedOrder(null);
    setRejectionReason('');
  };

  const handleViewEvidence = (order: OrderWithDetails) => {
    setSelectedOrder(order);
  };

  const pendingOrders = ordersWithEvidence.filter(order => 
    order.status === 'evidence_submitted' || order.status === 'under_review'
  );
  
  const completedOrders = ordersWithEvidence.filter(order => 
    order.status === 'completed' || order.status === 'rejected'
  );

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Order Review</h2>
        <p className="admin-section__description">
          Review orders with submitted evidence for approval or rejection
        </p>
      </div>

      <div className="admin-section__content">
        {/* Review Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">⏳</div>
            <div className="stat-card__value">{pendingOrders.length}</div>
            <div className="stat-card__label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">✅</div>
            <div className="stat-card__value">
              {completedOrders.filter(o => o.status === 'completed').length}
            </div>
            <div className="stat-card__label">Approved Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">❌</div>
            <div className="stat-card__value">
              {completedOrders.filter(o => o.status === 'rejected').length}
            </div>
            <div className="stat-card__label">Rejected Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📋</div>
            <div className="stat-card__value">{ordersWithEvidence.length}</div>
            <div className="stat-card__label">Total Orders</div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              Orders Pending Review ({pendingOrders.length})
            </h3>
          </div>
          <div className="admin-card__content">
            {pendingOrders.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Service</th>
                    <th>Client</th>
                    <th>Booster</th>
                    <th>Amount</th>
                    <th>Evidence Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="order-id">
                          <span className="order-number">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`status-badge ${
                            order.status === 'evidence_submitted' 
                              ? 'status-badge--pending' 
                              : 'status-badge--active'
                          }`}>
                            {order.status === 'evidence_submitted' ? 'New Evidence' : 'Under Review'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="service-info">
                          <div className="service-title">{order.service.title}</div>
                          <div className="service-description">{order.service.description}</div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <img 
                            src={order.buyer.avatar} 
                            alt={order.buyer.username}
                            className="user-avatar"
                          />
                          <div>
                            <div className="user-name">
                              {order.buyer.username}#{order.buyer.discriminator}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {order.booster && (
                          <div className="user-info">
                            <img 
                              src={order.booster.avatar} 
                              alt={order.booster.username}
                              className="user-avatar"
                            />
                            <div>
                              <div className="user-name">
                                {order.booster.username}#{order.booster.discriminator}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>{formatCurrency(order.pricePaid, order.currency)}</td>
                      <td>{order.evidence?.uploadedAt.toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--edit"
                            onClick={() => handleViewEvidence(order)}
                          >
                            View Evidence
                          </button>
                          <button
                            className="action-button action-button--approve"
                            onClick={() => handleApproveOrder(order.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="action-button action-button--reject"
                            onClick={() => handleRejectOrder(order)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">✅</div>
                <div className="empty-state__title">No Orders Pending Review</div>
                <div className="empty-state__description">
                  All orders with evidence have been processed
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Processed Orders */}
        {completedOrders.length > 0 && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">Recently Processed</h3>
            </div>
            <div className="admin-card__content">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Service</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Processed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="order-number">#{order.id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td>
                        <div className="service-info">
                          <div className="service-title">{order.service.title}</div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <img 
                            src={order.buyer.avatar} 
                            alt={order.buyer.username}
                            className="user-avatar"
                          />
                          <div>
                            <div className="user-name">
                              {order.buyer.username}#{order.buyer.discriminator}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(order.pricePaid, order.currency)}</td>
                      <td>
                        <span className={`status-badge ${
                          order.status === 'completed' 
                            ? 'status-badge--active' 
                            : 'status-badge--rejected'
                        }`}>
                          {order.status === 'completed' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td>{order.evidence?.uploadedAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evidence Viewer Modal */}
        {selectedOrder && !showRejectModal && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content evidence-modal" onClick={(e) => e.stopPropagation()}>
              <div className="evidence-header">
                <h3>Order Evidence Review</h3>
                <button 
                  className="close-button"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="evidence-content">
                <div className="order-details">
                  <h4>Order Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Order ID:</span>
                      <span className="detail-value">#{selectedOrder.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Service:</span>
                      <span className="detail-value">{selectedOrder.service.title}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Client:</span>
                      <span className="detail-value">
                        {selectedOrder.buyer.username}#{selectedOrder.buyer.discriminator}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Booster:</span>
                      <span className="detail-value">
                        {selectedOrder.booster?.username}#{selectedOrder.booster?.discriminator}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        {formatCurrency(selectedOrder.pricePaid, selectedOrder.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="evidence-section">
                  <h4>Evidence Submitted</h4>
                  <div className="evidence-details">
                    <div className="evidence-image">
                      <div className="image-placeholder">
                        <span className="image-icon">🖼️</span>
                        <span className="image-name">{selectedOrder.evidence?.imageFile.name}</span>
                        <span className="image-info">
                          Uploaded by {selectedOrder.booster?.username} on{' '}
                          {selectedOrder.evidence?.uploadedAt.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="evidence-notes">
                      <h5>Completion Notes</h5>
                      <div className="notes-content">
                        {selectedOrder.evidence?.notes}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="evidence-actions">
                  <button
                    className="admin-button admin-button--success"
                    onClick={() => {
                      handleApproveOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    Approve Order
                  </button>
                  <button
                    className="admin-button admin-button--danger"
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                  >
                    Reject Order
                  </button>
                  <button
                    className="admin-button admin-button--secondary"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Reject Order Evidence</h3>
              <p>
                Rejecting evidence for order #{selectedOrder.id.slice(-6).toUpperCase()}
              </p>
              <div className="admin-form__group">
                <label className="admin-form__label">Rejection Reason</label>
                <textarea
                  className="admin-form__textarea"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this evidence..."
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  className="admin-button admin-button--danger"
                  onClick={confirmRejectOrder}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </button>
                <button
                  className="admin-button admin-button--secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .order-id {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-number {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .service-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .service-title {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .service-description {
          font-size: 12px;
          color: var(--discord-text-muted);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 13px;
          color: var(--discord-text-primary);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--discord-bg-secondary);
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .evidence-modal {
          max-width: 700px;
        }

        .evidence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .evidence-header h3 {
          margin: 0;
          color: var(--discord-text-primary);
        }

        .close-button {
          background: none;
          border: none;
          color: var(--discord-text-secondary);
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        }

        .close-button:hover {
          color: var(--discord-text-primary);
        }

        .evidence-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .order-details h4,
        .evidence-section h4 {
          margin: 0 0 12px 0;
          color: var(--discord-text-primary);
          font-size: 16px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--discord-bg-tertiary);
          border-radius: 4px;
        }

        .detail-label {
          font-size: 13px;
          color: var(--discord-text-secondary);
        }

        .detail-value {
          font-size: 13px;
          color: var(--discord-text-primary);
          font-weight: 500;
        }

        .evidence-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px;
          background: var(--discord-bg-tertiary);
          border-radius: 8px;
          border: 2px dashed var(--discord-text-muted);
        }

        .image-icon {
          font-size: 32px;
        }

        .image-name {
          font-weight: 600;
          color: var(--discord-text-primary);
        }

        .image-info {
          font-size: 12px;
          color: var(--discord-text-muted);
          text-align: center;
        }

        .evidence-notes h5 {
          margin: 0 0 8px 0;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .notes-content {
          padding: 12px;
          background: var(--discord-bg-tertiary);
          border-radius: 6px;
          color: var(--discord-text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }

        .evidence-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
          
          .evidence-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};