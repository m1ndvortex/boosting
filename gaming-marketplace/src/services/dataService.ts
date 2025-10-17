// Comprehensive data service for managing all application data

import type { 
  User, 
  Service, 
  Order, 
  Team, 
  Wallet, 
  Transaction, 
  ShopProduct, 
  ShopOrder,
  ActivityLogEntry
} from '../types';
import { StorageService, STORAGE_KEYS } from './storage';
import { ErrorService, ErrorCode } from './errorService';
import { validateUser, validateService, validateOrder, validateTeam } from '../utils/validation';
import { initializeMockData } from './mockData';

export class DataService {
  private static initialized = false;

  // Initialize the data service
  static initialize(): void {
    if (this.initialized) return;

    try {
      // Initialize mock data if not present
      initializeMockData();
      this.initialized = true;
    } catch (error) {
      ErrorService.handleError(error, 'DataService.initialize');
    }
  }

  // Generic CRUD operations
  static async create<T extends { id: string }>(
    storageKey: string,
    item: Omit<T, 'id'>,
    validator?: (item: Partial<T>) => { isValid: boolean; errors: unknown[] }
  ): Promise<T> {
    try {
      // Validate if validator provided
      if (validator) {
        const validation = validator(item as Partial<T>);
        if (!validation.isValid) {
          throw ErrorService.createError(
            ErrorCode.VALIDATION_FAILED,
            { errors: validation.errors }
          );
        }
      }

      const newItem = {
        ...item,
        id: `${storageKey}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      } as T;

      const items = StorageService.getItem<T[]>(storageKey) || [];
      items.push(newItem);
      StorageService.setItem(storageKey, items);

      return newItem;
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.create');
    }
  }

  static async read<T>(storageKey: string): Promise<T[]> {
    try {
      return StorageService.getItem<T[]>(storageKey) || [];
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.read');
    }
  }

  static async readById<T extends { id: string }>(
    storageKey: string,
    id: string
  ): Promise<T | null> {
    try {
      const items = await this.read<T>(storageKey);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.readById');
    }
  }

  static async update<T extends { id: string }>(
    storageKey: string,
    id: string,
    updates: Partial<T>,
    validator?: (item: Partial<T>) => { isValid: boolean; errors: unknown[] }
  ): Promise<T> {
    try {
      const items = await this.read<T>(storageKey);
      const itemIndex = items.findIndex(item => item.id === id);

      if (itemIndex === -1) {
        throw ErrorService.createError(
          ErrorCode.OPERATION_FAILED,
          { id },
          'Item not found'
        );
      }

      const updatedItem = { ...items[itemIndex], ...updates };

      // Validate if validator provided
      if (validator) {
        const validation = validator(updatedItem);
        if (!validation.isValid) {
          throw ErrorService.createError(
            ErrorCode.VALIDATION_FAILED,
            { errors: validation.errors }
          );
        }
      }

      items[itemIndex] = updatedItem;
      StorageService.setItem(storageKey, items);

      return updatedItem;
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.update');
    }
  }

  static async delete<T extends { id: string }>(
    storageKey: string,
    id: string
  ): Promise<void> {
    try {
      const items = await this.read<T>(storageKey);
      const filteredItems = items.filter(item => item.id !== id);
      StorageService.setItem(storageKey, filteredItems);
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.delete');
    }
  }

  // User operations
  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    return this.create<User>(STORAGE_KEYS.USER, userData, validateUser);
  }

  static async getUsers(): Promise<User[]> {
    return this.read<User>(STORAGE_KEYS.USER);
  }

  static async getUserById(id: string): Promise<User | null> {
    return this.readById<User>(STORAGE_KEYS.USER, id);
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.update<User>(STORAGE_KEYS.USER, id, updates, validateUser);
  }

  // Service operations
  static async createService(serviceData: Omit<Service, 'id'>): Promise<Service> {
    const storageKey = serviceData.workspaceType === 'team' 
      ? `${STORAGE_KEYS.SERVICES}_team_${serviceData.workspaceOwnerId}`
      : `${STORAGE_KEYS.SERVICES}_${serviceData.createdBy}`;
    
    return this.create<Service>(storageKey, serviceData, validateService);
  }

  static async getServices(userId: string, workspaceType: 'personal' | 'team' = 'personal', workspaceId?: string): Promise<Service[]> {
    const storageKey = workspaceType === 'team' && workspaceId
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    
    return this.read<Service>(storageKey);
  }

  static async updateService(
    serviceId: string, 
    userId: string, 
    updates: Partial<Service>,
    workspaceType: 'personal' | 'team' = 'personal',
    workspaceId?: string
  ): Promise<Service> {
    const storageKey = workspaceType === 'team' && workspaceId
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    
    return this.update<Service>(storageKey, serviceId, updates, validateService);
  }

  static async deleteService(
    serviceId: string, 
    userId: string,
    workspaceType: 'personal' | 'team' = 'personal',
    workspaceId?: string
  ): Promise<void> {
    const storageKey = workspaceType === 'team' && workspaceId
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    
    return this.delete<Service>(storageKey, serviceId);
  }

  // Order operations
  static async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    return this.create<Order>(STORAGE_KEYS.ORDERS, orderData, validateOrder);
  }

  static async getOrders(): Promise<Order[]> {
    return this.read<Order>(STORAGE_KEYS.ORDERS);
  }

  static async getOrderById(id: string): Promise<Order | null> {
    return this.readById<Order>(STORAGE_KEYS.ORDERS, id);
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return this.update<Order>(STORAGE_KEYS.ORDERS, id, updates, validateOrder);
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(order => 
      order.buyerId === userId || 
      order.boosterId === userId || 
      order.earningsRecipientId === userId
    );
  }

  // Team operations
  static async createTeam(teamData: Omit<Team, 'id'>): Promise<Team> {
    return this.create<Team>(STORAGE_KEYS.TEAMS, teamData, validateTeam);
  }

  static async getTeams(): Promise<Team[]> {
    return this.read<Team>(STORAGE_KEYS.TEAMS);
  }

  static async getTeamById(id: string): Promise<Team | null> {
    return this.readById<Team>(STORAGE_KEYS.TEAMS, id);
  }

  static async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    return this.update<Team>(STORAGE_KEYS.TEAMS, id, updates, validateTeam);
  }

  static async getUserTeams(userId: string): Promise<Team[]> {
    const teams = await this.getTeams();
    return teams.filter(team => 
      team.leaderId === userId || 
      team.members.some(member => member.userId === userId && member.status === 'active')
    );
  }

  // Wallet operations
  static async getWallet(userId: string): Promise<Wallet> {
    try {
      const wallets = StorageService.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET) || {};
      
      if (!wallets[userId]) {
        // Create default wallet
        const defaultWallet: Wallet = {
          userId,
          balances: { gold: 0, usd: 0, toman: 0 },
          updatedAt: new Date(),
        };
        wallets[userId] = defaultWallet;
        StorageService.setItem(STORAGE_KEYS.WALLET, wallets);
        return defaultWallet;
      }
      
      return wallets[userId];
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.getWallet');
    }
  }

  static async updateWallet(userId: string, updates: Partial<Wallet>): Promise<Wallet> {
    try {
      const wallets = StorageService.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET) || {};
      
      if (!wallets[userId]) {
        wallets[userId] = {
          userId,
          balances: { gold: 0, usd: 0, toman: 0 },
          updatedAt: new Date(),
        };
      }
      
      wallets[userId] = { ...wallets[userId], ...updates, updatedAt: new Date() };
      StorageService.setItem(STORAGE_KEYS.WALLET, wallets);
      
      return wallets[userId];
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.updateWallet');
    }
  }

  // Transaction operations
  static async createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    return this.create<Transaction>(STORAGE_KEYS.TRANSACTIONS, transactionData);
  }

  static async getTransactions(): Promise<Transaction[]> {
    return this.read<Transaction>(STORAGE_KEYS.TRANSACTIONS);
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(transaction => transaction.walletId === userId);
  }

  // Shop operations
  static async getShopProducts(): Promise<ShopProduct[]> {
    return this.read<ShopProduct>('gaming_marketplace_shop_products');
  }

  static async createShopOrder(orderData: Omit<ShopOrder, 'id'>): Promise<ShopOrder> {
    return this.create<ShopOrder>(STORAGE_KEYS.SHOP_ORDERS, orderData);
  }

  static async getShopOrders(): Promise<ShopOrder[]> {
    return this.read<ShopOrder>(STORAGE_KEYS.SHOP_ORDERS);
  }

  static async getUserShopOrders(userId: string): Promise<ShopOrder[]> {
    const orders = await this.getShopOrders();
    return orders.filter(order => order.userId === userId);
  }

  // Activity log operations
  static async addActivity(activity: Omit<ActivityLogEntry, 'id'>): Promise<ActivityLogEntry> {
    const newActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    } as ActivityLogEntry;

    const activities = StorageService.getItem<ActivityLogEntry[]>(STORAGE_KEYS.ACTIVITY_LOG) || [];
    activities.unshift(newActivity); // Add to beginning for chronological order
    
    // Keep only last 1000 activities to prevent storage bloat
    if (activities.length > 1000) {
      activities.splice(1000);
    }
    
    StorageService.setItem(STORAGE_KEYS.ACTIVITY_LOG, activities);
    return newActivity;
  }

  static async getActivityLog(): Promise<ActivityLogEntry[]> {
    return this.read<ActivityLogEntry>(STORAGE_KEYS.ACTIVITY_LOG);
  }

  static async getTeamActivityLog(teamId: string): Promise<ActivityLogEntry[]> {
    const activities = await this.getActivityLog();
    return activities.filter(activity => 
      'teamId' in activity && activity.teamId === teamId
    );
  }

  // Data synchronization and cleanup
  static async syncAllData(): Promise<void> {
    try {
      // This would typically sync with a backend API
      // For now, we'll just validate and clean up local data
      await this.cleanupExpiredData();
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.syncAllData');
    }
  }

  static async cleanupExpiredData(): Promise<void> {
    try {
      // Clean up old activity logs (older than 30 days)
      const activities = await this.getActivityLog();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentActivities = activities.filter(activity => 
        new Date(activity.timestamp) > thirtyDaysAgo
      );
      StorageService.setItem(STORAGE_KEYS.ACTIVITY_LOG, recentActivities);

      // Clean up old transactions (older than 90 days)
      const transactions = await this.getTransactions();
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const recentTransactions = transactions.filter(transaction => 
        new Date(transaction.createdAt) > ninetyDaysAgo
      );
      StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, recentTransactions);

    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.cleanupExpiredData');
    }
  }

  // Export/Import data for backup
  static async exportData(): Promise<string> {
    try {
      const data = {
        users: await this.getUsers(),
        orders: await this.getOrders(),
        teams: await this.getTeams(),
        transactions: await this.getTransactions(),
        shopOrders: await this.getShopOrders(),
        activityLog: await this.getActivityLog(),
        exportedAt: new Date().toISOString()
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.exportData');
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.exportedAt) {
        throw ErrorService.createError(
          ErrorCode.VALIDATION_FAILED,
          {},
          'Invalid data format'
        );
      }

      // Import data
      if (data.users) StorageService.setItem(STORAGE_KEYS.USER, data.users);
      if (data.orders) StorageService.setItem(STORAGE_KEYS.ORDERS, data.orders);
      if (data.teams) StorageService.setItem(STORAGE_KEYS.TEAMS, data.teams);
      if (data.transactions) StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.shopOrders) StorageService.setItem(STORAGE_KEYS.SHOP_ORDERS, data.shopOrders);
      if (data.activityLog) StorageService.setItem(STORAGE_KEYS.ACTIVITY_LOG, data.activityLog);

    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.importData');
    }
  }

  // Get data statistics
  static async getDataStatistics(): Promise<{
    users: number;
    services: number;
    orders: number;
    teams: number;
    transactions: number;
    storageUsed: number;
  }> {
    try {
      const users = await this.getUsers();
      const orders = await this.getOrders();
      const teams = await this.getTeams();
      const transactions = await this.getTransactions();

      // Calculate approximate storage usage
      let storageUsed = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gaming_marketplace_')) {
          const value = localStorage.getItem(key);
          if (value) {
            storageUsed += key.length + value.length;
          }
        }
      }

      // Count services across all workspaces
      let totalServices = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('gaming_marketplace_services')) {
          const services = StorageService.getItem<unknown[]>(key) || [];
          totalServices += services.length;
        }
      }

      return {
        users: users.length,
        services: totalServices,
        orders: orders.length,
        teams: teams.length,
        transactions: transactions.length,
        storageUsed
      };
    } catch (error) {
      throw ErrorService.handleError(error, 'DataService.getDataStatistics');
    }
  }
}