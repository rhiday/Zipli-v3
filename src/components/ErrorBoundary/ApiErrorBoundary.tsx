'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ApiErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  retryCount: number;
}

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface ApiErrorFallbackProps {
  error: Error;
  errorId: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onMaxRetriesReached?: (error: Error) => void;
}

class ApiErrorBoundary extends React.Component<
  ApiErrorBoundaryProps,
  ApiErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `api-error-${Date.now()}`,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ApiErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `api-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log API-specific error
    console.error('API Error Boundary caught an error:', {
      error,
      errorInfo,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Show appropriate toast notification
    if (this.isNetworkError(error)) {
      toast({
        title: 'Connection issue',
        description:
          'Unable to reach the server. Please check your connection.',
        variant: 'warning',
      });
    } else if (this.isServerError(error)) {
      toast({
        title: 'Server error',
        description: 'Our servers are experiencing issues. Please try again.',
        variant: 'error',
      });
    } else if (this.isRateLimitError(error)) {
      toast({
        title: 'Too many requests',
        description: 'Please wait a moment before trying again.',
        variant: 'warning',
      });
    } else {
      toast({
        title: 'API error',
        description: 'An unexpected error occurred while fetching data.',
        variant: 'error',
      });
    }

    // Track error for analytics (in production)
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }

    // Auto-retry for network errors (with exponential backoff)
    if (
      this.isNetworkError(error) &&
      this.state.retryCount < (this.props.maxRetries || 3)
    ) {
      const retryDelay = Math.min(
        1000 * Math.pow(2, this.state.retryCount),
        10000
      );

      toast({
        title: 'Retrying...',
        description: `Attempting to reconnect in ${retryDelay / 1000}s`,
        variant: 'info',
      });

      this.retryTimeout = setTimeout(() => {
        this.retryRequest();
      }, retryDelay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private isNetworkError(error: Error): boolean {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('connection') ||
      (error.name === 'TypeError' && error.message.includes('Failed to fetch'))
    );
  }

  private isServerError(error: Error): boolean {
    return (
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504') ||
      error.message.includes('Internal Server Error')
    );
  }

  private isRateLimitError(error: Error): boolean {
    return (
      error.message.includes('429') ||
      error.message.includes('rate limit') ||
      error.message.includes('Too Many Requests')
    );
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      type: 'api',
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.log('API error report:', errorReport);
  }

  private retryRequest = () => {
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount >= (this.props.maxRetries || 3)) {
      this.props.onMaxRetriesReached?.(this.state.error!);
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorId: `api-error-${Date.now()}`,
      retryCount: newRetryCount,
    });
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `api-error-${Date.now()}`,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ApiErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          onRetry={this.resetError}
          onMaxRetriesReached={this.props.onMaxRetriesReached}
        />
      );
    }

    return this.props.children;
  }
}

const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({
  error,
  errorId,
  retryCount,
  maxRetries,
  onRetry,
  onMaxRetriesReached,
}) => {
  const handleRetry = () => {
    if (retryCount >= maxRetries) {
      onMaxRetriesReached?.(error);
      return;
    }
    onRetry();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getErrorMessage = (error: Error): string => {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Unable to connect to our servers. Please check your internet connection.';
    }

    if (
      error.message.includes('500') ||
      error.message.includes('Internal Server Error')
    ) {
      return "Our servers are experiencing issues. We're working to fix this.";
    }

    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return "You're making requests too quickly. Please wait a moment.";
    }

    if (error.message.includes('timeout')) {
      return 'The request is taking longer than expected. Please try again.';
    }

    return 'An error occurred while loading data. Please try again.';
  };

  const getErrorIcon = (error: Error) => {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return (
        <svg
          className="w-6 h-6 text-warning"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-6 h-6 text-negative"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  const canRetry = retryCount < maxRetries;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cream rounded-lg border border-border p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto bg-negative/10 rounded-full flex items-center justify-center mb-4">
            {getErrorIcon(error)}
          </div>

          <h3 className="text-lg font-semibold text-primary mb-2">
            Connection Error
          </h3>
          <p className="text-primary/80 text-sm mb-4">
            {getErrorMessage(error)}
          </p>

          {retryCount > 0 && (
            <p className="text-xs text-primary/60 mb-4">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {canRetry ? (
            <Button
              onClick={handleRetry}
              className="w-full bg-positive hover:bg-positive/90 text-primary"
            >
              Try Again
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-primary/60 mb-3">
                Max retry attempts reached
              </p>
              <Button onClick={handleRefresh} className="w-full">
                Refresh Page
              </Button>
            </div>
          )}

          <Button
            onClick={handleRefresh}
            variant="secondary"
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-primary/60 hover:text-primary/80">
              Error Details (Dev Mode)
            </summary>
            <div className="mt-2 p-2 bg-negative/5 rounded text-xs font-mono text-negative overflow-auto">
              <p>
                <strong>Error:</strong> {error.message}
              </p>
              <p>
                <strong>Error ID:</strong> {errorId}
              </p>
              <p>
                <strong>Retry Count:</strong> {retryCount}/{maxRetries}
              </p>
              {error.stack && (
                <div className="mt-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-[10px] mt-1">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default ApiErrorBoundary;
