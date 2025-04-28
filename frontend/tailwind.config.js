/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        secondary: colors.emerald,
        accent: colors.pink,
        neutral: {
          DEFAULT: '#111827', // Gray 900 (기본 텍스트)
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB', // 구분선
          400: '#9CA3AF',
          500: '#6B7280', // 보조 텍스트
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        feedback: {
          success: '#10B981', // Emerald 500
          error: '#EF4444',   // Red 500
          warning: '#F59E0B'  // Amber 500
        }
      },
      fontFamily: {
        // Pretendard를 기본 sans-serif 폰트로 설정
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
        // 기존 display 폰트 제거 또는 필요시 유지
        // display: ['var(--font-montserrat)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontSize: {
        'heading-lg': ['36px', { lineHeight: '1.2', fontWeight: '700' }], // 크기/굵기 조정
        'heading-md': ['28px', { lineHeight: '1.3', fontWeight: '700' }], // 크기/굵기 조정
        'heading-sm': ['22px', { lineHeight: '1.4', fontWeight: '600' }], // 크기/굵기 조정
        'body-lg': ['18px', { lineHeight: '1.7' }], // 필요시 추가
        'body-md': ['16px', { lineHeight: '1.7' }], // 줄간격 조정
        'body-sm': ['14px', { lineHeight: '1.6' }] // 필요시 추가
      },
      spacing: {
        'page-y': '3rem',
        'page-x': '1.5rem',
        'card-p': '2rem',
      },
    },
  },
  plugins: [],
} 