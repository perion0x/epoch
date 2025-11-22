/**
 * Browser caching layer for newsletter platform
 * Implements Task 11.1 - Add browser caching layer
 * 
 * Features:
 * - Cache newsletter metadata in localStorage
 * - Cache issue lists with TTL
 * - Cache decrypted content in memory (session-only)
 * - Implement cache invalidation logic
 */

import { Newsletter, Issue } from '@/types';
import { ContentSection } from './content';

const CACHE_VERSION = '1.0.0';
const CACHE_PREFIX = 'newsletter_cache_';

// Cache keys
const CACHE_KEYS = {
  NEWSLETTER: (id: string) => `${CACHE_PREFIX}newsletter_${id}`,
  ISSUES: (newsletterId: string) => `${CACHE_PREFIX}issues_${newsletterId}`,
  VERSION: `${CACHE_PREFIX}version`,
} as const;

// Default TTL values (in milliseconds)
const DEFAULT_TTL = {
  NEWSLETTER: 60 * 60 * 1000, // 1 hour
  ISSUES: 5 * 60 * 1000, // 5 minutes
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

/**
 * In-memory cache for decrypted content (session-only, not persisted)
 */
class MemoryCache {
  private cache: Map<string, ContentSection[]> = new Map();

  set(key: string, value: ContentSection[]): void {
    this.cache.set(key, value);
  }

  get(key: string): ContentSection[] | null {
    return this.cache.get(key) || null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * Browser cache service using localStorage for persistent data
 * and memory for session-only data
 */
export class CacheService {
  private memoryCache: MemoryCache;
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.isLocalStorageAvailable = this.checkLocalStorage();
    this.initializeCache();
  }

  /**
   * Check if localStorage is available
   */
  private checkLocalStorage(): boolean {
    try {
      const test = '__cache_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize cache and handle version changes
   */
  private initializeCache(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      const storedVersion = localStorage.getItem(CACHE_KEYS.VERSION);
      
      // Clear cache if version changed
      if (storedVersion !== CACHE_VERSION) {
        this.clearAll();
        localStorage.setItem(CACHE_KEYS.VERSION, CACHE_VERSION);
      }
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  /**
   * Set a cache entry in localStorage
   */
  private setLocalStorage<T>(key: string, data: T, ttl: number): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: CACHE_VERSION,
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to set cache:', error);
      // If quota exceeded, clear old entries
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearExpired();
      }
    }
  }

  /**
   * Get a cache entry from localStorage
   */
  private getLocalStorage<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check version
      if (entry.version !== CACHE_VERSION) {
        localStorage.removeItem(key);
        return null;
      }

      // Check if expired
      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * Delete a cache entry from localStorage
   */
  private deleteLocalStorage(key: string): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to delete cache:', error);
    }
  }

  /**
   * Cache newsletter metadata
   */
  cacheNewsletter(newsletter: Newsletter, ttl: number = DEFAULT_TTL.NEWSLETTER): void {
    const key = CACHE_KEYS.NEWSLETTER(newsletter.id);
    this.setLocalStorage(key, newsletter, ttl);
  }

  /**
   * Get cached newsletter metadata
   */
  getNewsletter(id: string): Newsletter | null {
    const key = CACHE_KEYS.NEWSLETTER(id);
    return this.getLocalStorage<Newsletter>(key);
  }

  /**
   * Invalidate newsletter cache
   */
  invalidateNewsletter(id: string): void {
    const key = CACHE_KEYS.NEWSLETTER(id);
    this.deleteLocalStorage(key);
  }

  /**
   * Cache issue list for a newsletter
   */
  cacheIssues(newsletterId: string, issues: Issue[], ttl: number = DEFAULT_TTL.ISSUES): void {
    const key = CACHE_KEYS.ISSUES(newsletterId);
    this.setLocalStorage(key, issues, ttl);
  }

  /**
   * Get cached issue list
   */
  getIssues(newsletterId: string): Issue[] | null {
    const key = CACHE_KEYS.ISSUES(newsletterId);
    return this.getLocalStorage<Issue[]>(key);
  }

  /**
   * Invalidate issue list cache
   */
  invalidateIssues(newsletterId: string): void {
    const key = CACHE_KEYS.ISSUES(newsletterId);
    this.deleteLocalStorage(key);
  }

  /**
   * Cache decrypted content in memory (session-only)
   */
  cacheDecryptedContent(issueId: string, content: ContentSection[]): void {
    this.memoryCache.set(`decrypted_${issueId}`, content);
  }

  /**
   * Get cached decrypted content from memory
   */
  getDecryptedContent(issueId: string): ContentSection[] | null {
    return this.memoryCache.get(`decrypted_${issueId}`);
  }

  /**
   * Invalidate decrypted content cache
   */
  invalidateDecryptedContent(issueId: string): void {
    this.memoryCache.delete(`decrypted_${issueId}`);
  }

  /**
   * Clear all expired entries from localStorage
   */
  clearExpired(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      for (const key of keys) {
        if (!key.startsWith(CACHE_PREFIX)) continue;
        if (key === CACHE_KEYS.VERSION) continue;

        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const entry: CacheEntry<unknown> = JSON.parse(item);
          const age = now - entry.timestamp;

          if (age > entry.ttl) {
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    // Clear localStorage
    if (this.isLocalStorageAvailable) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }

    // Clear memory cache
    this.memoryCache.clear();
  }

  /**
   * Clear all memory cache (decrypted content)
   */
  clearMemoryCache(): void {
    this.memoryCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    localStorageEntries: number;
    memoryEntries: number;
    totalSize: number;
  } {
    let localStorageEntries = 0;
    let totalSize = 0;

    if (this.isLocalStorageAvailable) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_KEYS.VERSION) {
            localStorageEntries++;
            const item = localStorage.getItem(key);
            if (item) {
              totalSize += item.length;
            }
          }
        }
      } catch (error) {
        console.error('Failed to get cache stats:', error);
      }
    }

    return {
      localStorageEntries,
      memoryEntries: this.memoryCache['cache'].size,
      totalSize,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
