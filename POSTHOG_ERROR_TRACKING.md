# PostHog Error Tracking Setup

This document describes the comprehensive PostHog error tracking implementation in the Zipli application.

## Overview

The error tracking system captures various types of errors and sends them to PostHog for monitoring and analysis. It's implemented using the `instrumentation-client.ts` file which runs before the application becomes interactive.

## Components

### 1. Enhanced instrumentation-client.ts

Located in the root directory, this file:

- Initializes PostHog with comprehensive error tracking
- Sets up global error handlers for uncaught errors
- Tracks unhandled promise rejections
- Monitors resource loading errors
- Captures network errors
- Tracks console errors
- Monitors performance issues (slow page loads)

### 2. ErrorBoundary Component

Located at `src/components/ErrorBoundary.tsx`:

- Catches React component errors
- Provides a fallback UI when errors occur
- Automatically tracks errors to PostHog
- Allows users to retry after an error

### 3. Enhanced Logger

Located at `lib/logger.ts`:

- Integrates with PostHog for error logging
- Automatically sends error logs to PostHog
- Maintains existing console logging functionality

### 4. Error Tracking Test Component

Located at `src/components/ErrorTrackingTest.tsx`:

- Provides buttons to test different error types
- Useful for development and testing
- Should be removed from production builds

## Error Types Tracked

1. **uncaught_error** - JavaScript errors that aren't caught
2. **unhandled_promise_rejection** - Promise rejections without catch handlers
3. **resource_loading_error** - Failed image, script, or other resource loads
4. **network_error** - Failed fetch requests
5. **console_error** - Errors logged via console.error
6. **react_error_boundary** - React component errors caught by ErrorBoundary
7. **logger_error** - Errors logged via the enhanced logger
8. **slow_page_load** - Pages that take longer than 3 seconds to load

## Usage

### Using ErrorBoundary

Wrap components that might throw errors:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Using Enhanced Logger

```tsx
import { logger } from '@/lib/logger';

// This will automatically send to PostHog
logger.error('Something went wrong', error);
```

### Testing Error Tracking

Add the test component to any page during development:

```tsx
import { ErrorTrackingTest } from '@/components/ErrorTrackingTest';

// Add to your development page
<ErrorTrackingTest />;
```

## PostHog Dashboard

Check your PostHog dashboard for:

- Error events in the Events section
- Error tracking insights in the Error Tracking feature
- Performance metrics for slow page loads

## Environment Variables

Ensure these are set in your `.env.local`:

```
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

## Production Considerations

1. Remove the `ErrorTrackingTest` component from production
2. The system automatically detects production vs development
3. Debug mode is only enabled in development
4. All error tracking is automatic - no manual intervention needed

## Monitoring

The system will log "🎯 PostHog error tracking initialized" to the console when successfully set up. Check your PostHog dashboard to verify events are being captured.
