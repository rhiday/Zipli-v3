import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Assuming you have cn or clsx

// Define CVA variants for the input
const inputVariants = cva(
  [
    // Base styles - Use border-2 consistently
    "w-full rounded-md border-2 bg-base px-4 py-[14px]", 
    "text-bodyLg text-primary placeholder:text-inactive", 
    "transition-colors duration-150 ease-in-out", // Ensure smooth color transition

    // Default state styles - Use tertiary border color
    "border-tertiary", 

    // Hover state styles - Only change color, width is already border-2
    "hover:border-primary", // Change to primary color on hover? Or keep tertiary? Let's try primary.

    // Focus state styles - Use ring instead of changing border width
    "focus:outline-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:ring-offset-0", // Ring for focus, keep border color change

    // Disabled state (good practice)
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-border" // Maybe different disabled border
  ],
  {
    variants: {
      // Add error variant based on Figma specs
      error: {
        true: [
          // Override base and state borders with negative color
          "border-negative",
          "hover:border-negative", 
          // Use negative color for focus ring, adjust opacity if needed
          "focus:border-negative focus:ring-negative focus:ring-opacity-30"
        ]
      }
    },
    defaultVariants: {
      error: false // Default to not being in error state
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