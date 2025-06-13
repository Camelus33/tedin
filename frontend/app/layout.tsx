import '@/styles/globals.css'
import { Noto_Serif_KR } from 'next/font/google'
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'
import './dashboard/styles/dashboard.css';
import Footer from '@/components/common/Footer';
import CartUIManager from '@/components/cart/CartUIManager';

// Noto Serif KR 폰트 설정
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'], // 필요한 가중치 선택
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

// metadata는 page.tsx에서 관리하므로 layout에서는 제거하거나 기본값 유지
export const metadata = {
  title: 'Habitus33',
  description: '작은 물방울이 만드는 깊은 학습의 파도를 경험하고, 번아웃과 작별하세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSerifKr.variable} suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </Head>
      <body className="min-h-screen bg-brand-secondary text-gray-800 flex flex-col pretendard">
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