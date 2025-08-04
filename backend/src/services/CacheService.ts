import { loggingService } from './LoggingService';

/**
 * Cache Service for search results
 * Implements in-memory caching with TTL
 */
export class CacheService {
  private cache: Map<string, any> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cached items

  /**
   * Generate cache key from query and filters
   */
  private generateCacheKey(query: string, filters: any, naturalLanguageInfo?: any): string {
    const filterString = JSON.stringify(filters);
    const nlInfoString = naturalLanguageInfo ? JSON.stringify(naturalLanguageInfo) : '';
    return `search:${query}:${filterString}:${nlInfoString}`;
  }

  /**
   * Get cached result
   */
  get(key: string): any | null {
    try {
      const cached = this.cache.get(key);
      if (!cached) return null;

      // Check if cache has expired
      if (Date.now() > cached.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      loggingService.info('Cache hit', { key });
      return cached.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache with TTL
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    try {
      // Check cache size limit
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.evictOldest();
      }

      const expiresAt = Date.now() + ttl;
      this.cache.set(key, { data, expiresAt });

      loggingService.info('Cache set', { key, ttl });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      this.cache.clear();
      loggingService.info('Cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldest(): void {
    try {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      
      // Remove oldest 20% of entries
      const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
      entries.slice(0, toRemove).forEach(([key]) => {
        this.cache.delete(key);
      });

      loggingService.info('Cache eviction completed', { removed: toRemove });
    } catch (error) {
      console.error('Cache eviction error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    try {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      const expired = entries.filter(([_, value]) => now > value.expiresAt).length;
      const valid = entries.length - expired;

      return {
        total: entries.length,
        valid,
        expired,
        maxSize: this.MAX_CACHE_SIZE,
        utilization: (entries.length / this.MAX_CACHE_SIZE) * 100,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {};
    }
  }

  /**
   * Cache search result
   */
  cacheSearchResult(query: string, filters: any, result: any, ttl?: number, naturalLanguageInfo?: any): void {
    const key = this.generateCacheKey(query, filters, naturalLanguageInfo);
    this.set(key, result, ttl);
  }

  /**
   * Get cached search result
   */
  getCachedSearchResult(query: string, filters: any, naturalLanguageInfo?: any): any | null {
    const key = this.generateCacheKey(query, filters, naturalLanguageInfo);
    return this.get(key);
  }

  /**
   * Invalidate cache for user
   */
  invalidateUserCache(userId: string): void {
    try {
      const keysToDelete: string[] = [];
      
      this.cache.forEach((value, key) => {
        if (key.includes(`userId":"${userId}"`) || key.includes(`"userId":"${userId}"`)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.cache.delete(key));
      
      loggingService.info('User cache invalidated', { userId, deleted: keysToDelete.length });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Singleton instance
export const cacheService = new CacheService(); 