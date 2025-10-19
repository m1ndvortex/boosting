// Optimized Data Loader for efficient wallet and transaction data loading

import type { 
  MultiWallet, 
  GameRealm, 
  GameDefinition, 
  MultiWalletTransaction,
  GoldWalletBalance 
} from '../types';
import { CacheService } from './cacheService';
import { StorageService } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'amount' | 'type';
  sortOrder?: 'asc' | 'desc';
}

interface TransactionFilters {
  walletType?: 'static' | 'gold';
  walletId?: string;
  type?: MultiWalletTransaction['type'];
  status?: MultiWalletTransaction['status'];
  currency?: string;
  goldType?: 'suspended' | 'withdrawable';
  dateFrom?: Date;
  dateTo?: Date;
}

interface LoadResult<T> {
  data: T;
  fromCache: boolean;
  loadTime: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  fromCache: boolean;
  loadTime: number;
}

export class OptimizedDataLoader {
  
  // ===== WALLET DATA LOADING =====

  /**
   * Load user wallet with caching and lazy loading
   */
  static async loadUserWallet(userId: string): Promise<LoadResult<MultiWallet>> {
    return PerformanceMonitor.timeAsync(
      'loadUserWallet',
      async () => {
        const startTime = Date.now();
        const cacheKey = CacheService.getWalletCacheKey(userId);

        // Try to get from cache first
        const cached = CacheService.get<MultiWallet>(cacheKey);
        if (cached) {
          return {
            data: cached,
            fromCache: true,
            loadTime: Date.now() - startTime
          };
        }

        // Load from storage
        const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
        const wallet = StorageService.getItem<MultiWallet>(walletKey);

        if (!wallet) {
          // Create default wallet if doesn't exist
          const defaultWallet: MultiWallet = {
            userId,
            staticWallets: {
              usd: { balance: 0, currency: 'usd' },
              toman: { balance: 0, currency: 'toman' }
            },
            goldWallets: {},
            updatedAt: new Date()
          };

          // Cache and return
          CacheService.set(cacheKey, defaultWallet);
          return {
            data: defaultWallet,
            fromCache: false,
            loadTime: Date.now() - startTime
          };
        }

        // Parse dates and process wallet data
        const processedWallet = this.processWalletData(wallet);

        // Cache the processed wallet
        CacheService.set(cacheKey, processedWallet);

        return {
          data: processedWallet,
          fromCache: false,
          loadTime: Date.now() - startTime
        };
      },
      { userId }
    ).then(result => result.result);
  }

  /**
   * Load multiple user wallets efficiently
   */
  static async loadMultipleWallets(userIds: string[]): Promise<Map<string, MultiWallet>> {
    const results = new Map<string, MultiWallet>();
    const cacheKeys = userIds.map(id => CacheService.getWalletCacheKey(id));
    
    // Batch get from cache
    const cached = CacheService.batchGet<MultiWallet>(cacheKeys);
    
    // Identify missing wallets
    const missingUserIds: string[] = [];
    userIds.forEach(userId => {
      const cacheKey = CacheService.getWalletCacheKey(userId);
      const cachedWallet = cached.get(cacheKey);
      
      if (cachedWallet) {
        results.set(userId, cachedWallet);
      } else {
        missingUserIds.push(userId);
      }
    });

    // Load missing wallets from storage
    const cacheEntries: Array<{ key: string; data: MultiWallet }> = [];
    
    for (const userId of missingUserIds) {
      const walletResult = await this.loadUserWallet(userId);
      results.set(userId, walletResult.data);
      
      if (!walletResult.fromCache) {
        cacheEntries.push({
          key: CacheService.getWalletCacheKey(userId),
          data: walletResult.data
        });
      }
    }

    // Batch cache the loaded wallets
    if (cacheEntries.length > 0) {
      CacheService.batchSet(cacheEntries);
    }

    return results;
  }

  // ===== GAME AND REALM DATA LOADING =====

  /**
   * Load active realms with caching
   */
  static async loadActiveRealms(): Promise<LoadResult<GameRealm[]>> {
    const startTime = Date.now();
    const cacheKey = CacheService.getRealmsCacheKey();

    return CacheService.getOrSet(cacheKey, () => {
      const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
      return realms
        .filter(realm => realm.isActive)
        .map(realm => ({
          ...realm,
          createdAt: new Date(realm.createdAt)
        }));
    }).then(data => ({
      data,
      fromCache: CacheService.get(cacheKey) !== null,
      loadTime: Date.now() - startTime
    }));
  }

  /**
   * Load realms for specific game with caching
   */
  static async loadGameRealms(gameId: string): Promise<LoadResult<GameRealm[]>> {
    const startTime = Date.now();
    const cacheKey = CacheService.getRealmsCacheKey(gameId);

    return CacheService.getOrSet(cacheKey, () => {
      const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
      return realms
        .filter(realm => realm.gameId === gameId && realm.isActive)
        .map(realm => ({
          ...realm,
          createdAt: new Date(realm.createdAt)
        }));
    }).then(data => ({
      data,
      fromCache: CacheService.get(cacheKey) !== null,
      loadTime: Date.now() - startTime
    }));
  }

  /**
   * Load active games with caching
   */
  static async loadActiveGames(): Promise<LoadResult<GameDefinition[]>> {
    const startTime = Date.now();
    const cacheKey = 'games:active';

    return CacheService.getOrSet(cacheKey, () => {
      const games = StorageService.getItem<GameDefinition[]>(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS) || [];
      return games
        .filter(game => game.isActive)
        .map(game => ({
          ...game,
          createdAt: new Date(game.createdAt)
        }));
    }).then(data => ({
      data,
      fromCache: CacheService.get(cacheKey) !== null,
      loadTime: Date.now() - startTime
    }));
  }

  // ===== TRANSACTION DATA LOADING =====

  /**
   * Load user transactions with pagination and caching
   */
  static async loadUserTransactions(
    userId: string,
    options: PaginationOptions = { page: 1, limit: 20 },
    filters?: TransactionFilters
  ): Promise<PaginatedResult<MultiWalletTransaction>> {
    return PerformanceMonitor.timeAsync(
      'loadUserTransactions',
      async () => {
        const startTime = Date.now();
        const cacheKey = CacheService.getTransactionsCacheKey(userId, { ...options, ...filters });

        // Try cache first for exact query
        const cached = CacheService.get<PaginatedResult<MultiWalletTransaction>>(cacheKey);
        if (cached) {
          return {
            ...cached,
            loadTime: Date.now() - startTime
          };
        }

        // Load all user transactions from storage
        const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${userId}`;
        let transactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];

        // Parse dates
        transactions = transactions.map(transaction => ({
          ...transaction,
          createdAt: new Date(transaction.createdAt)
        }));

        // Apply filters
        if (filters) {
          transactions = this.applyTransactionFilters(transactions, filters);
        }

        // Sort transactions
        transactions = this.sortTransactions(transactions, options.sortBy, options.sortOrder);

        // Apply pagination
        const total = transactions.length;
        const totalPages = Math.ceil(total / options.limit);
        const startIndex = (options.page - 1) * options.limit;
        const endIndex = startIndex + options.limit;
        const paginatedData = transactions.slice(startIndex, endIndex);

        const result: PaginatedResult<MultiWalletTransaction> = {
          data: paginatedData,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrev: options.page > 1
          },
          fromCache: false,
          loadTime: Date.now() - startTime
        };

        // Cache the result with shorter TTL for transaction data
        CacheService.set(cacheKey, result, CacheService['TTL_CONFIG'].user_transactions);

        return result;
      },
      { userId, page: options.page, limit: options.limit, hasFilters: !!filters }
    ).then(result => result.result);
  }

  /**
   * Load wallet-specific transactions with optimized filtering
   */
  static async loadWalletTransactions(
    userId: string,
    walletType: 'static' | 'gold',
    walletId: string,
    options: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginatedResult<MultiWalletTransaction>> {
    const filters: TransactionFilters = { walletType, walletId };
    return this.loadUserTransactions(userId, options, filters);
  }

  /**
   * Load recent transactions for dashboard (optimized for speed)
   */
  static async loadRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<LoadResult<MultiWalletTransaction[]>> {
    const startTime = Date.now();
    const cacheKey = `transactions:recent:${userId}:${limit}`;

    return CacheService.getOrSet(cacheKey, () => {
      const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${userId}`;
      let transactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];

      // Parse dates and sort by most recent
      transactions = transactions
        .map(transaction => ({
          ...transaction,
          createdAt: new Date(transaction.createdAt)
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);

      return transactions;
    }, 30 * 1000).then(data => ({ // 30 second cache for recent transactions
      data,
      fromCache: CacheService.get(cacheKey) !== null,
      loadTime: Date.now() - startTime
    }));
  }

  // ===== LAZY LOADING UTILITIES =====

  /**
   * Lazy load gold wallet details only when needed
   */
  static async lazyLoadGoldWalletDetails(
    userId: string,
    realmIds: string[]
  ): Promise<Map<string, GoldWalletBalance>> {
    const wallet = await this.loadUserWallet(userId);
    const results = new Map<string, GoldWalletBalance>();

    for (const realmId of realmIds) {
      const goldWallet = wallet.data.goldWallets[realmId];
      if (goldWallet) {
        results.set(realmId, goldWallet);
      }
    }

    return results;
  }

  /**
   * Preload data for user dashboard
   */
  static async preloadDashboardData(userId: string): Promise<void> {
    // Preload in parallel for better performance
    await Promise.all([
      this.loadUserWallet(userId),
      this.loadRecentTransactions(userId, 5),
      this.loadActiveRealms()
    ]);
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * Invalidate user-specific cache when wallet is updated
   */
  static invalidateUserCache(userId: string): void {
    CacheService.invalidateUserCache(userId);
  }

  /**
   * Invalidate game/realm cache when games or realms are updated
   */
  static invalidateGameCache(): void {
    CacheService.invalidateGameCache();
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats() {
    return CacheService.getStats();
  }

  // ===== PRIVATE HELPER METHODS =====

  private static processWalletData(wallet: MultiWallet): MultiWallet {
    // Ensure dates are properly parsed
    wallet.updatedAt = new Date(wallet.updatedAt);

    // Process gold wallets
    Object.values(wallet.goldWallets).forEach(goldWallet => {
      goldWallet.suspendedDeposits.forEach(deposit => {
        deposit.depositedAt = new Date(deposit.depositedAt);
        deposit.withdrawableAt = new Date(deposit.withdrawableAt);
      });
    });

    return wallet;
  }

  private static applyTransactionFilters(
    transactions: MultiWalletTransaction[],
    filters: TransactionFilters
  ): MultiWalletTransaction[] {
    return transactions.filter(transaction => {
      if (filters.walletType && transaction.walletType !== filters.walletType) return false;
      if (filters.walletId && transaction.walletId !== filters.walletId) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.status && transaction.status !== filters.status) return false;
      if (filters.currency && transaction.currency !== filters.currency) return false;
      if (filters.goldType && transaction.goldType !== filters.goldType) return false;
      if (filters.dateFrom && transaction.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && transaction.createdAt > filters.dateTo) return false;
      return true;
    });
  }

  private static sortTransactions(
    transactions: MultiWalletTransaction[],
    sortBy: PaginationOptions['sortBy'] = 'createdAt',
    sortOrder: PaginationOptions['sortOrder'] = 'desc'
  ): MultiWalletTransaction[] {
    return transactions.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}