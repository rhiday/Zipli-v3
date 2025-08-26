'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onLogout?: () => void;
}

interface AuthErrorFallbackProps {
  error: Error;
  errorId: string;
  onRetry: () => void;
  onLogout?: () => void;
}

class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `auth-error-${Date.now()}`,
    };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: `auth-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log authentication-specific error
    console.error('Auth Error Boundary caught an error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Show toast notification for auth errors
    if (this.isAuthenticationError(error)) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to continue',
        variant: 'warning',
      });
    } else if (this.isAuthorizationError(error)) {
      toast({
        title: 'Access denied',
        description: "You don't have permission to access this resource",
        variant: 'error',
      });
    } else {
      toast({
        title: 'Authentication error',
        description:
          'An authentication issue occurred. Please try signing in again.',
        variant: 'error',
      });
    }

    // Track error for analytics (in production)
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private isAuthenticationError(error: Error): boolean {
    return (
      error.message.includes('401') ||
      error.message.includes('unauthorized') ||
      error.message.includes('authentication') ||
      error.message.includes('token expired') ||
      error.message.includes('invalid token')
    );
  }

  private isAuthorizationError(error: Error): boolean {
    return (
      error.message.includes('403') ||
      error.message.includes('forbidden') ||
      error.message.includes('access denied') ||
      error.message.includes('insufficient permissions')
    );
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      type: 'authentication',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.log('Auth error report:', errorReport);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `auth-error-${Date.now()}`,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <AuthErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.resetError}
          onLogout={this.props.onLogout}
        />
      );
    }

    return this.props.children;
  }
}

const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({
  error,
  errorId,
  onRetry,
  onLogout,
}) => {
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onLogout?.();

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: 'There was an issue signing you out',
        variant: 'error',
      });
    }
  };

  const handleRefreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      toast({
        title: 'Session refreshed',
        description: 'Your session has been refreshed successfully',
        variant: 'success',
      });

      onRetry();
    } catch (error) {
      console.error('Session refresh error:', error);
      toast({
        title: 'Session refresh failed',
        description: 'Unable to refresh your session. Please sign in again.',
        variant: 'error',
      });
    }
  };

  const getErrorMessage = (error: Error): string => {
    if (
      error.message.includes('401') ||
      error.message.includes('unauthorized')
    ) {
      return 'Your session has expired. Please sign in again.';
    }

    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return "You don't have permission to access this resource.";
    }

    if (error.message.includes('token expired')) {
      return 'Your authentication token has expired.';
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    return 'An authentication error occurred.';
  };

  const getErrorActions = (error: Error) => {
    const isAuthRequired =
      error.message.includes('401') ||
      error.message.includes('unauthorized') ||
      error.message.includes('token expired');

    const isPermissionIssue =
      error.message.includes('403') || error.message.includes('forbidden');

    return { isAuthRequired, isPermissionIssue };
  };

  const { isAuthRequired, isPermissionIssue } = getErrorActions(error);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cream rounded-lg border border-border p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto bg-warning/10 rounded-full flex items-center justify-center mb-4">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-primary mb-2">
            Authentication Issue
          </h3>
          <p className="text-primary/80 text-sm mb-4">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="space-y-3">
          {isAuthRequired && (
            <>
              <Button
                onClick={handleRefreshSession}
                className="w-full bg-positive hover:bg-positive/90 text-primary"
              >
                Refresh Session
              </Button>

              <Button
                onClick={handleSignOut}
                variant="secondary"
                className="w-full"
              >
                Sign In Again
              </Button>
            </>
          )}

          {isPermissionIssue && (
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          )}

          {!isAuthRequired && !isPermissionIssue && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
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

export default AuthErrorBoundary;
