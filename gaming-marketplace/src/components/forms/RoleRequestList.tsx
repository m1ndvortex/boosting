// Role Request List Component for Clients

import React, { useEffect } from 'react';
import { useRoleRequests } from '../../contexts/RoleRequestContext';
import './RoleRequestList.css';

export const RoleRequestList: React.FC = () => {
  const { state, loadRequests } = useRoleRequests();

  useEffect(() => {
    loadRequests();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getRoleLabel = (role: string) => {
    return role === 'advertiser' ? 'Advertiser' : 'Team Advertiser';
  };

  if (state.loading) {
    return (
      <div className="role-request-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading your requests...</p>
      </div>
    );
  }

  if (state.requests.length === 0) {
    return (
      <div className="role-request-list-empty">
        <p>You haven't submitted any role requests yet.</p>
      </div>
    );
  }

  return (
    <div className="role-request-list">
      <h3>Your Role Requests</h3>
      <div className="requests-grid">
        {state.requests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="request-role">{getRoleLabel(request.requestedRole)}</div>
              {getStatusBadge(request.status)}
            </div>

            <div className="request-body">
              <div className="request-field">
                <label>Submitted:</label>
                <span>{formatDate(request.submittedAt)}</span>
              </div>

              {request.reviewedAt && (
                <div className="request-field">
                  <label>Reviewed:</label>
                  <span>{formatDate(request.reviewedAt)}</span>
                </div>
              )}

              <div className="request-field">
                <label>Reason:</label>
                <p className="request-reason">{request.reason}</p>
              </div>

              {request.experience && (
                <div className="request-field">
                  <label>Experience:</label>
                  <p className="request-experience">{request.experience}</p>
                </div>
              )}

              {request.reviewNotes && (
                <div className={`request-notes ${request.status === 'rejected' ? 'rejected-notes' : ''}`}>
                  <label>Admin Notes:</label>
                  <p>{request.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
