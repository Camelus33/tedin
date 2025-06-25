import React from 'react';
import clsx from 'clsx';

/*
 * Icon components for external AI models.
 * These simplistic SVGs keep bundle size minimal while providing clear brand cues.
 * If later replaced with official brand assets, maintain the same exported component names
 * to avoid refactor ripple-effects.
 */

interface IconProps {
  /** Tailwind utility classes for sizing or additional styling */
  className?: string;
}

export const ChatGPTIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('text-emerald-600', className)}
  >
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="4" />
    <path
      d="M24 10c-6.627 0-12 5.373-12 12 0 4.97 3.038 9.205 7.347 11.069-.103-.85-.147-1.732-.147-2.638 0-5.523 4.477-10 10-10 .906 0 1.788.044 2.639.147C33.205 23.038 38 18.97 38 14c0-6.627-5.373-12-12-12z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GeminiIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('text-sky-500', className)}
  >
    <rect x="6" y="6" width="36" height="36" rx="18" stroke="currentColor" strokeWidth="4" />
    <path
      d="M16 24h16M24 16v16"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

export const ClaudeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('text-yellow-500', className)}
  >
    <polygon
      points="24 6 39 18 39 30 24 42 9 30 9 18"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
); 