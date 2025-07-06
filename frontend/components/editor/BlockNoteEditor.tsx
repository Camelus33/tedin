'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './BlockNoteEditor.css';

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
}

// cyberTheme 정의 (기존 파일과 동일)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
};

export default function BlockNoteEditor({ 
  initialContent = '', 
  onChange, 
  editable = true,
  className = ''
}: BlockNoteEditorProps) {
  // BlockNote 에디터 인스턴스 생성
  const editor = useCreateBlockNote({
    defaultStyles: true,
  });

  const hasLoadedInitialContent = useRef(false);

  useEffect(() => {
    if (!editor || hasLoadedInitialContent.current) return;

    // ---------- 초기 콘텐츠 로딩 ----------
    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed)) {
        editor.replaceBlocks(editor.document, parsed);
        hasLoadedInitialContent.current = true;
        return;
      }
    } catch (_) {
      // JSON 파싱 실패 → 마크다운(텍스트) 처리
    }

    // 마크다운 또는 일반 텍스트 처리
    const lines = initialContent
      .split('\n')
      .filter((line) => line.trim() !== '');

    if (lines.length > 0) {
      editor.removeBlocks(editor.document);
      lines.forEach((line) => {
        if (line.startsWith('# ')) {
          editor.insertBlocks(
            [{ type: 'heading', props: { level: 1 }, content: line.substring(2) }],
            editor.document[editor.document.length - 1]?.id || editor.document[0]?.id,
            'after'
          );
        } else if (line.startsWith('## ')) {
          editor.insertBlocks(
            [{ type: 'heading', props: { level: 2 }, content: line.substring(3) }],
            editor.document[editor.document.length - 1]?.id || editor.document[0]?.id,
            'after'
          );
        } else if (line.startsWith('### ')) {
          editor.insertBlocks(
            [{ type: 'heading', props: { level: 3 }, content: line.substring(4) }],
            editor.document[editor.document.length - 1]?.id || editor.document[0]?.id,
            'after'
          );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          editor.insertBlocks(
            [{ type: 'bulletListItem', content: line.substring(2) }],
            editor.document[editor.document.length - 1]?.id || editor.document[0]?.id,
            'after'
          );
        } else {
          editor.insertBlocks(
            [{ type: 'paragraph', content: line }],
            editor.document[editor.document.length - 1]?.id || editor.document[0]?.id,
            'after'
          );
        }
      });
    }

    hasLoadedInitialContent.current = true;
  }, [editor]);

  // 에디터 변경사항 처리
  // Markdown으로 변환하면 색상·하이라이트 등 BlockNote 고유 스타일이 손실되므로
  // JSON 문자열 그대로 상위 컴포넌트에 전달한다.
  const handleChange = () => {
    if (!onChange || !editor) return;

    // JSON 직렬화하여 스타일 정보를 100% 보존
    onChange(JSON.stringify(editor.document));
  };

  // 블록을 마크다운으로 변환하는 함수
  const blocksToMarkdown = async (blocks: any[]): Promise<string> => {
    const lines: string[] = [];
    
    for (const block of blocks) {
      try {
        switch (block.type) {
          case 'heading':
            const level = block.props?.level || 1;
            const headingPrefix = '#'.repeat(level);
            const headingText = getTextFromContent(block.content);
            lines.push(`${headingPrefix} ${headingText}`);
            break;
          case 'paragraph':
            const paragraphText = getTextFromContent(block.content);
            lines.push(paragraphText);
            break;
          case 'bulletListItem':
            const bulletText = getTextFromContent(block.content);
            lines.push(`- ${bulletText}`);
            break;
          case 'numberedListItem':
            const numberedText = getTextFromContent(block.content);
            lines.push(`1. ${numberedText}`);
            break;
          default:
            const defaultText = getTextFromContent(block.content);
            if (defaultText) {
              lines.push(defaultText);
            }
        }
        
        // 자식 블록 처리 (중첩된 블록)
        if (block.children && block.children.length > 0) {
          const childMarkdown = await blocksToMarkdown(block.children);
          lines.push(childMarkdown);
        }
      } catch (error) {
        console.error('Error processing block:', block, error);
      }
    }
    
    return lines.join('\n\n');
  };

  // 콘텐츠에서 텍스트 추출하는 헬퍼 함수
  const getTextFromContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      return content.map(item => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object' && 'text' in item) {
          return item.text;
        }
        return '';
      }).join('');
    }
    
    return '';
  };

  // 커스텀 스타일 적용
  const customStyles = useMemo(() => ({
    editor: {
      backgroundColor: 'rgb(31, 41, 55)', // gray-800
      color: 'rgb(209, 213, 219)', // gray-300
      borderRadius: '0.5rem',
      border: '1px solid rgb(75, 85, 99)', // gray-600
      minHeight: '400px',
      padding: '1rem',
    }
  }), []);

  return (
    <div className={`blocknote-editor ${className} ${cyberTheme.bgSecondary} rounded-lg border ${cyberTheme.inputBorder}`}>
      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme="dark" // 다크모드 기본 설정
        onChange={handleChange}
      />
    </div>
  );
} 