# Complete System Map - All Relationships & Connections

## 🎯 Overview
This document shows ALL relationships, dashboards, tabs, features, and how everything connects in the gaming services marketplace platform.

---

## 📊 Top-Level System Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAMING SERVICES MARKETPLACE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Authentication: Discord OAuth (Mandatory)                           │
│  One Discord Account = One Platform Account                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    USER ROLES                                │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ • Client (auto-assigned)                                     │   │
│  │ • Booster (requires approval)                                │   │
│  │ • Advertiser (requires approval)                             │   │
│  │ • Team Advertiser (requires approval)                        │   │
│  │ • Admin (requires approval)                                  │   │
│  │                                                               │   │
│  │ Note: Users can have MULTIPLE roles simultaneously           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    2 MAIN DASHBOARDS                         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  1. ADMIN DASHBOARD (Admin role only)                        │   │
│  │     - Separate dashboard                                     │   │
│  │     - Platform management                                    │   │
│  │                                                               │   │
│  │  2. SERVICE PROVIDER DASHBOARD (Booster, Advertiser, Team)  │   │
│  │     - Role-based tabs                                        │   │
│  │     - Service management                                     │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏢 Dashboard 1: Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                               │
│                    (Admin Role ONLY - Separate)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Sidebar Navigation:                                                 │
│                                                                       │
│  📊 Dashboard Home                                                   │
│     ├─ Key metrics                                                   │
│     ├─ Pending role requests count                                   │
│     ├─ Pending withdrawals count                                     │
│     └─ Platform statistics                                           │
│                                                                       │
│  🎮 Games Management                                                 │
│     ├─ Add/Edit/Delete games                                         │
│     ├─ Manage service types per game                                 │
│     │   ├─ Mythic+ Dungeon                                           │
│     │   ├─ Leveling                                                  │
│     │   ├─ Raid (Admin only can create)                              │
│     │   ├─ Delve                                                     │
│     │   └─ Custom Boost                                              │
│     └─ Activate/Deactivate games                                     │
│                                                                       │
│  👥 Users & Roles                                                    │
│     ├─ View all users                                                │
│     ├─ Manually assign roles                                         │
│     ├─ Revoke roles                                                  │
│     └─ Suspend/Activate accounts                                     │
│                                                                       │
│  ⏳ Pending Role Requests                                            │
│     ├─ View requests (Booster, Advertiser, Team Advertiser)         │
│     ├─ Approve requests                                              │
│     └─ Reject requests (with reason)                                 │
│                                                                       │
│  💰 Financial Management                                             │
│     ├─ Pending Withdrawals                                           │
│     │   ├─ View withdrawal requests                                  │
│     │   ├─ Approve withdrawals                                       │
│     │   └─ Reject withdrawals (with reason)                          │
│     ├─ Deposit History (view only - deposits are instant)            │
│     └─ Financial Reports                                             │
│                                                                       │
│  💱 Exchange Rates                                                   │
│     ├─ View current rates (Gold ↔ USD ↔ Toman)                      │
│     ├─ Update rates                                                  │
│     └─ Rate history                                                  │
│                                                                       │
│  📦 Shop Management                                                  │
│     ├─ Add/Edit/Delete shop products                                 │
│     ├─ Set prices (Gold, USD, Toman)                                 │
│     ├─ Manage stock                                                  │
│     ├─ View shop orders                                              │
│     └─ Resend game time codes                                        │
│                                                                       │
│  📋 Order Review                                                     │
│     ├─ View orders with submitted evidence                           │
│     ├─ Review booster evidence/screenshots                           │
│     ├─ Approve orders (release payment)                              │
│     └─ Reject orders (with reason)                                   │
│                                                                       │
│  ⚙️  System Settings                                                 │
│     ├─ Platform configuration                                        │
│     ├─ Email templates                                               │
│     └─ Notification settings                                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎮 Dashboard 2: Service Provider Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                  SERVICE PROVIDER DASHBOARD                          │
│         (Booster, Advertiser, Team Advertiser - Role-Based Tabs)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Top Navigation Tabs (visible based on user's roles):                │
│  [📊 Advertiser] [👥 Team Advertiser] [🎮 Booster]                  │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📊 ADVERTISER TAB (Advertiser role required)                        │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                       │
│  Sidebar:                                                            │
│                                                                       │
│  🏠 Dashboard Home                                                   │
│     ├─ Earnings summary                                              │
│     ├─ Active services count                                         │
│     └─ Recent orders                                                 │
│                                                                       │
│  📝 My Services                                                      │
│     ├─ List of personal services                                     │
│     ├─ Create New Service                                            │
│     │   ├─ Can create: Mythic+, Leveling, Delves, Custom            │
│     │   └─ CANNOT create: Raids (only Admin can)                     │
│     ├─ Edit services                                                 │
│     ├─ Delete services                                               │
│     └─ Activate/Deactivate services                                  │
│                                                                       │
│  🏰 Raid Booking                                                     │
│     ├─ View available raids (created by Admin)                       │
│     ├─ Book buyers for raid slots                                    │
│     └─ Manage raid bookings                                          │
│                                                                       │
│  📦 My Orders                                                        │
│     ├─ Orders for advertiser's services                              │
│     ├─ Assign boosters to orders                                     │
│     ├─ Review evidence submitted by boosters                         │
│     ├─ Approve/Reject orders                                         │
│     └─ View order details                                            │
│                                                                       │
│  💰 Earnings                                                         │
│     ├─ Total earnings (Gold, USD, Toman)                             │
│     ├─ Pending earnings (orders awaiting approval)                   │
│     ├─ Earnings history                                              │
│     └─ Earnings per service                                          │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  👥 TEAM ADVERTISER TAB (Team Advertiser role required)              │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                       │
│  All Advertiser features PLUS:                                       │
│                                                                       │
│  🏢 Team Management                                                  │
│     ├─ Create Team                                                   │
│     ├─ Team Information                                              │
│     ├─ Invite Members                                                │
│     ├─ Remove Members                                                │
│     └─ View Team Performance                                         │
│                                                                       │
│  🔄 Workspace Switcher (Top of page)                                 │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ [Personal Workspace ▼] [Team Workspace ▼]              │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                       │
│     PERSONAL WORKSPACE:                                              │
│     ├─ My own services                                               │
│     ├─ Earnings → My wallet                                          │
│     └─ Only I can manage                                             │
│                                                                       │
│     TEAM WORKSPACE:                                                  │
│     ├─ Team services (collaborative)                                 │
│     ├─ All team members can create/edit                              │
│     ├─ Earnings → Team Leader's wallet                               │
│     ├─ Activity Log (who did what)                                   │
│     │   ├─ Service created by [User]                                 │
│     │   ├─ Price updated by [User]                                   │
│     │   └─ Service activated by [User]                               │
│     └─ Team Orders                                                   │
│                                                                       │
│  📊 Team Analytics                                                   │
│     ├─ Total team earnings                                           │
│     ├─ Earnings per member                                           │
│     ├─ Team performance                                              │
│     └─ Member contributions                                          │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🎮 BOOSTER TAB (Booster role required)                              │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                       │
│  Sidebar:                                                            │
│                                                                       │
│  🏠 Dashboard Home                                                   │
│     ├─ Assigned orders count                                         │
│     ├─ Pending earnings                                              │
│     └─ Completion rate                                               │
│                                                                       │
│  📋 Assigned Orders                                                  │
│     ├─ View orders assigned to me                                    │
│     ├─ Start Order (mark as "In Progress")                           │
│     ├─ Upload Evidence                                               │
│     │   ├─ Upload screenshot/image                                   │
│     │   ├─ Add completion notes                                      │
│     │   └─ Submit for review                                         │
│     ├─ View order status                                             │
│     └─ Cannot mark as complete (requires approval)                   │
│                                                                       │
│  💰 My Earnings                                                      │
│     ├─ Total earnings                                                │
│     ├─ Pending payments (awaiting approval)                          │
│     ├─ Completed orders                                              │
│     └─ Earnings history                                              │
│                                                                       │
│  👤 Profile                                                          │
│     ├─ Update personal information                                   │
│     ├─ Change password                                               │
│     └─ Notification preferences                                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Wallet System (Integrated Across Dashboards)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WALLET SYSTEM                                │
│                  (Available to all users with wallet)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Multi-Currency Wallet:                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Gold Balance:  1,500 G                                       │   │
│  │ USD Balance:   $250.00                                       │   │
│  │ Toman Balance: 5,000,000 ﷼                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  💵 Deposit (INSTANT - No Admin Approval)                            │
│     ├─ Select payment method                                         │
│     │   ├─ Credit Card                                               │
│     │   ├─ Crypto Wallet                                             │
│     │   └─ Iranian Bank Card                                         │
│     ├─ Enter amount and currency                                     │
│     ├─ Redirect to payment gateway (Stripe, PayPal, etc.)            │
│     ├─ Payment processed                                             │
│     └─ Balance updated INSTANTLY                                     │
│                                                                       │
│  💸 Withdrawal (REQUIRES Admin Approval)                             │
│     ├─ Select currency and amount                                    │
│     ├─ Select verified payment method                                │
│     ├─ Submit withdrawal request                                     │
│     ├─ Status: "Pending Admin Approval"                              │
│     ├─ Admin reviews and approves/rejects                            │
│     └─ If approved: Funds transferred                                │
│                                                                       │
│  🔄 Currency Conversion (INSTANT)                                    │
│     ├─ Select source currency (Gold/USD/Toman)                       │
│     ├─ Select target currency                                        │
│     ├─ View exchange rate                                            │
│     ├─ Confirm conversion                                            │
│     └─ Balances updated instantly                                    │
│                                                                       │
│  💳 Payment Methods                                                  │
│     ├─ Add payment method                                            │
│     ├─ Verify payment method                                         │
│     ├─ Set default method                                            │
│     └─ Remove payment method                                         │
│                                                                       │
│  📊 Transaction History                                              │
│     ├─ All transactions (deposits, withdrawals, conversions)         │
│     ├─ Filter by type, date, currency                                │
│     └─ View transaction details                                      │
│                                                                       │
│  Connection to Other Features:                                       │
│  ├─ Service Purchases → Deduct from wallet                           │
│  ├─ Order Completion → Add to wallet (booster/advertiser)            │
│  ├─ Shop Purchases → Option to pay from wallet                       │
│  └─ Team Earnings → Add to team leader's wallet                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛒 Shop System (Client Access)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SHOP TAB                                    │
│                    (Available to all users)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Browse Products:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📅 WoW - 30 Days Game Time                                  │   │
│  │ Price: 500 Gold / $15 USD / 750,000 Toman                   │   │
│  │ [Buy with Wallet] [Buy with Card]                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Purchase Flow:                                                      │
│                                                                       │
│  Option 1: Buy with Wallet                                           │
│     ├─ Select currency (Gold/USD/Toman)                              │
│     ├─ Check wallet balance                                          │
│     ├─ Deduct from wallet                                            │
│     ├─ Generate game time code                                       │
│     └─ Send code via email                                           │
│                                                                       │
│  Option 2: Buy with Card                                             │
│     ├─ Select currency (USD/Toman)                                   │
│     ├─ Redirect to payment gateway                                   │
│     ├─ Process payment                                               │
│     ├─ Generate game time code                                       │
│     └─ Send code via email                                           │
│                                                                       │
│  My Purchases:                                                       │
│     ├─ View purchase history                                         │
│     ├─ Access game time codes                                        │
│     └─ Copy codes                                                    │
│                                                                       │
│  Admin Connection:                                                   │
│     └─ Admin manages products in Admin Dashboard > Shop Management   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Order Flow & Evidence System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ORDER COMPLETION WORKFLOW                         │
│              (Connects Buyers, Boosters, Advertisers, Admin)        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Step 1: Order Created                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Buyer purchases service                                      │   │
│  │ Payment deducted from buyer's wallet                         │   │
│  │ Platform holds payment                                       │   │
│  │ Order Status: "Pending"                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓                                            │
│  Step 2: Booster Assigned                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Advertiser/Team Advertiser assigns booster                  │   │
│  │ Booster receives notification                                │   │
│  │ Order Status: "Assigned"                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓                                            │
│  Step 3: Booster Starts Work                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Booster clicks "Start Order"                                │   │
│  │ Order Status: "In Progress"                                 │   │
│  │ Buyer can see booster is working                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓                                            │
│  Step 4: Booster Uploads Evidence                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Booster completes the boost                                 │   │
│  │ Booster uploads screenshot/image                            │   │
│  │ Booster adds completion notes                               │   │
│  │ Booster submits for review                                  │   │
│  │ Order Status: "Evidence Submitted"                          │   │
│  │ Evidence stored in database                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓                                            │
│  Step 5: Review Process                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Notification sent to reviewers:                             │   │
│  │   ├─ Admin (can review any order)                           │   │
│  │   ├─ Support (can review any order)                         │   │
│  │   ├─ Advertiser (their services only)                       │   │
│  │   └─ Team Advertiser (their services + team services)       │   │
│  │                                                              │   │
│  │ Reviewer views:                                              │   │
│  │   ├─ Uploaded evidence/screenshot                           │   │
│  │   ├─ Booster's completion notes                             │   │
│  │   └─ Order details                                          │   │
│  │                                                              │   │
│  │ Order Status: "Under Review"                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          ↓                                            │
│  Step 6A: APPROVED                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Reviewer approves order                                      │   │
│  │ Order Status: "Completed"                                    │   │
│  │ Payment released from platform                               │   │
│  │ Booster's wallet: +500 Gold                                  │   │
│  │ Notifications sent to:                                       │   │
│  │   ├─ Booster: "Order completed! Payment received"           │   │
│  │   ├─ Buyer: "Your order has been completed"                 │   │
│  │   └─ Advertiser: "Order completed successfully"             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Step 6B: REJECTED                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Reviewer rejects order                                       │   │
│  │ Order Status: "Rejected"                                     │   │
│  │ Rejection reason added                                       │   │
│  │ Platform still holds payment                                 │   │
│  │ Booster notified with reason                                 │   │
│  │ Booster must upload new evidence                             │   │
│  │ → Back to Step 4                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Evidence Storage:                                                   │
│  ├─ Images stored in S3 or local storage                             │
│  ├─ Linked to order ID                                               │
│  ├─ Accessible by reviewers                                          │
│  └─ Kept for 30 days after completion                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 System Connections & Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HOW EVERYTHING CONNECTS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Discord OAuth                                                       │
│       ↓                                                              │
│  User Registration                                                   │
│       ↓                                                              │
│  Auto-assigned "Client" role                                         │
│       ↓                                                              │
│  User can request additional roles:                                  │
│       ├─ Booster → Admin approves → Booster Tab appears              │
│       ├─ Advertiser → Admin approves → Advertiser Tab appears        │
│       └─ Team Advertiser → Admin approves → Team Tab appears         │
│                                                                       │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                       │
│  ADMIN DASHBOARD CONNECTIONS:                                        │
│                                                                       │
│  Games Management                                                    │
│       ↓                                                              │
│  Creates games & service types                                       │
│       ↓                                                              │
│  Advertisers use these to create services                            │
│                                                                       │
│  Role Approvals                                                      │
│       ↓                                                              │
│  Approves Booster/Advertiser/Team Advertiser requests               │
│       ↓                                                              │
│  Users get access to Service Provider Dashboard tabs                 │
│                                                                       │
│  Withdrawal Approvals                                                │
│       ↓                                                              │
│  Reviews withdrawal requests                                         │
│       ↓                                                              │
│  Approves → Funds transferred to user                                │
│                                                                       │
│  Shop Management                                                     │
│       ↓                                                              │
│  Creates shop products                                               │
│       ↓                                                              │
│  Users see products in Shop tab                                      │
│                                                                       │
│  Order Review                                                        │
│       ↓                                                              │
│  Reviews booster evidence                                            │
│       ↓                                                              │
│  Approves → Payment released to booster                              │
│                                                                       │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                       │
│  SERVICE PROVIDER DASHBOARD CONNECTIONS:                             │
│                                                                       │
│  Advertiser Creates Service                                          │
│       ↓                                                              │
│  Service listed in marketplace                                       │
│       ↓                                                              │
│  Buyer purchases service                                             │
│       ↓                                                              │
│  Order created                                                       │
│       ↓                                                              │
│  Advertiser assigns Booster                                          │
│       ↓                                                              │
│  Booster completes & uploads evidence                                │
│       ↓                                                              │
│  Advertiser/Admin reviews & approves                                 │
│       ↓                                                              │
│  Payment released to Booster's wallet                                │
│                                                                       │
│  Team Advertiser Creates Team                                        │
│       ↓                                                              │
│  Invites members                                                     │
│       ↓                                                              │
│  Members accept                                                      │
│       ↓                                                              │
│  Team Workspace button appears for all members                       │
│       ↓                                                              │
│  Members switch to Team Workspace                                    │
│       ↓                                                              │
│  Create team services collaboratively                                │
│       ↓                                                              │
│  Activity log tracks who did what                                    │
│       ↓                                                              │
│  Team service sold                                                   │
│       ↓                                                              │
│  Earnings → Team Leader's wallet                                     │
│                                                                       │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                       │
│  WALLET CONNECTIONS:                                                 │
│                                                                       │
│  User Deposits                                                       │
│       ↓                                                              │
│  Payment gateway processes                                           │
│       ↓                                                              │
│  Balance updated INSTANTLY                                           │
│                                                                       │
│  User Purchases Service                                              │
│       ↓                                                              │
│  Wallet balance deducted                                             │
│       ↓                                                              │
│  Platform holds payment                                              │
│       ↓                                                              │
│  Order completed & approved                                          │
│       ↓                                                              │
│  Payment released to service provider's wallet                       │
│                                                                       │
│  User Purchases from Shop                                            │
│       ↓                                                              │
│  Option 1: Wallet → Deduct from balance                             │
│  Option 2: Card → Payment gateway                                    │
│       ↓                                                              │
│  Game time code generated & sent                                     │
│                                                                       │
│  User Withdraws                                                      │
│       ↓                                                              │
│  Withdrawal request created                                          │
│       ↓                                                              │
│  Admin reviews & approves                                            │
│       ↓                                                              │
│  Funds transferred to user's payment method                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE ENTITY RELATIONSHIPS                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  users                                                               │
│    ├─ discord_id (unique) ← Discord OAuth                            │
│    ├─ email                                                          │
│    └─ status                                                         │
│         │                                                            │
│         ├──→ user_roles (Many-to-Many)                               │
│         │      ├─ user_id                                            │
│         │      ├─ role_id                                            │
│         │      ├─ status (active/pending_approval/rejected)          │
│         │      └─ approved_by                                        │
│         │                                                            │
│         ├──→ wallet (One-to-One)                                     │
│         │      ├─ balance_gold                                       │
│         │      ├─ balance_usd                                        │
│         │      └─ balance_toman                                      │
│         │           │                                                │
│         │           └──→ transactions (One-to-Many)                  │
│         │                  ├─ type (deposit/withdrawal/conversion)   │
│         │                  ├─ amount                                 │
│         │                  ├─ currency                               │
│         │                  └─ status                                 │
│         │                                                            │
│         ├──→ teams (as leader) (One-to-Many)                         │
│         │      ├─ name                                               │
│         │      ├─ leader_id                                          │
│         │      └─ description                                        │
│         │           │                                                │
│         │           └──→ team_members (One-to-Many)                  │
│         │                  ├─ team_id                                │
│         │                  ├─ user_id                                │
│         │                  ├─ role (leader/member)                   │
│         │                  └─ status                                 │
│         │                                                            │
│         ├──→ services (as creator) (One-to-Many)                     │
│         │      ├─ workspace_type (personal/team)                     │
│         │      ├─ workspace_owner_id (user_id or team_id)            │
│         │      ├─ created_by                                         │
│         │      ├─ game_id                                            │
│         │      ├─ service_type_id                                    │
│         │      └─ prices (gold, usd, toman)                          │
│         │           │                                                │
│         │           ├──→ service_activity_logs (One-to-Many)         │
│         │           │      ├─ service_id                             │
│         │           │      ├─ user_id (who did it)                   │
│         │           │      ├─ action                                 │
│         │           │      └─ changes (JSONB)                        │
│         │           │                                                │
│         │           └──→ orders (One-to-Many)                        │
│         │                  ├─ buyer_id                               │
│         │                  ├─ booster_id                             │
│         │                  ├─ earnings_recipient_id                  │
│         │                  ├─ status                                 │
│         │                  └─ price_paid                             │
│         │                       │                                    │
│         │                       └──→ order_evidence (One-to-Many)    │
│         │                              ├─ order_id                   │
│         │                              ├─ uploaded_by (booster)      │
│         │                              ├─ image_url                  │
│         │                              ├─ notes                      │
│         │                              ├─ review_status              │
│         │                              └─ reviewed_by                │
│         │                                                            │
│         └──→ shop_orders (One-to-Many)                               │
│                ├─ user_id                                            │
│                ├─ product_id                                         │
│                ├─ payment_method (wallet/card)                       │
│                ├─ game_time_code                                     │
│                └─ status                                             │
│                                                                       │
│  games                                                               │
│    ├─ name                                                           │
│    ├─ slug                                                           │
│    └─ is_active                                                      │
│         │                                                            │
│         ├──→ service_types (One-to-Many)                             │
│         │      ├─ game_id                                            │
│         │      ├─ name (Mythic+, Leveling, Raid, etc.)              │
│         │      └─ requires_admin (true for raids)                    │
│         │                                                            │
│         ├──→ services (One-to-Many)                                  │
│         │                                                            │
│         └──→ shop_products (One-to-Many)                             │
│                ├─ game_id                                            │
│                ├─ product_type (game_time)                           │
│                ├─ duration_days                                      │
│                ├─ prices (gold, usd, toman)                          │
│                └─ stock_type                                         │
│                                                                       │
│  roles                                                               │
│    ├─ name (client, booster, advertiser, team_advertiser, admin)    │
│    ├─ requires_approval                                              │
│    └─ display_name                                                   │
│         │                                                            │
│         └──→ user_roles (Many-to-Many with users)                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features Summary

### Multi-Role System
- Users can have multiple roles simultaneously
- Example: User can be Booster + Advertiser + Team Advertiser
- Each role gives access to specific tabs in Service Provider Dashboard

### Team Workspace
- Team Advertisers create teams
- Invite members to collaborate
- Context switching: Personal ↔ Team
- Activity logging tracks who did what
- Team earnings go to team leader's wallet

### Wallet System
- Multi-currency: Gold, USD, Toman
- Deposits: INSTANT (via payment gateway)
- Withdrawals: Require admin approval
- Currency conversion: INSTANT
- Connected to all payment flows

### Order Completion
- Booster uploads evidence (screenshot)
- Admin/Support/Advertiser reviews
- Approval required before payment release
- Evidence stored for accountability

### Shop System
- Sell game time and subscriptions
- Dual payment: Wallet or Online
- Admin manages products
- Instant code delivery

---

## 📊 User Journey Examples

### Example 1: New User Becomes Booster
```
1. Register with Discord
2. Auto-assigned "Client" role
3. Request "Booster" role
4. Admin approves
5. Booster tab appears in Service Provider Dashboard
6. Get assigned to orders
7. Complete boosts & upload evidence
8. Get paid when approved
```

### Example 2: Advertiser Creates Team
```
1. User has Advertiser role
2. Request "Team Advertiser" role
3. Admin approves
4. Team Advertiser tab appears
5. Create team "Elite Boosters"
6. Invite Sarah and Mike
7. They accept invitations
8. Team Workspace button appears for all
9. Create team services collaboratively
10. Earnings go to team leader's wallet
```

### Example 3: Complete Order Flow
```
1. Buyer purchases Mythic+20 service (500 Gold)
2. Payment deducted from buyer's wallet
3. Advertiser assigns booster Mike
4. Mike completes boost
5. Mike uploads screenshot + notes
6. Advertiser reviews evidence
7. Advertiser approves
8. 500 Gold added to Mike's wallet
9. All parties notified
```

---

**This map shows ALL connections, relationships, and workflows in the system!** 🎉
