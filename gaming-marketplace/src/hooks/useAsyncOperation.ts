// React Hook for Managing Async Operations with Error Handling

import { useState, useCallback, useRef } from 'react';
import { UIErrorHandler, type AsyncOperationState } from '../utils/errorHandling';
import { useNotifications } from '../contexts/NotificationContext';
import type { AppError } from '../services/errorService';

export interface AsyncOperationOptions {
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
  logErrors?: boolean;
  context?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface AsyncOperationResult<T> {
  data?: T;
  error?: AppError;
  success: boolean;
}

export interface AsyncOperationHook<T> {
  state: AsyncOperationState;
  execute: (operation: () => Promise<T>, options?: AsyncOperationOptions) => Promise<AsyncOperationResult<T>>;
  retry: () => Promise<AsyncOperationResult<T>>;
  reset: () => void;
  cancel: () => void;
}

export function useAsyncOperation<T = any>(): AsyncOperationHook<T> {
  const { showSuccess, showError } = useNotifications();
  const [state, setState] = useState<AsyncOperationState>({
    loading: false,
    error: null,
    success: false
  });

  const lastOperation = useRef<{
    operation: () => Promise<T>;
    options: AsyncOperationOptions;
  } | null>(null);

  const cancelToken = useRef<{ cancelled: boolean }>({ cancelled: false });

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<AsyncOperationResult<T>> => {
    const {
      showSuccessNotification = false,
      showErrorNotification = true,
      successMessage = 'Operation completed successfully',
      errorMessage,
      logErrors = true,
      context = 'async_operation',
      retryAttempts = 0,
      retryDelay = 1000
    } = options;

    // Store operation for retry
    lastOperation.current = { operation, options };

    // Reset cancel token
    cancelToken.current = { cancelled: false };

    // Set loading state
    setState({
      loading: true,
      error: null,
      success: false
    });

    let attempt = 0;
    const maxAttempts = retryAttempts + 1;

    while (attempt < maxAttempts) {
      try {
        // Check if operation was cancelled
        if (cancelToken.current.cancelled) {
          setState({
            loading: false,
            error: 'Operation was cancelled',
            success: false
          });
          return { success: false };
        }

        const result = await operation();

        // Check again after async operation
        if (cancelToken.current.cancelled) {
          setState({
            loading: false,
            error: 'Operation was cancelled',
            success: false
          });
          return { success: false };
        }

        // Success
        setState({
          loading: false,
          error: null,
          success: true
        });

        if (showSuccessNotification) {
          showSuccess('Success', successMessage);
        }

        return { data: result, success: true };

      } catch (error) {
        attempt++;

        // If this was the last attempt or operation was cancelled
        if (attempt >= maxAttempts || cancelToken.current.cancelled) {
          const appError = UIErrorHandler.handleServiceError(error, {
            logError: logErrors,
            context,
            fallbackMessage: errorMessage
          });

          const errorMsg = UIErrorHandler.getUserFriendlyMessage(appError);

          setState({
            loading: false,
            error: errorMsg,
            success: false
          });

          if (showErrorNotification && !cancelToken.current.cancelled) {
            const title = UIErrorHandler.isRecoverableError(appError) 
              ? 'Operation Failed' 
              : 'Error';
            
            showError(title, errorMsg);
          }

          return { error: appError, success: false };
        }

        // Wait before retry
        if (retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    return { success: false };
  }, [showSuccess, showError]);

  const retry = useCallback(async (): Promise<AsyncOperationResult<T>> => {
    if (!lastOperation.current) {
      const errorMsg = 'No operation to retry';
      setState({
        loading: false,
        error: errorMsg,
        success: false
      });
      return { success: false };
    }

    return execute(lastOperation.current.operation, lastOperation.current.options);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false
    });
    lastOperation.current = null;
    cancelToken.current.cancelled = false;
  }, []);

  const cancel = useCallback(() => {
    cancelToken.current.cancelled = true;
    setState(prev => ({
      ...prev,
      loading: false
    }));
  }, []);

  return {
    state,
    execute,
    retry,
    reset,
    cancel
  };
}

// Specialized hooks for common operations

export function useWalletOperation() {
  const asyncOp = useAsyncOperation();

  const executeWalletOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationType: 'create' | 'remove' | 'deposit' | 'withdraw' | 'convert',
    options: Partial<AsyncOperationOptions> = {}
  ) => {
    const operationMessages = {
      create: 'Wallet created successfully',
      remove: 'Wallet removed successfully',
      deposit: 'Deposit completed successfully',
      withdraw: 'Withdrawal request submitted successfully',
      convert: 'Conversion completed successfully'
    };

    return asyncOp.execute(operation, {
      showSuccessNotification: true,
      showErrorNotification: true,
      successMessage: operationMessages[operationType],
      context: `wallet_${operationType}`,
      retryAttempts: 1,
      retryDelay: 1000,
      ...options
    });
  }, [asyncOp]);

  return {
    ...asyncOp,
    executeWalletOperation
  };
}

export function useAdminOperation() {
  const asyncOp = useAsyncOperation();

  const executeAdminOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationType: 'create_game' | 'create_realm' | 'deposit_gold' | 'update_fees',
    options: Partial<AsyncOperationOptions> = {}
  ) => {
    const operationMessages = {
      create_game: 'Game created successfully',
      create_realm: 'Realm created successfully',
      deposit_gold: 'Gold deposited successfully',
      update_fees: 'Conversion fees updated successfully'
    };

    return asyncOp.execute(operation, {
      showSuccessNotification: true,
      showErrorNotification: true,
      successMessage: operationMessages[operationType],
      context: `admin_${operationType}`,
      retryAttempts: 0, // Admin operations typically shouldn't auto-retry
      ...options
    });
  }, [asyncOp]);

  return {
    ...asyncOp,
    executeAdminOperation
  };
}

export function useDataLoading() {
  const asyncOp = useAsyncOperation();

  const loadData = useCallback(async <T>(
    operation: () => Promise<T>,
    options: Partial<AsyncOperationOptions> = {}
  ) => {
    return asyncOp.execute(operation, {
      showSuccessNotification: false,
      showErrorNotification: true,
      context: 'data_loading',
      retryAttempts: 2,
      retryDelay: 500,
      ...options
    });
  }, [asyncOp]);

  return {
    ...asyncOp,
    loadData
  };
}

// Batch operation hook for handling multiple async operations
export function useBatchOperation() {
  const [batchState, setBatchState] = useState<{
    loading: boolean;
    completed: number;
    total: number;
    errors: AppError[];
    success: boolean;
  }>({
    loading: false,
    completed: 0,
    total: 0,
    errors: [],
    success: false
  });

  const executeBatch = useCallback(async <T>(
    operations: Array<() => Promise<T>>,
    options: {
      concurrency?: number;
      stopOnError?: boolean;
    } = {}
  ) => {
    const { concurrency = 3, stopOnError = false } = options;

    setBatchState({
      loading: true,
      completed: 0,
      total: operations.length,
      errors: [],
      success: false
    });

    const results: Array<{ data?: T; error?: AppError }> = [];
    const errors: AppError[] = [];

    // Execute operations in batches
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (operation, index) => {
        try {
          const data = await operation();
          return { data };
        } catch (error) {
          const appError = UIErrorHandler.handleServiceError(error, {
            context: `batch_operation_${i + index}`,
            logError: true
          });
          errors.push(appError);
          return { error: appError };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Update progress
      setBatchState(prev => ({
        ...prev,
        completed: prev.completed + batch.length,
        errors: [...prev.errors, ...errors]
      }));

      // Stop on error if requested
      if (stopOnError && errors.length > 0) {
        break;
      }
    }

    const success = errors.length === 0;

    setBatchState(prev => ({
      ...prev,
      loading: false,
      success
    }));

    return {
      results,
      errors,
      success,
      completed: results.length
    };
  }, []);

  const resetBatch = useCallback(() => {
    setBatchState({
      loading: false,
      completed: 0,
      total: 0,
      errors: [],
      success: false
    });
  }, []);

  return {
    batchState,
    executeBatch,
    resetBatch
  };
}