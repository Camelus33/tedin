import { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { URL } from 'url'; // Import URL for constructing metadataBase

// Define the base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Use env var or default

// Metadata API for SEO - Kept in Server Component
export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(baseUrl),
  title: 'Habitus33 | 당신의 학습 리듬을 찾고, 번아웃과 작별하세요',
  description:
    '정보의 홍수 속에서 길을 잃으셨나요? Habitus33은 Atomic Reading으로 깊이 있는 집중을, 과학적 피드백으로 지속가능한 학습 리듬을 찾아드립니다. 당신의 노력이 온전히 성과로 이어지는 경험을 시작해보세요.',
  // Add other relevant metadata: keywords, open graph tags, etc.
  keywords: ['학습 번아웃', '학습 리듬', 'Atomic Reading', 'Deep Focus', '작업 기억력', '뇌 훈련', '인지 능력', '집중력', '기억력', 'Habitus33', 'ZenGo'],
  openGraph: {
    title: 'Habitus33 | 지속가능한 학습의 리듬을 찾다',
    description: '작은 성공의 경험을 통해 지적 성장의 즐거움을 되찾으세요.',
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