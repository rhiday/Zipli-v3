'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  const pathname = usePathname();
  const flowRegex =
    /^\/(donate|request)\/(new|manual|pickup-slot|summary|thank-you|success|detail|[^/]+\/handover-confirm)/;
  const isBottomNavVisible = !flowRegex.test(pathname || '');

  return (
    <div
      className={cn('flex h-dvh min-h-0 w-full flex-col bg-base', className)}
    >
      {header ? <div className="shrink-0">{header}</div> : null}
      <main className={cn('min-h-0 flex-1 overflow-y-auto', contentClassName)}>
        {children}
      </main>
      {footer ? (
        <div className={cn('shrink-0', isBottomNavVisible ? 'mb-[76px]' : '')}>
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default PageContainer;
