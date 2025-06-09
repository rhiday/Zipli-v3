import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define CVA variants for the Textarea, mirroring Input styles
const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-base px-4 py-3.5 text-bodyLg ring-offset-background placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border focus-visible:ring-interactive",
        error: "border-negative text-negative focus-visible:ring-negative",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Define props interface, extending HTML textarea attributes and CVA variants
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

// Textarea component using forwardRef and cva
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant }), className)} // Apply cva variants
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea }; 