const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
    darkMode: ['class'],
    content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	extend: {
  		screens: {
  			'xs': '475px',
  		},
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
  			},
    			brand: {
  				primary: '#192A56',       // Deep Navy
  				secondary: '#F5F5F5',     // Warm Gray
  				accent: {
  					sage: '#87A96B',         // Sage Green
  					orange: '#E89F71',       // Muted Orange
    			},
          paper: {
            ivory: '#FBF7EF',
          },
  			},
  			indigo: {
  				50: '#eef2ff',
  				100: '#e0e7ff',
  				600: '#4f46e5',
  				700: '#4338ca',
  			},
  			purple: {
  				600: '#9333ea',
  			},
  			emerald: {
  				600: '#059669',
  				700: '#047857',
  			}
  		},
    		fontFamily: {
  			sans: ['Pretendard Variable', ...fontFamily.sans],
    			serif: ['var(--font-noto-serif-kr)', ...fontFamily.serif],
          body: ['var(--font-noto-sans-kr)', ...fontFamily.sans],
  		},
        typography: (theme) => ({
          tech: {
            css: {
              '--tw-prose-body': theme('colors.gray.700'),
              '--tw-prose-headings': theme('colors.gray.900'),
              '--tw-prose-links': theme('colors.indigo.600'),
              '--tw-prose-links-hover': theme('colors.indigo.700'),
              '--tw-prose-bullets': theme('colors.indigo.600'),
              '--tw-prose-captions': theme('colors.gray.500'),
              '--tw-prose-code': theme('colors.gray.900'),
              '--tw-prose-hr': theme('colors.gray.200'),

              maxWidth: '100%',
              h1: {
                fontFamily: 'var(--font-noto-serif-kr), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                letterSpacing: '-0.01em',
              },
              h2: {
                fontFamily: 'var(--font-noto-serif-kr), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                letterSpacing: '-0.01em',
              },
              h3: {
                fontFamily: 'var(--font-noto-serif-kr), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                letterSpacing: '-0.005em',
              },
              p: {
                fontSize: '1.0625rem',
                lineHeight: '1.9',
                fontFamily: 'var(--font-noto-sans-kr), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Ubuntu, Cantarell, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
              },
              a: {
                textDecoration: 'none',
                fontWeight: '600',
                borderBottom: `1px solid ${theme('colors.indigo.200')}`,
                transition: 'color .2s ease, border-color .2s ease',
                '&:hover': {
                  color: theme('colors.indigo.700'),
                  borderBottomColor: theme('colors.indigo.400'),
                },
              },
              blockquote: {
                fontStyle: 'normal',
                borderLeftColor: theme('colors.indigo.200'),
                backgroundColor: theme('colors.gray.50'),
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
              },
              'code::before': { content: '""' },
              'code::after': { content: '""' },
              code: {
                backgroundColor: theme('colors.gray.100'),
                padding: '0.15rem 0.375rem',
                borderRadius: '0.375rem',
                fontWeight: '600',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
              pre: {
                backgroundColor: '#0b1020',
                color: '#e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)'
              },
              img: {
                borderRadius: '0.75rem',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)'
              },
              hr: {
                marginTop: '3rem',
                marginBottom: '3rem',
              },
              ul: {
                marginTop: '1em',
                marginBottom: '1em',
              },
              'ul > li::marker': {
                color: theme('colors.indigo.600'),
              },
              strong: {
                color: theme('colors.gray.900'),
              }
            }
          }
        }),
  				animation: {
			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			'bounce-gentle': 'bounce-gentle 3s ease-in-out infinite',
			'fadeIn': 'fadeIn 0.5s ease-in-out',
      'flow1': 'flow1 3s ease-in-out infinite',
      'flow2': 'flow2 3s ease-in-out infinite',
      'flow3': 'flow3 3s ease-in-out infinite',
      'draw-path': 'draw-path 2s ease-in-out infinite'
		},
		keyframes: {
			'bounce-gentle': {
				'0%, 100%': {
					transform: 'translateY(0)'
				},
				'50%': {
					transform: 'translateY(-8px)'
				}
			},
			'fadeIn': {
				'0%': {
					opacity: '0',
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
      'flow1': {
        '0%, 100%': { opacity: '0', transform: 'translateX(0) translateY(0) scale(0.5)' },
        '50%': { opacity: '1', transform: 'translateX(40px) translateY(-20px) scale(1)' },
        '99%': { opacity: '0' }
      },
      'flow2': {
        '0%, 100%': { opacity: '0', transform: 'translateX(0) translateY(0) scale(0.5)' },
        '50%': { opacity: '1', transform: 'translateX(20px) translateY(30px) scale(1)' },
        '99%': { opacity: '0' }
      },
      'flow3': {
        '0%, 100%': { opacity: '0', transform: 'translateX(0) translateY(0) scale(0.5)' },
        '50%': { opacity: '1', transform: 'translateX(30px) translateY(-40px) scale(1)' },
        '99%': { opacity: '0' }
      },
      'draw-path': {
        '0%': { 'stroke-dashoffset': '1000' },
        '100%': { 'stroke-dashoffset': '0' },
      }
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
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} 