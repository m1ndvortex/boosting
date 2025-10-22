// Multi-Wallet Transaction Service for comprehensive transaction management

import type { 
  MultiWalletTransaction, 
  MultiWallet
} from '../types';
import { StorageService } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';
import { MultiWalletService, MultiWalletError } from './multiWalletService';
import { TransactionIndexService } from './transactionIndexService';
import { CacheService } from './cacheService';

import { EXCHANGE_RATES } from './walletService';

export class MultiWalletTransactionService {
  
  // ===== TRANSACTION CREATION =====
  
  /**
   * Create a deposit transaction for static wallets (USD, Toman)
   */
  static async createStaticWalletDeposit(
    userId: string,
    currency: 'usd' | 'toman',
    amount: number,
    paymentMethod: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Deposit amount must be positive',
        { amount }
      );
    }

    // Update wallet balance
    const wallet = await MultiWalletService.updateStaticBalance(userId, currency, amount);

    // Create transaction record
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'static',
      walletId: currency,
      type: 'deposit',
      amount,
      currency,
      status: 'completed',
      paymentMethod,
      metadata: {
        depositMethod: paymentMethod,
        walletType: 'static'
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create a withdrawal request for static wallets
   */
  static async createStaticWalletWithdrawal(
    userId: string,
    currency: 'usd' | 'toman',
    amount: number,
    paymentMethod: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Withdrawal amount must be positive',
        { amount }
      );
    }

    const wallet = MultiWalletService.getMultiWallet(userId);
    
    // Check balance
    if (wallet.staticWallets[currency].balance < amount) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        `Insufficient ${currency.toUpperCase()} balance`,
        { 
          available: wallet.staticWallets[currency].balance, 
          requested: amount 
        }
      );
    }

    // Create pending withdrawal transaction (don't deduct balance until approved)
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'static',
      walletId: currency,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending_approval',
      paymentMethod,
      metadata: {
        withdrawalMethod: paymentMethod,
        walletType: 'static',
        pendingApproval: true
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create a gold wallet deposit (for withdrawable gold)
   */
  static async createGoldWalletDeposit(
    userId: string,
    realmId: string,
    amount: number,
    goldType: 'suspended' | 'withdrawable' = 'withdrawable'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Deposit amount must be positive',
        { amount }
      );
    }

    // Update gold wallet balance
    const suspendedAmount = goldType === 'suspended' ? amount : 0;
    const withdrawableAmount = goldType === 'withdrawable' ? amount : 0;
    
    const wallet = await MultiWalletService.updateGoldBalance(
      userId, 
      realmId, 
      suspendedAmount, 
      withdrawableAmount
    );

    // Create transaction record
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'gold',
      walletId: realmId,
      type: 'deposit',
      amount,
      currency: 'gold',
      goldType,
      status: 'completed',
      metadata: {
        realmId,
        goldType,
        walletType: 'gold'
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create a gold wallet withdrawal request
   */
  static async createGoldWalletWithdrawal(
    userId: string,
    realmId: string,
    amount: number,
    goldType: 'suspended' | 'withdrawable' = 'withdrawable'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Withdrawal amount must be positive',
        { amount }
      );
    }

    const wallet = MultiWalletService.getMultiWallet(userId);
    const goldWallet = wallet.goldWallets[realmId];

    if (!goldWallet) {
      throw new MultiWalletError(
        'WALLET_NOT_FOUND',
        'Gold wallet not found',
        { realmId }
      );
    }

    // Check balance based on gold type
    const availableBalance = goldType === 'suspended' 
      ? goldWallet.suspendedGold 
      : goldWallet.withdrawableGold;

    if (availableBalance < amount) {
      throw new MultiWalletError(
        'INSUFFICIENT_BALANCE',
        `Insufficient ${goldType} gold balance`,
        { 
          available: availableBalance, 
          requested: amount,
          goldType,
          realmId 
        }
      );
    }

    // Prevent direct withdrawal of suspended gold
    if (goldType === 'suspended') {
      throw new MultiWalletError(
        'SUSPENDED_GOLD_RESTRICTION',
        'Suspended gold cannot be withdrawn directly. Convert to fiat currency instead.',
        { 
          amount,
          realmId,
          goldType: 'suspended'
        }
      );
    }

    // Create pending withdrawal transaction
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: 'gold',
      walletId: realmId,
      type: 'withdrawal',
      amount,
      currency: 'gold',
      goldType,
      status: 'pending_approval',
      metadata: {
        realmId,
        goldType,
        walletType: 'gold',
        pendingApproval: true
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create admin gold deposit with suspension
   */
  static async createAdminGoldDeposit(
    userId: string,
    realmId: string,
    amount: number,
    adminId: string,
    suspensionMonths: number = 2
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Deposit amount must be positive',
        { amount }
      );
    }

    // Use MultiWalletService to add suspended gold
    const wallet = await MultiWalletService.addSuspendedGold(userId, realmId, amount, adminId);

    // Create admin deposit transaction
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
        realmId,
        adminId,
        suspensionMonths,
        depositType: 'admin_suspended',
        withdrawableAt: new Date(Date.now() + (suspensionMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        walletType: 'gold'
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create purchase transaction (deduct from wallet)
   */
  static async createPurchaseTransaction(
    userId: string,
    walletType: 'static' | 'gold',
    walletId: string,
    amount: number,
    currency: 'usd' | 'toman' | 'gold',
    goldType?: 'suspended' | 'withdrawable',
    orderId?: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Purchase amount must be positive',
        { amount }
      );
    }

    let wallet: MultiWallet;

    if (walletType === 'static') {
      // Deduct from static wallet
      wallet = await MultiWalletService.updateStaticBalance(
        userId, 
        currency as 'usd' | 'toman', 
        -amount
      );
    } else {
      // Deduct from gold wallet
      if (!goldType) {
        throw new MultiWalletError(
          'INVALID_TRANSACTION',
          'Gold type must be specified for gold wallet purchases',
          { walletId, currency }
        );
      }

      const suspendedAmount = goldType === 'suspended' ? -amount : 0;
      const withdrawableAmount = goldType === 'withdrawable' ? -amount : 0;

      wallet = await MultiWalletService.updateGoldBalance(
        userId,
        walletId,
        suspendedAmount,
        withdrawableAmount
      );
    }

    // Create purchase transaction
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType,
      walletId,
      type: 'purchase',
      amount,
      currency,
      goldType,
      status: 'completed',
      metadata: {
        orderId,
        walletType,
        goldType,
        purchaseType: 'marketplace'
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create earning transaction (add to wallet)
   */
  static async createEarningTransaction(
    userId: string,
    walletType: 'static' | 'gold',
    walletId: string,
    amount: number,
    currency: 'usd' | 'toman' | 'gold',
    goldType: 'suspended' | 'withdrawable' = 'withdrawable',
    orderId?: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Earning amount must be positive',
        { amount }
      );
    }

    let wallet: MultiWallet;

    if (walletType === 'static') {
      // Add to static wallet
      wallet = await MultiWalletService.updateStaticBalance(
        userId, 
        currency as 'usd' | 'toman', 
        amount
      );
    } else {
      // Add to gold wallet (earnings are always withdrawable)
      wallet = await MultiWalletService.updateGoldBalance(
        userId,
        walletId,
        0, // suspended amount
        amount // withdrawable amount
      );
    }

    // Create earning transaction
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType,
      walletId,
      type: 'earning',
      amount,
      currency,
      goldType: goldType || 'withdrawable',
      status: 'completed',
      metadata: {
        orderId,
        walletType,
        goldType,
        earningType: 'marketplace'
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  /**
   * Create conversion transaction with fee tracking
   */
  static async createConversionTransaction(
    userId: string,
    fromWalletType: 'static' | 'gold',
    fromWalletId: string,
    toWalletType: 'static' | 'gold',
    toWalletId: string,
    amount: number,
    fromCurrency: 'usd' | 'toman' | 'gold',
    toCurrency: 'usd' | 'toman' | 'gold',
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<{ transaction: MultiWalletTransaction; wallet: MultiWallet }> {
    if (amount <= 0) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Conversion amount must be positive',
        { amount }
      );
    }

    let wallet: MultiWallet;
    let conversionFee = 0;
    let finalAmount = amount;

    // Handle different conversion types
    if (fromCurrency === 'gold' && goldType === 'suspended' && (toCurrency === 'usd' || toCurrency === 'toman')) {
      // Suspended gold to fiat conversion with fees
      const result = await MultiWalletService.convertSuspendedGoldToFiat(
        userId, 
        fromWalletId, 
        amount, 
        toCurrency
      );
      wallet = result.wallet;
      conversionFee = result.transaction.conversionFee || 0;
      finalAmount = result.transaction.amount;
    } else if (fromCurrency === 'gold' && toCurrency === 'gold') {
      // Gold to gold conversion (between realms)
      const result = await MultiWalletService.convertBetweenGoldWallets(
        userId,
        fromWalletId,
        toWalletId,
        amount,
        goldType || 'withdrawable'
      );
      wallet = result.wallet;
      finalAmount = amount; // 1:1 conversion for gold to gold
    } else {
      // Standard currency conversion
      wallet = await this.performStandardConversion(
        userId,
        fromWalletType,
        fromWalletId,
        toWalletType,
        toWalletId,
        amount,
        fromCurrency,
        toCurrency
      );
      
      // Calculate converted amount using exchange rates
      const exchangeRateKey = `${fromCurrency}_to_${toCurrency}` as keyof typeof EXCHANGE_RATES;
      const exchangeRate = EXCHANGE_RATES[exchangeRateKey];
      if (exchangeRate) {
        finalAmount = amount * exchangeRate;
      }
    }

    // Create conversion transaction
    const transaction: MultiWalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      walletType: toWalletType,
      walletId: toWalletId,
      type: 'conversion',
      amount: finalAmount,
      currency: toCurrency,
      goldType: toCurrency === 'gold' ? (goldType || 'withdrawable') : undefined,
      status: 'completed',
      conversionFee,
      fromWallet: fromWalletId,
      toWallet: toWalletId,
      metadata: {
        originalAmount: amount,
        fromCurrency,
        toCurrency,
        fromWalletType,
        toWalletType,
        goldType,
        exchangeRate: finalAmount / amount,
        conversionType: this.getConversionType(fromCurrency, toCurrency, goldType)
      },
      createdAt: new Date()
    };

    this.saveTransaction(transaction);
    return { transaction, wallet };
  }

  // ===== TRANSACTION MANAGEMENT =====

  /**
   * Approve a pending transaction
   */
  static async approveTransaction(
    transactionId: string,
    adminId: string
  ): Promise<{ transaction: MultiWalletTransaction; wallet?: MultiWallet }> {
    const transaction = this.getTransactionById(transactionId);
    
    if (!transaction) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Transaction not found',
        { transactionId }
      );
    }

    if (transaction.status !== 'pending_approval') {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Transaction is not pending approval',
        { transactionId, currentStatus: transaction.status }
      );
    }

    let wallet: MultiWallet | undefined;

    // Process the approved transaction
    if (transaction.type === 'withdrawal') {
      // Deduct balance for approved withdrawal
      if (transaction.walletType === 'static') {
        wallet = await MultiWalletService.updateStaticBalance(
          transaction.userId,
          transaction.currency as 'usd' | 'toman',
          -transaction.amount
        );
      } else {
        const suspendedAmount = transaction.goldType === 'suspended' ? -transaction.amount : 0;
        const withdrawableAmount = transaction.goldType === 'withdrawable' ? -transaction.amount : 0;
        
        wallet = await MultiWalletService.updateGoldBalance(
          transaction.userId,
          transaction.walletId,
          suspendedAmount,
          withdrawableAmount
        );
      }
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.approvedBy = adminId;
    transaction.metadata = {
      ...transaction.metadata,
      approvedAt: new Date().toISOString(),
      approvedBy: adminId
    };

    this.updateTransaction(transaction);

    return { transaction, wallet };
  }

  /**
   * Reject a pending transaction
   */
  static async rejectTransaction(
    transactionId: string,
    adminId: string,
    reason?: string
  ): Promise<MultiWalletTransaction> {
    const transaction = this.getTransactionById(transactionId);
    
    if (!transaction) {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Transaction not found',
        { transactionId }
      );
    }

    if (transaction.status !== 'pending_approval') {
      throw new MultiWalletError(
        'INVALID_TRANSACTION',
        'Transaction is not pending approval',
        { transactionId, currentStatus: transaction.status }
      );
    }

    // Update transaction status
    transaction.status = 'failed';
    transaction.approvedBy = adminId;
    transaction.metadata = {
      ...transaction.metadata,
      rejectedAt: new Date().toISOString(),
      rejectedBy: adminId,
      rejectionReason: reason
    };

    this.updateTransaction(transaction);
    return transaction;
  }

  // ===== TRANSACTION QUERIES =====

  /**
   * Get user transactions with filtering
   */
  static getUserTransactions(
    userId: string,
    filters?: {
      walletType?: 'static' | 'gold';
      walletId?: string;
      type?: MultiWalletTransaction['type'];
      status?: MultiWalletTransaction['status'];
      currency?: string;
      goldType?: 'suspended' | 'withdrawable';
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): MultiWalletTransaction[] {
    const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${userId}`;
    let transactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];

    // Parse dates
    transactions = transactions.map(transaction => ({
      ...transaction,
      createdAt: new Date(transaction.createdAt)
    }));

    // Apply filters
    if (filters) {
      transactions = transactions.filter(transaction => {
        if (filters.walletType && transaction.walletType !== filters.walletType) return false;
        if (filters.walletId && transaction.walletId !== filters.walletId) return false;
        if (filters.type && transaction.type !== filters.type) return false;
        if (filters.status && transaction.status !== filters.status) return false;
        if (filters.currency && transaction.currency !== filters.currency) return false;
        if (filters.goldType && transaction.goldType !== filters.goldType) return false;
        if (filters.dateFrom && transaction.createdAt < filters.dateFrom) return false;
        if (filters.dateTo && transaction.createdAt > filters.dateTo) return false;
        return true;
      });
    }

    return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get transactions for a specific wallet
   */
  static getWalletTransactions(
    userId: string,
    walletType: 'static' | 'gold',
    walletId: string
  ): MultiWalletTransaction[] {
    return this.getUserTransactions(userId, { walletType, walletId });
  }

  /**
   * Get pending transactions for admin approval
   */
  static getPendingTransactions(): MultiWalletTransaction[] {
    const allTransactions = StorageService.getItem<MultiWalletTransaction[]>(
      MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
    ) || [];

    return allTransactions
      .filter(transaction => transaction.status === 'pending_approval')
      .map(transaction => ({
        ...transaction,
        createdAt: new Date(transaction.createdAt)
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get transaction by ID
   */
  static getTransactionById(transactionId: string): MultiWalletTransaction | null {
    const allTransactions = StorageService.getItem<MultiWalletTransaction[]>(
      MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
    ) || [];

    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction) return null;

    return {
      ...transaction,
      createdAt: new Date(transaction.createdAt)
    };
  }

  /**
   * Get transaction statistics for a user
   */
  static getUserTransactionStats(userId: string): {
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalEarnings: number;
    totalPurchases: number;
    totalConversions: number;
    pendingWithdrawals: number;
    totalConversionFees: number;
  } {
    const transactions = this.getUserTransactions(userId);

    return {
      totalTransactions: transactions.length,
      totalDeposits: transactions.filter(t => t.type === 'deposit').length,
      totalWithdrawals: transactions.filter(t => t.type === 'withdrawal').length,
      totalEarnings: transactions.filter(t => t.type === 'earning').length,
      totalPurchases: transactions.filter(t => t.type === 'purchase').length,
      totalConversions: transactions.filter(t => t.type === 'conversion').length,
      pendingWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending_approval').length,
      totalConversionFees: transactions.reduce((sum, t) => sum + (t.conversionFee || 0), 0)
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Save transaction to storage and update indexes/cache
   */
  private static saveTransaction(transaction: MultiWalletTransaction): void {
    // Save individual user transactions
    const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${transaction.userId}`;
    const userTransactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];
    userTransactions.push(transaction);
    StorageService.setItem(userTransactionKey, userTransactions);

    // Save all transactions for admin access
    const allTransactions = StorageService.getItem<MultiWalletTransaction[]>(
      MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
    ) || [];
    allTransactions.push(transaction);
    StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, allTransactions);

    // Update transaction index
    TransactionIndexService.addTransactionToIndex(transaction);

    // Invalidate user transaction cache
    CacheService.invalidatePattern(`transactions:${transaction.userId}`);
  }

  /**
   * Update existing transaction and refresh indexes/cache
   */
  private static updateTransaction(transaction: MultiWalletTransaction): void {
    // Update in user transactions
    const userTransactionKey = `${MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS}-${transaction.userId}`;
    const userTransactions = StorageService.getItem<MultiWalletTransaction[]>(userTransactionKey) || [];
    const userIndex = userTransactions.findIndex(t => t.id === transaction.id);
    if (userIndex !== -1) {
      userTransactions[userIndex] = transaction;
      StorageService.setItem(userTransactionKey, userTransactions);
    }

    // Update in all transactions
    const allTransactions = StorageService.getItem<MultiWalletTransaction[]>(
      MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS
    ) || [];
    const allIndex = allTransactions.findIndex(t => t.id === transaction.id);
    if (allIndex !== -1) {
      allTransactions[allIndex] = transaction;
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS, allTransactions);
    }

    // Clear transaction index to force rebuild with updated data
    TransactionIndexService.clearIndex();

    // Invalidate user transaction cache
    CacheService.invalidatePattern(`transactions:${transaction.userId}`);
  }

  /**
   * Perform standard currency conversion
   */
  private static async performStandardConversion(
    userId: string,
    fromWalletType: 'static' | 'gold',
    fromWalletId: string,
    toWalletType: 'static' | 'gold',
    toWalletId: string,
    amount: number,
    fromCurrency: 'usd' | 'toman' | 'gold',
    toCurrency: 'usd' | 'toman' | 'gold'
  ): Promise<MultiWallet> {
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

    const convertedAmount = amount * exchangeRate;

    // Deduct from source wallet
    if (fromWalletType === 'static') {
      await MultiWalletService.updateStaticBalance(
        userId,
        fromCurrency as 'usd' | 'toman',
        -amount
      );
    } else {
      await MultiWalletService.updateGoldBalance(
        userId,
        fromWalletId,
        0,
        -amount
      );
    }

    // Add to destination wallet
    if (toWalletType === 'static') {
      return await MultiWalletService.updateStaticBalance(
        userId,
        toCurrency as 'usd' | 'toman',
        convertedAmount
      );
    } else {
      return await MultiWalletService.updateGoldBalance(
        userId,
        toWalletId,
        0,
        convertedAmount
      );
    }
  }

  /**
   * Get conversion type for metadata
   */
  private static getConversionType(
    fromCurrency: string,
    toCurrency: string,
    goldType?: 'suspended' | 'withdrawable'
  ): string {
    if (fromCurrency === 'gold' && goldType === 'suspended' && (toCurrency === 'usd' || toCurrency === 'toman')) {
      return 'suspended_gold_to_fiat';
    }
    if (fromCurrency === 'gold' && toCurrency === 'gold') {
      return 'gold_to_gold';
    }
    if ((fromCurrency === 'usd' || fromCurrency === 'toman') && (toCurrency === 'usd' || toCurrency === 'toman')) {
      return 'fiat_to_fiat';
    }
    if (fromCurrency === 'gold' && (toCurrency === 'usd' || toCurrency === 'toman')) {
      return 'gold_to_fiat';
    }
    if ((fromCurrency === 'usd' || fromCurrency === 'toman') && toCurrency === 'gold') {
      return 'fiat_to_gold';
    }
    return 'standard_conversion';
  }
}