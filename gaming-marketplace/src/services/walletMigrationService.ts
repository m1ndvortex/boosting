// Wallet Migration Service for converting old wallet format to multi-wallet system

import type { 
  Wallet, 
  MultiWallet, 
  Transaction, 
  MultiWalletTransaction,
  GameRealm
} from '../types';
import { StorageService, STORAGE_KEYS } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';
import { WalletService } from './walletService';
import { MultiWalletService } from './multiWalletService';

export interface MigrationResult {
  success: boolean;
  userId: string;
  migratedWallet?: MultiWallet;
  migratedTransactions?: MultiWalletTransaction[];
  error?: string;
  details?: {
    originalBalance: { gold: number; usd: number; toman: number };
    newBalance: { usd: number; toman: number; totalGold: number };
    transactionCount: number;
  };
}

export interface MigrationStatus {
  totalUsers: number;
  migratedUsers: number;
  pendingUsers: number;
  failedUsers: number;
  isComplete: boolean;
}

export class WalletMigrationService {
  private static readonly MIGRATION_LOG_KEY = 'wallet_migration_log';
  private static readonly FEATURE_FLAG_KEY = 'multi_wallet_enabled_users';
  
  // ===== MIGRATION UTILITIES =====
  
  /**
   * Migrate a single user's wallet from old format to multi-wallet format
   */
  static async migrateUserWallet(userId: string): Promise<MigrationResult> {
    try {
      // Check if already migrated
      if (!this.needsMigration(userId)) {
        const existingWallet = MultiWalletService.getMultiWallet(userId);
        return {
          success: true,
          userId,
          migratedWallet: existingWallet,
          details: {
            originalBalance: { gold: 0, usd: 0, toman: 0 },
            newBalance: {
              usd: existingWallet.staticWallets.usd.balance,
              toman: existingWallet.staticWallets.toman.balance,
              totalGold: MultiWalletService.getTotalBalance(userId, 'gold')
            },
            transactionCount: 0
          }
        };
      }
      
      // Get old wallet data
      const oldWallet = WalletService.getWallet(userId);
      const oldTransactions = WalletService.getTransactions(userId);
      
      // Create multi-wallet structure
      const multiWallet: MultiWallet = {
        userId,
        staticWallets: {
          usd: { balance: oldWallet.balances.usd || 0, currency: 'usd' },
          toman: { balance: oldWallet.balances.toman || 0, currency: 'toman' }
        },
        goldWallets: {},
        updatedAt: new Date()
      };
      
      // Handle existing gold balance
      if (oldWallet.balances.gold && oldWallet.balances.gold > 0) {
        // Create default gold wallet for existing gold
        const defaultGoldWallet = {
          realmId: 'default-gold',
          realmName: 'General Gold',
          gameName: 'Multi-Game',
          suspendedGold: 0,
          withdrawableGold: oldWallet.balances.gold,
          totalGold: oldWallet.balances.gold,
          suspendedDeposits: []
        };
        
        multiWallet.goldWallets['default-gold'] = defaultGoldWallet;
        
        // Ensure default realm exists in game definitions
        this.ensureDefaultGoldRealm();
      }
      
      // Save the new multi-wallet
      const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
      StorageService.setItem(walletKey, multiWallet);
      
      // Migrate transactions
      const migratedTransactions = await this.migrateUserTransactions(userId, oldTransactions);
      
      // Log successful migration
      this.logMigration(userId, true, {
        originalBalance: oldWallet.balances,
        newBalance: {
          usd: multiWallet.staticWallets.usd.balance,
          toman: multiWallet.staticWallets.toman.balance,
          totalGold: MultiWalletService.getTotalBalance(userId, 'gold')
        },
        transactionCount: migratedTransactions.length
      });
      
      return {
        success: true,
        userId,
        migratedWallet: multiWallet,
        migratedTransactions,
        details: {
          originalBalance: oldWallet.balances,
          newBalance: {
            usd: multiWallet.staticWallets.usd.balance,
            toman: multiWallet.staticWallets.toman.balance,
            totalGold: MultiWalletService.getTotalBalance(userId, 'gold')
          },
          transactionCount: migratedTransactions.length
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown migration error';
      
      // Log failed migration
      this.logMigration(userId, false, undefined, errorMessage);
      
      return {
        success: false,
        userId,
        error: errorMessage
      };
    }
  }
  
  /**
   * Migrate user transactions from old format to multi-wallet format
   */
  private static async migrateUserTransactions(
    userId: string, 
    oldTransactions: Transaction[]
  ): Promise<MultiWalletTransaction[]> {
    const migratedTransactions: MultiWalletTransaction[] = [];
    
    for (const oldTransaction of oldTransactions) {
      try {
        const newTransaction = this.convertTransactionFormat(oldTransaction);
        migratedTransactions.push(newTransaction);
      } catch (error) {
        console.warn(`Failed to migrate transaction ${oldTransaction.id}:`, error);
        // Continue with other transactions
      }
    }
    
    // Save migrated transactions
    if (migratedTransactions.length > 0) {
      const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${userId}`;
      StorageService.setItem(userTransactionKey, migratedTransactions);
      
      // Also add to global transactions for admin access
      const allTransactions = StorageService.getItem<MultiWalletTransaction[]>(
        MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
      ) || [];
      allTransactions.push(...migratedTransactions);
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, allTransactions);
    }
    
    return migratedTransactions;
  }
  
  /**
   * Convert old transaction format to new multi-wallet transaction format
   */
  private static convertTransactionFormat(oldTransaction: Transaction): MultiWalletTransaction {
    // Determine wallet type and ID based on currency
    let walletType: 'static' | 'gold';
    let walletId: string;
    let goldType: 'suspended' | 'withdrawable' | undefined;
    
    if (oldTransaction.currency === 'gold') {
      walletType = 'gold';
      walletId = 'default-gold'; // All old gold goes to default gold wallet
      goldType = 'withdrawable'; // Old gold is considered withdrawable
    } else {
      walletType = 'static';
      walletId = oldTransaction.currency; // 'usd' or 'toman'
    }
    
    // Map old transaction types to new ones
    let mappedType: MultiWalletTransaction['type'];
    switch (oldTransaction.type) {
      case 'refund':
        mappedType = 'deposit'; // Treat refunds as deposits in the new system
        break;
      case 'deposit':
      case 'withdrawal':
      case 'conversion':
      case 'purchase':
      case 'earning':
      case 'admin_deposit':
        mappedType = oldTransaction.type;
        break;
      default:
        mappedType = 'deposit'; // Default fallback
    }

    const newTransaction: MultiWalletTransaction = {
      id: oldTransaction.id,
      userId: oldTransaction.walletId, // walletId in old format was actually userId
      walletType,
      walletId,
      type: mappedType,
      amount: oldTransaction.amount,
      currency: oldTransaction.currency as 'usd' | 'toman' | 'gold',
      goldType,
      status: oldTransaction.status,
      paymentMethod: oldTransaction.paymentMethod,
      approvedBy: oldTransaction.approvedBy,
      metadata: {
        migratedFromOldFormat: true,
        originalTransactionId: oldTransaction.id,
        originalType: oldTransaction.type, // Keep original type for reference
        migrationDate: new Date().toISOString()
      },
      createdAt: new Date(oldTransaction.createdAt)
    };
    
    return newTransaction;
  }
  
  /**
   * Ensure default gold realm exists for migration
   */
  private static ensureDefaultGoldRealm(): void {
    const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
    
    // Check if default realm already exists
    const defaultRealmExists = realms.some(realm => realm.id === 'default-gold');
    
    if (!defaultRealmExists) {
      const defaultRealm: GameRealm = {
        id: 'default-gold',
        gameId: 'multi-game',
        gameName: 'Multi-Game',
        realmName: 'General Gold',
        displayName: 'General Gold',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system'
      };
      
      realms.push(defaultRealm);
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS, realms);
    }
  }
  
  // ===== MIGRATION STATUS AND LOGGING =====
  
  /**
   * Check if a user needs migration
   */
  static needsMigration(userId: string): boolean {
    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
    return !StorageService.hasItem(walletKey);
  }
  
  /**
   * Get list of all users who need migration
   */
  static getUsersNeedingMigration(): string[] {
    const usersNeedingMigration: string[] = [];
    
    // Check old wallet format (all wallets in one object)
    const oldWallets = StorageService.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET) || {};
    
    for (const userId of Object.keys(oldWallets)) {
      if (this.needsMigration(userId)) {
        usersNeedingMigration.push(userId);
      }
    }
    
    // Check individual wallet keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEYS.WALLET}-`)) {
        const userId = key.replace(`${STORAGE_KEYS.WALLET}-`, '');
        if (this.needsMigration(userId) && !usersNeedingMigration.includes(userId)) {
          usersNeedingMigration.push(userId);
        }
      }
    }
    
    return usersNeedingMigration;
  }
  
  /**
   * Get migration status for all users
   */
  static getMigrationStatus(): MigrationStatus {
    const usersNeedingMigration = this.getUsersNeedingMigration();
    const migrationLog = this.getMigrationLog();
    
    const totalUsers = usersNeedingMigration.length + migrationLog.length;
    const migratedUsers = migrationLog.filter(log => log.success).length;
    const failedUsers = migrationLog.filter(log => !log.success).length;
    const pendingUsers = usersNeedingMigration.length;
    
    return {
      totalUsers,
      migratedUsers,
      pendingUsers,
      failedUsers,
      isComplete: pendingUsers === 0
    };
  }
  
  /**
   * Log migration result
   */
  private static logMigration(
    userId: string, 
    success: boolean, 
    details?: any, 
    error?: string
  ): void {
    const migrationLog = this.getMigrationLog();
    
    const logEntry = {
      userId,
      success,
      timestamp: new Date(),
      details,
      error
    };
    
    migrationLog.push(logEntry);
    StorageService.setItem(this.MIGRATION_LOG_KEY, migrationLog);
  }
  
  /**
   * Get migration log
   */
  static getMigrationLog(): Array<{
    userId: string;
    success: boolean;
    timestamp: Date;
    details?: any;
    error?: string;
  }> {
    const log = StorageService.getItem<any[]>(this.MIGRATION_LOG_KEY) || [];
    return log.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  }
  
  /**
   * Clear migration log
   */
  static clearMigrationLog(): void {
    StorageService.removeItem(this.MIGRATION_LOG_KEY);
  }
  
  // ===== GRADUAL ROLLOUT MECHANISM =====
  
  /**
   * Enable multi-wallet system for a specific user
   */
  static enableMultiWalletForUser(userId: string): void {
    const enabledUsers = this.getEnabledUsers();
    if (!enabledUsers.includes(userId)) {
      enabledUsers.push(userId);
      StorageService.setItem(this.FEATURE_FLAG_KEY, enabledUsers);
    }
  }
  
  /**
   * Disable multi-wallet system for a specific user
   */
  static disableMultiWalletForUser(userId: string): void {
    const enabledUsers = this.getEnabledUsers();
    const updatedUsers = enabledUsers.filter(id => id !== userId);
    StorageService.setItem(this.FEATURE_FLAG_KEY, updatedUsers);
  }
  
  /**
   * Check if multi-wallet is enabled for a user
   */
  static isMultiWalletEnabledForUser(userId: string): boolean {
    const enabledUsers = this.getEnabledUsers();
    return enabledUsers.includes(userId);
  }
  
  /**
   * Get list of users with multi-wallet enabled
   */
  static getEnabledUsers(): string[] {
    return StorageService.getItem<string[]>(this.FEATURE_FLAG_KEY) || [];
  }
  
  /**
   * Enable multi-wallet for all users (full rollout)
   */
  static enableMultiWalletForAllUsers(): void {
    const allUserIds = this.getAllUserIds();
    StorageService.setItem(this.FEATURE_FLAG_KEY, allUserIds);
  }
  
  /**
   * Disable multi-wallet for all users (rollback)
   */
  static disableMultiWalletForAllUsers(): void {
    StorageService.setItem(this.FEATURE_FLAG_KEY, []);
  }
  
  /**
   * Get all user IDs from various storage locations
   */
  private static getAllUserIds(): string[] {
    const userIds = new Set<string>();
    
    // From old wallet format
    const oldWallets = StorageService.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET) || {};
    Object.keys(oldWallets).forEach(userId => userIds.add(userId));
    
    // From individual wallet keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEYS.WALLET}-`)) {
        const userId = key.replace(`${STORAGE_KEYS.WALLET}-`, '');
        userIds.add(userId);
      }
    }
    
    // From multi-wallet keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-`)) {
        const userId = key.replace(`${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-`, '');
        userIds.add(userId);
      }
    }
    
    return Array.from(userIds);
  }
  
  // ===== BATCH MIGRATION =====
  
  /**
   * Migrate all users in batches
   */
  static async migrateAllUsers(batchSize: number = 10): Promise<{
    totalProcessed: number;
    successful: number;
    failed: number;
    results: MigrationResult[];
  }> {
    const usersToMigrate = this.getUsersNeedingMigration();
    const results: MigrationResult[] = [];
    let successful = 0;
    let failed = 0;
    
    // Process in batches to avoid blocking the UI
    for (let i = 0; i < usersToMigrate.length; i += batchSize) {
      const batch = usersToMigrate.slice(i, i + batchSize);
      
      for (const userId of batch) {
        const result = await this.migrateUserWallet(userId);
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }
      
      // Small delay between batches to prevent blocking
      if (i + batchSize < usersToMigrate.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return {
      totalProcessed: usersToMigrate.length,
      successful,
      failed,
      results
    };
  }
  
  // ===== BACKWARD COMPATIBILITY =====
  
  /**
   * Get wallet with automatic migration and feature flag check
   */
  static getWalletWithCompatibility(userId: string): Wallet | MultiWallet {
    // Check if multi-wallet is enabled for this user
    if (this.isMultiWalletEnabledForUser(userId)) {
      // Use multi-wallet system with automatic migration
      return MultiWalletService.getWalletWithMigration(userId);
    } else {
      // Use old wallet system
      return WalletService.getWallet(userId);
    }
  }
  
  /**
   * Get transactions with backward compatibility
   */
  static getTransactionsWithCompatibility(userId: string): Transaction[] | MultiWalletTransaction[] {
    if (this.isMultiWalletEnabledForUser(userId)) {
      return MultiWalletService.getMultiWalletTransactions(userId);
    } else {
      return WalletService.getTransactions(userId);
    }
  }
  
  // ===== VALIDATION AND CLEANUP =====
  
  /**
   * Validate migration integrity for a user
   */
  static validateMigration(userId: string): {
    isValid: boolean;
    issues: string[];
    details: {
      oldWalletExists: boolean;
      newWalletExists: boolean;
      balanceMatch: boolean;
      transactionCountMatch: boolean;
    };
  } {
    const issues: string[] = [];
    
    // Check if old wallet exists
    const oldWallet = WalletService.getWallet(userId);
    const oldWalletExists = oldWallet.balances.gold > 0 || oldWallet.balances.usd > 0 || oldWallet.balances.toman > 0;
    
    // Check if new wallet exists
    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
    const newWalletExists = StorageService.hasItem(walletKey);
    
    if (!newWalletExists && oldWalletExists) {
      issues.push('Migration incomplete: Multi-wallet not found but old wallet has balance');
    }
    
    let balanceMatch = true;
    let transactionCountMatch = true;
    
    if (newWalletExists) {
      const newWallet = MultiWalletService.getMultiWallet(userId);
      
      // Check balance consistency
      const oldUsd = oldWallet.balances.usd || 0;
      const oldToman = oldWallet.balances.toman || 0;
      const oldGold = oldWallet.balances.gold || 0;
      
      const newUsd = newWallet.staticWallets.usd.balance;
      const newToman = newWallet.staticWallets.toman.balance;
      const newGold = MultiWalletService.getTotalBalance(userId, 'gold');
      
      if (Math.abs(oldUsd - newUsd) > 0.01) {
        issues.push(`USD balance mismatch: old=${oldUsd}, new=${newUsd}`);
        balanceMatch = false;
      }
      
      if (Math.abs(oldToman - newToman) > 0.01) {
        issues.push(`Toman balance mismatch: old=${oldToman}, new=${newToman}`);
        balanceMatch = false;
      }
      
      if (Math.abs(oldGold - newGold) > 0.01) {
        issues.push(`Gold balance mismatch: old=${oldGold}, new=${newGold}`);
        balanceMatch = false;
      }
      
      // Check transaction count
      const oldTransactions = WalletService.getTransactions(userId);
      const newTransactions = MultiWalletService.getMultiWalletTransactions(userId);
      
      if (oldTransactions.length !== newTransactions.length) {
        issues.push(`Transaction count mismatch: old=${oldTransactions.length}, new=${newTransactions.length}`);
        transactionCountMatch = false;
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      details: {
        oldWalletExists,
        newWalletExists,
        balanceMatch,
        transactionCountMatch
      }
    };
  }
  
  /**
   * Clean up old wallet data after successful migration
   */
  static cleanupOldWalletData(userId: string): void {
    // Only cleanup if migration is validated and multi-wallet is enabled
    if (!this.isMultiWalletEnabledForUser(userId)) {
      throw new Error('Cannot cleanup: Multi-wallet not enabled for user');
    }
    
    const validation = this.validateMigration(userId);
    if (!validation.isValid) {
      throw new Error(`Cannot cleanup: Migration validation failed: ${validation.issues.join(', ')}`);
    }
    
    // Remove old wallet data
    const oldWalletKey = `${STORAGE_KEYS.WALLET}-${userId}`;
    StorageService.removeItem(oldWalletKey);
    
    // Remove old transaction data
    const oldTransactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${userId}`;
    StorageService.removeItem(oldTransactionKey);
    
    // Remove from old format collections
    const oldWallets = StorageService.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET) || {};
    if (oldWallets[userId]) {
      delete oldWallets[userId];
      StorageService.setItem(STORAGE_KEYS.WALLET, oldWallets);
    }
  }
}