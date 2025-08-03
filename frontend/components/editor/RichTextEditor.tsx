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

  // 콘텐츠 변경 감지
  const handleInput = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    
    const content = editorRef.current.innerHTML;
    setHasContent(content.trim().length > 0);
    onChange(content);
  }, [onChange]);

  // 포커스 핸들러
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // 서식 명령 실행
  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  // 키보드 단축키 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editable) return;

    const isCtrl = e.ctrlKey || e.metaKey;
    
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
  }, [editable]);

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
      className={`p-2 rounded hover:bg-gray-600 transition-colors ${
        isActive ? 'bg-cyan-600 text-white' : 'text-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" />
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
          className="px-3 py-2 rounded hover:bg-gray-600 transition-colors text-gray-300 text-sm"
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
                className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
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
      <div className={`p-2 border-b ${cyberTheme.inputBorder} bg-gray-700 flex items-center gap-1 flex-wrap`}>
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
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        {/* 블록 타입 드롭다운 */}
        <BlockTypeDropdown />
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
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
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        {/* 목록 서식 */}
        <ToolbarButton 
          icon={ListBulletIcon} 
          command="insertUnorderedList" 
          title="글머리 기호 목록" 
        />
        <ToolbarButton 
          icon={ListBulletIcon} 
          command="insertOrderedList" 
          title="번호 매기기 목록" 
        />
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        {/* 정렬 서식 - 텍스트로 대체 */}
        <button
          onClick={() => execCommand('justifyLeft')}
          title="왼쪽 정렬"
          className="p-2 rounded hover:bg-gray-600 transition-colors text-gray-300 text-sm"
        >
          ←
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          title="가운데 정렬"
          className="p-2 rounded hover:bg-gray-600 transition-colors text-gray-300 text-sm"
        >
          ↔
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          title="오른쪽 정렬"
          className="p-2 rounded hover:bg-gray-600 transition-colors text-gray-300 text-sm"
        >
          →
        </button>
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
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
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`min-h-[400px] p-4 ${cyberTheme.textLight} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 ${
            !hasContent && !isFocused ? 'text-gray-500' : ''
          }`}
          style={{
            backgroundColor: 'rgb(31, 41, 55)', // gray-800
            color: 'rgb(209, 213, 219)', // gray-300
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