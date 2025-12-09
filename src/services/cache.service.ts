/**
 * Cache Service
 * Handles local caching using AsyncStorage for persistent storage
 */

import { storage } from '../utils/storage';

const CACHE_PREFIX = '@tiptop_cache:';
const DEFAULT_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class CacheService {
  /**
   * Save data to cache with optional expiry time
   * @param key Cache key
   * @param data Data to cache
   * @param expiryMs Cache expiry in milliseconds (default: 15 minutes)
   */
  async set<T>(key: string, data: T, expiryMs: number = DEFAULT_CACHE_EXPIRY): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiryMs,
      };
      await storage.setItem(cacheKey, JSON.stringify(cacheItem));
      console.log(`✅ Cached: ${key}`);
    } catch (error) {
      console.error(`❌ Cache set error for key "${key}":`, error);
    }
  }

  /**
   * Get data from cache if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = await storage.getItem(cacheKey);
      
      if (!cached) {
        console.log(`⚠️ Cache miss: ${key}`);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;
      
      // Check if cache is expired
      if (age > cacheItem.expiry) {
        console.log(`⏰ Cache expired: ${key} (age: ${Math.round(age / 1000)}s)`);
        await this.remove(key);
        return null;
      }

      console.log(`✅ Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
      return cacheItem.data;
    } catch (error) {
      console.error(`❌ Cache get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove specific cached item
   * @param key Cache key
   */
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      await storage.removeItem(cacheKey);
      console.log(`🗑️ Removed from cache: ${key}`);
    } catch (error) {
      console.error(`❌ Cache remove error for key "${key}":`, error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await storage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await storage.multiRemove(cacheKeys);
      console.log(`🗑️ Cleared ${cacheKeys.length} cached items`);
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalItems: number; totalSize: number }> {
    try {
      const keys = await storage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      let totalSize = 0;
      const items = await storage.multiGet(cacheKeys);
      
      items.forEach(([, value]) => {
        if (value) {
          totalSize += value.length;
        }
      });

      return {
        totalItems: cacheKeys.length,
        totalSize: totalSize, // in bytes (approximate)
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return { totalItems: 0, totalSize: 0 };
    }
  }

  /**
   * Check if cache exists and is not expired
   * @param key Cache key
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Get cache age in seconds
   * @param key Cache key
   */
  async getAge(key: string): Promise<number | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = await storage.getItem(cacheKey);
      
      if (!cached) return null;

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;
      return Math.round(age / 1000); // Return age in seconds
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
