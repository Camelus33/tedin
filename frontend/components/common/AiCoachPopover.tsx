import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChatGPTIcon, GeminiIcon, ClaudeIcon } from '../icons/AiModelIcons';
import Button from './Button';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export type AiModelKey = 'chatgpt' | 'gemini' | 'claude' | 'perplexity';

interface AiCoachPopoverProps {
  /** 클립보드에 복사할 메모 원문 */
  memoText: string;
  /** 모델 선택 후 상위 컴포넌트에 알림 */
  onSelect: (model: AiModelKey) => void;
  /** 추가 클래스 */
  className?: string;
  /** 복사 성공 콜백 */
  onCopySuccess?: () => void;
}

/**
 * 작은 팝오버 안에 ChatGPT / Gemini / Claude 세 개 아이콘 버튼을 배치.
 * Portal을 사용하여 DOM 최상위에 렌더링하여 컨테이너 제약을 해결.
 */
const AiCoachPopover: React.FC<AiCoachPopoverProps> = ({ memoText, onSelect, className, onCopySuccess }) => {
  const [open, setOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 팝오버 위치 계산 (화면 경계 감지)
  useEffect(() => {
    if (open && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const popoverHeight = 120; // 팝오버 예상 높이
      
      // 버튼 아래쪽 공간이 부족하면 위로 표시
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const shouldShowAbove = spaceBelow < popoverHeight && buttonRect.top > popoverHeight;
      
      setShowAbove(shouldShowAbove);
      
      // 팝업 위치 계산
      const left = buttonRect.left + (buttonRect.width / 2);
      const top = shouldShowAbove 
        ? buttonRect.top - 10 // 위쪽에 표시
        : buttonRect.bottom + 10; // 아래쪽에 표시
      
      setPopoverPosition({ top, left });
    }
  }, [open]);

  const copyToClipboard = async (text: string) => {
    // 우선 Clipboard API 시도
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('메모가 클립보드에 복사되었습니다! 🎯', {
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#10b981',
            border: '1px solid #10b981',
          },
        });
        onCopySuccess?.();
        return true;
      } catch {
        /* ignore and fallback */
      }
    }

    // Fallback: textarea + execCommand
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        toast.success('메모가 클립보드에 복사되었습니다! 🎯', {
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#10b981',
            border: '1px solid #10b981',
          },
        });
        onCopySuccess?.();
        return true;
      }
    } catch {
      /* ignore */
    }

    // 마지막 대응: 프롬프트 표시
    toast.error('자동 복사에 실패했습니다. 텍스트를 직접 복사해주세요.');
    window.prompt('자동 복사에 실패했습니다. 아래 내용을 직접 복사하세요:', text);
    return false;
  };

  const handleSelect = async (model: AiModelKey) => {
    await copyToClipboard(memoText);

    // 모델별 URL 매핑
    const urlMap: Record<AiModelKey, string> = {
      chatgpt: 'https://chat.openai.com',
      gemini: 'https://gemini.google.com',
      claude: 'https://claude.ai',
      perplexity: 'https://perplexity.ai',
    };

    // 새 탭 열기 (사용자 팝업 차단 최소화를 위해 클릭 이벤트 컨텍스트 내에서 실행)
    window.open(urlMap[model], '_blank', 'noopener,noreferrer');

    onSelect(model);
    setOpen(false);
  };

  // Portal을 사용하여 팝업 렌더링
  const renderPopover = () => {
    if (!open) return null;

    return createPortal(
      <div
        ref={popoverRef}
        className="fixed z-[9999] w-auto lg:w-52 max-w-[90vw] lg:max-w-none rounded-md border-2 border-gray-600 bg-gray-800 shadow-lg p-2 lg:p-3 flex flex-col items-center"
        style={{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="flex items-center justify-around w-full gap-1 lg:gap-0">
          <button
            onClick={() => handleSelect('chatgpt')}
            aria-label="ChatGPT"
            title="ChatGPT"
            className="p-2 lg:p-2 rounded hover:bg-gray-700/60 transition-colors min-w-[44px] min-h-[44px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
          >
            <ChatGPTIcon className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={() => handleSelect('gemini')}
            aria-label="Gemini"
            title="Gemini"
            className="p-2 lg:p-2 rounded hover:bg-gray-700/60 transition-colors min-w-[44px] min-h-[44px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
          >
            <GeminiIcon className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={() => handleSelect('claude')}
            aria-label="Claude"
            title="Claude"
            className="p-2 lg:p-2 rounded hover:bg-gray-700/60 transition-colors min-w-[44px] min-h-[44px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
          >
            <ClaudeIcon className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={() => handleSelect('perplexity')}
            aria-label="Perplexity"
            title="Perplexity"
            className="p-2 lg:p-2 rounded hover:bg-gray-700/60 transition-colors min-w-[44px] min-h-[44px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
          >
            <Image
              src="/images/perplexity-color.svg"
              alt="Perplexity AI"
              width={20}
              height={20}
              className="lg:w-6 lg:h-6"
            />
          </button>
        </div>
        <p className="mt-2 lg:mt-4 text-xs text-gray-400 text-center px-1 lg:px-2">
          모델 선택 시 클립보드 자동 복사
        </p>
      </div>,
      document.body
    );
  };

  return (
    <div className={clsx('relative', className)}>
      <div ref={buttonRef}>
        <Button
          variant="outline"
          size={"icon" as any}
          aria-label="AI 코멘트 열기"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" // 고정 크기로 설정
        >
          {/* 'AI' 텍스트로 변경 */}
          <span className="text-xs sm:text-sm font-bold text-cyan-400">AI</span>
        </Button>
      </div>

      {renderPopover()}
    </div>
  );
};

export default AiCoachPopover; 