'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'wave';
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = React.memo(({ 
  className, 
  variant = 'pulse',
  children 
}) => {
  const animationClass = variant === 'wave' 
    ? 'animate-[wave_1.6s_ease-in-out_infinite]' 
    : 'animate-pulse';

  return (
    <div
      className={cn(
        'bg-gray-200 rounded-md',
        animationClass,
        className
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
});

Skeleton.displayName = t('common.skeleton');

// Specialized skeleton components for common patterns
export const SkeletonCard: React.FC<{ className?: string }> = React.memo(({ className }) => (
  <div className={cn('bg-white rounded-2xl p-2', className)}>
    <Skeleton className="w-full aspect-[4/3] rounded-xl mb-3" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonDashboardStat: React.FC<{ className?: string }> = React.memo(({ className }) => (
  <div className={cn('bg-lime/20 rounded-xl p-4', className)}>
    <div className="flex justify-between items-start mb-2">
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-3 w-20" />
  </div>
));

SkeletonDashboardStat.displayName = 'SkeletonDashboardStat';

export const SkeletonRecipient: React.FC<{ className?: string }> = React.memo(({ className }) => (
  <div className={cn('flex items-center gap-4', className)}>
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
));

SkeletonRecipient.displayName = 'SkeletonRecipient';

export const SkeletonButton: React.FC<{ className?: string }> = React.memo(({ className }) => (
  <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />
));

SkeletonButton.displayName = 'SkeletonButton';

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  lineClassName?: string;
}> = React.memo(({ lines = 3, className, lineClassName }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full',
          lineClassName
        )} 
      />
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

export default Skeleton;