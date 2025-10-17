import type { Order, OrderEvidence } from '../types';
import { generateMockOrders, generateMockBoosterOrders } from './mockData';

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

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      ...(status === 'completed' && { completedAt: new Date() })
    };

    this.saveOrders(orders);
    return orders[orderIndex];
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
    currency: 'gold' | 'usd' | 'toman';
  }): Promise<Order> {
    const orders = this.getOrders();
    
    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date()
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