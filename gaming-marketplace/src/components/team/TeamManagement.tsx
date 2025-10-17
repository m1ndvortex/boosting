import React, { useState, useEffect } from 'react';
import { TeamService } from '../../services/teamService';
import { useAuth } from '../../contexts/AuthContext';
import { TeamCreationForm } from './TeamCreationForm';
import { TeamInformation } from './TeamInformation';
import { MemberInvitation } from './MemberInvitation';
import type { Team } from '../../types';
import './TeamManagement.css';

type TeamManagementSection = 'overview' | 'create' | 'information' | 'invite' | 'members' | 'performance';

export const TeamManagement: React.FC = () => {
  const { state: authState } = useAuth();
  const [activeSection, setActiveSection] = useState<TeamManagementSection>('overview');
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Load user teams
  useEffect(() => {
    if (authState.user) {
      const teams = TeamService.getUserTeams(authState.user.id);
      setUserTeams(teams);
      
      // If user has teams, select the first one by default
      if (teams.length > 0 && !selectedTeam) {
        setSelectedTeam(teams[0]);
      }
    }
  }, [authState.user, selectedTeam]);

  const handleTeamCreated = (team: Team) => {
    setUserTeams(prev => [...prev, team]);
    setSelectedTeam(team);
    setActiveSection('information');
  };

  const isTeamLeader = (team: Team): boolean => {
    return authState.user?.id === team.leaderId;
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'create':
        return (
          <TeamCreationForm
            onTeamCreated={handleTeamCreated}
            onCancel={() => setActiveSection('overview')}
          />
        );
      
      case 'information':
        return selectedTeam ? (
          <TeamInformation
            team={selectedTeam}
            isLeader={isTeamLeader(selectedTeam)}
            onTeamUpdated={(updatedTeam) => {
              setSelectedTeam(updatedTeam);
              setUserTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
            }}
          />
        ) : (
          <div className="team-management__no-selection">
            <p>Please select a team to view information.</p>
          </div>
        );
      
      case 'invite':
        return selectedTeam && isTeamLeader(selectedTeam) ? (
          <MemberInvitation
            team={selectedTeam}
            onInvitationSent={() => {
              // Refresh team data
              const updatedTeam = TeamService.getTeam(selectedTeam.id);
              if (updatedTeam) setSelectedTeam(updatedTeam);
            }}
          />
        ) : (
          <div className="team-management__no-permission">
            <p>Only team leaders can invite members.</p>
          </div>
        );
      
      default:
        return (
          <div className="team-management__overview">
            <div className="team-management__overview-header">
              <h3>Team Management</h3>
              <p>Manage your teams and collaborate with other advertisers.</p>
            </div>

            {userTeams.length === 0 ? (
              <div className="team-management__no-teams">
                <div className="team-management__no-teams-content">
                  <h4>No Teams Yet</h4>
                  <p>Create a team to start collaborating with other advertisers and manage services together.</p>
                  <button
                    className="team-management__create-button"
                    onClick={() => setActiveSection('create')}
                  >
                    Create Your First Team
                  </button>
                </div>
              </div>
            ) : (
              <div className="team-management__teams-list">
                <div className="team-management__teams-header">
                  <h4>Your Teams ({userTeams.length})</h4>
                  <button
                    className="team-management__create-button team-management__create-button--small"
                    onClick={() => setActiveSection('create')}
                  >
                    Create New Team
                  </button>
                </div>

                <div className="team-management__teams-grid">
                  {userTeams.map((team) => (
                    <div
                      key={team.id}
                      className={`team-management__team-card ${
                        selectedTeam?.id === team.id ? 'team-management__team-card--selected' : ''
                      }`}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <div className="team-management__team-header">
                        <h5>{team.name}</h5>
                        {isTeamLeader(team) && (
                          <span className="team-management__leader-badge">Leader</span>
                        )}
                      </div>
                      <p className="team-management__team-description">
                        {team.description || 'No description provided'}
                      </p>
                      <div className="team-management__team-stats">
                        <span>{team.members.filter(m => m.status === 'active').length} members</span>
                        <span>Created {team.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="team-management">
      {/* Navigation */}
      <div className="team-management__nav">
        <button
          className={`team-management__nav-item ${
            activeSection === 'overview' ? 'team-management__nav-item--active' : ''
          }`}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        
        <button
          className={`team-management__nav-item ${
            activeSection === 'create' ? 'team-management__nav-item--active' : ''
          }`}
          onClick={() => setActiveSection('create')}
        >
          Create Team
        </button>

        {selectedTeam && (
          <>
            <button
              className={`team-management__nav-item ${
                activeSection === 'information' ? 'team-management__nav-item--active' : ''
              }`}
              onClick={() => setActiveSection('information')}
            >
              Team Information
            </button>

            {isTeamLeader(selectedTeam) && (
              <button
                className={`team-management__nav-item ${
                  activeSection === 'invite' ? 'team-management__nav-item--active' : ''
                }`}
                onClick={() => setActiveSection('invite')}
              >
                Invite Members
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="team-management__content">
        {renderSectionContent()}
      </div>
    </div>
  );
};