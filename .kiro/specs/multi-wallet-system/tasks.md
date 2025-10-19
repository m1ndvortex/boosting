# Implementation Plan

- [x] 1. Update core data models and types





  - Extend existing types in `src/types/index.ts` to support multi-wallet system
  - Create new interfaces for MultiWallet, GoldWalletBalance, GameRealm, SuspendedDeposit
  - Update Currency type to support dynamic gold wallet identifiers
  - Add ConversionFeeConfig interface for admin fee management
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 2. Create game and realm management service





  - [x] 2.1 Implement GameManagementService class


    - Create service for managing games and realms using localStorage
    - Implement CRUD operations for games (create, read, update, deactivate)
    - Implement CRUD operations for realms within games
    - Add validation for unique realm names within games
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Add default game data and realm examples


    - Create initial game definitions (World of Warcraft, etc.)
    - Add sample realms (Kazzak, Stormrage, Ragnaros) for testing
    - Implement data seeding functionality for development
    - _Requirements: 1.1, 3.1_

- [x] 3. Extend wallet service for multi-wallet support





  - [x] 3.1 Create MultiWalletService class


    - Extend existing WalletService to support multiple wallet types
    - Implement static wallet management (USD, Toman) with backward compatibility
    - Add gold wallet creation and removal functionality
    - Implement wallet migration from old format to new multi-wallet format
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2_

  - [x] 3.2 Implement suspended gold management


    - Add functionality to track suspended vs withdrawable gold
    - Implement admin gold deposit with 2-month restriction
    - Create automatic expiry processing for suspended gold
    - Add suspended gold status tracking and calculation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.3 Add conversion fee system


    - Create ConversionFeeService for managing fee configurations
    - Implement suspended gold to fiat conversion with fees
    - Add fee calculation and application logic
    - Support different fee rates for USD and Toman conversions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 4. Create admin interface components





  - [x] 4.1 Build GameManagementPanel component





    - Create admin interface for managing games
    - Add forms for creating and editing games
    - Implement game activation/deactivation controls
    - Add validation and error handling for game operations
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 4.2 Build RealmManagementPanel component




    - Create interface for managing realms within games
    - Add forms for creating and editing realms
    - Implement realm activation/deactivation controls
    - Add validation for unique realm names per game
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 4.3 Build AdminGoldDepositPanel component



    - Create interface for depositing gold to user accounts
    - Add user selection and realm selection dropdowns
    - Implement gold amount input with validation
    - Add confirmation dialog for gold deposits
    - _Requirements: 5.1, 5.2, 7.1_

  - [x] 4.4 Build GoldDepositHistoryPanel component



    - Create interface for viewing all gold deposits
    - Add filtering by user, realm, and suspension status
    - Display deposit details including remaining suspension time
    - Implement pagination for large deposit histories
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 4.5 Build ConversionFeeConfigPanel component



    - Create interface for configuring conversion fees
    - Add input fields for USD and Toman conversion fees
    - Implement fee validation and update functionality
    - Display current fee rates prominently
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 5. Update user wallet interface components
  - [x] 5.1 Enhance WalletBalance component for multi-wallet display
    - ✅ Update component to display static wallets (USD, Toman)
    - ✅ Add dynamic gold wallet display with realm names
    - ✅ Show suspended vs withdrawable gold separately
    - ✅ Add visual indicators for different wallet types
    - ✅ Implement proper balance formatting and status badges
    - ✅ Add suspended deposit tracking with countdown timers
    - _Requirements: 2.1, 2.2, 3.5, 6.1, 6.2, 6.4_

  - [x] 5.2 Create GoldWalletManager component
    - ✅ Build interface for adding gold wallets from available realms
    - ✅ Add wallet removal functionality with balance confirmation
    - ✅ Implement duplicate wallet prevention
    - ✅ Create responsive grid layout for multiple wallets
    - ✅ Add realm selection with game grouping
    - ✅ Implement wallet summary statistics
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.3 Create SuspendedGoldDisplay component
    - ✅ Display suspended gold with countdown to withdrawal eligibility
    - ✅ Show conversion options for suspended gold to fiat currencies
    - ✅ Add conversion fee calculator and preview
    - ✅ Implement conversion confirmation with fee disclosure
    - ✅ Add deposit history with progress tracking
    - ✅ Implement real-time countdown updates
    - _Requirements: 6.1, 6.2, 6.3, 10.1, 10.2, 10.3_

  - [x] 5.4 Update WalletActions component
    - ✅ Extend existing actions to support multiple wallet types
    - ✅ Add gold wallet specific actions (add, remove, convert)
    - ✅ Update deposit/withdrawal flows for multi-wallet system
    - ✅ Implement wallet-specific transaction history
    - ✅ Create comprehensive modal forms for all operations
    - ✅ Add proper form validation and error handling
    - _Requirements: 9.1, 9.2, 9.5, 12.1, 12.2_

- [x] 6. Implement transaction system updates





  - [x] 6.1 Extend transaction model and service


    - Update transaction types to support multi-wallet operations
    - Add wallet-specific transaction tracking
    - Implement conversion transactions with fee tracking
    - Add admin deposit transaction type with metadata
    - _Requirements: 9.5, 10.5, 12.4_

  - [x] 6.2 Update transaction history components


    - Modify TransactionHistory to support multiple wallets
    - Add filtering by wallet type and specific gold wallets
    - Display conversion fees in transaction details
    - Show suspended gold transaction restrictions
    - _Requirements: 9.5, 10.5_

- [ ] 7. Add comprehensive Playwright test coverage
  - [ ] 7.7 Create admin interface tests







    - Test game creation, editing, and deactivation
    - Test realm management within games
    - Test gold deposit functionality with restrictions
    - Test conversion fee configuration
    - _Requirements: 8.1_

  - [ ] 7.2 Create user wallet management tests
    - Test adding and removing gold wallets
    - Test static wallet display and functionality
    - Test duplicate wallet prevention
    - Test wallet balance display accuracy
    - _Requirements: 8.2_

  - [ ] 7.3 Create suspended gold conversion tests
    - Test suspended vs withdrawable gold display
    - Test conversion fee calculation and display
    - Test suspended gold to fiat conversion flow
    - Test conversion confirmation and completion
    - _Requirements: 8.3, 8.4_

  - [ ]* 7.4 Create accessibility and responsiveness tests
    - Test keyboard navigation for wallet management
    - Test screen reader compatibility for balance displays
    - Test responsive design across different screen sizes
    - Test color contrast for suspended vs withdrawable indicators
    - _Requirements: 8.5_

- [ ] 8. Integration and migration
  - [x] 8.1 Implement data migration utilities





    - Create migration service to convert existing wallets to multi-wallet format
    - Preserve existing USD, Toman, and gold balances
    - Add backward compatibility for existing transaction history
    - Implement gradual rollout mechanism
    - _Requirements: 2.1, 2.2, 2.5_
-

  - [x] 8.2 Update existing components to use new wallet system








    - Update marketplace components to work with multi-wallet system
    - Modify purchase flows to support gold wallet selection
    - Update earning distribution to specific gold wallets
    - Ensure existing functionality remains intact
    - _Requirements: 9.1, 9.2_
-



  - [x] 8.3 Add error handling and validation





    - Implement comprehensive error handling for wallet operations
    - Add validation for all user inputs and admin operations
    - Create user-friendly error messages and notifications
    - Add loading states for all async operations
    - _Requirements: 3.4, 4.4, 9.3_

- [ ] 9. Performance optimization and polish


  - [ ]* 9.1 Optimize wallet data loading and caching



    - Implement efficient loading for users with many gold wallets
    - Add caching for frequently accessed game/realm data
    - Optimize transaction history queries and pagination
    - _Requirements: 6.5_

  - [ ]* 9.2 Add advanced features and UX improvements
    - Implement wallet search and filtering capabilities
    - Add bulk operations for managing multiple wallets
    - Create wallet analytics and usage statistics
    - Add export functionality for transaction history
    - _Requirements: 7.2, 7.3_