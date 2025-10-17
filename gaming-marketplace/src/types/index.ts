// Core type definitions for the Gaming Marketplace

export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  roles: UserRole[];
  createdAt: Date;
}

export interface UserRole {
  id: string;
  name: 'client' | 'booster' | 'advertiser' | 'team_advertiser' | 'admin';
  status: 'active' | 'pending_approval' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  serviceTypes: ServiceType[];
}

export interface ServiceType {
  id: string;
  gameId: string;
  name: string;
  requiresAdmin: boolean;
  description: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  gameId: string;
  serviceTypeId: string;
  title: string;
  description: string;
  prices: {
    gold: number;
    usd: number;
    toman: number;
  };
  workspaceType: 'personal' | 'team';
  workspaceOwnerId: string;
  createdBy: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Order {
  id: string;
  serviceId: string;
  buyerId: string;
  boosterId?: string;
  earningsRecipientId: string;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'evidence_submitted'
    | 'under_review'
    | 'completed'
    | 'rejected';
  pricePaid: number;
  currency: 'gold' | 'usd' | 'toman';
  evidence?: OrderEvidence;
  createdAt: Date;
  completedAt?: Date;
}

export interface OrderEvidence {
  orderId: string;
  imageFile: File;
  notes: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Wallet {
  userId: string;
  balances: {
    gold: number;
    usd: number;
    toman: number;
  };
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type:
    | 'deposit'
    | 'withdrawal'
    | 'conversion'
    | 'purchase'
    | 'refund'
    | 'earning';
  amount: number;
  currency: 'gold' | 'usd' | 'toman';
  status: 'pending' | 'completed' | 'failed' | 'pending_approval';
  paymentMethod?: string;
  approvedBy?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMember[];
  isActive: boolean;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'leader' | 'member';
  status: 'active' | 'invited' | 'removed';
  joinedAt?: Date;
}

export interface ShopProduct {
  id: string;
  gameId: string;
  productType: 'game_time' | 'subscription';
  name: string;
  description: string;
  durationDays: number;
  prices: {
    gold: number;
    usd: number;
    toman: number;
  };
  stockType: 'unlimited' | 'limited';
  stockQuantity?: number;
  isActive: boolean;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  userId: string;
  productId: string;
  pricePaid: number;
  currencyUsed: 'gold' | 'usd' | 'toman';
  paymentMethod: 'wallet' | 'credit_card' | 'crypto';
  gameTimeCode?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

// Utility types
export type WorkspaceType = 'personal' | 'team';
export type Currency = 'gold' | 'usd' | 'toman';
export type OrderStatus = Order['status'];
export type UserRoleName = UserRole['name'];

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginFormData {
  selectedUserId: string;
}

export interface ServiceFormData {
  gameId: string;
  serviceTypeId: string;
  title: string;
  description: string;
  goldPrice: number;
  usdPrice: number;
  tomanPrice: number;
}

// Filter and search types
export interface ServiceFilters {
  gameId?: string;
  serviceTypeId?: string;
  priceRange?: {
    min: number;
    max: number;
    currency: Currency;
  };
  sortBy?: 'price' | 'rating' | 'completion_time';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  query: string;
  filters?: ServiceFilters;
}
