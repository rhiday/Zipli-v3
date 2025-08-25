'use client';

import { toast } from '@/hooks/use-toast';

export interface ServiceWorkerConfig {
  onUpdate?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private config: ServiceWorkerConfig = {};

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register(
    config: ServiceWorkerConfig = {}
  ): Promise<ServiceWorkerRegistration | null> {
    this.config = config;

    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        this.handleUpdate(registration);
      });

      // Check for existing waiting service worker
      if (registration.waiting) {
        this.showUpdatePrompt(registration.waiting);
      }

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event);
      });

      // Success callback
      this.config.onSuccess?.();

      if (process.env.NODE_ENV === 'development') {
        toast({
          title: 'Service Worker registered',
          description: 'Offline features are now available',
          variant: 'success',
        });
      }

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.config.onError?.(error as Error);
      return null;
    }
  }

  private handleUpdate(registration: ServiceWorkerRegistration) {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New version available
          console.log('New service worker version available');
          this.showUpdatePrompt(newWorker);
        } else {
          // First time installation
          console.log('Service worker installed for the first time');
        }
      }
    });
  }

  private showUpdatePrompt(worker: ServiceWorker) {
    toast({
      title: 'App update available',
      description: 'A new version is ready. Refresh to update.',
      variant: 'info',
    });

    this.config.onUpdate?.();
  }

  private updateServiceWorker(worker: ServiceWorker) {
    worker.postMessage({ type: 'SKIP_WAITING' });

    // Listen for the controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  private handleMessage(event: MessageEvent) {
    const { data } = event;

    switch (data?.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.payload);
        break;

      case 'OFFLINE_READY':
        if (process.env.NODE_ENV === 'development') {
          toast({
            title: 'App ready for offline use',
            description: 'Content has been cached',
            variant: 'success',
          });
        }
        break;

      default:
        console.log('Received message from service worker:', data);
    }
  }

  async unregister(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const unregistered = await registration.unregister();
        console.log('Service Worker unregistered:', unregistered);
        return unregistered;
      }
      return false;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async checkForUpdates(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('Checked for service worker updates');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  async isInstalled(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    } catch {
      return false;
    }
  }
}

// React hook for service worker management
export function useServiceWorker(config: ServiceWorkerConfig = {}) {
  const manager = ServiceWorkerManager.getInstance();

  const register = async () => {
    return await manager.register(config);
  };

  const unregister = async () => {
    return await manager.unregister();
  };

  const checkForUpdates = async () => {
    return await manager.checkForUpdates();
  };

  return {
    register,
    unregister,
    checkForUpdates,
    isSupported: manager.isSupported(),
  };
}

export { ServiceWorkerManager };
