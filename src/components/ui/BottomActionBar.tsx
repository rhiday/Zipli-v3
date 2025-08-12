'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BottomActionBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BottomActionBar
 *
 * Sticky footer area used for primary actions like Continue/Submit.
 * Lives inside `PageContainer` as the `footer` prop to guarantee proper spacing
 * with the `BottomNav` height.
 */
export const BottomActionBar: React.FC<BottomActionBarProps> = ({ children, className }) => {
  return (
    <footer className={cn('px-4 pb-6 pt-4 bg-white border-t border-primary-10', className)}>
      <div className="mx-auto max-w-lg">
        {children}
      </div>
    </footer>
  );
};

export default BottomActionBar;


