import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Spinner from '@/components/ui/Spinner';

// Dynamically import the client component that uses useSearchParams
const TSSetupClientPage = dynamic(() => import('./TSSetupClientPage'), {
  ssr: false, // Important: Disable SSR for the component using client-side hooks like useSearchParams
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Spinner size="lg" color="cyan" />
      <p className="mt-4 text-gray-400">페이지 로딩 중...</p>
    </div>
  ),
});

export default function TSSetupPage() {
  return (
    <Suspense fallback={ // Fallback UI while the dynamic component is loading
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <Spinner size="lg" color="cyan" />
        <p className="mt-4 text-gray-400">설정 페이지 준비 중...</p>
      </div>
    }>
      <TSSetupClientPage />
    </Suspense>
  );
} 