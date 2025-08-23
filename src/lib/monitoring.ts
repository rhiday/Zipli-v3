// =====================================================
// BASIC MONITORING & ERROR TRACKING
// Quick setup for demo - can be upgraded to Sentry/DataDog later
// =====================================================

interface ErrorEvent {
  message: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceEvent {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Simple in-memory storage for demo (replace with external service for production)
class SimpleMonitoring {
  private errors: ErrorEvent[] = [];
  private performances: PerformanceEvent[] = [];
  private maxEvents = 100; // Prevent memory leaks

  // Error tracking
  trackError(
    error: Error | string,
    severity: ErrorEvent['severity'] = 'medium',
    metadata?: Record<string, any>
  ) {
    const errorEvent: ErrorEvent = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString(),
      severity,
      ...metadata,
    };

    this.errors.push(errorEvent);

    // Keep only recent errors
    if (this.errors.length > this.maxEvents) {
      this.errors = this.errors.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[MONITORING]', errorEvent);
    }

    // In production, send to external service
    if (process.env.NODE_ENV === 'production' && severity === 'critical') {
      this.sendToExternalService('error', errorEvent);
    }
  }

  // Performance tracking
  trackPerformance(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ) {
    const perfEvent: PerformanceEvent = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.performances.push(perfEvent);

    // Keep only recent events
    if (this.performances.length > this.maxEvents) {
      this.performances = this.performances.slice(-this.maxEvents);
    }

    // Warn about slow operations
    if (duration > 1000) {
      // > 1 second
      console.warn(`[PERFORMANCE] Slow operation: ${name} took ${duration}ms`);
    }
  }

  // Database operation wrapper
  async trackDatabaseOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      this.trackPerformance(`db_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackError(error as Error, 'high', { operation: name, duration });
      throw error;
    }
  }

  // Get monitoring data for dashboards
  getErrorStats() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentErrors = this.errors.filter(
      (e) => new Date(e.timestamp) > last24h
    );

    return {
      total: recentErrors.length,
      critical: recentErrors.filter((e) => e.severity === 'critical').length,
      high: recentErrors.filter((e) => e.severity === 'high').length,
      medium: recentErrors.filter((e) => e.severity === 'medium').length,
      low: recentErrors.filter((e) => e.severity === 'low').length,
    };
  }

  getPerformanceStats() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPerf = this.performances.filter(
      (p) => new Date(p.timestamp) > last24h
    );

    if (recentPerf.length === 0) return null;

    const durations = recentPerf.map((p) => p.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    return {
      count: recentPerf.length,
      avgDuration: Math.round(avg),
      maxDuration: Math.round(max),
      minDuration: Math.round(min),
      slowOps: recentPerf.filter((p) => p.duration > 1000).length,
    };
  }

  // Send to external monitoring service (Sentry, DataDog, etc.)
  private async sendToExternalService(
    type: 'error' | 'performance',
    data: any
  ) {
    try {
      // Replace with actual monitoring service endpoint
      const monitoringEndpoint = process.env.MONITORING_ENDPOINT;
      if (!monitoringEndpoint) return;

      await fetch(monitoringEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send monitoring data', error);
    }
  }
}

// Singleton instance
export const monitoring = new SimpleMonitoring();

// React Hook for error boundaries
export function useErrorTracking() {
  // Removed translation dependency

  return {
    trackError: monitoring.trackError.bind(monitoring),
    trackPerformance: monitoring.trackPerformance.bind(monitoring),
  };
}

// Performance measurement decorator
export function withPerformanceTracking<
  T extends (...args: any[]) => Promise<any>,
>(name: string, fn: T): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      monitoring.trackPerformance(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      monitoring.trackError(error as Error, 'high', {
        function: name,
        duration,
      });
      throw error;
    }
  }) as T;
}
