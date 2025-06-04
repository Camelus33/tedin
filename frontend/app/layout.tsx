import '@/styles/globals.css'
// import { Inter, Montserrat } from 'next/font/google' // 기존 폰트 임포트 제거
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head' // Head 임포트 추가
// Import dashboard global styles for action cards
import './dashboard/styles/dashboard.css';
import Footer from '@/components/common/Footer'; // Import the Footer component
import CartUIManager from '@/components/cart/CartUIManager'; // Import CartUIManager

// 기존 폰트 설정 제거
// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-inter',
// })

// const montserrat = Montserrat({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-montserrat',
// })

export const metadata = {
  title: 'Habitus33: 이제, 쭉쭉 읽고 바로 이해하세요!',
  description: '느린 읽기에 좌절했나요? Habitus33의 인지과학 기반 마이크로 리딩과 메모진화로 33일 만에 놀라운 읽기 능력 향상과 지적 자신감을 경험하세요!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 기존 폰트 변수 클래스 제거
    // <html lang="ko" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning> 
    <html lang="ko" suppressHydrationWarning>
      {/* Pretendard 폰트 링크 추가 */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </Head>
      <body className="min-h-screen bg-white flex flex-col">
        <Providers>
          <ReduxProvider>
            <div className="flex-grow">
              {children}
            </div>
            <CartUIManager />
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
          <Footer />
        </Providers>
      </body>
    </html>
  )
} 