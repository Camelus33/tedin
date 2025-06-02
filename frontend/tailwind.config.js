/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
    darkMode: ['class'],
    content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				'500': 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			neutral: {
  				'50': '#F9FAFB',
  				'100': '#F3F4F6',
  				'200': '#E5E7EB',
  				'300': '#D1D5DB',
  				'400': '#9CA3AF',
  				'500': '#6B7280',
  				'600': '#4B5563',
  				'700': '#374151',
  				'800': '#1F2937',
  				'900': '#111827',
  				DEFAULT: '#111827'
  			},
  			feedback: {
  				success: '#10B981',
  				error: '#EF4444',
  				warning: '#F59E0B'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Pretendard Variable',
  				'Pretendard',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'system-ui',
  				'Roboto',
  				'Helvetica Neue',
  				'Segoe UI',
  				'Apple SD Gothic Neo',
  				'Noto Sans KR',
  				'Malgun Gothic',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		fontSize: {
  			'heading-lg': [
  				'36px',
  				{
  					lineHeight: '1.2',
  					fontWeight: '700'
  				}
  			],
  			'heading-md': [
  				'28px',
  				{
  					lineHeight: '1.3',
  					fontWeight: '700'
  				}
  			],
  			'heading-sm': [
  				'22px',
  				{
  					lineHeight: '1.4',
  					fontWeight: '600'
  				}
  			],
  			'body-lg': [
  				'18px',
  				{
  					lineHeight: '1.7'
  				}
  			],
  			'body-md': [
  				'16px',
  				{
  					lineHeight: '1.7'
  				}
  			],
  			'body-sm': [
  				'14px',
  				{
  					lineHeight: '1.6'
  				}
  			]
  		},
  		spacing: {
  			'page-y': '3rem',
  			'page-x': '1.5rem',
  			'card-p': '2rem'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 