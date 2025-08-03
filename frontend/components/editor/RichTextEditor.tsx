'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListBulletIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
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

// JSON을 HTML로 변환하는 함수
const jsonToHtml = (jsonContent: string): string => {
  try {
    const blocks = JSON.parse(jsonContent);
    if (!Array.isArray(blocks)) return jsonContent;

    return blocks.map((block: any) => {
      const content = block.content?.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.text) {
          let text = item.text;
          if (item.styles?.bold) text = `<strong>${text}</strong>`;
          if (item.styles?.italic) text = `<em>${text}</em>`;
          if (item.styles?.underline) text = `<u>${text}</u>`;
          if (item.styles?.strike) text = `<s>${text}</s>`;
          return text;
        }
        return '';
      }).join('') || '';

      switch (block.type) {
        case 'heading':
          const level = block.props?.level || 1;
          return `<h${level}>${content}</h${level}>`;
        case 'paragraph':
          return `<p>${content}</p>`;
        case 'bulletListItem':
          return `<li>${content}</li>`;
        case 'numberedListItem':
          return `<li>${content}</li>`;
        default:
          return `<p>${content}</p>`;
      }
    }).join('');
  } catch (error) {
    // JSON 파싱 실패 시 원본 반환
    return jsonContent;
  }
};

// HTML을 JSON으로 변환하는 함수 (필요시 사용)
const htmlToJson = (htmlContent: string): string => {
  // 간단한 HTML을 JSON으로 변환
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const blocks: any[] = [];
  const elements = tempDiv.children;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const tagName = element.tagName.toLowerCase();
    const content = element.textContent || '';

    let block: any = {
      type: 'paragraph',
      content: [{ text: content }]
    };

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
        block.type = 'heading';
        block.props = { level: parseInt(tagName.charAt(1)) };
        break;
      case 'li':
        block.type = 'bulletListItem';
        break;
      case 'p':
      default:
        block.type = 'paragraph';
        break;
    }

    blocks.push(block);
  }

  return JSON.stringify(blocks);
};

// 커서 위치를 저장하고 복원하는 함수
const saveSelection = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  return selection.getRangeAt(0).cloneRange();
};

const restoreSelection = (range: Range | null) => {
  if (!range) return;
  
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

export default function RichTextEditor({
  initialContent = '',
  onChange,
  editable = true,
  className = '',
  placeholder = '입력을 시작하세요...'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  // IME(한글 등) 조합 상태 관리
  const [isComposing, setIsComposing] = useState(false);
  // 커서 위치 저장
  const savedRangeRef = useRef<Range | null>(null);

  // CSS 우선순위 문제 해결을 위한 스타일 주입
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rich-text-editor [contenteditable="true"] {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        unicode-bidi: normal !important;
      }
      .rich-text-editor [contenteditable="true"] * {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        unicode-bidi: normal !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 초기 콘텐츠 설정
  useEffect(() => {
    if (editorRef.current && initialContent) {
      // JSON 데이터인지 확인하고 HTML로 변환
      let htmlContent = initialContent;
      if (initialContent.trim().startsWith('[')) {
        htmlContent = jsonToHtml(initialContent);
      }

      editorRef.current.innerHTML = htmlContent;
      setHasContent(htmlContent.trim().length > 0);
    }
  }, [initialContent]);

  // IME 조합 이벤트 핸들러
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => {
    setIsComposing(false);
    handleInput(); // 조합이 끝난 후에만 onChange 호출
  };

  // 콘텐츠 변경 감지 (IME 조합 중에는 호출하지 않음)
  const handleInput = useCallback(() => {
    if (!editorRef.current || !onChange || isComposing) return;

    const content = editorRef.current.innerHTML;
    setHasContent(content.trim().length > 0);
    onChange(content);
  }, [onChange, isComposing]);

  // 포커스 핸들러
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // 서식 명령 실행 (커서 위치 보존)
  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    // 현재 커서 위치 저장
    savedRangeRef.current = saveSelection();
    
    editorRef.current.focus();
    document.execCommand(command, false, value);
    
    // 커서 위치 복원
    if (savedRangeRef.current) {
      restoreSelection(savedRangeRef.current);
    }
    
    handleInput();
  };

  // 엔터 키 처리
  const handleEnter = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // 현재 블록 요소 찾기
    let currentBlock = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
    while (currentBlock && !['P', 'H1', 'H2', 'H3', 'LI'].includes(currentBlock.tagName)) {
      currentBlock = currentBlock.parentElement;
    }

    if (!currentBlock) return;

    // 새 단락 생성
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = '<br>';
    
    // 현재 블록 뒤에 새 단락 삽입
    if (currentBlock.parentNode) {
      currentBlock.parentNode.insertBefore(newParagraph, currentBlock.nextSibling);
    }

    // 커서를 새 단락의 시작 위치로 이동
    const newRange = document.createRange();
    newRange.setStart(newParagraph, 0);
    newRange.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    handleInput();
  };

  // 정렬 기능 개선
  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // 현재 블록 요소 찾기
    let currentBlock = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
    while (currentBlock && !['P', 'H1', 'H2', 'H3', 'LI'].includes(currentBlock.tagName)) {
      currentBlock = currentBlock.parentElement;
    }

    if (!currentBlock) return;

    // HTMLElement로 캐스팅하여 style 속성에 접근
    const htmlElement = currentBlock as HTMLElement;
    
    // 기존 정렬 스타일 제거
    htmlElement.style.textAlign = '';
    
    // 새 정렬 적용
    switch (alignment) {
      case 'left':
        htmlElement.style.textAlign = 'left';
        break;
      case 'center':
        htmlElement.style.textAlign = 'center';
        break;
      case 'right':
        htmlElement.style.textAlign = 'right';
        break;
    }
    
    handleInput();
  };

  // 키보드 단축키 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editable) return;

    const isCtrl = e.ctrlKey || e.metaKey;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnter();
      return;
    }
    
    if (isCtrl) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            execCommand('redo');
          } else {
            e.preventDefault();
            execCommand('undo');
          }
          break;
        case 'y':
          e.preventDefault();
          execCommand('redo');
          break;
      }
    }
  }, [editable, execCommand]);

  // 툴바 버튼 컴포넌트
  const ToolbarButton = ({
    icon: Icon,
    command,
    value,
    title,
    isActive = false
  }: {
    icon: React.ComponentType<any>;
    command?: string;
    value?: string;
    title: string;
    isActive?: boolean;
  }) => (
    <button
      onClick={() => command && execCommand(command, value)}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-600 transition-colors ${
        isActive ? 'bg-cyan-600 text-white' : 'text-gray-300'
      }`}
    >
      <Icon className="w-3 h-3" />
    </button>
  );

  // 블록 타입 드롭다운
  const BlockTypeDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Normal');
    const blockTypes = [
      { label: 'Normal', value: 'p' },
      { label: 'Heading 1', value: 'h1' },
      { label: 'Heading 2', value: 'h2' },
      { label: 'Heading 3', value: 'h3' },
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 rounded hover:bg-gray-600 transition-colors text-gray-300 text-xs"
        >
          {selectedType} ▼
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg z-10 min-w-32">
            {blockTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  execCommand('formatBlock', `<${type.value}>`);
                  setSelectedType(type.label);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-600"
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rich-text-editor ${className} ${cyberTheme.bgSecondary} rounded-lg border ${cyberTheme.inputBorder}`}>
      {/* 툴바 */}
      <div className={`p-2 border-b ${cyberTheme.inputBorder} bg-gray-700 flex items-center gap-0.5 flex-wrap text-xs`}>
        {/* 실행 취소/다시 실행 */}
        <ToolbarButton
          icon={ArrowUturnLeftIcon}
          command="undo"
          title="실행 취소 (Ctrl+Z)"
        />
        <ToolbarButton
          icon={ArrowUturnRightIcon}
          command="redo"
          title="다시 실행 (Ctrl+Y)"
        />

        <div className="w-px h-4 bg-gray-600 mx-2"></div>

        {/* 블록 타입 드롭다운 */}
        <BlockTypeDropdown />

        <div className="w-px h-4 bg-gray-600 mx-2"></div>

        {/* 인라인 서식 */}
        <ToolbarButton
          icon={BoldIcon}
          command="bold"
          title="굵게 (Ctrl+B)"
        />
        <ToolbarButton
          icon={ItalicIcon}
          command="italic"
          title="기울임 (Ctrl+I)"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          command="underline"
          title="밑줄 (Ctrl+U)"
        />
        <ToolbarButton
          icon={StrikethroughIcon}
          command="strikeThrough"
          title="취소선"
        />

        <div className="w-px h-4 bg-gray-600 mx-2"></div>

        {/* 목록 서식 */}
        <ToolbarButton
          icon={ListBulletIcon}
          command="insertUnorderedList"
          title="글머리 기호 목록"
        />
        <ToolbarButton
          icon={ListBulletIcon} // Replaced ListNumberedIcon with ListBulletIcon due to import error
          command="insertOrderedList"
          title="번호 매기기 목록"
        />

        <div className="w-px h-4 bg-gray-600 mx-2"></div>

        {/* 정렬 서식 - 개선된 버전 */}
        <button
          onClick={() => setAlignment('left')}
          title="왼쪽 정렬"
          className="p-1.5 rounded hover:bg-gray-600 transition-colors text-gray-300 text-xs"
        >
          ←
        </button>
        <button
          onClick={() => setAlignment('center')}
          title="가운데 정렬"
          className="p-1.5 rounded hover:bg-gray-600 transition-colors text-gray-300 text-xs"
        >
          ↔
        </button>
        <button
          onClick={() => setAlignment('right')}
          title="오른쪽 정렬"
          className="p-1.5 rounded hover:bg-gray-600 transition-colors text-gray-300 text-xs"
        >
          →
        </button>

        <div className="w-px h-4 bg-gray-600 mx-2"></div>

        {/* 서식 지우기 */}
        <ToolbarButton
          icon={TrashIcon}
          command="removeFormat"
          title="서식 지우기"
        />
      </div>

      {/* 편집기 영역 */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={editable}
          dir="ltr"
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={`min-h-[400px] p-4 ${cyberTheme.textLight} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 ${
            !hasContent && !isFocused ? 'text-gray-500' : ''
          }`}
          style={{
            backgroundColor: 'rgb(31, 41, 55)', // gray-800
            color: 'rgb(209, 213, 219)', // gray-300
            direction: 'ltr',
            writingMode: 'horizontal-tb',
            textOrientation: 'mixed',
          }}
          data-placeholder={placeholder}
        />

        {/* 플레이스홀더 */}
        {!hasContent && !isFocused && (
          <div className="absolute top-4 left-4 text-gray-500 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
} 