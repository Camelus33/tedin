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

// Gemini 아이콘 (Google 브랜드: 인디고 색 원형)
export const GeminiIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#4F46E5" />
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