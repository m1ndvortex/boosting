// Custom hook for localStorage management with type safety

import { useState, useCallback } from 'react';
import { StorageService } from '../services/storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = StorageService.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      StorageService.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      StorageService.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Hook for managing arrays in localStorage
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [T[], (items: T[]) => void, (item: T) => void, (predicate: (item: T) => boolean) => void, () => void] {
  const [items, setItems, removeItems] = useLocalStorage<T[]>(key, initialValue);

  const addItem = useCallback((item: T) => {
    setItems(currentItems => [...currentItems, item]);
  }, [setItems]);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems(currentItems => currentItems.filter(item => !predicate(item)));
  }, [setItems]);

  return [items, setItems, addItem, removeItem, removeItems];
}

// Hook for managing objects in localStorage
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, (property: keyof T) => void, () => void] {
  const [object, setObject, removeObject] = useLocalStorage<T>(key, initialValue);

  const updateObject = useCallback((updates: Partial<T>) => {
    setObject(currentObject => ({ ...currentObject, ...updates }));
  }, [setObject]);

  const removeProperty = useCallback((property: keyof T) => {
    setObject(currentObject => {
      const newObject = { ...currentObject };
      delete newObject[property];
      return newObject;
    });
  }, [setObject]);

  return [object, updateObject, removeProperty, removeObject];
}