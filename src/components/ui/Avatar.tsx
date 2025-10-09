import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
}

// Basic Placeholder Avatar - Displays fallback content
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, fallback, src, alt, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-25 text-label text-primary',
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-contain"
          />
        ) : (
          fallback || 'U'
        )}
      </span>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
