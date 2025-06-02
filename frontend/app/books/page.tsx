import { Suspense } from 'react';
import BooksPageContent from './BooksPageContent';
import BooksPageSkeleton from './BooksPageSkeleton';

export default function BooksPage() {
  // The actual searchParams object is not needed here, 
  // as BooksPageContent will use the useSearchParams hook directly.
  // We just need to ensure this page can be dynamically rendered if necessary,
  // or that Suspense handles the client-side hook usage properly.
  return (
    <Suspense fallback={<BooksPageSkeleton />}>
      <BooksPageContent />
    </Suspense>
  );
} 