import React from 'react';
import clsx from 'clsx';

/*
 * Icon components for external AI models.
 * Updated with latest official brand icons from web search results.
 * These maintain the same exported component names to avoid refactor ripple-effects.
 */

interface IconProps {
  /** Tailwind utility classes for sizing or additional styling */
  className?: string;
}

// ChatGPT 공식 아이콘 (OpenAI 브랜드 컬러: 초록색 원형 로고)
export const ChatGPTIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#10A37F" />
    <path
      d="M12 4c-4.4 0-8 3.6-8 8 0 3.3 2 6.1 4.9 7.3-.1-.6-.1-1.2-.1-1.9 0-3.9 3.1-7 7-7 .6 0 1.3.1 1.9.1C18.1 8.1 20 5.3 20 2c0-4.4-3.6-8-8-8z"
      fill="white"
    />
  </svg>
);

// Google Gemini 공식 아이콘 (Google 브랜드 컬러: 그라데이션)
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
      d="M12 2L2 7v10l10 5 10-5V7L12 2z"
      fill="url(#gemini-gradient)"
    />
    <path
      d="M12 8l-4 2.5v3L12 16l4-2.5v-3L12 8z"
      fill="white"
    />
  </svg>
);

// Claude 공식 아이콘 (Anthropic 브랜드 컬러: 주황색)
export const ClaudeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#DE7C00" />
    <path
      d="M7 12c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z"
      fill="white"
    />
    <circle cx="12" cy="12" r="2" fill="#DE7C00" />
  </svg>
); 