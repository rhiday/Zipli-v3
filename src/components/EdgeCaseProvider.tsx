'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/lib/service-worker';
import { SessionManager } from '@/lib/session-manager';
import { DatabaseHealthMonitor } from '@/lib/db-health';
import { MemoryMonitor } from '@/lib/memory-monitor';
import { StoreCleanupManager } from '@/lib/store-cleanup';
import { MobileKeyboardManager } from '@/lib/mobile-keyboard';
import { useDatabase } from '@/store/databaseStore';
import { toast } from '@/hooks/use-toast';

export function EdgeCaseProvider({ children }: { children: React.ReactNode }) {
  const databaseStore = useDatabase();

  const { register, isSupported } = useServiceWorker({
    onUpdate: () => {
      console.log('Service worker update available');
    },
    onSuccess: () => {
      console.log('Service worker registered successfully');
    },
    onError: (error) => {
      console.error('Service worker registration failed:', error);
    },
  });

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initializeEdgeCaseSystems();
    }
  }, []);

  const initializeEdgeCaseSystems = async () => {
    try {
      // 1. Initialize Service Worker for offline functionality
      if (isSupported && process.env.NODE_ENV === 'production') {
        await register();
      }

      // 2. Start session management
      const sessionManager = SessionManager.getInstance();
      await sessionManager.startSessionMonitoring();

      // 3. Initialize database health monitoring
      const dbMonitor = DatabaseHealthMonitor.getInstance();
      dbMonitor.startMonitoring();

      // 4. Initialize memory monitoring and store cleanup
      const memoryMonitor = MemoryMonitor.getInstance();
      memoryMonitor.startMonitoring();

      const storeCleanupManager = StoreCleanupManager.getInstance();
      storeCleanupManager.registerStore(databaseStore);
      storeCleanupManager.startPeriodicCleanup();

      // 5. Set up online/offline detection
      setupNetworkMonitoring();

      // 6. Handle unhandled errors globally
      setupGlobalErrorHandling();

      // 7. Set up visibility change handling (for tab switching)
      setupVisibilityChangeHandling();

      // 8. Initialize mobile keyboard management
      const keyboardManager = MobileKeyboardManager.getInstance();
      keyboardManager.configure({
        preventBodyScroll: true,
        adjustViewport: true,
        scrollActiveElementIntoView: true,
      });

      // 9. Set up emergency cleanup listeners
      setupEmergencyCleanupHandling();

      console.log('All edge case mitigation systems initialized');
    } catch (error) {
      console.error('Failed to initialize edge case systems:', error);
      toast({
        title: 'Initialization warning',
        description: 'Some features may have limited functionality',
        variant: 'warning',
      });
    }
  };

  const setupNetworkMonitoring = () => {
    const handleOnline = () => {
      toast({
        title: 'Connection restored',
        description: 'All features are now available',
        variant: 'success',
      });
    };

    const handleOffline = () => {
      toast({
        title: "You're offline",
        description: 'Limited functionality available',
        variant: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const setupGlobalErrorHandling = () => {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Don't show toast for common network errors in production
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: 'Unexpected error',
          description: 'Please try again or refresh the page',
          variant: 'error',
        });
      }

      // Prevent default browser error dialog
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);

      if (process.env.NODE_ENV === 'development') {
        toast({
          title: 'Script error',
          description: event.message || 'An error occurred',
          variant: 'error',
        });
      }
    });
  };

  const setupVisibilityChangeHandling = () => {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Tab became visible - check for updates
        const dbMonitor = DatabaseHealthMonitor.getInstance();
        dbMonitor.performHealthCheck();

        // Check session validity
        const sessionManager = SessionManager.getInstance();
        sessionManager.checkSessionValidity();
      }
    });
  };

  const setupEmergencyCleanupHandling = () => {
    // Listen for emergency memory cleanup events
    window.addEventListener('emergency-memory-cleanup', () => {
      const storeCleanupManager = StoreCleanupManager.getInstance();
      storeCleanupManager.emergencyCleanup();
    });

    // Listen for beforeunload to perform final cleanup
    window.addEventListener('beforeunload', () => {
      const storeCleanupManager = StoreCleanupManager.getInstance();
      storeCleanupManager.performCleanup();
    });
  };

  return <>{children}</>;
}
