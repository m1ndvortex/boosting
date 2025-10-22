// Multi-Wallet Hook for managing wallet state and operations

import { useState, useEffect, useCallback } from 'react';
import { MultiWalletService } from '../services/multiWalletService';
import type { MultiWallet, GameRealm, MultiWalletTransaction } from '../types';

interface MultiWalletState {
  wallet: MultiWallet | null;
  availableRealms: GameRealm[];
  transactions: MultiWalletTransaction[];
  loading: boolean;
  error: string | null;
}

interface MultiWalletActions {
  refreshWallet: () => Promise<void>;
  addGoldWallet: (realmId: string) => Promise<void>;
  removeGoldWallet: (realmId: string) => Promise<void>;
  addSuspendedGold: (realmId: string, amount: number, adminId: string) => Promise<void>;
  convertSuspendedGoldToFiat: (realmId: string, amount: number, targetCurrency: 'usd' | 'toman') => Promise<void>;
  convertBetweenGoldWallets: (fromRealmId: string, toRealmId: string, amount: number, goldType: 'suspended' | 'withdrawable') => Promise<void>;
  updateStaticBalance: (currency: 'usd' | 'toman', amount: number) => Promise<void>;
}

export const useMultiWallet = (userId: string): MultiWalletState & MultiWalletActions => {
  const [state, setState] = useState<MultiWalletState>({
    wallet: null,
    availableRealms: [],
    transactions: [],
    loading: true,
    error: null
  });

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use optimized data loading
      const [walletResult, realmsResult, transactionsResult] = await Promise.all([
        MultiWalletService.getMultiWalletAsync(userId),
        MultiWalletService.getAvailableRealmsAsync(),
        MultiWalletService.getRecentTransactions(userId, 50) // Load more for hook
      ]);

      setState(prev => ({
        ...prev,
        wallet: walletResult,
        availableRealms: realmsResult,
        transactions: transactionsResult,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error refreshing multi-wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to load wallet');
    }
  }, [userId, setLoading, setError]);

  const addGoldWallet = useCallback(async (realmId: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedWallet = await MultiWalletService.createGoldWallet(userId, realmId);
      
      setState(prev => ({
        ...prev,
        wallet: updatedWallet,
        loading: false
      }));
    } catch (error) {
      console.error('Error adding gold wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to add gold wallet');
    }
  }, [userId, setLoading, setError]);

  const removeGoldWallet = useCallback(async (realmId: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedWallet = await MultiWalletService.removeGoldWallet(userId, realmId, true);
      
      setState(prev => ({
        ...prev,
        wallet: updatedWallet,
        loading: false
      }));
    } catch (error) {
      console.error('Error removing gold wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove gold wallet');
    }
  }, [userId, setLoading, setError]);

  const addSuspendedGold = useCallback(async (realmId: string, amount: number, adminId: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedWallet = await MultiWalletService.addSuspendedGold(userId, realmId, amount, adminId);
      const transactions = MultiWalletService.getMultiWalletTransactions(userId);
      
      setState(prev => ({
        ...prev,
        wallet: updatedWallet,
        transactions,
        loading: false
      }));
    } catch (error) {
      console.error('Error adding suspended gold:', error);
      setError(error instanceof Error ? error.message : 'Failed to add suspended gold');
    }
  }, [userId, setLoading, setError]);

  const convertSuspendedGoldToFiat = useCallback(async (realmId: string, amount: number, targetCurrency: 'usd' | 'toman') => {
    try {
      setLoading(true);
      setError(null);

      const result = await MultiWalletService.convertSuspendedGoldToFiat(userId, realmId, amount, targetCurrency);
      const transactions = MultiWalletService.getMultiWalletTransactions(userId);
      
      setState(prev => ({
        ...prev,
        wallet: result.wallet,
        transactions,
        loading: false
      }));
    } catch (error) {
      console.error('Error converting suspended gold to fiat:', error);
      setError(error instanceof Error ? error.message : 'Failed to convert suspended gold');
    }
  }, [userId, setLoading, setError]);

  const convertBetweenGoldWallets = useCallback(async (
    fromRealmId: string, 
    toRealmId: string, 
    amount: number, 
    goldType: 'suspended' | 'withdrawable'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await MultiWalletService.convertBetweenGoldWallets(userId, fromRealmId, toRealmId, amount, goldType);
      const transactions = MultiWalletService.getMultiWalletTransactions(userId);
      
      setState(prev => ({
        ...prev,
        wallet: result.wallet,
        transactions,
        loading: false
      }));
    } catch (error) {
      console.error('Error converting between gold wallets:', error);
      setError(error instanceof Error ? error.message : 'Failed to convert between gold wallets');
    }
  }, [userId, setLoading, setError]);

  const updateStaticBalance = useCallback(async (currency: 'usd' | 'toman', amount: number) => {
    try {
      setLoading(true);
      setError(null);

      const updatedWallet = await MultiWalletService.updateStaticBalance(userId, currency, amount);
      
      setState(prev => ({
        ...prev,
        wallet: updatedWallet,
        loading: false
      }));
    } catch (error) {
      console.error('Error updating static balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to update balance');
    }
  }, [userId, setLoading, setError]);

  // Initialize wallet on mount
  useEffect(() => {
    if (userId) {
      refreshWallet();
    }
  }, [userId, refreshWallet]);

  // Process suspended gold expiry periodically and preload dashboard data
  useEffect(() => {
    const processExpiry = async () => {
      try {
        // Preload dashboard data for better performance
        await MultiWalletService.preloadDashboardData(userId);
        
        // Process suspended gold expiry (if method exists)
        if ('processSuspendedGoldExpiry' in MultiWalletService) {
          await (MultiWalletService as any).processSuspendedGoldExpiry();
          
          // Check if refresh is needed (simplified check)
          if (state.wallet && Object.values(state.wallet.goldWallets).some(gw => gw.suspendedGold > 0)) {
            refreshWallet();
          }
        }
      } catch (error) {
        console.error('Error processing suspended gold expiry:', error);
      }
    };

    // Process expiry every 5 minutes
    const interval = setInterval(processExpiry, 5 * 60 * 1000);
    
    // Process immediately on mount
    processExpiry();

    return () => clearInterval(interval);
  }, [userId, state.wallet, refreshWallet]);

  return {
    ...state,
    refreshWallet,
    addGoldWallet,
    removeGoldWallet,
    addSuspendedGold,
    convertSuspendedGoldToFiat,
    convertBetweenGoldWallets,
    updateStaticBalance
  };
};