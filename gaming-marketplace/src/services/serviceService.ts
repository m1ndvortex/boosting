// Service management API simulation

import type { Service, Game, ServiceType, Order, User, WorkspaceType } from '../types';
import { StorageService, STORAGE_KEYS } from './storage';
import { MOCK_GAMES, MOCK_SERVICE_TYPES, MOCK_BOOSTERS, generateMockServices, generateMockOrders } from './mockData';
import { TeamService } from './teamService';

export class ServiceService {
  // Get all games
  static async getGames(): Promise<Game[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_GAMES;
  }

  // Get service types for a game
  static async getServiceTypes(gameId: string): Promise<ServiceType[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_SERVICE_TYPES.filter(st => st.gameId === gameId);
  }

  // Get user's services for a specific workspace
  static async getUserServices(userId: string, workspaceType: WorkspaceType = 'personal', workspaceId?: string): Promise<Service[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const storageKey = workspaceType === 'team' && workspaceId 
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    
    const storedServices = StorageService.getItem<Service[]>(storageKey) || [];
    
    // If no stored services, generate mock data for personal workspace only
    if (storedServices.length === 0 && workspaceType === 'personal') {
      const mockServices = generateMockServices(userId);
      StorageService.setItem(storageKey, mockServices);
      return mockServices;
    }
    
    return storedServices;
  }

  // Create a new service
  static async createService(serviceData: Omit<Service, 'id' | 'createdAt'>, userName: string): Promise<Service> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newService: Service = {
      ...serviceData,
      id: `service_${Date.now()}`,
      createdAt: new Date()
    };

    const storageKey = serviceData.workspaceType === 'team' 
      ? `${STORAGE_KEYS.SERVICES}_team_${serviceData.workspaceOwnerId}`
      : `${STORAGE_KEYS.SERVICES}_${serviceData.createdBy}`;

    const existingServices = StorageService.getItem<Service[]>(storageKey) || [];
    const updatedServices = [...existingServices, newService];
    
    StorageService.setItem(storageKey, updatedServices);

    // Log activity for team workspace
    if (serviceData.workspaceType === 'team') {
      TeamService.logActivity({
        serviceId: newService.id,
        userId: serviceData.createdBy,
        userName,
        action: 'created',
        changes: { service: newService }
      });
    }
    
    return newService;
  }

  // Update a service
  static async updateService(
    serviceId: string, 
    userId: string, 
    updates: Partial<Service>, 
    userName: string,
    workspaceType: WorkspaceType = 'personal',
    workspaceId?: string
  ): Promise<Service> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const storageKey = workspaceType === 'team' && workspaceId
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    
    const services = StorageService.getItem<Service[]>(storageKey) || [];
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    
    if (serviceIndex === -1) {
      throw new Error('Service not found');
    }

    const originalService = services[serviceIndex];
    const updatedService = { ...originalService, ...updates };
    services[serviceIndex] = updatedService;
    
    StorageService.setItem(storageKey, services);

    // Log activity for team workspace
    if (workspaceType === 'team') {
      let action = 'updated';
      if (updates.status === 'active' && originalService.status !== 'active') {
        action = 'activated';
      } else if (updates.status === 'inactive' && originalService.status !== 'inactive') {
        action = 'deactivated';
      }

      TeamService.logActivity({
        serviceId,
        userId,
        userName,
        action,
        changes: updates
      });
    }
    
    return updatedService;
  }

  // Delete a service
  static async deleteService(
    serviceId: string, 
    userId: string, 
    userName: string,
    workspaceType: WorkspaceType = 'personal',
    workspaceId?: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const storageKey = workspaceType === 'team' && workspaceId
      ? `${STORAGE_KEYS.SERVICES}_team_${workspaceId}`
      : `${STORAGE_KEYS.SERVICES}_${userId}`;
    
    const services = StorageService.getItem<Service[]>(storageKey) || [];
    const filteredServices = services.filter(s => s.id !== serviceId);
    
    StorageService.setItem(storageKey, filteredServices);

    // Log activity for team workspace
    if (workspaceType === 'team') {
      TeamService.logActivity({
        serviceId,
        userId,
        userName,
        action: 'deleted',
        changes: {}
      });
    }
  }

  // Get user's orders (for advertisers)
  static async getUserOrders(userId: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const storedOrders = StorageService.getItem<Order[]>(`${STORAGE_KEYS.ORDERS}_${userId}`) || [];
    
    // If no stored orders, generate mock data
    if (storedOrders.length === 0) {
      const mockOrders = generateMockOrders(userId);
      StorageService.setItem(`${STORAGE_KEYS.ORDERS}_${userId}`, mockOrders);
      return mockOrders;
    }
    
    return storedOrders;
  }

  // Get available boosters for assignment
  static async getAvailableBoosters(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_BOOSTERS;
  }

  // Assign booster to order
  static async assignBooster(orderId: string, boosterId: string, userId: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const orders = StorageService.getItem<Order[]>(`${STORAGE_KEYS.ORDERS}_${userId}`) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      boosterId,
      status: 'assigned'
    };
    
    StorageService.setItem(`${STORAGE_KEYS.ORDERS}_${userId}`, orders);
    
    return orders[orderIndex];
  }

  // Review evidence (approve/reject)
  static async reviewEvidence(orderId: string, userId: string, approved: boolean, _reason?: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const orders = StorageService.getItem<Order[]>(`${STORAGE_KEYS.ORDERS}_${userId}`) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status: approved ? 'completed' : 'rejected'
    };
    
    StorageService.setItem(`${STORAGE_KEYS.ORDERS}_${userId}`, orders);
    
    return orders[orderIndex];
  }
}