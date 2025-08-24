'use client';

import * as React from 'react';
import { MemoryMonitor } from './memory-monitor';

export interface CleanupableStore {
  cleanup?: () => void;
  clearCache?: () => void;
  resetState?: () => void;
}

class StoreCleanupManager {
  private static instance: StoreCleanupManager;
  private registeredStores = new Set<CleanupableStore>();
  private cleanupInterval?: NodeJS.Timeout;

  static getInstance(): StoreCleanupManager {
    if (!StoreCleanupManager.instance) {
      StoreCleanupManager.instance = new StoreCleanupManager();
    }
    return StoreCleanupManager.instance;
  }

  registerStore(store: CleanupableStore): void {
    this.registeredStores.add(store);
  }

  unregisterStore(store: CleanupableStore): void {
    this.registeredStores.delete(store);
  }

  startPeriodicCleanup(intervalMs: number = 300000): void {
    // 5 minutes
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);
  }

  stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  performCleanup(): void {
    console.log('Performing store cleanup...');

    this.registeredStores.forEach((store) => {
      try {
        // Clear caches first (least disruptive)
        if (store.clearCache) {
          store.clearCache();
        }

        // Perform general cleanup
        if (store.cleanup) {
          store.cleanup();
        }
      } catch (error) {
        console.error('Error during store cleanup:', error);
      }
    });

    // Also trigger memory monitor cleanup
    MemoryMonitor.cleanup();
  }

  emergencyCleanup(): void {
    console.warn('Performing emergency store cleanup...');

    this.registeredStores.forEach((store) => {
      try {
        // More aggressive cleanup for emergency
        if (store.resetState) {
          store.resetState();
        } else if (store.cleanup) {
          store.cleanup();
        }
      } catch (error) {
        console.error('Error during emergency cleanup:', error);
      }
    });
  }
}

// Hook for automatic cleanup management
export function useStoreCleanup(store: CleanupableStore): void {
  React.useEffect(() => {
    const manager = StoreCleanupManager.getInstance();
    manager.registerStore(store);

    return () => {
      manager.unregisterStore(store);
    };
  }, [store]);
}

// Global cleanup functions
export function performGlobalCleanup(): void {
  const manager = StoreCleanupManager.getInstance();
  manager.performCleanup();
}

export function performEmergencyCleanup(): void {
  const manager = StoreCleanupManager.getInstance();
  manager.emergencyCleanup();
}

export { StoreCleanupManager };
