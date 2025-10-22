// Multi-Wallet System Initialization Service

import { GameManagementService } from './gameManagementService';
import { MULTI_WALLET_STORAGE_KEYS, type ConversionFeeConfig } from '../types';
import { StorageService } from './storage';
import { ErrorService } from './errorService';
import { WalletMigrationService } from './walletMigrationService';

export class MultiWalletInitService {
  private static initialized = false;

  /**
   * Initialize the entire multi-wallet system
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Initializing Multi-Wallet System...');

      // Initialize game management service
      GameManagementService.initialize();

      // Initialize conversion fee configuration
      this.initializeConversionFeeConfig();

      // Initialize empty multi-wallet storage if needed
      this.initializeMultiWalletStorage();

      // Initialize suspended deposits storage
      this.initializeSuspendedDepositsStorage();

      // Initialize multi-wallet transactions storage
      this.initializeMultiWalletTransactionsStorage();

      // Initialize migration system
      this.initializeMigrationSystem();

      this.initialized = true;
      console.log('Multi-Wallet System initialized successfully');

      // Log initialization statistics
      this.logInitializationStats();

    } catch (error) {
      console.error('Failed to initialize Multi-Wallet System:', error);
      ErrorService.handleError(error, 'MultiWalletInitService.initialize');
    }
  }

  /**
   * Initialize conversion fee configuration with default values
   */
  private static initializeConversionFeeConfig(): void {
    try {
      const existingConfig = StorageService.getItem<ConversionFeeConfig>(
        MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG
      );

      if (!existingConfig) {
        const defaultConfig: ConversionFeeConfig = {
          id: 'conversion_fee_config_default',
          suspendedGoldToUsd: 5.0, // 5% fee for USD conversion
          suspendedGoldToToman: 3.0, // 3% fee for Toman conversion
          isActive: true,
          updatedBy: 'system',
          updatedAt: new Date()
        };

        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG, defaultConfig);
        console.log('Initialized default conversion fee configuration');
      }
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.initializeConversionFeeConfig');
    }
  }

  /**
   * Initialize multi-wallet storage structure
   */
  private static initializeMultiWalletStorage(): void {
    try {
      const existingWallets = StorageService.getItem<Record<string, any>>(
        MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS
      );

      if (!existingWallets) {
        // Initialize empty multi-wallet storage
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS, {});
        console.log('Initialized empty multi-wallet storage');
      }
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.initializeMultiWalletStorage');
    }
  }

  /**
   * Initialize suspended deposits storage
   */
  private static initializeSuspendedDepositsStorage(): void {
    try {
      const existingDeposits = StorageService.getItem<any[]>(
        MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS
      );

      if (!existingDeposits) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS, []);
        console.log('Initialized empty suspended deposits storage');
      }
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.initializeSuspendedDepositsStorage');
    }
  }

  /**
   * Initialize multi-wallet transactions storage
   */
  private static initializeMultiWalletTransactionsStorage(): void {
    try {
      const existingTransactions = StorageService.getItem<any[]>(
        MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
      );

      if (!existingTransactions) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, []);
        console.log('Initialized empty multi-wallet transactions storage');
      }
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.initializeMultiWalletTransactionsStorage');
    }
  }

  /**
   * Initialize migration system
   */
  private static initializeMigrationSystem(): void {
    try {
      // Check migration status
      const migrationStatus = WalletMigrationService.getMigrationStatus();
      
      console.log('Migration Status:', {
        totalUsers: migrationStatus.totalUsers,
        migratedUsers: migrationStatus.migratedUsers,
        pendingUsers: migrationStatus.pendingUsers,
        failedUsers: migrationStatus.failedUsers,
        isComplete: migrationStatus.isComplete
      });

      // If there are users needing migration, log a warning
      if (migrationStatus.pendingUsers > 0) {
        console.warn(`${migrationStatus.pendingUsers} users need wallet migration. Use WalletMigrationService to migrate them.`);
      }

      // Process suspended gold expiry on initialization
      this.processExpiredSuspendedGold();

    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.initializeMigrationSystem');
    }
  }

  /**
   * Process expired suspended gold
   */
  private static async processExpiredSuspendedGold(): Promise<void> {
    try {
      const { MultiWalletService } = await import('./multiWalletService');
      await MultiWalletService.processSuspendedGoldExpiry();
      console.log('Processed expired suspended gold deposits');
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.processExpiredSuspendedGold');
    }
  }

  /**
   * Log initialization statistics
   */
  private static logInitializationStats(): void {
    try {
      const stats = GameManagementService.getStatistics();
      const migrationStatus = WalletMigrationService.getMigrationStatus();
      
      console.log('Multi-Wallet System Statistics:', {
        games: {
          total: stats.totalGames,
          active: stats.activeGames
        },
        realms: {
          total: stats.totalRealms,
          active: stats.activeRealms
        },
        realmsPerGame: stats.realmsPerGame,
        migration: {
          totalUsers: migrationStatus.totalUsers,
          migratedUsers: migrationStatus.migratedUsers,
          pendingUsers: migrationStatus.pendingUsers,
          isComplete: migrationStatus.isComplete
        }
      });
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.logInitializationStats');
    }
  }

  /**
   * Reset all multi-wallet system data (for testing/development)
   */
  static resetAllData(): void {
    try {
      console.log('Resetting Multi-Wallet System data...');

      // Clear all multi-wallet storage
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS);
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS);
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS);
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS);
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG);
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS);

      // Reset initialization flag
      this.initialized = false;

      // Clear GameManagementService data
      GameManagementService.clearAllData();

      console.log('Multi-Wallet System data reset complete');
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.resetAllData');
    }
  }

  /**
   * Get system health status
   */
  static getSystemHealth(): {
    initialized: boolean;
    gameManagementReady: boolean;
    storageReady: boolean;
    configurationReady: boolean;
    migrationReady: boolean;
    errors: string[];
    migrationStatus?: {
      totalUsers: number;
      migratedUsers: number;
      pendingUsers: number;
      failedUsers: number;
      isComplete: boolean;
    };
  } {
    const errors: string[] = [];
    let gameManagementReady = false;
    let storageReady = false;
    let configurationReady = false;
    let migrationReady = false;
    let migrationStatus;

    try {
      // Check game management
      const stats = GameManagementService.getStatistics();
      gameManagementReady = stats.totalGames > 0;
      if (!gameManagementReady) {
        errors.push('No games configured');
      }
    } catch (error) {
      errors.push('Game management service error');
    }

    try {
      // Check storage
      const wallets = StorageService.getItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS);
      const transactions = StorageService.getItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS);
      storageReady = wallets !== null && transactions !== null;
      if (!storageReady) {
        errors.push('Storage not properly initialized');
      }
    } catch (error) {
      errors.push('Storage access error');
    }

    try {
      // Check configuration
      const config = StorageService.getItem<ConversionFeeConfig>(
        MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG
      );
      configurationReady = config !== null && config.isActive;
      if (!configurationReady) {
        errors.push('Configuration not ready');
      }
    } catch (error) {
      errors.push('Configuration access error');
    }

    try {
      // Check migration status
      migrationStatus = WalletMigrationService.getMigrationStatus();
      migrationReady = migrationStatus.isComplete;
      if (!migrationReady && migrationStatus.pendingUsers > 0) {
        errors.push(`${migrationStatus.pendingUsers} users need wallet migration`);
      }
      if (migrationStatus.failedUsers > 0) {
        errors.push(`${migrationStatus.failedUsers} users have failed migrations`);
      }
    } catch (error) {
      errors.push('Migration status check error');
    }

    return {
      initialized: this.initialized,
      gameManagementReady,
      storageReady,
      configurationReady,
      migrationReady,
      errors,
      migrationStatus
    };
  }

  /**
   * Perform system maintenance tasks
   */
  static async performMaintenance(): Promise<void> {
    try {
      console.log('Performing Multi-Wallet System maintenance...');

      // Clean up old suspended deposits that have expired
      await this.cleanupExpiredSuspendedDeposits();

      // Clean up old transactions (keep last 1000)
      await this.cleanupOldTransactions();

      console.log('Multi-Wallet System maintenance completed');
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.performMaintenance');
    }
  }

  /**
   * Clean up expired suspended deposits
   */
  private static async cleanupExpiredSuspendedDeposits(): Promise<void> {
    try {
      const deposits = StorageService.getItem<any[]>(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS) || [];
      const now = new Date();
      
      // Update status of expired deposits
      let updatedCount = 0;
      const updatedDeposits = deposits.map(deposit => {
        if (deposit.status === 'suspended' && new Date(deposit.withdrawableAt) <= now) {
          updatedCount++;
          return { ...deposit, status: 'withdrawable' };
        }
        return deposit;
      });

      if (updatedCount > 0) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS, updatedDeposits);
        console.log(`Updated ${updatedCount} expired suspended deposits to withdrawable`);
      }
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.cleanupExpiredSuspendedDeposits');
    }
  }

  /**
   * Clean up old transactions
   */
  private static async cleanupOldTransactions(): Promise<void> {
    try {
      const transactions = StorageService.getItem<any[]>(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS) || [];
      
      if (transactions.length > 1000) {
        // Sort by creation date (newest first) and keep only the last 1000
        const sortedTransactions = transactions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const trimmedTransactions = sortedTransactions.slice(0, 1000);
        
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, trimmedTransactions);
        console.log(`Cleaned up ${transactions.length - 1000} old transactions`);
      }
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.cleanupOldTransactions');
    }
  }

  /**
   * Export multi-wallet system data for backup
   */
  static exportSystemData(): string {
    try {
      const data = {
        games: GameManagementService.getAllGames(),
        realms: GameManagementService.getAllRealms(),
        wallets: StorageService.getItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS),
        transactions: StorageService.getItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS),
        conversionFeeConfig: StorageService.getItem(MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG),
        suspendedDeposits: StorageService.getItem(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.exportSystemData');
      return '{}';
    }
  }

  /**
   * Import multi-wallet system data from backup
   */
  static importSystemData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (!data.version || !data.exportedAt) {
        throw new Error('Invalid backup data format');
      }

      // Import data
      if (data.games) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS, data.games);
      }
      if (data.realms) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS, data.realms);
      }
      if (data.wallets) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS, data.wallets);
      }
      if (data.transactions) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, data.transactions);
      }
      if (data.conversionFeeConfig) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG, data.conversionFeeConfig);
      }
      if (data.suspendedDeposits) {
        StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS, data.suspendedDeposits);
      }

      // Reset initialization to force re-initialization
      this.initialized = false;
      this.initialize();

      console.log('Multi-Wallet System data imported successfully');
    } catch (error) {
      ErrorService.handleError(error, 'MultiWalletInitService.importSystemData');
      throw error;
    }
  }

  // ===== MIGRATION UTILITIES =====

  /**
   * Migrate a specific user's wallet
   */
  static async migrateUserWallet(userId: string): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      const result = await WalletMigrationService.migrateUserWallet(userId);
      return {
        success: result.success,
        error: result.error,
        details: result.details
      };
    } catch (error) {
      const appError = ErrorService.handleError(error, 'MultiWalletInitService.migrateUserWallet');
      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Migrate all users in batches
   */
  static async migrateAllUsers(batchSize: number = 10): Promise<{
    totalProcessed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const result = await WalletMigrationService.migrateAllUsers(batchSize);
      const errors = result.results
        .filter(r => !r.success)
        .map(r => r.error || 'Unknown error');

      return {
        totalProcessed: result.totalProcessed,
        successful: result.successful,
        failed: result.failed,
        errors
      };
    } catch (error) {
      const appError = ErrorService.handleError(error, 'MultiWalletInitService.migrateAllUsers');
      return {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        errors: [appError.message]
      };
    }
  }

  /**
   * Enable multi-wallet for a user with automatic migration
   */
  static async enableMultiWalletForUser(userId: string): Promise<{
    success: boolean;
    migrated: boolean;
    error?: string;
  }> {
    try {
      // Check if migration is needed
      const needsMigration = WalletMigrationService.needsMigration(userId);
      let migrated = false;

      if (needsMigration) {
        const migrationResult = await WalletMigrationService.migrateUserWallet(userId);
        if (!migrationResult.success) {
          return {
            success: false,
            migrated: false,
            error: migrationResult.error
          };
        }
        migrated = true;
      }

      // Enable multi-wallet for the user
      WalletMigrationService.enableMultiWalletForUser(userId);

      return {
        success: true,
        migrated
      };
    } catch (error) {
      const appError = ErrorService.handleError(error, 'MultiWalletInitService.enableMultiWalletForUser');
      return {
        success: false,
        migrated: false,
        error: appError.message
      };
    }
  }

  /**
   * Get migration status for the system
   */
  static getMigrationStatus() {
    return WalletMigrationService.getMigrationStatus();
  }

  /**
   * Get migration log
   */
  static getMigrationLog() {
    return WalletMigrationService.getMigrationLog();
  }

  /**
   * Validate migration for a user
   */
  static validateUserMigration(userId: string) {
    return WalletMigrationService.validateMigration(userId);
  }

  /**
   * Clean up old wallet data after successful migration
   */
  static cleanupOldWalletData(userId: string): {
    success: boolean;
    error?: string;
  } {
    try {
      WalletMigrationService.cleanupOldWalletData(userId);
      return { success: true };
    } catch (error) {
      const appError = ErrorService.handleError(error, 'MultiWalletInitService.cleanupOldWalletData');
      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Get users needing migration
   */
  static getUsersNeedingMigration(): string[] {
    return WalletMigrationService.getUsersNeedingMigration();
  }

  /**
   * Check if multi-wallet is enabled for a user
   */
  static isMultiWalletEnabledForUser(userId: string): boolean {
    return WalletMigrationService.isMultiWalletEnabledForUser(userId);
  }

  /**
   * Enable multi-wallet for all users (full rollout)
   */
  static async enableMultiWalletForAllUsers(): Promise<{
    success: boolean;
    migrationResults?: {
      totalProcessed: number;
      successful: number;
      failed: number;
    };
    error?: string;
  }> {
    try {
      // First migrate all users
      const migrationResults = await this.migrateAllUsers();
      
      if (migrationResults.failed > 0) {
        console.warn(`${migrationResults.failed} users failed migration, but continuing with rollout`);
      }

      // Enable for all users
      WalletMigrationService.enableMultiWalletForAllUsers();

      return {
        success: true,
        migrationResults: {
          totalProcessed: migrationResults.totalProcessed,
          successful: migrationResults.successful,
          failed: migrationResults.failed
        }
      };
    } catch (error) {
      const appError = ErrorService.handleError(error, 'MultiWalletInitService.enableMultiWalletForAllUsers');
      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Disable multi-wallet for all users (rollback)
   */
  static disableMultiWalletForAllUsers(): void {
    WalletMigrationService.disableMultiWalletForAllUsers();
  }
}