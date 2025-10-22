import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { WorkspaceContext, Team } from '../types';
import { useAuth } from './AuthContext';

interface WorkspaceState {
  currentWorkspace: WorkspaceContext;
  availableWorkspaces: WorkspaceContext[];
  userTeams: Team[];
  loading: boolean;
}

type WorkspaceAction =
  | { type: 'SET_WORKSPACE'; payload: WorkspaceContext }
  | { type: 'SET_AVAILABLE_WORKSPACES'; payload: WorkspaceContext[] }
  | { type: 'SET_USER_TEAMS'; payload: Team[] }
  | { type: 'SET_LOADING'; payload: boolean };

interface WorkspaceContextType {
  state: WorkspaceState;
  switchWorkspace: (workspace: WorkspaceContext) => void;
  refreshWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const workspaceReducer = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
  switch (action.type) {
    case 'SET_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    case 'SET_AVAILABLE_WORKSPACES':
      return { ...state, availableWorkspaces: action.payload };
    case 'SET_USER_TEAMS':
      return { ...state, userTeams: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  
  const initialState: WorkspaceState = {
    currentWorkspace: {
      type: 'personal',
      id: authState.user?.id || '',
      name: 'Personal Workspace'
    },
    availableWorkspaces: [],
    userTeams: [],
    loading: false
  };

  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Load user teams and available workspaces
  const refreshWorkspaces = React.useCallback(() => {
    if (!authState.user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Get user teams from localStorage
      const teamsData = localStorage.getItem('teams');
      const teams: Team[] = teamsData ? JSON.parse(teamsData) : [];
      
      // Filter teams where user is a member
      const userTeams = teams.filter(team => 
        team.members.some(member => 
          member.userId === authState.user!.id && member.status === 'active'
        )
      );

      dispatch({ type: 'SET_USER_TEAMS', payload: userTeams });

      // Build available workspaces
      const workspaces: WorkspaceContext[] = [
        {
          type: 'personal',
          id: authState.user.id,
          name: 'Personal Workspace'
        },
        ...userTeams.map(team => ({
          type: 'team' as const,
          id: team.id,
          name: team.name,
          isTeamLeader: team.leaderId === authState.user!.id
        }))
      ];

      dispatch({ type: 'SET_AVAILABLE_WORKSPACES', payload: workspaces });

      // Set current workspace from localStorage or default to personal
      const savedWorkspace = localStorage.getItem(`currentWorkspace_${authState.user.id}`);
      if (savedWorkspace) {
        const workspace = JSON.parse(savedWorkspace);
        const validWorkspace = workspaces.find(w => w.id === workspace.id && w.type === workspace.type);
        if (validWorkspace) {
          dispatch({ type: 'SET_WORKSPACE', payload: validWorkspace });
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authState.user]);

  // Switch workspace
  const switchWorkspace = React.useCallback((workspace: WorkspaceContext) => {
    dispatch({ type: 'SET_WORKSPACE', payload: workspace });
    
    // Save to localStorage
    if (authState.user) {
      localStorage.setItem(`currentWorkspace_${authState.user.id}`, JSON.stringify(workspace));
    }
  }, [authState.user]);

  // Load workspaces when user changes
  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const contextValue: WorkspaceContextType = {
    state,
    switchWorkspace,
    refreshWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};