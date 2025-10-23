import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Order, MythicPlusOrderDetails } from '../../../../types';
import './MyAssignedOrders.css';

export const MyAssignedOrders: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');

  // Mock data - Replace with real API calls
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: 'ord-001',
        serviceId: 'svc-mythic-plus',
        buyerId: 'client-001',
        earningsRecipientId: 'advertiser-001',
        status: 'pending',
        pricePaid: 120000,
        currency: 'gold',
        createdAt: new Date('2024-01-15T10:00:00'),
        mythicPlusDetails: {
          dungeonName: 'Ruby Life Pools',
          keyLevel: 20,
          dungeonImage: 'https://wow.zamimg.com/uploads/screenshots/normal/1065942.jpg',
          goldPot: 500000,
          goldCurrency: 'gold',
          team: {
            tank: {
              boosterId: user?.id || 'boost-001',
              username: user?.username || 'TankMaster',
              avatar: user?.avatar || 'https://i.pravatar.cc/150?img=12',
              role: 'tank',
              assignedAt: new Date('2024-01-15T10:30:00'),
              goldShare: 125000,
              status: 'confirmed'
            },
            healer: {
              boosterId: 'boost-002',
              username: 'HolyHeals',
              avatar: 'https://i.pravatar.cc/150?img=5',
              role: 'healer',
              assignedAt: new Date('2024-01-15T11:00:00'),
              goldShare: 125000,
              status: 'confirmed'
            },
            dps1: {
              boosterId: 'boost-003',
              username: 'FireMage',
              avatar: 'https://i.pravatar.cc/150?img=8',
              role: 'dps',
              assignedAt: new Date('2024-01-15T11:30:00'),
              goldShare: 125000,
              status: 'confirmed'
            },
            dps2: {
              boosterId: 'boost-004',
              username: 'ShadowRogue',
              avatar: 'https://i.pravatar.cc/150?img=11',
              role: 'dps',
              assignedAt: new Date('2024-01-15T12:00:00'),
              goldShare: 125000,
              status: 'confirmed'
            },
            client: {
              userId: 'client-001',
              username: 'ClientPlayer',
              characterName: 'Shadowdeath',
              characterClass: 'Death Knight',
              characterSpec: 'Unholy',
              realm: 'Area-52',
              discord: 'client#1234'
            }
          },
          isLocked: false,
          estimatedDuration: 45
        }
      },
      {
        id: 'ord-002',
        serviceId: 'svc-mythic-plus',
        buyerId: 'client-002',
        earningsRecipientId: 'advertiser-001',
        status: 'in_progress',
        pricePaid: 200000,
        currency: 'gold',
        createdAt: new Date('2024-01-14T14:30:00'),
        mythicPlusDetails: {
          dungeonName: 'Azure Vault',
          keyLevel: 22,
          dungeonImage: 'https://wow.zamimg.com/uploads/screenshots/normal/1065930.jpg',
          goldPot: 800000,
          goldCurrency: 'gold',
          team: {
            tank: {
              boosterId: 'boost-005',
              username: 'IronWall',
              avatar: 'https://i.pravatar.cc/150?img=13',
              role: 'tank',
              assignedAt: new Date('2024-01-14T14:00:00'),
              goldShare: 200000,
              status: 'confirmed'
            },
            healer: {
              boosterId: user?.id || 'boost-001',
              username: user?.username || 'TankMaster',
              avatar: user?.avatar || 'https://i.pravatar.cc/150?img=12',
              role: 'healer',
              assignedAt: new Date('2024-01-14T14:15:00'),
              goldShare: 200000,
              status: 'confirmed'
            },
            dps1: {
              boosterId: 'boost-006',
              username: 'BoomkinPro',
              avatar: 'https://i.pravatar.cc/150?img=14',
              role: 'dps',
              assignedAt: new Date('2024-01-14T14:20:00'),
              goldShare: 200000,
              status: 'confirmed'
            },
            dps2: {
              boosterId: 'boost-007',
              username: 'HunterElite',
              avatar: 'https://i.pravatar.cc/150?img=15',
              role: 'dps',
              assignedAt: new Date('2024-01-14T14:25:00'),
              goldShare: 200000,
              status: 'confirmed'
            },
            client: {
              userId: 'client-002',
              username: 'AnotherClient',
              characterName: 'Frostblade',
              characterClass: 'Warrior',
              characterSpec: 'Fury',
              realm: 'Illidan',
              discord: 'anotherclient#5678'
            }
          },
          isLocked: true,
          boostStartTime: new Date('2024-01-14T15:00:00'),
          estimatedDuration: 50
        }
      },
      {
        id: 'ord-003',
        serviceId: 'svc-mythic-plus',
        buyerId: 'client-003',
        earningsRecipientId: 'advertiser-001',
        status: 'completed',
        pricePaid: 1500000,
        currency: 'toman',
        createdAt: new Date('2024-01-13T09:00:00'),
        completedAt: new Date('2024-01-13T10:30:00'),
        mythicPlusDetails: {
          dungeonName: 'Neltharus',
          keyLevel: 18,
          dungeonImage: 'https://wow.zamimg.com/uploads/screenshots/normal/1065945.jpg',
          goldPot: 1000000,
          goldCurrency: 'toman',
          team: {
            tank: {
              boosterId: 'boost-008',
              username: 'BearTank',
              avatar: 'https://i.pravatar.cc/150?img=16',
              role: 'tank',
              assignedAt: new Date('2024-01-13T08:30:00'),
              goldShare: 250000,
              status: 'confirmed'
            },
            healer: {
              boosterId: 'boost-009',
              username: 'DiscPriest',
              avatar: 'https://i.pravatar.cc/150?img=17',
              role: 'healer',
              assignedAt: new Date('2024-01-13T08:35:00'),
              goldShare: 250000,
              status: 'confirmed'
            },
            dps1: {
              boosterId: user?.id || 'boost-001',
              username: user?.username || 'TankMaster',
              avatar: user?.avatar || 'https://i.pravatar.cc/150?img=12',
              role: 'dps',
              assignedAt: new Date('2024-01-13T08:40:00'),
              goldShare: 250000,
              status: 'confirmed'
            },
            dps2: {
              boosterId: 'boost-010',
              username: 'ArcaneWizard',
              avatar: 'https://i.pravatar.cc/150?img=18',
              role: 'dps',
              assignedAt: new Date('2024-01-13T08:45:00'),
              goldShare: 250000,
              status: 'confirmed'
            },
            client: {
              userId: 'client-003',
              username: 'ThirdClient',
              characterName: 'Moonlight',
              characterClass: 'Druid',
              characterSpec: 'Balance',
              realm: 'Stormrage',
              discord: 'thirdclient#9012'
            }
          },
          isLocked: true,
          boostStartTime: new Date('2024-01-13T09:30:00'),
          boostCompletionTime: new Date('2024-01-13T10:30:00'),
          estimatedDuration: 40
        }
      }
    ];

    // Filter orders where current user is assigned as tank, healer, or dps
    const myOrders = mockOrders.filter(order => {
      if (!order.mythicPlusDetails) return false;
      const team = order.mythicPlusDetails.team;
      const myId = user?.id || 'boost-001';
      return (
        team.tank?.boosterId === myId ||
        team.healer?.boosterId === myId ||
        team.dps1?.boosterId === myId ||
        team.dps2?.boosterId === myId
      );
    });

    setOrders(myOrders);
    setLoading(false);
  }, [user]);

  const getMyRole = (details: MythicPlusOrderDetails): string => {
    const myId = user?.id || 'boost-001';
    if (details.team.tank?.boosterId === myId) return 'Tank';
    if (details.team.healer?.boosterId === myId) return 'Healer';
    if (details.team.dps1?.boosterId === myId || details.team.dps2?.boosterId === myId) return 'DPS';
    return 'Unknown';
  };

  const getMyGoldShare = (details: MythicPlusOrderDetails): number => {
    const myId = user?.id || 'boost-001';
    if (details.team.tank?.boosterId === myId && details.team.tank) return details.team.tank.goldShare;
    if (details.team.healer?.boosterId === myId && details.team.healer) return details.team.healer.goldShare;
    if (details.team.dps1?.boosterId === myId && details.team.dps1) return details.team.dps1.goldShare;
    if (details.team.dps2?.boosterId === myId && details.team.dps2) return details.team.dps2.goldShare;
    return 0;
  };

  const formatGold = (amount: number, currency: string): string => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '⚡';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalEarnings: orders.reduce((sum, order) => {
      if (order.mythicPlusDetails && order.status === 'completed') {
        return sum + getMyGoldShare(order.mythicPlusDetails);
      }
      return sum;
    }, 0)
  };

  if (loading) {
    return (
      <div className="my-assigned-orders">
        <div className="loading-spinner">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="my-assigned-orders">
      <div className="orders-header">
        <div>
          <h1>My Assigned Orders</h1>
          <p>View all Mythic+ orders where you are assigned as a booster</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-progress">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card earnings">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEarnings.toLocaleString()}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="order-filters">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setActiveFilter('in_progress')}
        >
          In Progress ({stats.inProgress})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📭</div>
            <h3>No orders found</h3>
            <p>You don't have any {activeFilter !== 'all' ? activeFilter : ''} orders assigned to you yet.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            if (!order.mythicPlusDetails) return null;
            const details = order.mythicPlusDetails;
            const myRole = getMyRole(details);
            const myGoldShare = getMyGoldShare(details);

            return (
              <div key={order.id} className="order-card-readonly">
                <div className="order-card-header">
                  <div className="order-title-section">
                    <img src={details.dungeonImage} alt={details.dungeonName} className="dungeon-icon-large" />
                    <div>
                      <h3>{details.dungeonName}</h3>
                      <div className="order-meta">
                        <span className="key-level">+{details.keyLevel}</span>
                        <span className="my-role-badge">{myRole}</span>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="order-earnings">
                    <div className="earnings-label">My Share</div>
                    <div className="earnings-value">{formatGold(myGoldShare, details.goldCurrency)}</div>
                  </div>
                </div>

                <div className="order-card-body">
                  {/* Client Information */}
                  <div className="info-section">
                    <h4>Client Information</h4>
                    <div className="client-info-compact">
                      <div className="client-character">
                        <div className="client-name">{details.team.client.characterName}</div>
                        <div className="client-details">
                          {details.team.client.characterClass} - {details.team.client.characterSpec}
                        </div>
                        <div className="client-realm">{details.team.client.realm}</div>
                      </div>
                      <div className="client-contact">
                        <div className="contact-label">Discord</div>
                        <div className="contact-value">{details.team.client.discord}</div>
                      </div>
                    </div>
                  </div>

                  {/* Team Composition */}
                  <div className="info-section">
                    <h4>Team Composition</h4>
                    <div className="team-grid-readonly">
                      {/* Tank */}
                      <div className={`team-slot-readonly ${details.team.tank?.boosterId === (user?.id || 'boost-001') ? 'my-slot' : ''}`}>
                        <div className="slot-header">
                          <span className="slot-role-icon">🛡️</span>
                          <span className="slot-role-label">Tank</span>
                        </div>
                        {details.team.tank ? (
                          <div className="booster-info-compact">
                            <img src={details.team.tank.avatar} alt={details.team.tank.username} className="booster-avatar-small" />
                            <div className="booster-name-small">{details.team.tank.username}</div>
                          </div>
                        ) : (
                          <div className="slot-empty">Not assigned</div>
                        )}
                      </div>

                      {/* Healer */}
                      <div className={`team-slot-readonly ${details.team.healer?.boosterId === (user?.id || 'boost-001') ? 'my-slot' : ''}`}>
                        <div className="slot-header">
                          <span className="slot-role-icon">💚</span>
                          <span className="slot-role-label">Healer</span>
                        </div>
                        {details.team.healer ? (
                          <div className="booster-info-compact">
                            <img src={details.team.healer.avatar} alt={details.team.healer.username} className="booster-avatar-small" />
                            <div className="booster-name-small">{details.team.healer.username}</div>
                          </div>
                        ) : (
                          <div className="slot-empty">Not assigned</div>
                        )}
                      </div>

                      {/* DPS 1 */}
                      <div className={`team-slot-readonly ${details.team.dps1?.boosterId === (user?.id || 'boost-001') ? 'my-slot' : ''}`}>
                        <div className="slot-header">
                          <span className="slot-role-icon">⚔️</span>
                          <span className="slot-role-label">DPS</span>
                        </div>
                        {details.team.dps1 ? (
                          <div className="booster-info-compact">
                            <img src={details.team.dps1.avatar} alt={details.team.dps1.username} className="booster-avatar-small" />
                            <div className="booster-name-small">{details.team.dps1.username}</div>
                          </div>
                        ) : (
                          <div className="slot-empty">Not assigned</div>
                        )}
                      </div>

                      {/* DPS 2 */}
                      <div className={`team-slot-readonly ${details.team.dps2?.boosterId === (user?.id || 'boost-001') ? 'my-slot' : ''}`}>
                        <div className="slot-header">
                          <span className="slot-role-icon">⚔️</span>
                          <span className="slot-role-label">DPS</span>
                        </div>
                        {details.team.dps2 ? (
                          <div className="booster-info-compact">
                            <img src={details.team.dps2.avatar} alt={details.team.dps2.username} className="booster-avatar-small" />
                            <div className="booster-name-small">{details.team.dps2.username}</div>
                          </div>
                        ) : (
                          <div className="slot-empty">Not assigned</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="info-section">
                    <h4>Order Details</h4>
                    <div className="details-grid-readonly">
                      <div className="detail-item">
                        <div className="detail-label">Total Gold Pot</div>
                        <div className="detail-value">{formatGold(details.goldPot, details.goldCurrency)}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Created</div>
                        <div className="detail-value">{formatDate(order.createdAt)}</div>
                      </div>
                      {details.boostStartTime && (
                        <div className="detail-item">
                          <div className="detail-label">Started</div>
                          <div className="detail-value">{formatDate(details.boostStartTime)}</div>
                        </div>
                      )}
                      {details.boostCompletionTime && (
                        <div className="detail-item">
                          <div className="detail-label">Completed</div>
                          <div className="detail-value">{formatDate(details.boostCompletionTime)}</div>
                        </div>
                      )}
                      <div className="detail-item">
                        <div className="detail-label">Estimated Duration</div>
                        <div className="detail-value">{details.estimatedDuration} minutes</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Order ID</div>
                        <div className="detail-value">{order.id}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-card-footer-readonly">
                  <div className="readonly-notice">
                    <span className="readonly-icon">{order.status === 'in_progress' && !order.evidence ? '�' : '�🔒'}</span>
                    <span>
                      {order.status === 'in_progress' && !order.evidence 
                        ? 'Upload evidence when boost is complete' 
                        : order.evidence 
                          ? 'Evidence submitted - Awaiting review'
                          : 'View Only - Contact advertiser or admin for changes'
                      }
                    </span>
                  </div>
                  <div className="footer-btn-group">
                    {order.status === 'in_progress' && !order.evidence && (
                      <button
                        className="btn-upload-evidence"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowEvidenceModal(true);
                        }}
                      >
                        📸 Upload Evidence
                      </button>
                    )}
                    <button
                      className="btn-details"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && selectedOrder.mythicPlusDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOrder.mythicPlusDetails.dungeonName} +{selectedOrder.mythicPlusDetails.keyLevel}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-modal-section">
                <h3>Your Role & Earnings</h3>
                <div className="highlight-box">
                  <div className="highlight-item">
                    <div className="highlight-label">Your Role</div>
                    <div className="highlight-value role">{getMyRole(selectedOrder.mythicPlusDetails)}</div>
                  </div>
                  <div className="highlight-item">
                    <div className="highlight-label">Your Share</div>
                    <div className="highlight-value gold">
                      {formatGold(getMyGoldShare(selectedOrder.mythicPlusDetails), selectedOrder.mythicPlusDetails.goldCurrency)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-modal-section">
                <h3>Client Character</h3>
                <div className="client-detail-box">
                  <div className="client-detail-row">
                    <span className="client-detail-label">Character:</span>
                    <span className="client-detail-value">{selectedOrder.mythicPlusDetails.team.client.characterName}</span>
                  </div>
                  <div className="client-detail-row">
                    <span className="client-detail-label">Class/Spec:</span>
                    <span className="client-detail-value">
                      {selectedOrder.mythicPlusDetails.team.client.characterClass} - {selectedOrder.mythicPlusDetails.team.client.characterSpec}
                    </span>
                  </div>
                  <div className="client-detail-row">
                    <span className="client-detail-label">Realm:</span>
                    <span className="client-detail-value">{selectedOrder.mythicPlusDetails.team.client.realm}</span>
                  </div>
                  <div className="client-detail-row">
                    <span className="client-detail-label">Discord:</span>
                    <span className="client-detail-value discord">{selectedOrder.mythicPlusDetails.team.client.discord}</span>
                  </div>
                </div>
              </div>

              <div className="detail-modal-section">
                <h3>Full Team</h3>
                <div className="team-list-detail">
                  {selectedOrder.mythicPlusDetails.team.tank && (
                    <div className="team-member-detail">
                      <img src={selectedOrder.mythicPlusDetails.team.tank.avatar} alt="" className="member-avatar" />
                      <div className="member-info">
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.tank.username}</div>
                        <div className="member-role">🛡️ Tank</div>
                      </div>
                      <div className="member-gold">{formatGold(selectedOrder.mythicPlusDetails.team.tank.goldShare, selectedOrder.mythicPlusDetails.goldCurrency)}</div>
                    </div>
                  )}
                  {selectedOrder.mythicPlusDetails.team.healer && (
                    <div className="team-member-detail">
                      <img src={selectedOrder.mythicPlusDetails.team.healer.avatar} alt="" className="member-avatar" />
                      <div className="member-info">
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.healer.username}</div>
                        <div className="member-role">💚 Healer</div>
                      </div>
                      <div className="member-gold">{formatGold(selectedOrder.mythicPlusDetails.team.healer.goldShare, selectedOrder.mythicPlusDetails.goldCurrency)}</div>
                    </div>
                  )}
                  {selectedOrder.mythicPlusDetails.team.dps1 && (
                    <div className="team-member-detail">
                      <img src={selectedOrder.mythicPlusDetails.team.dps1.avatar} alt="" className="member-avatar" />
                      <div className="member-info">
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.dps1.username}</div>
                        <div className="member-role">⚔️ DPS</div>
                      </div>
                      <div className="member-gold">{formatGold(selectedOrder.mythicPlusDetails.team.dps1.goldShare, selectedOrder.mythicPlusDetails.goldCurrency)}</div>
                    </div>
                  )}
                  {selectedOrder.mythicPlusDetails.team.dps2 && (
                    <div className="team-member-detail">
                      <img src={selectedOrder.mythicPlusDetails.team.dps2.avatar} alt="" className="member-avatar" />
                      <div className="member-info">
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.dps2.username}</div>
                        <div className="member-role">⚔️ DPS</div>
                      </div>
                      <div className="member-gold">{formatGold(selectedOrder.mythicPlusDetails.team.dps2.goldShare, selectedOrder.mythicPlusDetails.goldCurrency)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-modal-section">
                <h3>Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-icon">📅</div>
                    <div className="timeline-content">
                      <div className="timeline-label">Order Created</div>
                      <div className="timeline-value">{formatDate(selectedOrder.createdAt)}</div>
                    </div>
                  </div>
                  {selectedOrder.mythicPlusDetails.boostStartTime && (
                    <div className="timeline-item">
                      <div className="timeline-icon">🚀</div>
                      <div className="timeline-content">
                        <div className="timeline-label">Boost Started</div>
                        <div className="timeline-value">{formatDate(selectedOrder.mythicPlusDetails.boostStartTime)}</div>
                      </div>
                    </div>
                  )}
                  {selectedOrder.mythicPlusDetails.boostCompletionTime && (
                    <div className="timeline-item">
                      <div className="timeline-icon">✅</div>
                      <div className="timeline-content">
                        <div className="timeline-label">Boost Completed</div>
                        <div className="timeline-value">{formatDate(selectedOrder.mythicPlusDetails.boostCompletionTime)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Upload Modal */}
      {showEvidenceModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Evidence - {selectedOrder.mythicPlusDetails?.dungeonName}</h2>
              <button className="modal-close" onClick={() => setShowEvidenceModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="evidence-upload-form">
                <div className="form-section">
                  <h4>Boost Evidence</h4>
                  <p className="help-text">Upload a screenshot showing the completed dungeon run. This will be reviewed by the advertiser and admin before the order is marked as completed and payment is distributed.</p>
                  
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="evidence-file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEvidenceFile(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="evidence-file" className="file-upload-label">
                      {evidenceFile ? (
                        <>
                          <div className="file-preview">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{evidenceFile.name}</span>
                          </div>
                          <button 
                            type="button"
                            className="btn-change-file"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById('evidence-file')?.click();
                            }}
                          >
                            Change File
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="upload-placeholder">
                            <span className="upload-icon">📸</span>
                            <span className="upload-text">Click to upload screenshot</span>
                            <span className="upload-hint">PNG, JPG up to 10MB</span>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="evidence-notes">Additional Notes (Optional)</label>
                    <textarea
                      id="evidence-notes"
                      rows={4}
                      placeholder="Add any relevant notes about the run (e.g., key completion time, notable moments, etc.)"
                      value={evidenceNotes}
                      onChange={(e) => setEvidenceNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="evidence-info-box">
                  <h5>⚠️ Important</h5>
                  <ul>
                    <li>Evidence must clearly show the completed dungeon run</li>
                    <li>Screenshot should include key level and completion status</li>
                    <li>Once submitted, evidence cannot be changed by boosters</li>
                    <li>Payment will be distributed after advertiser/admin approval</li>
                  </ul>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowEvidenceModal(false);
                      setEvidenceFile(null);
                      setEvidenceNotes('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    disabled={!evidenceFile}
                    onClick={() => {
                      if (evidenceFile && selectedOrder) {
                        // TODO: Implement evidence upload API
                        const updatedOrder = {
                          ...selectedOrder,
                          status: 'evidence_submitted' as const,
                          evidence: {
                            orderId: selectedOrder.id,
                            imageFile: evidenceFile,
                            notes: evidenceNotes,
                            uploadedBy: user?.id || '',
                            uploadedAt: new Date()
                          }
                        };
                        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                        setShowEvidenceModal(false);
                        setEvidenceFile(null);
                        setEvidenceNotes('');
                        alert('Evidence uploaded successfully! Awaiting review from advertiser/admin.');
                      }
                    }}
                  >
                    Upload Evidence
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
