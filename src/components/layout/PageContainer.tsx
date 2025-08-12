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
  const donationFlowRegex =
    /^\/donate\/(new|manual|pickup-slot|summary|thank-you|detail|[^/]+\/handover-confirm)/;
  const isBottomNavVisible = !donationFlowRegex.test(pathname || '');

  return (
    <div className={cn('flex h-dvh min-h-0 w-full flex-col bg-base', className)}>
      {header ? <div className="shrink-0">{header}</div> : null}
      <main className={cn('min-h-0 flex-1 overflow-y-auto flex flex-col', contentClassName)}>
        <div className="min-h-0 flex-1">{children}</div>
        {footer ? (
          <div className={cn('sticky', isBottomNavVisible ? 'bottom-[76px]' : 'bottom-0')}>
            {footer}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default PageContainer;


