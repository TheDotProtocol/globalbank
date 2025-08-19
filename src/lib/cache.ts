interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    // Clean up expired items
    this.cleanup();

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

// Create cache instances for different purposes
export const userCache = new Cache(100);
export const accountCache = new Cache(200);
export const transactionCache = new Cache(500);
export const analyticsCache = new Cache(50);

// Cache keys
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userAccounts: (id: string) => `user:${id}:accounts`,
  userTransactions: (id: string) => `user:${id}:transactions`,
  account: (id: string) => `account:${id}`,
  accountTransactions: (id: string) => `account:${id}:transactions`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
  fixedDeposits: (userId: string) => `fixedDeposits:${userId}`,
  cards: (userId: string) => `cards:${userId}`,
  eChecks: (userId: string) => `eChecks:${userId}`
};

// Cache utilities
export function invalidateUserCache(userId: string): void {
  userCache.delete(cacheKeys.user(userId));
  userCache.delete(cacheKeys.userAccounts(userId));
  userCache.delete(cacheKeys.userTransactions(userId));
  analyticsCache.delete(cacheKeys.analytics(userId, '30'));
  analyticsCache.delete(cacheKeys.analytics(userId, '90'));
}

export function invalidateAccountCache(accountId: string): void {
  accountCache.delete(cacheKeys.account(accountId));
  accountCache.delete(cacheKeys.accountTransactions(accountId));
}

// Cache decorator for API routes
export function withCache<T extends any[], R>(
  cache: Cache,
  keyFn: (...args: T) => string,
  ttl: number = 5 * 60 * 1000
) {
  return function (fn: (...args: T) => Promise<R>) {
    return async function (...args: T): Promise<R> {
      const key = keyFn(...args);
      const cached = cache.get<R>(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = await fn(...args);
      cache.set(key, result, ttl);
      return result;
    };
  };
} 