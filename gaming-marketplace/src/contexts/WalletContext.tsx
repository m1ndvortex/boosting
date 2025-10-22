// Wallet context for global wallet state management

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Wallet, Transaction, Currency } from '../types';
import { WalletService } from '../services/walletService';
import { useAuth } from './AuthContext';

// Wallet state
interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// Wallet actions
type WalletAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { wallet: Wallet; transactions: Transaction[] } }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// Wallet context type
interface WalletContextType {
  state: WalletState;
  loadWallet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  deposit: (amount: number, currency: Currency, paymentMethod: string) => Promise<void>;
  requestWithdrawal: (amount: number, currency: Currency, paymentMethod: string) => Promise<void>;
  convertCurrency: (fromCurrency: Currency, toCurrency: Currency, amount: number) => Promise<void>;
  deductForPurchase: (amount: number, currency: Currency, orderId: string) => Promise<void>;
  addEarnings: (amount: number, currency: Currency, orderId: string) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
};

// Wallet reducer
function walletReducer(state: WalletState, action: WalletAction): WalletState {
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
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet provider component
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { state: authState } = useAuth();

  // Load wallet data when user changes
  useEffect(() => {
    if (authState.user) {
      loadWallet();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [authState.user]);

  // Load wallet function
  const loadWallet = async (): Promise<void> => {
    if (!authState.user) return;

    dispatch({ type: 'LOAD_START' });

    try {
      const wallet = WalletService.getWallet(authState.user.id);
      const transactions = WalletService.getTransactions(authState.user.id);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: { wallet, transactions },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load wallet';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  };

  // Deposit function
  const deposit = async (
    amount: number,
    currency: Currency,
    paymentMethod: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await WalletService.deposit(
        authState.user.id,
        amount,
        currency,
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
    currency: Currency,
    paymentMethod: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await WalletService.requestWithdrawal(
        authState.user.id,
        amount,
        currency,
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
    fromCurrency: Currency,
    toCurrency: Currency,
    amount: number
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await WalletService.convertCurrency(
        authState.user.id,
        fromCurrency,
        toCurrency,
        amount
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
    currency: Currency,
    orderId: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await WalletService.deductForPurchase(
        authState.user.id,
        amount,
        currency,
        orderId
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
    currency: Currency,
    orderId: string
  ): Promise<void> => {
    if (!authState.user) throw new Error('User not authenticated');

    try {
      const { transaction, wallet } = await WalletService.addEarnings(
        authState.user.id,
        amount,
        currency,
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

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh wallet function (alias for loadWallet)
  const refreshWallet = loadWallet;

  const contextValue: WalletContextType = {
    state,
    loadWallet,
    refreshWallet,
    deposit,
    requestWithdrawal,
    convertCurrency,
    deductForPurchase,
    addEarnings,
    clearError,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};