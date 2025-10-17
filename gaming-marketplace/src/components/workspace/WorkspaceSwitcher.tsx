import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import type { WorkspaceContext } from '../../types';
import './WorkspaceSwitcher.css';

export const WorkspaceSwitcher: React.FC = () => {
  const { state, switchWorkspace } = useWorkspace();
  const [showPersonalDropdown, setShowPersonalDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Only show if user has team workspaces available
  const hasTeamWorkspaces = state.availableWorkspaces.some(w => w.type === 'team');
  
  if (!hasTeamWorkspaces) {
    return null;
  }

  const personalWorkspaces = state.availableWorkspaces.filter(w => w.type === 'personal');
  const teamWorkspaces = state.availableWorkspaces.filter(w => w.type === 'team');

  const handleWorkspaceSelect = (workspace: WorkspaceContext) => {
    switchWorkspace(workspace);
    setShowPersonalDropdown(false);
    setShowTeamDropdown(false);
  };

  const isCurrentWorkspace = (workspace: WorkspaceContext) => {
    return state.currentWorkspace.id === workspace.id && 
           state.currentWorkspace.type === workspace.type;
  };

  return (
    <div className="workspace-switcher">
      {/* Personal Workspace Button */}
      <div className="workspace-switcher__dropdown">
        <button
          className={`workspace-switcher__button ${
            state.currentWorkspace.type === 'personal' ? 'workspace-switcher__button--active' : ''
          }`}
          onClick={() => {
            setShowPersonalDropdown(!showPersonalDropdown);
            setShowTeamDropdown(false);
          }}
        >
          Personal Workspace ▼
        </button>
        
        {showPersonalDropdown && (
          <div className="workspace-switcher__menu">
            {personalWorkspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-switcher__menu-item ${
                  isCurrentWorkspace(workspace) ? 'workspace-switcher__menu-item--active' : ''
                }`}
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <span className="workspace-switcher__menu-icon">👤</span>
                {workspace.name}
                {isCurrentWorkspace(workspace) && (
                  <span className="workspace-switcher__menu-check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Team Workspace Button */}
      <div className="workspace-switcher__dropdown">
        <button
          className={`workspace-switcher__button ${
            state.currentWorkspace.type === 'team' ? 'workspace-switcher__button--active' : ''
          }`}
          onClick={() => {
            setShowTeamDropdown(!showTeamDropdown);
            setShowPersonalDropdown(false);
          }}
        >
          Team Workspace ▼
        </button>
        
        {showTeamDropdown && (
          <div className="workspace-switcher__menu">
            {teamWorkspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-switcher__menu-item ${
                  isCurrentWorkspace(workspace) ? 'workspace-switcher__menu-item--active' : ''
                }`}
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <span className="workspace-switcher__menu-icon">👥</span>
                {workspace.name}
                {workspace.isTeamLeader && (
                  <span className="workspace-switcher__menu-badge">Leader</span>
                )}
                {isCurrentWorkspace(workspace) && (
                  <span className="workspace-switcher__menu-check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};