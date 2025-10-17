# Requirements Document

## Introduction

This document outlines the requirements for a gaming services marketplace web application prototype. The prototype will be a frontend-only implementation featuring a Discord-themed modern UI/UX that demonstrates the complete user experience flow described in the system documentation. The prototype will use browser storage for data persistence and will not require backend services or databases.

## Glossary

- **Gaming_Marketplace_System**: The complete web application prototype for gaming services marketplace
- **Discord_Theme**: A modern dark theme with colors and styling similar to Discord's interface
- **Browser_Storage**: Local storage and session storage APIs for data persistence
- **Admin_Dashboard**: Separate administrative interface accessible only to users with admin role
- **Service_Provider_Dashboard**: Main dashboard interface for users with booster, advertiser, or team advertiser roles with role-based tabs
- **Multi_Role_System**: System allowing users to have multiple roles simultaneously (client, booster, advertiser, team advertiser, admin)
- **Wallet_System**: Multi-currency wallet supporting Gold (in-game currency), USD, and Toman currencies
- **Team_Workspace_System**: Collaborative workspace system allowing team advertisers to create teams and switch between personal and team contexts
- **Order_Evidence_System**: System for boosters to upload screenshots and completion notes for order approval
- **Shop_System**: Interface for purchasing game time products with dual payment options (wallet or direct payment)
- **Workspace_Switcher**: Interface component showing "[Personal Workspace ▼] [Team Workspace ▼]" buttons for context switching

## Requirements

### Requirement 1

**User Story:** As a user, I want to authenticate using Discord OAuth simulation, so that I can access the gaming marketplace platform with my Discord identity.

#### Acceptance Criteria

1. WHEN a user visits the application, THE Gaming_Marketplace_System SHALL display a Discord OAuth login simulation interface
2. WHEN a user completes the simulated Discord authentication, THE Gaming_Marketplace_System SHALL create a user session with Discord user information stored in Browser_Storage
3. WHEN authentication is successful, THE Gaming_Marketplace_System SHALL automatically assign the "Client" role to new users
4. WHEN a user is authenticated, THE Gaming_Marketplace_System SHALL redirect to the appropriate dashboard based on their roles (Admin_Dashboard for admin role, Service_Provider_Dashboard for other roles)
5. WHEN a user logs out, THE Gaming_Marketplace_System SHALL clear all session data from Browser_Storage

### Requirement 2

**User Story:** As a user with multiple roles, I want to access role-specific dashboard interfaces, so that I can manage different aspects of my gaming services business.

#### Acceptance Criteria

1. WHEN a user has the admin role, THE Gaming_Marketplace_System SHALL display the Admin_Dashboard as a completely separate interface from the Service_Provider_Dashboard
2. WHEN a user has booster, advertiser, or team advertiser roles, THE Gaming_Marketplace_System SHALL display the Service_Provider_Dashboard with top navigation tabs based on their roles
3. WHEN a user has multiple service provider roles, THE Gaming_Marketplace_System SHALL show tabs labeled "[📊 Advertiser] [👥 Team Advertiser] [🎮 Booster]" with icons
4. WHEN a user switches between tabs, THE Gaming_Marketplace_System SHALL maintain the current workspace context and display role-specific sidebar navigation
5. WHEN a user lacks a specific role, THE Gaming_Marketplace_System SHALL hide the corresponding tab from the top navigation

### Requirement 3

**User Story:** As an admin, I want to manage the platform through a comprehensive admin dashboard, so that I can control games, users, orders, and financial operations.

#### Acceptance Criteria

1. WHEN an admin accesses the admin dashboard, THE Gaming_Marketplace_System SHALL display sidebar navigation with sections: Dashboard Home, Games Management, Users & Roles, Pending Role Requests, Financial Management, Exchange Rates, Shop Management, Order Review, and System Settings
2. WHEN an admin manages games, THE Gaming_Marketplace_System SHALL allow creation of service types including Mythic+ Dungeon, Leveling, Delve, Custom Boost, and Raid (where only admin can create Raid services)
3. WHEN an admin reviews role requests, THE Gaming_Marketplace_System SHALL display pending requests for Booster, Advertiser, and Team Advertiser roles with approve and reject actions
4. WHEN an admin manages financial operations, THE Gaming_Marketplace_System SHALL show pending withdrawals requiring approval and deposit history (view only, as deposits are instant)
5. WHEN an admin reviews orders, THE Gaming_Marketplace_System SHALL display orders with submitted evidence including booster screenshots and completion notes for approval or rejection

### Requirement 4

**User Story:** As an advertiser, I want to create and manage gaming services, so that I can offer boosting services to clients.

#### Acceptance Criteria

1. WHEN an advertiser creates a service, THE Gaming_Marketplace_System SHALL provide a form allowing creation of Mythic+, Leveling, Delves, and Custom services but NOT Raid services (admin only)
2. WHEN an advertiser manages services, THE Gaming_Marketplace_System SHALL display sidebar navigation with Dashboard Home, My Services, Raid Booking, My Orders, and Earnings sections
3. WHEN an advertiser assigns boosters to orders, THE Gaming_Marketplace_System SHALL show available boosters and assignment interface in the My Orders section
4. WHEN an advertiser reviews order evidence, THE Gaming_Marketplace_System SHALL display booster-uploaded screenshots and completion notes with approve/reject options
5. WHEN an advertiser accesses raid booking, THE Gaming_Marketplace_System SHALL allow booking buyers for raid slots created by admin

### Requirement 5

**User Story:** As a team advertiser, I want to create and manage teams with collaborative workspaces, so that I can work with team members on shared services.

#### Acceptance Criteria

1. WHEN a team advertiser creates a team, THE Gaming_Marketplace_System SHALL provide team creation form and add Team Management section to sidebar with Create Team, Team Information, Invite Members, Remove Members, and View Team Performance options
2. WHEN a team advertiser invites members, THE Gaming_Marketplace_System SHALL send invitations and track member status with invitation acceptance workflow
3. WHEN team members accept invitations, THE Gaming_Marketplace_System SHALL display Workspace_Switcher at the top of the Service_Provider_Dashboard for all team members
4. WHEN users have team access, THE Gaming_Marketplace_System SHALL show "[Personal Workspace ▼] [Team Workspace ▼]" buttons exactly as specified in the documentation
5. WHEN users switch to team workspace, THE Gaming_Marketplace_System SHALL display "Team Workspace: [Team Name] - All earnings go to team leader" banner and show team services with activity logs

### Requirement 6

**User Story:** As a team member, I want to switch between personal and team workspaces, so that I can manage my individual services separately from collaborative team services.

#### Acceptance Criteria

1. WHEN a user is a team member, THE Gaming_Marketplace_System SHALL display Workspace_Switcher buttons only if they belong to a team
2. WHEN a user clicks "Personal Workspace", THE Gaming_Marketplace_System SHALL show their individual services with earnings going to their own wallet
3. WHEN a user clicks "Team Workspace", THE Gaming_Marketplace_System SHALL show team services where all team members can create and edit collaboratively
4. WHEN in team workspace, THE Gaming_Marketplace_System SHALL display activity log showing "Service created by [User]", "Price updated by [User]", "Service activated by [User]" with user attribution
5. WHEN team members modify services in team workspace, THE Gaming_Marketplace_System SHALL log all activities with user attribution and timestamp in Browser_Storage

### Requirement 7

**User Story:** As a booster, I want to manage assigned orders and upload completion evidence, so that I can complete work and receive payment.

#### Acceptance Criteria

1. WHEN a booster views assigned orders, THE Gaming_Marketplace_System SHALL display sidebar navigation with Dashboard Home, Assigned Orders, My Earnings, and Profile sections
2. WHEN a booster starts an order, THE Gaming_Marketplace_System SHALL update order status to "In Progress" and allow the booster to mark work as started
3. WHEN a booster uploads evidence, THE Gaming_Marketplace_System SHALL provide image upload interface for screenshots and text field for completion notes
4. WHEN a booster submits evidence, THE Gaming_Marketplace_System SHALL change order status to "Evidence Submitted" and prevent further editing by the booster
5. WHEN evidence is reviewed, THE Gaming_Marketplace_System SHALL display approval status and rejection reasons (if rejected) requiring booster to resubmit

### Requirement 8

**User Story:** As a user, I want to manage my multi-currency wallet, so that I can deposit, withdraw, convert currencies, and make purchases.

#### Acceptance Criteria

1. WHEN a user accesses their wallet, THE Gaming_Marketplace_System SHALL display balances for Gold (G), USD ($), and Toman (﷼) currencies with proper symbols
2. WHEN a user initiates a deposit, THE Gaming_Marketplace_System SHALL simulate payment gateway integration with Credit Card, Crypto Wallet, and Iranian Bank Card options and update balance instantly (no admin approval)
3. WHEN a user requests a withdrawal, THE Gaming_Marketplace_System SHALL create pending withdrawal request with status "Pending Admin Approval" requiring admin review
4. WHEN a user converts currencies, THE Gaming_Marketplace_System SHALL apply current exchange rates for Gold ↔ USD ↔ Toman conversions and update balances instantly
5. WHEN a user makes purchases, THE Gaming_Marketplace_System SHALL deduct appropriate amounts from wallet balance and hold payment until order completion

### Requirement 9

**User Story:** As a client, I want to browse and purchase gaming services, so that I can get boosting services for my games.

#### Acceptance Criteria

1. WHEN a client browses services, THE Gaming_Marketplace_System SHALL display available services with filtering by game and service type
2. WHEN a client views service details, THE Gaming_Marketplace_System SHALL show multi-currency pricing (Gold, USD, Toman) and service description
3. WHEN a client purchases a service, THE Gaming_Marketplace_System SHALL create order with status "Pending" and deduct payment from wallet
4. WHEN a client tracks orders, THE Gaming_Marketplace_System SHALL display order status progression: Pending → Assigned → In Progress → Evidence Submitted → Under Review → Completed/Rejected
5. WHEN orders are completed, THE Gaming_Marketplace_System SHALL notify clients and release payment to booster's wallet

### Requirement 10

**User Story:** As a user, I want to purchase game time from the shop, so that I can buy subscriptions using wallet balance or direct payment.

#### Acceptance Criteria

1. WHEN a user accesses the shop, THE Gaming_Marketplace_System SHALL display game time products (WoW 30/60/90 days) with pricing in Gold, USD, and Toman
2. WHEN a user selects "Buy with Wallet", THE Gaming_Marketplace_System SHALL check balance and process payment if sufficient funds exist
3. WHEN a user selects "Buy with Card", THE Gaming_Marketplace_System SHALL simulate payment gateway for USD/Toman currencies
4. WHEN purchase is completed, THE Gaming_Marketplace_System SHALL generate game time code in format "XXXX-XXXX-XXXX-XXXX" and display to user
5. WHEN a user views purchase history, THE Gaming_Marketplace_System SHALL show all shop orders with game time codes and copy functionality

### Requirement 11

**User Story:** As a user, I want to experience the complete order evidence system, so that I can understand the order completion workflow.

#### Acceptance Criteria

1. WHEN a booster uploads evidence, THE Gaming_Marketplace_System SHALL accept PNG, JPG, JPEG formats with max 10MB size and minimum 800x600 resolution
2. WHEN evidence is submitted, THE Gaming_Marketplace_System SHALL notify reviewers (Admin, Support, Advertiser for their services, Team Advertiser for their and team services)
3. WHEN reviewers examine evidence, THE Gaming_Marketplace_System SHALL display uploaded screenshot, booster completion notes, and order details
4. WHEN evidence is approved, THE Gaming_Marketplace_System SHALL change order status to "Completed" and release payment to booster's wallet
5. WHEN evidence is rejected, THE Gaming_Marketplace_System SHALL change order status to "Rejected", provide rejection reason, and allow booster to resubmit

### Requirement 12

**User Story:** As a user, I want to experience a modern Discord-themed interface, so that I have an engaging and familiar user experience.

#### Acceptance Criteria

1. WHEN the application loads, THE Gaming_Marketplace_System SHALL display a dark theme with Discord-inspired color palette (#2f3136 background, #36393f secondary, #7289da accent colors)
2. WHEN users interact with interface elements, THE Gaming_Marketplace_System SHALL provide smooth hover effects and Discord-style button animations
3. WHEN users navigate between sections, THE Gaming_Marketplace_System SHALL maintain consistent Discord-style sidebar navigation and card layouts
4. WHEN displaying data tables and forms, THE Gaming_Marketplace_System SHALL use Discord-style input fields, buttons, and typography (Whitney font family or similar)
5. WHEN showing notifications and modals, THE Gaming_Marketplace_System SHALL use Discord-inspired toast notifications and modal overlays with proper z-index layering