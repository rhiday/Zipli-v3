import posthog from 'posthog-js';

// Enhanced PostHog initialization with comprehensive error tracking
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://eu.posthog.com',
  defaults: '2025-05-24',
  capture_exceptions: true, // Enable automatic exception capturing
  capture_performance: true, // Enable performance tracking
  capture_pageview: true, // Enable page view tracking
  capture_pageleave: true, // Enable page leave tracking
  debug: process.env.NODE_ENV === 'development',
  loaded: (posthog) => {
    // Set up additional error tracking when PostHog is loaded
    setupErrorTracking(posthog);
  },
});

// Enhanced error tracking setup
function setupErrorTracking(posthog: any) {
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    posthog.capture('unhandled_promise_rejection', {
      error_message: event.reason?.message || 'Unknown promise rejection',
      error_stack: event.reason?.stack || '',
      error_type: 'unhandled_promise_rejection',
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });

  // Track uncaught errors
  window.addEventListener('error', (event) => {
    posthog.capture('uncaught_error', {
      error_message: event.message || 'Unknown error',
      error_filename: event.filename || '',
      error_lineno: event.lineno || 0,
      error_colno: event.colno || 0,
      error_stack: event.error?.stack || '',
      error_type: 'uncaught_error',
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });

  // Track resource loading errors
  window.addEventListener(
    'error',
    (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        posthog.capture('resource_loading_error', {
          error_type: 'resource_loading_error',
          resource_type: target?.tagName || 'unknown',
          resource_src: (target as any)?.src || (target as any)?.href || '',
          url: window.location.href,
          timestamp: new Date().toISOString(),
        });
      }
    },
    true
  );

  // Track network errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        posthog.capture('network_error', {
          error_type: 'network_error',
          status: response.status,
          status_text: response.statusText,
          url: args[0]?.toString() || '',
          method: 'fetch',
          timestamp: new Date().toISOString(),
        });
      }
      return response;
    } catch (error) {
      posthog.capture('network_error', {
        error_type: 'network_error',
        error_message:
          error instanceof Error ? error.message : 'Unknown network error',
        url: args[0]?.toString() || '',
        method: 'fetch',
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };

  // Track console errors (for additional context)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Only track if it's not a PostHog error to avoid infinite loops
    const errorMessage = args.join(' ');
    if (
      !errorMessage.includes('posthog') &&
      !errorMessage.includes('PostHog')
    ) {
      posthog.capture('console_error', {
        error_type: 'console_error',
        error_message: errorMessage,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }
    originalConsoleError.apply(console, args);
  };

  // Track performance issues
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          const domContentLoaded =
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart;

          // Track slow page loads
          if (loadTime > 3000) {
            posthog.capture('slow_page_load', {
              load_time: loadTime,
              dom_content_loaded_time: domContentLoaded,
              url: window.location.href,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }, 0);
    });
  }

  console.log('🎯 PostHog error tracking initialized');
}
