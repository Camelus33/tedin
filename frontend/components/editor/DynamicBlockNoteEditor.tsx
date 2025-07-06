'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import Spinner from '@/components/ui/Spinner';

// BlockNote 에디터를 동적 임포트 (SSR 비활성화)
const BlockNoteEditor = dynamic(() => import('./BlockNoteEditor'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-800/60 rounded-lg border border-gray-600">
      <Spinner />
    </div>
  )
});

interface DynamicBlockNoteEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
}

export default function DynamicBlockNoteEditor(props: DynamicBlockNoteEditorProps) {
  return <BlockNoteEditor {...props} />;
} 