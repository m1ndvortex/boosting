// Custom hook for managing async data operations with loading states

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface AsyncDataOptions {
  immediate?: boolean;
  cacheTime?: number; // in milliseconds
  retryCount?: number;
  retryDelay?: number; // in milliseconds
}

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: AsyncDataOptions = {}
): AsyncDataState<T> & {
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const {
    immediate = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Check if data is still fresh
    if (state.data && state.lastFetch && cacheTime > 0) {
      const timeSinceLastFetch = Date.now() - state.lastFetch.getTime();
      if (timeSinceLastFetch < cacheTime) {
        return;
      }
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      
      setState({
        data: result,
        loading: false,
        error: null,
        lastFetch: new Date()
      });
      
      retryCountRef.current = 0;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [asyncFunction, cacheTime, retryCount, retryDelay, state.data, state.lastFetch]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null
    });
    retryCountRef.current = 0;
  }, []);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
    reset
  };
}

// Hook for managing multiple async operations
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Map<string, AsyncDataState<unknown>>>(new Map());

  const executeOperation = useCallback(async <T>(
    key: string,
    asyncFunction: () => Promise<T>,
    options: AsyncDataOptions = {}
  ): Promise<T> => {
    const { retryCount = 3, retryDelay = 1000 } = options;

    setOperations(prev => new Map(prev).set(key, {
      data: null,
      loading: true,
      error: null,
      lastFetch: null
    }));

    let retries = 0;
    
    while (retries <= retryCount) {
      try {
        const result = await asyncFunction();
        
        setOperations(prev => new Map(prev).set(key, {
          data: result,
          loading: false,
          error: null,
          lastFetch: new Date()
        }));
        
        return result;
      } catch (error) {
        if (retries === retryCount) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          
          setOperations(prev => new Map(prev).set(key, {
            data: null,
            loading: false,
            error: errorMessage,
            lastFetch: null
          }));
          
          throw error;
        }
        
        retries++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
      }
    }

    throw new Error('Max retries exceeded');
  }, []);

  const getOperationState = useCallback((key: string): AsyncDataState<unknown> => {
    return operations.get(key) || {
      data: null,
      loading: false,
      error: null,
      lastFetch: null
    };
  }, [operations]);

  const clearOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const clearAllOperations = useCallback(() => {
    setOperations(new Map());
  }, []);

  return {
    executeOperation,
    getOperationState,
    clearOperation,
    clearAllOperations,
    operations: Object.fromEntries(operations)
  };
}