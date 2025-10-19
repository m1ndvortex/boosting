// Transaction Index Service for optimized transaction queries and pagination

import type { MultiWalletTransaction } from '../types';
import { StorageService } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';

interface TransactionIndex {
  byUser: Map<string, string[]>; // userId -> transactionIds
  byWallet: Map<string, string[]>; // walletKey -> transactionIds
  byType: Map<string, string[]>; // type -> transactionIds
  byStatus: Map<string, string[]>; // status -> transactionIds
  byDate: Map<string, string[]>; // dateKey -> transactionIds
  byAmount: Array<{ id: string; amount: number }>; // sorted by amount
}

interface QueryOptions {
  userId?: string;
  walletType?: 'static' | 'gold';
  walletId?: string;
  type?: MultiWalletTransaction['type'];
  status?: MultiWalletTransaction['status'];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  sortBy?: 'createdAt' | 'amount' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface QueryResult {
  transactions: MultiWalletTransaction[];
  total: number;
  hasMore: boolean;
  queryTime: number;
}

export class TransactionIndexService {
  private static index: TransactionIndex | null = null;
  private static lastIndexUpdate = 0;
  private static readonly INDEX_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Build or refresh transaction index
   */
  static async buildIndex(): Promise<void> {
    const startTime = Date.now();
    
    // Check if index is still valid
    if (this.index && (Date.now() - this.lastIndexUpdate) < this.INDEX_TTL) {
      return;
    }

    console.log('Building transaction index...');

    const index: TransactionIndex = {
      byUser: new Map(),
      byWallet: new Map(),
      byType: new Map(),
      byStatus: new Map(),
      byDate: new Map(),
      byAmount: []
    };

    // Load all transactions from storage
    const allTransactions = this.loadAllTransactions();

    // Build indexes
    for (const transaction of allTransactions) {
      this.addToIndex(index, transaction);
    }

    // Sort amount index
    index.byAmount.sort((a, b) => a.amount - b.amount);

    this.index = index;
    this.lastIndexUpdate = Date.now();

    console.log(`Transaction index built in ${Date.now() - startTime}ms for ${allTransactions.length} transactions`);
  }

  /**
   * Query transactions using optimized indexes
   */
  static async queryTransactions(options: QueryOptions): Promise<QueryResult> {
    const startTime = Date.now();
    
    // Ensure index is built
    await this.buildIndex();
    
    if (!this.index) {
      throw new Error('Failed to build transaction index');
    }

    // Get candidate transaction IDs using indexes
    let candidateIds = this.getCandidateIds(options);

    // Load full transaction objects for candidates
    const transactions = this.loadTransactionsByIds(candidateIds);

    // Apply additional filters that couldn't be indexed
    let filteredTransactions = this.applyAdditionalFilters(transactions, options);

    // Sort results
    filteredTransactions = this.sortTransactions(filteredTransactions, options.sortBy, options.sortOrder);

    // Apply pagination
    const total = filteredTransactions.length;
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    return {
      transactions: paginatedTransactions,
      total,
      hasMore: offset + limit < total,
      queryTime: Date.now() - startTime
    };
  }

  /**
   * Get transaction statistics using indexes
   */
  static async getTransactionStats(userId?: string): Promise<{
    totalTransactions: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byWallet: Record<string, number>;
    totalAmount: number;
    averageAmount: number;
  }> {
    await this.buildIndex();
    
    if (!this.index) {
      throw new Error('Failed to build transaction index');
    }

    let transactionIds: string[];
    
    if (userId) {
      transactionIds = this.index.byUser.get(userId) || [];
    } else {
      // Get all transaction IDs
      transactionIds = Array.from(new Set([
        ...Array.from(this.index.byUser.values()).flat(),
      ]));
    }

    const transactions = this.loadTransactionsByIds(transactionIds);

    // Calculate statistics
    const stats = {
      totalTransactions: transactions.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byWallet: {} as Record<string, number>,
      totalAmount: 0,
      averageAmount: 0
    };

    for (const transaction of transactions) {
      // Count by type
      stats.byType[transaction.type] = (stats.byType[transaction.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[transaction.status] = (stats.byStatus[transaction.status] || 0) + 1;
      
      // Count by wallet
      const walletKey = `${transaction.walletType}:${transaction.walletId}`;
      stats.byWallet[walletKey] = (stats.byWallet[walletKey] || 0) + 1;
      
      // Sum amounts
      stats.totalAmount += transaction.amount;
    }

    stats.averageAmount = transactions.length > 0 ? stats.totalAmount / transactions.length : 0;

    return stats;
  }

  /**
   * Add new transaction to index
   */
  static addTransactionToIndex(transaction: MultiWalletTransaction): void {
    if (!this.index) {
      return; // Index will be built on next query
    }

    this.addToIndex(this.index, transaction);
    
    // Re-sort amount index
    this.index.byAmount.push({ id: transaction.id, amount: transaction.amount });
    this.index.byAmount.sort((a, b) => a.amount - b.amount);
  }

  /**
   * Remove transaction from index
   */
  static removeTransactionFromIndex(transactionId: string): void {
    if (!this.index) {
      return;
    }

    // Remove from all indexes
    for (const [, ids] of this.index.byUser) {
      const index = ids.indexOf(transactionId);
      if (index > -1) ids.splice(index, 1);
    }

    for (const [, ids] of this.index.byWallet) {
      const index = ids.indexOf(transactionId);
      if (index > -1) ids.splice(index, 1);
    }

    for (const [, ids] of this.index.byType) {
      const index = ids.indexOf(transactionId);
      if (index > -1) ids.splice(index, 1);
    }

    for (const [, ids] of this.index.byStatus) {
      const index = ids.indexOf(transactionId);
      if (index > -1) ids.splice(index, 1);
    }

    for (const [, ids] of this.index.byDate) {
      const index = ids.indexOf(transactionId);
      if (index > -1) ids.splice(index, 1);
    }

    // Remove from amount index
    const amountIndex = this.index.byAmount.findIndex(item => item.id === transactionId);
    if (amountIndex > -1) {
      this.index.byAmount.splice(amountIndex, 1);
    }
  }

  /**
   * Clear index (force rebuild on next query)
   */
  static clearIndex(): void {
    this.index = null;
    this.lastIndexUpdate = 0;
  }

  /**
   * Get index statistics
   */
  static getIndexStats(): {
    isBuilt: boolean;
    lastUpdate: number;
    age: number;
    userCount: number;
    walletCount: number;
    typeCount: number;
    statusCount: number;
  } {
    return {
      isBuilt: this.index !== null,
      lastUpdate: this.lastIndexUpdate,
      age: Date.now() - this.lastIndexUpdate,
      userCount: this.index?.byUser.size || 0,
      walletCount: this.index?.byWallet.size || 0,
      typeCount: this.index?.byType.size || 0,
      statusCount: this.index?.byStatus.size || 0
    };
  }

  // Private helper methods

  private static loadAllTransactions(): MultiWalletTransaction[] {
    const allTransactions: MultiWalletTransaction[] = [];
    
    // Load from global transactions storage
    const globalTransactions = StorageService.getItem<MultiWalletTransaction[]>(
      MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
    ) || [];
    
    allTransactions.push(...globalTransactions);

    // Also load from user-specific storages to ensure completeness
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-`)) {
        const userTransactions = StorageService.getItem<MultiWalletTransaction[]>(key) || [];
        
        // Avoid duplicates by checking IDs
        for (const transaction of userTransactions) {
          if (!allTransactions.some(t => t.id === transaction.id)) {
            allTransactions.push(transaction);
          }
        }
      }
    }

    // Parse dates
    return allTransactions.map(transaction => ({
      ...transaction,
      createdAt: new Date(transaction.createdAt)
    }));
  }

  private static addToIndex(index: TransactionIndex, transaction: MultiWalletTransaction): void {
    const transactionId = transaction.id;

    // Index by user
    if (!index.byUser.has(transaction.userId)) {
      index.byUser.set(transaction.userId, []);
    }
    index.byUser.get(transaction.userId)!.push(transactionId);

    // Index by wallet
    const walletKey = `${transaction.walletType}:${transaction.walletId}`;
    if (!index.byWallet.has(walletKey)) {
      index.byWallet.set(walletKey, []);
    }
    index.byWallet.get(walletKey)!.push(transactionId);

    // Index by type
    if (!index.byType.has(transaction.type)) {
      index.byType.set(transaction.type, []);
    }
    index.byType.get(transaction.type)!.push(transactionId);

    // Index by status
    if (!index.byStatus.has(transaction.status)) {
      index.byStatus.set(transaction.status, []);
    }
    index.byStatus.get(transaction.status)!.push(transactionId);

    // Index by date (daily buckets)
    const dateKey = new Date(transaction.createdAt).toISOString().split('T')[0];
    if (!index.byDate.has(dateKey)) {
      index.byDate.set(dateKey, []);
    }
    index.byDate.get(dateKey)!.push(transactionId);

    // Add to amount index
    index.byAmount.push({ id: transactionId, amount: transaction.amount });
  }

  private static getCandidateIds(options: QueryOptions): string[] {
    if (!this.index) return [];

    let candidateIds: string[] = [];
    let isFirstFilter = true;

    // Filter by user
    if (options.userId) {
      const userIds = this.index.byUser.get(options.userId) || [];
      candidateIds = isFirstFilter ? userIds : this.intersect(candidateIds, userIds);
      isFirstFilter = false;
    }

    // Filter by wallet
    if (options.walletType && options.walletId) {
      const walletKey = `${options.walletType}:${options.walletId}`;
      const walletIds = this.index.byWallet.get(walletKey) || [];
      candidateIds = isFirstFilter ? walletIds : this.intersect(candidateIds, walletIds);
      isFirstFilter = false;
    }

    // Filter by type
    if (options.type) {
      const typeIds = this.index.byType.get(options.type) || [];
      candidateIds = isFirstFilter ? typeIds : this.intersect(candidateIds, typeIds);
      isFirstFilter = false;
    }

    // Filter by status
    if (options.status) {
      const statusIds = this.index.byStatus.get(options.status) || [];
      candidateIds = isFirstFilter ? statusIds : this.intersect(candidateIds, statusIds);
      isFirstFilter = false;
    }

    // Filter by date range
    if (options.dateFrom || options.dateTo) {
      const dateIds = this.getDateRangeIds(options.dateFrom, options.dateTo);
      candidateIds = isFirstFilter ? dateIds : this.intersect(candidateIds, dateIds);
      isFirstFilter = false;
    }

    // If no filters applied, get all transaction IDs
    if (isFirstFilter) {
      candidateIds = Array.from(new Set([
        ...Array.from(this.index.byUser.values()).flat(),
      ]));
    }

    return candidateIds;
  }

  private static getDateRangeIds(dateFrom?: Date, dateTo?: Date): string[] {
    if (!this.index) return [];

    const ids: string[] = [];
    
    for (const [dateKey, transactionIds] of this.index.byDate) {
      const date = new Date(dateKey);
      
      if (dateFrom && date < dateFrom) continue;
      if (dateTo && date > dateTo) continue;
      
      ids.push(...transactionIds);
    }

    return ids;
  }

  private static intersect(arr1: string[], arr2: string[]): string[] {
    const set2 = new Set(arr2);
    return arr1.filter(id => set2.has(id));
  }

  private static loadTransactionsByIds(ids: string[]): MultiWalletTransaction[] {
    const transactions: MultiWalletTransaction[] = [];
    const transactionMap = new Map<string, MultiWalletTransaction>();

    // Load all transactions and create a map for quick lookup
    const allTransactions = this.loadAllTransactions();
    for (const transaction of allTransactions) {
      transactionMap.set(transaction.id, transaction);
    }

    // Get transactions by IDs
    for (const id of ids) {
      const transaction = transactionMap.get(id);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private static applyAdditionalFilters(
    transactions: MultiWalletTransaction[],
    options: QueryOptions
  ): MultiWalletTransaction[] {
    return transactions.filter(transaction => {
      // Amount range filter
      if (options.amountMin !== undefined && transaction.amount < options.amountMin) return false;
      if (options.amountMax !== undefined && transaction.amount > options.amountMax) return false;
      
      return true;
    });
  }

  private static sortTransactions(
    transactions: MultiWalletTransaction[],
    sortBy: QueryOptions['sortBy'] = 'createdAt',
    sortOrder: QueryOptions['sortOrder'] = 'desc'
  ): MultiWalletTransaction[] {
    return transactions.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}