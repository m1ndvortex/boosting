// Multi-Wallet Validation Service - Comprehensive validation for all wallet operations

import type { 
  MultiWallet, 
  GameRealm
} from '../types';
import { ErrorCode } from './errorService';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationWarning {
  field: string;
  message: string;
  details?: Record<string, unknown>;
}

export class MultiWalletValidationService {
  // ===== WALLET VALIDATION =====
  
  /**
   * Validate wallet creation request
   */
  static validateWalletCreation(userId: string, realmId: string, existingWallet?: MultiWallet): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      errors.push({
        field: 'userId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'User ID is required'
      });
    }

    // Validate realm ID
    if (!realmId || typeof realmId !== 'string' || realmId.trim().length === 0) {
      errors.push({
        field: 'realmId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Realm ID is required'
      });
    }

    // Check for duplicate wallet
    if (existingWallet && existingWallet.goldWallets[realmId]) {
      errors.push({
        field: 'realmId',
        code: 'DUPLICATE_WALLET',
        message: 'A wallet for this realm already exists',
        details: { realmId, existingWallet: existingWallet.goldWallets[realmId] }
      });
    }

    // Check wallet limit (optional warning)
    if (existingWallet && Object.keys(existingWallet.goldWallets).length >= 10) {
      warnings.push({
        field: 'walletCount',
        message: 'You have many gold wallets. Consider removing unused ones for better organization.',
        details: { currentCount: Object.keys(existingWallet.goldWallets).length }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate wallet removal request
   */
  static validateWalletRemoval(userId: string, realmId: string, wallet: MultiWallet): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      errors.push({
        field: 'userId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'User ID is required'
      });
    }

    // Validate realm ID
    if (!realmId || typeof realmId !== 'string' || realmId.trim().length === 0) {
      errors.push({
        field: 'realmId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Realm ID is required'
      });
    }

    // Check if wallet exists
    const goldWallet = wallet.goldWallets[realmId];
    if (!goldWallet) {
      errors.push({
        field: 'realmId',
        code: 'WALLET_NOT_FOUND',
        message: 'Gold wallet not found',
        details: { realmId }
      });
      return { isValid: false, errors, warnings };
    }

    // Check for non-zero balance
    if (goldWallet.totalGold > 0) {
      warnings.push({
        field: 'balance',
        message: `Wallet has ${goldWallet.totalGold} gold. Removing will lose this balance.`,
        details: { 
          totalGold: goldWallet.totalGold,
          suspendedGold: goldWallet.suspendedGold,
          withdrawableGold: goldWallet.withdrawableGold
        }
      });
    }

    // Check for pending suspended deposits
    const pendingSuspended = goldWallet.suspendedDeposits.filter(d => d.status === 'suspended');
    if (pendingSuspended.length > 0) {
      warnings.push({
        field: 'suspendedDeposits',
        message: `Wallet has ${pendingSuspended.length} suspended deposits that will become withdrawable later.`,
        details: { pendingDeposits: pendingSuspended.length }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===== TRANSACTION VALIDATION =====

  /**
   * Validate transaction amount and wallet balance
   */
  static validateTransaction(
    amount: number,
    walletType: 'static' | 'gold',
    walletId: string,
    wallet: MultiWallet,
    transactionType: 'debit' | 'credit',
    goldType?: 'suspended' | 'withdrawable'
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push({
        field: 'amount',
        code: ErrorCode.INVALID_INPUT,
        message: 'Amount must be a valid number'
      });
    } else if (amount <= 0) {
      errors.push({
        field: 'amount',
        code: ErrorCode.INVALID_INPUT,
        message: 'Amount must be greater than zero'
      });
    } else if (amount > 1000000) {
      warnings.push({
        field: 'amount',
        message: 'Large transaction amount. Please verify this is correct.',
        details: { amount }
      });
    }

    // Validate wallet type and ID
    if (!walletType || !['static', 'gold'].includes(walletType)) {
      errors.push({
        field: 'walletType',
        code: ErrorCode.INVALID_INPUT,
        message: 'Wallet type must be either "static" or "gold"'
      });
    }

    if (!walletId || typeof walletId !== 'string' || walletId.trim().length === 0) {
      errors.push({
        field: 'walletId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Wallet ID is required'
      });
    }

    // For debit transactions, check balance
    if (transactionType === 'debit' && errors.length === 0) {
      if (walletType === 'static') {
        const staticWallet = wallet.staticWallets[walletId as 'usd' | 'toman'];
        if (!staticWallet) {
          errors.push({
            field: 'walletId',
            code: 'WALLET_NOT_FOUND',
            message: `Static wallet '${walletId}' not found`
          });
        } else if (staticWallet.balance < amount) {
          errors.push({
            field: 'amount',
            code: ErrorCode.INSUFFICIENT_BALANCE,
            message: `Insufficient ${walletId.toUpperCase()} balance`,
            details: { 
              available: staticWallet.balance, 
              requested: amount,
              currency: walletId
            }
          });
        }
      } else {
        const goldWallet = wallet.goldWallets[walletId];
        if (!goldWallet) {
          errors.push({
            field: 'walletId',
            code: 'WALLET_NOT_FOUND',
            message: 'Gold wallet not found',
            details: { realmId: walletId }
          });
        } else {
          // Check specific gold type balance
          if (goldType === 'suspended') {
            if (goldWallet.suspendedGold < amount) {
              errors.push({
                field: 'amount',
                code: ErrorCode.INSUFFICIENT_BALANCE,
                message: 'Insufficient suspended gold balance',
                details: { 
                  available: goldWallet.suspendedGold, 
                  requested: amount,
                  goldType: 'suspended'
                }
              });
            }
          } else if (goldType === 'withdrawable') {
            if (goldWallet.withdrawableGold < amount) {
              errors.push({
                field: 'amount',
                code: ErrorCode.INSUFFICIENT_BALANCE,
                message: 'Insufficient withdrawable gold balance',
                details: { 
                  available: goldWallet.withdrawableGold, 
                  requested: amount,
                  goldType: 'withdrawable'
                }
              });
            }
          } else {
            // Check total gold balance
            if (goldWallet.totalGold < amount) {
              errors.push({
                field: 'amount',
                code: ErrorCode.INSUFFICIENT_BALANCE,
                message: 'Insufficient gold balance',
                details: { 
                  available: goldWallet.totalGold, 
                  requested: amount
                }
              });
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate conversion transaction
   */
  static validateConversion(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    wallet: MultiWallet,
    goldType?: 'suspended' | 'withdrawable'
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate wallet IDs are different
    if (fromWalletId === toWalletId) {
      errors.push({
        field: 'conversion',
        code: ErrorCode.INVALID_INPUT,
        message: 'Cannot convert to the same wallet'
      });
    }

    // Validate from wallet
    const fromValidation = this.validateTransaction(
      amount, 
      ['usd', 'toman'].includes(fromWalletId) ? 'static' : 'gold',
      fromWalletId,
      wallet,
      'debit',
      goldType
    );

    errors.push(...fromValidation.errors);
    warnings.push(...(fromValidation.warnings || []));

    // Validate to wallet exists
    const toWalletType = ['usd', 'toman'].includes(toWalletId) ? 'static' : 'gold';
    if (toWalletType === 'static') {
      if (!wallet.staticWallets[toWalletId as 'usd' | 'toman']) {
        errors.push({
          field: 'toWalletId',
          code: 'WALLET_NOT_FOUND',
          message: `Target wallet '${toWalletId}' not found`
        });
      }
    } else {
      if (!wallet.goldWallets[toWalletId]) {
        errors.push({
          field: 'toWalletId',
          code: 'WALLET_NOT_FOUND',
          message: 'Target gold wallet not found',
          details: { realmId: toWalletId }
        });
      }
    }

    // Warn about conversion fees for suspended gold
    if (goldType === 'suspended' && toWalletType === 'static') {
      warnings.push({
        field: 'conversionFee',
        message: 'Converting suspended gold to fiat currency will incur additional fees.',
        details: { goldType, targetCurrency: toWalletId }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===== ADMIN VALIDATION =====

  /**
   * Validate admin gold deposit
   */
  static validateAdminGoldDeposit(
    userId: string,
    realmId: string,
    amount: number,
    adminId: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      errors.push({
        field: 'userId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'User ID is required'
      });
    }

    // Validate realm ID
    if (!realmId || typeof realmId !== 'string' || realmId.trim().length === 0) {
      errors.push({
        field: 'realmId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Realm ID is required'
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push({
        field: 'amount',
        code: ErrorCode.INVALID_INPUT,
        message: 'Amount must be a valid number'
      });
    } else if (amount <= 0) {
      errors.push({
        field: 'amount',
        code: ErrorCode.INVALID_INPUT,
        message: 'Deposit amount must be greater than zero'
      });
    } else if (amount > 100000) {
      warnings.push({
        field: 'amount',
        message: 'Large deposit amount. Please verify this is correct.',
        details: { amount }
      });
    }

    // Validate admin ID
    if (!adminId || typeof adminId !== 'string' || adminId.trim().length === 0) {
      errors.push({
        field: 'adminId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Admin ID is required'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate game creation
   */
  static validateGameCreation(name: string, slug: string, icon?: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({
        field: 'name',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Game name is required'
      });
    } else if (name.trim().length < 2) {
      errors.push({
        field: 'name',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Game name must be at least 2 characters long'
      });
    } else if (name.trim().length > 50) {
      errors.push({
        field: 'name',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Game name must be 50 characters or less'
      });
    }

    // Validate slug
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      errors.push({
        field: 'slug',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Game slug is required'
      });
    } else {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(slug.trim())) {
        errors.push({
          field: 'slug',
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Game slug can only contain lowercase letters, numbers, and hyphens'
        });
      } else if (slug.trim().length < 2) {
        errors.push({
          field: 'slug',
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Game slug must be at least 2 characters long'
        });
      } else if (slug.trim().length > 30) {
        errors.push({
          field: 'slug',
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Game slug must be 30 characters or less'
        });
      }
    }

    // Validate icon (optional)
    if (icon && typeof icon === 'string' && icon.trim().length > 0) {
      try {
        new URL(icon.trim());
      } catch {
        // Check if it's a relative path
        if (!icon.trim().startsWith('/') && !icon.trim().startsWith('./')) {
          warnings.push({
            field: 'icon',
            message: 'Icon should be a valid URL or relative path starting with / or ./'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate realm creation
   */
  static validateRealmCreation(gameId: string, realmName: string, existingRealms?: GameRealm[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate game ID
    if (!gameId || typeof gameId !== 'string' || gameId.trim().length === 0) {
      errors.push({
        field: 'gameId',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Game ID is required'
      });
    }

    // Validate realm name
    if (!realmName || typeof realmName !== 'string' || realmName.trim().length === 0) {
      errors.push({
        field: 'realmName',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Realm name is required'
      });
    } else if (realmName.trim().length < 2) {
      errors.push({
        field: 'realmName',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Realm name must be at least 2 characters long'
      });
    } else if (realmName.trim().length > 30) {
      errors.push({
        field: 'realmName',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Realm name must be 30 characters or less'
      });
    }

    // Check for duplicate realm name within the game
    if (existingRealms && gameId && realmName) {
      const gameRealms = existingRealms.filter(r => r.gameId === gameId);
      const duplicateRealm = gameRealms.find(r => 
        r.realmName.toLowerCase() === realmName.trim().toLowerCase()
      );
      
      if (duplicateRealm) {
        errors.push({
          field: 'realmName',
          code: 'DUPLICATE_REALM',
          message: 'A realm with this name already exists in this game',
          details: { gameId, realmName: realmName.trim(), existingRealmId: duplicateRealm.id }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate conversion fee configuration
   */
  static validateConversionFeeConfig(usdFee: number, tomanFee: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate USD fee
    if (typeof usdFee !== 'number' || isNaN(usdFee)) {
      errors.push({
        field: 'usdFee',
        code: ErrorCode.INVALID_INPUT,
        message: 'USD conversion fee must be a valid number'
      });
    } else if (usdFee < 0) {
      errors.push({
        field: 'usdFee',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'USD conversion fee cannot be negative'
      });
    } else if (usdFee > 100) {
      errors.push({
        field: 'usdFee',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'USD conversion fee cannot exceed 100%'
      });
    } else if (usdFee > 20) {
      warnings.push({
        field: 'usdFee',
        message: 'High conversion fee may discourage users from converting suspended gold.',
        details: { fee: usdFee }
      });
    }

    // Validate Toman fee
    if (typeof tomanFee !== 'number' || isNaN(tomanFee)) {
      errors.push({
        field: 'tomanFee',
        code: ErrorCode.INVALID_INPUT,
        message: 'Toman conversion fee must be a valid number'
      });
    } else if (tomanFee < 0) {
      errors.push({
        field: 'tomanFee',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Toman conversion fee cannot be negative'
      });
    } else if (tomanFee > 100) {
      errors.push({
        field: 'tomanFee',
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Toman conversion fee cannot exceed 100%'
      });
    } else if (tomanFee > 20) {
      warnings.push({
        field: 'tomanFee',
        message: 'High conversion fee may discourage users from converting suspended gold.',
        details: { fee: tomanFee }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push({
        field: 'email',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Email is required'
      });
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        errors.push({
          field: 'email',
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Please enter a valid email address'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!password || typeof password !== 'string') {
      errors.push({
        field: 'password',
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        message: 'Password is required'
      });
    } else {
      if (password.length < 8) {
        errors.push({
          field: 'password',
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Password must be at least 8 characters long'
        });
      }

      if (!/[A-Z]/.test(password)) {
        warnings.push({
          field: 'password',
          message: 'Password should contain at least one uppercase letter for better security'
        });
      }

      if (!/[a-z]/.test(password)) {
        warnings.push({
          field: 'password',
          message: 'Password should contain at least one lowercase letter for better security'
        });
      }

      if (!/\d/.test(password)) {
        warnings.push({
          field: 'password',
          message: 'Password should contain at least one number for better security'
        });
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        warnings.push({
          field: 'password',
          message: 'Password should contain at least one special character for better security'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create validation error from service error
   */
  static createValidationErrorFromServiceError(error: unknown, field: string = 'general'): ValidationError {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return {
        field,
        code: (error as any).code,
        message: (error as any).message,
        details: (error as any).details
      };
    }

    return {
      field,
      code: ErrorCode.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}