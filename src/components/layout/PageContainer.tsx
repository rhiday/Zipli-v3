'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

interface PageContainerProps {
  header?: React.ReactNode;
  children: React.ReactNode; // main content
  footer?: React.ReactNode;
  className?: string; // applied to outermost wrapper
  contentClassName?: string; // applied to main content area
}

/**
 * PageContainer
 *
 * A consistent page scaffold that prevents bottom bars from overlapping content.
 * It creates a column layout with a non-scrolling header and footer and a
 * scrollable main content area sized to available height.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  header,
  children,
  footer,
  className,
  contentClassName,
}) => {
  const { needsBottomNavSpacing } = useLayoutConfig();

  return (
    <div
      className={cn(
        'flex h-screen min-h-0 w-full flex-col bg-base',
        // Fallback for older devices that don't support dvh
        'supports-[height:100dvh]:h-dvh',
        className
      )}
    >
      {header ? <div className="shrink-0">{header}</div> : null}
      <main
        className={cn(
          'min-h-0 flex-1 overflow-y-auto',
          // Add safe padding for older Android devices
          'pb-safe',
          contentClassName
        )}
      >
        {children}
      </main>
      {footer ? (
        <div
          className={cn('shrink-0', needsBottomNavSpacing ? 'mb-[76px]' : '')}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default PageContainer;
