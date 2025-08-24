'use client';

import { toast } from '@/hooks/use-toast';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error;
  let currentDelay = baseDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        toast({
          title: 'Retrying...',
          description: `Attempt ${attempt + 1} of ${maxRetries + 1}`,
          variant: 'info',
        });
      }

      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        toast({
          title: 'Operation failed',
          description: 'Please check your connection and try again',
          variant: 'error',
        });
        throw lastError;
      }

      if (error instanceof NetworkError && !error.isRetryable) {
        throw error;
      }

      const delay = Math.min(currentDelay, maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
      currentDelay *= backoffFactor;
    }
  }

  throw lastError!;
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function handleOfflineMode(callback?: () => void) {
  if (!isOnline()) {
    toast({
      title: "You're offline",
      description: 'Limited functionality available',
      variant: 'warning',
    });
    callback?.();
    return false;
  }
  return true;
}
