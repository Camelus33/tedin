import { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { URL } from 'url'; // Import URL for constructing metadataBase

// Define the base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Use env var or default

// Metadata API for SEO - Kept in Server Component
export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(baseUrl),
  title: 'Habitus33 | Less read, More memory',
  description:
    'Habitus33은 3분 읽고 1줄 메모로 작은 물방울을 만들고, 정교한 AI로 당신만의 파도를 키워 드립니다. 작은 시작이 깊은 학습으로 확산됩니다.',
  // Add other relevant metadata: keywords, open graph tags, etc.
  keywords: ['학습 번아웃', '학습 파도', 'Atomic Reading', 'Deep Focus', '작업 기억력', '작고 강한 몰입', '인지력', '집중력', '기억력', 'Habitus33', 'ZenGo', '3분 읽고 1줄 메모', '물방울 학습'],
  openGraph: {
    title: 'Habitus33 | 작은 물방울이 만드는 깊은 학습의 파도',
    description: '3분 읽고 1줄 메모로 시작하는 당신만의 지식 파도를 경험하세요.',
    // images: ['/og-image.png'], // Add OG image path later
    url: '/', // Relative to metadataBase
    siteName: 'Habitus33',
    type: 'website',
  },
};

// This is now a Server Component
export default function LandingPage() {
  // Server-side logic can go here if needed in the future

  // Render the Client Component that handles interactivity and layout
  return <LandingPageClient />;
} 