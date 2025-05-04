"use client";
import * as React from 'react';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

export default function PageContainer({ 
  children, 
  className = "bg-gray-50 min-h-screen py-12 px-6",
  innerClassName = "max-w-4xl mx-auto"
}: PageContainerProps) {
  return (
    <div className={className}>
      <div className={innerClassName}>
        {children}
      </div>
    </div>
  );
} 