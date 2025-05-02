import React from 'react';
import clsx from "clsx";

// TODO: Implement Input component based on new style guide
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-md border border-border bg-base px-3 py-2 text-body placeholder:text-inactive focus:border-primary focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input'; 