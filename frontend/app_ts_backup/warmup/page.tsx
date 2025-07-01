export const dynamic = 'force-dynamic';

import TSWarmupPage from './page.client';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TSWarmupPage />
    </Suspense>
  );
} 