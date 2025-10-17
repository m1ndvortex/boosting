// Browser storage service layer for localStorage management

export class StorageService {
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  USER: 'gaming_marketplace_user',
  AUTH_TOKEN: 'gaming_marketplace_auth_token',
  WALLET: 'gaming_marketplace_wallet',
  SERVICES: 'gaming_marketplace_services',
  ORDERS: 'gaming_marketplace_orders',
  TEAMS: 'gaming_marketplace_teams',
  GAMES: 'gaming_marketplace_games',
  SHOP_ORDERS: 'gaming_marketplace_shop_orders',
  TRANSACTIONS: 'gaming_marketplace_transactions',
} as const;

// Specific storage services
export class UserStorage extends StorageService {
  static saveUser(user: unknown): void {
    this.setItem(STORAGE_KEYS.USER, user);
  }

  static getUser(): unknown | null {
    return this.getItem(STORAGE_KEYS.USER);
  }

  static clearUser(): void {
    this.removeItem(STORAGE_KEYS.USER);
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

interface WalletData {
  userId: string;
  balances: { gold: number; usd: number; toman: number };
  updatedAt: string;
}

export class WalletStorage extends StorageService {
  static saveWallet(wallet: WalletData): void {
    this.setItem(STORAGE_KEYS.WALLET, wallet);
  }

  static getWallet(userId: string): WalletData | null {
    const wallets =
      this.getItem<Record<string, WalletData>>(STORAGE_KEYS.WALLET) || {};
    return wallets[userId] || null;
  }

  static updateBalance(userId: string, currency: string, amount: number): void {
    const wallets =
      this.getItem<Record<string, WalletData>>(STORAGE_KEYS.WALLET) || {};
    if (!wallets[userId]) {
      wallets[userId] = {
        userId,
        balances: { gold: 0, usd: 0, toman: 0 },
        updatedAt: new Date().toISOString(),
      };
    }
    (wallets[userId].balances as Record<string, number>)[currency] = amount;
    wallets[userId].updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.WALLET, wallets);
  }
}
