'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em]",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border-[2px]",
        sm: "h-4 w-4 border-[2px]",
        md: "h-6 w-6 border-[3px]",
        lg: "h-8 w-8 border-[3px]",
        xl: "h-12 w-12 border-[4px]",
      },
      variant: {
        default: "text-primary-600",
        subtle: "text-primary-400",
        light: "text-white",
        dark: "text-gray-800",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function Spinner({ 
  className, 
  size, 
  variant, 
  label = 'Loading...', 
  ...props 
}: SpinnerProps) {
  return (
    <div
      className={spinnerVariants({ size, variant, className })}
      role="status"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;