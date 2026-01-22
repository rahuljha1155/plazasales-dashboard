/**
 * Simple in-memory cache with TTL (Time To Live) support
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class CacheManager {
    private cache: Map<string, CacheEntry<any>> = new Map();

    /**
     * Get data from cache
     * @param key - Cache key
     * @returns Cached data or null if expired/not found
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set data in cache
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    /**
     * Clear specific cache entry
     * @param key - Cache key to clear
     */
    clear(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        this.cache.clear();
    }

    /**
     * Check if key exists and is not expired
     * @param key - Cache key
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Get all cache keys
     */
    keys(): string[] {
        return Array.from(this.cache.keys());
    }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Helper function to fetch data with caching
 * @param key - Cache key
 * @param fetcher - Function that fetches the data
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
): Promise<T> {
    // Try to get from cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    cache.set(key, data, ttl);

    return data;
}
