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

  // Aliases for shorter method names
  static set = StorageService.setItem;
  static get = StorageService.getItem;

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
  USER: 'gaming-marketplace-user',
  AUTH_TOKEN: 'gaming-marketplace-auth-token',
  WALLET: 'gaming-marketplace-wallet',
  SERVICES: 'gaming-marketplace-services',
  ORDERS: 'gaming-marketplace-orders',
  TEAMS: 'gaming-marketplace-teams',
  GAMES: 'gaming-marketplace-games',
  SHOP_ORDERS: 'gaming-marketplace-shop-orders',
  TRANSACTIONS: 'gaming-marketplace-transactions',
  ACTIVITY_LOG: 'gaming-marketplace-activity-log',
  TEAM_INVITATIONS: 'gaming-marketplace-team-invitations',
  ROLE_REQUESTS: 'gaming-marketplace-role-requests',
  EXCHANGE_RATES: 'gaming-marketplace-exchange-rates',
  SYSTEM_SETTINGS: 'gaming-marketplace-system-settings',
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
    const key = `${STORAGE_KEYS.WALLET}-${wallet.userId}`;
    this.setItem(key, wallet);
  }

  static getWallet(userId: string): WalletData | null {
    const key = `${STORAGE_KEYS.WALLET}-${userId}`;
    return this.getItem<WalletData>(key);
  }

  static updateBalance(userId: string, currency: string, amount: number): void {
    const wallet = this.getWallet(userId);
    if (!wallet) {
      const newWallet: WalletData = {
        userId,
        balances: { gold: 0, usd: 0, toman: 0 },
        updatedAt: new Date().toISOString(),
      };
      (newWallet.balances as Record<string, number>)[currency] = amount;
      this.saveWallet(newWallet);
    } else {
      const currentBalance = (wallet.balances as Record<string, number>)[currency] || 0;
      (wallet.balances as Record<string, number>)[currency] = currentBalance + amount;
      wallet.updatedAt = new Date().toISOString();
      this.saveWallet(wallet);
    }
  }
}

// Additional storage services for comprehensive data management
export class OrderStorage extends StorageService {
  static saveOrders(orders: unknown[]): void {
    this.setItem(STORAGE_KEYS.ORDERS, orders);
  }

  static getOrders(): unknown[] {
    return this.getItem<unknown[]>(STORAGE_KEYS.ORDERS) || [];
  }

  static getUserOrders(userId: string): unknown[] {
    const orders = this.getOrders() as any[];
    return orders.filter(order => 
      order.buyerId === userId || 
      order.boosterId === userId || 
      order.earningsRecipientId === userId
    );
  }

  static updateOrder(orderId: string, updates: Record<string, unknown>): void {
    const orders = this.getOrders() as any[];
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex] = { ...orders[orderIndex], ...updates };
      this.saveOrders(orders);
    }
  }
}

export class ServiceStorage extends StorageService {
  static saveServices(userId: string, services: unknown[], workspaceType: string = 'personal', workspaceId?: string): void {
    const key = workspaceType === 'team' && workspaceId 
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    this.setItem(key, services);
  }

  static getServices(userId: string, workspaceType: string = 'personal', workspaceId?: string): unknown[] {
    const key = workspaceType === 'team' && workspaceId 
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    return this.getItem<unknown[]>(key) || [];
  }

  static getAllServices(): unknown[] {
    const allServices: unknown[] = [];
    // Get all service keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.SERVICES)) {
        const services = this.getItem<unknown[]>(key) || [];
        allServices.push(...services);
      }
    }
    return allServices;
  }
}

export class TeamStorage extends StorageService {
  static saveTeams(teams: unknown[]): void {
    this.setItem(STORAGE_KEYS.TEAMS, teams);
  }

  static getTeams(): unknown[] {
    return this.getItem<unknown[]>(STORAGE_KEYS.TEAMS) || [];
  }

  static getUserTeams(userId: string): unknown[] {
    const teams = this.getTeams() as any[];
    return teams.filter(team => 
      team.leaderId === userId || 
      team.members.some((member: any) => member.userId === userId && member.status === 'active')
    );
  }

  static updateTeam(teamId: string, updates: Record<string, unknown>): void {
    const teams = this.getTeams() as any[];
    const teamIndex = teams.findIndex(team => team.id === teamId);
    if (teamIndex !== -1) {
      teams[teamIndex] = { ...teams[teamIndex], ...updates };
      this.saveTeams(teams);
    }
  }
}

export class ShopStorage extends StorageService {
  static saveShopOrders(orders: unknown[]): void {
    this.setItem(STORAGE_KEYS.SHOP_ORDERS, orders);
  }

  static getShopOrders(): unknown[] {
    return this.getItem<unknown[]>(STORAGE_KEYS.SHOP_ORDERS) || [];
  }

  static getUserShopOrders(userId: string): unknown[] {
    const orders = this.getShopOrders() as any[];
    return orders.filter(order => order.userId === userId);
  }

  static addShopOrder(order: unknown): void {
    const orders = this.getShopOrders();
    orders.push(order);
    this.saveShopOrders(orders);
  }
}

export class ActivityLogStorage extends StorageService {
  static saveActivityLog(activities: unknown[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITY_LOG, activities);
  }

  static getActivityLog(): unknown[] {
    return this.getItem<unknown[]>(STORAGE_KEYS.ACTIVITY_LOG) || [];
  }

  static addActivity(activity: unknown): void {
    const activities = this.getActivityLog();
    activities.unshift(activity); // Add to beginning for chronological order
    // Keep only last 1000 activities to prevent storage bloat
    if (activities.length > 1000) {
      activities.splice(1000);
    }
    this.saveActivityLog(activities);
  }

  static getTeamActivityLog(teamId: string): unknown[] {
    const activities = this.getActivityLog() as any[];
    return activities.filter(activity => activity.teamId === teamId);
  }
}
