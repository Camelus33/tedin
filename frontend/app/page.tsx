import { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { URL } from 'url'; // Import URL for constructing metadataBase

// Define the base URL for metadata
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Use env var or default

// Metadata API for SEO - Kept in Server Component
export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(baseUrl),
  title: 'Habitus33 | Atomic Memo, Success Habit!',
  description: 'Atomic Memo. Accelerate your learning!',
  // Add other relevant metadata: keywords, open graph tags, etc.
  keywords: ['Habitus33','AI-Link', '프롬프트 프리', 'AI 메모장', '생산성 향상', 'AI 연결', '지식그래프', 'AI 보고서', '온톨로지', '대학생 필수앱', '성인학습자', '시험공부앱', '수험생', '연구자', '대학원생', '직장인', '엔지니어'],
  openGraph: {
    title: 'Habitus33 | Atomic Memo, Success Habit!',
    description: 'Atomic Memo. Accelerate your learning!',
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