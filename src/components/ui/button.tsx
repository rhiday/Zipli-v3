import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const button = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:   "bg-primary text-white hover:bg-primary-75",
        secondary: "bg-cream text-primary hover:bg-cloud",
        destructive:"bg-negative text-white hover:bg-negative-hover",
        ghost:     "bg-transparent text-primary hover:bg-primary/10",
        negative:  "bg-negative text-white shadow-sm hover:bg-negative/90 disabled:bg-negative/50"
      },
      size: {
        sm: "h-8 px-3 text-label rounded-sm",
        md: "h-10 px-4 text-body rounded-md",
        lg: "h-12 px-6 text-bodyLg rounded-md"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button 
      ref={ref}
      className={clsx(button({ variant, size }), className)} 
      {...props} 
    />
  )
);
Button.displayName = 'Button';
