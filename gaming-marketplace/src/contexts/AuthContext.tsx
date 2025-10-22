import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, AuthState, UserRole } from '../types';
import { UserStorage, STORAGE_KEYS } from '../services/storage';

// Auth actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Auth context type
interface AuthContextType {
  state: AuthState;
  login: (selectedUserId: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Discord users for simulation
const MOCK_DISCORD_USERS: Omit<User, 'roles' | 'createdAt'>[] = [
  {
    id: 'test-client-1',
    discordId: '123456789012345678',
    username: 'TestClient',
    discriminator: '1234',
    avatar: 'https://cdn.discordapp.com/avatars/123456789012345678/avatar1.png',
    email: 'testclient@example.com',
  },
  {
    id: 'test-booster-1',
    discordId: '234567890123456789',
    username: 'BoosterUser',
    discriminator: '5678',
    avatar: 'https://cdn.discordapp.com/avatars/234567890123456789/avatar2.png',
    email: 'boosteruser@example.com',
  },
  {
    id: 'test-admin-1',
    discordId: '345678901234567890',
    username: 'AdminUser',
    discriminator: '9999',
    avatar: 'https://cdn.discordapp.com/avatars/345678901234567890/avatar3.png',
    email: 'admin@example.com',
  },
  {
    id: 'test-advertiser-1',
    discordId: '456789012345678901',
    username: 'AdvertiserUser',
    discriminator: '1111',
    avatar: 'https://cdn.discordapp.com/avatars/456789012345678901/avatar4.png',
    email: 'advertiser@example.com',
  },
  {
    id: 'test-new-user',
    discordId: '567890123456789012',
    username: 'NewUser',
    discriminator: '0001',
    avatar: 'https://cdn.discordapp.com/avatars/567890123456789012/avatar5.png',
    email: 'newuser@example.com',
  },
];

// Auth provider component
export const AuthProvider: React.FC<{ 
  children: React.ReactNode;
  initialUser?: User | null;
}> = ({
  children,
  initialUser = null,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    isAuthenticated: !!initialUser,
    user: initialUser,
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = UserStorage.getUser() as User | null;
    if (savedUser) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: savedUser });
    }
  }, []);

  // Login function - simulates Discord OAuth
  const login = async (selectedUserId: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find the selected mock user
      const mockUser = MOCK_DISCORD_USERS.find(
        (user) => user.id === selectedUserId
      );

      if (!mockUser) {
        throw new Error('Invalid user selection');
      }

      // Create user with default client role
      const clientRole: UserRole = {
        id: 'role_client_' + Date.now(),
        name: 'client',
        status: 'active',
        approvedBy: 'system',
        approvedAt: new Date(),
      };

      // Add additional roles based on user type for demo purposes
      const roles: UserRole[] = [clientRole];
      
      if (mockUser.username === 'AdminUser') {
        roles.push({
          id: 'role_admin_' + Date.now(),
          name: 'admin',
          status: 'active',
          approvedBy: 'system',
          approvedAt: new Date(),
        });
      }
      
      if (mockUser.username === 'BoosterUser') {
        roles.push({
          id: 'role_booster_' + Date.now(),
          name: 'booster',
          status: 'active',
          approvedBy: 'system',
          approvedAt: new Date(),
        });
      }
      
      if (mockUser.username === 'AdvertiserUser') {
        roles.push(
          {
            id: 'role_advertiser_' + Date.now(),
            name: 'advertiser',
            status: 'active',
            approvedBy: 'system',
            approvedAt: new Date(),
          },
          {
            id: 'role_team_advertiser_' + Date.now(),
            name: 'team_advertiser',
            status: 'active',
            approvedBy: 'system',
            approvedAt: new Date(),
          }
        );
      }

      const user: User = {
        ...mockUser,
        roles,
        createdAt: new Date(),
      };

      // Save to localStorage
      UserStorage.saveUser(user);

      // Generate and save auth token
      const authToken = `auth_token_${user.id}_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);

      // Initialize wallet with some demo balance
      const walletKey = `gaming-marketplace-wallet-${user.id}`;
      const existingWallet = localStorage.getItem(walletKey);
      if (!existingWallet) {
        const wallet = {
          userId: user.id,
          balances: { 
            gold: user.username === 'AdminUser' ? 100000 : 25000, 
            usd: user.username === 'AdminUser' ? 500 : 100, 
            toman: user.username === 'AdminUser' ? 20000000 : 4000000 
          },
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(walletKey, JSON.stringify(wallet));
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    }
  };

  // Logout function
  const logout = (): void => {
    UserStorage.clearUser();
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get mock users for the login interface
export const getMockDiscordUsers = () => MOCK_DISCORD_USERS;