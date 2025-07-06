'use client';

import React, { useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './BlockNoteEditor.css';

interface BlockNoteViewerProps {
  /**
   * JSON 문자열 형태로 저장된 BlockNote 문서
   */
  content: string;
  /** tailwind 등 추가 클래스 */
  className?: string;
}

/**
 * 읽기 전용 BlockNote 뷰어. JSON 문자열을 그대로 받아 스타일이 보존된 상태로 렌더링한다.
 */
export default function BlockNoteViewer({ content, className = '' }: BlockNoteViewerProps) {
  // 에디터 인스턴스 (읽기 전용이지만 BlockNoteView 요구)
  const editor = useCreateBlockNote({ defaultStyles: true });
  const hasLoaded = useRef(false);

  // JSON 콘텐츠 로드 (초기 1회)
  useEffect(() => {
    if (!editor || hasLoaded.current) return;

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        editor.replaceBlocks(editor.document, parsed);
      }
    } catch (_) {
      // 파싱 실패(예: 빈 문자열) 시 무시
    }
    hasLoaded.current = true;
  }, [editor, content]);

  return (
    <div className={`blocknote-viewer ${className}`}>
      <BlockNoteView editor={editor} editable={false} theme="dark" />
    </div>
  );
} 