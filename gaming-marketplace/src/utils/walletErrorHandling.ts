// Specialized Error Handling for Wallet Operations

import { UIErrorHandler } from './errorHandling';
import { useNotifications } from '../contexts/NotificationContext';
import type { AppError } from '../services/errorService';
import type { MultiWallet } from '../types';

export interface WalletOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  userMessage?: string;
}

export class WalletErrorHandler {
  /**
   * Handle wallet operation errors with user-friendly messages
   */
  static handleWalletError(error: unknown, operation: string): AppError {
    const appError = UIErrorHandler.handleServiceError(error, {
      context: `wallet_${operation}`,
      logError: true
    });

    // Add wallet-specific error context
    const walletErrorMessages: Record<string, string> = {
      'DUPLICATE_WALLET': 'You already have a wallet for this realm. Each user can only have one wallet per realm.',
      'WALLET_NOT_FOUND': 'The wallet you\'re trying to access doesn\'t exist. Please refresh the page and try again.',
      'INSUFFICIENT_BALANCE': 'You don\'t have enough balance for this transaction. Please check your wallet balance.',
      'SUSPENDED_GOLD_RESTRICTION': 'This gold is currently suspended and cannot be withdrawn directly. You can convert it to USD or Toman with additional fees.',
      'CONVERSION_FEE_ERROR': 'There was an issue calculating conversion fees. Please try again or contact support.',
      'INVALID_TRANSACTION': 'The transaction details are invalid. Please check your input and try again.',
      'REALM_NOT_FOUND': 'The selected game realm is not available. Please choose a different realm.',
      'WALLET_HAS_BALANCE': 'Cannot remove wallet with remaining balance. Please withdraw or transfer your funds first.'
    };

    // Override message if we have a wallet-specific one
    if (walletErrorMessages[appError.code]) {
      appError.message = walletErrorMessages[appError.code];
    }

    return appError;
  }

  /**
   * Get user-friendly action suggestions for wallet errors
   */
  static getWalletErrorSuggestions(error: AppError): string[] {
    const suggestions: Record<string, string[]> = {
      'DUPLICATE_WALLET': [
        'Check your existing wallets in the wallet management section',
        'If you need to change realms, remove the existing wallet first'
      ],
      'WALLET_NOT_FOUND': [
        'Refresh the page to reload your wallet data',
        'Check if the wallet was recently removed',
        'Contact support if the problem persists'
      ],
      'INSUFFICIENT_BALANCE': [
        'Add funds to your wallet through the deposit section',
        'Check if you have sufficient balance in the correct wallet',
        'Consider using a different payment method'
      ],
      'SUSPENDED_GOLD_RESTRICTION': [
        'Convert suspended gold to USD or Toman (fees apply)',
        'Wait for the suspension period to expire',
        'Check the suspension end date in your wallet'
      ],
      'CONVERSION_FEE_ERROR': [
        'Refresh the page and try the conversion again',
        'Check if conversion fees have been updated',
        'Try converting a smaller amount'
      ],
      'REALM_NOT_FOUND': [
        'Refresh the page to reload available realms',
        'Choose a different game realm',
        'Contact support if the realm should be available'
      ],
      'WALLET_HAS_BALANCE': [
        'Withdraw your remaining balance first',
        'Transfer funds to another wallet',
        'Convert gold to fiat currency if applicable'
      ]
    };

    return suggestions[error.code] || [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the problem continues'
    ];
  }

  /**
   * Format wallet balance for display with proper currency symbols
   */
  static formatWalletBalance(amount: number, currency: 'usd' | 'toman' | 'gold'): string {
    const formatters = {
      usd: (amt: number) => `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      toman: (amt: number) => `${amt.toLocaleString('fa-IR')} تومان`,
      gold: (amt: number) => `${amt.toLocaleString()} G`
    };

    return formatters[currency](amount);
  }

  /**
   * Validate wallet operation before execution
   */
  static validateWalletOperation(
    operation: 'create' | 'remove' | 'deposit' | 'withdraw' | 'convert',
    wallet: MultiWallet,
    params: Record<string, any>
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (operation) {
      case 'create':
        if (Object.keys(wallet.goldWallets).length >= 10) {
          warnings.push('You have many gold wallets. Consider removing unused ones for better organization.');
        }
        break;

      case 'remove':
        const goldWallet = wallet.goldWallets[params.realmId];
        if (goldWallet && goldWallet.totalGold > 0) {
          warnings.push(`This wallet has ${this.formatWalletBalance(goldWallet.totalGold, 'gold')} remaining. Removing it will lose this balance.`);
        }
        break;

      case 'withdraw':
        const withdrawWallet = params.walletType === 'static' 
          ? wallet.staticWallets[params.walletId as 'usd' | 'toman']
          : wallet.goldWallets[params.walletId];
        
        if (!withdrawWallet) {
          errors.push('Selected wallet not found');
        } else {
          const availableBalance = params.walletType === 'static' 
            ? (withdrawWallet as any).balance 
            : (withdrawWallet as any).withdrawableGold || 0;
          
          if (availableBalance < params.amount) {
            errors.push(`Insufficient balance. Available: ${this.formatWalletBalance(availableBalance, params.currency)}`);
          }
        }
        break;

      case 'convert':
        if (params.fromWalletId === params.toWalletId) {
          errors.push('Cannot convert to the same wallet');
        }
        
        if (params.goldType === 'suspended') {
          warnings.push('Converting suspended gold will incur additional fees');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a wallet operation wrapper with error handling
   */
  static async executeWalletOperation<T>(
    operation: () => Promise<T>,
    operationType: string
  ): Promise<WalletOperationResult<T>> {
    try {
      const data = await operation();
      
      const successMessages: Record<string, string> = {
        'create_wallet': 'Wallet created successfully',
        'remove_wallet': 'Wallet removed successfully',
        'deposit': 'Deposit completed successfully',
        'withdraw': 'Withdrawal request submitted successfully',
        'convert': 'Conversion completed successfully'
      };

      return {
        success: true,
        data,
        userMessage: successMessages[operationType] || 'Operation completed successfully'
      };
    } catch (error) {
      const appError = this.handleWalletError(error, operationType);
      
      return {
        success: false,
        error: appError,
        userMessage: UIErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }
}

/**
 * React hook for wallet error handling
 */
export function useWalletErrorHandler() {
  const { showSuccess, showError, showWarning } = useNotifications();

  const handleWalletResult = <T>(
    result: WalletOperationResult<T>,
    options: {
      showSuccessNotification?: boolean;
      showErrorNotification?: boolean;
      customSuccessMessage?: string;
      customErrorMessage?: string;
    } = {}
  ) => {
    const {
      showSuccessNotification = true,
      showErrorNotification = true,
      customSuccessMessage,
      customErrorMessage
    } = options;

    if (result.success) {
      if (showSuccessNotification) {
        showSuccess('Success', customSuccessMessage || result.userMessage || 'Operation completed');
      }
    } else if (result.error) {
      if (showErrorNotification) {
        const errorMessage = customErrorMessage || result.userMessage || 'Operation failed';
        showError('Error', errorMessage);
        
        // Show suggestions if available
        const suggestions = WalletErrorHandler.getWalletErrorSuggestions(result.error);
        if (suggestions.length > 0) {
          setTimeout(() => {
            showWarning('Suggestions', suggestions.join('\n'));
          }, 1000);
        }
      }
    }

    return result;
  };

  const executeWalletOperation = async <T>(
    operation: () => Promise<T>,
    operationType: string,
    options: {
      showSuccessNotification?: boolean;
      showErrorNotification?: boolean;
      customSuccessMessage?: string;
      customErrorMessage?: string;
    } = {}
  ): Promise<WalletOperationResult<T>> => {
    const result = await WalletErrorHandler.executeWalletOperation(operation, operationType);
    return handleWalletResult(result, options);
  };

  return {
    handleWalletResult,
    executeWalletOperation,
    formatBalance: WalletErrorHandler.formatWalletBalance,
    validateOperation: WalletErrorHandler.validateWalletOperation,
    getErrorSuggestions: WalletErrorHandler.getWalletErrorSuggestions
  };
}

/**
 * Wallet operation status indicators
 */
export const WalletOperationStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
} as const;

export type WalletOperationStatusType = typeof WalletOperationStatus[keyof typeof WalletOperationStatus];

/**
 * Common wallet error codes
 */
export const WalletErrorCodes = {
  DUPLICATE_WALLET: 'DUPLICATE_WALLET',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  SUSPENDED_GOLD_RESTRICTION: 'SUSPENDED_GOLD_RESTRICTION',
  CONVERSION_FEE_ERROR: 'CONVERSION_FEE_ERROR',
  INVALID_TRANSACTION: 'INVALID_TRANSACTION',
  REALM_NOT_FOUND: 'REALM_NOT_FOUND',
  WALLET_HAS_BALANCE: 'WALLET_HAS_BALANCE'
} as const;