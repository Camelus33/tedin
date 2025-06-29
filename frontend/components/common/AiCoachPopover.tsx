import React, { useState, useRef, useEffect } from 'react';
import { ChatGPTIcon, GeminiIcon, ClaudeIcon } from '../icons/AiModelIcons';
import Button from './Button';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

export type AiModelKey = 'chatgpt' | 'gemini' | 'claude';

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
 * 외부 라이브러리 없이 단순 absolute 포지셔닝으로 구현해 의존성 최소화.
 */
const AiCoachPopover: React.FC<AiCoachPopoverProps> = ({ memoText, onSelect, className, onCopySuccess }) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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
    };

    // 새 탭 열기 (사용자 팝업 차단 최소화를 위해 클릭 이벤트 컨텍스트 내에서 실행)
    window.open(urlMap[model], '_blank', 'noopener,noreferrer');

    onSelect(model);
    setOpen(false);
  };

  return (
    <div className={clsx('relative inline-block', className)}>
      <Button
        variant="outline"
        size={"icon" as any}
        aria-label="AI 코멘트 열기"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="h-9 w-9" // 지식카트 버튼보다 약간 크게
      >
        {/* 'AI' 텍스트로 변경 */}
        <span className="text-sm font-bold text-cyan-400">AI</span>
      </Button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 z-50 mt-2 w-52 rounded-md border-2 border-gray-600 bg-gray-800 shadow-lg p-3 flex flex-col items-center"
        >
          <div className="flex items-center justify-around w-full">
            <button
              onClick={() => handleSelect('chatgpt')}
              aria-label="ChatGPT"
              title="ChatGPT"
              className="p-2 rounded hover:bg-gray-700/60 transition-colors"
            >
              <ChatGPTIcon className="w-7 h-7" />
            </button>
            <button
              onClick={() => handleSelect('gemini')}
              aria-label="Gemini"
              title="Gemini"
              className="p-2 rounded hover:bg-gray-700/60 transition-colors"
            >
              <GeminiIcon className="w-7 h-7" />
            </button>
            <button
              onClick={() => handleSelect('claude')}
              aria-label="Claude"
              title="Claude"
              className="p-2 rounded hover:bg-gray-700/60 transition-colors"
            >
              <ClaudeIcon className="w-7 h-7" />
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-400 text-center px-2">
            모델 선택 시 클립보드 자동 복사
          </p>
        </div>
      )}
    </div>
  );
};

export default AiCoachPopover; 