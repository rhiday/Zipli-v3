'use client';

import { toast } from '@/hooks/use-toast';

// Types for optimistic locking
export interface OptimisticLockData {
  version: number;
  lastModified: Date;
  lockedBy?: string;
  lockExpiry?: Date;
}

export interface LockableResource {
  id: string;
  version: number;
  lastModified: string;
  lockedBy?: string | null;
  lockExpiry?: string | null;
}

export interface OptimisticUpdateResult<T> {
  success: boolean;
  data?: T;
  conflict?: {
    type: 'version' | 'lock' | 'concurrent';
    message: string;
    currentVersion?: number;
    lockedBy?: string;
  };
  error?: string;
}

// Lock duration constants
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const LOCK_REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const CONFLICT_RETRY_DELAY_MS = 1000; // 1 second

class OptimisticLockingManager {
  private static instance: OptimisticLockingManager;
  private activeLocks = new Map<
    string,
    {
      refreshTimer: NodeJS.Timeout;
      version: number;
    }
  >();
  private conflictRetryCounters = new Map<string, number>();

  private constructor() {}

  static getInstance(): OptimisticLockingManager {
    if (!OptimisticLockingManager.instance) {
      OptimisticLockingManager.instance = new OptimisticLockingManager();
    }
    return OptimisticLockingManager.instance;
  }

  /**
   * Acquire an optimistic lock on a resource
   */
  async acquireLock(
    resourceType: string,
    resourceId: string,
    currentVersion: number,
    userId: string
  ): Promise<OptimisticUpdateResult<LockableResource>> {
    try {
      const lockKey = `${resourceType}:${resourceId}`;
      const lockExpiry = new Date(Date.now() + LOCK_DURATION_MS);

      // Simulate API call to acquire lock
      const response = await this.simulateApiCall<LockableResource>(
        '/api/locks/acquire',
        {
          resourceType,
          resourceId,
          version: currentVersion,
          userId,
          lockExpiry: lockExpiry.toISOString(),
        }
      );

      if (response.success && response.data) {
        // Set up lock refresh timer
        this.startLockRefresh(lockKey, response.data.version, userId);

        toast({
          title: 'Resource locked',
          description: 'You have exclusive access for 5 minutes',
          variant: 'info',
        });

        return response;
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to acquire lock',
      };
    }
  }

  /**
   * Release an optimistic lock
   */
  async releaseLock(
    resourceType: string,
    resourceId: string,
    version: number,
    userId: string
  ): Promise<OptimisticUpdateResult<void>> {
    try {
      const lockKey = `${resourceType}:${resourceId}`;

      // Clear refresh timer
      this.stopLockRefresh(lockKey);

      // Simulate API call to release lock
      const response = await this.simulateApiCall<void>('/api/locks/release', {
        resourceType,
        resourceId,
        version,
        userId,
      });

      if (response.success) {
        toast({
          title: 'Changes saved',
          description: 'Resource lock released',
          variant: 'success',
        });
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to release lock',
      };
    }
  }

  /**
   * Perform an optimistic update with version checking
   */
  async performOptimisticUpdate<T>(
    resourceType: string,
    resourceId: string,
    currentVersion: number,
    updateData: Partial<T>,
    userId: string
  ): Promise<OptimisticUpdateResult<T>> {
    try {
      const response = await this.simulateApiCall<T>('/api/optimistic-update', {
        resourceType,
        resourceId,
        version: currentVersion,
        updateData,
        userId,
      });

      if (response.success) {
        // Reset conflict retry counter on success
        const conflictKey = `${resourceType}:${resourceId}`;
        this.conflictRetryCounters.delete(conflictKey);

        toast({
          title: 'Update successful',
          description: 'Changes have been saved',
          variant: 'success',
        });
      } else if (response.conflict) {
        this.handleUpdateConflict(resourceType, resourceId, response.conflict);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      };
    }
  }

  /**
   * Handle update conflicts with retry mechanism
   */
  private handleUpdateConflict(
    resourceType: string,
    resourceId: string,
    conflict: NonNullable<OptimisticUpdateResult<any>['conflict']>
  ): void {
    const conflictKey = `${resourceType}:${resourceId}`;
    const retryCount = this.conflictRetryCounters.get(conflictKey) || 0;

    if (conflict.type === 'version') {
      toast({
        title: 'Conflicting changes detected',
        description:
          'The resource was modified by someone else. Please refresh and try again.',
        variant: 'warning',
      });
    } else if (conflict.type === 'lock') {
      toast({
        title: 'Resource is locked',
        description: conflict.lockedBy
          ? `Currently being edited by ${conflict.lockedBy}`
          : 'Resource is currently locked by another user',
        variant: 'warning',
      });
    } else if (conflict.type === 'concurrent') {
      // Auto-retry for concurrent access conflicts (up to 3 times)
      if (retryCount < 3) {
        this.conflictRetryCounters.set(conflictKey, retryCount + 1);

        toast({
          title: 'Concurrent access detected',
          description: `Retrying in ${CONFLICT_RETRY_DELAY_MS / 1000} seconds...`,
          variant: 'info',
        });

        setTimeout(() => {
          // Trigger retry event (would be handled by calling component)
          window.dispatchEvent(
            new CustomEvent('optimistic-retry', {
              detail: { resourceType, resourceId },
            })
          );
        }, CONFLICT_RETRY_DELAY_MS);
      } else {
        toast({
          title: 'Update failed',
          description:
            'Multiple concurrent updates detected. Please refresh and try again.',
          variant: 'error',
        });
      }
    }
  }

  /**
   * Start lock refresh timer to prevent expiry
   */
  private startLockRefresh(
    lockKey: string,
    version: number,
    userId: string
  ): void {
    // Clear existing timer if any
    this.stopLockRefresh(lockKey);

    const refreshTimer = setInterval(async () => {
      try {
        const [resourceType, resourceId] = lockKey.split(':');
        await this.refreshLock(resourceType, resourceId, version, userId);
      } catch (error) {
        console.error('Failed to refresh lock:', error);
        this.stopLockRefresh(lockKey);

        toast({
          title: 'Lock expired',
          description:
            'Your exclusive access has expired. Please save your changes.',
          variant: 'warning',
        });
      }
    }, LOCK_REFRESH_INTERVAL_MS);

    this.activeLocks.set(lockKey, { refreshTimer, version });
  }

  /**
   * Stop lock refresh timer
   */
  private stopLockRefresh(lockKey: string): void {
    const lockData = this.activeLocks.get(lockKey);
    if (lockData) {
      clearInterval(lockData.refreshTimer);
      this.activeLocks.delete(lockKey);
    }
  }

  /**
   * Refresh an existing lock
   */
  private async refreshLock(
    resourceType: string,
    resourceId: string,
    version: number,
    userId: string
  ): Promise<void> {
    const lockExpiry = new Date(Date.now() + LOCK_DURATION_MS);

    await this.simulateApiCall('/api/locks/refresh', {
      resourceType,
      resourceId,
      version,
      userId,
      lockExpiry: lockExpiry.toISOString(),
    });
  }

  /**
   * Check if a resource has conflicts before attempting an update
   */
  async checkForConflicts(
    resourceType: string,
    resourceId: string,
    currentVersion: number
  ): Promise<OptimisticUpdateResult<LockableResource>> {
    try {
      return await this.simulateApiCall<LockableResource>('/api/locks/check', {
        resourceType,
        resourceId,
        version: currentVersion,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conflict check failed',
      };
    }
  }

  /**
   * Get all active locks for debugging
   */
  getActiveLocks(): string[] {
    return Array.from(this.activeLocks.keys());
  }

  /**
   * Clean up all locks (call on app unmount)
   */
  cleanup(): void {
    for (const lockKey of Array.from(this.activeLocks.keys())) {
      this.stopLockRefresh(lockKey);
    }
    this.conflictRetryCounters.clear();
  }

  /**
   * Simulate API calls - in real implementation, replace with actual HTTP calls
   */
  private async simulateApiCall<T>(
    endpoint: string,
    data: any
  ): Promise<OptimisticUpdateResult<T>> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    // Simulate different scenarios for testing
    const scenario = Math.random();

    if (scenario < 0.8) {
      // Success case
      return {
        success: true,
        data: {
          id: data.resourceId,
          version: (data.version || 0) + 1,
          lastModified: new Date().toISOString(),
          lockedBy: data.userId,
          lockExpiry: data.lockExpiry,
        } as T,
      };
    } else if (scenario < 0.9) {
      // Version conflict
      return {
        success: false,
        conflict: {
          type: 'version',
          message: 'Resource has been modified by another user',
          currentVersion: (data.version || 0) + 1,
        },
      };
    } else {
      // Lock conflict
      return {
        success: false,
        conflict: {
          type: 'lock',
          message: 'Resource is currently locked',
          lockedBy: 'Another User',
        },
      };
    }
  }
}

// React hook for optimistic locking
export function useOptimisticLocking() {
  const manager = OptimisticLockingManager.getInstance();

  return {
    acquireLock: manager.acquireLock.bind(manager),
    releaseLock: manager.releaseLock.bind(manager),
    performUpdate: manager.performOptimisticUpdate.bind(manager),
    checkConflicts: manager.checkForConflicts.bind(manager),
  };
}

// Utility functions
export function createVersionedResource<T extends Record<string, any>>(
  data: T & { id: string }
): T & LockableResource {
  return {
    ...data,
    version: 1,
    lastModified: new Date().toISOString(),
    lockedBy: null,
    lockExpiry: null,
  };
}

export function isResourceLocked(resource: LockableResource): boolean {
  if (!resource.lockExpiry) return false;

  const expiry = new Date(resource.lockExpiry);
  const now = new Date();

  return expiry > now;
}

export function canUserModify(
  resource: LockableResource,
  userId: string
): boolean {
  if (!isResourceLocked(resource)) return true;
  return resource.lockedBy === userId;
}

export { OptimisticLockingManager };
