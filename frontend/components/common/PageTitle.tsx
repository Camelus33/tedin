"use client";
import * as React from 'react';

type PageTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageTitle({ 
  children, 
  className = "text-heading-md md:text-heading-lg text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-8 text-center"
}: PageTitleProps) {
  return (
    <h1 className={className}>
      {children}
    </h1>
  );
} 