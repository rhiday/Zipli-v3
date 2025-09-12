'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';

export function ErrorTrackingTest() {
  const [showError, setShowError] = useState(false);

  const triggerUncaughtError = () => {
    // This will trigger an uncaught error
    throw new Error('Test uncaught error from ErrorTrackingTest component');
  };

  const triggerPromiseRejection = () => {
    // This will trigger an unhandled promise rejection
    Promise.reject(new Error('Test unhandled promise rejection'));
  };

  const triggerLoggerError = () => {
    // This will trigger a logger error
    logger.error('Test logger error from ErrorTrackingTest component');
  };

  const triggerNetworkError = () => {
    // This will trigger a network error
    fetch('/api/nonexistent-endpoint')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .catch((error) => {
        console.error('Network error caught:', error);
      });
  };

  const triggerResourceError = () => {
    // This will trigger a resource loading error
    const img = new Image();
    img.src = '/nonexistent-image.jpg';
    img.onerror = () => {
      console.log('Resource loading error triggered');
    };
  };

  if (showError) {
    // This will trigger the ErrorBoundary
    throw new Error('Test React ErrorBoundary error');
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        PostHog Error Tracking Test
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the buttons below to test different types of error tracking. Check
        your PostHog dashboard to see the captured events.
      </p>

      <div className="space-y-2">
        <button
          onClick={triggerUncaughtError}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Trigger Uncaught Error
        </button>

        <button
          onClick={triggerPromiseRejection}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Trigger Promise Rejection
        </button>

        <button
          onClick={triggerLoggerError}
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Trigger Logger Error
        </button>

        <button
          onClick={triggerNetworkError}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Trigger Network Error
        </button>

        <button
          onClick={triggerResourceError}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Trigger Resource Error
        </button>

        <button
          onClick={() => setShowError(true)}
          className="w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          Trigger React ErrorBoundary
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <p>
          <strong>Note:</strong> This component is for testing purposes only.
          Remove it from production builds.
        </p>
      </div>
    </div>
  );
}
