'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAutoSave } from '@/lib/auto-save';
import { toast } from '@/hooks/use-toast';

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  formId?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRecovery?: () => void;
}

interface FormErrorFallbackProps {
  error: Error;
  errorId: string;
  formId?: string;
  onRetry: () => void;
  onRecovery?: () => void;
}

class FormErrorBoundary extends React.Component<
  FormErrorBoundaryProps,
  FormErrorBoundaryState
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `form-error-${Date.now()}`,
    };
  }

  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: `form-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log form-specific error
    console.error('Form Error Boundary caught an error:', {
      error,
      errorInfo,
      formId: this.props.formId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Show toast notification
    toast({
      title: 'Form error occurred',
      description:
        'We encountered an issue with the form. Your data may have been auto-saved.',
      variant: 'error',
    });

    // Track error for analytics (in production)
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Placeholder for error reporting service integration
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      formId: this.props.formId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // In a real app, send this to your error tracking service
    console.log('Error report:', errorReport);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `form-error-${Date.now()}`,
    });
    this.props.onRecovery?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <FormErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          formId={this.props.formId}
          onRetry={this.resetError}
          onRecovery={this.props.onRecovery}
        />
      );
    }

    return this.props.children;
  }
}

const FormErrorFallback: React.FC<FormErrorFallbackProps> = ({
  error,
  errorId,
  formId,
  onRetry,
  onRecovery,
}) => {
  // Try to restore auto-saved data
  const { restore, hasUnsaved, clear } = useAutoSave({
    key: formId || 'form-data',
    data: {},
    enabled: false, // Don't auto-save in error state
  });

  const handleRestore = () => {
    const restored = restore();
    if (restored) {
      toast({
        title: 'Data restored',
        description: 'Your previous form data has been restored',
        variant: 'success',
      });
    }
    onRetry();
  };

  const handleClearAndRetry = () => {
    clear();
    onRetry();
  };

  const getErrorMessage = (error: Error): string => {
    // Provide user-friendly error messages based on error type
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    if (
      error.message.includes('validation') ||
      error.message.includes('invalid')
    ) {
      return 'Form validation error. Please check your input values.';
    }

    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    return 'An unexpected error occurred while processing the form.';
  };

  const getErrorSuggestions = (error: Error): string[] => {
    const suggestions: string[] = [];

    if (error.message.includes('network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
    }

    if (error.message.includes('validation')) {
      suggestions.push('Check all required fields are filled');
      suggestions.push('Verify date and time formats');
      suggestions.push('Ensure file uploads are valid');
    }

    suggestions.push('Try again in a few moments');

    return suggestions;
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cream rounded-lg border border-border p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto bg-negative/10 rounded-full flex items-center justify-center mb-4">
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
          </div>

          <h3 className="text-lg font-semibold text-primary mb-2">
            Form Error
          </h3>
          <p className="text-primary/80 text-sm mb-4">
            {getErrorMessage(error)}
          </p>

          {/* Error suggestions */}
          <div className="text-left mb-4">
            <p className="text-xs font-medium text-primary/60 mb-2">
              Try these steps:
            </p>
            <ul className="text-xs text-primary/70 space-y-1">
              {getErrorSuggestions(error).map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-primary/40 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          {hasUnsaved && (
            <Button
              onClick={handleRestore}
              className="w-full bg-positive hover:bg-positive/90 text-primary"
            >
              Restore & Try Again
            </Button>
          )}

          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>

          <Button
            onClick={handleClearAndRetry}
            variant="secondary"
            className="w-full"
          >
            Clear & Start Over
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
                <strong>Form ID:</strong> {formId}
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

export default FormErrorBoundary;
