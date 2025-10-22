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
  } & Record<string, number>;
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
  currency: Currency;
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
  } & Record<string, number>;
  updatedAt: Date;
}

// Bank information for withdrawals
export interface BankInformation {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  cardNumber?: string;
  iban?: string;
  swiftCode?: string;
  routingNumber?: string;
  additionalInfo?: string;
}

// Transaction evidence for admin approval
export interface TransactionEvidence {
  transactionCode: string;
  bankTransactionId?: string;
  proofImage?: string; // base64 encoded image
  proofFileName?: string;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  userEmail?: string;
  type:
    | 'deposit'
    | 'withdrawal'
    | 'conversion'
    | 'purchase'
    | 'refund'
    | 'earning'
    | 'admin_deposit';
  amount: number;
  currency: Currency;
  status: 'pending' | 'completed' | 'failed' | 'pending_approval' | 'rejected' | 'processing';
  paymentMethod?: string;
  
  // Bank information for withdrawals
  bankInformation?: BankInformation;
  
  // Transaction evidence from admin
  transactionEvidence?: TransactionEvidence;
  
  // Additional metadata
  requestNotes?: string;
  rejectionReason?: string;
  
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
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
  } & Record<string, number>;
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
  currencyUsed: Currency;
  paymentMethod: 'wallet' | 'credit_card' | 'crypto';
  gameTimeCode?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

// Activity logging for team workspaces
export interface ActivityLogEntry {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  action: string;
  changes: Record<string, any>;
  timestamp: Date;
  workspaceId?: string;
  workspaceType?: 'personal' | 'team';
}

// Team invitation system
export interface TeamInvitation {
  id: string;
  teamId: string;
  invitedUserId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  respondedAt?: Date;
}

// Workspace context
export interface WorkspaceContext {
  type: WorkspaceType;
  id: string;
  name: string;
  isTeamLeader?: boolean;
}

// Multi-Wallet System Storage Keys
export const MULTI_WALLET_STORAGE_KEYS = {
  MULTI_WALLETS: 'multi_wallets',
  GAME_DEFINITIONS: 'game_definitions',
  GAME_REALMS: 'game_realms',
  MULTI_WALLET_TRANSACTIONS: 'multi_wallet_transactions',
  CONVERSION_FEE_CONFIG: 'conversion_fee_config',
  SUSPENDED_DEPOSITS: 'suspended_deposits'
} as const;

// Multi-Wallet System Error Types
export type MultiWalletErrorType = 
  | 'INSUFFICIENT_BALANCE'
  | 'WALLET_NOT_FOUND'
  | 'REALM_NOT_FOUND'
  | 'DUPLICATE_WALLET'
  | 'SUSPENDED_GOLD_RESTRICTION'
  | 'CONVERSION_FEE_ERROR'
  | 'INVALID_TRANSACTION'
  | 'WALLET_HAS_BALANCE'
  | 'DUPLICATE_REALM';

export interface MultiWalletErrorDetails {
  type: MultiWalletErrorType;
  message: string;
  details?: Record<string, any>;
}

// Multi-Wallet System Types

export interface MultiWallet {
  userId: string;
  staticWallets: {
    usd: StaticWalletBalance;
    toman: StaticWalletBalance;
  };
  goldWallets: Record<string, GoldWalletBalance>; // key: realmId
  updatedAt: Date;
}

export interface StaticWalletBalance {
  balance: number;
  currency: 'usd' | 'toman';
}

export interface GoldWalletBalance {
  realmId: string;
  realmName: string;
  gameName: string;
  suspendedGold: number;
  withdrawableGold: number;
  totalGold: number; // calculated: suspended + withdrawable
  suspendedDeposits: SuspendedDeposit[];
}

export interface SuspendedDeposit {
  id: string;
  amount: number;
  depositedAt: Date;
  withdrawableAt: Date; // depositedAt + 2 months
  depositedBy: string; // admin user ID
  status: 'suspended' | 'withdrawable';
}

export interface GameRealm {
  id: string;
  gameId: string;
  gameName: string;
  realmName: string;
  displayName: string; // e.g., "Kazzak Gold"
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface GameDefinition {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  realms: GameRealm[];
  createdAt: Date;
}

export interface MultiWalletTransaction {
  id: string;
  userId: string;
  walletType: 'static' | 'gold';
  walletId: string; // currency for static, realmId for gold
  type: 'deposit' | 'withdrawal' | 'conversion' | 'purchase' | 'earning' | 'admin_deposit';
  amount: number;
  currency: 'usd' | 'toman' | 'gold';
  goldType?: 'suspended' | 'withdrawable'; // for gold transactions
  status: 'pending' | 'completed' | 'failed' | 'pending_approval';
  conversionFee?: number; // for suspended gold conversions
  fromWallet?: string; // for conversions
  toWallet?: string; // for conversions
  paymentMethod?: string;
  approvedBy?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ConversionFeeConfig {
  id: string;
  suspendedGoldToUsd: number; // percentage (e.g., 5.0 for 5%)
  suspendedGoldToToman: number; // percentage
  isActive: boolean;
  updatedBy: string;
  updatedAt: Date;
}

// Utility types
export type WorkspaceType = 'personal' | 'team';
export type BaseCurrency = 'gold' | 'usd' | 'toman';
export type Currency = BaseCurrency | string; // Updated to support dynamic gold wallet identifiers
export type OrderStatus = Order['status'];
export type UserRoleName = UserRole['name'];
export type WalletType = 'static' | 'gold';
export type GoldType = 'suspended' | 'withdrawable';
export type MultiWalletTransactionType = MultiWalletTransaction['type'];

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Multi-Wallet Component Props
export interface MultiWalletBalanceProps {
  wallet: MultiWallet;
  loading?: boolean;
}

export interface GoldWalletManagerProps {
  availableRealms: GameRealm[];
  userWallet: MultiWallet;
  onAddWallet: (realmId: string) => void;
  onRemoveWallet: (realmId: string) => void;
}

export interface SuspendedGoldDisplayProps {
  goldWallet: GoldWalletBalance;
  onConvertToFiat: (amount: number, currency: 'usd' | 'toman') => void;
}

export interface ConversionFeeCalculatorProps {
  amount: number;
  targetCurrency: 'usd' | 'toman';
  onConfirmConversion: (amount: number, fee: number) => void;
}

// Admin Component Props
export interface GameManagementPanelProps {
  games: GameDefinition[];
  onCreateGame: (game: Omit<GameDefinition, 'id' | 'createdAt'>) => void;
  onUpdateGame: (gameId: string, updates: Partial<GameDefinition>) => void;
  onDeactivateGame: (gameId: string) => void;
}

export interface RealmManagementPanelProps {
  gameId: string;
  realms: GameRealm[];
  onCreateRealm: (realm: Omit<GameRealm, 'id' | 'createdAt'>) => void;
  onUpdateRealm: (realmId: string, updates: Partial<GameRealm>) => void;
  onDeactivateRealm: (realmId: string) => void;
}

export interface AdminGoldDepositPanelProps {
  users: User[];
  availableRealms: GameRealm[];
  onDepositGold: (userId: string, realmId: string, amount: number) => void;
}

export interface GoldDepositHistoryPanelProps {
  deposits: SuspendedDeposit[];
  filters: {
    userId?: string;
    realmId?: string;
    status?: 'suspended' | 'withdrawable';
  };
  onFilterChange: (filters: any) => void;
}

export interface ConversionFeeConfigPanelProps {
  config: ConversionFeeConfig;
  onUpdateFees: (usdFee: number, tomanFee: number) => void;
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

// Role Request System
export interface RoleRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  requestedRole: 'advertiser' | 'team_advertiser';
  status: 'pending' | 'approved' | 'rejected';
  reason: string; // Why they want this role
  experience?: string; // Optional experience/background
  idCardFile?: File | string; // File object or URL string for ID card
  idCardName?: string; // Original filename
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin who reviewed
  reviewNotes?: string; // Admin notes for approval/rejection
}

export interface RoleRequestFormData {
  requestedRole: 'advertiser' | 'team_advertiser';
  reason: string;
  experience?: string;
  idCardFile: File | null;
}
