import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService, UserStorage, WalletStorage } from '@services/storage';

describe('Storage Services', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('StorageService', () => {
    it('should store and retrieve data correctly', () => {
      const testData = { name: 'Test', value: 123 };
      
      StorageService.setItem('test-key', testData);
      const retrieved = StorageService.getItem('test-key');
      
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = StorageService.getItem('non-existent');
      expect(result).toBeNull();
    });

    it('should remove items correctly', () => {
      StorageService.setItem('test-key', 'test-value');
      StorageService.removeItem('test-key');
      
      const result = StorageService.getItem('test-key');
      expect(result).toBeNull();
    });

    it('should clear all storage', () => {
      StorageService.setItem('key1', 'value1');
      StorageService.setItem('key2', 'value2');
      
      StorageService.clear();
      
      expect(StorageService.getItem('key1')).toBeNull();
      expect(StorageService.getItem('key2')).toBeNull();
    });
  });

  describe('UserStorage', () => {
    const mockUser = {
      id: 'user-1',
      discordId: '123456789',
      username: 'TestUser',
      discriminator: '1234',
      avatar: 'avatar.png',
      email: 'test@example.com',
      roles: [{ id: '1', name: 'client' as const, status: 'active' as const }],
      createdAt: new Date().toISOString(),
    };

    it('should save and retrieve user data', () => {
      UserStorage.saveUser(mockUser);
      const retrieved = UserStorage.getUser();
      
      expect(retrieved).toEqual(mockUser);
    });

    it('should return null when no user is stored', () => {
      const result = UserStorage.getUser();
      expect(result).toBeNull();
    });

    it('should clear user data', () => {
      UserStorage.saveUser(mockUser);
      UserStorage.clearUser();
      
      const result = UserStorage.getUser();
      expect(result).toBeNull();
    });
  });

  describe('WalletStorage', () => {
    const mockWallet = {
      userId: 'user-1',
      balances: { gold: 100000, usd: 500, toman: 20000000 },
      updatedAt: new Date().toISOString(),
    };

    it('should save and retrieve wallet data', () => {
      WalletStorage.saveWallet(mockWallet);
      const retrieved = WalletStorage.getWallet('user-1');
      
      expect(retrieved).toEqual(mockWallet);
    });

    it('should return null for non-existent wallet', () => {
      const result = WalletStorage.getWallet('non-existent-user');
      expect(result).toBeNull();
    });

    it('should update balance correctly', () => {
      WalletStorage.saveWallet(mockWallet);
      WalletStorage.updateBalance('user-1', 'usd', 100);
      
      const updated = WalletStorage.getWallet('user-1');
      expect(updated?.balances.usd).toBe(600);
    });

    it('should handle negative balance updates', () => {
      WalletStorage.saveWallet(mockWallet);
      WalletStorage.updateBalance('user-1', 'gold', -50000);
      
      const updated = WalletStorage.getWallet('user-1');
      expect(updated?.balances.gold).toBe(50000);
    });
  });
});