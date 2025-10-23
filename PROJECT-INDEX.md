# Gaming Marketplace - Project Index & Architecture

**Project Name:** Gaming Services Marketplace  
**Repository:** boosting (m1ndvortex)  
**Tech Stack:** React 19, TypeScript, Vite, React Router v7, Styled Components  
**Status:** Active Development  
**Date Indexed:** October 22, 2025

---

## 📋 Executive Summary

This is a **Discord-themed gaming services marketplace** - a sophisticated web application where:

- **Clients** browse and purchase gaming boost services
- **Boosters** complete service orders and upload evidence
- **Advertisers** manage and sell gaming services 
- **Team Advertisers** manage services as teams
- **Admins** manage the entire platform including users, roles, games, finances, and exchange rates

The platform features a **multi-currency wallet system** supporting Gold (in-game), USD, and Toman, with a complex order completion workflow and role-based dashboards.

---

## 🏗️ System Architecture

### Core Architecture Pattern
- **State Management:** React Context API (8 contexts)
- **Routing:** React Router v7 (Client-side SPA)
- **Styling:** Styled Components + CSS
- **Data Persistence:** LocalStorage (Mock backend)
- **Type Safety:** TypeScript (strict mode)

### Context Hierarchy (Provider Chain)
```
App
└── ErrorBoundary
    └── Router
        └── NotificationProvider
            └── AppProvider (combines all contexts)
                ├── AuthProvider
                │   └── GameProvider
                │       └── WalletProvider
                │           └── MultiWalletProvider
                │               └── WorkspaceProvider
                │                   └── OrderProvider
                │                       └── [Children]
```

---

## 🎯 Core Contexts & State Management

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages user authentication and roles
- States: `isAuthenticated`, `user`, `loading`, `error`
- Actions: `LOGIN_START`, `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `CLEAR_ERROR`
- Uses mock Discord login (login with any userId)
- Persists to `STORAGE_KEYS.AUTH` in localStorage

### 2. **WalletContext** (`src/contexts/WalletContext.tsx`)
- Manages single wallet per user (legacy system)
- States: `wallet`, `transactions`, `loading`, `error`
- Supports: `deposit`, `withdrawal`, `conversion`, `purchase`, `earning`
- 3 currencies: Gold, USD, Toman
- **Status:** Being migrated to MultiWalletContext

### 3. **MultiWalletContext** (`src/contexts/MultiWalletContext.tsx`)
- **New system** supporting dynamic game realms
- States: `wallet`, `transactions`, `availableRealms`, `loading`, `error`
- Wallet structure:
  ```
  MultiWallet {
    staticWallets: { usd, toman }
    goldWallets: { realmId -> { suspendedGold, withdrawableGold } }
  }
  ```
- Gold deposits can be suspended for 2 months before withdrawal
- Supports conversion between wallet types with configurable fees

### 4. **OrderContext** (`src/contexts/OrderContext.tsx`)
- Manages orders from 3 perspectives:
  - `orders`: All orders user is involved in
  - `boosterOrders`: Orders assigned to user as booster
  - `advertiserOrders`: Orders created by user as advertiser
- Order Status Flow: `pending` → `assigned` → `in_progress` → `evidence_submitted` → `under_review` → `completed`/`rejected`
- Features: evidence upload, review system, booster assignment, earnings distribution

### 5. **GameContext** (`src/contexts/GameContext.tsx`)
- Manages game definitions and service types
- Games and service types loaded during app initialization
- Provides dropdown data for marketplace and admin features

### 6. **WorkspaceContext** (`src/contexts/WorkspaceContext.tsx`)
- Manages workspace type: `personal` or `team`
- Currently selected workspace context
- Used for service/workspace switching

### 7. **NotificationContext** (`src/components/notifications/NotificationSystem.tsx`)
- Toast/notification management
- Not in AppProvider - wrapped separately for global access

---

## 📊 Data Models & Types

### User & Authentication
```typescript
User {
  id, discordId, username, discriminator, avatar, email
  roles: UserRole[] // Can have multiple roles
  createdAt
}

UserRole {
  id, name: 'client'|'booster'|'advertiser'|'team_advertiser'|'admin'
  status: 'active'|'pending_approval'|'rejected'
  approvedBy?, approvedAt?
}
```

### Games & Services
```typescript
Game {
  id, name, slug, icon
  isActive: boolean
  serviceTypes: ServiceType[]
}

ServiceType {
  id, gameId, name, description
  requiresAdmin: boolean
  isActive: boolean
}

Service {
  id, gameId, serviceTypeId, title, description
  prices: { gold, usd, toman, ... }
  workspaceType: 'personal'|'team'
  workspaceOwnerId, createdBy
  status: 'active'|'inactive'
  createdAt
}
```

### Orders & Evidence
```typescript
Order {
  id, serviceId, buyerId, boosterId?, earningsRecipientId
  status: 'pending'|'assigned'|'in_progress'|'evidence_submitted'|'under_review'|'completed'|'rejected'
  pricePaid, currency
  evidence?: OrderEvidence
  createdAt, completedAt?
}

OrderEvidence {
  orderId, imageFile, notes, uploadedBy, uploadedAt
}
```

### Multi-Wallet System
```typescript
MultiWallet {
  userId
  staticWallets: { usd: StaticWalletBalance, toman: StaticWalletBalance }
  goldWallets: { realmId -> GoldWalletBalance }
  updatedAt
}

GoldWalletBalance {
  realmId, realmName, gameName
  suspendedGold, withdrawableGold
  totalGold // suspended + withdrawable
  suspendedDeposits: SuspendedDeposit[]
}

SuspendedDeposit {
  id, amount
  depositedAt, withdrawableAt (depositedAt + 2 months)
  depositedBy, status: 'suspended'|'withdrawable'
}
```

---

## 📁 Directory Structure

```
gaming-marketplace/
├── src/
│   ├── components/
│   │   ├── admin/              # Admin panel components (panels for different features)
│   │   │   ├── AdminGoldDepositPanel
│   │   │   ├── ConversionFeeConfigPanel
│   │   │   ├── GameManagementPanel
│   │   │   ├── RealmManagementPanel
│   │   │   ├── WalletMigrationPanel
│   │   │   └── ExportPanel
│   │   ├── common/             # Shared UI components (Button, Input, Loading, etc.)
│   │   ├── demo/               # Demo/tutorial components
│   │   ├── discord/            # Discord-themed components
│   │   ├── evidence/           # Evidence upload/display components
│   │   ├── forms/              # Reusable form components
│   │   ├── layout/             # Layout components (MainLayout, Sidebar, Header)
│   │   ├── marketplace/        # Marketplace UI components
│   │   ├── navigation/         # Navigation components
│   │   ├── notifications/      # Toast/notification system
│   │   ├── routing/            # AppRouter with protected routes
│   │   ├── services/           # Service components (cards, lists, management)
│   │   ├── shop/               # Shop UI components
│   │   ├── team/               # Team management components
│   │   ├── wallet/             # Wallet UI (balance, transactions, deposit, withdrawal)
│   │   └── workspace/          # Workspace switching components
│   │
│   ├── contexts/
│   │   ├── AppProvider.tsx     # Main provider combining all contexts
│   │   ├── AuthContext.tsx
│   │   ├── GameContext.tsx
│   │   ├── MultiWalletContext.tsx
│   │   ├── NotificationContext.tsx
│   │   ├── OrderContext.tsx
│   │   ├── WalletContext.tsx
│   │   └── WorkspaceContext.tsx
│   │
│   ├── hooks/
│   │   ├── useAsyncData.ts     # Fetch data with loading/error
│   │   ├── useAsyncOperation.ts
│   │   ├── useDataSync.ts      # Keep data in sync
│   │   ├── useDebounce.ts
│   │   ├── useFormValidation.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMultiWallet.ts   # Multi-wallet operations
│   │
│   ├── pages/
│   │   ├── admin/              # Admin Dashboard
│   │   │   └── AdminDashboard.tsx (with sections/)
│   │   ├── auth/               # Login/Auth pages
│   │   ├── dashboard/          # Service Provider Dashboard
│   │   ├── marketplace/        # Client marketplace pages
│   │   ├── shop/               # Shop/purchases pages
│   │   └── wallet/             # Wallet pages
│   │
│   ├── services/
│   │   ├── cacheService.ts           # In-memory caching
│   │   ├── conversionFeeService.ts   # Fee calculations for conversions
│   │   ├── dataService.ts            # Data initialization
│   │   ├── errorService.ts           # Centralized error handling
│   │   ├── exportService.ts          # Data export (CSV, JSON)
│   │   ├── gameManagementService.ts  # Game & realm management
│   │   ├── marketplaceService.ts     # Marketplace queries
│   │   ├── mockData.ts               # Mock data generators
│   │   ├── multiWalletInitService.ts # Multi-wallet initialization
│   │   ├── multiWalletService.ts     # Core multi-wallet logic
│   │   ├── multiWalletTransactionService.ts
│   │   ├── multiWalletValidationService.ts
│   │   ├── notificationService.ts
│   │   ├── optimizedDataLoader.ts    # Performance-optimized loading
│   │   ├── orderService.ts           # Order CRUD & status updates
│   │   ├── serviceService.ts         # Service CRUD operations
│   │   ├── shopService.ts            # Shop product management
│   │   ├── storage.ts                # LocalStorage abstraction
│   │   ├── syncService.ts            # Data synchronization
│   │   ├── teamService.ts            # Team management
│   │   ├── transactionIndexService.ts
│   │   ├── walletMigrationService.ts # Migrate old to new system
│   │   └── walletService.ts          # Legacy wallet (being replaced)
│   │
│   ├── types/
│   │   └── index.ts            # All TypeScript type definitions
│   │
│   ├── utils/
│   │   └── [utility functions]
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.css
│   │   ├── animations.css
│   │   ├── responsive.css
│   │   └── [component-specific styles]
│   │
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
│
├── vite.config.ts              # Vite configuration with path aliases
├── tsconfig.json               # TypeScript config
├── package.json
├── playwright.config.ts        # E2E testing
└── vitest.config.ts            # Unit testing

Root Documentation:
├── COMPLETE-SYSTEM-MAP.md      # Complete UI/feature mapping
├── WALLET-CHANGES.md           # Wallet system documentation
├── wallet-system.md            # Detailed wallet specifications
├── order-completion-flow.md    # Order workflow documentation
└── [other docs]
```

---

## 🚀 Key Services Architecture

### Service Layers

#### 1. **Storage & Cache Layer**
- `storage.ts`: LocalStorage wrapper with typed operations
- `cacheService.ts`: In-memory cache for performance
- Uses `STORAGE_KEYS` enum for consistent key management

#### 2. **Business Logic Layer**
```
multiWalletService.ts (PRIMARY)
├── Wallet creation/retrieval
├── Deposit/withdrawal handling
├── Currency conversion
├── Transaction recording
└── Error handling

orderService.ts
├── Order CRUD
├── Status transitions
├── Evidence handling
├── Earnings distribution

marketplaceService.ts
├── Service listing
├── Filtering & sorting
├── Mock service generation
```

#### 3. **Validation & Support Layer**
- `multiWalletValidationService.ts`: Business rule validation
- `multiWalletTransactionService.ts`: Transaction creation & tracking
- `errorService.ts`: Centralized error codes & messages
- `conversionFeeService.ts`: Fee calculations

#### 4. **Data Utilities**
- `mockData.ts`: Seed data generators
- `transactionIndexService.ts`: Transaction indexing
- `optimizedDataLoader.ts`: Performance optimization
- `syncService.ts`: Data synchronization across contexts

---

## 🔄 Key Data Flows

### 1. Order Completion Flow
```
1. Order Created (Client purchases)
   ↓
2. Booster Assigned (Advertiser/Team)
   ↓
3. Booster Starts Work (Status → "in_progress")
   ↓
4. Booster Uploads Evidence (Screenshot + Notes)
   ↓
5. Evidence Under Review (Status → "under_review")
   ↓
6. Admin/Reviewer Approves
   ↓
7. Earnings Distributed to Advertiser
   ↓
8. Order Completed (Status → "completed")
   ↓
9. Client Wallet Debited / Advertiser Wallet Credited
```

### 2. Wallet Deposit Flow (INSTANT)
```
User Initiates Deposit
   ↓
Select Payment Method (Credit Card, Crypto, Bank)
   ↓
Enter Amount & Currency
   ↓
Redirect to Payment Gateway
   ↓
User Completes Payment
   ↓
✅ Balance Updated Instantly (No Admin Approval)
```

### 3. Wallet Withdrawal Flow (REQUIRES APPROVAL)
```
User Requests Withdrawal
   ↓
Submit Amount & Currency
   ↓
Status → "pending_approval"
   ↓
Admin Reviews Request
   ↓
Admin Approves/Rejects
   ↓
✅ Approved → Funds Transferred
❌ Rejected → Amount Returned to Wallet
```

### 4. Multi-Wallet Realm Addition
```
User Creates Gold Wallet for New Realm
   ↓
GameManagementService adds realm
   ↓
New GoldWalletBalance Created
   ↓
suspendedGold = 0, withdrawableGold = 0
   ↓
Ready for deposits/conversions
```

---

## 🎭 User Roles & Dashboards

### Role Types
```
Admin (Platform Management)
├─ Separate dashboard
├─ Games & Services management
├─ User role approvals
├─ Financial management (withdrawals)
├─ Exchange rate management
└─ Shop products

Booster (Service Provider)
├─ Accept assigned orders
├─ Upload completion evidence
├─ View earnings

Advertiser (Service Creator)
├─ Create & manage services
├─ Assign boosters
├─ Manage personal workspace

Team Advertiser (Team Service Creator)
├─ Create & manage team services
├─ Manage team members
└─ Manage team workspace

Client (Service Consumer)
├─ Browse marketplace
├─ Purchase services
├─ View orders
└─ Make payments

User can have MULTIPLE roles simultaneously
```

### Dashboard Routing
```
GET /login → DiscordLogin
GET /admin → AdminDashboard (Admin only)
GET /dashboard → ServiceProviderDashboard (Everyone else)
GET /marketplace → Marketplace (Browse services)
GET /shop → Shop (Buy game time/subscriptions)
GET /wallet → Wallet (Manage funds)
```

---

## 💰 Wallet System Details

### Exchange Rates (`walletService.ts`)
```javascript
EXCHANGE_RATES = {
  gold_to_usd: 0.0005,      // 1 Gold = 0.0005 USD
  usd_to_gold: 2000,        // 1 USD = 2000 Gold
  usd_to_toman: 42000,      // 1 USD = 42000 Toman
  toman_to_usd: 0.000024,
  gold_to_toman: 21,        // 1 Gold = 21 Toman
  toman_to_gold: 0.048
}
```

### Payment Methods
```
Credit Card: USD, Toman
Crypto Wallet: USD
Iranian Bank Card: Toman
```

### Suspended Gold System
- Admin deposits temporarily suspend gold for 2 months
- After 2 months: `suspendedGold` → `withdrawableGold`
- Users can convert suspended gold to fiat (USD/Toman) with fees
- Prevents instant withdrawal abuse

---

## 🔐 Storage Keys

```typescript
// Authentication
STORAGE_KEYS.AUTH = 'gaming_marketplace_auth'

// Wallet System
STORAGE_KEYS.WALLET = 'gaming_marketplace_wallet'
STORAGE_KEYS.TRANSACTIONS = 'gaming_marketplace_transactions'

// Multi-Wallet System
MULTI_WALLET_STORAGE_KEYS.MULTI_WALLETS = 'multi_wallets'
MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS = 'game_definitions'
MULTI_WALLET_STORAGE_KEYS.GAME_REALMS = 'game_realms'
MULTI_WALLET_STORAGE_KEYS.MULTI_WALLET_TRANSACTIONS = 'multi_wallet_transactions'
MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG = 'conversion_fee_config'
MULTI_WALLET_STORAGE_KEYS.SUSPENDED_DEPOSITS = 'suspended_deposits'

// Services
STORAGE_KEYS.SERVICES = 'gaming_marketplace_services'
STORAGE_KEYS.TEAM_SERVICES = 'gaming_marketplace_team_services'

// Orders
STORAGE_KEYS.ORDERS = 'gaming_marketplace_orders'

// Teams
STORAGE_KEYS.TEAMS = 'gaming_marketplace_teams'

// Shop
STORAGE_KEYS.SHOP_PRODUCTS = 'gaming_marketplace_shop_products'
STORAGE_KEYS.SHOP_ORDERS = 'gaming_marketplace_shop_orders'
```

---

## 🛠️ Build & Development Setup

### Technology Stack
```
Frontend: React 19.1.1, React Router 7.9.4
Type Safety: TypeScript 5.9.3
Styling: Styled Components 6.1.19
Build: Vite 7.1.7
Testing: Vitest 3.2.4, Playwright 1.56.1
Linting: ESLint 9.36.0, Prettier 3.6.2
```

### Available Commands
```bash
npm run dev              # Start development server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
npm run format:check    # Check formatting
npm run test            # Run unit tests
npm run test:watch     # Watch mode tests
npm run test:ui        # UI test runner
npm run test:e2e       # End-to-end tests
npm run test:accessibility # Accessibility tests
```

### Vite Path Aliases
```typescript
@ → ./src
@components → ./src/components
@pages → ./src/pages
@contexts → ./src/contexts
@services → ./src/services
@types → ./src/types
@utils → ./src/utils
@styles → ./src/styles
@hooks → ./src/hooks
```

---

## 📊 Notable Implementation Patterns

### 1. Context Hooks Pattern
```typescript
// Each context exports a custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used in AuthProvider');
  return context;
};
```

### 2. Reducer Pattern for State Management
```typescript
// All contexts use useReducer for predictable state updates
const [state, dispatch] = useReducer(authReducer, initialState);

// Type-safe action creators
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string };
```

### 3. Service Layer Pattern
```typescript
// Static service classes with methods
export class OrderService {
  static async getBoosterOrders(boosterId: string): Promise<Order[]> { }
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> { }
}

// Used in contexts
const orders = await OrderService.getBoosterOrders(userId);
```

### 4. Error Boundary Pattern
```typescript
<ErrorBoundary level="page">
  <Router>
    {/* App content */}
  </Router>
</ErrorBoundary>
```

### 5. Protected Routes Pattern
```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🐛 Current Known Issues & Transitions

1. **Wallet System Migration**: Legacy `WalletContext` being replaced with `MultiWalletContext`
2. **Mock Backend**: Currently using localStorage - production needs real backend API
3. **No Real Discord OAuth**: Using mock login system
4. **Payment Gateway**: Integration placeholders for Stripe/PayPal/etc.

---

## 📈 Scalability Considerations

- **Caching**: CacheService for performance with frequent data access
- **Optimized Loading**: OptimizedDataLoader for large datasets
- **Transaction Indexing**: TransactionIndexService for fast queries
- **Local Storage Limits**: Will need database migration for production scale
- **Real-time Updates**: Currently polling - consider WebSockets for production

---

## 📚 Key Documentation Files

- `COMPLETE-SYSTEM-MAP.md` - Full UI feature mapping
- `WALLET-CHANGES.md` - Wallet system decision documentation
- `wallet-system.md` - Detailed wallet specifications
- `order-completion-flow.md` - Complete order workflow
- `shop-system.md` - Shop features
- `team-workspace.md` - Team workspace features

---

## ✅ What You're Ready For

With this understanding of the codebase, you can now:

1. **Add Features** - Understand component structure and data flow
2. **Fix Bugs** - Know the service layer and state management
3. **Optimize Performance** - Use caching and optimized loading patterns
4. **Add New Contexts** - Follow the established reducer/hook pattern
5. **Extend Services** - Add new business logic to existing services
6. **Migrate Data** - Understand wallet migration patterns
7. **Implement New Dashboards** - Use existing dashboard patterns
8. **Add Payment Integration** - Extend the wallet deposit system
9. **Create Admin Features** - Use existing admin panel components
10. **Deploy** - Build with Vite and deploy to production

---

**Ready to implement changes! What would you like me to work on?**
