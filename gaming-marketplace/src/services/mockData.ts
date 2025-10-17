// Mock data for games, service types, and other entities

import type { Game, ServiceType, Service, Order, User } from '../types';

// Mock games data
export const MOCK_GAMES: Game[] = [
  {
    id: 'game_wow',
    name: 'World of Warcraft',
    slug: 'wow',
    icon: '🎮',
    isActive: true,
    serviceTypes: []
  },
  {
    id: 'game_ff14',
    name: 'Final Fantasy XIV',
    slug: 'ff14',
    icon: '⚔️',
    isActive: true,
    serviceTypes: []
  },
  {
    id: 'game_gw2',
    name: 'Guild Wars 2',
    slug: 'gw2',
    icon: '🛡️',
    isActive: true,
    serviceTypes: []
  }
];

// Mock service types data
export const MOCK_SERVICE_TYPES: ServiceType[] = [
  {
    id: 'st_mythic_plus',
    gameId: 'game_wow',
    name: 'Mythic+ Dungeon',
    requiresAdmin: false,
    description: 'Complete Mythic+ dungeons for gear and rating',
    isActive: true
  },
  {
    id: 'st_leveling',
    gameId: 'game_wow',
    name: 'Leveling',
    requiresAdmin: false,
    description: 'Character leveling services',
    isActive: true
  },
  {
    id: 'st_raid',
    gameId: 'game_wow',
    name: 'Raid',
    requiresAdmin: true,
    description: 'Raid completion and gear runs',
    isActive: true
  },
  {
    id: 'st_delve',
    gameId: 'game_wow',
    name: 'Delve',
    requiresAdmin: false,
    description: 'Delve exploration and completion',
    isActive: true
  },
  {
    id: 'st_custom',
    gameId: 'game_wow',
    name: 'Custom Boost',
    requiresAdmin: false,
    description: 'Custom boosting services',
    isActive: true
  }
];

// Update games with service types
MOCK_GAMES[0].serviceTypes = MOCK_SERVICE_TYPES.filter(st => st.gameId === 'game_wow');

// Mock users for booster assignment
export const MOCK_BOOSTERS: User[] = [
  {
    id: 'booster_1',
    discordId: '111111111111111111',
    username: 'ProBooster',
    discriminator: '0001',
    avatar: 'https://cdn.discordapp.com/avatars/111111111111111111/avatar.png',
    email: 'probooster@example.com',
    roles: [
      {
        id: 'role_booster_1',
        name: 'booster',
        status: 'active',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    ],
    createdAt: new Date()
  },
  {
    id: 'booster_2',
    discordId: '222222222222222222',
    username: 'EliteBooster',
    discriminator: '0002',
    avatar: 'https://cdn.discordapp.com/avatars/222222222222222222/avatar.png',
    email: 'elitebooster@example.com',
    roles: [
      {
        id: 'role_booster_2',
        name: 'booster',
        status: 'active',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    ],
    createdAt: new Date()
  }
];

// Generate mock services
export const generateMockServices = (userId: string): Service[] => [
  {
    id: 'service_1',
    gameId: 'game_wow',
    serviceTypeId: 'st_mythic_plus',
    title: 'Mythic+15 Weekly Chest',
    description: 'Complete your weekly Mythic+15 for the best rewards',
    prices: {
      gold: 50000,
      usd: 25,
      toman: 1000000
    },
    workspaceType: 'personal',
    workspaceOwnerId: userId,
    createdBy: userId,
    status: 'active',
    createdAt: new Date()
  },
  {
    id: 'service_2',
    gameId: 'game_wow',
    serviceTypeId: 'st_leveling',
    title: '1-80 Leveling Boost',
    description: 'Fast and safe character leveling from 1 to 80',
    prices: {
      gold: 100000,
      usd: 50,
      toman: 2000000
    },
    workspaceType: 'personal',
    workspaceOwnerId: userId,
    createdBy: userId,
    status: 'active',
    createdAt: new Date()
  }
];

// Generate mock orders for advertisers
export const generateMockOrders = (userId: string): Order[] => [
  {
    id: 'order_1',
    serviceId: 'service_1',
    buyerId: 'client_1',
    boosterId: 'booster_1',
    earningsRecipientId: userId,
    status: 'in_progress',
    pricePaid: 25,
    currency: 'usd',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'order_2',
    serviceId: 'service_2',
    buyerId: 'client_2',
    earningsRecipientId: userId,
    status: 'pending',
    pricePaid: 50000,
    currency: 'gold',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: 'order_3',
    serviceId: 'service_1',
    buyerId: 'client_3',
    boosterId: 'booster_2',
    earningsRecipientId: userId,
    status: 'evidence_submitted',
    pricePaid: 1000000,
    currency: 'toman',
    evidence: {
      orderId: 'order_3',
      imageFile: new File([''], 'screenshot.png', { type: 'image/png' }),
      notes: 'Mythic+15 completed successfully. Key upgraded to +16.',
      uploadedBy: 'booster_2',
      uploadedAt: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
  }
];

// Generate mock orders for boosters
export const generateMockBoosterOrders = (boosterId: string): Order[] => [
  {
    id: 'order_booster_1',
    serviceId: 'service_1',
    buyerId: 'client_1',
    boosterId: boosterId,
    earningsRecipientId: 'advertiser_1',
    status: 'assigned',
    pricePaid: 30,
    currency: 'usd',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: 'order_booster_2',
    serviceId: 'service_2',
    buyerId: 'client_2',
    boosterId: boosterId,
    earningsRecipientId: 'advertiser_1',
    status: 'in_progress',
    pricePaid: 75000,
    currency: 'gold',
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
  },
  {
    id: 'order_booster_3',
    serviceId: 'service_3',
    buyerId: 'client_3',
    boosterId: boosterId,
    earningsRecipientId: 'advertiser_2',
    status: 'evidence_submitted',
    pricePaid: 1500000,
    currency: 'toman',
    evidence: {
      orderId: 'order_booster_3',
      imageFile: new File(['fake image data'], 'mythic_plus_completion.png', { type: 'image/png' }),
      notes: 'Mythic+15 Necrotic Wake completed in time. Client received +16 key and loot. Screenshots show completion time and rewards.',
      uploadedBy: boosterId,
      uploadedAt: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'order_booster_4',
    serviceId: 'service_4',
    buyerId: 'client_4',
    boosterId: boosterId,
    earningsRecipientId: 'advertiser_1',
    status: 'completed',
    pricePaid: 45,
    currency: 'usd',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    completedAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'order_booster_5',
    serviceId: 'service_5',
    buyerId: 'client_5',
    boosterId: boosterId,
    earningsRecipientId: 'advertiser_2',
    status: 'rejected',
    pricePaid: 25,
    currency: 'usd',
    evidence: {
      orderId: 'order_booster_5',
      imageFile: new File(['fake image data'], 'incomplete_evidence.jpg', { type: 'image/jpeg' }),
      notes: 'Leveling completed to level 80.',
      uploadedBy: boosterId,
      uploadedAt: new Date(Date.now() - 259200000) // 3 days ago
    },
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
  }
];

// Generate comprehensive mock data for testing scenarios
export const generateMockDataSet = () => {
  // Generate mock transactions
  const generateMockTransactions = (userId: string) => [
    {
      id: `txn_${Date.now()}_1`,
      walletId: userId,
      type: 'deposit' as const,
      amount: 50000,
      currency: 'gold' as const,
      status: 'completed' as const,
      paymentMethod: 'credit_card',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: `txn_${Date.now()}_2`,
      walletId: userId,
      type: 'earning' as const,
      amount: 25,
      currency: 'usd' as const,
      status: 'completed' as const,
      createdAt: new Date(Date.now() - 43200000)
    },
    {
      id: `txn_${Date.now()}_3`,
      walletId: userId,
      type: 'withdrawal' as const,
      amount: 100,
      currency: 'usd' as const,
      status: 'pending_approval' as const,
      createdAt: new Date(Date.now() - 21600000)
    }
  ];

  // Generate mock shop products
  const generateMockShopProducts = () => [
    {
      id: 'shop_wow_30',
      gameId: 'game_wow',
      productType: 'game_time' as const,
      name: 'WoW Game Time - 30 Days',
      description: '30 days of World of Warcraft game time',
      durationDays: 30,
      prices: { gold: 60000, usd: 15, toman: 630000 },
      stockType: 'unlimited' as const,
      isActive: true
    },
    {
      id: 'shop_wow_60',
      gameId: 'game_wow',
      productType: 'game_time' as const,
      name: 'WoW Game Time - 60 Days',
      description: '60 days of World of Warcraft game time',
      durationDays: 60,
      prices: { gold: 110000, usd: 28, toman: 1176000 },
      stockType: 'unlimited' as const,
      isActive: true
    },
    {
      id: 'shop_wow_90',
      gameId: 'game_wow',
      productType: 'game_time' as const,
      name: 'WoW Game Time - 90 Days',
      description: '90 days of World of Warcraft game time',
      durationDays: 90,
      prices: { gold: 150000, usd: 40, toman: 1680000 },
      stockType: 'unlimited' as const,
      isActive: true
    }
  ];

  // Generate mock teams
  const generateMockTeams = () => [
    {
      id: 'team_1',
      name: 'Elite Boosters',
      description: 'Professional boosting team with years of experience',
      leaderId: 'user_4', // TeamLeader user
      members: [
        {
          id: 'member_1',
          teamId: 'team_1',
          userId: 'user_4',
          role: 'leader' as const,
          status: 'active' as const,
          joinedAt: new Date(Date.now() - 2592000000) // 30 days ago
        },
        {
          id: 'member_2',
          teamId: 'team_1',
          userId: 'user_2',
          role: 'member' as const,
          status: 'active' as const,
          joinedAt: new Date(Date.now() - 1296000000) // 15 days ago
        }
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 2592000000)
    }
  ];

  // Generate mock role requests
  const generateMockRoleRequests = () => [
    {
      id: 'role_req_1',
      userId: 'user_1',
      requestedRole: 'booster' as const,
      status: 'pending' as const,
      requestedAt: new Date(Date.now() - 86400000),
      reason: 'I have extensive experience in Mythic+ dungeons and would like to offer boosting services.'
    },
    {
      id: 'role_req_2',
      userId: 'user_2',
      requestedRole: 'advertiser' as const,
      status: 'pending' as const,
      requestedAt: new Date(Date.now() - 43200000),
      reason: 'I want to create and manage boosting services for my team.'
    }
  ];

  // Generate mock activity log entries
  const generateMockActivityLog = () => [
    {
      id: 'activity_1',
      serviceId: 'service_1',
      userId: 'user_4',
      userName: 'TeamLeader',
      action: 'created',
      changes: { title: 'Mythic+15 Weekly Chest' },
      timestamp: new Date(Date.now() - 3600000),
      teamId: 'team_1'
    },
    {
      id: 'activity_2',
      serviceId: 'service_1',
      userId: 'user_2',
      userName: 'BoostMaster',
      action: 'updated price',
      changes: { usdPrice: 25 },
      timestamp: new Date(Date.now() - 1800000),
      teamId: 'team_1'
    }
  ];

  return {
    transactions: generateMockTransactions,
    shopProducts: generateMockShopProducts(),
    teams: generateMockTeams(),
    roleRequests: generateMockRoleRequests(),
    activityLog: generateMockActivityLog()
  };
};

// Initialize mock data in localStorage if not present
export const initializeMockData = () => {
  const mockData = generateMockDataSet();
  
  // Initialize shop products
  if (!localStorage.getItem('gaming_marketplace_shop_products')) {
    localStorage.setItem('gaming_marketplace_shop_products', JSON.stringify(mockData.shopProducts));
  }
  
  // Initialize teams
  if (!localStorage.getItem('gaming_marketplace_teams')) {
    localStorage.setItem('gaming_marketplace_teams', JSON.stringify(mockData.teams));
  }
  
  // Initialize role requests
  if (!localStorage.getItem('gaming_marketplace_role_requests')) {
    localStorage.setItem('gaming_marketplace_role_requests', JSON.stringify(mockData.roleRequests));
  }
  
  // Initialize activity log
  if (!localStorage.getItem('gaming_marketplace_activity_log')) {
    localStorage.setItem('gaming_marketplace_activity_log', JSON.stringify(mockData.activityLog));
  }
};