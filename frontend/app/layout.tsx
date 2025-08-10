import '@/styles/globals.css'
import { Noto_Serif_KR, Noto_Sans_KR } from 'next/font/google'
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from './providers'
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

// Noto Sans KR 폰트 설정 (본문용)
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

export const metadata = {
  title: 'Habitus33 - Atomic Memo. Accelerate your learning!',
  description: 'Thought Pattern Mapping(TPM)으로 당신의 메모와 생각 흐름을 분석해 패턴을 발견하고, AI-Link로 지식 캡슐을 만들어 더 깊이 이해하는 학습 도구입니다.',
  keywords: 'Thought Pattern Mapping, TPM, AI-Link, AMFA, AI, 학습, 메모, 지식관리, 학습가속기, 지식캡슐화',
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
    description: 'Thought Pattern Mapping(TPM)으로 생각의 패턴을 분석하고 AI-Link로 지식 캡슐을 만드는 학습 도구입니다.',
    images: [
      {
        url: '/hero-image.png',
        width: 1200,
        height: 630,
          alt: 'Habitus33 - Thought Pattern Mapping(TPM)과 AI-Link로 지식 캡슐을 만드는 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habitus33 - Atomic Memo. Accelerate your learning!',
    description: 'Thought Pattern Mapping(TPM)으로 생각의 패턴을 분석하고 AI-Link로 지식 캡슐을 만드는 학습 도구입니다.',
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
    <html lang="ko" className={`${notoSerifKr.variable} ${notoSansKr.variable}`} suppressHydrationWarning>
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
              "description": "Thought Pattern Mapping(TPM)으로 생각의 패턴을 분석하고 AI-Link로 지식 캡슐을 만들어 더 깊이 이해하게 돕는 학습 도구입니다.",
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
                  "url": "https://habitus33.vercel.app/images/mascot/habitus-logo-seal.png"
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
                "Thought Pattern Mapping 분석",
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
              "logo": "https://habitus33.vercel.app/images/mascot/habitus-logo-seal.png",
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
          </ReduxProvider>
          
          {/* 개발 환경에서만 디버그 패널 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <div id="debug-panel-root" />
          )}
          
          <Footer />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistration().then(function(reg){
                    if(!reg){ navigator.serviceWorker.register('/sw.js'); }
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
} 