# Requirements Document

## Introduction

This document outlines the requirements for a comprehensive multi-wallet system that replaces the current static 3-currency wallet (Gold, USD, Toman) with a dynamic system supporting unlimited game-specific gold wallets. The system includes admin management capabilities for games/realms, user wallet management, admin gold deposits with withdrawal restrictions, and comprehensive testing with Playwright.

## Glossary

- **Multi_Wallet_System**: The new wallet management system supporting static fiat currencies and dynamic game-specific gold wallets
- **Static_Wallet**: Fixed wallets that every user has (Toman and USD)
- **Dynamic_Gold_Wallet**: Game/realm-specific gold wallets that users can add from admin-created options
- **Game_Realm**: A specific server or realm within a game (e.g., Kazzak, Stormrage, Ragnaros)
- **Admin_Gold_Deposit**: Gold deposited by admin that has withdrawal restrictions
- **Suspended_Gold**: Gold deposited by admin that cannot be directly withdrawn for 2 months but can be converted to fiat currencies with fees
- **Withdrawable_Gold**: Gold that users can withdraw directly (earned or past suspension period)
- **Conversion_Fee**: Additional fee applied when converting suspended gold to fiat currencies
- **Wallet_Management_Tab**: User interface for managing multiple wallets
- **Admin_Panel**: Administrative interface for managing games, realms, and user accounts

## Requirements

### Requirement 1

**User Story:** As an admin, I want to manage games and their realms, so that I can provide wallet options for users

#### Acceptance Criteria

1. WHEN an admin accesses the admin panel, THE Multi_Wallet_System SHALL display a games management section
2. THE Multi_Wallet_System SHALL allow admins to create new games with name and description
3. THE Multi_Wallet_System SHALL allow admins to add unlimited realms to each game
4. THE Multi_Wallet_System SHALL allow admins to edit or deactivate existing games and realms
5. THE Multi_Wallet_System SHALL validate that realm names are unique within each game

### Requirement 2

**User Story:** As a user (booster, advertiser, team advertiser), I want to have static wallets for fiat currencies, so that I can manage my real money

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL provide every user with a Toman wallet by default
2. THE Multi_Wallet_System SHALL provide every user with a USD wallet by default
3. THE Multi_Wallet_System SHALL prevent users from removing static wallets
4. THE Multi_Wallet_System SHALL display static wallets prominently in the wallet interface
5. THE Multi_Wallet_System SHALL maintain existing functionality for Toman and USD transactions

### Requirement 3

**User Story:** As a user, I want to add game-specific gold wallets from available options, so that I can manage gold for different game realms

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL display all available game realms in the wallet management interface
2. WHEN a user selects a game realm, THE Multi_Wallet_System SHALL add that gold wallet to their account
3. THE Multi_Wallet_System SHALL allow users to add multiple gold wallets for different realms
4. THE Multi_Wallet_System SHALL prevent duplicate gold wallets for the same realm per user
5. THE Multi_Wallet_System SHALL display gold wallets with format "[Realm Name] Gold" (e.g., "Kazzak Gold")

### Requirement 4

**User Story:** As a user, I want to remove gold wallets I no longer need, so that I can keep my wallet interface clean

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL allow users to remove gold wallets they have added
2. WHEN a user removes a gold wallet with zero balance, THE Multi_Wallet_System SHALL remove it immediately
3. IF a user attempts to remove a gold wallet with non-zero balance, THEN THE Multi_Wallet_System SHALL require confirmation
4. THE Multi_Wallet_System SHALL prevent removal of static wallets (Toman and USD)
5. THE Multi_Wallet_System SHALL update the wallet interface immediately after removal

### Requirement 5

**User Story:** As an admin, I want to deposit gold to user accounts with withdrawal restrictions, so that I can provide gold while preventing immediate gold withdrawal

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL provide an admin interface for depositing gold to user accounts
2. WHEN an admin deposits gold to a user account, THE Multi_Wallet_System SHALL mark it as suspended for 2 months
3. THE Multi_Wallet_System SHALL track the deposit date and calculate withdrawal eligibility
4. THE Multi_Wallet_System SHALL prevent direct withdrawal of suspended gold before the 2-month period
5. THE Multi_Wallet_System SHALL automatically convert suspended gold to withdrawable after 2 months

### Requirement 6

**User Story:** As a user, I want to see my suspended and withdrawable gold separately, so that I understand what I can withdraw

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL display suspended gold amount for each gold wallet
2. THE Multi_Wallet_System SHALL display withdrawable gold amount for each gold wallet
3. THE Multi_Wallet_System SHALL show the date when suspended gold becomes withdrawable
4. THE Multi_Wallet_System SHALL calculate total gold as suspended plus withdrawable
5. THE Multi_Wallet_System SHALL update these amounts in real-time as restrictions expire

### Requirement 7

**User Story:** As an admin, I want to view and manage all user gold deposits, so that I can track gold distribution and restrictions

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL provide an admin panel section for gold deposit management
2. THE Multi_Wallet_System SHALL display all gold deposits with user, amount, date, and status
3. THE Multi_Wallet_System SHALL allow filtering deposits by user, game realm, and status
4. THE Multi_Wallet_System SHALL show remaining suspension time for each deposit
5. THE Multi_Wallet_System SHALL allow admins to view deposit history for any user

### Requirement 8

**User Story:** As a developer, I want comprehensive Playwright tests for the wallet system, so that I can ensure all functionality works correctly

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL include Playwright tests for admin game and realm management
2. THE Multi_Wallet_System SHALL include Playwright tests for user wallet addition and removal
3. THE Multi_Wallet_System SHALL include Playwright tests for admin gold deposits with restrictions
4. THE Multi_Wallet_System SHALL include Playwright tests for suspended vs withdrawable gold display
5. THE Multi_Wallet_System SHALL include Playwright tests for wallet interface responsiveness and accessibility

### Requirement 9

**User Story:** As a user, I want to perform transactions with my gold wallets, so that I can use gold for purchases and receive earnings

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL allow users to make purchases using gold from specific realm wallets
2. THE Multi_Wallet_System SHALL allow users to receive earnings in specific realm gold wallets
3. THE Multi_Wallet_System SHALL prevent transactions that exceed withdrawable gold balance
4. THE Multi_Wallet_System SHALL update both suspended and withdrawable gold appropriately for transactions
5. THE Multi_Wallet_System SHALL maintain transaction history for each gold wallet separately

### Requirement 10

**User Story:** As a user, I want to convert suspended gold to fiat currencies with exchange fees, so that I can access the value of admin-deposited gold before the 2-month restriction expires

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL allow users to convert suspended gold to USD or Toman currencies
2. THE Multi_Wallet_System SHALL apply exchange rates plus additional conversion fees for suspended gold conversions
3. THE Multi_Wallet_System SHALL clearly display the conversion fee before confirming the transaction
4. THE Multi_Wallet_System SHALL allow withdrawal of converted USD or Toman immediately after conversion
5. THE Multi_Wallet_System SHALL create transaction records showing the conversion fee applied

### Requirement 11

**User Story:** As an admin, I want to configure conversion fees for suspended gold, so that I can control the cost of early access to restricted funds

#### Acceptance Criteria

1. THE Multi_Wallet_System SHALL allow admins to set conversion fee percentages for suspended gold to fiat conversions
2. THE Multi_Wallet_System SHALL apply different fee rates for USD and Toman conversions if configured
3. THE Multi_Wallet_System SHALL display current conversion fees in the admin panel
4. THE Multi_Wallet_System SHALL apply no additional fees for withdrawable gold conversions
5. THE Multi_Wallet_System SHALL update conversion fees immediately when changed by admin

### Requirement 12

**User Story:** As a user, I want to convert between different gold wallets, so that I can consolidate or redistribute my gold

#### Acceptance Criteria

1. WHERE gold conversion is enabled, THE Multi_Wallet_System SHALL allow conversion between different realm gold wallets
2. THE Multi_Wallet_System SHALL apply appropriate exchange rates for gold conversions
3. THE Multi_Wallet_System SHALL allow conversion of both suspended and withdrawable gold between gold wallets
4. THE Multi_Wallet_System SHALL create transaction records for all gold conversions
5. THE Multi_Wallet_System SHALL maintain the suspended/withdrawable status when converting between gold wallets