// Multi-Wallet Service for managing dynamic wallet system

import type { 
  MultiWallet, 
  GoldWalletBalance, 
  SuspendedDeposit, 
  MultiWalletTransaction, 
  GameRealm,
  MultiWalletErrorType
} from '../types';
import { StorageService } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';
import { WalletService } from './walletService';

// Multi-Wallet Error Class
export class MultiWalletError extends Error {
  public type: MultiWalletErrorType;
  public details?: Record<string, any>;
  
  constructor(
    type: MultiWalletErrorType,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MultiWalletError';
    this.type = type;
    this.details = details;
  }
}

export class MultiWalletService {
  // ===== WALLET MANAGEMENT =====
  
  /**
   * Get user's multi-wallet, creating default if doesn't exist
   */
  static getMultiWallet(userId: string): MultiWallet {
    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
    const existingWallet = StorageService.getItem<MultiWallet>(walletKey);
    
    if (existingWallet) {
      // Ensure dates are properly parsed
      existingWallet.updatedAt = new Date(existingWallet.updatedAt);
      
      // Parse suspended deposit dates
      Object.values(existingWallet.goldWallets).forEach(goldWallet => {
        goldWallet.suspendedDeposits.forEach(deposit => {
          deposit.depositedAt = new Date(deposit.depositedAt);
          deposit.withdrawableAt = new Date(deposit.withdrawableAt);
        });
      });
      
      return existingWallet;
    }
    
    // Create default multi-wallet
    const defaultWallet: MultiWallet = {
      userId,
      staticWallets: {
        usd: { balance: 0, currency: 'usd' },
        toman: { balance: 0, currency: 'toman' }
      },
      goldWallets: {},
      updatedAt: new Date()
    };
    
    // Save and return
    this.saveMultiWallet(defaultWallet);
    return defaultWallet;
  }
  
  /**
   * Save multi-wallet to storage
   */
  private static saveMultiWallet(wallet: MultiWallet): void {
    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${wallet.userId}`;
    wallet.updatedAt = new Date();
    StorageService.setItem(walletKey, wallet);
  }
  
  /**
   * Create a new gold wallet for a specific realm
   */
  static async createGoldWallet(userId: string, realmId: string): Promise<MultiWallet> {
    const wallet = this.getMultiWallet(userId);
    
    // Check if wallet already exists
    if (wallet.goldWallets[realmId]) {
      throw new MultiWalletError(
        'DUPLICATE_WALLET',
        'Gold wallet for this realm already exists',
        { realmId }
      );
    }
    
    // Get realm information
    const realm = this.getGameRealm(realmId);
    if (!realm) {
      throw new MultiWalletError(
        'REALM_NOT_FOUND',
        'Game realm not found',
        { realmId }
      );
    }
    
    // Create new gold wallet
    const goldWallet: GoldWalletBalance = {
      realmId: realm.id,
      realmName: realm.realmName,
      gameName: realm.gameName,
      suspendedGold: 0,
      withdrawableGold: 0,
      totalGold: 0,
      suspendedDeposits: []
    };
    
    wallet.goldWallets[realmId] = goldWallet;
    this.saveMultiWallet(wallet);
    
    return wallet;
  }
  
  /**
   * Remove a gold wallet (only if balance is zero or with confirmation)
   */
  static async removeGoldWallet(userId: string, realmId: string, forceRemove: boolean = false): Promise<MultiWallet> {
    const wallet = this.getMultiWallet(userId);
    
    const goldWallet = wallet.goldWallets[realmId];
    if (!goldWallet) {
      throw new MultiWalletError(
        'WALLET_NOT_FOUND',
        'Gold wallet not found',
        { realmId }
      );
    }
    
    // Check if wallet has balance
    if (goldWallet.totalGold > 0 && !forceRemove) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        'Cannot remove wallet with non-zero balance without confirmation',
        { balance: goldWallet.totalGold, realmId }
      );
    }
    
    // Remove the wallet
    delete wallet.goldWallets[realmId];
    this.saveMultiWallet(wallet);
    
    return wallet;
  }
  
  // ===== BALANCE OPERATIONS =====
  
  /**
   * Update static wallet balance (USD, Toman)
   */
  static async updateStaticBalance(
    userId: string, 
    currency: 'usd' | 'toman', 
    amount: number
  ): Promise<MultiWallet> {
    const wallet = this.getMultiWallet(userId);
    
    const newBalance = wallet.staticWallets[currency].balance + amount;
    if (newBalance < 0) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        `Insufficient ${currency.toUpperCase()} balance`,
        { currentBalance: wallet.staticWallets[currency].balance, requestedAmount: amount }
      );
    }
    
    wallet.staticWallets[currency].balance = newBalance;
    this.saveMultiWallet(wallet);
    
    return wallet;
  }
  
  /**
   * Update gold wallet balance
   */
  static async updateGoldBalance(
    userId: string, 
    realmId: string, 
    suspendedAmount: number, 
    withdrawableAmount: number
  ): Promise<MultiWallet> {
    const wallet = this.getMultiWallet(userId);
    
    const goldWallet = wallet.goldWallets[realmId];
    if (!goldWallet) {
      throw new MultiWalletError(
        'WALLET_NOT_FOUND',
        'Gold wallet not found',
        { realmId }
      );
    }
    
    const newSuspended = goldWallet.suspendedGold + suspendedAmount;
    const newWithdrawable = goldWallet.withdrawableGold + withdrawableAmount;
    
    if (newSuspended < 0 || newWithdrawable < 0) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        'Insufficient gold balance',
        { 
          currentSuspended: goldWallet.suspendedGold, 
          currentWithdrawable: goldWallet.withdrawableGold,
          requestedSuspended: suspendedAmount,
          requestedWithdrawable: withdrawableAmount
        }
      );
    }
    
    goldWallet.suspendedGold = newSuspended;
    goldWallet.withdrawableGold = newWithdrawable;
    goldWallet.totalGold = newSuspended + newWithdrawable;
    
    this.saveMultiWallet(wallet);
    return wallet;
  }
  
  // ===== MIGRATION UTILITIES =====
  
  /**
   * Migrate old wallet format to multi-wallet format
   */
  static migrateToMultiWallet(userId: string): MultiWallet {
    // Get existing wallet using old service
    const oldWallet = WalletService.getWallet(userId);
    
    // Create multi-wallet structure
    const multiWallet: MultiWallet = {
      userId,
      staticWallets: {
        usd: { balance: oldWallet.balances.usd || 0, currency: 'usd' },
        toman: { balance: oldWallet.balances.toman || 0, currency: 'toman' }
      },
      goldWallets: {},
      updatedAt: new Date()
    };
    
    // If there's existing gold, create a default gold wallet
    if (oldWallet.balances.gold && oldWallet.balances.gold > 0) {
      multiWallet.goldWallets['default-gold'] = {
        realmId: 'default-gold',
        realmName: 'General Gold',
        gameName: 'Multi-Game',
        suspendedGold: 0,
        withdrawableGold: oldWallet.balances.gold,
        totalGold: oldWallet.balances.gold,
        suspendedDeposits: []
      };
    }
    
    // Save the new wallet
    this.saveMultiWallet(multiWallet);
    
    return multiWallet;
  }
  
  /**
   * Check if user needs migration
   */
  static needsMigration(userId: string): boolean {
    const walletKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS}-${userId}`;
    return !StorageService.hasItem(walletKey);
  }
  
  /**
   * Get wallet with automatic migration if needed
   */
  static getWalletWithMigration(userId: string): MultiWallet {
    if (this.needsMigration(userId)) {
      return this.migrateToMultiWallet(userId);
    }
    return this.getMultiWallet(userId);
  }
  
  // ===== HELPER METHODS =====
  
  /**
   * Get game realm information
   */
  private static getGameRealm(realmId: string): GameRealm | null {
    const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
    return realms.find(realm => realm.id === realmId) || null;
  }
  
  /**
   * Get all available game realms
   */
  static getAvailableRealms(): GameRealm[] {
    const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
    return realms.filter(realm => realm.isActive);
  }
  
  /**
   * Get user's gold wallet IDs
   */
  static getUserGoldWalletIds(userId: string): string[] {
    const wallet = this.getMultiWallet(userId);
    return Object.keys(wallet.goldWallets);
  }
  
  /**
   * Get total balance across all wallets for a currency type
   */
  static getTotalBalance(userId: string, currency: 'usd' | 'toman' | 'gold'): number {
    const wallet = this.getMultiWallet(userId);
    
    if (currency === 'usd' || currency === 'toman') {
      return wallet.staticWallets[currency].balance;
    }
    
    if (currency === 'gold') {
      return Object.values(wallet.goldWallets).reduce(
        (total, goldWallet) => total + goldWallet.totalGold, 
        0
      );
    }
    
    return 0;
  }
  
  /**
   * Get withdrawable gold balance across all gold wallets
   */
  static getTotalWithdrawableGold(userId: string): number {
    const wallet = this.getMultiWallet(userId);
    return Object.values(wallet.goldWallets).reduce(
      (total, goldWallet) => total + goldWallet.withdrawableGold, 
      0
    );
  }
  
  /**
   * Get suspended gold balance across all gold wallets
   */
  static getTotalSuspendedGold(userId: string): number {
    const wallet = this.getMultiWallet(userId);
    return Object.values(wallet.goldWallets).reduce(
      (total, goldWallet) => total + goldWallet.suspendedGold, 
      0
    );
  }
  
  // ===== SUSPENDED GOLD MANAGEMENT =====
  
  /**
   * Add suspended gold deposit (admin function)
   */
  static async addSuspendedGold(
    userId: string, 
    realmId: string, 
    amount: number, 
    adminId: string
  ): Promise<MultiWallet> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Deposit amount must be positive',
        { amount }
      );
    }
    
    const wallet = this.getMultiWallet(userId);
    
    // Ensure gold wallet exists
    if (!wallet.goldWallets[realmId]) {
      await this.createGoldWallet(userId, realmId);
      // Refresh wallet after creation
      const updatedWallet = this.getMultiWallet(userId);
      wallet.goldWallets[realmId] = updatedWallet.goldWallets[realmId];
    }
    
    const goldWallet = wallet.goldWallets[realmId];
    
    // Create suspended deposit record
    const depositId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const depositedAt = new Date();
    const withdrawableAt = new Date(depositedAt.getTime() + (2 * 30 * 24 * 60 * 60 * 1000)); // 2 months
    
    const suspendedDeposit: SuspendedDeposit = {
      id: depositId,
      amount,
      depositedAt,
      withdrawableAt,
      depositedBy: adminId,
      status: 'suspended'
    };
    
    // Add to suspended deposits
    goldWallet.suspendedDeposits.push(suspendedDeposit);
    
    // Update balances
    goldWallet.suspendedGold += amount;
    goldWallet.totalGold = goldWallet.suspendedGold + goldWallet.withdrawableGold;
    
    // Save wallet
    this.saveMultiWallet(wallet);
    
    // Create transaction record
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'gold',
      walletId: realmId,
      type: 'admin_deposit',
      amount,
      currency: 'gold',
      goldType: 'suspended',
      status: 'completed',
      approvedBy: adminId,
      metadata: {
        depositId,
        suspensionPeriodMonths: 2,
        withdrawableAt: withdrawableAt.toISOString()
      },
      createdAt: new Date()
    };
    
    this.saveMultiWalletTransaction(transaction);
    
    return wallet;
  }
  
  /**
   * Process suspended gold expiry (convert suspended to withdrawable)
   */
  static async processSuspendedGoldExpiry(): Promise<void> {
    const now = new Date();
    const allWalletKeys = this.getAllMultiWalletKeys();
    
    for (const walletKey of allWalletKeys) {
      const wallet = StorageService.getItem<MultiWallet>(walletKey);
      if (!wallet) continue;
      
      let walletUpdated = false;
      
      // Process each gold wallet
      for (const goldWallet of Object.values(wallet.goldWallets)) {
        let goldWalletUpdated = false;
        
        // Check each suspended deposit
        for (const deposit of goldWallet.suspendedDeposits) {
          if (deposit.status === 'suspended' && new Date(deposit.withdrawableAt) <= now) {
            // Convert to withdrawable
            deposit.status = 'withdrawable';
            goldWallet.suspendedGold -= deposit.amount;
            goldWallet.withdrawableGold += deposit.amount;
            goldWalletUpdated = true;
            
            // Create transaction record for the conversion
            const transaction: MultiWalletTransaction = {
              id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
              userId: wallet.userId,
              walletType: 'gold',
              walletId: goldWallet.realmId,
              type: 'conversion',
              amount: deposit.amount,
              currency: 'gold',
              goldType: 'withdrawable',
              status: 'completed',
              metadata: {
                conversionType: 'suspended_to_withdrawable',
                originalDepositId: deposit.id,
                autoProcessed: true
              },
              createdAt: new Date()
            };
            
            this.saveMultiWalletTransaction(transaction);
          }
        }
        
        if (goldWalletUpdated) {
          // Recalculate total
          goldWallet.totalGold = goldWallet.suspendedGold + goldWallet.withdrawableGold;
          walletUpdated = true;
        }
      }
      
      if (walletUpdated) {
        wallet.updatedAt = new Date();
        StorageService.setItem(walletKey, wallet);
      }
    }
  }
  
  /**
   * Get suspended gold status for a specific wallet
   */
  static getSuspendedGoldStatus(userId: string, realmId: string): SuspendedDeposit[] {
    const wallet = this.getMultiWallet(userId);
    const goldWallet = wallet.goldWallets[realmId];
    
    if (!goldWallet) {
      return [];
    }
    
    return goldWallet.suspendedDeposits.map(deposit => ({
      ...deposit,
      depositedAt: new Date(deposit.depositedAt),
      withdrawableAt: new Date(deposit.withdrawableAt)
    }));
  }
  
  /**
   * Get all suspended deposits across all wallets for a user
   */
  static getAllSuspendedDeposits(userId: string): Array<SuspendedDeposit & { realmId: string; realmName: string }> {
    const wallet = this.getMultiWallet(userId);
    const allDeposits: Array<SuspendedDeposit & { realmId: string; realmName: string }> = [];
    
    Object.values(wallet.goldWallets).forEach(goldWallet => {
      goldWallet.suspendedDeposits.forEach(deposit => {
        allDeposits.push({
          ...deposit,
          realmId: goldWallet.realmId,
          realmName: goldWallet.realmName,
          depositedAt: new Date(deposit.depositedAt),
          withdrawableAt: new Date(deposit.withdrawableAt)
        });
      });
    });
    
    return allDeposits.sort((a, b) => b.depositedAt.getTime() - a.depositedAt.getTime());
  }
  
  /**
   * Get time remaining until gold becomes withdrawable
   */
  static getTimeUntilWithdrawable(deposit: SuspendedDeposit): number {
    const now = new Date();
    const withdrawableAt = new Date(deposit.withdrawableAt);
    return Math.max(0, withdrawableAt.getTime() - now.getTime());
  }
  
  /**
   * Check if suspended gold can be withdrawn
   */
  static canWithdrawSuspendedGold(deposit: SuspendedDeposit): boolean {
    return new Date() >= new Date(deposit.withdrawableAt);
  }
  
  // ===== TRANSACTION MANAGEMENT =====
  
  /**
   * Save multi-wallet transaction
   */
  private static saveMultiWalletTransaction(transaction: MultiWalletTransaction): void {
    // Save individual user transactions
    const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${transaction.userId}`;
    const userTransactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];
    userTransactions.push(transaction);
    StorageService.setItem(userTransactionKey, userTransactions);
    
    // Save all transactions for admin access
    const allTransactions = StorageService.getItem<MultiWalletTransaction[]>(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS) || [];
    allTransactions.push(transaction);
    StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, allTransactions);
  }
  
  /**
   * Get user's multi-wallet transactions
   */
  static getMultiWalletTransactions(userId: string): MultiWalletTransaction[] {
    const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${userId}`;
    const transactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];
    
    // Ensure dates are properly parsed
    return transactions.map(transaction => ({
      ...transaction,
      createdAt: new Date(transaction.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /**
   * Get all wallet keys for processing
   */
  private static getAllMultiWalletKeys(): string[] {
    const keys: string[] = [];
    const prefix = MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  }
  
  // ===== CONVERSION SYSTEM =====
  
  /**
   * Convert suspended gold to fiat currency with fees
   */
  static async convertSuspendedGoldToFiat(
    userId: string, 
    realmId: string, 
    amount: number, 
    targetCurrency: 'usd' | 'toman'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Conversion amount must be positive',
        { amount }
      );
    }
    
    const wallet = this.getMultiWallet(userId);
    const goldWallet = wallet.goldWallets[realmId];
    
    if (!goldWallet) {
      throw new MultiWalletError(
        'WALLET_NOT_FOUND',
        'Gold wallet not found',
        { realmId }
      );
    }
    
    if (goldWallet.suspendedGold < amount) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        'Insufficient suspended gold balance',
        { 
          available: goldWallet.suspendedGold, 
          requested: amount,
          realmId 
        }
      );
    }
    
    // Import ConversionFeeService dynamically to avoid circular dependency
    const { ConversionFeeService } = await import('./conversionFeeService');
    const { EXCHANGE_RATES } = await import('./walletService');
    
    // Calculate conversion with fees
    const feeCalculation = ConversionFeeService.applyConversionFee(amount, targetCurrency);
    
    // Get exchange rate from gold to target currency
    const exchangeRateKey = `gold_to_${targetCurrency}` as keyof typeof EXCHANGE_RATES;
    const exchangeRate = EXCHANGE_RATES[exchangeRateKey];
    
    if (!exchangeRate) {
      throw new MultiWalletError(
        'CONVERSION_FEE_ERROR',
        'Exchange rate not available',
        { fromCurrency: 'gold', toCurrency: targetCurrency }
      );
    }
    
    // Calculate final amounts
    const goldAfterFee = feeCalculation.netAmount;
    const fiatAmount = goldAfterFee * exchangeRate;
    
    // Update gold wallet
    goldWallet.suspendedGold -= amount;
    goldWallet.totalGold = goldWallet.suspendedGold + goldWallet.withdrawableGold;
    
    // Update static wallet
    wallet.staticWallets[targetCurrency].balance += fiatAmount;
    
    // Save wallet
    this.saveMultiWallet(wallet);
    
    // Create transaction record
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'static',
      walletId: targetCurrency,
      type: 'conversion',
      amount: fiatAmount,
      currency: targetCurrency,
      status: 'completed',
      conversionFee: feeCalculation.feeAmount,
      fromWallet: realmId,
      toWallet: targetCurrency,
      metadata: {
        originalGoldAmount: amount,
        goldAfterFee: goldAfterFee,
        exchangeRate,
        feePercentage: ConversionFeeService.getConversionFeePercentage(targetCurrency),
        conversionType: 'suspended_gold_to_fiat'
      },
      createdAt: new Date()
    };
    
    this.saveMultiWalletTransaction(transaction);
    
    return { transaction, wallet };
  }
  
  /**
   * Convert between gold wallets (realm to realm)
   */
  static async convertBetweenGoldWallets(
    userId: string, 
    fromRealmId: string, 
    toRealmId: string, 
    amount: number, 
    goldType: 'suspended' | 'withdrawable'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Conversion amount must be positive',
        { amount }
      );
    }
    
    if (fromRealmId === toRealmId) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Cannot convert to the same wallet',
        { fromRealmId, toRealmId }
      );
    }
    
    const wallet = this.getMultiWallet(userId);
    
    // Check source wallet
    const fromWallet = wallet.goldWallets[fromRealmId];
    if (!fromWallet) {
      throw new MultiWalletError(
        'WALLET_NOT_FOUND',
        'Source gold wallet not found',
        { realmId: fromRealmId }
      );
    }
    
    // Check balance
    const availableBalance = goldType === 'suspended' 
      ? fromWallet.suspendedGold 
      : fromWallet.withdrawableGold;
    
    if (availableBalance < amount) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        `Insufficient ${goldType} gold balance`,
        { 
          available: availableBalance, 
          requested: amount,
          goldType,
          fromRealmId 
        }
      );
    }
    
    // Ensure destination wallet exists
    if (!wallet.goldWallets[toRealmId]) {
      await this.createGoldWallet(userId, toRealmId);
      // Refresh wallet after creation
      const updatedWallet = this.getMultiWallet(userId);
      wallet.goldWallets[toRealmId] = updatedWallet.goldWallets[toRealmId];
    }
    
    const toWallet = wallet.goldWallets[toRealmId];
    
    // Perform conversion (1:1 ratio for gold to gold)
    if (goldType === 'suspended') {
      fromWallet.suspendedGold -= amount;
      toWallet.suspendedGold += amount;
    } else {
      fromWallet.withdrawableGold -= amount;
      toWallet.withdrawableGold += amount;
    }
    
    // Update totals
    fromWallet.totalGold = fromWallet.suspendedGold + fromWallet.withdrawableGold;
    toWallet.totalGold = toWallet.suspendedGold + toWallet.withdrawableGold;
    
    // Save wallet
    this.saveMultiWallet(wallet);
    
    // Create transaction record
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'gold',
      walletId: toRealmId,
      type: 'conversion',
      amount,
      currency: 'gold',
      goldType,
      status: 'completed',
      fromWallet: fromRealmId,
      toWallet: toRealmId,
      metadata: {
        conversionType: 'gold_to_gold',
        goldType,
        exchangeRate: 1.0
      },
      createdAt: new Date()
    };
    
    this.saveMultiWalletTransaction(transaction);
    
    return { transaction, wallet };
  }
  
  /**
   * Get conversion preview (without executing)
   */
  static async getConversionPreview(
    amount: number, 
    fromCurrency: 'gold', 
    toCurrency: 'usd' | 'toman',
    goldType: 'suspended' | 'withdrawable'
  ): Promise<{
    originalAmount: number;
    feeAmount: number;
    netGoldAmount: number;
    exchangeRate: number;
    finalFiatAmount: number;
    feePercentage: number;
  }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Amount must be positive',
        { amount }
      );
    }
    
    // Import services
    const { ConversionFeeService } = await import('./conversionFeeService');
    const { EXCHANGE_RATES } = await import('./walletService');
    
    // Calculate fees (only for suspended gold)
    const feeCalculation = goldType === 'suspended' 
      ? ConversionFeeService.applyConversionFee(amount, toCurrency)
      : { convertedAmount: amount, feeAmount: 0, netAmount: amount };
    
    // Get exchange rate
    const exchangeRateKey = `${fromCurrency}_to_${toCurrency}` as keyof typeof EXCHANGE_RATES;
    const exchangeRate = EXCHANGE_RATES[exchangeRateKey];
    
    if (!exchangeRate) {
      throw new MultiWalletError(
        'CONVERSION_FEE_ERROR',
        'Exchange rate not available',
        { fromCurrency, toCurrency }
      );
    }
    
    const finalFiatAmount = feeCalculation.netAmount * exchangeRate;
    const feePercentage = goldType === 'suspended' 
      ? ConversionFeeService.getConversionFeePercentage(toCurrency)
      : 0;
    
    return {
      originalAmount: amount,
      feeAmount: feeCalculation.feeAmount,
      netGoldAmount: feeCalculation.netAmount,
      exchangeRate,
      finalFiatAmount,
      feePercentage
    };
  }
}