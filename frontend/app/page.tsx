import { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { URL } from 'url'; // Import URL for constructing metadataBase

// Define the base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Use env var or default

// Metadata API for SEO - Kept in Server Component
export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(baseUrl),
  title: 'Habitus33 | 쭉쭉 읽고 바로 이해하세요!',
  description:
    '어렵고 긴 글, 이제 걱정마세요. 작업 기억력(속도, 용량, 시간)을 강화하고 읽기 자신감을 회복하세요!',
  // Add other relevant metadata: keywords, open graph tags, etc.
  keywords: ['작업 기억력', '뇌 훈련', '인지 능력', '집중력', '기억력', '읽기 속도', '신경과학', 'Habitus33', 'ZenGo', '마이크로 리딩','TS 모드'],
  openGraph: {
    title: 'Habitus33 | 마이크로 리딩, 읽기 속도 측정, 암기력 강화 게임',
    description: '33일, 몰라보게 달라질 학습과 업무 효율성을 기대하세요.',
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