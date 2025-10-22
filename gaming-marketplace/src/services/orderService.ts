import type { Order, OrderEvidence, Currency } from '../types';
import { generateMockOrders, generateMockBoosterOrders } from './mockData';
import { MultiWalletService } from './multiWalletService';

class OrderServiceClass {
  private storageKey = 'gaming_marketplace_orders';

  private getOrders(): Order[] {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const orders = JSON.parse(stored);
      // Convert date strings back to Date objects
      return orders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
        evidence: order.evidence ? {
          ...order.evidence,
          uploadedAt: new Date(order.evidence.uploadedAt)
        } : undefined
      }));
    }
    return [];
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
  }

  private initializeOrdersForUser(userId: string, isBooster: boolean = false): void {
    const existingOrders = this.getOrders();
    const userOrders = existingOrders.filter(order => 
      order.boosterId === userId || order.earningsRecipientId === userId
    );
    
    if (userOrders.length === 0) {
      // Generate some mock orders for the user
      const mockOrders = isBooster ? generateMockBoosterOrders(userId) : generateMockOrders(userId);
      const allOrders = [...existingOrders, ...mockOrders];
      this.saveOrders(allOrders);
    }
  }

  async getBoosterOrders(boosterId: string): Promise<Order[]> {
    this.initializeOrdersForUser(boosterId, true);
    const orders = this.getOrders();
    return orders.filter(order => order.boosterId === boosterId);
  }

  async getAdvertiserOrders(advertiserId: string): Promise<Order[]> {
    this.initializeOrdersForUser(advertiserId);
    const orders = this.getOrders();
    return orders.filter(order => order.earningsRecipientId === advertiserId);
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const orders = this.getOrders();
    return orders.find(order => order.id === orderId) || null;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const order = orders[orderIndex];
    orders[orderIndex] = {
      ...order,
      status,
      ...(status === 'completed' && { completedAt: new Date() })
    };

    // Distribute earnings when order is completed
    if (status === 'completed' && order.status !== 'completed') {
      await this.distributeEarnings(order);
    }

    this.saveOrders(orders);
    return orders[orderIndex];
  }

  // Distribute earnings to the appropriate wallet
  private async distributeEarnings(order: Order): Promise<void> {
    try {
      // Determine the appropriate wallet for earnings
      let walletType: 'static' | 'gold';
      let walletId: string;

      if (order.currency === 'gold') {
        // For gold earnings, determine which gold wallet to use
        walletType = 'gold';
        
        // Check if the order specifies a wallet ID (from purchase)
        const orderWalletId = (order as any).walletId;
        if (orderWalletId) {
          // Use the same wallet that was used for the purchase
          walletId = orderWalletId;
        } else {
          // Try to find an existing gold wallet for the user
          const multiWallet = MultiWalletService.getMultiWallet(order.earningsRecipientId);
          const goldWallets = Object.keys(multiWallet.goldWallets);
          
          if (goldWallets.length > 0) {
            // Use the first available gold wallet
            walletId = goldWallets[0];
          } else {
            // Create a default gold wallet if none exists
            // This would typically be based on the service's game/realm
            const availableRealms = MultiWalletService.getAvailableRealms();
            if (availableRealms.length > 0) {
              await MultiWalletService.createGoldWallet(order.earningsRecipientId, availableRealms[0].id);
              walletId = availableRealms[0].id;
            } else {
              throw new Error('No gold wallets available for earnings distribution');
            }
          }
        }
      } else {
        // For fiat currencies, use static wallets
        walletType = 'static';
        walletId = order.currency;
      }

      // Add earnings to the appropriate wallet using the transaction service
      const { MultiWalletTransactionService } = await import('./multiWalletTransactionService');
      await MultiWalletTransactionService.createEarningTransaction(
        order.earningsRecipientId,
        walletType,
        walletId,
        order.pricePaid,
        order.currency as 'usd' | 'toman' | 'gold',
        'withdrawable', // Earnings are always withdrawable
        order.id
      );
    } catch (error) {
      console.error('Failed to distribute earnings for order:', order.id, error);
      // In a real application, you might want to mark the order for manual review
    }
  }

  async uploadEvidence(orderId: string, evidence: { imageFile: File; notes: string }): Promise<void> {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    // In a real app, you would upload the file to a server
    // For this prototype, we'll store the file info
    const orderEvidence: OrderEvidence = {
      orderId,
      imageFile: evidence.imageFile,
      notes: evidence.notes,
      uploadedBy: orders[orderIndex].boosterId || 'unknown',
      uploadedAt: new Date()
    };

    orders[orderIndex] = {
      ...orders[orderIndex],
      status: 'evidence_submitted',
      evidence: orderEvidence
    };

    this.saveOrders(orders);
  }

  async reviewEvidence(orderId: string, approved: boolean, reviewerId: string, reason?: string): Promise<Order> {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const newStatus = approved ? 'completed' : 'rejected';
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      status: newStatus,
      ...(approved && { completedAt: new Date() })
    };

    // In a real app, you would store the review reason
    if (!approved && reason) {
      console.log(`Order ${orderId} rejected by ${reviewerId}: ${reason}`);
    }

    this.saveOrders(orders);
    return orders[orderIndex];
  }

  async assignBooster(orderId: string, boosterId: string): Promise<Order> {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      boosterId,
      status: 'assigned'
    };

    this.saveOrders(orders);
    return orders[orderIndex];
  }

  async createOrder(orderData: {
    serviceId: string;
    buyerId: string;
    earningsRecipientId: string;
    pricePaid: number;
    currency: Currency;
    walletId?: string;
    goldType?: 'suspended' | 'withdrawable';
  }): Promise<Order> {
    const orders = this.getOrders();
    
    const newOrder: Order & { walletId?: string; goldType?: 'suspended' | 'withdrawable' } = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      serviceId: orderData.serviceId,
      buyerId: orderData.buyerId,
      earningsRecipientId: orderData.earningsRecipientId,
      pricePaid: orderData.pricePaid,
      currency: orderData.currency,
      status: 'pending',
      createdAt: new Date(),
      // Store wallet information for earnings distribution
      ...(orderData.walletId && { walletId: orderData.walletId }),
      ...(orderData.goldType && { goldType: orderData.goldType })
    };

    orders.push(newOrder);
    this.saveOrders(orders);
    
    return newOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.getOrders();
  }

  async getOrdersWithEvidence(): Promise<Order[]> {
    const orders = this.getOrders();
    return orders.filter(order => order.evidence && order.status === 'evidence_submitted');
  }
}

export const OrderService = new OrderServiceClass();