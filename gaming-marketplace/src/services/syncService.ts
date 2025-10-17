// Data synchronization service for cross-component and cross-tab sync

import { StorageService } from './storage';
import { ErrorService } from './errorService';

export interface SyncEvent {
  type: string;
  key: string;
  data: unknown;
  timestamp: Date;
  userId?: string;
}

export interface SyncOptions {
  immediate?: boolean;
  debounceMs?: number;
  crossTab?: boolean;
}

type SyncCallback = (event: SyncEvent) => void;

export class SyncService {
  private static listeners: Map<string, Set<SyncCallback>> = new Map();
  private static debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private static initialized = false;

  // Initialize the sync service
  static initialize(): void {
    if (this.initialized) return;

    // Listen for storage events from other tabs
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    // Listen for visibility changes to sync when tab becomes active
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    this.initialized = true;
  }

  // Subscribe to sync events for a specific key
  static subscribe(key: string, callback: SyncCallback): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // Emit a sync event
  static emit(type: string, key: string, data: unknown, options: SyncOptions = {}): void {
    const { immediate = false, debounceMs = 100, crossTab = true } = options;

    const event: SyncEvent = {
      type,
      key,
      data,
      timestamp: new Date()
    };

    if (immediate) {
      this.notifyListeners(key, event);
      if (crossTab) {
        this.broadcastToOtherTabs(event);
      }
    } else {
      // Debounce the sync
      const timerId = this.debounceTimers.get(key);
      if (timerId) {
        clearTimeout(timerId);
      }

      this.debounceTimers.set(key, setTimeout(() => {
        this.notifyListeners(key, event);
        if (crossTab) {
          this.broadcastToOtherTabs(event);
        }
        this.debounceTimers.delete(key);
      }, debounceMs));
    }
  }

  // Sync data to storage and notify listeners
  static syncData<T>(key: string, data: T, options: SyncOptions = {}): void {
    try {
      StorageService.setItem(key, data);
      this.emit('data_updated', key, data, options);
    } catch (error) {
      ErrorService.handleError(error, 'SyncService.syncData');
    }
  }

  // Get synced data from storage
  static getSyncedData<T>(key: string): T | null {
    try {
      return StorageService.getItem<T>(key);
    } catch (error) {
      ErrorService.handleError(error, 'SyncService.getSyncedData');
      return null;
    }
  }

  // Force sync from storage
  static forceSync(key: string): void {
    try {
      const data = StorageService.getItem(key);
      this.emit('force_sync', key, data, { immediate: true });
    } catch (error) {
      ErrorService.handleError(error, 'SyncService.forceSync');
    }
  }

  // Sync all data
  static syncAll(): void {
    try {
      // Get all gaming marketplace keys from localStorage
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gaming_marketplace_')) {
          keys.push(key);
        }
      }

      // Force sync all keys
      keys.forEach(key => this.forceSync(key));
    } catch (error) {
      ErrorService.handleError(error, 'SyncService.syncAll');
    }
  }

  // Handle storage events from other tabs
  private static handleStorageEvent(event: StorageEvent): void {
    if (!event.key || !event.key.startsWith('gaming_marketplace_')) {
      return;
    }

    try {
      const data = event.newValue ? JSON.parse(event.newValue) : null;
      const syncEvent: SyncEvent = {
        type: 'external_update',
        key: event.key,
        data,
        timestamp: new Date()
      };

      this.notifyListeners(event.key, syncEvent);
    } catch (error) {
      ErrorService.handleError(error, 'SyncService.handleStorageEvent');
    }
  }

  // Handle visibility changes
  private static handleVisibilityChange(): void {
    if (!document.hidden) {
      // Tab became visible, sync all data
      this.syncAll();
    }
  }

  // Notify listeners for a specific key
  private static notifyListeners(key: string, event: SyncEvent): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          ErrorService.handleError(error, 'SyncService.notifyListeners');
        }
      });
    }
  }

  // Broadcast event to other tabs
  private static broadcastToOtherTabs(event: SyncEvent): void {
    try {
      // Use a special key for cross-tab communication
      const broadcastKey = `gaming_marketplace_sync_${Date.now()}`;
      localStorage.setItem(broadcastKey, JSON.stringify(event));
      
      // Clean up the broadcast key immediately
      setTimeout(() => {
        localStorage.removeItem(broadcastKey);
      }, 100);
    } catch (error) {
      ErrorService.handleError(error, 'SyncService.broadcastToOtherTabs');
    }
  }

  // Clean up resources
  static cleanup(): void {
    // Clear all debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Clear all listeners
    this.listeners.clear();
    
    // Remove event listeners
    window.removeEventListener('storage', this.handleStorageEvent);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.initialized = false;
  }

  // Get sync statistics
  static getStats(): {
    activeListeners: number;
    pendingDebounces: number;
    keys: string[];
  } {
    const keys = Array.from(this.listeners.keys());
    const activeListeners = keys.reduce((total, key) => {
      return total + (this.listeners.get(key)?.size || 0);
    }, 0);

    return {
      activeListeners,
      pendingDebounces: this.debounceTimers.size,
      keys
    };
  }
}

// Initialize sync service
SyncService.initialize();