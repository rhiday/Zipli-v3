'use client';

import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SessionConfig {
  refreshThreshold: number; // Percentage of session duration before refresh
  maxRefreshAttempts: number;
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
  refreshThreshold: 0.9, // Refresh when 90% of session is used
  maxRefreshAttempts: 3,
};

export class SessionManager {
  private static instance: SessionManager;
  private supabase = supabase;
  private refreshInterval?: NodeJS.Timeout;
  private config: SessionConfig;
  private refreshAttempts = 0;

  private constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
  }

  static getInstance(config?: Partial<SessionConfig>): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(config);
    }
    return SessionManager.instance;
  }

  async startSessionMonitoring() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) return;

    // Calculate refresh time based on token expiry
    const expiresAt = session.expires_at
      ? session.expires_at * 1000
      : Date.now() + 60 * 60 * 1000;
    const sessionDuration = expiresAt - Date.now();
    const refreshTime = sessionDuration * this.config.refreshThreshold;

    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
    }

    this.refreshInterval = setTimeout(
      async () => {
        await this.refreshSession();
      },
      Math.max(refreshTime, 30000)
    ); // Minimum 30 seconds
  }

  private async refreshSession(): Promise<boolean> {
    try {
      this.refreshAttempts++;

      if (this.refreshAttempts > this.config.maxRefreshAttempts) {
        throw new Error('Max refresh attempts exceeded');
      }

      toast({
        title: 'Refreshing session...',
        description: 'Keeping you logged in',
        variant: 'info',
      });

      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) throw error;

      if (data.session) {
        this.refreshAttempts = 0;
        toast({
          title: 'Session refreshed',
          description: 'You can continue working',
          variant: 'success',
        });

        // Restart monitoring with new session
        await this.startSessionMonitoring();
        return true;
      }

      throw new Error('No session returned from refresh');
    } catch (error) {
      console.error('Session refresh failed:', error);

      if (this.refreshAttempts >= this.config.maxRefreshAttempts) {
        toast({
          title: 'Session expired',
          description: 'Please log in again to continue',
          variant: 'error',
        });

        // Clear any stored state and redirect to login
        this.clearSessionData();
        window.location.href = '/auth/login';
        return false;
      }

      // Retry after a short delay
      setTimeout(() => this.refreshSession(), 5000);
      return false;
    }
  }

  private clearSessionData() {
    // Clear auto-saved data when session expires
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('autosave_')) {
        localStorage.removeItem(key);
      }
    });
  }

  stopSessionMonitoring() {
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  async checkSessionValidity(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }
}
