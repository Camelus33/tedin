"use client";
import * as React from 'react';

type QuickNavCardProps = {
  href: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
  textClassName?: string;
};

export default function QuickNavCard({ 
  href, 
  label, 
  icon: Icon,
  className = "bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-5 text-center flex flex-col items-center justify-center border border-transparent transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
  textClassName = "font-medium text-gray-300 mt-2 text-sm"
}: QuickNavCardProps) {
  return (
    <a
      href={href}
      className={className}
      aria-label={`${label} 섹션 보기`}
    >
      {Icon && <Icon className="h-6 w-6 mb-2" aria-hidden="true" />}
      <span className={textClassName}>{label}</span>
    </a>
  );
} 