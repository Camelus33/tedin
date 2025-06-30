import '@/styles/globals.css'
import { Noto_Serif_KR } from 'next/font/google'
// import './dashboard/styles/dashboard.css';

// Noto Serif KR 폰트 설정
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

// 루트 레이아웃에서는 메타데이터를 제거 (locale별 레이아웃에서 관리)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning className={notoSerifKr.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-brand-secondary text-gray-800 flex flex-col pretendard">
        {children}
      </body>
    </html>
  )
} 