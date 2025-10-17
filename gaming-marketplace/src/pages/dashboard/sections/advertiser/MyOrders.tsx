import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { ServiceService } from '../../../../services/serviceService';
import type { Order, Service, User } from '../../../../types';
import './MyOrders.css';

export const MyOrders: React.FC = () => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [boosters, setBoosters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!state.user) return;
      
      try {
        const [userOrders, userServices, availableBoosters] = await Promise.all([
          ServiceService.getUserOrders(state.user.id),
          ServiceService.getUserServices(state.user.id),
          ServiceService.getAvailableBoosters()
        ]);
        
        setOrders(userOrders);
        setServices(userServices);
        setBoosters(availableBoosters);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [state.user]);

  const handleAssignBooster = async (boosterId: string) => {
    if (!selectedOrder || !state.user) return;

    try {
      const updatedOrder = await ServiceService.assignBooster(
        selectedOrder.id,
        boosterId,
        state.user.id
      );
      
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setShowAssignModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error assigning booster:', error);
    }
  };

  const handleReviewEvidence = async (approved: boolean, reason?: string) => {
    if (!selectedOrder || !state.user) return;

    try {
      const updatedOrder = await ServiceService.reviewEvidence(
        selectedOrder.id,
        state.user.id,
        approved,
        reason
      );
      
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setShowEvidenceModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error reviewing evidence:', error);
    }
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.title || 'Unknown Service';
  };

  const getBoosterName = (boosterId: string) => {
    return boosters.find(b => b.id === boosterId)?.username || 'Unknown Booster';
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#faa61a';
      case 'assigned': return '#7289da';
      case 'in_progress': return '#43b581';
      case 'evidence_submitted': return '#ffffff';
      case 'completed': return '#43b581';
      case 'rejected': return '#f04747';
      default: return '#b9bbbe';
    }
  };

  if (loading) {
    return (
      <div className="my-orders__loading">
        <div className="my-orders__spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders__header">
        <h1>My Orders</h1>
        <p>Manage orders for your services and assign boosters</p>
      </div>

      {orders.length === 0 ? (
        <div className="my-orders__empty">
          <div className="my-orders__empty-icon">📋</div>
          <h3>No Orders Yet</h3>
          <p>Orders for your services will appear here once clients start purchasing.</p>
        </div>
      ) : (
        <div className="my-orders__list">
          {orders.map((order) => (
            <div key={order.id} className="my-orders__card">
              <div className="my-orders__card-header">
                <div className="my-orders__card-title">
                  <h3>{getServiceName(order.serviceId)}</h3>
                  <span className="my-orders__order-id">#{order.id.slice(-6)}</span>
                </div>
                <div 
                  className="my-orders__status"
                  style={{ 
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}
                >
                  {order.status.replace('_', ' ')}
                </div>
              </div>

              <div className="my-orders__card-content">
                <div className="my-orders__details">
                  <div className="my-orders__detail">
                    <span className="my-orders__detail-label">Price:</span>
                    <span className="my-orders__detail-value">
                      {order.pricePaid} {order.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="my-orders__detail">
                    <span className="my-orders__detail-label">Booster:</span>
                    <span className="my-orders__detail-value">
                      {order.boosterId ? getBoosterName(order.boosterId) : 'Not assigned'}
                    </span>
                  </div>
                  <div className="my-orders__detail">
                    <span className="my-orders__detail-label">Created:</span>
                    <span className="my-orders__detail-value">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="my-orders__actions">
                  {order.status === 'pending' && (
                    <button
                      className="my-orders__action-btn my-orders__action-btn--primary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign Booster
                    </button>
                  )}
                  
                  {order.status === 'evidence_submitted' && (
                    <button
                      className="my-orders__action-btn my-orders__action-btn--primary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowEvidenceModal(true);
                      }}
                    >
                      Review Evidence
                    </button>
                  )}
                  
                  <button className="my-orders__action-btn my-orders__action-btn--secondary">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Booster Modal */}
      {showAssignModal && selectedOrder && (
        <div className="my-orders__modal-overlay">
          <div className="my-orders__modal">
            <div className="my-orders__modal-header">
              <h3>Assign Booster</h3>
              <button
                className="my-orders__modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="my-orders__modal-content">
              <p>Select a booster for order #{selectedOrder.id.slice(-6)}:</p>
              <div className="my-orders__booster-list">
                {boosters.map((booster) => (
                  <div key={booster.id} className="my-orders__booster-item">
                    <div className="my-orders__booster-info">
                      <img
                        src={booster.avatar}
                        alt={booster.username}
                        className="my-orders__booster-avatar"
                      />
                      <div>
                        <h4>{booster.username}</h4>
                        <p>#{booster.discriminator}</p>
                      </div>
                    </div>
                    <button
                      className="my-orders__assign-btn"
                      onClick={() => handleAssignBooster(booster.id)}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Review Modal */}
      {showEvidenceModal && selectedOrder && selectedOrder.evidence && (
        <div className="my-orders__modal-overlay">
          <div className="my-orders__modal my-orders__modal--large">
            <div className="my-orders__modal-header">
              <h3>Review Evidence</h3>
              <button
                className="my-orders__modal-close"
                onClick={() => setShowEvidenceModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="my-orders__modal-content">
              <div className="my-orders__evidence">
                <div className="my-orders__evidence-section">
                  <h4>Booster Notes:</h4>
                  <p>{selectedOrder.evidence.notes}</p>
                </div>
                <div className="my-orders__evidence-section">
                  <h4>Screenshot:</h4>
                  <div className="my-orders__evidence-placeholder">
                    📷 Screenshot: {selectedOrder.evidence.imageFile.name}
                  </div>
                </div>
                <div className="my-orders__evidence-actions">
                  <button
                    className="my-orders__action-btn my-orders__action-btn--success"
                    onClick={() => handleReviewEvidence(true)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="my-orders__action-btn my-orders__action-btn--danger"
                    onClick={() => handleReviewEvidence(false, 'Evidence not satisfactory')}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};