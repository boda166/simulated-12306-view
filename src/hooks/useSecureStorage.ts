import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'luli-beads-secure-key-2024'; // In production, use environment variable

interface SecureStorageOptions {
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
}

interface StoredData<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export const useSecureStorage = <T>(
  key: string,
  initialValue: T,
  options: SecureStorageOptions = {}
) => {
  const { encrypt = true, ttl } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      let parsedItem: StoredData<T>;
      
      if (encrypt) {
        const decryptedData = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        parsedItem = JSON.parse(decryptedData);
      } else {
        parsedItem = JSON.parse(item);
      }

      // Check if data has expired
      if (parsedItem.ttl && Date.now() - parsedItem.timestamp > parsedItem.ttl) {
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsedItem.data;
    } catch (error) {
      console.error(`Error reading from secure storage (${key}):`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      const dataToStore: StoredData<T> = {
        data: valueToStore,
        timestamp: Date.now(),
        ...(ttl && { ttl }),
      };

      let serializedData = JSON.stringify(dataToStore);
      
      if (encrypt) {
        serializedData = CryptoJS.AES.encrypt(serializedData, ENCRYPTION_KEY).toString();
      }

      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Error writing to secure storage (${key}):`, error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from secure storage (${key}):`, error);
    }
  };

  const clearExpired = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(storageKey => {
      try {
        const item = localStorage.getItem(storageKey);
        if (!item) return;

        let parsedItem: StoredData<any>;
        
        if (encrypt) {
          const decryptedData = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
          parsedItem = JSON.parse(decryptedData);
        } else {
          parsedItem = JSON.parse(item);
        }

        if (parsedItem.ttl && Date.now() - parsedItem.timestamp > parsedItem.ttl) {
          localStorage.removeItem(storageKey);
        }
      } catch {
        // Ignore errors for non-secure storage items
      }
    });
  };

  // Clean up expired items on mount
  useEffect(() => {
    clearExpired();
  }, []);

  return [storedValue, setValue, removeValue, clearExpired] as const;
};

// Utility for session storage
export const useSecureSessionStorage = <T>(
  key: string,
  initialValue: T,
  options: SecureStorageOptions = {}
) => {
  const { encrypt = true } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return initialValue;

      if (encrypt) {
        const decryptedData = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedData);
      } else {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error reading from secure session storage (${key}):`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      let serializedData = JSON.stringify(valueToStore);
      
      if (encrypt) {
        serializedData = CryptoJS.AES.encrypt(serializedData, ENCRYPTION_KEY).toString();
      }

      sessionStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Error writing to secure session storage (${key}):`, error);
    }
  };

  const removeValue = () => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from secure session storage (${key}):`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
};