import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Assuming you have cn or clsx

// Define CVA variants for the input
const inputVariants = cva(
  [
    // Base styles
    "w-full input-default border-2 border-[var(--zipli-border-light,#F3F4F6)] bg-white text-[var(--zipli-text-primary)] rounded-[12px] px-4 py-3 text-bodyLg placeholder:text-inactive transition-colors duration-150 ease-in-out",
    // Hover (only color changes)
    "hover:input-hover hover:border-2 hover:border-[var(--zipli-border-light,#F3F4F6)] hover:shadow-[0_0_0_2px_rgba(0,128,0,0.1)]",
    // Focus (color changes)
    "focus:input-focus focus:border-2 focus:border-[var(--zipli-interactive,#014421)] focus:outline-none focus:bg-white",
    // Disabled
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-border"
  ],
  {
    variants: {
      error: {
        true: [
          "input-error border-2 border-[var(--zipli-error,#EF4444)] bg-[#fff5f5] hover:border-[var(--zipli-error,#EF4444)] focus:border-[var(--zipli-error,#EF4444)] focus:ring-0"
        ]
      }
    },
    defaultVariants: {
      error: false
    },
  }
);

// Define props interface, extending HTML input attributes and CVA variants
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
      // Add error prop
      error?: boolean;
    }

// Input component using forwardRef and cva
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => { // Destructure error prop
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ error }), className)} // Pass error prop to cva
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; // Keep named export consistent 