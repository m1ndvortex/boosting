// Marketplace service for browsing and purchasing services

import type { Service, ServiceFilters, SearchParams, Order, Game, ServiceType, User, Currency } from '../types';
import { StorageService, STORAGE_KEYS } from './storage';
import { MOCK_GAMES, MOCK_SERVICE_TYPES } from './mockData';
import { OrderService } from './orderService';

// Extended service listing with additional marketplace info
export interface ServiceListing extends Service {
  game: Game;
  serviceType: ServiceType;
  advertiser: User;
  rating: number;
  completionTime: string;
  completedOrders: number;
}

export class MarketplaceService {
  // Get all available services for marketplace browsing
  static async getMarketplaceServices(filters?: ServiceFilters): Promise<ServiceListing[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get all services from all users (both personal and team workspaces)
    const allServices: Service[] = [];
    
    // Get services from localStorage for all users
    const keys = Object.keys(localStorage);
    const serviceKeys = keys.filter(key => 
      key.startsWith(STORAGE_KEYS.SERVICES) || 
      key === 'gaming-marketplace-services'
    );
    
    serviceKeys.forEach(key => {
      const services = StorageService.getItem<Service[]>(key) || [];
      allServices.push(...services.filter(s => s.status === 'active'));
    });

    // If no services found, generate some mock marketplace services
    if (allServices.length === 0) {
      const mockServices = this.generateMockMarketplaceServices();
      allServices.push(...mockServices);
    }

    // Convert to ServiceListing with additional info
    const serviceListings: ServiceListing[] = allServices.map(service => {
      const game = MOCK_GAMES.find(g => g.id === service.gameId)!;
      const serviceType = MOCK_SERVICE_TYPES.find(st => st.id === service.serviceTypeId)!;
      
      return {
        ...service,
        game,
        serviceType,
        advertiser: this.getMockAdvertiser(service.createdBy),
        rating: Math.random() * 2 + 3, // Random rating between 3-5
        completionTime: this.getRandomCompletionTime(),
        completedOrders: Math.floor(Math.random() * 50) + 5
      };
    });

    // Apply filters
    let filteredServices = serviceListings;

    if (filters?.gameId) {
      filteredServices = filteredServices.filter(s => s.gameId === filters.gameId);
    }

    if (filters?.serviceTypeId) {
      filteredServices = filteredServices.filter(s => s.serviceTypeId === filters.serviceTypeId);
    }

    if (filters?.priceRange) {
      const { min, max, currency } = filters.priceRange;
      filteredServices = filteredServices.filter(s => {
        const price = s.prices[currency];
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredServices.sort((a, b) => {
        let aValue: number, bValue: number;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.prices.usd;
            bValue = b.prices.usd;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'completion_time':
            aValue = parseInt(a.completionTime);
            bValue = parseInt(b.completionTime);
            break;
          default:
            return 0;
        }

        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return (aValue - bValue) * order;
      });
    }

    return filteredServices;
  }

  // Search services by query
  static async searchServices(searchParams: SearchParams): Promise<ServiceListing[]> {
    const allServices = await this.getMarketplaceServices(searchParams.filters);
    
    if (!searchParams.query.trim()) {
      return allServices;
    }

    const query = searchParams.query.toLowerCase();
    
    return allServices.filter(service => 
      service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.game.name.toLowerCase().includes(query) ||
      service.serviceType.name.toLowerCase().includes(query) ||
      service.advertiser.username.toLowerCase().includes(query)
    );
  }

  // Get service by ID with full details
  static async getServiceDetails(serviceId: string): Promise<ServiceListing | null> {
    const allServices = await this.getMarketplaceServices();
    return allServices.find(s => s.id === serviceId) || null;
  }

  // Purchase a service
  static async purchaseService(
    serviceId: string,
    buyerId: string,
    currency: Currency,
    walletId?: string,
    goldType?: 'suspended' | 'withdrawable'
  ): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const service = await this.getServiceDetails(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const pricePaid = service.prices[currency];
    
    // Create order through OrderService with wallet information
    const order = await OrderService.createOrder({
      serviceId,
      buyerId,
      earningsRecipientId: service.workspaceType === 'team' 
        ? service.workspaceOwnerId 
        : service.createdBy,
      pricePaid,
      currency,
      walletId,
      goldType
    });

    return order;
  }

  // Get user's purchase history (orders as buyer)
  static async getUserPurchaseHistory(userId: string): Promise<Order[]> {
    const allOrders = await OrderService.getAllOrders();
    return allOrders.filter(order => order.buyerId === userId);
  }

  // Get games for filtering
  static async getGames(): Promise<Game[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_GAMES;
  }

  // Get service types for a game
  static async getServiceTypes(gameId: string): Promise<ServiceType[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_SERVICE_TYPES.filter(st => st.gameId === gameId);
  }

  // Helper methods
  private static generateMockMarketplaceServices(): Service[] {
    const mockServices: Service[] = [
      {
        id: 'marketplace_service_1',
        gameId: 'game_wow',
        serviceTypeId: 'st_mythic_plus',
        title: 'Mythic+20 Weekly Chest',
        description: 'Complete your weekly Mythic+20 for the highest rewards. Professional booster with 5+ years experience.',
        prices: { gold: 75000, usd: 35, toman: 1500000 },
        workspaceType: 'personal',
        workspaceOwnerId: 'advertiser_1',
        createdBy: 'advertiser_1',
        status: 'active',
        createdAt: new Date()
      },
      {
        id: 'marketplace_service_2',
        gameId: 'game_wow',
        serviceTypeId: 'st_leveling',
        title: '1-80 Speed Leveling',
        description: 'Fast and safe character leveling from 1 to 80. Completed within 24-48 hours.',
        prices: { gold: 120000, usd: 60, toman: 2500000 },
        workspaceType: 'personal',
        workspaceOwnerId: 'advertiser_2',
        createdBy: 'advertiser_2',
        status: 'active',
        createdAt: new Date()
      },
      {
        id: 'marketplace_service_3',
        gameId: 'game_wow',
        serviceTypeId: 'st_delve',
        title: 'Tier 8 Delve Completion',
        description: 'Complete Tier 8 Delves for maximum rewards. All delves available.',
        prices: { gold: 40000, usd: 20, toman: 800000 },
        workspaceType: 'team',
        workspaceOwnerId: 'team_1',
        createdBy: 'team_advertiser_1',
        status: 'active',
        createdAt: new Date()
      },
      {
        id: 'marketplace_service_4',
        gameId: 'game_wow',
        serviceTypeId: 'st_custom',
        title: 'Custom Achievement Boost',
        description: 'Get any achievement you want! Discuss requirements before ordering.',
        prices: { gold: 30000, usd: 15, toman: 600000 },
        workspaceType: 'personal',
        workspaceOwnerId: 'advertiser_3',
        createdBy: 'advertiser_3',
        status: 'active',
        createdAt: new Date()
      },
      {
        id: 'marketplace_service_5',
        gameId: 'game_wow',
        serviceTypeId: 'st_mythic_plus',
        title: 'Mythic+15 Key Push',
        description: 'Push your key to +15 for weekly chest. Guaranteed completion or refund.',
        prices: { gold: 50000, usd: 25, toman: 1000000 },
        workspaceType: 'personal',
        workspaceOwnerId: 'advertiser_4',
        createdBy: 'advertiser_4',
        status: 'active',
        createdAt: new Date()
      }
    ];

    // Store these services in localStorage for persistence
    mockServices.forEach(service => {
      const storageKey = `${STORAGE_KEYS.SERVICES}_${service.createdBy}`;
      const existingServices = StorageService.getItem<Service[]>(storageKey) || [];
      if (!existingServices.find(s => s.id === service.id)) {
        existingServices.push(service);
        StorageService.setItem(storageKey, existingServices);
      }
    });

    return mockServices;
  }

  private static getMockAdvertiser(userId: string): User {
    const advertisers: Record<string, User> = {
      'test-user-1': {
        id: 'test-user-1',
        discordId: '123456789012345678',
        username: 'TestAdvertiser',
        discriminator: '1234',
        avatar: 'test-avatar.png',
        email: 'test@example.com',
        roles: [{ id: 'role_1', name: 'advertiser', status: 'active' }],
        createdAt: new Date()
      },
      advertiser_1: {
        id: 'advertiser_1',
        discordId: '333333333333333333',
        username: 'ProAdvertiser',
        discriminator: '0001',
        avatar: 'https://cdn.discordapp.com/avatars/333333333333333333/avatar.png',
        email: 'proadvertiser@example.com',
        roles: [{ id: 'role_1', name: 'advertiser', status: 'active' }],
        createdAt: new Date()
      },
      advertiser_2: {
        id: 'advertiser_2',
        discordId: '444444444444444444',
        username: 'EliteBoosts',
        discriminator: '0002',
        avatar: 'https://cdn.discordapp.com/avatars/444444444444444444/avatar.png',
        email: 'eliteboosts@example.com',
        roles: [{ id: 'role_2', name: 'advertiser', status: 'active' }],
        createdAt: new Date()
      },
      team_advertiser_1: {
        id: 'team_advertiser_1',
        discordId: '555555555555555555',
        username: 'TeamLeader',
        discriminator: '0003',
        avatar: 'https://cdn.discordapp.com/avatars/555555555555555555/avatar.png',
        email: 'teamleader@example.com',
        roles: [{ id: 'role_3', name: 'team_advertiser', status: 'active' }],
        createdAt: new Date()
      },
      advertiser_3: {
        id: 'advertiser_3',
        discordId: '666666666666666666',
        username: 'AchievementHunter',
        discriminator: '0004',
        avatar: 'https://cdn.discordapp.com/avatars/666666666666666666/avatar.png',
        email: 'achievementhunter@example.com',
        roles: [{ id: 'role_4', name: 'advertiser', status: 'active' }],
        createdAt: new Date()
      },
      advertiser_4: {
        id: 'advertiser_4',
        discordId: '777777777777777777',
        username: 'KeyMaster',
        discriminator: '0005',
        avatar: 'https://cdn.discordapp.com/avatars/777777777777777777/avatar.png',
        email: 'keymaster@example.com',
        roles: [{ id: 'role_5', name: 'advertiser', status: 'active' }],
        createdAt: new Date()
      }
    };

    return advertisers[userId] || {
      id: userId,
      discordId: '000000000000000000',
      username: 'Unknown User',
      discriminator: '0000',
      avatar: '',
      email: 'unknown@example.com',
      roles: [{ id: 'role_unknown', name: 'client', status: 'active' }],
      createdAt: new Date()
    };
  }

  private static getRandomCompletionTime(): string {
    const times = ['2-4 hours', '4-8 hours', '8-12 hours', '12-24 hours', '1-2 days', '2-3 days'];
    return times[Math.floor(Math.random() * times.length)];
  }
}