import React from 'react';
import { cn } from '@/lib/utils';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary';
}

const Tag: React.FC<TagProps> = ({ className, variant = 'default', ...props }) => {
  const baseClasses = 'rounded-full px-4 py-1.5 text-sm font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    secondary: 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
};

export default Tag; 