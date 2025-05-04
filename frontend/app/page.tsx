import { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { URL } from 'url'; // Import URL for constructing metadataBase

// Define the base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Use env var or default

// Metadata API for SEO - Kept in Server Component
export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(baseUrl),
  title: 'Habitus33 | 작업 기억력 강화, 뇌 잠재력을 깨우는 새로운 기회',
  description:
    '당신의 한계는 뇌가 아니라 훈련 방식에 있었습니다. 신경과학 기반 Habitus33으로 작업 기억력(속도, 용량, 지속 시간)을 강화하고 학습과 업무의 레벨을 바꾸세요. 지금 새로운 기회를 경험하세요!',
  // Add other relevant metadata: keywords, open graph tags, etc.
  keywords: ['작업 기억력', '뇌 훈련', '인지 능력', '집중력', '기억력', '독서 속도', '신경과학', 'Habitus33', 'ZenGo', 'TS 모드'],
  openGraph: {
    title: 'Habitus33 | 작업 기억력 강화, 뇌 잠재력을 깨우는 새로운 기회',
    description: '신경과학 기반 Habitus33으로 작업 기억력을 강화하고 학습과 업무 효율성을 극대화하세요.',
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