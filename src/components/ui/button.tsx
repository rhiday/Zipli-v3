import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const button = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive cursor-pointer",
  {
    variants: {
      variant: {
        primary:   "bg-positive text-interactive hover:bg-[#83e956]",
        secondary: "bg-cream text-primary hover:bg-cloud",
        destructive:"bg-negative text-white hover:bg-negative-hover",
        ghost:     "bg-transparent text-primary hover:bg-primary/10",
        negative:  "bg-negative text-white shadow-sm hover:bg-negative/90 disabled:bg-negative/50"
      },
      size: {
        sm: "h-8 px-3 text-label rounded-sm",
        md: "px-6 py-3 text-bodyLg",
        lg: "h-[46px] px-6 text-bodyLg"
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
