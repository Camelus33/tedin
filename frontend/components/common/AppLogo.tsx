"use client";
import React from 'react';

export default function AppLogo({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 50" className={className}>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <path
        d="M15,10 L15,40 M25,10 L25,40 M35,10 L35,40 M10,15 L40,15 M10,25 L40,25"
        stroke="url(#logo-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10,35 L40,35"
        stroke="url(#logo-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="30,10"
        fill="none"
      />
    </svg>
  );
} 