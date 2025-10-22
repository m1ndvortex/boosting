// Role Request Context for managing role request state

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { RoleRequest, RoleRequestFormData } from '../types';
import { RoleRequestService } from '../services/roleRequestService';
import { useAuth } from './AuthContext';

// Role Request state
interface RoleRequestState {
  requests: RoleRequest[]; // All requests (admin view) or user's requests (client view)
  pendingRequests: RoleRequest[]; // For admin dashboard
  loading: boolean;
  error: string | null;
}

// Role Request actions
type RoleRequestAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: RoleRequest[] }
  | { type: 'LOAD_PENDING_SUCCESS'; payload: RoleRequest[] }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'ADD_REQUEST'; payload: RoleRequest }
  | { type: 'UPDATE_REQUEST'; payload: RoleRequest }
  | { type: 'DELETE_REQUEST'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// Role Request context type
interface RoleRequestContextType {
  state: RoleRequestState;
  loadRequests: () => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  createRequest: (formData: RoleRequestFormData) => Promise<RoleRequest>;
  approveRequest: (requestId: string, reviewNotes?: string) => Promise<void>;
  rejectRequest: (requestId: string, reviewNotes: string) => Promise<void>;
  deleteRequest: (requestId: string) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: RoleRequestState = {
  requests: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

// Role Request reducer
function roleRequestReducer(
  state: RoleRequestState,
  action: RoleRequestAction
): RoleRequestState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        requests: action.payload,
        loading: false,
        error: null,
      };
    case 'LOAD_PENDING_SUCCESS':
      return {
        ...state,
        pendingRequests: action.payload,
        loading: false,
        error: null,
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_REQUEST':
      return {
        ...state,
        requests: [action.payload, ...state.requests],
      };
    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload.id ? action.payload : request
        ),
        pendingRequests: state.pendingRequests.filter(
          request => request.id !== action.payload.id
        ),
      };
    case 'DELETE_REQUEST':
      return {
        ...state,
        requests: state.requests.filter(request => request.id !== action.payload),
        pendingRequests: state.pendingRequests.filter(
          request => request.id !== action.payload
        ),
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create context
const RoleRequestContext = createContext<RoleRequestContextType | undefined>(undefined);

// Provider component
export const RoleRequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(roleRequestReducer, initialState);
  const { state: authState } = useAuth();

  // Load requests when user changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadRequests();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [authState.isAuthenticated, authState.user?.id]);

  // Load user's requests or all requests (for admin)
  const loadRequests = async () => {
    if (!authState.user) return;

    dispatch({ type: 'LOAD_START' });

    try {
      let requests: RoleRequest[];

      // Check if user is admin
      const isAdmin = authState.user.roles.some(
        role => role.name === 'admin' && role.status === 'active'
      );

      if (isAdmin) {
        // Load all requests for admin
        requests = RoleRequestService.getAllRequests();
      } else {
        // Load only user's requests
        requests = RoleRequestService.getUserRequests(authState.user.id);
      }

      dispatch({ type: 'LOAD_SUCCESS', payload: requests });
    } catch (error) {
      dispatch({
        type: 'LOAD_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to load role requests',
      });
    }
  };

  // Load pending requests (for admin dashboard)
  const loadPendingRequests = async () => {
    dispatch({ type: 'LOAD_START' });

    try {
      const pending = RoleRequestService.getPendingRequests();
      dispatch({ type: 'LOAD_PENDING_SUCCESS', payload: pending });
    } catch (error) {
      dispatch({
        type: 'LOAD_FAILURE',
        payload:
          error instanceof Error ? error.message : 'Failed to load pending requests',
      });
    }
  };

  // Create new request
  const createRequest = async (formData: RoleRequestFormData): Promise<RoleRequest> => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const newRequest = await RoleRequestService.createRequest(
        authState.user.id,
        authState.user.username,
        authState.user.email,
        formData
      );

      dispatch({ type: 'ADD_REQUEST', payload: newRequest });
      return newRequest;
    } catch (error) {
      dispatch({
        type: 'LOAD_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to create request',
      });
      throw error;
    }
  };

  // Approve request
  const approveRequest = async (requestId: string, reviewNotes?: string) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const updatedRequest = await RoleRequestService.updateRequestStatus(
        requestId,
        'approved',
        authState.user.id,
        reviewNotes
      );

      dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
    } catch (error) {
      dispatch({
        type: 'LOAD_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to approve request',
      });
      throw error;
    }
  };

  // Reject request
  const rejectRequest = async (requestId: string, reviewNotes: string) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const updatedRequest = await RoleRequestService.updateRequestStatus(
        requestId,
        'rejected',
        authState.user.id,
        reviewNotes
      );

      dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
    } catch (error) {
      dispatch({
        type: 'LOAD_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to reject request',
      });
      throw error;
    }
  };

  // Delete request
  const deleteRequest = async (requestId: string) => {
    dispatch({ type: 'LOAD_START' });

    try {
      await RoleRequestService.deleteRequest(requestId);
      dispatch({ type: 'DELETE_REQUEST', payload: requestId });
    } catch (error) {
      dispatch({
        type: 'LOAD_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to delete request',
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: RoleRequestContextType = {
    state,
    loadRequests,
    loadPendingRequests,
    createRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    clearError,
  };

  return (
    <RoleRequestContext.Provider value={contextValue}>
      {children}
    </RoleRequestContext.Provider>
  );
};

// Custom hook
export const useRoleRequests = () => {
  const context = useContext(RoleRequestContext);
  if (!context) {
    throw new Error('useRoleRequests must be used within RoleRequestProvider');
  }
  return context;
};
