// Comprehensive error handling service

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export interface ErrorLog {
  id: string;
  error: AppError;
  userAgent: string;
  url: string;
  stackTrace?: string;
}

// Error types
export const ErrorCode = {
  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  
  // Business logic errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_ACCESS_DENIED: 'STORAGE_ACCESS_DENIED',
  DATA_CORRUPTION: 'DATA_CORRUPTION',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED'
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

// Error messages
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.AUTH_FAILED]: 'Authentication failed. Please try logging in again.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials provided.',
  
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action.',
  [ErrorCode.ROLE_REQUIRED]: 'A specific role is required to access this feature.',
  
  [ErrorCode.VALIDATION_FAILED]: 'The provided data is invalid.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.REQUIRED_FIELD_MISSING]: 'Required field is missing.',
  
  [ErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance to complete this transaction.',
  [ErrorCode.ORDER_NOT_FOUND]: 'The requested order could not be found.',
  [ErrorCode.SERVICE_NOT_FOUND]: 'The requested service could not be found.',
  [ErrorCode.TEAM_NOT_FOUND]: 'The requested team could not be found.',
  
  [ErrorCode.FILE_TOO_LARGE]: 'The uploaded file is too large.',
  [ErrorCode.INVALID_FILE_TYPE]: 'The uploaded file type is not supported.',
  [ErrorCode.UPLOAD_FAILED]: 'File upload failed. Please try again.',
  
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please clear some data.',
  [ErrorCode.STORAGE_ACCESS_DENIED]: 'Access to storage was denied.',
  [ErrorCode.DATA_CORRUPTION]: 'Data corruption detected. Please refresh and try again.',
  
  [ErrorCode.NETWORK_ERROR]: 'Network error occurred. Please check your connection.',
  [ErrorCode.TIMEOUT_ERROR]: 'Operation timed out. Please try again.',
  
  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred.',
  [ErrorCode.OPERATION_FAILED]: 'The operation failed to complete.'
};

export class ErrorService {
  private static readonly ERROR_LOG_KEY = 'gaming_marketplace_error_log';
  private static readonly MAX_ERROR_LOG_SIZE = 100;

  // Create a standardized error
  static createError(
    code: string,
    details?: Record<string, unknown>,
    customMessage?: string,
    userId?: string,
    context?: string
  ): AppError {
    return {
      code,
      message: customMessage || ERROR_MESSAGES[code],
      details,
      timestamp: new Date(),
      userId,
      context
    };
  }

  // Log an error
  static logError(error: AppError, stackTrace?: string): void {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace
    };

    try {
      const existingLogs = this.getErrorLogs();
      const updatedLogs = [errorLog, ...existingLogs].slice(0, this.MAX_ERROR_LOG_SIZE);
      localStorage.setItem(this.ERROR_LOG_KEY, JSON.stringify(updatedLogs));
    } catch (storageError) {
      console.error('Failed to log error to localStorage:', storageError);
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('App Error:', error);
      if (stackTrace) {
        console.error('Stack Trace:', stackTrace);
      }
    }
  }

  // Get error logs
  static getErrorLogs(): ErrorLog[] {
    try {
      const logs = localStorage.getItem(this.ERROR_LOG_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to retrieve error logs:', error);
      return [];
    }
  }

  // Clear error logs
  static clearErrorLogs(): void {
    try {
      localStorage.removeItem(this.ERROR_LOG_KEY);
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }

  // Handle and log an error
  static handleError(
    error: unknown,
    context?: string,
    userId?: string
  ): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      // Check if it's already an AppError
      if ('code' in error && 'timestamp' in error) {
        appError = error as AppError;
      } else {
        // Convert regular Error to AppError
        appError = this.createError(
          ErrorCode.UNKNOWN_ERROR,
          { originalMessage: error.message },
          error.message,
          userId,
          context
        );
      }
      
      this.logError(appError, error.stack);
    } else if (typeof error === 'string') {
      appError = this.createError(
        ErrorCode.UNKNOWN_ERROR,
        { originalMessage: error },
        error,
        userId,
        context
      );
      
      this.logError(appError);
    } else {
      appError = this.createError(
        ErrorCode.UNKNOWN_ERROR,
        { originalError: error },
        'An unknown error occurred',
        userId,
        context
      );
      
      this.logError(appError);
    }

    return appError;
  }

  // Check if error is recoverable
  static isRecoverableError(error: AppError): boolean {
    const recoverableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.VALIDATION_FAILED,
      ErrorCode.INVALID_INPUT
    ];
    
    return recoverableErrors.includes(error.code as any);
  }

  // Get user-friendly error message
  static getUserFriendlyMessage(error: AppError): string {
    // Return custom message if available, otherwise use default
    return error.message || ERROR_MESSAGES[error.code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
  }

  // Create validation error
  static createValidationError(
    field: string,
    message: string,
    userId?: string
  ): AppError {
    return this.createError(
      ErrorCode.VALIDATION_FAILED,
      { field, validationMessage: message },
      `Validation failed for ${field}: ${message}`,
      userId,
      'validation'
    );
  }

  // Create permission error
  static createPermissionError(
    requiredRole: string,
    userId?: string
  ): AppError {
    return this.createError(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      { requiredRole },
      `This action requires the ${requiredRole} role`,
      userId,
      'permission'
    );
  }

  // Create business logic error
  static createBusinessError(
    code: string,
    details: Record<string, unknown>,
    userId?: string
  ): AppError {
    return this.createError(
      code,
      details,
      undefined,
      userId,
      'business_logic'
    );
  }

  // Handle storage errors
  static handleStorageError(error: unknown, operation: string): AppError {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        return this.createError(
          ErrorCode.STORAGE_QUOTA_EXCEEDED,
          { operation },
          'Storage quota exceeded. Please clear some data and try again.'
        );
      } else if (error.name === 'SecurityError') {
        return this.createError(
          ErrorCode.STORAGE_ACCESS_DENIED,
          { operation },
          'Access to storage was denied. Please check your browser settings.'
        );
      }
    }

    return this.createError(
      ErrorCode.OPERATION_FAILED,
      { operation, originalError: error },
      `Storage operation '${operation}' failed`
    );
  }

  // Handle file upload errors
  static handleFileError(file: File, error: string): AppError {
    if (error.includes('size')) {
      return this.createError(
        ErrorCode.FILE_TOO_LARGE,
        { fileName: file.name, fileSize: file.size },
        `File '${file.name}' is too large. Maximum size is 10MB.`
      );
    } else if (error.includes('type')) {
      return this.createError(
        ErrorCode.INVALID_FILE_TYPE,
        { fileName: file.name, fileType: file.type },
        `File '${file.name}' has an unsupported format. Only PNG, JPG, and JPEG files are allowed.`
      );
    }

    return this.createError(
      ErrorCode.UPLOAD_FAILED,
      { fileName: file.name, error },
      `Failed to upload file '${file.name}': ${error}`
    );
  }

  // Get error statistics
  static getErrorStatistics(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    recentErrors: number;
  } {
    const logs = this.getErrorLogs();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const errorsByCode: Record<string, number> = {};
    let recentErrors = 0;

    logs.forEach(log => {
      const errorCode = log.error.code;
      errorsByCode[errorCode] = (errorsByCode[errorCode] || 0) + 1;

      if (new Date(log.error.timestamp) > oneDayAgo) {
        recentErrors++;
      }
    });

    return {
      totalErrors: logs.length,
      errorsByCode,
      recentErrors
    };
  }
}