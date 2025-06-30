import LandingPageClient from '@/components/landing/LandingPageClient';

// 메타데이터는 layout.tsx에서 처리하므로 제거

interface Props {
  params: {
    locale: string;
  };
}

// 국제화된 랜딩 페이지 - 서버 컴포넌트
export default function LandingPage({ params: { locale } }: Props) {
  // 서버 사이드 로직이 필요한 경우 여기에 추가
  // 현재는 locale 파라미터를 받지만 LandingPageClient는 아직 국제화되지 않음
  
  return <LandingPageClient />;
} 