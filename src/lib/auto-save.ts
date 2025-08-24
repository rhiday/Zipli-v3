'use client';

import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export interface AutoSaveConfig {
  key: string;
  data: any;
  intervalMs?: number;
  enabled?: boolean;
}

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export class AutoSaveManager {
  private static instance: AutoSaveManager;
  private intervals = new Map<string, NodeJS.Timeout>();

  static getInstance(): AutoSaveManager {
    if (!AutoSaveManager.instance) {
      AutoSaveManager.instance = new AutoSaveManager();
    }
    return AutoSaveManager.instance;
  }

  startAutoSave(config: AutoSaveConfig) {
    const {
      key,
      data,
      intervalMs = AUTO_SAVE_INTERVAL,
      enabled = true,
    } = config;

    if (!enabled) return;

    // Clear existing interval
    this.stopAutoSave(key);

    const interval = setInterval(() => {
      try {
        localStorage.setItem(
          `autosave_${key}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );

        if (process.env.NODE_ENV === 'development') {
          console.log(`Auto-saved ${key} at ${new Date().toISOString()}`);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, intervalMs);

    this.intervals.set(key, interval);
  }

  stopAutoSave(key: string) {
    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
    }
  }

  getSavedData(key: string): any | null {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const age = Date.now() - parsed.timestamp;

      // Consider data stale after 24 hours
      if (age > 24 * 60 * 60 * 1000) {
        this.clearSavedData(key);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  }

  clearSavedData(key: string) {
    localStorage.removeItem(`autosave_${key}`);
  }

  hasUnsavedChanges(key: string): boolean {
    return this.getSavedData(key) !== null;
  }
}

export function useAutoSave(config: AutoSaveConfig) {
  const managerRef = useRef<AutoSaveManager>();
  const { key, data, intervalMs, enabled } = config;

  useEffect(() => {
    managerRef.current = AutoSaveManager.getInstance();

    if (enabled !== false) {
      managerRef.current.startAutoSave({ key, data, intervalMs, enabled });
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.stopAutoSave(key);
      }
    };
  }, [key, data, intervalMs, enabled]);

  const restore = () => {
    if (!managerRef.current) return null;
    const saved = managerRef.current.getSavedData(key);
    if (saved) {
      toast({
        title: 'Draft restored',
        description: 'Your previous progress has been restored',
        variant: 'success',
      });
    }
    return saved;
  };

  const clear = () => {
    if (managerRef.current) {
      managerRef.current.clearSavedData(key);
    }
  };

  const hasUnsaved = managerRef.current?.hasUnsavedChanges(key) || false;

  return { restore, clear, hasUnsaved };
}
