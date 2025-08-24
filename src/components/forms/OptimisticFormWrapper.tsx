'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useOptimisticLocking,
  LockableResource,
} from '@/lib/optimistic-locking';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Unlock, AlertTriangle } from 'lucide-react';

interface OptimisticFormWrapperProps {
  children: React.ReactNode;
  resourceType: string;
  resourceId: string;
  currentVersion: number;
  userId: string;
  onVersionConflict?: (newVersion: number) => void;
  onLockAcquired?: () => void;
  onLockReleased?: () => void;
  autoLock?: boolean;
  className?: string;
}

interface FormState {
  isLocked: boolean;
  isLocking: boolean;
  lockError: string | null;
  lastConflictCheck: Date | null;
  hasUnsavedChanges: boolean;
}

export const OptimisticFormWrapper: React.FC<OptimisticFormWrapperProps> = ({
  children,
  resourceType,
  resourceId,
  currentVersion,
  userId,
  onVersionConflict,
  onLockAcquired,
  onLockReleased,
  autoLock = true,
  className = '',
}) => {
  const [formState, setFormState] = useState<FormState>({
    isLocked: false,
    isLocking: false,
    lockError: null,
    lastConflictCheck: null,
    hasUnsavedChanges: false,
  });

  const { acquireLock, releaseLock, checkConflicts } = useOptimisticLocking();

  const handleLockAcquisition = useCallback(async () => {
    if (formState.isLocked || formState.isLocking) return;

    setFormState((prev) => ({ ...prev, isLocking: true, lockError: null }));

    try {
      const result = await acquireLock(
        resourceType,
        resourceId,
        currentVersion,
        userId
      );

      if (result.success) {
        setFormState((prev) => ({ ...prev, isLocked: true, isLocking: false }));
        onLockAcquired?.();
      } else {
        const errorMessage =
          result.conflict?.message || result.error || 'Failed to acquire lock';
        setFormState((prev) => ({
          ...prev,
          lockError: errorMessage,
          isLocking: false,
        }));

        if (
          result.conflict?.type === 'version' &&
          result.conflict.currentVersion
        ) {
          onVersionConflict?.(result.conflict.currentVersion);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected error';
      setFormState((prev) => ({
        ...prev,
        lockError: errorMessage,
        isLocking: false,
      }));
    }
  }, [
    formState.isLocked,
    formState.isLocking,
    resourceType,
    resourceId,
    currentVersion,
    userId,
    acquireLock,
    onLockAcquired,
    onVersionConflict,
  ]);

  const handleLockRelease = useCallback(async () => {
    if (!formState.isLocked) return;

    try {
      await releaseLock(resourceType, resourceId, currentVersion, userId);
      setFormState((prev) => ({ ...prev, isLocked: false, lockError: null }));
      onLockReleased?.();
    } catch (error) {
      console.error('Failed to release lock:', error);
      // Don't show error toast for lock release failures as they're not critical
    }
  }, [
    formState.isLocked,
    resourceType,
    resourceId,
    currentVersion,
    userId,
    releaseLock,
    onLockReleased,
  ]);

  const checkForConflicts = useCallback(async () => {
    if (!formState.isLocked) return;

    try {
      const result = await checkConflicts(
        resourceType,
        resourceId,
        currentVersion
      );

      if (!result.success && result.conflict?.type === 'version') {
        setFormState((prev) => ({
          ...prev,
          lockError: 'Resource has been modified by another user',
          lastConflictCheck: new Date(),
        }));

        if (result.conflict.currentVersion) {
          onVersionConflict?.(result.conflict.currentVersion);
        }

        toast({
          title: 'Conflicting changes detected',
          description: 'Please refresh to see the latest changes',
          variant: 'warning',
        });
      } else {
        setFormState((prev) => ({ ...prev, lastConflictCheck: new Date() }));
      }
    } catch (error) {
      console.error('Conflict check failed:', error);
    }
  }, [
    formState.isLocked,
    resourceType,
    resourceId,
    currentVersion,
    checkConflicts,
    onVersionConflict,
  ]);

  // Track unsaved changes
  const handleFormChange = useCallback(() => {
    setFormState((prev) => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  const handleFormSave = useCallback(() => {
    setFormState((prev) => ({ ...prev, hasUnsavedChanges: false }));
  }, []);

  // Auto-lock on mount if enabled
  useEffect(() => {
    if (autoLock) {
      handleLockAcquisition();
    }
  }, [autoLock, handleLockAcquisition]);

  // Set up periodic conflict checking
  useEffect(() => {
    if (!formState.isLocked) return;

    const conflictCheckInterval = setInterval(checkForConflicts, 30000); // Check every 30 seconds

    return () => {
      clearInterval(conflictCheckInterval);
    };
  }, [formState.isLocked, checkForConflicts]);

  // Handle form changes detection
  useEffect(() => {
    const formElements = document.querySelectorAll('input, textarea, select');

    const handleChange = () => handleFormChange();

    formElements.forEach((element) => {
      element.addEventListener('change', handleChange);
      element.addEventListener('input', handleChange);
    });

    return () => {
      formElements.forEach((element) => {
        element.removeEventListener('change', handleChange);
        element.removeEventListener('input', handleChange);
      });
    };
  }, [handleFormChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (formState.isLocked) {
        handleLockRelease();
      }
    };
  }, []);

  // Warning for unsaved changes
  useEffect(() => {
    if (!formState.hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formState.hasUnsavedChanges]);

  const getLockStatusIcon = () => {
    if (formState.isLocking) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (formState.isLocked) {
      return <Lock className="h-4 w-4 text-positive" />;
    }
    if (formState.lockError) {
      return <AlertTriangle className="h-4 w-4 text-negative" />;
    }
    return <Unlock className="h-4 w-4 text-primary/60" />;
  };

  const getLockStatusText = () => {
    if (formState.isLocking) {
      return 'Acquiring lock...';
    }
    if (formState.isLocked) {
      return 'You have exclusive edit access';
    }
    if (formState.lockError) {
      return formState.lockError;
    }
    return 'No lock acquired';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Lock Status Banner */}
      <div
        className={`
        flex items-center justify-between p-3 mb-4 rounded-lg border text-sm
        ${
          formState.isLocked
            ? 'bg-positive/10 border-positive/20 text-positive'
            : formState.lockError
              ? 'bg-negative/10 border-negative/20 text-negative'
              : 'bg-primary/5 border-border text-primary/70'
        }
      `}
      >
        <div className="flex items-center space-x-2">
          {getLockStatusIcon()}
          <span>{getLockStatusText()}</span>
          {formState.lastConflictCheck && (
            <span className="text-xs opacity-70">
              Last checked: {formState.lastConflictCheck.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {formState.hasUnsavedChanges && (
            <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded">
              Unsaved changes
            </span>
          )}

          {!autoLock && !formState.isLocked && !formState.isLocking && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleLockAcquisition}
              disabled={formState.isLocking}
            >
              Acquire Lock
            </Button>
          )}

          {formState.isLocked && (
            <Button size="sm" variant="secondary" onClick={handleLockRelease}>
              Release Lock
            </Button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div
        className={`
        ${!formState.isLocked && autoLock ? 'opacity-50 pointer-events-none' : ''}
        ${formState.lockError ? 'opacity-75' : ''}
      `}
      >
        {React.cloneElement(children as React.ReactElement, {
          onSave: handleFormSave,
          disabled: !formState.isLocked && autoLock,
        })}
      </div>

      {/* Conflict Resolution Overlay */}
      {formState.lockError && (
        <div className="absolute inset-0 bg-base/80 flex items-center justify-center rounded-lg">
          <div className="bg-cream p-6 rounded-lg border border-border max-w-md text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Edit Conflict Detected</h3>
            <p className="text-sm text-primary/80 mb-4">
              {formState.lockError}
            </p>
            <div className="space-x-2">
              <Button size="sm" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleLockAcquisition}
              >
                Retry Lock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimisticFormWrapper;
