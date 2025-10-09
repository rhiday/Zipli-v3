'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  className,
  disabled = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6',
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const thumbTranslateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-6' : 'translate-x-0.5',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        id={id}
        name={name}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          // Base styling
          'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-positive/50 focus:ring-offset-2',
          // Size
          sizeClasses[size],
          // Colors based on checked state
          checked
            ? 'bg-positive'
            : 'bg-cloud border border-border',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            // Base thumb styling
            'inline-block rounded-full bg-white shadow-sm border border-border transform transition-transform duration-200 ease-in-out',
            // Size
            thumbSizeClasses[size],
            // Position
            thumbTranslateClasses[size]
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm text-primary font-medium cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

Toggle.displayName = 'Toggle';