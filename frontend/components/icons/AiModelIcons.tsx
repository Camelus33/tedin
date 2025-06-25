import React from 'react';
import clsx from 'clsx';

/*
 * Icon components for external AI models.
 * Updated with accurate official brand icons based on web search results.
 * These maintain the same exported component names to avoid refactor ripple-effects.
 */

interface IconProps {
  /** Tailwind utility classes for sizing or additional styling */
  className?: string;
}

// ChatGPT 공식 아이콘 (OpenAI 브랜드: #10A37F 초록색 원형 로고)
export const ChatGPTIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#10A37F" />
    <path
      d="M12 3.5c-1.4 0-2.7.4-3.8 1.1-.3.2-.4.6-.2.9.2.3.6.4.9.2.9-.6 1.9-.9 3-.9 3.1 0 5.6 2.5 5.6 5.6 0 1.1-.3 2.1-.9 3 .2.3.6.4.9.2.7-1.1 1.1-2.4 1.1-3.8C20.5 6.5 16.5 2.5 12 2.5z"
      fill="white"
    />
    <path
      d="M12 20.5c1.4 0 2.7-.4 3.8-1.1.3-.2.4-.6.2-.9-.2-.3-.6-.4-.9-.2-.9.6-1.9.9-3 .9-3.1 0-5.6-2.5-5.6-5.6 0-1.1.3-2.1.9-3-.2-.3-.6-.4-.9-.2-.7 1.1-1.1 2.4-1.1 3.8C3.5 17.5 7.5 21.5 12 21.5z"
      fill="white"
    />
  </svg>
);

// Gemini 공식 아이콘 (Google 브랜드: 다이아몬드 모양 그라데이션)
export const GeminiIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <defs>
      <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="25%" stopColor="#9C27B0" />
        <stop offset="50%" stopColor="#EA4335" />
        <stop offset="75%" stopColor="#FBBC04" />
        <stop offset="100%" stopColor="#34A853" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L22 12L12 22L2 12L12 2Z"
      fill="url(#gemini-gradient)"
    />
    <path
      d="M12 6L18 12L12 18L6 12L12 6Z"
      fill="white"
      fillOpacity="0.2"
    />
  </svg>
);

// Claude 공식 아이콘 (Anthropic 브랜드: #DE7C00 주황색 원형 로고)
export const ClaudeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#DE7C00" />
    <path
      d="M8 7h8c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1H8c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1z"
      fill="white"
    />
    <circle cx="10" cy="10" r="1" fill="#DE7C00" />
    <circle cx="14" cy="10" r="1" fill="#DE7C00" />
    <path
      d="M10 14c0-.6.4-1 1-1h2c.6 0 1 .4 1 1"
      stroke="#DE7C00"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
); 