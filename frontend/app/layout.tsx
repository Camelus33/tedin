import '@/styles/globals.css'
import { Noto_Serif_KR } from 'next/font/google'
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
import './dashboard/styles/dashboard.css';
import Footer from '@/components/common/Footer';
import CartUIManager from '@/components/cart/CartUIManager';

import { AILinkCommand } from '@/components/ai/AILinkCommand'; // AI-Link 컴포넌트 임포트
import { usePathname } from 'next/navigation';

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

// AILinkCommand를 표시할 페이지 목록
const AILINK_ALLOWED_PATHS = [
  '/dashboard',
  '/books',
];

// 현재 경로가 AILinkCommand를 표시해야 하는지 확인하는 함수
function useShouldShowAILink() {
  const pathname = usePathname();
  
  // 대시보드 페이지
  if (pathname === '/dashboard') return true;
  
  // /books 페이지
  if (pathname === '/books') return true;
  
  // 책 상세 페이지 (/books/[id])
  if (pathname.startsWith('/books/') && pathname !== '/books') return true;
  
  return false;
}

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
            <AILinkCommandWrapper />
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

// AILinkCommand를 조건부로 렌더링하는 래퍼 컴포넌트
function AILinkCommandWrapper() {
  const shouldShow = useShouldShowAILink();
  
  if (!shouldShow) return null;
  
  return <AILinkCommand />;
} 