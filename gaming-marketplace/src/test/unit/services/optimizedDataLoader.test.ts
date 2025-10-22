// Tests for OptimizedDataLoader service

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OptimizedDataLoader } from '../../../services/optimizedDataLoader';
import { CacheService } from '../../../services/cacheService';
import { StorageService } from '../../../services/storage';
import type { MultiWallet, GameRealm } from '../../../types';

// Mock dependencies
vi.mock('../../../services/cacheService');
vi.mock('../../../services/storage');

describe('OptimizedDataLoader', () => {
  const mockUserId = 'test-user-123';
  
  const mockWallet: MultiWallet = {
    userId: mockUserId,
    staticWallets: {
      usd: { balance: 100, currency: 'usd' },
      toman: { balance: 50000, currency: 'toman' }
    },
    goldWallets: {
      'realm-1': {
        realmId: 'realm-1',
        realmName: 'Test Realm',
        gameName: 'Test Game',
        suspendedGold: 500,
        withdrawableGold: 1000,
        totalGold: 1500,
        suspendedDeposits: []
      }
    },
    updatedAt: new Date()
  };

  const mockRealms: GameRealm[] = [
    {
      id: 'realm-1',
      gameId: 'game-1',
      gameName: 'Test Game',
      realmName: 'Test Realm',
      displayName: 'Test Realm Gold',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'admin'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadUserWallet', () => {
    it('should return cached wallet when available', async () => {
      // Mock cache hit
      vi.mocked(CacheService.get).mockReturnValue(mockWallet);

      const result = await OptimizedDataLoader.loadUserWallet(mockUserId);

      expect(result.data).toEqual(mockWallet);
      expect(result.fromCache).toBe(true);
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
      expect(CacheService.get).toHaveBeenCalledWith(`wallet:${mockUserId}`);
    });

    it('should load from storage when cache miss', async () => {
      // Mock cache miss
      vi.mocked(CacheService.get).mockReturnValue(null);
      vi.mocked(StorageService.getItem).mockReturnValue(mockWallet);

      const result = await OptimizedDataLoader.loadUserWallet(mockUserId);

      expect(result.data.userId).toBe(mockUserId);
      expect(result.fromCache).toBe(false);
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
      expect(CacheService.set).toHaveBeenCalled();
    });

    it('should create default wallet when none exists', async () => {
      // Mock cache miss and no stored wallet
      vi.mocked(CacheService.get).mockReturnValue(null);
      vi.mocked(StorageService.getItem).mockReturnValue(null);

      const result = await OptimizedDataLoader.loadUserWallet(mockUserId);

      expect(result.data.userId).toBe(mockUserId);
      expect(result.data.staticWallets.usd.balance).toBe(0);
      expect(result.data.staticWallets.toman.balance).toBe(0);
      expect(result.data.goldWallets).toEqual({});
      expect(result.fromCache).toBe(false);
      expect(CacheService.set).toHaveBeenCalled();
    });
  });

  describe('loadActiveRealms', () => {
    it('should use cached realms when available', async () => {
      vi.mocked(CacheService.getOrSet).mockResolvedValue(mockRealms);

      const result = await OptimizedDataLoader.loadActiveRealms();

      expect(result.data).toEqual(mockRealms);
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('loadMultipleWallets', () => {
    it('should efficiently load multiple wallets using batch operations', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      const cachedWallets = new Map([
        ['wallet:user1', { ...mockWallet, userId: 'user1' }]
      ]);

      vi.mocked(CacheService.batchGet).mockReturnValue(cachedWallets);
      vi.mocked(CacheService.get).mockReturnValue(null);
      vi.mocked(StorageService.getItem).mockReturnValue(null);

      const result = await OptimizedDataLoader.loadMultipleWallets(userIds);

      expect(result.size).toBe(3);
      expect(result.has('user1')).toBe(true);
      expect(result.has('user2')).toBe(true);
      expect(result.has('user3')).toBe(true);
      expect(CacheService.batchGet).toHaveBeenCalled();
    });
  });

  describe('cache management', () => {
    it('should invalidate user cache correctly', () => {
      OptimizedDataLoader.invalidateUserCache(mockUserId);
      expect(CacheService.invalidateUserCache).toHaveBeenCalledWith(mockUserId);
    });

    it('should invalidate game cache correctly', () => {
      OptimizedDataLoader.invalidateGameCache();
      expect(CacheService.invalidateGameCache).toHaveBeenCalled();
    });

    it('should return cache stats', () => {
      const mockStats = {
        hits: 10,
        misses: 5,
        evictions: 2,
        size: 50,
        hitRate: 66.67
      };
      vi.mocked(CacheService.getStats).mockReturnValue(mockStats);

      const stats = OptimizedDataLoader.getCacheStats();
      expect(stats).toEqual(mockStats);
    });
  });
});