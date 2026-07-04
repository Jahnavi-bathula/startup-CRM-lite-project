import { useState, useCallback } from 'react';

/**
 * Safely checks if window.localStorage is available and writable.
 * Handles security errors, blockades, or private mode restrictions.
 * 
 * @returns {boolean} True if storage is accessible, false otherwise
 */
const isStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Custom hook to synchronize state with window.localStorage.
 * Exposes an identical API to useState, returning [storedValue, setValue].
 * Handles storage errors, JSON parsing issues, and functional state updates.
 * Safe for environments where localStorage is blocked or unavailable (e.g. private browsing).
 * 
 * @template T
 * @param {string} key - The localStorage lookup key
 * @param {T} initialValue - The initial value to fall back to if key does not exist or errors occur
 * @returns {[T, (value: T | ((val: T) => T)) => void]} State value and stable updater function
 */
export default function useLocalStorage(key, initialValue) {
  // Initialize state from local storage or fallback value
  const [storedValue, setStoredValue] = useState(() => {
    if (!isStorageAvailable()) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parse stored JSON or return initialValue if key doesn't exist (getItem returns null)
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}", falling back to initialValue:`, error);
      return initialValue;
    }
  });

  // Return a stable memoized setter function that updates state and storage
  const setValue = useCallback((value) => {
    try {
      setStoredValue((prevValue) => {
        // Support functional updates like setValue(prev => ...)
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        
        if (isStorageAvailable()) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}
