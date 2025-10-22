// Multi-Wallet Service for managing dynamic wallet system

import type { 
  MultiWallet, 
  GoldWalletBalance, 
  SuspendedDeposit, 
  MultiWalletTransaction, 
  GameRealm,
  MultiWalletErrorType
} from '../types';
import { StorageService } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';
import { ErrorService, ErrorCode } from './errorService';
import { MultiWalletValidationService } from './multiWalletValidationService';
import { OptimizedDataLoader } from './optimizedDataLoader';
import { CacheService } from './cacheService';
import { TransactionIndexService } from './transactionIndexService';
// import { WalletService } from './walletService'; // Unused import

// Multi-Wallet Error Class
export class MultiWalletError extends Error {
  public type: MultiWalletErrorType;
  public details?: Record<string, any>;
  
  constructor(
    type: MultiWalletErrorType,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MultiWalletError';
    this.type = type;
    this.details = details;
  }
}

export class MultiWalletService {
  // ===== WALLET MANAGEMENT =====
  
  /**
   * Get user's multi-wallet, creating default if doesn't exist
   * Uses optimized data loading with caching
   */
  static getMultiWallet(userId: string): MultiWallet {
    // Try to get from cache first
    const cacheKey = CacheService.getWalletCacheKey(userId);
    const cached = CacheService.get<MultiWallet>(cacheKey);
    if (cached) {
      return cached;
    }

    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
    const existingWallet = StorageService.getItem<MultiWallet>(walletKey);
    
    if (existingWallet) {
      // Ensure dates are properly parsed
      existingWallet.updatedAt = new Date(existingWallet.updatedAt);
      
      // Parse suspended deposit dates
      Object.values(existingWallet.goldWallets).forEach(goldWallet => {
        goldWallet.suspendedDeposits.forEach(deposit => {
          deposit.depositedAt = new Date(deposit.depositedAt);
          deposit.withdrawableAt = new Date(deposit.withdrawableAt);
        });
      });
      
      // Cache the wallet
      CacheService.set(cacheKey, existingWallet);
      return existingWallet;
    }
    
    // Create default multi-wallet
    const defaultWallet: MultiWallet = {
      userId,
      staticWallets: {
        usd: { balance: 0, currency: 'usd' },
        toman: { balance: 0, currency: 'toman' }
      },
      goldWallets: {},
      updatedAt: new Date()
    };
    
    // Save and cache
    this.saveMultiWallet(defaultWallet);
    CacheService.set(cacheKey, defaultWallet);
    return defaultWallet;
  }

  /**
   * Get user's multi-wallet asynchronously with optimized loading
   */
  static async getMultiWalletAsync(userId: string): Promise<MultiWallet> {
    const result = await OptimizedDataLoader.loadUserWallet(userId);
    return result.data;
  }
  
  /**
   * Save multi-wallet to storage and update cache
   */
  private static saveMultiWallet(wallet: MultiWallet): void {
    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${wallet.userId}`;
    wallet.updatedAt = new Date();
    StorageService.setItem(walletKey, wallet);
    
    // Update cache
    const cacheKey = CacheService.getWalletCacheKey(wallet.userId);
    CacheService.set(cacheKey, wallet);
  }
  
  /**
   * Create a new gold wallet for a specific realm
   */
  static async createGoldWallet(userId: string, realmId: string): Promise<MultiWallet> {
    try {
      const wallet = this.getMultiWallet(userId);
      
      // Validate wallet creation request
      const validation = MultiWalletValidationService.validateWalletCreation(userId, realmId, wallet);
      if (!validation.isValid) {
        const error = validation.errors[0];
        throw ErrorService.createError(
          error.code as any,
          error.details,
          error.message,
          userId,
          'wallet_creation'
        );
      }
      
      // Get realm information
      const realm = this.getGameRealm(realmId);
      if (!realm) {
        throw ErrorService.createError(
          'REALM_NOT_FOUND',
          { realmId },
          'Game realm not found',
          userId,
          'wallet_creation'
        );
      }

      if (!realm.isActive) {
        throw ErrorService.createError(
          'REALM_NOT_FOUND',
          { realmId, isActive: realm.isActive },
          'Game realm is not active',
          userId,
          'wallet_creation'
        );
      }
      
      // Create new gold wallet
      const goldWallet: GoldWalletBalance = {
        realmId: realm.id,
        realmName: realm.realmName,
        gameName: realm.gameName,
        suspendedGold: 0,
        withdrawableGold: 0,
        totalGold: 0,
        suspendedDeposits: []
      };
      
      wallet.goldWallets[realmId] = goldWallet;
      this.saveMultiWallet(wallet);
      
      return wallet;
    } catch (error) {
      throw ErrorService.handleError(error, 'MultiWalletService.createGoldWallet', userId);
    }
  }
  
  /**
   * Remove a gold wallet
   */
  static async removeGoldWallet(userId: string, realmId: string, forceRemove: boolean = false): Promise<MultiWallet> {
    try {
      const wallet = this.getMultiWallet(userId);
      
      // Validate wallet removal request
      const validation = MultiWalletValidationService.validateWalletRemoval(userId, realmId, wallet);
      if (!validation.isValid) {
        const error = validation.errors[0];
        throw ErrorService.createError(
          error.code as any,
          error.details,
          error.message,
          userId,
          'wallet_removal'
        );
      }
      
      const goldWallet = wallet.goldWallets[realmId];
      
      // Check if wallet has balance (unless forced)
      if (!forceRemove && goldWallet.totalGold > 0) {
        throw ErrorService.createError(
          'WALLET_HAS_BALANCE',
          { 
            realmId, 
            balance: goldWallet.totalGold,
            suspendedGold: goldWallet.suspendedGold,
            withdrawableGold: goldWallet.withdrawableGold
          },
          `Cannot remove wallet with ${goldWallet.totalGold} gold balance. Transfer or withdraw funds first.`,
          userId,
          'wallet_removal'
        );
      }
      
      delete wallet.goldWallets[realmId];
      this.saveMultiWallet(wallet);
      
      return wallet;
    } catch (error) {
      throw ErrorService.handleError(error, 'MultiWalletService.removeGoldWallet', userId);
    }
  }

  /**
   * Get available realms for creating gold wallets with caching
   */
  static getAvailableRealms(): GameRealm[] {
    // Try cache first
    const cacheKey = CacheService.getRealmsCacheKey();
    const cached = CacheService.get<GameRealm[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Load from storage
    const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
    const activeRealms = realms.filter(realm => realm.isActive);
    
    // Cache the result
    CacheService.set(cacheKey, activeRealms);
    return activeRealms;
  }

  /**
   * Get available realms asynchronously with optimized loading
   */
  static async getAvailableRealmsAsync(): Promise<GameRealm[]> {
    const result = await OptimizedDataLoader.loadActiveRealms();
    return result.data;
  }

  // ===== TRANSACTION METHODS =====
  
  /**
   * Deduct amount for purchase
   */
  static async deductForPurchase(
    userId: string,
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    orderId: string,
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    return await MultiWalletTransactionService.createPurchaseTransaction(
      userId,
      walletType,
      walletId,
      amount,
      walletType === 'gold' ? 'gold' : (walletId as 'usd' | 'toman'),
      goldType,
      orderId
    );
  }

  /**
   * Add earnings to wallet
   */
  static async addEarnings(
    userId: string,
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    orderId: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    return await MultiWalletTransactionService.createEarningTransaction(
      userId,
      walletType,
      walletId,
      amount,
      walletType === 'gold' ? 'gold' : (walletId as 'usd' | 'toman'),
      'withdrawable', // Earnings are always withdrawable
      orderId
    );
  }

  /**
   * Deposit to wallet
   */
  static async deposit(
    userId: string,
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    paymentMethod: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    
    if (walletType === 'static') {
      return await MultiWalletTransactionService.createStaticWalletDeposit(
        userId,
        walletId as 'usd' | 'toman',
        amount,
        paymentMethod
      );
    } else {
      return await MultiWalletTransactionService.createGoldWalletDeposit(
        userId,
        walletId,
        amount,
        'withdrawable'
      );
    }
  }

  /**
   * Request withdrawal from wallet
   */
  static async requestWithdrawal(
    userId: string,
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    paymentMethod: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    
    if (walletType === 'static') {
      return await MultiWalletTransactionService.createStaticWalletWithdrawal(
        userId,
        walletId as 'usd' | 'toman',
        amount,
        paymentMethod
      );
    } else {
      return await MultiWalletTransactionService.createGoldWalletWithdrawal(
        userId,
        walletId,
        amount,
        'withdrawable'
      );
    }
  }

  /**
   * Convert between wallets
   */
  static async convertBetweenWallets(
    userId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    
    // Determine wallet types and currencies based on wallet IDs
    const fromWalletType = ['usd', 'toman'].includes(fromWalletId) ? 'static' : 'gold';
    const toWalletType = ['usd', 'toman'].includes(toWalletId) ? 'static' : 'gold';
    const fromCurrency = fromWalletType === 'static' ? (fromWalletId as 'usd' | 'toman') : 'gold';
    const toCurrency = toWalletType === 'static' ? (toWalletId as 'usd' | 'toman') : 'gold';
    
    return await MultiWalletTransactionService.createConversionTransaction(
      userId,
      fromWalletType,
      fromWalletId,
      toWalletType,
      toWalletId,
      amount,
      fromCurrency,
      toCurrency,
      goldType
    );
  }

  /**
   * Convert suspended gold to fiat currency
   */
  static async convertSuspendedGoldToFiat(
    userId: string,
    realmId: string,
    amount: number,
    targetCurrency: 'usd' | 'toman'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    const { ConversionFeeService } = await import('./conversionFeeService');
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    
    // Calculate conversion with fees
    const { convertedAmount, feeAmount } = ConversionFeeService.applyConversionFee(amount, targetCurrency);
    
    // Create conversion transaction
    const result = await MultiWalletTransactionService.createConversionTransaction(
      userId,
      'gold',
      realmId,
      'static',
      targetCurrency,
      amount,
      'gold',
      targetCurrency,
      'suspended'
    );
    
    // Update the transaction with fee information
    result.transaction.conversionFee = feeAmount;
    result.transaction.amount = convertedAmount;
    
    return result;
  }

  /**
   * Get user transactions with caching
   */
  static getTransactions(userId: string): MultiWalletTransaction[] {
    // Try cache first
    const cacheKey = CacheService.getTransactionsCacheKey(userId);
    const cached = CacheService.get<MultiWalletTransaction[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Load from storage
    const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${userId}`;
    let transactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];

    // Parse dates
    transactions = transactions.map(transaction => ({
      ...transaction,
      createdAt: new Date(transaction.createdAt)
    }));

    const sortedTransactions = transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Cache the result
    CacheService.set(cacheKey, sortedTransactions);
    return sortedTransactions;
  }

  /**
   * Get user transactions asynchronously with pagination and optimized queries
   */
  static async getTransactionsAsync(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      walletType?: 'static' | 'gold';
      walletId?: string;
      type?: MultiWalletTransaction['type'];
      status?: MultiWalletTransaction['status'];
    }
  ): Promise<{
    transactions: MultiWalletTransaction[];
    total: number;
    hasMore: boolean;
    queryTime: number;
  }> {
    const result = await TransactionIndexService.queryTransactions({
      userId,
      ...options,
      offset: options?.page ? (options.page - 1) * (options.limit || 20) : 0,
      limit: options?.limit || 20
    });

    return result;
  }

  /**
   * Get recent transactions for dashboard (optimized)
   */
  static async getRecentTransactions(userId: string, limit: number = 10): Promise<MultiWalletTransaction[]> {
    const result = await OptimizedDataLoader.loadRecentTransactions(userId, limit);
    return result.data;
  }

  // ===== BALANCE UPDATE METHODS =====
  
  /**
   * Update static wallet balance
   */
  static async updateStaticBalance(
    userId: string,
    currency: 'usd' | 'toman',
    amount: number
  ): Promise<MultiWallet> {
    try {
      const wallet = this.getMultiWallet(userId);
      
      // Validate transaction if it's a debit
      if (amount < 0) {
        const validation = MultiWalletValidationService.validateTransaction(
          Math.abs(amount),
          'static',
          currency,
          wallet,
          'debit'
        );
        
        if (!validation.isValid) {
          const error = validation.errors[0];
          throw ErrorService.createError(
            error.code as any,
            error.details,
            error.message,
            userId,
            'static_balance_update'
          );
        }
      }
      
      const newBalance = wallet.staticWallets[currency].balance + amount;
      
      // Additional safety check
      if (newBalance < 0) {
        throw ErrorService.createError(
          ErrorCode.INSUFFICIENT_BALANCE,
          { 
            current: wallet.staticWallets[currency].balance, 
            requested: Math.abs(amount),
            currency,
            newBalance
          },
          `Insufficient ${currency.toUpperCase()} balance`,
          userId,
          'static_balance_update'
        );
      }
      
      wallet.staticWallets[currency].balance = newBalance;
      this.saveMultiWallet(wallet);
      return wallet;
    } catch (error) {
      throw ErrorService.handleError(error, 'MultiWalletService.updateStaticBalance', userId);
    }
  }

  /**
   * Update gold wallet balance
   */
  static async updateGoldBalance(
    userId: string,
    realmId: string,
    suspendedAmount: number,
    withdrawableAmount: number
  ): Promise<MultiWallet> {
    try {
      const wallet = this.getMultiWallet(userId);
      const goldWallet = wallet.goldWallets[realmId];
      
      if (!goldWallet) {
        throw ErrorService.createError(
          'WALLET_NOT_FOUND',
          { realmId },
          'Gold wallet not found',
          userId,
          'gold_balance_update'
        );
      }
      
      // Validate transactions if they are debits
      if (suspendedAmount < 0) {
        const validation = MultiWalletValidationService.validateTransaction(
          Math.abs(suspendedAmount),
          'gold',
          realmId,
          wallet,
          'debit',
          'suspended'
        );
        
        if (!validation.isValid) {
          const error = validation.errors[0];
          throw ErrorService.createError(
            error.code as any,
            error.details,
            error.message,
            userId,
            'gold_balance_update'
          );
        }
      }
      
      if (withdrawableAmount < 0) {
        const validation = MultiWalletValidationService.validateTransaction(
          Math.abs(withdrawableAmount),
          'gold',
          realmId,
          wallet,
          'debit',
          'withdrawable'
        );
        
        if (!validation.isValid) {
          const error = validation.errors[0];
          throw ErrorService.createError(
            error.code as any,
            error.details,
            error.message,
            userId,
            'gold_balance_update'
          );
        }
      }
      
      const newSuspended = goldWallet.suspendedGold + suspendedAmount;
      const newWithdrawable = goldWallet.withdrawableGold + withdrawableAmount;
      
      // Additional safety checks
      if (newSuspended < 0 || newWithdrawable < 0) {
        throw ErrorService.createError(
          ErrorCode.INSUFFICIENT_BALANCE,
          { 
            currentSuspended: goldWallet.suspendedGold, 
            currentWithdrawable: goldWallet.withdrawableGold,
            requestedSuspended: suspendedAmount,
            requestedWithdrawable: withdrawableAmount,
            newSuspended,
            newWithdrawable
          },
          'Insufficient gold balance for this operation',
          userId,
          'gold_balance_update'
        );
      }
      
      goldWallet.suspendedGold = newSuspended;
      goldWallet.withdrawableGold = newWithdrawable;
      goldWallet.totalGold = newSuspended + newWithdrawable;
      
      this.saveMultiWallet(wallet);
      return wallet;
    } catch (error) {
      throw ErrorService.handleError(error, 'MultiWalletService.updateGoldBalance', userId);
    }
  }

  // ===== SUSPENDED GOLD MANAGEMENT =====
  
  /**
   * Add suspended gold deposit (admin function)
   */
  static async addSuspendedGold(
    userId: string, 
    realmId: string, 
    amount: number, 
    adminId: string
  ): Promise<MultiWallet> {
    try {
      // Validate admin gold deposit
      const validation = MultiWalletValidationService.validateAdminGoldDeposit(
        userId, 
        realmId, 
        amount, 
        adminId
      );
      
      if (!validation.isValid) {
        const error = validation.errors[0];
        throw ErrorService.createError(
          error.code as any,
          error.details,
          error.message,
          adminId,
          'admin_gold_deposit'
        );
      }
      
      const wallet = this.getMultiWallet(userId);
      
      // Ensure gold wallet exists
      if (!wallet.goldWallets[realmId]) {
        await this.createGoldWallet(userId, realmId);
        // Refresh wallet after creation
        const updatedWallet = this.getMultiWallet(userId);
        wallet.goldWallets[realmId] = updatedWallet.goldWallets[realmId];
      }
      
      const goldWallet = wallet.goldWallets[realmId];
      
      // Create suspended deposit record
      const depositId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const depositedAt = new Date();
      const withdrawableAt = new Date(depositedAt.getTime() + (2 * 30 * 24 * 60 * 60 * 1000)); // 2 months
      
      const suspendedDeposit: SuspendedDeposit = {
        id: depositId,
        amount,
        depositedAt,
        withdrawableAt,
        depositedBy: adminId,
        status: 'suspended'
      };
      
      // Add to suspended deposits
      goldWallet.suspendedDeposits.push(suspendedDeposit);
      
      // Update balances
      goldWallet.suspendedGold += amount;
      goldWallet.totalGold = goldWallet.suspendedGold + goldWallet.withdrawableGold;
      
      this.saveMultiWallet(wallet);
      return wallet;
    } catch (error) {
      throw ErrorService.handleError(error, 'MultiWalletService.addSuspendedGold', adminId);
    }
  }

  // ===== HELPER METHODS =====
  
  /**
   * Get game realm information with caching
   */
  private static getGameRealm(realmId: string): GameRealm | null {
    // Try to get from cached realms first
    const cachedRealms = CacheService.get<GameRealm[]>(CacheService.getRealmsCacheKey());
    if (cachedRealms) {
      return cachedRealms.find(realm => realm.id === realmId) || null;
    }

    // Fallback to storage
    const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
    return realms.find(realm => realm.id === realmId) || null;
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * Invalidate user-specific cache when wallet data changes
   */
  static invalidateUserCache(userId: string): void {
    OptimizedDataLoader.invalidateUserCache(userId);
  }

  /**
   * Invalidate game/realm cache when game data changes
   */
  static invalidateGameCache(): void {
    OptimizedDataLoader.invalidateGameCache();
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats() {
    return OptimizedDataLoader.getCacheStats();
  }

  /**
   * Preload dashboard data for better performance
   */
  static async preloadDashboardData(userId: string): Promise<void> {
    await OptimizedDataLoader.preloadDashboardData(userId);
  }

  /**
   * Get transaction statistics using optimized indexes
   */
  static async getTransactionStats(userId: string): Promise<{
    totalTransactions: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byWallet: Record<string, number>;
    totalAmount: number;
    averageAmount: number;
  }> {
    return await TransactionIndexService.getTransactionStats(userId);
  }

  /**
   * Process expired suspended gold deposits
   * This method handles cleanup of expired suspended deposits
   */
  static async processSuspendedGoldExpiry(): Promise<void> {
    try {
      // Get all suspended deposits from storage
      const suspendedDeposits = StorageService.get<SuspendedDeposit[]>(
        MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS
      ) || [];

      const now = new Date();
      const expiredDeposits = suspendedDeposits.filter(deposit => {
        const expiryDate = new Date(deposit.expiresAt);
        return expiryDate <= now;
      });

      if (expiredDeposits.length === 0) {
        return; // No expired deposits to process
      }

      // Remove expired deposits from storage
      const remainingDeposits = suspendedDeposits.filter(deposit => {
        const expiryDate = new Date(deposit.expiresAt);
        return expiryDate > now;
      });

      StorageService.set(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS, remainingDeposits);

      console.log(`Processed ${expiredDeposits.length} expired suspended gold deposits`);
    } catch (error) {
      console.error('Failed to process suspended gold expiry:', error);
      throw new MultiWalletError(
        'PROCESSING_ERROR',
        'Failed to process expired suspended deposits',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}