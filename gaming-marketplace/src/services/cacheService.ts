// Cache Service for optimizing wallet data loading and caching

import type { MultiWallet, GameRealm, GameDefinition, MultiWalletTransaction } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

export class CacheService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private static maxSize = 1000; // Maximum cache entries
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  // Cache TTL configurations for different data types
  private static readonly TTL_CONFIG = {
    wallet: 2 * 60 * 1000,        // 2 minutes for wallet data
    realms: 10 * 60 * 1000,       // 10 minutes for realm data
    games: 15 * 60 * 1000,        // 15 minutes for game data
    transactions: 1 * 60 * 1000,   // 1 minute for transaction data
    user_transactions: 30 * 1000,  // 30 seconds for user-specific transactions
    conversion_fees: 30 * 60 * 1000, // 30 minutes for conversion fees
  };

  /**
   * Get data from cache
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, ttl?: number): void {
    // Determine TTL based on key pattern or use provided/default TTL
    const cacheTTL = ttl || this.getTTLForKey(key) || this.defaultTTL;

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate cache entry
   */
  static invalidate(key: string): void {
    if (this.cache.delete(key)) {
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  static invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Cleanup expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.stats.evictions++;
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Get or set pattern - retrieve from cache or compute and cache
   */
  static async getOrSet<T>(
    key: string,
    computeFn: () => T | Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await computeFn();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Batch get multiple cache entries
   */
  static batchGet<T>(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();
    
    for (const key of keys) {
      const data = this.get<T>(key);
      if (data !== null) {
        results.set(key, data);
      }
    }

    return results;
  }

  /**
   * Batch set multiple cache entries
   */
  static batchSet<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl);
    }
  }

  /**
   * Preload frequently accessed data
   */
  static async preloadFrequentData(): Promise<void> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { GameManagementService } = await import('./gameManagementService');
      const { ConversionFeeService } = await import('./conversionFeeService');

      // Preload game and realm data
      const games = GameManagementService.getActiveGames();
      const realms = GameManagementService.getAllActiveRealms();
      const conversionFees = ConversionFeeService.getConversionFeeConfig();

      this.set('games:active', games, this.TTL_CONFIG.games);
      this.set('realms:active', realms, this.TTL_CONFIG.realms);
      this.set('conversion_fees:config', conversionFees, this.TTL_CONFIG.conversion_fees);

    } catch (error) {
      console.warn('Failed to preload frequent data:', error);
    }
  }

  /**
   * Get cache key for wallet data
   */
  static getWalletCacheKey(userId: string): string {
    return `wallet:${userId}`;
  }

  /**
   * Get cache key for user transactions
   */
  static getTransactionsCacheKey(userId: string, filters?: Record<string, any>): string {
    const filterKey = filters ? `:${JSON.stringify(filters)}` : '';
    return `transactions:${userId}${filterKey}`;
  }

  /**
   * Get cache key for realm data
   */
  static getRealmsCacheKey(gameId?: string): string {
    return gameId ? `realms:game:${gameId}` : 'realms:active';
  }

  /**
   * Invalidate user-related cache entries
   */
  static invalidateUserCache(userId: string): void {
    this.invalidatePattern(`wallet:${userId}`);
    this.invalidatePattern(`transactions:${userId}`);
  }

  /**
   * Invalidate game/realm related cache entries
   */
  static invalidateGameCache(): void {
    this.invalidatePattern('games:');
    this.invalidatePattern('realms:');
  }

  // Private helper methods

  private static getTTLForKey(key: string): number | null {
    for (const [pattern, ttl] of Object.entries(this.TTL_CONFIG)) {
      if (key.includes(pattern)) {
        return ttl;
      }
    }
    return null;
  }

  private static evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }
}

// Initialize cache cleanup interval
if (typeof window !== 'undefined') {
  // Cleanup expired entries every 2 minutes
  setInterval(() => {
    CacheService.cleanup();
  }, 2 * 60 * 1000);

  // Preload frequent data on initialization
  CacheService.preloadFrequentData();
}