# Design Document

## Overview

This design document outlines the architecture and implementation approach for the Gaming Services Marketplace prototype. The application will be a React-based frontend with TypeScript, featuring a Discord-themed UI/UX and browser storage for data persistence. The design focuses on creating two distinct dashboard interfaces with role-based access and comprehensive workflow simulations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   React App     │  │   TypeScript    │  │  Discord Theme  │ │
│  │   Components    │  │   Type Safety   │  │   Styling       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  State Management│  │  Browser Storage│  │  Mock Data      │ │
│  │  (Context API)  │  │  (localStorage) │  │  Simulation     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: CSS Modules + Styled Components for Discord theme
- **State Management**: React Context API + useReducer
- **Data Persistence**: Browser localStorage and sessionStorage
- **Build Tool**: Vite for fast development and building
- **UI Components**: Custom Discord-themed component library

### Application Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (buttons, inputs, etc.)
│   ├── layout/          # Layout components (sidebar, header, etc.)
│   └── discord/         # Discord-themed components
├── pages/               # Main page components
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin dashboard pages
│   ├── dashboard/      # Service provider dashboard pages
│   ├── marketplace/    # Client marketplace pages
│   ├── shop/           # Shop pages (available to all users)
│   └── wallet/         # Wallet pages (available to all users)
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── services/           # Data services and mock APIs
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and theme
```

## Components and Interfaces

### Application Navigation Structure

The application has a main navigation structure available to all authenticated users:

```typescript
interface AppNavigationStructure {
  // Global Navigation (available to all users)
  marketplace: MarketplacePage;    // Browse and purchase services
  shop: ShopPage;                 // Game time products
  wallet: WalletPage;             // Multi-currency wallet management
  
  // Role-based Dashboard Navigation
  dashboard: AdminDashboard | ServiceProviderDashboard;
}

// Main Navigation Component
interface MainNavProps {
  user: AuthenticatedUser;
  currentPage: string;
}

// Navigation items:
// 🛒 Marketplace - Service browsing and purchasing
// 🏪 Shop - Game time products (available to ALL users)
// 💰 Wallet - Multi-currency management
// 📊 Dashboard - Role-based (Admin or Service Provider)
```

### Core Components

#### 1. Authentication System

**DiscordAuthSimulator Component**
```typescript
interface DiscordAuthProps {
  onAuthSuccess: (user: DiscordUser) => void;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  roles: UserRole[];
}
```

**Features:**
- Simulated Discord OAuth flow
- Mock user selection from predefined users
- Role assignment simulation
- Session management with localStorage

#### 2. Main Application Router

**AppRouter Component**
```typescript
interface AppRouterProps {
  user: AuthenticatedUser;
}

// Main application routing structure:
// Admin role → AdminDashboard (separate interface)
// Service Provider roles → ServiceProviderDashboard (tabbed interface)
// All users → Marketplace, Shop, Wallet (global navigation)
```

**MainNavigation Component**
```typescript
interface MainNavigationProps {
  user: AuthenticatedUser;
  currentRoute: string;
}

// Global navigation available to all authenticated users:
// - Marketplace (browse and purchase services)
// - Shop (game time products)
// - Wallet (multi-currency management)
// - Dashboard (role-based: Admin or Service Provider)
```

#### 3. Admin Dashboard

**AdminDashboard Component Structure**
```typescript
interface AdminDashboardProps {
  user: AdminUser;
}

// Sidebar Navigation Components:
// - DashboardHome
// - GamesManagement
// - UsersAndRoles
// - PendingRoleRequests
// - FinancialManagement
// - ExchangeRates
// - ShopManagement
// - OrderReview
// - SystemSettings
```

**Key Features:**
- Completely separate interface from Service Provider Dashboard
- Full sidebar navigation with all admin sections
- Mock data management for games, users, orders, and financial operations
- Role approval workflow simulation

#### 4. Service Provider Dashboard

**ServiceProviderDashboard Component Structure**
```typescript
interface ServiceProviderDashboardProps {
  user: ServiceProviderUser;
}

// Top Navigation Tabs (role-based):
// - AdvertiserTab (📊 Advertiser)
// - TeamAdvertiserTab (👥 Team Advertiser) 
// - BoosterTab (🎮 Booster)

// Each tab has its own sidebar navigation
```

**Workspace Switcher Component**
```typescript
interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceType;
  availableWorkspaces: Workspace[];
  onWorkspaceChange: (workspace: Workspace) => void;
}

// Displays: [Personal Workspace ▼] [Team Workspace ▼]
// Only visible if user belongs to a team
```

#### 5. Wallet System

**WalletComponent Structure**
```typescript
interface WalletProps {
  userId: string;
}

interface WalletBalance {
  gold: number;
  usd: number;
  toman: number;
}

// Features:
// - Multi-currency display with proper symbols (G, $, ﷼)
// - Instant deposit simulation (no approval)
// - Withdrawal requests (requires admin approval)
// - Currency conversion with exchange rates
// - Transaction history
```

#### 6. Order Evidence System

**EvidenceUpload Component**
```typescript
interface EvidenceUploadProps {
  orderId: string;
  onSubmit: (evidence: OrderEvidence) => void;
}

interface OrderEvidence {
  orderId: string;
  imageFile: File;
  notes: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Features:
// - Image upload (PNG, JPG, JPEG, max 10MB, min 800x600)
// - Completion notes text area
// - Submit for review workflow
```

**EvidenceReview Component**
```typescript
interface EvidenceReviewProps {
  evidence: OrderEvidence;
  canReview: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

// Features:
// - Display uploaded screenshot
// - Show booster completion notes
// - Approve/Reject actions with reason
// - Role-based review permissions
```

#### 7. Team Workspace System

**TeamWorkspace Component**
```typescript
interface TeamWorkspaceProps {
  teamId: string;
  currentUser: User;
}

// Features:
// - Team service management (collaborative)
// - Activity logging with user attribution
// - Team earnings display (goes to team leader)
// - Member management (invite, remove)
```

**ActivityLog Component**
```typescript
interface ActivityLogEntry {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  action: string;
  changes: Record<string, any>;
  timestamp: Date;
}

// Displays: "Service created by [User]", "Price updated by [User]", etc.
```

#### 8. Marketplace System

**MarketplaceComponent Structure**
```typescript
interface MarketplaceProps {
  user: User;
}

interface ServiceListing {
  id: string;
  title: string;
  description: string;
  game: Game;
  serviceType: ServiceType;
  prices: {
    gold: number;
    usd: number;
    toman: number;
  };
  advertiser: User;
  rating: number;
  completionTime: string;
}

// Features:
// - Browse available services
// - Filter by game and service type
// - Search functionality
// - Service details view
// - Purchase workflow
// - Order tracking
```

**ServiceBrowser Component**
```typescript
interface ServiceBrowserProps {
  onServiceSelect: (service: ServiceListing) => void;
}

// Features:
// - Grid/List view toggle
// - Filtering by game (WoW, etc.)
// - Filtering by service type (Mythic+, Leveling, Raid, etc.)
// - Price range filtering
// - Sort by price, rating, completion time
```

**ServiceDetails Component**
```typescript
interface ServiceDetailsProps {
  service: ServiceListing;
  onPurchase: (service: ServiceListing, currency: string) => void;
}

// Features:
// - Full service description
// - Multi-currency pricing display
// - Advertiser information
// - Purchase button with currency selection
// - Reviews and ratings (mock data)
```

#### 9. Shop System

**ShopComponent Structure**
```typescript
interface ShopProps {
  user: User;
}

interface ShopProduct {
  id: string;
  name: string;
  game: string;
  duration: number;
  prices: {
    gold: number;
    usd: number;
    toman: number;
  };
}

// Features:
// - Game time products (WoW 30/60/90 days)
// - Dual payment options (wallet/card)
// - Game time code generation
// - Purchase history
// - Available to ALL users as separate tab
```

#### 10. Order Tracking System

**OrderTracking Component**
```typescript
interface OrderTrackingProps {
  userId: string;
}

interface OrderWithDetails extends Order {
  service: Service;
  booster?: User;
  statusHistory: OrderStatusChange[];
}

// Features:
// - View all user orders
// - Real-time status updates
// - Order details modal
// - Communication with booster (mock)
// - Reorder functionality
```

### Data Models

#### User and Role System

```typescript
interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  roles: UserRole[];
  createdAt: Date;
}

interface UserRole {
  id: string;
  name: 'client' | 'booster' | 'advertiser' | 'team_advertiser' | 'admin';
  status: 'active' | 'pending_approval' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}
```

#### Service and Order System

```typescript
interface Service {
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

interface Order {
  id: string;
  serviceId: string;
  buyerId: string;
  boosterId?: string;
  earningsRecipientId: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'evidence_submitted' | 'under_review' | 'completed' | 'rejected';
  pricePaid: number;
  currency: 'gold' | 'usd' | 'toman';
  evidence?: OrderEvidence;
  createdAt: Date;
  completedAt?: Date;
}
```

#### Wallet and Transaction System

```typescript
interface Wallet {
  userId: string;
  balances: {
    gold: number;
    usd: number;
    toman: number;
  };
  updatedAt: Date;
}

interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'conversion' | 'purchase' | 'refund' | 'earning';
  amount: number;
  currency: 'gold' | 'usd' | 'toman';
  status: 'pending' | 'completed' | 'failed' | 'pending_approval';
  paymentMethod?: string;
  approvedBy?: string;
  createdAt: Date;
}
```

#### Team System

```typescript
interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMember[];
  isActive: boolean;
  createdAt: Date;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'leader' | 'member';
  status: 'active' | 'invited' | 'removed';
  joinedAt?: Date;
}
```

#### Game and Service Type System

```typescript
interface Game {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  serviceTypes: ServiceType[];
}

interface ServiceType {
  id: string;
  gameId: string;
  name: string; // 'Mythic+ Dungeon', 'Leveling', 'Raid', 'Delve', 'Custom Boost'
  requiresAdmin: boolean; // true for 'Raid'
  description: string;
  isActive: boolean;
}
```

#### Shop Product System

```typescript
interface ShopProduct {
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

interface ShopOrder {
  id: string;
  orderNumber: string; // SH-12345
  userId: string;
  productId: string;
  pricePaid: number;
  currencyUsed: 'gold' | 'usd' | 'toman';
  paymentMethod: 'wallet' | 'credit_card' | 'crypto';
  gameTimeCode?: string; // XXXX-XXXX-XXXX-XXXX
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}
```

## Error Handling

### Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Global error boundary for unhandled errors
// Component-level error boundaries for specific features
// User-friendly error messages with Discord styling
```

### Validation System

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Form validation for all user inputs
// File upload validation (size, format, resolution)
// Business logic validation (wallet balance, permissions)
```

### Error Types

1. **Authentication Errors**: Invalid login, session expired
2. **Permission Errors**: Insufficient role permissions
3. **Validation Errors**: Invalid form data, file format issues
4. **Business Logic Errors**: Insufficient balance, order state conflicts
5. **Storage Errors**: localStorage quota exceeded, data corruption

## Testing Strategy

### Component Testing

```typescript
// Unit tests for individual components
// Integration tests for component interactions
// Mock data services for isolated testing
// Accessibility testing for Discord theme compliance
```

### User Flow Testing

1. **Authentication Flow**: Discord OAuth simulation
2. **Main Navigation**: Global navigation between Marketplace, Shop, Wallet, Dashboard
3. **Marketplace Browsing**: Service discovery, filtering, search, purchase
4. **Dashboard Navigation**: Role-based access and tab switching
5. **Workspace Switching**: Personal ↔ Team context changes
6. **Order Workflow**: Complete order lifecycle from creation to completion
7. **Wallet Operations**: Deposits, withdrawals, conversions, purchases
8. **Team Management**: Team creation, member invitation, collaborative editing
9. **Evidence System**: Upload, review, approval/rejection workflow
10. **Shop Purchases**: Wallet and card payment flows
11. **Order Tracking**: Client order status monitoring and updates

### Data Persistence Testing

```typescript
// localStorage data integrity
// Session management across browser refresh
// Data migration between app versions
// Storage quota handling
```

### Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile responsive design testing
- Touch interaction testing for mobile devices
- Performance testing with large datasets in localStorage

## Implementation Phases

### Phase 1: Core Infrastructure
- Project setup with Vite + React + TypeScript
- Discord theme implementation
- Authentication system with mock Discord OAuth
- Basic routing and layout components
- localStorage service layer

### Phase 2: Dashboard Foundations
- Admin Dashboard structure and navigation
- Service Provider Dashboard with role-based tabs
- Workspace switcher implementation
- Basic user management and role system

### Phase 3: Core Features
- Marketplace interface for service browsing and purchasing
- Wallet system with multi-currency support
- Service creation and management
- Order system with status workflow
- Team workspace functionality

### Phase 4: Advanced Features
- Order evidence system with image upload
- Shop system with game time products
- Activity logging and audit trails
- Advanced admin management features

### Phase 5: Polish and Testing
- Complete Discord theme implementation
- Comprehensive testing suite
- Performance optimization
- Documentation and deployment preparation

## Discord Theme Implementation

### Color Palette

```css
:root {
  /* Primary Colors */
  --discord-bg-primary: #2f3136;
  --discord-bg-secondary: #36393f;
  --discord-bg-tertiary: #202225;
  
  /* Accent Colors */
  --discord-accent: #7289da;
  --discord-accent-hover: #677bc4;
  --discord-success: #43b581;
  --discord-warning: #faa61a;
  --discord-danger: #f04747;
  
  /* Text Colors */
  --discord-text-primary: #ffffff;
  --discord-text-secondary: #b9bbbe;
  --discord-text-muted: #72767d;
  
  /* Interactive Colors */
  --discord-interactive-normal: #b9bbbe;
  --discord-interactive-hover: #dcddde;
  --discord-interactive-active: #ffffff;
}
```

### Typography

```css
/* Discord-inspired font stack */
font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Font weights and sizes */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Component Styling

```typescript
// Styled components for Discord theme
const DiscordButton = styled.button`
  background: var(--discord-accent);
  color: var(--discord-text-primary);
  border: none;
  border-radius: 3px;
  padding: 8px 16px;
  font-weight: var(--font-weight-medium);
  transition: background-color 0.17s ease;
  
  &:hover {
    background: var(--discord-accent-hover);
  }
`;

const DiscordCard = styled.div`
  background: var(--discord-bg-secondary);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
`;
```

### Animation System

```css
/* Discord-style animations */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Smooth transitions for interactive elements */
.discord-transition {
  transition: all 0.17s ease;
}
```

## Data Flow Architecture

### State Management

```typescript
// Global application state using Context API
interface AppState {
  auth: AuthState;
  user: UserState;
  workspace: WorkspaceState;
  wallet: WalletState;
  orders: OrderState;
  teams: TeamState;
}

// Context providers for different domains
const AuthProvider: React.FC<{ children: React.ReactNode }>;
const UserProvider: React.FC<{ children: React.ReactNode }>;
const WorkspaceProvider: React.FC<{ children: React.ReactNode }>;
const WalletProvider: React.FC<{ children: React.ReactNode }>;
```

### Data Services

```typescript
// Mock API services for data operations
class UserService {
  static async getUser(id: string): Promise<User>;
  static async updateUser(user: Partial<User>): Promise<User>;
  static async requestRole(userId: string, role: string): Promise<void>;
}

class MarketplaceService {
  static async getServices(filters?: ServiceFilters): Promise<ServiceListing[]>;
  static async getService(id: string): Promise<ServiceListing>;
  static async purchaseService(serviceId: string, currency: string): Promise<Order>;
  static async searchServices(query: string): Promise<ServiceListing[]>;
}

class OrderService {
  static async createOrder(order: CreateOrderRequest): Promise<Order>;
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  static async uploadEvidence(orderId: string, evidence: OrderEvidence): Promise<void>;
  static async getUserOrders(userId: string): Promise<Order[]>;
}

class WalletService {
  static async getWallet(userId: string): Promise<Wallet>;
  static async deposit(userId: string, amount: number, currency: string): Promise<Transaction>;
  static async withdraw(userId: string, amount: number, currency: string): Promise<Transaction>;
  static async convert(userId: string, from: string, to: string, amount: number): Promise<Transaction>;
}

class ShopService {
  static async getProducts(): Promise<ShopProduct[]>;
  static async purchaseProduct(productId: string, paymentMethod: 'wallet' | 'card', currency?: string): Promise<ShopOrder>;
  static async getUserOrders(userId: string): Promise<ShopOrder[]>;
  static async generateGameTimeCode(productId: string): Promise<string>;
}

class GameService {
  static async getGames(): Promise<Game[]>;
  static async getServiceTypes(gameId: string): Promise<ServiceType[]>;
  static async createGame(game: Partial<Game>): Promise<Game>; // Admin only
  static async createServiceType(serviceType: Partial<ServiceType>): Promise<ServiceType>; // Admin only
}
```

### Storage Layer

```typescript
// localStorage abstraction layer
class StorageService {
  static setItem<T>(key: string, value: T): void;
  static getItem<T>(key: string): T | null;
  static removeItem(key: string): void;
  static clear(): void;
}

// Specific storage services
class UserStorage extends StorageService {
  static saveUser(user: User): void;
  static getUser(): User | null;
  static clearUser(): void;
}

class WalletStorage extends StorageService {
  static saveWallet(wallet: Wallet): void;
  static getWallet(userId: string): Wallet | null;
  static updateBalance(userId: string, currency: string, amount: number): void;
}
```

This design provides a comprehensive foundation for implementing the Gaming Services Marketplace prototype with all the features specified in the requirements, maintaining the exact structure and workflows described in the documentation while using modern React and TypeScript best practices.