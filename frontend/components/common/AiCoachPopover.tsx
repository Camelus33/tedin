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
}

/**
 * 작은 팝오버 안에 ChatGPT / Gemini / Claude 세 개 아이콘 버튼을 배치.
 * 외부 라이브러리 없이 단순 absolute 포지셔닝으로 구현해 의존성 최소화.
 */
const AiCoachPopover: React.FC<AiCoachPopoverProps> = ({ memoText, onSelect, className }) => {
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
        toast.success('메모가 복사되었습니다! 새 탭에서 붙여넣기 해주세요.');
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
        toast.success('메모가 복사되었습니다! 새 탭에서 붙여넣기 해주세요.');
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
      >
        {/* 간단한 별 아이콘 대체 */}
        <svg
          className="w-4 h-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.974 2.883a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.882a1 1 0 00-1.176 0l-3.974 2.882c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.974-2.883c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.518-4.674z"
          />
        </svg>
      </Button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 z-50 mt-2 w-36 rounded-md border border-gray-700 bg-gray-800 shadow-lg p-2 flex items-center justify-between"
        >
          <button
            onClick={() => handleSelect('chatgpt')}
            aria-label="ChatGPT"
            title="ChatGPT"
            className="p-1.5 rounded hover:bg-gray-700/60 transition-colors"
          >
            <ChatGPTIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleSelect('gemini')}
            aria-label="Gemini"
            title="Gemini"
            className="p-1.5 rounded hover:bg-gray-700/60 transition-colors"
          >
            <GeminiIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleSelect('claude')}
            aria-label="Claude"
            title="Claude"
            className="p-1.5 rounded hover:bg-gray-700/60 transition-colors"
          >
            <ClaudeIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AiCoachPopover; 