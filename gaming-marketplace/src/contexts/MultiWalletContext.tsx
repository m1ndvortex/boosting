// Multi-Wallet context for global multi-wallet state management

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { MultiWallet, MultiWalletTransaction, GameRealm } from '../types';
import { MultiWalletService } from '../services/multiWalletService';
import { useAuth } from './AuthContext';

// Multi-Wallet state
interface MultiWalletState {
  wallet: MultiWallet | null;
  transactions: MultiWalletTransaction[];
  availableRealms: GameRealm[];
  loading: boolean;
  error: string | null;
}

// Multi-Wallet actions
type MultiWalletAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { wallet: MultiWallet; transactions: MultiWalletTransaction[]; realms: GameRealm[] } }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'UPDATE_WALLET'; payload: MultiWallet }
  | { type: 'ADD_TRANSACTION'; payload: MultiWalletTransaction }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// Multi-Wallet context type
interface MultiWalletContextType {
  state: MultiWalletState;
  loadWallet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  addGoldWallet: (realmId: string) => Promise<void>;
  removeGoldWallet: (realmId: string) => Promise<void>;
  deposit: (amount: number, walletType: 'static' | 'gold', walletId: string, paymentMethod: string) => Promise<void>;
  requestWithdrawal: (amount: number, walletType: 'static' | 'gold', walletId: string, paymentMethod: string) => Promise<void>;
  convertCurrency: (fromWalletId: string, toWalletId: string, amount: number, goldType?: 'suspended' | 'withdrawable') => Promise<void>;
  deductForPurchase: (amount: number, walletType: 'static' | 'gold', walletId: string, orderId: string, goldType?: 'suspended' | 'withdrawable') => Promise<void>;
  addEarnings: (amount: number, walletType: 'static' | 'gold', walletId: string, orderId: string) => Promise<void>;
  convertSuspendedGoldToFiat: (realmId: string, amount: number, targetCurrency: 'usd' | 'toman') => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: MultiWalletState = {
  wallet: null,
  transactions: [],
  availableRealms: [],
  loading: false,
  error: null,
};

// Multi-Wallet reducer
function multiWalletReducer(state: MultiWalletState, action: MultiWalletAction): MultiWalletState {
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
        wallet: action.payload.wallet,
        transactions: action.payload.transactions,
        availableRealms: action.payload.realms,
        loading: false,
        error: null,
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_WALLET':
      return {
        ...state,
        wallet: action.payload,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
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
const MultiWalletContext = createContext<MultiWalletContextType | undefined>(undefined);

// Multi-Wallet provider component
export const MultiWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(multiWalletReducer, initialState);
  const { state: authState } = useAuth();

  // Load wallet data when user changes
  useEffect(() => {
    if (authState.user) {
      loadWallet();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [authState.user]);

  // Load wallet function with optimized loading
  const loadWallet = async (): Promise<void> => {
    if (!authState.user) return;

    dispatch({ type: 'LOAD_START' });

    try {
      // Use optimized parallel loading
      const [walletResult, transactionsResult, realmsResult] = await Promise.all([
        MultiWalletService.getMultiWalletAsync(authState.user.id),
        MultiWalletService.getRecentTransactions(authState.user.id, 100),
        MultiWalletService.getAvailableRealmsAsync()
      ]);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: { 
          wallet: walletResult, 
          transactions: transactionsResult, 
          realms: realmsResult 
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load wallet';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  };

  // Add gold wallet function
  const addGoldWallet = async (realmId: string): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const wallet = await MultiWalletService.createGoldWallet(authState.user.id, realmId);
      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add gold wallet';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Remove gold wallet function
  const removeGoldWallet = async (realmId: string): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const wallet = await MultiWalletService.removeGoldWallet(authState.user.id, realmId);
      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove gold wallet';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Deposit function
  const deposit = async (
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    paymentMethod: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await MultiWalletService.deposit(
        authState.user.id,
        amount,
        walletType,
        walletId,
        paymentMethod
      );

      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deposit failed';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Request withdrawal function
  const requestWithdrawal = async (
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    paymentMethod: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await MultiWalletService.requestWithdrawal(
        authState.user.id,
        amount,
        walletType,
        walletId,
        paymentMethod
      );

      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Withdrawal request failed';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Convert currency function
  const convertCurrency = async (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await MultiWalletService.convertBetweenWallets(
        authState.user.id,
        fromWalletId,
        toWalletId,
        amount,
        goldType
      );

      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Currency conversion failed';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Deduct for purchase function
  const deductForPurchase = async (
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    orderId: string,
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await MultiWalletService.deductForPurchase(
        authState.user.id,
        amount,
        walletType,
        walletId,
        orderId,
        goldType
      );

      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase deduction failed';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Add earnings function
  const addEarnings = async (
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    orderId: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await MultiWalletService.addEarnings(
        authState.user.id,
        amount,
        walletType,
        walletId,
        orderId
      );

      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Adding earnings failed';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Convert suspended gold to fiat function
  const convertSuspendedGoldToFiat = async (
    realmId: string,
    amount: number,
    targetCurrency: 'usd' | 'toman'
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await MultiWalletService.convertSuspendedGoldToFiat(
        authState.user.id,
        realmId,
        amount,
        targetCurrency
      );

      dispatch({ type: 'UPDATE_WALLET', payload: wallet });
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Suspended gold conversion failed';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh wallet function (alias for loadWallet)
  const refreshWallet = loadWallet;

  const contextValue: MultiWalletContextType = {
    state,
    loadWallet,
    refreshWallet,
    addGoldWallet,
    removeGoldWallet,
    deposit,
    requestWithdrawal,
    convertCurrency,
    deductForPurchase,
    addEarnings,
    convertSuspendedGoldToFiat,
    clearError,
  };

  return (
    <MultiWalletContext.Provider value={contextValue}>
      {children}
    </MultiWalletContext.Provider>
  );
};

// Custom hook to use multi-wallet context
export const useMultiWallet = (): MultiWalletContextType => {
  const context = useContext(MultiWalletContext);
  if (context === undefined) {
    throw new Error('useMultiWallet must be used within a MultiWalletProvider');
  }
  return context;
};