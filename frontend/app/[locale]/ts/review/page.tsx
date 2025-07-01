export const dynamic = 'force-dynamic';

import TSReviewPage from './page.client';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TSReviewPage />
    </Suspense>
  );
}