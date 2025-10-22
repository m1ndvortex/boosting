import React, { useState } from 'react';
import { TeamService } from '../../services/teamService';
import type { Team, TeamMember } from '../../types';
import './TeamInformation.css';

interface TeamInformationProps {
  team: Team;
  isLeader: boolean;
  onTeamUpdated: (team: Team) => void;
}

export const TeamInformation: React.FC<TeamInformationProps> = ({
  team,
  isLeader,
  onTeamUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: team.name,
    description: team.description
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMembers = team.members.filter(member => member.status === 'active');
  const pendingInvitations = TeamService.getTeamInvitations(team.id);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!editData.name.trim()) {
        throw new Error('Team name is required');
      }

      const updatedTeam = TeamService.updateTeam(team.id, {
        name: editData.name.trim(),
        description: editData.description.trim()
      });

      if (updatedTeam) {
        onTeamUpdated(updatedTeam);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update team');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: team.name,
      description: team.description
    });
    setIsEditing(false);
    setError(null);
  };

  const handleRemoveMember = (member: TeamMember) => {
    if (member.role === 'leader') return;
    
    const success = TeamService.removeMember(team.id, member.userId);
    if (success) {
      const updatedTeam = TeamService.getTeam(team.id);
      if (updatedTeam) {
        onTeamUpdated(updatedTeam);
      }
    }
  };

  const getMemberRoleDisplay = (member: TeamMember): string => {
    return member.role === 'leader' ? 'Team Leader' : 'Member';
  };

  return (
    <div className="team-information">
      <div className="team-information__header">
        <h3>Team Information</h3>
        {isLeader && !isEditing && (
          <button
            className="team-information__edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Team
          </button>
        )}
      </div>

      {/* Team Details */}
      <div className="team-information__section">
        <h4>Team Details</h4>
        
        {isEditing ? (
          <div className="team-information__edit-form">
            <div className="team-information__field">
              <label>Team Name *</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="team-information__input"
                maxLength={50}
                disabled={isSubmitting}
              />
            </div>

            <div className="team-information__field">
              <label>Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="team-information__textarea"
                rows={3}
                maxLength={200}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="team-information__error">
                {error}
              </div>
            )}

            <div className="team-information__edit-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="team-information__button team-information__button--secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="team-information__button team-information__button--primary"
                disabled={isSubmitting || !editData.name.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="team-information__details">
            <div className="team-information__detail-item">
              <span className="team-information__detail-label">Name:</span>
              <span className="team-information__detail-value">{team.name}</span>
            </div>
            <div className="team-information__detail-item">
              <span className="team-information__detail-label">Description:</span>
              <span className="team-information__detail-value">
                {team.description || 'No description provided'}
              </span>
            </div>
            <div className="team-information__detail-item">
              <span className="team-information__detail-label">Created:</span>
              <span className="team-information__detail-value">
                {new Date(team.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="team-information__detail-item">
              <span className="team-information__detail-label">Status:</span>
              <span className="team-information__detail-value">
                <span className="team-information__status team-information__status--active">
                  Active
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="team-information__section">
        <h4>Team Members ({activeMembers.length})</h4>
        
        <div className="team-information__members">
          {activeMembers.map((member) => (
            <div key={member.id} className="team-information__member">
              <div className="team-information__member-info">
                <div className="team-information__member-name">
                  Member #{member.userId.slice(-4)}
                </div>
                <div className="team-information__member-role">
                  {getMemberRoleDisplay(member)}
                </div>
                {member.joinedAt && (
                  <div className="team-information__member-joined">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {isLeader && member.role !== 'leader' && (
                <button
                  className="team-information__remove-button"
                  onClick={() => handleRemoveMember(member)}
                  title="Remove member"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="team-information__section">
          <h4>Pending Invitations ({pendingInvitations.length})</h4>
          
          <div className="team-information__invitations">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="team-information__invitation">
                <div className="team-information__invitation-info">
                  <div className="team-information__invitation-user">
                    User #{invitation.invitedUserId.slice(-4)}
                  </div>
                  <div className="team-information__invitation-date">
                    Invited {new Date(invitation.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="team-information__invitation-status">
                  Pending
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};