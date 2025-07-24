import '@/styles/globals.css'
import { Noto_Serif_KR } from 'next/font/google'
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
import './dashboard/styles/dashboard.css';
import Footer from '@/components/common/Footer';
import CartUIManager from '@/components/cart/CartUIManager';
import { Toaster } from 'react-hot-toast';
import { AILinkCommand } from '@/components/ai/AILinkCommand'; // AI-Link 컴포넌트 임포트

// Noto Serif KR 폰트 설정
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'], // 필요한 가중치 선택
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

export const metadata = {
  title: 'Habitus33 - Seamless, Memo to Your Goal',
  description: 'Habitus33 is a seamless memo to Goal tool that allows you to create',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSerifKr.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-brand-secondary text-gray-800 flex flex-col pretendard">
        <Providers>
          <ReduxProvider>
            <div className="flex-grow">
              {children}
            </div>
            <CartUIManager />
            <Toaster />
            <AILinkCommand /> {/* 모든 페이지에 AI-Link 버튼과 모달을 렌더링 */}
          </ReduxProvider>
          
          {/* 개발 환경에서만 디버그 패널 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <div id="debug-panel-root" />
          )}
          
          <Footer />
        </Providers>
      </body>
    </html>
  )
} 