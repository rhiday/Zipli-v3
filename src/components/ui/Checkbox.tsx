'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={cn(
          // Base styling
          'flex-shrink-0 rounded border-border text-primary focus:ring-primary/50',
          // Responsive sizing - smaller on mobile, normal on desktop
          'w-3 h-3 scale-75 sm:scale-100 sm:w-4 sm:h-4',
          // Interactive states
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'accent-positive'
        )}
      />
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm text-primary leading-tight cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

Checkbox.displayName = 'Checkbox';
