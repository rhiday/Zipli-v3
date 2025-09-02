import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
}

// Basic Placeholder Avatar - Displays fallback content
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, fallback, src: _src, alt: _alt, ...props }, ref) => {
    // In a real implementation, would render an <img> if src is provided
    // and handle loading/error states.
    return (
      <span
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-25 text-label text-primary',
          className
        )}
        {...props}
      >
        {fallback || 'U'} {/* Simple fallback text */}
      </span>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
