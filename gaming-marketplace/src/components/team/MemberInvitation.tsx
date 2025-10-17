import React, { useState } from 'react';
import { TeamService } from '../../services/teamService';
import type { Team } from '../../types';
import './MemberInvitation.css';

interface MemberInvitationProps {
  team: Team;
  onInvitationSent: () => void;
}

export const MemberInvitation: React.FC<MemberInvitationProps> = ({
  team,
  onInvitationSent
}) => {
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate user ID
      if (!userId.trim()) {
        throw new Error('User ID is required');
      }

      // Check if user is already a member
      const isAlreadyMember = team.members.some(
        member => member.userId === userId.trim() && member.status === 'active'
      );

      if (isAlreadyMember) {
        throw new Error('User is already a team member');
      }

      // Check if there's already a pending invitation
      const pendingInvitations = TeamService.getTeamInvitations(team.id);
      const hasPendingInvitation = pendingInvitations.some(
        inv => inv.invitedUserId === userId.trim() && inv.status === 'pending'
      );

      if (hasPendingInvitation) {
        throw new Error('User already has a pending invitation');
      }

      // Send invitation
      TeamService.inviteUser(team.id, userId.trim(), team.leaderId);

      setSuccess(`Invitation sent to user ${userId.trim()}`);
      setUserId('');
      onInvitationSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSampleUserId = () => {
    const sampleId = `user_${Math.random().toString(36).substring(2, 10)}`;
    setUserId(sampleId);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="member-invitation">
      <div className="member-invitation__header">
        <h3>Invite Team Members</h3>
        <p>Invite other users to join your team and collaborate on services.</p>
      </div>

      <div className="member-invitation__form-section">
        <form onSubmit={handleSubmit} className="member-invitation__form">
          <div className="member-invitation__field">
            <label htmlFor="userId" className="member-invitation__label">
              User ID *
            </label>
            <div className="member-invitation__input-group">
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className="member-invitation__input"
                placeholder="Enter user ID (e.g., user_12345678)"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={generateSampleUserId}
                className="member-invitation__generate-button"
                disabled={isSubmitting}
              >
                Generate Sample
              </button>
            </div>
            <div className="member-invitation__field-hint">
              Enter the exact user ID of the person you want to invite.
            </div>
          </div>

          {error && (
            <div className="member-invitation__error">
              {error}
            </div>
          )}

          {success && (
            <div className="member-invitation__success">
              {success}
            </div>
          )}

          <div className="member-invitation__actions">
            <button
              type="submit"
              className="member-invitation__button member-invitation__button--primary"
              disabled={isSubmitting || !userId.trim()}
            >
              {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>

      <div className="member-invitation__info">
        <h4>How Team Invitations Work</h4>
        <ul>
          <li>Enter the exact user ID of the person you want to invite</li>
          <li>The user will receive a notification about the invitation</li>
          <li>They can accept or decline the invitation</li>
          <li>Once accepted, they'll be able to access the team workspace</li>
          <li>Team members can collaborate on services and share earnings</li>
        </ul>
      </div>

      <div className="member-invitation__current-team">
        <h4>Current Team: {team.name}</h4>
        <div className="member-invitation__team-stats">
          <div className="member-invitation__stat">
            <span className="member-invitation__stat-label">Members:</span>
            <span className="member-invitation__stat-value">
              {team.members.filter(m => m.status === 'active').length}
            </span>
          </div>
          <div className="member-invitation__stat">
            <span className="member-invitation__stat-label">Pending Invitations:</span>
            <span className="member-invitation__stat-value">
              {TeamService.getTeamInvitations(team.id).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};