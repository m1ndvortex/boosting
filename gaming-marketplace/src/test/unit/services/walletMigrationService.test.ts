// Tests for Wallet Migration Service

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletMigrationService } from '../../../services/walletMigrationService';
import { WalletService } from '../../../services/walletService';
import { MultiWalletService } from '../../../services/multiWalletService';
import { StorageService } from '../../../services/storage';
import type { Wallet, MultiWallet, Transaction } from '../../../types';

// Mock the services
vi.mock('../../../services/walletService');
vi.mock('../../../services/multiWalletService');
vi.mock('../../../services/storage');

describe('WalletMigrationService', () => {
  const mockUserId = 'test-user-123';
  
  const mockOldWallet: Wallet = {
    userId: mockUserId,
    balances: {
      gold: 1000,
      usd: 50.25,
      toman: 2100000
    },
    updatedAt: new Date('2024-01-01')
  };

  const mockOldTransactions: Transaction[] = [
    {
      id: 'txn-1',
      walletId: mockUserId,
      type: 'deposit',
      amount: 100,
      currency: 'usd',
      status: 'completed',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'txn-2',
      walletId: mockUserId,
      type: 'earning',
      amount: 500,
      currency: 'gold',
      status: 'completed',
      createdAt: new Date('2024-01-02')
    }
  ];

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
  });

  describe('needsMigration', () => {
    it('should return true when multi-wallet does not exist', () => {
      vi.mocked(StorageService.hasItem).mockReturnValue(false);
      
      const result = WalletMigrationService.needsMigration(mockUserId);
      
      expect(result).toBe(true);
      expect(StorageService.hasItem).toHaveBeenCalledWith(`multi_wallets-${mockUserId}`);
    });

    it('should return false when multi-wallet exists', () => {
      vi.mocked(StorageService.hasItem).mockReturnValue(true);
      
      const result = WalletMigrationService.needsMigration(mockUserId);
      
      expect(result).toBe(false);
    });
  });

  describe('migrateUserWallet', () => {
    it('should successfully migrate a user wallet with gold balance', async () => {
      // Setup mocks
      vi.mocked(StorageService.hasItem).mockReturnValue(false); // needs migration
      vi.mocked(WalletService.getWallet).mockReturnValue(mockOldWallet);
      vi.mocked(WalletService.getTransactions).mockReturnValue(mockOldTransactions);
      vi.mocked(StorageService.getItem).mockReturnValue([]); // empty realms
      vi.mocked(StorageService.setItem).mockImplementation(() => {});

      const result = await WalletMigrationService.migrateUserWallet(mockUserId);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockUserId);
      expect(result.migratedWallet).toBeDefined();
      expect(result.details).toBeDefined();
      
      // Check that the migrated wallet has correct structure
      const migratedWallet = result.migratedWallet!;
      expect(migratedWallet.userId).toBe(mockUserId);
      expect(migratedWallet.staticWallets.usd.balance).toBe(50.25);
      expect(migratedWallet.staticWallets.toman.balance).toBe(2100000);
      expect(migratedWallet.goldWallets['default-gold']).toBeDefined();
      expect(migratedWallet.goldWallets['default-gold'].withdrawableGold).toBe(1000);
      expect(migratedWallet.goldWallets['default-gold'].suspendedGold).toBe(0);
    });

    it('should migrate wallet without gold balance', async () => {
      const walletWithoutGold: Wallet = {
        ...mockOldWallet,
        balances: { gold: 0, usd: 100, toman: 0 }
      };

      vi.mocked(StorageService.hasItem).mockReturnValue(false);
      vi.mocked(WalletService.getWallet).mockReturnValue(walletWithoutGold);
      vi.mocked(WalletService.getTransactions).mockReturnValue([]);
      vi.mocked(StorageService.setItem).mockImplementation(() => {});

      const result = await WalletMigrationService.migrateUserWallet(mockUserId);

      expect(result.success).toBe(true);
      expect(result.migratedWallet!.goldWallets).toEqual({});
    });

    it('should return existing wallet if already migrated', async () => {
      const existingMultiWallet: MultiWallet = {
        userId: mockUserId,
        staticWallets: {
          usd: { balance: 100, currency: 'usd' },
          toman: { balance: 0, currency: 'toman' }
        },
        goldWallets: {},
        updatedAt: new Date()
      };

      vi.mocked(StorageService.hasItem).mockReturnValue(true); // already migrated
      vi.mocked(MultiWalletService.getMultiWallet).mockReturnValue(existingMultiWallet);

      const result = await WalletMigrationService.migrateUserWallet(mockUserId);

      expect(result.success).toBe(true);
      expect(result.migratedWallet).toEqual(existingMultiWallet);
    });

    it('should handle migration errors gracefully', async () => {
      vi.mocked(StorageService.hasItem).mockReturnValue(false);
      vi.mocked(WalletService.getWallet).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await WalletMigrationService.migrateUserWallet(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error');
    });
  });

  describe('getUsersNeedingMigration', () => {
    it('should find users from old wallet format', () => {
      const oldWallets = {
        'user1': mockOldWallet,
        'user2': mockOldWallet
      };

      vi.mocked(StorageService.getItem).mockReturnValue(oldWallets);
      vi.mocked(StorageService.hasItem).mockReturnValue(false); // needs migration

      // Mock localStorage.length and key
      Object.defineProperty(window.localStorage, 'length', { value: 0 });

      const result = WalletMigrationService.getUsersNeedingMigration();

      expect(result).toContain('user1');
      expect(result).toContain('user2');
    });

    it('should find users from individual wallet keys', () => {
      vi.mocked(StorageService.getItem).mockReturnValue({}); // no old format wallets
      vi.mocked(StorageService.hasItem).mockReturnValue(false); // needs migration

      // Mock localStorage with individual wallet keys
      Object.defineProperty(window.localStorage, 'length', { value: 2 });
      Object.defineProperty(window.localStorage, 'key', {
        value: vi.fn()
          .mockReturnValueOnce('gaming-marketplace-wallet-user1')
          .mockReturnValueOnce('gaming-marketplace-wallet-user2')
      });

      const result = WalletMigrationService.getUsersNeedingMigration();

      expect(result).toContain('user1');
      expect(result).toContain('user2');
    });
  });

  describe('getMigrationStatus', () => {
    it('should return correct migration status', () => {
      // Mock users needing migration
      vi.spyOn(WalletMigrationService, 'getUsersNeedingMigration').mockReturnValue(['user1', 'user2']);
      
      // Mock migration log
      const migrationLog = [
        { userId: 'user3', success: true, timestamp: new Date() },
        { userId: 'user4', success: false, timestamp: new Date(), error: 'Test error' }
      ];
      vi.mocked(StorageService.getItem).mockReturnValue(migrationLog);

      const result = WalletMigrationService.getMigrationStatus();

      expect(result.totalUsers).toBe(4);
      expect(result.migratedUsers).toBe(1);
      expect(result.failedUsers).toBe(1);
      expect(result.pendingUsers).toBe(2);
      expect(result.isComplete).toBe(false);
    });
  });

  describe('gradual rollout mechanism', () => {
    it('should enable multi-wallet for specific user', () => {
      vi.mocked(StorageService.getItem).mockReturnValue([]);
      vi.mocked(StorageService.setItem).mockImplementation(() => {});

      WalletMigrationService.enableMultiWalletForUser(mockUserId);

      expect(StorageService.setItem).toHaveBeenCalledWith(
        'multi_wallet_enabled_users',
        [mockUserId]
      );
    });

    it('should check if multi-wallet is enabled for user', () => {
      vi.mocked(StorageService.getItem).mockReturnValue([mockUserId]);

      const result = WalletMigrationService.isMultiWalletEnabledForUser(mockUserId);

      expect(result).toBe(true);
    });

    it('should disable multi-wallet for user', () => {
      vi.mocked(StorageService.getItem).mockReturnValue([mockUserId, 'other-user']);
      vi.mocked(StorageService.setItem).mockImplementation(() => {});

      WalletMigrationService.disableMultiWalletForUser(mockUserId);

      expect(StorageService.setItem).toHaveBeenCalledWith(
        'multi_wallet_enabled_users',
        ['other-user']
      );
    });
  });

  describe('validateMigration', () => {
    it('should validate successful migration', () => {
      const multiWallet: MultiWallet = {
        userId: mockUserId,
        staticWallets: {
          usd: { balance: 50.25, currency: 'usd' },
          toman: { balance: 2100000, currency: 'toman' }
        },
        goldWallets: {
          'default-gold': {
            realmId: 'default-gold',
            realmName: 'General Gold',
            gameName: 'Multi-Game',
            suspendedGold: 0,
            withdrawableGold: 1000,
            totalGold: 1000,
            suspendedDeposits: []
          }
        },
        updatedAt: new Date()
      };

      vi.mocked(WalletService.getWallet).mockReturnValue(mockOldWallet);
      vi.mocked(StorageService.hasItem).mockReturnValue(true);
      vi.mocked(MultiWalletService.getMultiWallet).mockReturnValue(multiWallet);
      vi.mocked(MultiWalletService.getTotalBalance).mockReturnValue(1000);
      vi.mocked(WalletService.getTransactions).mockReturnValue(mockOldTransactions);
      vi.mocked(MultiWalletService.getMultiWalletTransactions).mockReturnValue([]);

      const result = WalletMigrationService.validateMigration(mockUserId);

      expect(result.isValid).toBe(false); // Transaction count mismatch
      expect(result.details.balanceMatch).toBe(true);
      expect(result.details.newWalletExists).toBe(true);
    });

    it('should detect balance mismatches', () => {
      const multiWallet: MultiWallet = {
        userId: mockUserId,
        staticWallets: {
          usd: { balance: 100, currency: 'usd' }, // Different from original
          toman: { balance: 2100000, currency: 'toman' }
        },
        goldWallets: {},
        updatedAt: new Date()
      };

      vi.mocked(WalletService.getWallet).mockReturnValue(mockOldWallet);
      vi.mocked(StorageService.hasItem).mockReturnValue(true);
      vi.mocked(MultiWalletService.getMultiWallet).mockReturnValue(multiWallet);
      vi.mocked(MultiWalletService.getTotalBalance).mockReturnValue(0);

      const result = WalletMigrationService.validateMigration(mockUserId);

      expect(result.isValid).toBe(false);
      expect(result.details.balanceMatch).toBe(false);
      expect(result.issues).toContain('USD balance mismatch: old=50.25, new=100');
    });
  });

  describe('batch migration', () => {
    it('should migrate users in batches', async () => {
      vi.spyOn(WalletMigrationService, 'getUsersNeedingMigration').mockReturnValue(['user1', 'user2', 'user3']);
      
      // Mock successful migrations
      vi.spyOn(WalletMigrationService, 'migrateUserWallet')
        .mockResolvedValueOnce({ success: true, userId: 'user1' })
        .mockResolvedValueOnce({ success: true, userId: 'user2' })
        .mockResolvedValueOnce({ success: false, userId: 'user3', error: 'Test error' });

      const result = await WalletMigrationService.migrateAllUsers(2);

      expect(result.totalProcessed).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(3);
    });
  });

  describe('backward compatibility', () => {
    it('should return multi-wallet when enabled for user', () => {
      const multiWallet: MultiWallet = {
        userId: mockUserId,
        staticWallets: {
          usd: { balance: 100, currency: 'usd' },
          toman: { balance: 0, currency: 'toman' }
        },
        goldWallets: {},
        updatedAt: new Date()
      };

      vi.spyOn(WalletMigrationService, 'isMultiWalletEnabledForUser').mockReturnValue(true);
      vi.mocked(MultiWalletService.getWalletWithMigration).mockReturnValue(multiWallet);

      const result = WalletMigrationService.getWalletWithCompatibility(mockUserId);

      expect(result).toEqual(multiWallet);
      expect(MultiWalletService.getWalletWithMigration).toHaveBeenCalledWith(mockUserId);
    });

    it('should return old wallet when multi-wallet not enabled', () => {
      vi.spyOn(WalletMigrationService, 'isMultiWalletEnabledForUser').mockReturnValue(false);
      vi.mocked(WalletService.getWallet).mockReturnValue(mockOldWallet);

      const result = WalletMigrationService.getWalletWithCompatibility(mockUserId);

      expect(result).toEqual(mockOldWallet);
      expect(WalletService.getWallet).toHaveBeenCalledWith(mockUserId);
    });
  });
});