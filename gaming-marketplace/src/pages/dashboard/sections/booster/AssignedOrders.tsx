import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { OrderService } from '../../../../services/orderService';
import { EvidenceUpload } from '../../../../components/evidence/EvidenceUpload';
import { Button } from '../../../../components/discord/Button';
import { Modal } from '../../../../components/discord/Modal';
import type { Order } from '../../../../types';
import './AssignedOrders.css';

export const AssignedOrders: React.FC = () => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [state.user?.id]);

  const loadOrders = async () => {
    if (!state.user?.id) return;
    
    try {
      setLoading(true);
      const boosterOrders = await OrderService.getBoosterOrders(state.user.id);
      setOrders(boosterOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrder = async (orderId: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, 'in_progress');
      await loadOrders();
    } catch (error) {
      console.error('Failed to start order:', error);
    }
  };

  const handleEvidenceSubmit = async (orderId: string, evidence: { imageFile: File; notes: string }) => {
    try {
      await OrderService.uploadEvidence(orderId, evidence);
      setShowEvidenceModal(false);
      setSelectedOrder(null);
      await loadOrders();
    } catch (error) {
      console.error('Failed to submit evidence:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'assigned':
        return 'var(--discord-warning)';
      case 'in_progress':
        return 'var(--discord-accent)';
      case 'evidence_submitted':
        return 'var(--discord-success)';
      case 'under_review':
        return 'var(--discord-accent)';
      case 'completed':
        return 'var(--discord-success)';
      case 'rejected':
        return 'var(--discord-danger)';
      default:
        return 'var(--discord-text-secondary)';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="assigned-orders__loading">
        <div className="assigned-orders__loading-spinner"></div>
        <p>Loading your assigned orders...</p>
      </div>
    );
  }

  return (
    <div className="assigned-orders">
      <div className="assigned-orders__header">
        <h1 className="assigned-orders__title">Assigned Orders</h1>
        <p className="assigned-orders__subtitle">
          Manage your assigned orders and upload completion evidence
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="assigned-orders__empty">
          <div className="assigned-orders__empty-icon">📋</div>
          <h2 className="assigned-orders__empty-title">No Orders Assigned</h2>
          <p className="assigned-orders__empty-text">
            You don't have any orders assigned to you yet. Check back later for new assignments.
          </p>
        </div>
      ) : (
        <div className="assigned-orders__list">
          {orders.map((order) => (
            <div key={order.id} className="assigned-orders__card">
              <div className="assigned-orders__card-header">
                <div className="assigned-orders__card-title">
                  Order #{order.id.slice(-6).toUpperCase()}
                </div>
                <div 
                  className="assigned-orders__status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="assigned-orders__card-content">
                <div className="assigned-orders__order-info">
                  <div className="assigned-orders__info-item">
                    <span className="assigned-orders__info-label">Service:</span>
                    <span className="assigned-orders__info-value">Service #{order.serviceId.slice(-6)}</span>
                  </div>
                  <div className="assigned-orders__info-item">
                    <span className="assigned-orders__info-label">Payment:</span>
                    <span className="assigned-orders__info-value">
                      {formatCurrency(order.pricePaid, order.currency)}
                    </span>
                  </div>
                  <div className="assigned-orders__info-item">
                    <span className="assigned-orders__info-label">Created:</span>
                    <span className="assigned-orders__info-value">
                      {order.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {order.evidence && (
                  <div className="assigned-orders__evidence-info">
                    <h4 className="assigned-orders__evidence-title">Submitted Evidence</h4>
                    <p className="assigned-orders__evidence-notes">{order.evidence.notes}</p>
                    <p className="assigned-orders__evidence-time">
                      Submitted on {order.evidence.uploadedAt.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="assigned-orders__card-actions">
                {order.status === 'assigned' && (
                  <Button
                    variant="primary"
                    onClick={() => handleStartOrder(order.id)}
                  >
                    Start Order
                  </Button>
                )}

                {order.status === 'in_progress' && (
                  <Button
                    variant="success"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowEvidenceModal(true);
                    }}
                  >
                    Upload Evidence
                  </Button>
                )}

                {order.status === 'rejected' && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowEvidenceModal(true);
                    }}
                  >
                    Resubmit Evidence
                  </Button>
                )}

                {(order.status === 'evidence_submitted' || order.status === 'under_review') && (
                  <Button variant="secondary" disabled>
                    Awaiting Review
                  </Button>
                )}

                {order.status === 'completed' && (
                  <Button variant="success" disabled>
                    Completed ✓
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Upload Modal */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => {
          setShowEvidenceModal(false);
          setSelectedOrder(null);
        }}
        title="Upload Order Evidence"
      >
        {selectedOrder && (
          <EvidenceUpload
            orderId={selectedOrder.id}
            onSubmit={(evidence) => handleEvidenceSubmit(selectedOrder.id, evidence)}
            onCancel={() => {
              setShowEvidenceModal(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};