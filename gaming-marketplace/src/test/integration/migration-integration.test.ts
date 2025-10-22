// Integration test for wallet migration system

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiWalletInitService } from '../../services/multiWalletInitService';
import { WalletMigrationService } from '../../services/walletMigrationService';
import { WalletService } from '../../services/walletService';
import { StorageService } from '../../services/storage';
import type { Wallet } from '../../types';

// Mock the services
vi.mock('../../services/storage');
vi.mock('../../services/walletService');
vi.mock('../../services/gameManagementService');
vi.mock('../../services/errorService');

describe('Migration Integration', () => {
  const mockUserId = 'integration-test-user';
  
  const mockOldWallet: Wallet = {
    userId: mockUserId,
    balances: {
      gold: 500,
      usd: 25.50,
      toman: 1050000
    },
    updatedAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Full Migration Flow', () => {
    it('should complete full migration flow through init service', async () => {
      // Setup: User needs migration
      vi.mocked(StorageService.hasItem).mockReturnValue(false); // needs migration
      vi.mocked(WalletService.getWallet).mockReturnValue(mockOldWallet);
      vi.mocked(WalletService.getTransactions).mockReturnValue([]);
      vi.mocked(StorageService.getItem).mockReturnValue([]); // empty arrays for various storage
      vi.mocked(StorageService.setItem).mockImplementation(() => {});

      // Mock game management service statistics
      const mockGameManagementService = await import('../../services/gameManagementService');
      vi.mocked(mockGameManagementService.GameManagementService.getStatistics).mockReturnValue({
        totalGames: 2,
        activeGames: 2,
        totalRealms: 5,
        activeRealms: 5,
        realmsPerGame: { 'game1': 3, 'game2': 2 }
      });

      // Step 1: Initialize the system
      await MultiWalletInitService.initialize();

      // Step 2: Mock migration status to show pending users
      vi.spyOn(WalletMigrationService, 'getUsersNeedingMigration').mockReturnValue([mockUserId]);
      vi.spyOn(WalletMigrationService, 'getMigrationLog').mockReturnValue([]);
      
      const initialStatus = MultiWalletInitService.getMigrationStatus();
      expect(initialStatus.pendingUsers).toBeGreaterThan(0);

      // Step 3: Mock successful migration
      vi.spyOn(WalletMigrationService, 'migrateUserWallet').mockResolvedValue({
        success: true,
        userId: mockUserId,
        migratedWallet: {
          userId: mockUserId,
          staticWallets: {
            usd: { balance: 25.50, currency: 'usd' },
            toman: { balance: 1050000, currency: 'toman' }
          },
          goldWallets: {
            'default-gold': {
              realmId: 'default-gold',
              realmName: 'General Gold',
              gameName: 'Multi-Game',
              suspendedGold: 0,
              withdrawableGold: 500,
              totalGold: 500,
              suspendedDeposits: []
            }
          },
          updatedAt: new Date()
        }
      });
      
      const migrationResult = await MultiWalletInitService.migrateUserWallet(mockUserId);
      expect(migrationResult.success).toBe(true);

      // Step 4: Mock enabling multi-wallet
      vi.spyOn(WalletMigrationService, 'enableMultiWalletForUser').mockImplementation(() => {});
      vi.spyOn(WalletMigrationService, 'isMultiWalletEnabledForUser').mockReturnValue(true);
      
      const enableResult = await MultiWalletInitService.enableMultiWalletForUser(mockUserId);
      expect(enableResult.success).toBe(true);

      // Step 5: Verify the user is now using multi-wallet
      expect(WalletMigrationService.isMultiWalletEnabledForUser(mockUserId)).toBe(true);
    });

    it('should handle batch migration through init service', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      
      // Setup multiple users needing migration
      vi.spyOn(WalletMigrationService, 'getUsersNeedingMigration').mockReturnValue(userIds);
      vi.spyOn(WalletMigrationService, 'migrateUserWallet')
        .mockResolvedValueOnce({ success: true, userId: 'user1' })
        .mockResolvedValueOnce({ success: true, userId: 'user2' })
        .mockResolvedValueOnce({ success: false, userId: 'user3', error: 'Test error' });

      const result = await MultiWalletInitService.migrateAllUsers(2);

      expect(result.totalProcessed).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toContain('Test error');
    });

    it('should handle full rollout with migration', async () => {
      const userIds = ['user1', 'user2'];
      
      // Mock successful migrations
      vi.spyOn(MultiWalletInitService, 'migrateAllUsers').mockResolvedValue({
        totalProcessed: 2,
        successful: 2,
        failed: 0,
        errors: []
      });

      vi.mocked(StorageService.setItem).mockImplementation(() => {});

      const result = await MultiWalletInitService.enableMultiWalletForAllUsers();

      expect(result.success).toBe(true);
      expect(result.migrationResults?.successful).toBe(2);
      expect(result.migrationResults?.failed).toBe(0);
    });
  });

  describe('System Health Integration', () => {
    it('should include migration status in system health', () => {
      // Mock migration status
      vi.spyOn(WalletMigrationService, 'getMigrationStatus').mockReturnValue({
        totalUsers: 5,
        migratedUsers: 3,
        pendingUsers: 2,
        failedUsers: 0,
        isComplete: false
      });

      // Mock other health checks
      vi.mocked(StorageService.getItem).mockReturnValue({});
      
      const mockGameManagementService = vi.fn().mockReturnValue({
        totalGames: 2,
        activeGames: 2,
        totalRealms: 5,
        activeRealms: 5,
        realmsPerGame: {}
      });

      const health = MultiWalletInitService.getSystemHealth();

      expect(health.migrationReady).toBe(false);
      expect(health.migrationStatus?.pendingUsers).toBe(2);
      expect(health.errors).toContain('2 users need wallet migration');
    });

    it('should show migration complete when all users migrated', () => {
      // Mock complete migration
      vi.spyOn(WalletMigrationService, 'getMigrationStatus').mockReturnValue({
        totalUsers: 3,
        migratedUsers: 3,
        pendingUsers: 0,
        failedUsers: 0,
        isComplete: true
      });

      vi.mocked(StorageService.getItem).mockReturnValue({});

      const health = MultiWalletInitService.getSystemHealth();

      expect(health.migrationReady).toBe(true);
      expect(health.migrationStatus?.isComplete).toBe(true);
    });
  });

  describe('Backward Compatibility Integration', () => {
    it('should use old wallet system when multi-wallet disabled', () => {
      vi.spyOn(WalletMigrationService, 'isMultiWalletEnabledForUser').mockReturnValue(false);
      vi.mocked(WalletService.getWallet).mockReturnValue(mockOldWallet);

      const wallet = WalletMigrationService.getWalletWithCompatibility(mockUserId);

      expect(wallet).toEqual(mockOldWallet);
      expect(WalletService.getWallet).toHaveBeenCalledWith(mockUserId);
    });

    it('should use multi-wallet system when enabled', () => {
      const mockMultiWallet = {
        userId: mockUserId,
        staticWallets: {
          usd: { balance: 25.50, currency: 'usd' as const },
          toman: { balance: 1050000, currency: 'toman' as const }
        },
        goldWallets: {
          'default-gold': {
            realmId: 'default-gold',
            realmName: 'General Gold',
            gameName: 'Multi-Game',
            suspendedGold: 0,
            withdrawableGold: 500,
            totalGold: 500,
            suspendedDeposits: []
          }
        },
        updatedAt: new Date()
      };

      vi.spyOn(WalletMigrationService, 'isMultiWalletEnabledForUser').mockReturnValue(true);
      
      // Mock the MultiWalletService
      const mockMultiWalletService = vi.fn();
      vi.doMock('../../services/multiWalletService', () => ({
        MultiWalletService: {
          getWalletWithMigration: mockMultiWalletService.mockReturnValue(mockMultiWallet)
        }
      }));

      const wallet = WalletMigrationService.getWalletWithCompatibility(mockUserId);

      expect(wallet).toEqual(mockMultiWallet);
    });
  });

  describe('Validation Integration', () => {
    it('should validate migration through init service', () => {
      const mockValidation = {
        isValid: true,
        issues: [],
        details: {
          oldWalletExists: true,
          newWalletExists: true,
          balanceMatch: true,
          transactionCountMatch: true
        }
      };

      vi.spyOn(WalletMigrationService, 'validateMigration').mockReturnValue(mockValidation);

      const result = MultiWalletInitService.validateUserMigration(mockUserId);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle cleanup through init service', () => {
      vi.spyOn(WalletMigrationService, 'cleanupOldWalletData').mockImplementation(() => {});

      const result = MultiWalletInitService.cleanupOldWalletData(mockUserId);

      expect(result.success).toBe(true);
      expect(WalletMigrationService.cleanupOldWalletData).toHaveBeenCalledWith(mockUserId);
    });
  });
});