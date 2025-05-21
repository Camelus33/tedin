'use client';

import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500",
        outline: "border border-neutral-300 bg-transparent hover:bg-neutral-100 focus:ring-neutral-400",
        ghost: "bg-transparent hover:bg-neutral-100 focus:ring-neutral-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-6 py-3 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  target?: string;
  loading?: boolean;
}

// 모바일 반응형: 600px 이하에서 버튼 크기/폰트/터치 영역 가변화
const mobileButtonStyle = {
  height: 'clamp(36px,8vw,44px)',
  minWidth: 'clamp(80px,30vw,120px)',
  fontSize: 'clamp(0.95rem,3vw,1.1rem)',
  paddingLeft: 'clamp(12px,4vw,20px)',
  paddingRight: 'clamp(12px,4vw,20px)',
  paddingTop: 'clamp(6px,2vw,12px)',
  paddingBottom: 'clamp(6px,2vw,12px)',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    href, 
    target, 
    loading, 
    disabled, 
    children, 
    ...props 
  }, ref) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
    if (href) {
      return (
        <Link 
          href={href}
          target={target}
          className={buttonVariants({ variant, size, fullWidth, className })}
          style={isMobile ? mobileButtonStyle : undefined}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {children}
        </Link>
      );
    }
    
    return (
      <button
        type="button"
        className={buttonVariants({ variant, size, fullWidth, className })}
        style={isMobile ? mobileButtonStyle : undefined}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button; 