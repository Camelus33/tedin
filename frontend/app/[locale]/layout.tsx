import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers as ReduxProvider } from '@/store/provider'
import { Providers } from '../providers'
import Footer from '@/components/common/Footer';
import CartUIManager from '@/components/cart/CartUIManager';
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';

// 국제화된 메타데이터 생성
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // 로케일별 메타데이터
  const metadataMap = {
    ko: {
      title: 'Habitus33 | 새로운 생각의 습관',
      description: 'AI와 함께하는 지식 진화 플랫폼. Prompt Free, Habitus33',
      keywords: ['학습 번아웃', '학습 파도', 'Atomic Memo', 'Deep Focus', '작업 기억력', '작고 강한 몰입', '인지력', '집중력', '기억력', 'Habitus33']
    },
    en: {
      title: 'Habitus33 | A New Habit of Thought',
      description: 'AI-powered Knowledge Evolution Platform. Prompt Free, Habitus33',
      keywords: ['learning burnout', 'atomic memo', 'deep focus', 'working memory', 'cognitive enhancement', 'focus', 'memory', 'Habitus33']
    }
  };

  const meta = metadataMap[locale as keyof typeof metadataMap] || metadataMap.ko;

  return {
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/${locale}`,
      siteName: 'Habitus33',
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 해당 로케일의 메시지를 서버에서 가져옴
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ReduxProvider>
              <div className="flex-grow">
                {children}
              </div>
              <CartUIManager />
            </ReduxProvider>
            
            <Toaster position="bottom-center" />
            
            {/* 개발 환경에서만 디버그 패널 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <div id="debug-panel-root" />
            )}
            
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 