import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Order, User, MythicPlusOrderDetails, BoosterAssignment } from '../../../../types';
import './MythicPlusOrders.css';

interface MythicPlusDungeon {
  id: string;
  name: string;
  image: string;
  shortName: string;
}

const DUNGEONS: MythicPlusDungeon[] = [
  { id: '1', name: 'The Azure Vault', shortName: 'AV', image: '🏛️' },
  { id: '2', name: 'Ruby Life Pools', shortName: 'RLP', image: '🌊' },
  { id: '3', name: 'The Nokhud Offensive', shortName: 'NO', image: '⚔️' },
  { id: '4', name: 'Brackenhide Hollow', shortName: 'BH', image: '🌲' },
  { id: '5', name: 'Halls of Infusion', shortName: 'HOI', image: '💧' },
  { id: '6', name: 'Neltharus', shortName: 'NELT', image: '🔥' },
  { id: '7', name: 'Algeth\'ar Academy', shortName: 'AA', image: '📚' },
  { id: '8', name: 'Uldaman: Legacy of Tyr', shortName: 'ULD', image: '🏺' }
];

export const MythicPlusOrders: React.FC = () => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [boosters, setBoosters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [assigningRole, setAssigningRole] = useState<'tank' | 'healer' | 'dps1' | 'dps2' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form state for create/edit
  const [formData, setFormData] = useState({
    dungeonId: '',
    keyLevel: 15,
    goldPot: 0,
    goldCurrency: 'gold' as 'gold' | 'toman',
    estimatedDuration: 90,
    clientUsername: '',
    clientCharacterName: '',
    clientCharacterClass: '',
    clientCharacterSpec: '',
    clientRealm: '',
    clientDiscord: '',
    clientNotes: ''
  });

  useEffect(() => {
    loadOrders();
    loadBoosters();
  }, [state.user]);

  const loadOrders = () => {
    // TODO: Replace with actual API call
    const mockOrders: Order[] = [
      {
        id: 'order_1',
        serviceId: 'mythic_plus_service',
        buyerId: 'buyer_1',
        earningsRecipientId: state.user?.id || '',
        status: 'pending',
        pricePaid: 25,
        currency: 'usd',
        createdAt: new Date('2024-10-21'),
        mythicPlusDetails: {
          dungeonName: 'The Azure Vault',
          keyLevel: 15,
          dungeonImage: '🏛️',
          goldPot: 100000,
          goldCurrency: 'gold',
          team: {
            tank: null,
            healer: null,
            dps1: null,
            dps2: null,
            client: {
              userId: 'buyer_1',
              username: 'JohnDoe#5678',
              characterName: 'Thunderfist',
              characterClass: 'Warrior',
              characterSpec: 'Fury',
              realm: 'Illidan-US'
            }
          },
          estimatedDuration: 90,
          isLocked: false
        }
      },
      {
        id: 'order_2',
        serviceId: 'mythic_plus_service',
        buyerId: 'buyer_2',
        earningsRecipientId: state.user?.id || '',
        status: 'in_progress',
        pricePaid: 50,
        currency: 'usd',
        createdAt: new Date('2024-10-22'),
        mythicPlusDetails: {
          dungeonName: 'Ruby Life Pools',
          keyLevel: 20,
          dungeonImage: '🌊',
          goldPot: 500000,
          goldCurrency: 'gold',
          team: {
            tank: {
              boosterId: 'booster_1',
              username: 'ProTank#1234',
              avatar: '/avatars/protank.png',
              role: 'tank',
              assignedAt: new Date(),
              goldShare: 125000,
              status: 'in_progress'
            },
            healer: {
              boosterId: 'booster_2',
              username: 'HealGod#5678',
              avatar: '/avatars/healgod.png',
              role: 'healer',
              assignedAt: new Date(),
              goldShare: 125000,
              status: 'in_progress'
            },
            dps1: {
              boosterId: 'booster_3',
              username: 'EliteBooster#9012',
              avatar: '/avatars/elite.png',
              role: 'dps',
              assignedAt: new Date(),
              goldShare: 125000,
              status: 'in_progress'
            },
            dps2: {
              boosterId: 'booster_4',
              username: 'MegaDPS#3456',
              avatar: '/avatars/mega.png',
              role: 'dps',
              assignedAt: new Date(),
              goldShare: 125000,
              status: 'in_progress'
            },
            client: {
              userId: 'buyer_2',
              username: 'GamerGirl#9012',
              characterName: 'Shadowstrike',
              characterClass: 'Rogue',
              characterSpec: 'Assassination',
              realm: 'Stormrage-US',
              discord: 'GamerGirl#9999'
            }
          },
          boostStartTime: new Date(),
          estimatedDuration: 60,
          isLocked: true
        }
      },
      {
        id: 'order_3',
        serviceId: 'mythic_plus_service',
        buyerId: 'buyer_3',
        earningsRecipientId: state.user?.id || '',
        status: 'completed',
        pricePaid: 40,
        currency: 'usd',
        createdAt: new Date('2024-10-15'),
        completedAt: new Date('2024-10-15'),
        mythicPlusDetails: {
          dungeonName: 'Neltharus',
          keyLevel: 18,
          dungeonImage: '🔥',
          goldPot: 1000000,
          goldCurrency: 'toman',
          team: {
            tank: {
              boosterId: 'booster_1',
              username: 'ProTank#1234',
              avatar: '/avatars/protank.png',
              role: 'tank',
              assignedAt: new Date('2024-10-15'),
              goldShare: 250000,
              status: 'completed'
            },
            healer: {
              boosterId: 'booster_2',
              username: 'HealGod#5678',
              avatar: '/avatars/healgod.png',
              role: 'healer',
              assignedAt: new Date('2024-10-15'),
              goldShare: 250000,
              status: 'completed'
            },
            dps1: {
              boosterId: 'booster_3',
              username: 'EliteBooster#9012',
              avatar: '/avatars/elite.png',
              role: 'dps',
              assignedAt: new Date('2024-10-15'),
              goldShare: 250000,
              status: 'completed'
            },
            dps2: {
              boosterId: 'booster_4',
              username: 'MegaDPS#3456',
              avatar: '/avatars/mega.png',
              role: 'dps',
              assignedAt: new Date('2024-10-15'),
              goldShare: 250000,
              status: 'completed'
            },
            client: {
              userId: 'buyer_3',
              username: 'NewPlayer#7890',
              characterName: 'Frostblade',
              characterClass: 'Death Knight',
              characterSpec: 'Frost',
              realm: 'Area52-US'
            }
          },
          boostStartTime: new Date('2024-10-15'),
          boostEndTime: new Date('2024-10-15'),
          estimatedDuration: 75,
          isLocked: true
        }
      },
      {
        id: 'order_4',
        serviceId: 'mythic_plus_service',
        buyerId: 'buyer_4',
        earningsRecipientId: state.user?.id || '',
        status: 'evidence_submitted',
        pricePaid: 60,
        currency: 'usd',
        createdAt: new Date('2024-10-23'),
        mythicPlusDetails: {
          dungeonName: 'The Azure Vault',
          keyLevel: 22,
          dungeonImage: '🏛️',
          goldPot: 800000,
          goldCurrency: 'gold',
          team: {
            tank: {
              boosterId: 'booster_5',
              username: 'IronWall#2222',
              avatar: '/avatars/ironwall.png',
              role: 'tank',
              assignedAt: new Date('2024-10-23'),
              goldShare: 200000,
              status: 'completed'
            },
            healer: {
              boosterId: 'booster_6',
              username: 'BoosterUser#5678',
              avatar: '/avatars/booster.png',
              role: 'healer',
              assignedAt: new Date('2024-10-23'),
              goldShare: 200000,
              status: 'completed'
            },
            dps1: {
              boosterId: 'booster_7',
              username: 'BoomkinPro#3333',
              avatar: '/avatars/boomkin.png',
              role: 'dps',
              assignedAt: new Date('2024-10-23'),
              goldShare: 200000,
              status: 'completed'
            },
            dps2: {
              boosterId: 'booster_8',
              username: 'HunterElite#4444',
              avatar: '/avatars/hunter.png',
              role: 'dps',
              assignedAt: new Date('2024-10-23'),
              goldShare: 200000,
              status: 'completed'
            },
            client: {
              userId: 'buyer_4',
              username: 'anotherclient#5678',
              characterName: 'Frostblade',
              characterClass: 'Warrior',
              characterSpec: 'Fury',
              realm: 'Illidan'
            }
          },
          boostStartTime: new Date('2024-10-23'),
          estimatedDuration: 50,
          isLocked: true
        },
        evidence: {
          orderId: 'order_4',
          imageFile: new File([''], 'azure_vault_completion.png', { type: 'image/png' }),
          notes: 'Completed Azure Vault +22 in time. Key upgraded to +23. All chests opened. Client performed well throughout the run.',
          uploadedBy: 'BoosterUser#5678',
          uploadedAt: new Date('2024-10-23')
        }
      }
    ];
    setOrders(mockOrders);
    setLoading(false);
  };

  const loadBoosters = () => {
    // TODO: Replace with actual API call
    const mockBoosters: User[] = [
      {
        id: 'booster_1',
        discordId: 'disc_1',
        username: 'ProTank',
        discriminator: '1234',
        avatar: '/avatars/protank.png',
        email: 'tank@boost.com',
        roles: [{ id: 'r1', name: 'booster', status: 'active' }],
        createdAt: new Date()
      },
      {
        id: 'booster_2',
        discordId: 'disc_2',
        username: 'HealGod',
        discriminator: '5678',
        avatar: '/avatars/healgod.png',
        email: 'heal@boost.com',
        roles: [{ id: 'r2', name: 'booster', status: 'active' }],
        createdAt: new Date()
      },
      {
        id: 'booster_3',
        discordId: 'disc_3',
        username: 'EliteBooster',
        discriminator: '9012',
        avatar: '/avatars/elite.png',
        email: 'elite@boost.com',
        roles: [{ id: 'r3', name: 'booster', status: 'active' }],
        createdAt: new Date()
      },
      {
        id: 'booster_4',
        discordId: 'disc_4',
        username: 'MegaDPS',
        discriminator: '3456',
        avatar: '/avatars/mega.png',
        email: 'dps@boost.com',
        roles: [{ id: 'r4', name: 'booster', status: 'active' }],
        createdAt: new Date()
      },
      {
        id: 'booster_5',
        discordId: 'disc_5',
        username: 'SuperHealer',
        discriminator: '7777',
        avatar: '/avatars/super.png',
        email: 'super@boost.com',
        roles: [{ id: 'r5', name: 'booster', status: 'active' }],
        createdAt: new Date()
      }
    ];
    setBoosters(mockBoosters);
  };

  const handleAssignBooster = (booster: User) => {
    if (!selectedOrder || !assigningRole) return;

    const assignment: BoosterAssignment = {
      boosterId: booster.id,
      username: `${booster.username}#${booster.discriminator}`,
      avatar: booster.avatar,
      role: assigningRole === 'dps1' || assigningRole === 'dps2' ? 'dps' : assigningRole,
      assignedAt: new Date(),
      goldShare: selectedOrder.mythicPlusDetails!.goldPot / 4,
      status: 'assigned'
    };

    const updatedOrder = {
      ...selectedOrder,
      mythicPlusDetails: {
        ...selectedOrder.mythicPlusDetails!,
        team: {
          ...selectedOrder.mythicPlusDetails!.team,
          [assigningRole]: assignment
        }
      }
    };

    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setShowAssignModal(false);
    setAssigningRole(null);
    setSelectedOrder(null);
  };

  const handleStartBoost = (order: Order) => {
    const updatedOrder = {
      ...order,
      status: 'in_progress' as const,
      mythicPlusDetails: {
        ...order.mythicPlusDetails!,
        boostStartTime: new Date(),
        isLocked: true
      }
    };
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleApproveEvidence = (order: Order) => {
    if (!order.mythicPlusDetails) return;

    // Mark order as completed
    const updatedOrder = {
      ...order,
      status: 'completed' as const,
      completedAt: new Date()
    };

    // TODO: Implement gold distribution to all 4 boosters
    // Each booster should receive: order.mythicPlusDetails.goldPot / 4
    const goldPerBooster = order.mythicPlusDetails.goldPot / 4;
    
    console.log('Distributing gold:', {
      orderId: order.id,
      totalPot: order.mythicPlusDetails.goldPot,
      perBooster: goldPerBooster,
      currency: order.mythicPlusDetails.goldCurrency,
      tank: order.mythicPlusDetails.team.tank?.username,
      healer: order.mythicPlusDetails.team.healer?.username,
      dps1: order.mythicPlusDetails.team.dps1?.username,
      dps2: order.mythicPlusDetails.team.dps2?.username
    });

    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    alert(`Evidence approved! Order marked as completed. ${goldPerBooster.toLocaleString()} ${order.mythicPlusDetails.goldCurrency} will be distributed to each booster.`);
  };

  const handleRejectEvidence = (order: Order, reason: string) => {
    // Return order to in_progress status
    const updatedOrder = {
      ...order,
      status: 'in_progress' as const,
      evidence: undefined // Clear rejected evidence
    };

    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    alert(`Evidence rejected. Reason: "${reason}"\n\nOrder returned to In Progress status. Booster will be notified to resubmit evidence.`);
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#faa61a',
      assigned: '#7289da',
      in_progress: '#43b581',
      evidence_submitted: '#ffffff',
      under_review: '#7289da',
      completed: '#43b581',
      rejected: '#f04747'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order['status']) => {
    const icons = {
      pending: '⏳',
      assigned: '👥',
      in_progress: '🎮',
      evidence_submitted: '📸',
      under_review: '🔍',
      completed: '✅',
      rejected: '❌'
    };
    return icons[status];
  };

  const isTeamComplete = (details: MythicPlusOrderDetails) => {
    return details.team.tank && details.team.healer && details.team.dps1 && details.team.dps2;
  };

  if (loading) {
    return (
      <div className="mythic-orders__loading">
        <div className="loading-spinner"></div>
        <p>Loading Mythic+ orders...</p>
      </div>
    );
  }

  return (
    <div className="mythic-orders">
      {/* Header */}
      <div className="mythic-orders__header">
        <div className="header-left">
          <h1 className="header-title">🗝️ Mythic+ Orders</h1>
          <p className="header-subtitle">Manage your dungeon boost orders and assign teams</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <span className="btn-icon">+</span>
          Create New Order
        </button>
      </div>

      {/* Stats Overview */}
      <div className="mythic-orders__stats">
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="stat-label">Pending Assignment</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-progress">🎮</div>
          <div className="stat-content">
            <div className="stat-value">{orders.filter(o => o.status === 'in_progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">✅</div>
          <div className="stat-content">
            <div className="stat-value">{orders.filter(o => o.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.pricePaid, 0)} USD
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="mythic-orders__empty">
          <div className="empty-icon">🗝️</div>
          <h3>No Mythic+ Orders Yet</h3>
          <p>Create your first Mythic+ dungeon order to get started</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Create First Order
          </button>
        </div>
      ) : (
        <div className="mythic-orders__list">
          {orders.map((order) => {
            const details = order.mythicPlusDetails!;
            const teamComplete = isTeamComplete(details);

            return (
              <div key={order.id} className="order-card">
                {/* Card Header */}
                <div className="order-card__header">
                  <div className="header-left">
                    <div className="dungeon-info">
                      <div className="dungeon-icon">{details.dungeonImage}</div>
                      <div className="dungeon-details">
                        <h3 className="dungeon-name">{details.dungeonName}</h3>
                        <div className="dungeon-meta">
                          <span className="key-level">+{details.keyLevel}</span>
                          <span className="order-id">#{order.id.slice(-6)}</span>
                          <span className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="header-right">
                    <div
                      className="order-status"
                      style={{
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status)
                      }}
                    >
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      <span className="status-text">{order.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="order-card__body">
                  {/* Client Information */}
                  <div className="order-section">
                    <h4 className="section-title">👤 Client</h4>
                    <div className="client-card">
                      <div className="client-info">
                        <div className="client-avatar">
                          {details.team.client.username[0].toUpperCase()}
                        </div>
                        <div className="client-details">
                          <div className="client-name">{details.team.client.username}</div>
                          <div className="client-character">
                            {details.team.client.characterName} - {details.team.client.characterSpec} {details.team.client.characterClass}
                          </div>
                          <div className="client-realm">{details.team.client.realm}</div>
                        </div>
                      </div>
                      {details.team.client.discord && (
                        <div className="client-discord">
                          💬 {details.team.client.discord}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Composition */}
                  <div className="order-section">
                    <h4 className="section-title">
                      👥 Team Composition
                      {!teamComplete && <span className="incomplete-badge">Incomplete</span>}
                      {teamComplete && <span className="complete-badge">✓ Complete</span>}
                    </h4>
                    <div className="team-grid">
                      {/* Tank Slot */}
                      <div className={`team-slot ${details.team.tank ? 'filled' : 'empty'}`}>
                        <div className="slot-header">
                          <span className="slot-icon">🛡️</span>
                          <span className="slot-role">Tank</span>
                        </div>
                        {details.team.tank ? (
                          <div className="booster-info">
                            <img src={details.team.tank.avatar} alt="" className="booster-avatar" />
                            <div className="booster-details">
                              <div className="booster-name">{details.team.tank.username}</div>
                              <div className="booster-share">
                                {details.team.tank.goldShare.toLocaleString()} {details.goldCurrency.toUpperCase()}
                              </div>
                            </div>
                            {!details.isLocked && (
                              <button
                                className="btn-remove"
                                onClick={() => {
                                  const updatedOrder = {
                                    ...order,
                                    mythicPlusDetails: {
                                      ...details,
                                      team: { ...details.team, tank: null }
                                    }
                                  };
                                  setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            className="btn-assign"
                            onClick={() => {
                              setSelectedOrder(order);
                              setAssigningRole('tank');
                              setShowAssignModal(true);
                            }}
                            disabled={details.isLocked}
                          >
                            + Assign Tank
                          </button>
                        )}
                      </div>

                      {/* Healer Slot */}
                      <div className={`team-slot ${details.team.healer ? 'filled' : 'empty'}`}>
                        <div className="slot-header">
                          <span className="slot-icon">💚</span>
                          <span className="slot-role">Healer</span>
                        </div>
                        {details.team.healer ? (
                          <div className="booster-info">
                            <img src={details.team.healer.avatar} alt="" className="booster-avatar" />
                            <div className="booster-details">
                              <div className="booster-name">{details.team.healer.username}</div>
                              <div className="booster-share">
                                {details.team.healer.goldShare.toLocaleString()} {details.goldCurrency.toUpperCase()}
                              </div>
                            </div>
                            {!details.isLocked && (
                              <button
                                className="btn-remove"
                                onClick={() => {
                                  const updatedOrder = {
                                    ...order,
                                    mythicPlusDetails: {
                                      ...details,
                                      team: { ...details.team, healer: null }
                                    }
                                  };
                                  setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            className="btn-assign"
                            onClick={() => {
                              setSelectedOrder(order);
                              setAssigningRole('healer');
                              setShowAssignModal(true);
                            }}
                            disabled={details.isLocked}
                          >
                            + Assign Healer
                          </button>
                        )}
                      </div>

                      {/* DPS 1 Slot */}
                      <div className={`team-slot ${details.team.dps1 ? 'filled' : 'empty'}`}>
                        <div className="slot-header">
                          <span className="slot-icon">⚔️</span>
                          <span className="slot-role">DPS</span>
                        </div>
                        {details.team.dps1 ? (
                          <div className="booster-info">
                            <img src={details.team.dps1.avatar} alt="" className="booster-avatar" />
                            <div className="booster-details">
                              <div className="booster-name">{details.team.dps1.username}</div>
                              <div className="booster-share">
                                {details.team.dps1.goldShare.toLocaleString()} {details.goldCurrency.toUpperCase()}
                              </div>
                            </div>
                            {!details.isLocked && (
                              <button
                                className="btn-remove"
                                onClick={() => {
                                  const updatedOrder = {
                                    ...order,
                                    mythicPlusDetails: {
                                      ...details,
                                      team: { ...details.team, dps1: null }
                                    }
                                  };
                                  setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            className="btn-assign"
                            onClick={() => {
                              setSelectedOrder(order);
                              setAssigningRole('dps1');
                              setShowAssignModal(true);
                            }}
                            disabled={details.isLocked}
                          >
                            + Assign DPS
                          </button>
                        )}
                      </div>

                      {/* DPS 2 Slot */}
                      <div className={`team-slot ${details.team.dps2 ? 'filled' : 'empty'}`}>
                        <div className="slot-header">
                          <span className="slot-icon">⚔️</span>
                          <span className="slot-role">DPS</span>
                        </div>
                        {details.team.dps2 ? (
                          <div className="booster-info">
                            <img src={details.team.dps2.avatar} alt="" className="booster-avatar" />
                            <div className="booster-details">
                              <div className="booster-name">{details.team.dps2.username}</div>
                              <div className="booster-share">
                                {details.team.dps2.goldShare.toLocaleString()} {details.goldCurrency.toUpperCase()}
                              </div>
                            </div>
                            {!details.isLocked && (
                              <button
                                className="btn-remove"
                                onClick={() => {
                                  const updatedOrder = {
                                    ...order,
                                    mythicPlusDetails: {
                                      ...details,
                                      team: { ...details.team, dps2: null }
                                    }
                                  };
                                  setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            className="btn-assign"
                            onClick={() => {
                              setSelectedOrder(order);
                              setAssigningRole('dps2');
                              setShowAssignModal(true);
                            }}
                            disabled={details.isLocked}
                          >
                            + Assign DPS
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="order-section">
                    <h4 className="section-title">📊 Order Details</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Client Payment</span>
                        <span className="detail-value highlight">
                          {order.pricePaid} {order.currency.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Booster Gold Pot</span>
                        <span className="detail-value">
                          {details.goldPot.toLocaleString()} {details.goldCurrency.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gold Per Booster</span>
                        <span className="detail-value">
                          {(details.goldPot / 4).toLocaleString()} {details.goldCurrency.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Est. Duration</span>
                        <span className="detail-value">{details.estimatedDuration} minutes</span>
                      </div>
                      {details.boostStartTime && (
                        <div className="detail-item">
                          <span className="detail-label">Started At</span>
                          <span className="detail-value">
                            {new Date(details.boostStartTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {details.boostEndTime && (
                        <div className="detail-item">
                          <span className="detail-label">Completed At</span>
                          <span className="detail-value">
                            {new Date(details.boostEndTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="order-card__footer">
                  {details.isLocked && (
                    <div className="lock-notice">
                      🔒 Order is locked - Boost in progress (Only admin can edit)
                    </div>
                  )}
                  <div className="footer-actions">
                    {!details.isLocked && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowEditModal(true);
                        }}
                      >
                        <span className="btn-icon">✏️</span>
                        Edit Order
                      </button>
                    )}
                    {teamComplete && order.status === 'pending' && !details.isLocked && (
                      <button
                        className="btn-success"
                        onClick={() => handleStartBoost(order)}
                      >
                        <span className="btn-icon">🎮</span>
                        Start Boost
                      </button>
                    )}
                    {order.status === 'evidence_submitted' && order.evidence && (
                      <button
                        className="btn-review-evidence"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowEvidenceModal(true);
                        }}
                      >
                        <span className="btn-icon">📸</span>
                        Review Evidence
                      </button>
                    )}
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                    >
                      <span className="btn-icon">👁️</span>
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Booster Modal */}
      {showAssignModal && selectedOrder && assigningRole && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign {assigningRole.toUpperCase()} for {selectedOrder.mythicPlusDetails?.dungeonName}</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="booster-selection-list">
                {boosters.map((booster) => (
                  <div key={booster.id} className="booster-selection-item">
                    <div className="booster-sel-info">
                      <img src={booster.avatar} alt="" className="booster-sel-avatar" />
                      <div className="booster-sel-details">
                        <div className="booster-sel-name">
                          {booster.username}#{booster.discriminator}
                        </div>
                        <div className="booster-sel-email">{booster.email}</div>
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => handleAssignBooster(booster)}
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Mythic+ Order</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form className="order-form">
                <div className="form-section">
                  <h4>Dungeon Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Dungeon</label>
                      <select 
                        value={formData.dungeonId}
                        onChange={(e) => setFormData({...formData, dungeonId: e.target.value})}
                      >
                        <option value="">Select Dungeon...</option>
                        {DUNGEONS.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Key Level</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="30"
                        value={formData.keyLevel}
                        onChange={(e) => setFormData({...formData, keyLevel: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Estimated Duration (minutes)</label>
                      <input 
                        type="number" 
                        min="30" 
                        max="180"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Client Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Client Username/Discord</label>
                      <input 
                        type="text" 
                        placeholder="username#1234"
                        value={formData.clientUsername}
                        onChange={(e) => setFormData({...formData, clientUsername: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Character Name</label>
                      <input 
                        type="text" 
                        placeholder="Character name"
                        value={formData.clientCharacterName}
                        onChange={(e) => setFormData({...formData, clientCharacterName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Character Class</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Death Knight, Warrior"
                        value={formData.clientCharacterClass}
                        onChange={(e) => setFormData({...formData, clientCharacterClass: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Character Spec</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Frost, Fury"
                        value={formData.clientCharacterSpec}
                        onChange={(e) => setFormData({...formData, clientCharacterSpec: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Realm</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Illidan-US"
                        value={formData.clientRealm}
                        onChange={(e) => setFormData({...formData, clientRealm: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Discord Contact</label>
                      <input 
                        type="text" 
                        placeholder="discord#1234"
                        value={formData.clientDiscord}
                        onChange={(e) => setFormData({...formData, clientDiscord: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Payment Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Booster Gold Pot</label>
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Amount to split among boosters"
                        value={formData.goldPot}
                        onChange={(e) => setFormData({...formData, goldPot: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select 
                        value={formData.goldCurrency}
                        onChange={(e) => setFormData({...formData, goldCurrency: e.target.value as 'gold' | 'toman'})}
                      >
                        <option value="gold">Gold</option>
                        <option value="toman">Toman</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Gold Per Booster</label>
                      <div className="calculated-value">{formData.goldPot ? (formData.goldPot / 4).toLocaleString() : '0'} {formData.goldCurrency}</div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => {
                      // TODO: Implement create order
                      alert('Create order functionality will be implemented with API integration');
                      setShowCreateModal(false);
                    }}
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Order - {selectedOrder.mythicPlusDetails?.dungeonName}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form className="order-form">
                <div className="form-section">
                  <h4>Client Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Character Name</label>
                      <input 
                        type="text" 
                        defaultValue={selectedOrder.mythicPlusDetails?.team.client.characterName}
                      />
                    </div>
                    <div className="form-group">
                      <label>Character Class</label>
                      <input 
                        type="text" 
                        defaultValue={selectedOrder.mythicPlusDetails?.team.client.characterClass}
                      />
                    </div>
                    <div className="form-group">
                      <label>Character Spec</label>
                      <input 
                        type="text" 
                        defaultValue={selectedOrder.mythicPlusDetails?.team.client.characterSpec}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Realm</label>
                      <input 
                        type="text" 
                        defaultValue={selectedOrder.mythicPlusDetails?.team.client.realm}
                      />
                    </div>
                    <div className="form-group">
                      <label>Discord</label>
                      <input 
                        type="text" 
                        defaultValue={selectedOrder.mythicPlusDetails?.team.client.discord}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Payment Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Key Level</label>
                      <input 
                        type="number"
                        min="2"
                        max="30"
                        defaultValue={selectedOrder.mythicPlusDetails?.keyLevel}
                      />
                    </div>
                    <div className="form-group">
                      <label>Booster Gold Pot</label>
                      <input 
                        type="number"
                        min="0"
                        defaultValue={selectedOrder.mythicPlusDetails?.goldPot}
                      />
                    </div>
                    <div className="form-group">
                      <label>Estimated Duration</label>
                      <input 
                        type="number"
                        min="30"
                        max="180"
                        defaultValue={selectedOrder.mythicPlusDetails?.estimatedDuration}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => {
                      // TODO: Implement update order
                      alert('Update order functionality will be implemented with API integration');
                      setShowEditModal(false);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedOrder && selectedOrder.mythicPlusDetails && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedOrder.mythicPlusDetails.dungeonName} +{selectedOrder.mythicPlusDetails.keyLevel}</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="details-sections">
                <div className="details-section">
                  <h4>Order Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Order ID:</span>
                      <span className="detail-value">{selectedOrder.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{selectedOrder.status.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{selectedOrder.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Key Level:</span>
                      <span className="detail-value">+{selectedOrder.mythicPlusDetails.keyLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Client Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Username:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.team.client.username}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Character:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.team.client.characterName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Class/Spec:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.team.client.characterClass} - {selectedOrder.mythicPlusDetails.team.client.characterSpec}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Realm:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.team.client.realm}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Discord:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.team.client.discord || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Team Composition</h4>
                  <div className="team-details-grid">
                    {selectedOrder.mythicPlusDetails.team.tank && (
                      <div className="team-member-card">
                        <div className="member-role">🛡️ Tank</div>
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.tank.username}</div>
                        <div className="member-gold">{selectedOrder.mythicPlusDetails.team.tank.goldShare.toLocaleString()} {selectedOrder.mythicPlusDetails.goldCurrency}</div>
                      </div>
                    )}
                    {selectedOrder.mythicPlusDetails.team.healer && (
                      <div className="team-member-card">
                        <div className="member-role">💚 Healer</div>
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.healer.username}</div>
                        <div className="member-gold">{selectedOrder.mythicPlusDetails.team.healer.goldShare.toLocaleString()} {selectedOrder.mythicPlusDetails.goldCurrency}</div>
                      </div>
                    )}
                    {selectedOrder.mythicPlusDetails.team.dps1 && (
                      <div className="team-member-card">
                        <div className="member-role">⚔️ DPS</div>
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.dps1.username}</div>
                        <div className="member-gold">{selectedOrder.mythicPlusDetails.team.dps1.goldShare.toLocaleString()} {selectedOrder.mythicPlusDetails.goldCurrency}</div>
                      </div>
                    )}
                    {selectedOrder.mythicPlusDetails.team.dps2 && (
                      <div className="team-member-card">
                        <div className="member-role">⚔️ DPS</div>
                        <div className="member-name">{selectedOrder.mythicPlusDetails.team.dps2.username}</div>
                        <div className="member-gold">{selectedOrder.mythicPlusDetails.team.dps2.goldShare.toLocaleString()} {selectedOrder.mythicPlusDetails.goldCurrency}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Payment Details</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Client Payment:</span>
                      <span className="detail-value">{selectedOrder.pricePaid} {selectedOrder.currency.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Booster Pot:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.goldPot.toLocaleString()} {selectedOrder.mythicPlusDetails.goldCurrency.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Per Booster:</span>
                      <span className="detail-value">{(selectedOrder.mythicPlusDetails.goldPot / 4).toLocaleString()} {selectedOrder.mythicPlusDetails.goldCurrency.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Est. Duration:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails.estimatedDuration} minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Evidence Modal */}
      {showEvidenceModal && selectedOrder && selectedOrder.evidence && (
        <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Evidence - {selectedOrder.mythicPlusDetails?.dungeonName} +{selectedOrder.mythicPlusDetails?.keyLevel}</h2>
              <button className="modal-close" onClick={() => setShowEvidenceModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="evidence-review-container">
                <div className="evidence-section">
                  <h3>Submitted Evidence</h3>
                  <div className="evidence-info-box">
                    <div className="evidence-meta">
                      <span><strong>Submitted by:</strong> {selectedOrder.evidence.uploadedBy}</span>
                      <span><strong>Submitted at:</strong> {new Date(selectedOrder.evidence.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="evidence-image-container">
                    <div className="evidence-image-placeholder">
                      <span>📸</span>
                      <p>Screenshot: {selectedOrder.evidence.imageFile.name}</p>
                      <p className="file-size">{(selectedOrder.evidence.imageFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>

                  {selectedOrder.evidence.notes && (
                    <div className="evidence-notes">
                      <h4>Booster Notes</h4>
                      <p>{selectedOrder.evidence.notes}</p>
                    </div>
                  )}
                </div>

                <div className="review-section">
                  <h3>Order Summary</h3>
                  <div className="review-details">
                    <div className="detail-item">
                      <span className="detail-label">Order ID:</span>
                      <span className="detail-value">{selectedOrder.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Client:</span>
                      <span className="detail-value">{selectedOrder.mythicPlusDetails?.team.client.username}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Character:</span>
                      <span className="detail-value">
                        {selectedOrder.mythicPlusDetails?.team.client.characterName} - 
                        {selectedOrder.mythicPlusDetails?.team.client.characterSpec} {selectedOrder.mythicPlusDetails?.team.client.characterClass}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Gold Pot:</span>
                      <span className="detail-value">
                        {selectedOrder.mythicPlusDetails?.goldPot.toLocaleString()} {selectedOrder.mythicPlusDetails?.goldCurrency}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Per Booster:</span>
                      <span className="detail-value">
                        {((selectedOrder.mythicPlusDetails?.goldPot || 0) / 4).toLocaleString()} {selectedOrder.mythicPlusDetails?.goldCurrency}
                      </span>
                    </div>
                  </div>

                  <div className="rejection-section">
                    <h4>Rejection Reason (Optional)</h4>
                    <textarea
                      id="rejection-reason"
                      className="form-control"
                      rows={3}
                      placeholder="Provide a reason if rejecting the evidence (e.g., screenshot not clear, missing completion status, etc.)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>

                  <div className="warning-box">
                    <h5>⚠️ Important</h5>
                    <ul>
                      <li><strong>Approve:</strong> Marks order as completed and distributes {((selectedOrder.mythicPlusDetails?.goldPot || 0) / 4).toLocaleString()} {selectedOrder.mythicPlusDetails?.goldCurrency} to each booster</li>
                      <li><strong>Reject:</strong> Returns order to "In Progress" status for booster to resubmit evidence</li>
                      <li>All 4 team members will be notified of your decision</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert('Please provide a reason for rejection');
                      return;
                    }
                    handleRejectEvidence(selectedOrder, rejectionReason);
                    setShowEvidenceModal(false);
                    setRejectionReason('');
                  }}
                >
                  ❌ Reject Evidence
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowEvidenceModal(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-success"
                  onClick={() => {
                    handleApproveEvidence(selectedOrder);
                    setShowEvidenceModal(false);
                    setRejectionReason('');
                  }}
                >
                  ✅ Approve & Complete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
