// Wallet service for multi-currency wallet management

import type { Wallet, Transaction, Currency, TransactionEvidence } from '../types';
import { StorageService, STORAGE_KEYS } from './storage';

// Exchange rates (mock data)
export const EXCHANGE_RATES = {
  gold_to_usd: 0.0005, // 1 Gold = 0.0005 USD
  usd_to_gold: 2000,   // 1 USD = 2000 Gold
  usd_to_toman: 42000, // 1 USD = 42000 Toman
  toman_to_usd: 0.000024, // 1 Toman = 0.000024 USD
  gold_to_toman: 21,   // 1 Gold = 21 Toman
  toman_to_gold: 0.048, // 1 Toman = 0.048 Gold
};

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', icon: '💳', currencies: ['usd', 'toman'] },
  { id: 'crypto', name: 'Crypto Wallet', icon: '₿', currencies: ['usd'] },
  { id: 'iranian_bank', name: 'Iranian Bank Card', icon: '🏦', currencies: ['toman'] },
];

export class WalletService {
  // Get user wallet
  static getWallet(userId: string): Wallet {
    // Try the new format first (individual wallet keys)
    const walletKey = `${STORAGE_KEYS.WALLET}-${userId}`;
    const individualWallet = StorageService.getItem<Wallet>(walletKey);
    
    if (individualWallet) {
      return individualWallet;
    }
    
    // Fallback to old format (all wallets in one object)
    const wallets = StorageService.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET) || {};
    
    if (!wallets[userId]) {
      // Create default wallet
      const defaultWallet: Wallet = {
        userId,
        balances: { gold: 0, usd: 0, toman: 0 },
        updatedAt: new Date(),
      };
      
      // Save in new format
      StorageService.setItem(walletKey, defaultWallet);
      return defaultWallet;
    }
    
    return wallets[userId];
  }

  // Update wallet balances
  static updateWallet(userId: string, balances: Partial<{ gold: number; usd: number; toman: number }>): Wallet {
    const wallet = this.getWallet(userId);
    
    wallet.balances = { ...wallet.balances, ...balances };
    wallet.updatedAt = new Date();
    
    // Save in new format
    const walletKey = `${STORAGE_KEYS.WALLET}-${userId}`;
    StorageService.setItem(walletKey, wallet);
    
    return wallet;
  }

  // Deposit funds
  static async deposit(
    userId: string,
    amount: number,
    currency: Currency,
    paymentMethod: string
  ): Promise<{ transaction: Transaction; wallet: Wallet }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const wallet = this.getWallet(userId);
    const newBalance = wallet.balances[currency] + amount;
    
    // Create transaction record
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      walletId: userId,
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'completed', // Deposits are instant
      paymentMethod,
      createdAt: new Date(),
    };
    
    // Update wallet balance
    const updatedWallet = this.updateWallet(userId, { [currency]: newBalance });
    
    // Save transaction
    this.saveTransaction(transaction);
    
    return { transaction, wallet: updatedWallet };
  }

  // Request withdrawal
  static async requestWithdrawal(
    userId: string,
    amount: number,
    currency: Currency,
    paymentMethod: string,
    bankInfo?: import('../types').BankInformation,
    notes?: string,
    userEmail?: string
  ): Promise<{ transaction: Transaction; wallet: Wallet }> {
    const wallet = this.getWallet(userId);
    
    if (wallet.balances[currency] < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create pending withdrawal transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      walletId: userId,
      userId,
      userEmail,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending_approval', // Withdrawals require admin approval
      paymentMethod,
      bankInformation: bankInfo,
      requestNotes: notes,
      createdAt: new Date(),
    };
    
    // Don't deduct balance until approved
    this.saveTransaction(transaction);
    
    return { transaction, wallet };
  }

  // Convert currency
  static async convertCurrency(
    userId: string,
    fromCurrency: Currency,
    toCurrency: Currency,
    amount: number
  ): Promise<{ transaction: Transaction; wallet: Wallet }> {
    const wallet = this.getWallet(userId);
    
    if (wallet.balances[fromCurrency] < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Calculate conversion
    const rateKey = `${fromCurrency}_to_${toCurrency}` as keyof typeof EXCHANGE_RATES;
    const rate = EXCHANGE_RATES[rateKey];
    
    if (!rate) {
      throw new Error('Conversion rate not available');
    }
    
    const convertedAmount = amount * rate;
    
    // Update balances
    const newFromBalance = wallet.balances[fromCurrency] - amount;
    const newToBalance = wallet.balances[toCurrency] + convertedAmount;
    
    const updatedWallet = this.updateWallet(userId, {
      [fromCurrency]: newFromBalance,
      [toCurrency]: newToBalance,
    });
    
    // Create transaction record
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      walletId: userId,
      userId,
      type: 'conversion',
      amount: convertedAmount,
      currency: toCurrency,
      status: 'completed',
      createdAt: new Date(),
    };
    
    this.saveTransaction(transaction);
    
    return { transaction, wallet: updatedWallet };
  }

  // Deduct funds for purchase
  static async deductForPurchase(
    userId: string,
    amount: number,
    currency: Currency,
    _orderId: string
  ): Promise<{ transaction: Transaction; wallet: Wallet }> {
    const wallet = this.getWallet(userId);
    
    if (wallet.balances[currency] < amount) {
      throw new Error('Insufficient balance');
    }
    
    const newBalance = wallet.balances[currency] - amount;
    const updatedWallet = this.updateWallet(userId, { [currency]: newBalance });
    
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      walletId: userId,
      userId,
      type: 'purchase',
      amount,
      currency,
      status: 'completed',
      createdAt: new Date(),
    };
    
    this.saveTransaction(transaction);
    
    return { transaction, wallet: updatedWallet };
  }

  // Add earnings
  static async addEarnings(
    userId: string,
    amount: number,
    currency: Currency,
    _orderId: string
  ): Promise<{ transaction: Transaction; wallet: Wallet }> {
    const wallet = this.getWallet(userId);
    const newBalance = wallet.balances[currency] + amount;
    const updatedWallet = this.updateWallet(userId, { [currency]: newBalance });
    
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      walletId: userId,
      userId,
      type: 'earning',
      amount,
      currency,
      status: 'completed',
      createdAt: new Date(),
    };
    
    this.saveTransaction(transaction);
    
    return { transaction, wallet: updatedWallet };
  }

  // Get user transactions
  static getTransactions(userId: string): Transaction[] {
    // Try the new format first (individual user transactions)
    const transactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${userId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(transactionKey) || [];
    
    if (userTransactions.length > 0) {
      return userTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Fallback to old format (all transactions in one array)
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    return allTransactions
      .filter(t => t.walletId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Save transaction
  private static saveTransaction(transaction: Transaction): void {
    // Save in new format (individual user transactions)
    const transactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${transaction.walletId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(transactionKey) || [];
    userTransactions.push(transaction);
    StorageService.setItem(transactionKey, userTransactions);
    
    // Also save in old format for backward compatibility
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    allTransactions.push(transaction);
    StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);
  }

  // Get exchange rate
  static getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) return 1;
    
    const rateKey = `${fromCurrency}_to_${toCurrency}` as keyof typeof EXCHANGE_RATES;
    return EXCHANGE_RATES[rateKey] || 0;
  }

  // Get all exchange rates
  static getAllExchangeRates() {
    return EXCHANGE_RATES;
  }

  // Get payment methods for currency
  static getPaymentMethodsForCurrency(currency: Currency) {
    return PAYMENT_METHODS.filter(method => method.currencies.includes(currency));
  }

  // Get all payment methods
  static getAllPaymentMethods() {
    return PAYMENT_METHODS;
  }

  // Admin: Get all withdrawal requests (across all users)
  static getAllWithdrawalRequests(): Transaction[] {
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    return allTransactions
      .filter(t => t.type === 'withdrawal')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Admin: Approve withdrawal with transaction evidence
  static async approveWithdrawal(
    transactionId: string,
    evidence: TransactionEvidence,
    adminUserId: string
  ): Promise<Transaction> {
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    const transactionIndex = allTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const transaction = allTransactions[transactionIndex];
    
    if (transaction.type !== 'withdrawal') {
      throw new Error('Transaction is not a withdrawal');
    }

    // Update transaction
    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'completed',
      transactionEvidence: {
        ...evidence,
        processedBy: adminUserId,
        processedAt: new Date()
      },
      approvedBy: adminUserId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };

    // Save to all transactions
    allTransactions[transactionIndex] = updatedTransaction;
    StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);

    // Update in user-specific transactions
    const userTransactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${transaction.walletId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(userTransactionKey) || [];
    const userTxIndex = userTransactions.findIndex(t => t.id === transactionId);
    if (userTxIndex !== -1) {
      userTransactions[userTxIndex] = updatedTransaction;
      StorageService.setItem(userTransactionKey, userTransactions);
    }

    // Deduct balance from wallet
    const wallet = this.getWallet(transaction.walletId);
    if (wallet) {
      const currency = transaction.currency.toLowerCase();
      const currentBalance = (wallet[`${currency}Balance` as keyof typeof wallet] as unknown) as number;
      const newBalance = Math.max(0, currentBalance - transaction.amount);
      
      this.updateWallet(transaction.walletId, { [currency]: newBalance });
    }

    return updatedTransaction;
  }

  // Admin: Reject withdrawal
  static async rejectWithdrawal(
    transactionId: string,
    reason: string,
    adminUserId: string
  ): Promise<Transaction> {
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    const transactionIndex = allTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const transaction = allTransactions[transactionIndex];
    
    if (transaction.type !== 'withdrawal') {
      throw new Error('Transaction is not a withdrawal');
    }

    // Update transaction
    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: adminUserId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };

    // Save to all transactions
    allTransactions[transactionIndex] = updatedTransaction;
    StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);

    // Update in user-specific transactions
    const userTransactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${transaction.walletId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(userTransactionKey) || [];
    const userTxIndex = userTransactions.findIndex(t => t.id === transactionId);
    if (userTxIndex !== -1) {
      userTransactions[userTxIndex] = updatedTransaction;
      StorageService.setItem(userTransactionKey, userTransactions);
    }

    return updatedTransaction;
  }

  // Admin: Update transaction evidence (for editing existing evidence)
  static async updateTransactionEvidence(
    transactionId: string,
    evidence: Partial<TransactionEvidence>,
    adminUserId: string
  ): Promise<Transaction> {
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    const transactionIndex = allTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const transaction = allTransactions[transactionIndex];

    // Update transaction evidence
    const updatedTransaction: Transaction = {
      ...transaction,
      transactionEvidence: {
        ...transaction.transactionEvidence,
        ...evidence,
        processedBy: adminUserId,
        processedAt: new Date()
      } as TransactionEvidence,
      updatedAt: new Date()
    };

    // Save to all transactions
    allTransactions[transactionIndex] = updatedTransaction;
    StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);

    // Update in user-specific transactions
    const userTransactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${transaction.walletId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(userTransactionKey) || [];
    const userTxIndex = userTransactions.findIndex(t => t.id === transactionId);
    if (userTxIndex !== -1) {
      userTransactions[userTxIndex] = updatedTransaction;
      StorageService.setItem(userTransactionKey, userTransactions);
    }

    return updatedTransaction;
  }

  // Admin: Delete withdrawal request (only for pending requests)
  static async deleteWithdrawalRequest(transactionId: string): Promise<void> {
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    const transactionIndex = allTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const transaction = allTransactions[transactionIndex];
    
    if (transaction.type !== 'withdrawal') {
      throw new Error('Transaction is not a withdrawal');
    }

    if (transaction.status !== 'pending_approval') {
      throw new Error('Can only delete pending withdrawal requests');
    }

    // Remove from all transactions
    allTransactions.splice(transactionIndex, 1);
    StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);

    // Remove from user-specific transactions
    const userTransactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${transaction.walletId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(userTransactionKey) || [];
    const userTxIndex = userTransactions.findIndex(t => t.id === transactionId);
    if (userTxIndex !== -1) {
      userTransactions.splice(userTxIndex, 1);
      StorageService.setItem(userTransactionKey, userTransactions);
    }
  }

  // Admin: Update withdrawal status to processing
  static async setWithdrawalProcessing(
    transactionId: string,
    adminUserId: string
  ): Promise<Transaction> {
    const allTransactions = StorageService.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
    const transactionIndex = allTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    const transaction = allTransactions[transactionIndex];

    // Update transaction
    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'processing',
      updatedAt: new Date()
    };

    // Save to all transactions
    allTransactions[transactionIndex] = updatedTransaction;
    StorageService.setItem(STORAGE_KEYS.TRANSACTIONS, allTransactions);

    // Update in user-specific transactions
    const userTransactionKey = `${STORAGE_KEYS.TRANSACTIONS}-${transaction.walletId}`;
    const userTransactions = StorageService.getItem<Transaction[]>(userTransactionKey) || [];
    const userTxIndex = userTransactions.findIndex(t => t.id === transactionId);
    if (userTxIndex !== -1) {
      userTransactions[userTxIndex] = updatedTransaction;
      StorageService.setItem(userTransactionKey, userTransactions);
    }

    return updatedTransaction;
  }

  // ========================================
  // Bank Account Management Methods
  // ========================================

  // Save a new bank account for a user
  static saveBankAccount(
    userId: string,
    bankInfo: import('../types').BankInformation & { nickname?: string },
    setAsDefault: boolean = false
  ): void {
    const accounts = this.getBankAccounts(userId);
    
    const newAccount = {
      id: `bank_${userId}_${Date.now()}`,
      userId,
      ...bankInfo,
      isDefault: setAsDefault || accounts.length === 0, // First account is default
      createdAt: new Date().toISOString(),
    };

    // If setting as default, unmark other accounts
    if (newAccount.isDefault) {
      accounts.forEach(acc => acc.isDefault = false);
    }

    accounts.push(newAccount);
    
    const key = `${STORAGE_KEYS.WALLET}-bank-accounts-${userId}`;
    StorageService.setItem(key, accounts);
  }

  // Get all bank accounts for a user
  static getBankAccounts(userId: string): Array<{
    id: string;
    userId: string;
    nickname?: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    cardNumber?: string;
    iban?: string;
    swiftCode?: string;
    additionalInfo?: string;
    isDefault: boolean;
    createdAt: string;
  }> {
    const key = `${STORAGE_KEYS.WALLET}-bank-accounts-${userId}`;
    return StorageService.getItem(key) || [];
  }

  // Update an existing bank account
  static updateBankAccount(
    userId: string,
    accountId: string,
    updates: Partial<import('../types').BankInformation & { nickname?: string }>
  ): void {
    const accounts = this.getBankAccounts(userId);
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex === -1) {
      throw new Error('Bank account not found');
    }

    accounts[accountIndex] = {
      ...accounts[accountIndex],
      ...updates,
    };

    const key = `${STORAGE_KEYS.WALLET}-bank-accounts-${userId}`;
    StorageService.setItem(key, accounts);
  }

  // Delete a bank account
  static deleteBankAccount(userId: string, accountId: string): void {
    const accounts = this.getBankAccounts(userId);
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex === -1) {
      throw new Error('Bank account not found');
    }

    const wasDefault = accounts[accountIndex].isDefault;
    accounts.splice(accountIndex, 1);

    // If deleted account was default, set the first remaining as default
    if (wasDefault && accounts.length > 0) {
      accounts[0].isDefault = true;
    }

    const key = `${STORAGE_KEYS.WALLET}-bank-accounts-${userId}`;
    StorageService.setItem(key, accounts);
  }

  // Set a bank account as default
  static setDefaultBankAccount(userId: string, accountId: string): void {
    const accounts = this.getBankAccounts(userId);
    
    accounts.forEach(acc => {
      acc.isDefault = acc.id === accountId;
    });

    const key = `${STORAGE_KEYS.WALLET}-bank-accounts-${userId}`;
    StorageService.setItem(key, accounts);
  }

  // Get default bank account
  static getDefaultBankAccount(userId: string): any | null {
    const accounts = this.getBankAccounts(userId);
    return accounts.find(acc => acc.isDefault) || null;
  }

  // Get bank account by ID
  static getBankAccountById(userId: string, accountId: string): any | null {
    const accounts = this.getBankAccounts(userId);
    return accounts.find(acc => acc.id === accountId) || null;
  }
}