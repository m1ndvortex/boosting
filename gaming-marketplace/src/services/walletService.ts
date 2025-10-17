// Wallet service for multi-currency wallet management

import type { Wallet, Transaction, Currency } from '../types';
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
    paymentMethod: string
  ): Promise<{ transaction: Transaction; wallet: Wallet }> {
    const wallet = this.getWallet(userId);
    
    if (wallet.balances[currency] < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create pending withdrawal transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      walletId: userId,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending_approval', // Withdrawals require admin approval
      paymentMethod,
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
}