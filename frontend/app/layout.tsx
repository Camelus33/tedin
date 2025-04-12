import '@/styles/globals.css'
import { Inter, Montserrat } from 'next/font/google'
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata = {
  title: 'Habitus33 - 독서 생산성을 높이는 습관 시스템',
  description: '독서 습관과 독해력 향상을 위한 타임스캐너와 인지 훈련 도구입니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white">
        <Providers>
          <ReduxProvider>
            {children}
          </ReduxProvider>
          
          {/* 개발 환경에서만 디버그 패널 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <div id="debug-panel-root" />
          )}
          
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
} 