'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ViewportContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'page' | 'fullscreen' | 'content';
  allowOverflow?: boolean;
}

/**
 * ViewportContainer - Consistent viewport handling across all devices
 *
 * Provides safe viewport height handling with proper fallbacks for older devices:
 * - Uses h-screen as base (100vh) for maximum compatibility
 * - Progressively enhances to h-dvh on supporting browsers
 * - Handles safe areas for mobile devices
 * - Accounts for bottom navigation spacing
 */
export const ViewportContainer: React.FC<ViewportContainerProps> = ({
  children,
  className,
  variant = 'page',
  allowOverflow = false,
}) => {
  const baseClasses = {
    // Standard page container - accounts for bottom nav
    page: cn(
      'flex flex-col w-full bg-base',
      // Base height with fallback
      'min-h-screen',
      // Progressive enhancement for modern devices
      'supports-[height:100dvh]:min-h-dvh',
      // Safe area padding for mobile
      'pb-safe'
    ),

    // Full viewport - no bottom nav considerations
    fullscreen: cn(
      'flex flex-col w-full',
      'h-screen',
      'supports-[height:100dvh]:h-dvh',
      'pb-safe'
    ),

    // Content container - for use within other layouts
    content: cn(
      'flex flex-col w-full',
      'min-h-0 flex-1',
      allowOverflow ? 'overflow-y-auto' : '',
      'pb-safe'
    ),
  };

  return <div className={cn(baseClasses[variant], className)}>{children}</div>;
};

export default ViewportContainer;
