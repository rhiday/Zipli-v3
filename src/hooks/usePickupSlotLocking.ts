'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useOptimisticLocking,
  LockableResource,
} from '@/lib/optimistic-locking';
import { toast } from '@/hooks/use-toast';

interface PickupSlot extends LockableResource {
  donationId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reservedBy?: string;
  maxConcurrentPickups: number;
  currentPickups: number;
}

interface PickupSlotLockingState {
  slots: PickupSlot[];
  loading: boolean;
  error: string | null;
  lockedSlots: Set<string>;
  refreshing: boolean;
}

export function usePickupSlotLocking(donationId: string, userId: string) {
  const [state, setState] = useState<PickupSlotLockingState>({
    slots: [],
    loading: true,
    error: null,
    lockedSlots: new Set(),
    refreshing: false,
  });

  const { acquireLock, releaseLock, performUpdate, checkConflicts } =
    useOptimisticLocking();

  // Auto-refresh slots every 10 seconds to detect changes
  const refreshSlots = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, refreshing: true }));

      // Simulate API call to fetch current slots
      const response = await simulateGetPickupSlots(donationId);

      setState((prev) => ({
        ...prev,
        slots: response.slots,
        refreshing: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to refresh slots',
        refreshing: false,
      }));
    }
  }, [donationId]);

  // Reserve a pickup slot with optimistic locking
  const reserveSlot = useCallback(
    async (slotId: string): Promise<boolean> => {
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot) {
        toast({
          title: 'Slot not found',
          description: 'The selected pickup slot could not be found',
          variant: 'error',
        });
        return false;
      }

      // Check if slot is still available
      if (
        !slot.isAvailable ||
        slot.currentPickups >= slot.maxConcurrentPickups
      ) {
        toast({
          title: 'Slot unavailable',
          description: 'This pickup slot is no longer available',
          variant: 'warning',
        });
        await refreshSlots();
        return false;
      }

      // Check for conflicts first
      const conflictCheck = await checkConflicts(
        'pickup-slot',
        slotId,
        slot.version
      );
      if (!conflictCheck.success) {
        if (conflictCheck.conflict?.type === 'version') {
          toast({
            title: 'Slot updated',
            description: 'This slot was just modified. Refreshing...',
            variant: 'info',
          });
          await refreshSlots();
          return false;
        }
        return false;
      }

      // Acquire lock
      const lockResult = await acquireLock(
        'pickup-slot',
        slotId,
        slot.version,
        userId
      );
      if (!lockResult.success) {
        if (lockResult.conflict?.type === 'lock') {
          toast({
            title: 'Slot being reserved',
            description: `This slot is currently being reserved by ${lockResult.conflict.lockedBy || 'another user'}`,
            variant: 'warning',
          });
        }
        return false;
      }

      setState((prev) => ({
        ...prev,
        lockedSlots: new Set(Array.from(prev.lockedSlots).concat([slotId])),
      }));

      // Optimistically update the slot
      const updateData = {
        currentPickups: slot.currentPickups + 1,
        isAvailable: slot.currentPickups + 1 < slot.maxConcurrentPickups,
        reservedBy: userId,
      };

      const updateResult = await performUpdate(
        'pickup-slot',
        slotId,
        (lockResult.data as any)?.version || slot.version,
        updateData,
        userId
      );

      if (updateResult.success) {
        // Update local state
        setState((prev) => ({
          ...prev,
          slots: prev.slots.map((s) =>
            s.id === slotId
              ? {
                  ...s,
                  ...updateData,
                  version: (updateResult.data as any)?.version || s.version + 1,
                }
              : s
          ),
        }));

        // Release lock after successful update
        await releaseLock(
          'pickup-slot',
          slotId,
          (updateResult.data as any)?.version || slot.version + 1,
          userId
        );
        setState((prev) => ({
          ...prev,
          lockedSlots: new Set(
            Array.from(prev.lockedSlots).filter((id) => id !== slotId)
          ),
        }));

        return true;
      } else {
        // Handle update failure
        setState((prev) => ({
          ...prev,
          lockedSlots: new Set(
            Array.from(prev.lockedSlots).filter((id) => id !== slotId)
          ),
        }));

        // Release lock on failure
        await releaseLock('pickup-slot', slotId, slot.version, userId);

        if (updateResult.conflict) {
          // Refresh slots to get latest state
          await refreshSlots();
        }

        return false;
      }
    },
    [
      state.slots,
      userId,
      acquireLock,
      releaseLock,
      performUpdate,
      checkConflicts,
      refreshSlots,
    ]
  );

  // Cancel a reservation
  const cancelReservation = useCallback(
    async (slotId: string): Promise<boolean> => {
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot || slot.reservedBy !== userId) {
        return false;
      }

      const lockResult = await acquireLock(
        'pickup-slot',
        slotId,
        slot.version,
        userId
      );
      if (!lockResult.success) {
        return false;
      }

      setState((prev) => ({
        ...prev,
        lockedSlots: new Set(Array.from(prev.lockedSlots).concat([slotId])),
      }));

      const updateData = {
        currentPickups: Math.max(0, slot.currentPickups - 1),
        isAvailable: true,
        reservedBy: undefined,
      };

      const updateResult = await performUpdate(
        'pickup-slot',
        slotId,
        (lockResult.data as any)?.version || slot.version,
        updateData,
        userId
      );

      if (updateResult.success) {
        setState((prev) => ({
          ...prev,
          slots: prev.slots.map((s) =>
            s.id === slotId
              ? {
                  ...s,
                  ...updateData,
                  version: (updateResult.data as any)?.version || s.version + 1,
                }
              : s
          ),
        }));

        await releaseLock(
          'pickup-slot',
          slotId,
          (updateResult.data as any)?.version || slot.version + 1,
          userId
        );
        setState((prev) => ({
          ...prev,
          lockedSlots: new Set(
            Array.from(prev.lockedSlots).filter((id) => id !== slotId)
          ),
        }));

        toast({
          title: 'Reservation cancelled',
          description: 'Your pickup slot reservation has been cancelled',
          variant: 'success',
        });

        return true;
      }

      // Release lock on failure
      await releaseLock('pickup-slot', slotId, slot.version, userId);
      setState((prev) => ({
        ...prev,
        lockedSlots: new Set(
          Array.from(prev.lockedSlots).filter((id) => id !== slotId)
        ),
      }));

      return false;
    },
    [state.slots, userId, acquireLock, releaseLock, performUpdate]
  );

  // Check if user can modify a slot
  const canModifySlot = useCallback(
    (slotId: string): boolean => {
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot) return false;

      // User can modify if:
      // 1. Slot is not locked, OR
      // 2. Slot is locked by the current user
      return !slot.lockedBy || slot.lockedBy === userId;
    },
    [state.slots, userId]
  );

  // Check if slot is available for reservation
  const isSlotAvailable = useCallback(
    (slotId: string): boolean => {
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot) return false;

      return (
        slot.isAvailable &&
        slot.currentPickups < slot.maxConcurrentPickups &&
        !state.lockedSlots.has(slotId)
      );
    },
    [state.slots, state.lockedSlots]
  );

  // Initial load and auto-refresh setup
  useEffect(() => {
    refreshSlots();

    // Set up auto-refresh interval
    const refreshInterval = setInterval(refreshSlots, 10000); // 10 seconds

    // Listen for retry events from optimistic locking
    const handleRetry = (event: CustomEvent) => {
      const { resourceType, resourceId } = event.detail;
      if (resourceType === 'pickup-slot') {
        refreshSlots();
      }
    };

    window.addEventListener('optimistic-retry', handleRetry as EventListener);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener(
        'optimistic-retry',
        handleRetry as EventListener
      );

      // Release any remaining locks
      for (const slotId of Array.from(state.lockedSlots)) {
        const slot = state.slots.find((s) => s.id === slotId);
        if (slot) {
          releaseLock('pickup-slot', slotId, slot.version, userId);
        }
      }
    };
  }, [donationId]);

  return {
    slots: state.slots,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    lockedSlots: state.lockedSlots,
    reserveSlot,
    cancelReservation,
    canModifySlot,
    isSlotAvailable,
    refreshSlots,
  };
}

// Simulate API calls - replace with real implementation
async function simulateGetPickupSlots(
  donationId: string
): Promise<{ slots: PickupSlot[] }> {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 300)
  );

  // Generate mock slots
  const slots: PickupSlot[] = [
    {
      id: `slot-${donationId}-1`,
      donationId,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // Tomorrow
      startTime: '10:00',
      endTime: '11:00',
      isAvailable: true,
      maxConcurrentPickups: 3,
      currentPickups: 0,
      version: 1,
      lastModified: new Date().toISOString(),
      lockedBy: null,
      lockExpiry: null,
    },
    {
      id: `slot-${donationId}-2`,
      donationId,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      isAvailable: true,
      maxConcurrentPickups: 2,
      currentPickups: 1,
      version: 1,
      lastModified: new Date().toISOString(),
      lockedBy: null,
      lockExpiry: null,
    },
    {
      id: `slot-${donationId}-3`,
      donationId,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // Day after tomorrow
      startTime: '16:00',
      endTime: '17:00',
      isAvailable: false,
      maxConcurrentPickups: 1,
      currentPickups: 1,
      version: 1,
      lastModified: new Date().toISOString(),
      lockedBy: null,
      lockExpiry: null,
    },
  ];

  return { slots };
}
