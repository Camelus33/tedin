import React from 'react';
import clsx from 'clsx';

/*
 * Icon components for external AI models.
 * Updated with accurate official brand icons based on web research.
 * These maintain the same exported component names to avoid refactor ripple-effects.
 */

interface IconProps {
  /** Tailwind utility classes for sizing or additional styling */
  className?: string;
}

// ChatGPT 공식 아이콘 (OpenAI 브랜드: 초록색 원형 로고)
export const ChatGPTIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#10A37F" />
    <path
      d="M12 6c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1-.1-.4-.1-.8-.1-1.2 0-2.8 2.2-5 5-5 .4 0 .8 0 1.2.1C16.1 9.2 18 7.3 18 5c0-3.3-2.7-6-6-6z"
      fill="white"
    />
    <circle cx="9" cy="9" r="1.5" fill="#10A37F" />
    <circle cx="15" cy="15" r="1.5" fill="#10A37F" />
  </svg>
);

// Google Gemini 공식 아이콘 (Google 브랜드: 별 모양 그라데이션)
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
      d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5L12 2z"
      fill="url(#gemini-gradient)"
    />
  </svg>
);

// Claude 공식 아이콘 (Anthropic 브랜드: 주황색 원형 로고)
export const ClaudeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx(className)}
  >
    <circle cx="12" cy="12" r="12" fill="#DE7C00" />
    <path
      d="M8 8h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z"
      fill="white"
    />
    <path
      d="M10 10v4m2-4v4m2-4v4"
      stroke="#DE7C00"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
); 