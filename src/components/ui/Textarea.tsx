import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define CVA variants for the Textarea, mirroring Input styles
const textareaVariants = cva(
  [
    // Base styles - Consistent with Input
    "flex min-h-[80px] w-full rounded-md border-2 bg-base px-4 py-[14px]", 
    "text-bodyLg text-primary placeholder:text-inactive", 
    "transition-colors duration-150 ease-in-out",

    // Default state styles
    "border-tertiary", 

    // Hover state styles
    "hover:border-primary",

    // Focus state styles
    "focus-visible:outline-none focus-visible:border-interactive focus-visible:ring-1 focus-visible:ring-interactive focus-visible:ring-offset-0",

    // Disabled state
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-border"
  ],
  {
    variants: {
      error: {
        true: [
          // Error state styles - Mirroring Input
          "border-negative",
          "hover:border-negative",
          "focus-visible:border-negative focus-visible:ring-negative focus-visible:ring-opacity-30"
        ]
      }
    },
    defaultVariants: {
      error: false
    },
  }
);

// Define props interface, extending HTML textarea attributes and CVA variants
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
      error?: boolean;
    }

// Textarea component using forwardRef and cva
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ error }), className)} // Apply cva variants
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea }; 