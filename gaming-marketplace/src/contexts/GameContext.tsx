// Game context for global game and service type state management

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Game, ServiceType } from '../types';
import { ServiceService } from '../services/serviceService';

// Game state
interface GameState {
  games: Game[];
  serviceTypes: ServiceType[];
  loading: boolean;
  error: string | null;
}

// Game actions
type GameAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { games: Game[]; serviceTypes: ServiceType[] } }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'ADD_SERVICE_TYPE'; payload: ServiceType }
  | { type: 'UPDATE_SERVICE_TYPE'; payload: ServiceType }
  | { type: 'CLEAR_ERROR' };

// Game context type
interface GameContextType {
  state: GameState;
  loadGames: () => Promise<void>;
  refreshGames: () => Promise<void>;
  getServiceTypesForGame: (gameId: string) => ServiceType[];
  addGame: (game: Omit<Game, 'id'>) => Promise<void>;
  updateGame: (gameId: string, updates: Partial<Game>) => Promise<void>;
  addServiceType: (serviceType: Omit<ServiceType, 'id'>) => Promise<void>;
  updateServiceType: (serviceTypeId: string, updates: Partial<ServiceType>) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: GameState = {
  games: [],
  serviceTypes: [],
  loading: false,
  error: null,
};

// Game reducer
function gameReducer(state: GameState, action: GameAction): GameState {
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
        games: action.payload.games,
        serviceTypes: action.payload.serviceTypes,
        loading: false,
        error: null,
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_GAME':
      return {
        ...state,
        games: [...state.games, action.payload],
      };
    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.id ? action.payload : game
        ),
      };
    case 'ADD_SERVICE_TYPE':
      return {
        ...state,
        serviceTypes: [...state.serviceTypes, action.payload],
      };
    case 'UPDATE_SERVICE_TYPE':
      return {
        ...state,
        serviceTypes: state.serviceTypes.map(serviceType => 
          serviceType.id === action.payload.id ? action.payload : serviceType
        ),
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
const GameContext = createContext<GameContextType | undefined>(undefined);

// Game provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  // Load games function
  const loadGames = async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' });

    try {
      const games = await ServiceService.getGames();
      
      // Load all service types for all games
      const allServiceTypes: ServiceType[] = [];
      for (const game of games) {
        const serviceTypes = await ServiceService.getServiceTypes(game.id);
        allServiceTypes.push(...serviceTypes);
      }

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: { games, serviceTypes: allServiceTypes },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load games';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  };

  // Get service types for a specific game
  const getServiceTypesForGame = (gameId: string): ServiceType[] => {
    return state.serviceTypes.filter(serviceType => serviceType.gameId === gameId);
  };

  // Add game (admin only)
  const addGame = async (gameData: Omit<Game, 'id'>): Promise<void> => {
    try {
      // In a real app, this would call an API
      const newGame: Game = {
        ...gameData,
        id: `game_${Date.now()}`,
      };
      
      dispatch({ type: 'ADD_GAME', payload: newGame });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add game';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update game (admin only)
  const updateGame = async (gameId: string, updates: Partial<Game>): Promise<void> => {
    try {
      const existingGame = state.games.find(game => game.id === gameId);
      if (!existingGame) {
        throw new Error('Game not found');
      }

      const updatedGame: Game = { ...existingGame, ...updates };
      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update game';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Add service type (admin only)
  const addServiceType = async (serviceTypeData: Omit<ServiceType, 'id'>): Promise<void> => {
    try {
      const newServiceType: ServiceType = {
        ...serviceTypeData,
        id: `st_${Date.now()}`,
      };
      
      dispatch({ type: 'ADD_SERVICE_TYPE', payload: newServiceType });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add service type';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update service type (admin only)
  const updateServiceType = async (serviceTypeId: string, updates: Partial<ServiceType>): Promise<void> => {
    try {
      const existingServiceType = state.serviceTypes.find(st => st.id === serviceTypeId);
      if (!existingServiceType) {
        throw new Error('Service type not found');
      }

      const updatedServiceType: ServiceType = { ...existingServiceType, ...updates };
      dispatch({ type: 'UPDATE_SERVICE_TYPE', payload: updatedServiceType });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service type';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh games function (alias for loadGames)
  const refreshGames = loadGames;

  const contextValue: GameContextType = {
    state,
    loadGames,
    refreshGames,
    getServiceTypesForGame,
    addGame,
    updateGame,
    addServiceType,
    updateServiceType,
    clearError,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use game context
export const useGames = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
};