// Shop service for game time products and purchases

import type { ShopProduct, ShopOrder, Currency } from '../types';
import { StorageService, STORAGE_KEYS } from './storage';
import { MultiWalletService } from './multiWalletService';

// Mock shop products
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'wow_30_days',
    gameId: 'game_wow',
    productType: 'game_time',
    name: 'WoW Game Time - 30 Days',
    description: 'World of Warcraft game time subscription for 30 days',
    durationDays: 30,
    prices: {
      gold: 60000,
      usd: 15,
      toman: 630000
    },
    stockType: 'unlimited',
    isActive: true
  },
  {
    id: 'wow_60_days',
    gameId: 'game_wow',
    productType: 'game_time',
    name: 'WoW Game Time - 60 Days',
    description: 'World of Warcraft game time subscription for 60 days',
    durationDays: 60,
    prices: {
      gold: 110000,
      usd: 28,
      toman: 1176000
    },
    stockType: 'unlimited',
    isActive: true
  },
  {
    id: 'wow_90_days',
    gameId: 'game_wow',
    productType: 'game_time',
    name: 'WoW Game Time - 90 Days',
    description: 'World of Warcraft game time subscription for 90 days',
    durationDays: 90,
    prices: {
      gold: 150000,
      usd: 40,
      toman: 1680000
    },
    stockType: 'unlimited',
    isActive: true
  }
];

export class ShopService {
  // Get all available products
  static getProducts(): ShopProduct[] {
    return SHOP_PRODUCTS.filter(product => product.isActive);
  }

  // Get product by ID
  static getProduct(productId: string): ShopProduct | null {
    return SHOP_PRODUCTS.find(product => product.id === productId) || null;
  }

  // Generate game time code in XXXX-XXXX-XXXX-XXXX format
  static generateGameTimeCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    
    return segments.join('-');
  }

  // Purchase product with wallet
  static async purchaseWithWallet(
    userId: string,
    productId: string,
    currency: Currency,
    walletId?: string,
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<ShopOrder> {
    const product = this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const price = product.prices[currency];
    const multiWallet = MultiWalletService.getMultiWallet(userId);

    // Check balance based on currency type
    let hasInsufficientBalance = false;
    if (currency === 'usd') {
      hasInsufficientBalance = multiWallet.staticWallets.usd.balance < price;
    } else if (currency === 'toman') {
      hasInsufficientBalance = multiWallet.staticWallets.toman.balance < price;
    } else if (currency === 'gold' && walletId) {
      const goldWallet = multiWallet.goldWallets[walletId];
      if (!goldWallet) {
        throw new Error('Gold wallet not found');
      }
      const availableBalance = goldType === 'suspended' ? goldWallet.suspendedGold : goldWallet.withdrawableGold;
      hasInsufficientBalance = availableBalance < price;
    } else {
      throw new Error('Invalid currency or missing wallet information');
    }

    if (hasInsufficientBalance) {
      throw new Error('Insufficient balance');
    }

    // Determine wallet type and ID for deduction
    let walletType: 'static' | 'gold';
    let deductionWalletId: string;

    if (currency === 'gold' && walletId) {
      walletType = 'gold';
      deductionWalletId = walletId;
    } else {
      walletType = 'static';
      deductionWalletId = currency;
    }

    // Deduct from wallet using the transaction service
    const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
    await MultiWalletTransactionService.createPurchaseTransaction(
      userId,
      walletType,
      deductionWalletId,
      price,
      currency,
      goldType,
      `shop_${productId}`
    );

    // Generate game time code
    const gameTimeCode = this.generateGameTimeCode();

    // Create shop order
    const order: ShopOrder = {
      id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      orderNumber: `SH-${Date.now().toString().slice(-5)}`,
      userId,
      productId,
      pricePaid: price,
      currencyUsed: currency,
      paymentMethod: 'wallet',
      gameTimeCode,
      status: 'completed',
      createdAt: new Date()
    };

    // Save order
    this.saveOrder(order);

    return order;
  }

  // Purchase product with card (simulation)
  static async purchaseWithCard(
    userId: string,
    productId: string,
    currency: Currency
  ): Promise<ShopOrder> {
    const product = this.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Only USD and Toman supported for card payments
    if (currency === 'gold') {
      throw new Error('Card payments not supported for Gold currency');
    }

    const price = product.prices[currency];

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate game time code
    const gameTimeCode = this.generateGameTimeCode();

    // Create shop order
    const order: ShopOrder = {
      id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      orderNumber: `SH-${Date.now().toString().slice(-5)}`,
      userId,
      productId,
      pricePaid: price,
      currencyUsed: currency,
      paymentMethod: 'credit_card',
      gameTimeCode,
      status: 'completed',
      createdAt: new Date()
    };

    // Save order
    this.saveOrder(order);

    return order;
  }

  // Get user's shop orders
  static getUserOrders(userId: string): ShopOrder[] {
    const orders = StorageService.getItem<ShopOrder[]>(STORAGE_KEYS.SHOP_ORDERS) || [];
    return orders
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get all shop orders (admin only)
  static getAllOrders(): ShopOrder[] {
    const orders = StorageService.getItem<ShopOrder[]>(STORAGE_KEYS.SHOP_ORDERS) || [];
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Save order to storage
  private static saveOrder(order: ShopOrder): void {
    const orders = StorageService.getItem<ShopOrder[]>(STORAGE_KEYS.SHOP_ORDERS) || [];
    orders.push(order);
    StorageService.setItem(STORAGE_KEYS.SHOP_ORDERS, orders);
  }

  // Get order by ID
  static getOrder(orderId: string): ShopOrder | null {
    const orders = StorageService.getItem<ShopOrder[]>(STORAGE_KEYS.SHOP_ORDERS) || [];
    return orders.find(order => order.id === orderId) || null;
  }

  // Format currency display
  static formatCurrency(amount: number, currency: Currency): string {
    switch (currency) {
      case 'gold':
        return `${amount.toLocaleString()} G`;
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()} ﷼`;
      default:
        return amount.toString();
    }
  }

  // Get payment methods for currency
  static getPaymentMethodsForCurrency(currency: Currency): string[] {
    switch (currency) {
      case 'gold':
        return ['wallet']; // Gold can only be paid with wallet
      case 'usd':
        return ['wallet', 'credit_card', 'crypto'];
      case 'toman':
        return ['wallet', 'credit_card', 'iranian_bank'];
      default:
        return ['wallet'];
    }
  }
}