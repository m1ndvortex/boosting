// Admin Role Request Management Panel

import React, { useEffect, useState } from 'react';
import { useRoleRequests } from '../../contexts/RoleRequestContext';
import { useNotifications } from '../notifications/NotificationSystem';
import type { RoleRequest } from '../../types';
import './RoleRequestManagementPanel.css';

export const RoleRequestManagementPanel: React.FC = () => {
  const { state, loadRequests, approveRequest, rejectRequest, deleteRequest } = useRoleRequests();
  const { addNotification } = useNotifications();

  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role: string) => {
    return role === 'advertiser' ? 'Advertiser' : 'Team Advertiser';
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewDetails = (request: RoleRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setReviewNotes('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      await approveRequest(selectedRequest.id, reviewNotes || undefined);
      addNotification({
        type: 'success',
        title: 'Request Approved',
        message: `${selectedRequest.username}'s ${getRoleLabel(selectedRequest.requestedRole)} request has been approved.`,
      });
      handleCloseModal();
      
      // TODO: Actually assign the role to the user in AuthContext
      // This should update the user's roles in the system
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error instanceof Error ? error.message : 'Failed to approve request',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!reviewNotes.trim()) {
      addNotification({
        type: 'warning',
        title: 'Reason Required',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await rejectRequest(selectedRequest.id, reviewNotes);
      addNotification({
        type: 'info',
        title: 'Request Rejected',
        message: `${selectedRequest.username}'s ${getRoleLabel(selectedRequest.requestedRole)} request has been rejected.`,
      });
      handleCloseModal();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: error instanceof Error ? error.message : 'Failed to reject request',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (requestId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete ${username}'s role request? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteRequest(requestId);
      addNotification({
        type: 'info',
        title: 'Request Deleted',
        message: `${username}'s role request has been deleted.`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: error instanceof Error ? error.message : 'Failed to delete request',
      });
    }
  };

  const filteredRequests = state.requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const stats = {
    total: state.requests.length,
    pending: state.requests.filter(r => r.status === 'pending').length,
    approved: state.requests.filter(r => r.status === 'approved').length,
    rejected: state.requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="role-request-management">
      <div className="management-header">
        <h2>Role Request Management</h2>
        <p>Review and manage user role requests for Advertiser and Team Advertiser positions</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({stats.total})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          Approved ({stats.approved})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Requests Table */}
      <div className="requests-table-container">
        {state.loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>No {filterStatus !== 'all' ? filterStatus : ''} role requests found.</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Requested Role</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id}>
                  <td className="username-cell">{request.username}</td>
                  <td className="email-cell">{request.email}</td>
                  <td className="role-cell">{getRoleLabel(request.requestedRole)}</td>
                  <td className="status-cell">{getStatusBadge(request.status)}</td>
                  <td className="date-cell">{formatDate(request.submittedAt)}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-view"
                      onClick={() => handleViewDetails(request)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(request.id, request.username)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Role Request Details</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>User Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{selectedRequest.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedRequest.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value">{selectedRequest.userId}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Request Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Requested Role:</span>
                  <span className="detail-value">{getRoleLabel(selectedRequest.requestedRole)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">{formatDate(selectedRequest.submittedAt)}</span>
                </div>
                {selectedRequest.reviewedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Reviewed:</span>
                    <span className="detail-value">{formatDate(selectedRequest.reviewedAt)}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Reason</h4>
                <p className="detail-text">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.experience && (
                <div className="detail-section">
                  <h4>Experience</h4>
                  <p className="detail-text">{selectedRequest.experience}</p>
                </div>
              )}

              {selectedRequest.idCardFile && (
                <div className="detail-section">
                  <h4>ID Card / Verification Document</h4>
                  <div className="id-card-preview">
                    {typeof selectedRequest.idCardFile === 'string' && selectedRequest.idCardFile.startsWith('data:image') ? (
                      <img src={selectedRequest.idCardFile} alt="ID Card" />
                    ) : (
                      <div className="pdf-placeholder">
                        <p>📄 PDF Document</p>
                        <p className="file-name">{selectedRequest.idCardName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRequest.reviewNotes && (
                <div className="detail-section">
                  <h4>Review Notes</h4>
                  <p className="detail-text review-notes">{selectedRequest.reviewNotes}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="detail-section">
                  <h4>Review Notes (Optional for approval, required for rejection)</h4>
                  <textarea
                    className="review-textarea"
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={4}
                  />
                </div>
              )}
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="modal-footer">
                <button
                  className="btn btn-reject"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  className="btn btn-approve"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
