import React from 'react';
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useCommonTranslation } from '@/lib/i18n-enhanced';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive cursor-pointer gap-2.5 shrink-0 disabled:bg-inactive disabled:text-tertiary disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:   "bg-positive text-black hover:bg-positive/90",
        secondary: "bg-base border border-interactive text-interactive hover:bg-cloud",
        destructive: "bg-negative !text-white hover:bg-negative/90",
        "destructive-outline": "bg-white border border-negative text-negative hover:bg-negative/10 !text-negative",
        ghost:     "bg-transparent text-primary hover:bg-primary/10",
        tertiary:  "bg-transparent text-interactive border-b border-interactive rounded-none gap-1 hover:bg-interactive/10",
      },
      size: {
        sm: "h-8 px-3 text-label rounded-sm",
        md: "px-6 py-3 text-bodyLg",
        cta: "h-[46px] p-[14px] gap-[6px] text-bodyLg font-semibold",
        lg: "h-16 py-3.5 px-[22px] text-bodyLg"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
      asChild?: boolean
    }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
