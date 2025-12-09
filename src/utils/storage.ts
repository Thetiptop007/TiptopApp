/**
 * AsyncStorage wrapper for secure data persistence
 * Uses @react-native-async-storage/async-storage for native storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('[AsyncStorage] getItem:', key, value ? '(value exists)' : '(null)');
      return value;
    } catch (error) {
      console.error('[AsyncStorage] getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      console.log('[AsyncStorage] setItem:', key);
    } catch (error) {
      console.error('[AsyncStorage] setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log('[AsyncStorage] removeItem:', key);
    } catch (error) {
      console.error('[AsyncStorage] removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('[AsyncStorage] clear');
    } catch (error) {
      console.error('[AsyncStorage] clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('[AsyncStorage] getAllKeys:', keys.length);
      return keys;
    } catch (error) {
      console.error('[AsyncStorage] getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('[AsyncStorage] multiGet error:', error);
      return [];
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      console.log('[AsyncStorage] multiSet:', keyValuePairs.length, 'items');
    } catch (error) {
      console.error('[AsyncStorage] multiSet error:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
      console.log('[AsyncStorage] multiRemove:', keys.length, 'items');
    } catch (error) {
      console.error('[AsyncStorage] multiRemove error:', error);
      throw error;
    }
  }
}

export const storage = new Storage();
