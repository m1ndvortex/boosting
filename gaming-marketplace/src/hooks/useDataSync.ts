// Custom hook for data synchronization between components and storage

import { useState, useEffect, useCallback, useRef } from 'react';
import { StorageService } from '../services/storage';

export interface DataSyncOptions {
  syncInterval?: number; // in milliseconds
  autoSync?: boolean;
  onSyncError?: (error: Error) => void;
  onSyncSuccess?: () => void;
}

// Hook for syncing data with localStorage
export function useDataSync<T>(
  storageKey: string,
  initialData: T,
  options: DataSyncOptions = {}
): {
  data: T;
  updateData: (updates: Partial<T> | ((current: T) => T)) => void;
  syncData: () => void;
  resetData: () => void;
  lastSync: Date | null;
  isSyncing: boolean;
} {
  const {
    syncInterval = 30000, // 30 seconds default
    autoSync = true,
    onSyncError,
    onSyncSuccess
  } = options;

  const [data, setData] = useState<T>(() => {
    const stored = StorageService.getItem<T>(storageKey);
    return stored !== null ? stored : initialData;
  });

  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync data to storage
  const syncData = useCallback(() => {
    setIsSyncing(true);
    
    try {
      StorageService.setItem(storageKey, data);
      setLastSync(new Date());
      onSyncSuccess && onSyncSuccess();
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error('Sync failed');
      onSyncError && onSyncError(syncError);
    } finally {
      setIsSyncing(false);
    }
  }, [data, storageKey, onSyncError, onSyncSuccess]);

  // Update data and optionally sync
  const updateData = useCallback((updates: Partial<T> | ((current: T) => T)) => {
    setData(current => {
      const newData = typeof updates === 'function' ? updates(current) : { ...current, ...updates };
      
      // Schedule sync if auto-sync is enabled
      if (autoSync) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(syncData, 100); // Debounce sync
      }
      
      return newData;
    });
  }, [autoSync, syncData]);

  // Reset data to initial state
  const resetData = useCallback(() => {
    setData(initialData);
    StorageService.removeItem(storageKey);
    setLastSync(null);
  }, [initialData, storageKey]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSync && syncInterval > 0) {
      const interval = setInterval(syncData, syncInterval);
      return () => clearInterval(interval);
    }
  }, [autoSync, syncInterval, syncData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    updateData,
    syncData,
    resetData,
    lastSync,
    isSyncing
  };
}

// Hook for syncing arrays with localStorage
export function useArraySync<T>(
  storageKey: string,
  initialData: T[] = [],
  options: DataSyncOptions = {}
): {
  items: T[];
  addItem: (item: T) => void;
  updateItem: (predicate: (item: T) => boolean, updates: Partial<T>) => void;
  removeItem: (predicate: (item: T) => boolean) => void;
  replaceItems: (items: T[]) => void;
  syncItems: () => void;
  resetItems: () => void;
  lastSync: Date | null;
  isSyncing: boolean;
} {
  const {
    data: items,
    updateData,
    syncData: syncItems,
    resetData: resetItems,
    lastSync,
    isSyncing
  } = useDataSync<T[]>(storageKey, initialData, options);

  const addItem = useCallback((item: T) => {
    updateData(current => [...current, item]);
  }, [updateData]);

  const updateItem = useCallback((predicate: (item: T) => boolean, updates: Partial<T>) => {
    updateData(current => 
      current.map(item => 
        predicate(item) ? { ...item, ...updates } : item
      )
    );
  }, [updateData]);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    updateData(current => current.filter(item => !predicate(item)));
  }, [updateData]);

  const replaceItems = useCallback((newItems: T[]) => {
    updateData(() => newItems);
  }, [updateData]);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    replaceItems,
    syncItems,
    resetItems,
    lastSync,
    isSyncing
  };
}

// Hook for cross-tab synchronization
export function useCrossTabSync<T>(
  storageKey: string,
  initialData: T,
  onExternalChange?: (newData: T) => void
): {
  data: T;
  updateData: (updates: Partial<T> | ((current: T) => T)) => void;
} {
  const [data, setData] = useState<T>(() => {
    const stored = StorageService.getItem<T>(storageKey);
    return stored !== null ? stored : initialData;
  });

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue) as T;
          setData(newData);
          onExternalChange && onExternalChange(newData);
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey, onExternalChange]);

  const updateData = useCallback((updates: Partial<T> | ((current: T) => T)) => {
    setData(current => {
      const newData = typeof updates === 'function' ? updates(current) : { ...current, ...updates };
      StorageService.setItem(storageKey, newData);
      return newData;
    });
  }, [storageKey]);

  return {
    data,
    updateData
  };
}