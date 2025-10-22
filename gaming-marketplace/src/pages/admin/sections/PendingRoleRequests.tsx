import React, { useState } from 'react';
import type { User } from '../../../types';

interface RoleRequest {
  id: string;
  userId: string;
  user: User;
  requestedRole: 'booster' | 'advertiser' | 'team_advertiser';
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PendingRoleRequests: React.FC = () => {
  const [requests, setRequests] = useState<RoleRequest[]>([
    {
      id: 'req_1',
      userId: 'user_5',
      user: {
        id: 'user_5',
        discordId: '123456789012345678',
        username: 'NewBooster',
        discriminator: '1234',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        email: 'newbooster@example.com',
        roles: [{ id: 'role_1', name: 'client', status: 'active' }],
        createdAt: new Date('2024-01-15'),
      },
      requestedRole: 'booster',
      requestedAt: new Date('2024-01-20'),
      reason: 'I have extensive experience in WoW mythic+ dungeons and would like to offer boosting services.',
      status: 'pending',
    },
    {
      id: 'req_2',
      userId: 'user_6',
      user: {
        id: 'user_6',
        discordId: '234567890123456789',
        username: 'ProAdvertiser',
        discriminator: '5678',
        avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
        email: 'proadvertiser@example.com',
        roles: [{ id: 'role_2', name: 'client', status: 'active' }],
        createdAt: new Date('2024-01-10'),
      },
      requestedRole: 'advertiser',
      requestedAt: new Date('2024-01-18'),
      reason: 'I want to create and manage boosting services for my gaming community.',
      status: 'pending',
    },
    {
      id: 'req_3',
      userId: 'user_7',
      user: {
        id: 'user_7',
        discordId: '345678901234567890',
        username: 'TeamLeader',
        discriminator: '9012',
        avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
        email: 'teamleader@example.com',
        roles: [
          { id: 'role_3', name: 'client', status: 'active' },
          { id: 'role_4', name: 'advertiser', status: 'active' },
        ],
        createdAt: new Date('2024-01-05'),
      },
      requestedRole: 'team_advertiser',
      requestedAt: new Date('2024-01-22'),
      reason: 'I have a team of experienced boosters and want to manage team-based services.',
      status: 'pending',
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const }
        : req
    ));
  };

  const handleReject = (request: RoleRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'rejected' as const }
          : req
      ));
    }
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'booster': return 'Booster';
      case 'advertiser': return 'Advertiser';
      case 'team_advertiser': return 'Team Advertiser';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'booster': return '🎮';
      case 'advertiser': return '📊';
      case 'team_advertiser': return '👥';
      default: return '❓';
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Pending Role Requests</h2>
        <p className="admin-section__description">
          Review and approve role requests from users
        </p>
      </div>

      <div className="admin-section__content">
        {/* Pending Requests */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              Pending Requests ({pendingRequests.length})
            </h3>
          </div>
          <div className="admin-card__content">
            {pendingRequests.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Requested Role</th>
                    <th>Request Date</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="user-info">
                          <img 
                            src={request.user.avatar} 
                            alt={request.user.username}
                            className="user-avatar"
                          />
                          <div>
                            <div className="user-name">
                              {request.user.username}#{request.user.discriminator}
                            </div>
                            <div className="user-email">{request.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-info">
                          <span className="role-icon">{getRoleIcon(request.requestedRole)}</span>
                          {getRoleDisplayName(request.requestedRole)}
                        </div>
                      </td>
                      <td>{request.requestedAt.toLocaleDateString()}</td>
                      <td>
                        <div className="reason-text" title={request.reason}>
                          {request.reason.length > 50 
                            ? `${request.reason.substring(0, 50)}...` 
                            : request.reason
                          }
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button action-button--approve"
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="action-button action-button--reject"
                            onClick={() => handleReject(request)}
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
                <div className="empty-state__title">No Pending Requests</div>
                <div className="empty-state__description">
                  All role requests have been processed
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Processed */}
        {processedRequests.length > 0 && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">Recently Processed</h3>
            </div>
            <div className="admin-card__content">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Requested Role</th>
                    <th>Status</th>
                    <th>Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processedRequests.slice(0, 10).map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="user-info">
                          <img 
                            src={request.user.avatar} 
                            alt={request.user.username}
                            className="user-avatar"
                          />
                          <div>
                            <div className="user-name">
                              {request.user.username}#{request.user.discriminator}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-info">
                          <span className="role-icon">{getRoleIcon(request.requestedRole)}</span>
                          {getRoleDisplayName(request.requestedRole)}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          request.status === 'approved' 
                            ? 'status-badge--active' 
                            : 'status-badge--rejected'
                        }`}>
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td>{request.requestedAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Reject Role Request</h3>
              <p>
                Rejecting {selectedRequest.user.username}'s request for {getRoleDisplayName(selectedRequest.requestedRole)} role.
              </p>
              <div className="admin-form__group">
                <label className="admin-form__label">Rejection Reason (Optional)</label>
                <textarea
                  className="admin-form__textarea"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                />
              </div>
              <div className="form-actions">
                <button
                  className="admin-button admin-button--danger"
                  onClick={confirmReject}
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
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-name {
          font-weight: 600;
          color: var(--discord-text-primary);
          font-size: 14px;
        }

        .user-email {
          font-size: 12px;
          color: var(--discord-text-muted);
        }

        .role-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-icon {
          font-size: 16px;
        }

        .reason-text {
          max-width: 200px;
          font-size: 13px;
          line-height: 1.4;
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

        .modal-content h3 {
          margin: 0 0 16px 0;
          color: var(--discord-text-primary);
        }

        .modal-content p {
          margin: 0 0 20px 0;
          color: var(--discord-text-secondary);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};