// Error Handling Utilities for UI Components

import { ErrorService, ErrorCode, type AppError } from '../services/errorService';
import type { ValidationResult, ValidationError } from '../services/multiWalletValidationService';

export interface ErrorHandlingOptions {
  showNotification?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  context?: string;
  userId?: string;
}

export interface FormErrorState {
  [field: string]: string | undefined;
}

export interface AsyncOperationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Handle errors in UI components with consistent patterns
 */
export class UIErrorHandler {
  /**
   * Handle service errors and convert to user-friendly messages
   */
  static handleServiceError(
    error: unknown,
    options: ErrorHandlingOptions = {}
  ): AppError {
    const {
      showNotification: _showNotification = false,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
      context,
      userId
    } = options;

    let appError: AppError;

    // Handle different error types
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // Already an AppError or similar structured error
      appError = error as AppError;
    } else if (error instanceof Error) {
      appError = ErrorService.createError(
        ErrorCode.OPERATION_FAILED,
        { originalMessage: error.message },
        error.message,
        userId,
        context
      );
    } else if (typeof error === 'string') {
      appError = ErrorService.createError(
        ErrorCode.OPERATION_FAILED,
        { originalMessage: error },
        error,
        userId,
        context
      );
    } else {
      appError = ErrorService.createError(
        ErrorCode.UNKNOWN_ERROR,
        { originalError: error },
        fallbackMessage,
        userId,
        context
      );
    }

    // Log error if requested
    if (logError) {
      ErrorService.logError(appError);
    }

    return appError;
  }

  /**
   * Convert validation result to form error state
   */
  static validationResultToFormErrors(validationResult: ValidationResult): FormErrorState {
    const formErrors: FormErrorState = {};

    validationResult.errors.forEach(error => {
      formErrors[error.field] = error.message;
    });

    return formErrors;
  }

  /**
   * Get user-friendly error message for specific error codes
   */
  static getUserFriendlyMessage(error: AppError | ValidationError): string {
    const errorMessages: Record<string, string> = {
      // Wallet-specific errors
      'DUPLICATE_WALLET': 'You already have a wallet for this realm',
      'WALLET_NOT_FOUND': 'The requested wallet could not be found',
      'INSUFFICIENT_BALANCE': 'You don\'t have enough balance for this transaction',
      'SUSPENDED_GOLD_RESTRICTION': 'This gold is suspended and cannot be withdrawn directly. You can convert it to USD/Toman with fees.',
      'CONVERSION_FEE_ERROR': 'There was an issue with the conversion fee calculation',
      'INVALID_TRANSACTION': 'The transaction details are invalid',
      'DUPLICATE_REALM': 'A realm with this name already exists in this game',

      // Generic errors
      [ErrorCode.VALIDATION_FAILED]: 'Please check your input and try again',
      [ErrorCode.INVALID_INPUT]: 'The information you entered is not valid',
      [ErrorCode.REQUIRED_FIELD_MISSING]: 'Please fill in all required fields',
      [ErrorCode.OPERATION_FAILED]: 'The operation could not be completed',
      [ErrorCode.NETWORK_ERROR]: 'Please check your internet connection and try again',
      [ErrorCode.TIMEOUT_ERROR]: 'The operation timed out. Please try again',
      [ErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again'
    };

    const code = 'code' in error ? error.code : ErrorCode.UNKNOWN_ERROR;
    return errorMessages[code] || error.message || 'An error occurred';
  }

  /**
   * Create async operation state manager
   */
  static createAsyncState(): {
    state: AsyncOperationState;
    setLoading: () => void;
    setSuccess: () => void;
    setError: (error: string) => void;
    reset: () => void;
  } {
    const state: AsyncOperationState = {
      loading: false,
      error: null,
      success: false
    };

    return {
      state,
      setLoading: () => {
        state.loading = true;
        state.error = null;
        state.success = false;
      },
      setSuccess: () => {
        state.loading = false;
        state.error = null;
        state.success = true;
      },
      setError: (error: string) => {
        state.loading = false;
        state.error = error;
        state.success = false;
      },
      reset: () => {
        state.loading = false;
        state.error = null;
        state.success = false;
      }
    };
  }

  /**
   * Wrap async operations with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorHandlingOptions = {}
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      const appError = this.handleServiceError(error, options);
      return { error: appError };
    }
  }

  /**
   * Debounce function for validation
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait) as unknown as number;
    };
  }

  /**
   * Validate form field with debouncing
   */
  static createDebouncedValidator<T>(
    validator: (value: T) => ValidationResult,
    onValidation: (result: ValidationResult) => void,
    delay: number = 300
  ) {
    return this.debounce((value: T) => {
      const result = validator(value);
      onValidation(result);
    }, delay);
  }

  /**
   * Format validation errors for display
   */
  static formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0].message;
    
    return errors.map((error, index) => `${index + 1}. ${error.message}`).join('\n');
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverableError(error: AppError): boolean {
    const recoverableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.VALIDATION_FAILED,
      ErrorCode.INVALID_INPUT,
      'INSUFFICIENT_BALANCE',
      'CONVERSION_FEE_ERROR'
    ];
    
    return recoverableErrors.includes(error.code as any);
  }

  /**
   * Get retry suggestions for errors
   */
  static getRetrySuggestion(error: AppError): string | null {
    const retrySuggestions: Record<string, string> = {
      [ErrorCode.NETWORK_ERROR]: 'Check your internet connection and try again',
      [ErrorCode.TIMEOUT_ERROR]: 'The operation timed out. Please try again',
      'INSUFFICIENT_BALANCE': 'Add funds to your wallet or choose a different payment method',
      'CONVERSION_FEE_ERROR': 'Please refresh the page and try the conversion again'
    };

    return retrySuggestions[error.code] || null;
  }

  /**
   * Create error boundary handler
   */
  static createErrorBoundaryHandler(
    onError: (error: AppError) => void,
    context: string
  ) {
    return (error: Error, errorInfo: { componentStack: string }) => {
      const appError = ErrorService.createError(
        ErrorCode.UNKNOWN_ERROR,
        { 
          componentStack: errorInfo.componentStack,
          errorMessage: error.message,
          errorStack: error.stack
        },
        `Component error in ${context}: ${error.message}`,
        undefined,
        context
      );

      ErrorService.logError(appError, error.stack);
      onError(appError);
    };
  }
}

/**
 * Hook-like utilities for React components
 */
export class ReactErrorUtils {
  /**
   * Create form validation state manager
   */
  static createFormValidation<T extends Record<string, any>>(
    validators: Partial<Record<keyof T, (value: any) => ValidationResult>>
  ) {
    const formErrors: FormErrorState = {};
    const formWarnings: Record<string, string[]> = {};

    const validateField = (field: keyof T, value: any): ValidationResult => {
      const validator = validators[field];
      if (!validator) {
        return { isValid: true, errors: [] };
      }

      return validator(value);
    };

    const validateForm = (values: T): ValidationResult => {
      const allErrors: ValidationError[] = [];
      const allWarnings: any[] = [];

      Object.keys(validators).forEach(field => {
        const result = validateField(field, values[field]);
        allErrors.push(...result.errors);
        if (result.warnings) {
          allWarnings.push(...result.warnings);
        }
      });

      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
      };
    };

    const setFieldError = (field: string, error: string | null) => {
      if (error) {
        formErrors[field] = error;
      } else {
        delete formErrors[field];
      }
    };

    const clearErrors = () => {
      Object.keys(formErrors).forEach(key => {
        delete formErrors[key];
      });
    };

    return {
      formErrors,
      formWarnings,
      validateField,
      validateForm,
      setFieldError,
      clearErrors
    };
  }

  /**
   * Create loading state manager
   */
  static createLoadingState(initialLoading: boolean = false) {
    let loading = initialLoading;
    let error: string | null = null;

    const setLoading = (isLoading: boolean) => {
      loading = isLoading;
      if (isLoading) {
        error = null;
      }
    };

    const setError = (errorMessage: string | null) => {
      error = errorMessage;
      loading = false;
    };

    const reset = () => {
      loading = false;
      error = null;
    };

    return {
      get loading() { return loading; },
      get error() { return error; },
      setLoading,
      setError,
      reset
    };
  }
}

/**
 * Error handling constants
 */
export const ERROR_HANDLING_CONFIG = {
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  NOTIFICATION_DURATION: 5000,
  ERROR_NOTIFICATION_DURATION: 0, // Persistent
  SUCCESS_NOTIFICATION_DURATION: 3000
} as const;

/**
 * Common error messages
 */
export const COMMON_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
  NOT_FOUND_ERROR: 'The requested item could not be found.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
} as const;