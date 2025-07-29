import '@/styles/globals.css'
import { Noto_Serif_KR } from 'next/font/google'
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
import './dashboard/styles/dashboard.css';
import Footer from '@/components/common/Footer';
import CartUIManager from '@/components/cart/CartUIManager';

import { AILinkCommandWrapper } from '@/components/ai/AILinkCommandWrapper'; // AI-Link 래퍼 컴포넌트 임포트

// Noto Serif KR 폰트 설정
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'], // 필요한 가중치 선택
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

export const metadata = {
  title: 'Habitus33 - Atomic Memo. Accelerate your learning!',
  description: 'AI-Link 기술로 복잡한 맥락을 지식 캡슐에 담아 프롬프트 없이도 AI가 당신을 깊이 이해하게 만드는 혁신적인 학습 도구입니다.',
  keywords: 'AI, 학습, 메모, 지식관리, 프롬프트프리, AI-Link, AMFA, 학습가속기, 지식캡슐화',
  authors: [{ name: 'Habitus33 Team' }],
  creator: 'Habitus33',
  publisher: 'Habitus33',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://habitus33.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://habitus33.vercel.app',
    siteName: 'Habitus33',
    title: 'Habitus33 - Atomic Memo. Accelerate your learning!',
    description: 'AI-Link 기술로 복잡한 맥락을 지식 캡슐에 담아 프롬프트 없이도 AI가 당신을 깊이 이해하게 만드는 혁신적인 학습 도구입니다.',
    images: [
      {
        url: '/hero-image.png',
        width: 1200,
        height: 630,
        alt: 'Habitus33 - AI와 자연스러운 소통을 위한 지식 캡슐화 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habitus33 - Atomic Memo. Accelerate your learning!',
    description: 'AI-Link 기술로 복잡한 맥락을 지식 캡슐에 담아 프롬프트 없이도 AI가 당신을 깊이 이해하게 만드는 혁신적인 학습 도구입니다.',
    images: ['/hero-image.png'],
    creator: '@habitus33',
    site: '@habitus33',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google5245112c1513f7b7.html',
  },
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
        
        {/* JSON-LD 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Habitus33",
              "description": "AI-Link 기술로 복잡한 맥락을 지식 캡슐에 담아 프롬프트 없이도 AI가 당신을 깊이 이해하게 만드는 혁신적인 학습 도구입니다.",
              "url": "https://habitus33.vercel.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "KRW"
              },
              "author": {
                "@type": "Organization",
                "name": "Habitus33",
                "url": "https://habitus33.vercel.app"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Habitus33",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://habitus33.vercel.app/images/mascot/seal-svgrepo-com.svg"
                }
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              },
              "featureList": [
                "AI-Link 지식 캡슐화",
                "AMFA 메모 진화 시스템", 
                "프롬프트 프리 AI 소통",
                "학습 가속기",
                "지식 네트워크 연결"
              ]
            })
          }}
        />
        
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Habitus33",
              "url": "https://habitus33.vercel.app",
              "logo": "https://habitus33.vercel.app/images/mascot/seal-svgrepo-com.svg",
              "description": "AI 시대를 위한 새로운 생각의 습관을 만드는 플랫폼",
              "foundingDate": "2024",
              "sameAs": [
                "https://twitter.com/habitus33"
              ]
            })
          }}
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