'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = React.memo(
  ({
    className,
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    count = 1,
    children,
  }) => {
    const baseClasses = 'bg-gray-200 rounded';

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
      none: '',
    };

    const variantClasses = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
      card: 'rounded-xl',
    };

    const skeletonClass = cn(
      baseClasses,
      animationClasses[animation],
      variantClasses[variant],
      className
    );

    const style: React.CSSProperties = {
      width: width || (variant === 'circular' ? 40 : '100%'),
      height:
        height || (variant === 'circular' ? 40 : variant === 'card' ? 200 : 16),
    };

    if (count > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className={skeletonClass} style={style} />
          ))}
        </div>
      );
    }

    return (
      <div className={skeletonClass} style={style}>
        {children}
      </div>
    );
  }
);

Skeleton.displayName = t('common.skeleton');

// Donation Card Skeleton
export const DonationCardSkeleton: React.FC = React.memo(() => (
  <div className="rounded-2xl bg-white p-2">
    <Skeleton variant="rectangular" height={180} className="mb-3" />
    <div className="space-y-2 p-2">
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="text" width="50%" height={16} />
      <Skeleton variant="text" width="40%" height={14} />
    </div>
  </div>
));

DonationCardSkeleton.displayName = 'DonationCardSkeleton';

// Request Card Skeleton
export const RequestCardSkeleton: React.FC = React.memo(() => (
  <div className="rounded-2xl bg-white p-4 border border-gray-100">
    <div className="space-y-3">
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={60} height={24} />
      </div>
      <Skeleton variant="text" count={2} />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="55%" />
      </div>
    </div>
  </div>
));

RequestCardSkeleton.displayName = 'RequestCardSkeleton';

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = React.memo(
  ({ count = 3 }) => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <DonationCardSkeleton key={index} />
      ))}
    </div>
  )
);

ListSkeleton.displayName = 'ListSkeleton';

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = React.memo(() => (
  <div className="space-y-6 p-4">
    <div className="grid grid-cols-2 gap-4">
      <Skeleton variant="card" height={100} />
      <Skeleton variant="card" height={100} />
      <Skeleton variant="card" height={100} />
      <Skeleton variant="card" height={100} />
    </div>
    <div className="space-y-4">
      <Skeleton variant="text" width="30%" height={24} />
      <Skeleton variant="rectangular" height={200} />
    </div>
  </div>
));

DashboardSkeleton.displayName = 'DashboardSkeleton';

export default Skeleton;
