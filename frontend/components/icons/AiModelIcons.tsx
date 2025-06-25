import React from 'react';
import clsx from 'clsx';

/*
 * Icon components for external AI models.
 * Simple circular icons with brand colors for better recognition.
 * These maintain the same exported component names to avoid refactor ripple-effects.
 */

interface IconProps {
  /** Tailwind utility classes for sizing or additional styling */
  className?: string;
}

// ChatGPT 아이콘 (OpenAI 브랜드: #10A37F 녹색 원형)
export const ChatGPTIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#10A37F" />
  </svg>
);

// Gemini 아이콘 (Google 브랜드: 빨강+주황 그라데이션 원형)
export const GeminiIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <defs>
      <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#FBBC04" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="12" fill="url(#gemini-gradient)" />
  </svg>
);

// Claude 아이콘 (Anthropic 브랜드: #DE7C00 오렌지색 원형)
export const ClaudeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#DE7C00" />
  </svg>
); 