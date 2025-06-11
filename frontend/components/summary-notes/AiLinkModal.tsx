'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RocketIcon, CheckIcon, ClipboardIcon, XIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface AiLinkModalProps {
  summaryNoteId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Branding Guideline Colors
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/80',
  borderPrimary: 'border-cyan-500/50',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-purple-600',
  buttonSecondaryHoverBg: 'hover:bg-purple-700',
};

export function AiLinkModal({ summaryNoteId, isOpen, onOpenChange }: AiLinkModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/summary-notes/${summaryNoteId}/public-link`);
      const { shareId } = response.data;
      if (shareId) {
        const fullUrl = `${window.location.origin}/share/${shareId}`;
        setGeneratedUrl(fullUrl);
        toast.success('당신의 지식을 나눌 준비가 되었습니다.');
      }
    } catch (error) {
      console.error('Failed to generate AI link:', error);
      
      let message = '잠시 후 다시 시도해주세요. 당신의 리듬을 응원합니다.';
      
      if (error instanceof AxiosError && error.response) {
        switch (error.response.status) {
          case 401:
            message = "다시 로그인 후 시도해주세요. 당신의 자리를 지켜드릴게요.";
            break;
          case 403:
            message = "이 노트를 공유할 수 있는 권한을 확인해주세요.";
            break;
          case 404:
            message = "요청하신 노트를 찾을 수 없습니다. 사라진 것은 아니니 걱정마세요.";
            break;
          case 500:
          default:
            message = "서버에 잠시 연결할 수 없습니다. 괜찮습니다, 잠시 후에 다시 시도해주세요.";
            break;
        }
      } else if (error instanceof Error && error.message.includes('Network Error')) {
        message = "네트워크 연결을 확인해주세요. 인터넷이 연결되어 있나요?";
      }
      
      toast.error(message, { duration: 4000 });

    } finally {
      setIsLoading(false);
    }
  }, [summaryNoteId]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };
  
  // Reset state when modal is closed
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setGeneratedUrl('');
        setIsLoading(false);
        setIsCopied(false);
      }, 300); // Allow for closing animation
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className={`${cyberTheme.cardBg} ${cyberTheme.borderPrimary} text-gray-200 border`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center justify-center space-x-2 ${cyberTheme.primary} text-lg`}>
            <RocketIcon className="h-5 w-5" />
            <span>AI 링크 생성</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-4 text-center">
            AI가 당신의 노트를 더 깊이 이해하도록<br/>특별한 링크를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {generatedUrl ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">링크 생성 성공! 복사하세요.</p>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={generatedUrl}
                  className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} text-cyan-300`}
                />
                <Button 
                  size="icon" 
                  onClick={handleCopyToClipboard} 
                  className={`${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg}`}
                >
                  {isCopied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-300">
                NotebookLM, Gemini 등 AI에게 공유하여<br/>더 풍부한 답변을 얻어보세요.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          {!generatedUrl && (
             <Button
                onClick={handleGenerateLink}
                disabled={isLoading}
                className={`w-full ${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}
              >
                {isLoading ? (
                   <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2"></span>
                ) : (
                  <RocketIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? '생성 중...' : '링크 생성'}
              </Button>
          )}
           <Button variant="outline" onClick={() => handleModalOpenChange(false)} className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300">
              닫기
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 