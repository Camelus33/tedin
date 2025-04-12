'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function DebugPage() {
  const state = useSelector((state: RootState) => state);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Redux State Debug</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    </div>
  );
} 