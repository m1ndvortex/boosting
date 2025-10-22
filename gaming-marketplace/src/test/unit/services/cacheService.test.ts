// Tests for CacheService

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '../../../services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    CacheService.clear();
  });

  describe('basic cache operations', () => {
    it('should set and get cache entries', () => {
      const key = 'test-key';
      const data = { value: 'test-data' };

      CacheService.set(key, data);
      const result = CacheService.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = CacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should respect TTL and expire entries', () => {
      const key = 'test-key';
      const data = { value: 'test-data' };
      const shortTTL = 10; // 10ms

      CacheService.set(key, data, shortTTL);
      
      // Should be available immediately
      expect(CacheService.get(key)).toEqual(data);

      // Wait for expiry and check again
      return new Promise(resolve => {
        setTimeout(() => {
          expect(CacheService.get(key)).toBeNull();
          resolve(undefined);
        }, 20);
      });
    });

    it('should invalidate specific keys', () => {
      CacheService.set('key1', 'data1');
      CacheService.set('key2', 'data2');

      CacheService.invalidate('key1');

      expect(CacheService.get('key1')).toBeNull();
      expect(CacheService.get('key2')).toBe('data2');
    });

    it('should invalidate by pattern', () => {
      CacheService.set('user:123:wallet', 'wallet-data');
      CacheService.set('user:123:transactions', 'transaction-data');
      CacheService.set('user:456:wallet', 'other-wallet-data');

      CacheService.invalidatePattern('user:123');

      expect(CacheService.get('user:123:wallet')).toBeNull();
      expect(CacheService.get('user:123:transactions')).toBeNull();
      expect(CacheService.get('user:456:wallet')).toBe('other-wallet-data');
    });
  });

  describe('cache statistics', () => {
    it('should track hits and misses', () => {
      CacheService.set('key1', 'data1');
      
      // Hit
      CacheService.get('key1');
      
      // Miss
      CacheService.get('non-existent');

      const stats = CacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it('should track cache size', () => {
      CacheService.set('key1', 'data1');
      CacheService.set('key2', 'data2');

      const stats = CacheService.getStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('batch operations', () => {
    it('should batch get multiple entries', () => {
      CacheService.set('key1', 'data1');
      CacheService.set('key2', 'data2');
      CacheService.set('key3', 'data3');

      const results = CacheService.batchGet(['key1', 'key2', 'non-existent']);

      expect(results.get('key1')).toBe('data1');
      expect(results.get('key2')).toBe('data2');
      expect(results.has('non-existent')).toBe(false);
    });

    it('should batch set multiple entries', () => {
      const entries = [
        { key: 'key1', data: 'data1' },
        { key: 'key2', data: 'data2', ttl: 1000 }
      ];

      CacheService.batchSet(entries);

      expect(CacheService.get('key1')).toBe('data1');
      expect(CacheService.get('key2')).toBe('data2');
    });
  });

  describe('getOrSet pattern', () => {
    it('should return cached value if available', async () => {
      const key = 'test-key';
      const cachedData = 'cached-data';
      const computeFn = vi.fn().mockResolvedValue('computed-data');

      CacheService.set(key, cachedData);

      const result = await CacheService.getOrSet(key, computeFn);

      expect(result).toBe(cachedData);
      expect(computeFn).not.toHaveBeenCalled();
    });

    it('should compute and cache value if not available', async () => {
      const key = 'test-key';
      const computedData = 'computed-data';
      const computeFn = vi.fn().mockResolvedValue(computedData);

      const result = await CacheService.getOrSet(key, computeFn);

      expect(result).toBe(computedData);
      expect(computeFn).toHaveBeenCalled();
      expect(CacheService.get(key)).toBe(computedData);
    });
  });

  describe('cache key helpers', () => {
    it('should generate consistent wallet cache keys', () => {
      const userId = 'user-123';
      const key = CacheService.getWalletCacheKey(userId);
      expect(key).toBe('wallet:user-123');
    });

    it('should generate consistent transaction cache keys', () => {
      const userId = 'user-123';
      const filters = { type: 'deposit' };
      const key = CacheService.getTransactionsCacheKey(userId, filters);
      expect(key).toBe('transactions:user-123:{"type":"deposit"}');
    });

    it('should generate consistent realm cache keys', () => {
      const gameId = 'game-123';
      const key = CacheService.getRealmsCacheKey(gameId);
      expect(key).toBe('realms:game:game-123');

      const allRealmsKey = CacheService.getRealmsCacheKey();
      expect(allRealmsKey).toBe('realms:active');
    });
  });

  describe('cleanup operations', () => {
    it('should cleanup expired entries', () => {
      const shortTTL = 10; // 10ms
      CacheService.set('key1', 'data1', shortTTL);
      CacheService.set('key2', 'data2', 10000); // 10 seconds

      return new Promise(resolve => {
        setTimeout(() => {
          CacheService.cleanup();
          
          expect(CacheService.get('key1')).toBeNull();
          expect(CacheService.get('key2')).toBe('data2');
          resolve(undefined);
        }, 20);
      });
    });

    it('should clear all cache entries', () => {
      CacheService.set('key1', 'data1');
      CacheService.set('key2', 'data2');

      CacheService.clear();

      expect(CacheService.get('key1')).toBeNull();
      expect(CacheService.get('key2')).toBeNull();
      
      const stats = CacheService.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });
});