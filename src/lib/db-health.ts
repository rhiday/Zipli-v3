'use client';

import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { withRetry, NetworkError } from './network-utils';

export interface HealthCheckResult {
  healthy: boolean;
  latency: number;
  error?: string;
  timestamp: number;
}

export interface CacheConfig {
  maxAge: number;
  maxSize: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Max items in cache
};

class DatabaseHealthMonitor {
  private static instance: DatabaseHealthMonitor;
  private supabase = supabase;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealthCheck?: HealthCheckResult;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheConfig: CacheConfig;

  constructor(cacheConfig: Partial<CacheConfig> = {}) {
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };
  }

  static getInstance(
    cacheConfig?: Partial<CacheConfig>
  ): DatabaseHealthMonitor {
    if (!DatabaseHealthMonitor.instance) {
      DatabaseHealthMonitor.instance = new DatabaseHealthMonitor(cacheConfig);
    }
    return DatabaseHealthMonitor.instance;
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simple query to test connection
      const { error } = await this.supabase
        .from('profiles')
        .select('*')
        .limit(1);

      const latency = Date.now() - startTime;

      if (error) {
        throw new Error(error.message);
      }

      const result: HealthCheckResult = {
        healthy: true,
        latency,
        timestamp: Date.now(),
      };

      this.lastHealthCheck = result;
      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        healthy: false,
        latency: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: Date.now(),
      };

      this.lastHealthCheck = result;
      return result;
    }
  }

  startMonitoring(intervalMs: number = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const health = await this.performHealthCheck();

      if (!health.healthy) {
        toast({
          title: 'Database connection issues',
          description: 'Some features may be limited',
          variant: 'error',
        });
      } else if (this.lastHealthCheck && !this.lastHealthCheck.healthy) {
        // Connection restored
        toast({
          title: 'Connection restored',
          description: 'All features are now available',
          variant: 'success',
        });
      }
    }, intervalMs);

    // Initial health check
    this.performHealthCheck();
  }

  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  getLastHealthCheck(): HealthCheckResult | undefined {
    return this.lastHealthCheck;
  }

  isHealthy(): boolean {
    return this.lastHealthCheck?.healthy || false;
  }

  // Cache management
  private cleanupCache() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired entries
    entries.forEach(([key, value]) => {
      if (now - value.timestamp > this.cacheConfig.maxAge) {
        this.cache.delete(key);
      }
    });

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.cacheConfig.maxSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.cache.size - this.cacheConfig.maxSize);

      sortedEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  private getCacheKey(table: string, query: any): string {
    return `${table}_${JSON.stringify(query)}`;
  }

  async queryWithCache<T>(
    table: string,
    queryBuilder: any,
    forceRefresh: boolean = false
  ): Promise<T[]> {
    const cacheKey = this.getCacheKey(table, queryBuilder);

    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheConfig.maxAge) {
        return cached.data;
      }
    }

    // If unhealthy, try cache even if expired
    if (!this.isHealthy()) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        toast({
          title: 'Showing cached data',
          description: 'Database temporarily unavailable',
          variant: 'warning',
        });
        return cached.data;
      }

      throw new NetworkError('Database unavailable and no cached data', false);
    }

    // Fetch fresh data with retry logic
    try {
      const result = await withRetry(() => queryBuilder, {
        maxRetries: 2,
        baseDelay: 1000,
      });

      const { data, error } = result as { data: T[] | null; error: any };

      if (error) {
        throw new NetworkError(error.message);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now(),
      });

      // Cleanup old cache entries
      this.cleanupCache();

      return data || [];
    } catch (error) {
      // Try to return cached data as fallback
      const cached = this.cache.get(cacheKey);
      if (cached) {
        toast({
          title: 'Using cached data',
          description: 'Latest data unavailable',
          variant: 'warning',
        });
        return cached.data;
      }

      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export { DatabaseHealthMonitor };

// Convenience hook
export function useDatabaseHealth() {
  const monitor = DatabaseHealthMonitor.getInstance();

  return {
    startMonitoring: (intervalMs?: number) =>
      monitor.startMonitoring(intervalMs),
    stopMonitoring: () => monitor.stopMonitoring(),
    isHealthy: () => monitor.isHealthy(),
    getLastHealthCheck: () => monitor.getLastHealthCheck(),
    queryWithCache: <T>(
      table: string,
      queryBuilder: any,
      forceRefresh?: boolean
    ) => monitor.queryWithCache<T>(table, queryBuilder, forceRefresh),
    clearCache: () => monitor.clearCache(),
  };
}
