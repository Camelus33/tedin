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
    'Habitus33은 Atomic Reading으로 작고 강한 집중을, 정교한 AI로 당신만의 리듬을 찾아 드립니다. 작은 노력도 모두 성공으로 만드세요.',
  // Add other relevant metadata: keywords, open graph tags, etc.
  keywords: ['학습 번아웃', '학습 리듬', 'Atomic Reading', 'Deep Focus', '작업 기억력', '작고 강한 몰입', '인지력', '집중력', '기억력', 'Habitus33', 'ZenGo'],
  openGraph: {
    title: 'Habitus33 | 작고 깊게 읽고, 오래 기억하세요',
    description: '작은 성공을 통해 끊임없는 성장의 즐거움을 맛보세요.',
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