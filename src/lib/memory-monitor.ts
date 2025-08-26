'use client';

import * as React from 'react';
import { toast } from '@/hooks/use-toast';

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usage: number; // percentage
}

export interface MemoryThresholds {
  warning: number; // percentage
  critical: number; // percentage
}

const DEFAULT_THRESHOLDS: MemoryThresholds = {
  warning: 70, // 70% of heap limit
  critical: 85, // 85% of heap limit
};

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private monitoringInterval?: NodeJS.Timeout;
  private thresholds: MemoryThresholds;
  private lastWarningTime = 0;
  private lastCriticalTime = 0;
  private warningCooldown = 60000; // 1 minute
  private criticalCooldown = 30000; // 30 seconds

  private constructor(thresholds: MemoryThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  static getInstance(thresholds?: MemoryThresholds): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor(thresholds);
    }
    return MemoryMonitor.instance;
  }

  getMemoryMetrics(): MemoryMetrics | null {
    if (!this.isSupported()) return null;

    const performance = (window as any).performance;
    const memory = performance.memory;

    const metrics: MemoryMetrics = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };

    return metrics;
  }

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'memory' in (window as any).performance
    );
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (!this.isSupported()) {
      console.warn('Memory monitoring not supported in this browser');
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    // Initial check
    this.checkMemoryUsage();
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  private checkMemoryUsage(): void {
    const metrics = this.getMemoryMetrics();
    if (!metrics) return;

    const now = Date.now();

    // Critical threshold
    if (metrics.usage > this.thresholds.critical) {
      if (now - this.lastCriticalTime > this.criticalCooldown) {
        this.lastCriticalTime = now;
        this.handleCriticalMemory(metrics);
      }
    }
    // Warning threshold
    else if (metrics.usage > this.thresholds.warning) {
      if (now - this.lastWarningTime > this.warningCooldown) {
        this.lastWarningTime = now;
        this.handleWarningMemory(metrics);
      }
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Memory usage:', `${metrics.usage.toFixed(1)}%`);
    }
  }

  private handleWarningMemory(metrics: MemoryMetrics): void {
    if (process.env.NODE_ENV === 'development') {
      toast({
        title: 'Memory usage warning',
        description: `Memory usage is at ${metrics.usage.toFixed(1)}%. Consider refreshing if you experience performance issues.`,
        variant: 'warning',
      });
    }

    // Trigger garbage collection if possible (Chrome DevTools)
    this.suggestGarbageCollection();
  }

  private handleCriticalMemory(metrics: MemoryMetrics): void {
    toast({
      title: 'High memory usage detected',
      description: `Memory usage is at ${metrics.usage.toFixed(1)}%. Please refresh the page to continue.`,
      variant: 'error',
    });

    // Force aggressive cleanup
    this.performEmergencyCleanup();
  }

  private suggestGarbageCollection(): void {
    // Request garbage collection if available (Chrome DevTools)
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Clear any large data structures
    this.clearLargeCaches();
  }

  private performEmergencyCleanup(): void {
    // Clear all possible caches
    this.clearLargeCaches();

    // Clear image caches
    this.clearImageCaches();

    // Dispatch cleanup event
    window.dispatchEvent(new CustomEvent('emergency-memory-cleanup'));

    // Suggest page refresh after delay
    setTimeout(() => {
      if (confirm('The app is using too much memory. Refresh the page?')) {
        window.location.reload();
      }
    }, 5000);
  }

  private clearLargeCaches(): void {
    try {
      // Clear localStorage except critical items
      const criticalKeys = ['auth-storage', 'user-preferences'];
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !criticalKeys.some((critical) => key.includes(critical))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('Large caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  private clearImageCaches(): void {
    try {
      // Remove cached images from DOM
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
        }
      });

      // Clear canvas elements
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });

      console.log('Image caches cleared');
    } catch (error) {
      console.error('Error clearing image caches:', error);
    }
  }

  // Manual cleanup method for components
  static cleanup(): void {
    const instance = MemoryMonitor.getInstance();
    instance.clearLargeCaches();
  }
}

// React hook for memory monitoring
export function useMemoryMonitor(
  enabled: boolean = true
): MemoryMetrics | null {
  const monitor = MemoryMonitor.getInstance();

  React.useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      monitor.startMonitoring();

      return () => {
        monitor.stopMonitoring();
      };
    }
  }, [enabled, monitor]);

  if (typeof window === 'undefined') return null;

  return monitor.getMemoryMetrics();
}

export { MemoryMonitor };
