interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private storage: Map<string, CacheItem<any>>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.storage = new Map();
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Clean up expired items
    this.cleanup();

    // Remove oldest item if cache is full
    if (this.storage.size >= this.maxSize) {
      const oldestKey = this.storage.keys().next().value;
      this.storage.delete(oldestKey);
    }

    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.storage.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.storage.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup();
    return this.storage.size;
  }
}

// Global cache instance
export const cache = new Cache();

// Cache keys
export const cacheKeys = {
  userProfile: (userId: string) => `user:${userId}`,
  project: (projectId: string) => `project:${projectId}`,
  projectTasks: (projectId: string) => `tasks:${projectId}`,
  aiResponse: (hash: string) => `ai:${hash}`,
  userProjects: (userId: string) => `projects:${userId}`,
} as const;

// Cache utilities
export function generateCacheKey(prefix: string, ...params: any[]): string {
  return `${prefix}:${params.join(':')}`;
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Cached function wrapper
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = 5 * 60 * 1000
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    const cached = cache.get<R>(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  };
}

// Cache middleware for API routes
export function createCacheMiddleware(ttl: number = 5 * 60 * 1000) {
  return function cacheMiddleware<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    keyGenerator: (...args: T) => string
  ): (...args: T) => Promise<R> {
    return withCache(fn, keyGenerator, ttl);
  };
}

// Preload cache with common data
export async function preloadCache(userId?: string) {
  if (!userId) return;

  // Preload user profile
  // const userProfile = await getUserProfile(userId);
  // cache.set(cacheKeys.userProfile(userId), userProfile, 10 * 60 * 1000);

  // Preload user projects
  // const projects = await getUserProjects(userId);
  // cache.set(cacheKeys.userProjects(userId), projects, 5 * 60 * 1000);
}

// Cache invalidation
export function invalidateUserCache(userId: string) {
  cache.delete(cacheKeys.userProfile(userId));
  cache.delete(cacheKeys.userProjects(userId));
}

export function invalidateProjectCache(projectId: string) {
  cache.delete(cacheKeys.project(projectId));
  cache.delete(cacheKeys.projectTasks(projectId));
}

// Local storage cache for offline support
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'brixem_cache') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}:${key}`);
      if (!item) return null;

      const parsed: CacheItem<T> = JSON.parse(item);
      
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`${this.prefix}:${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}:${key}`);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.prefix}:`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }
}

export const localStorageCache = new LocalStorageCache(); 