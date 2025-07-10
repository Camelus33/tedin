"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, KeyRound, Loader2, Sparkles } from 'lucide-react';

interface AILinkResponse {
  content: string;
  citations: { sourceContent: string }[];
}

type ProviderId = 'gemini' | 'openai' | 'claude' | 'perplexity';

// 최신(2025-07) 모델 라인업으로 업데이트
const modelRegistry = {
  gemini: {
    label: 'Gemini',
    models: [
      { id: 'gemini-2.5-flash-latest', name: '2.5 Flash (초고속)' },
      { id: 'gemini-2.5-pro-latest', name: '2.5 Pro (최고 품질)' },
    ],
  },
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (멀티모달/빠름)' },
      { id: 'gpt-4.1', name: 'GPT-4.1 (초장문/코딩)' },
      { id: 'o3', name: 'o3 (고급 추론)' },
      { id: 'o3-pro', name: 'o3-Pro (최고 성능)' },
    ],
  },
  claude: {
    label: 'Claude',
    models: [
      { id: 'claude-4-haiku', name: '4 Haiku (가장 빠름)' },
      { id: 'claude-4-sonnet', name: '4 Sonnet (균형)' },
      { id: 'claude-4-opus', name: '4 Opus (최고 성능)' },
    ],
  },
  perplexity: {
    label: 'Perplexity',
    models: [
      { id: 'llama-4-scout', name: 'Llama4 Scout (저비용)' },
      { id: 'llama-4-maverick', name: 'Llama4 Maverick (고성능)' },
    ],
  },
};

const examplePrompts = [
  '메모를 이용해 내 투자성향을 정밀분석해 줘',
  '내 지식 공백을 분석해 줘',
  '메모간의 숨은 연관성을 모두 찾아 줘',
];

export function AILinkCommand() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [goal, setGoal] = useState('');
  
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('gemini');
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRegistry.gemini.models[0].id);

  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [providerForApiKey, setProviderForApiKey] = useState<ProviderId | null>(
    null
  );
  const [apiKeyInput, setApiKeyInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AILinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ────────────────────────────────
   *  DRAGGABLE FAB (Floating Action Button)
   * --------------------------------------
   *  버튼 사이즈 / 초기 좌표 관리
   */
  const BUTTON_SIZE = 64; // h-16 w-16 (Tailwind 4rem)

  // 서버 사이드 렌더 단계에선 window가 없으므로 임시 값(좌측 상단)
  const [{ x, y }, setPos] = useState<{ x: number; y: number }>({ x: 32, y: 32 });

  // 마운트 시 실제 뷰포트 높이를 사용해 **좌측 하단**으로 스냅
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPos({ x: 32, y: window.innerHeight - BUTTON_SIZE - 32 });
    }
  }, []);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // 마우스/터치 move 핸들러 – window 단위로 등록 (drag 중)
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setPos({ x: clientX - dragOffsetRef.current.dx, y: clientY - dragOffsetRef.current.dy });
    };
    const handleUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragOffsetRef.current = { dx: clientX - x, dy: clientY - y };
    isDraggingRef.current = true;
  };

  const user = useSelector((state: RootState) => state.user);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  const isLoggedIn = user.isAuthenticated || hasToken;

  useEffect(() => {
    if (!isCommandOpen || !isLoggedIn) return;
    const storedProvider = localStorage.getItem('ai_link_provider') as ProviderId | null;
    const storedModelId = localStorage.getItem('ai_link_model_id');

    if (storedProvider && modelRegistry[storedProvider]) {
      setSelectedProvider(storedProvider);
      const providerModels = modelRegistry[storedProvider].models;
      if (storedModelId && providerModels.some(m => m.id === storedModelId)) {
        setSelectedModelId(storedModelId);
      } else {
        setSelectedModelId(providerModels[0].id);
      }
    }
  }, [isCommandOpen, isLoggedIn]);

  const handleProviderChange = (providerId: ProviderId) => {
    setSelectedProvider(providerId);
    const defaultModel = modelRegistry[providerId].models[0];
    setSelectedModelId(defaultModel.id);
    localStorage.setItem('ai_link_provider', providerId);
    localStorage.setItem('ai_link_model_id', defaultModel.id);
    checkApiKey(providerId);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    localStorage.setItem('ai_link_model_id', modelId);
    checkApiKey(selectedProvider);
  };

  const isVisible = useMemo(() => {
    if (!pathname) return false;
    const allowedPaths = [
      '/dashboard',
      '/books',
      '/myverse', // myverse도 도서관 관련 페이지일 수 있으므로 추가
    ];

    if (allowedPaths.includes(pathname)) {
      return true;
    }

    if (pathname.startsWith('/books/') || pathname.startsWith('/summary-notes/')) {
      return true;
    }
    
    return false;
  }, [pathname]);

  const checkApiKey = (providerId: ProviderId) => {
    const key = localStorage.getItem(`${providerId}_api_key`);
    if (!key) {
      setProviderForApiKey(providerId);
      // setIsApiKeyModalOpen(true); // 더 이상 별도 모달을 사용하지 않음
      setShowApiKeyForm(true); // 인라인 폼을 바로 보여줌
    }
  };

  const saveApiKey = () => {
    if (!providerForApiKey || !apiKeyInput) {
      toast.error("API 키를 입력해주세요.");
      return;
    }
    localStorage.setItem(`${providerForApiKey}_api_key`, apiKeyInput);
    toast.success(`${modelRegistry[providerForApiKey].label} API 키가 저장되었습니다.`);
    setShowApiKeyForm(false); // 폼 닫기
    setApiKeyInput('');
    setProviderForApiKey(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError(null);

    if (!isLoggedIn) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const apiKey = localStorage.getItem(`${selectedProvider}_api_key`);
      if (!apiKey) {
        checkApiKey(selectedProvider);
        throw new Error(
          `${modelRegistry[selectedProvider].label} API 키가 필요합니다.`
        );
      }

      const bearerToken = localStorage.getItem('token') || '';

      const res = await fetch('/api/ai-link/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': apiKey,
          ...(bearerToken ? { 'Authorization': `Bearer ${bearerToken}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id || undefined,
          aiLinkGoal: goal,
          targetProvider: selectedProvider,
          targetModel: selectedModelId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '알 수 없는 에러가 발생했습니다.');
      }

      const data: AILinkResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentModels = modelRegistry[selectedProvider]?.models || [];

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/*
        position: fixed  + inline style → 사용자 이동 좌표 적용
      */}
      <Button
        className="h-16 w-16 rounded-full shadow-lg z-50 cursor-pointer select-none"
        style={{ position: 'fixed', left: x, top: y }}
        size="icon"
        onClick={() => {
            if (!isLoggedIn) {
                toast.error('AI-Link 기능을 사용하려면 로그인이 필요합니다.');
                return;
            }
            setIsCommandOpen(true);
        }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <Sparkles className="h-8 w-8" />
      </Button>

      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="sm:max-w-[600px] flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="mr-2" />
              Ontology Command
            </DialogTitle>
            <DialogDescription>
              달성하고 싶은 목표를 구체적으로 알려주세요. 관련 메모가 많을수록 온톨로지 성능이 향상됩니다.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <Textarea
              id="goal"
              placeholder={
                `최근 남긴 투자관련 메모로 내 투자 판단의 흐름을 분석해 줘\n내가 놓치고 있는 지식 공백이 뭔지 알려줘\n지난 1주일간 내가 중요하게 여긴 주제를 분석해`
              }
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-grow"
              disabled={isLoading}
            />
            {/* 예시 버튼 제거: placeholder 자체에 3줄 예시 제공 */}
            <div className="flex gap-2 items-center">
              <Select
                value={selectedProvider}
                onValueChange={(v) => handleProviderChange(v as ProviderId)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modelRegistry).map(([id, { label }]) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedModelId}
                onValueChange={handleModelChange}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {currentModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showApiKeyForm && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50/80">
                <h3 className="font-semibold mb-2 text-sm text-gray-800">
                  {
                    modelRegistry[providerForApiKey || selectedProvider]
                      .label
                  }{' '}
                  API Key
                </h3>
                <Input
                  id="apiKeyInline"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowApiKeyForm(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button size="sm" onClick={saveApiKey}>
                    저장
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="mt-auto pt-4 flex justify-between items-center">
              <button
                type="button"
                title="API 키 수정"
                onClick={() => {
                  setProviderForApiKey(selectedProvider);
                  const storedKey =
                    localStorage.getItem(`${selectedProvider}_api_key`) || '';
                  setApiKeyInput(storedKey);
                  setShowApiKeyForm((prev) => !prev);
                }}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <KeyRound className="h-5 w-5 text-gray-500 hover:text-gray-800" />
              </button>
              <Button type="submit" disabled={isLoading || !goal}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    실행 중...
                  </>
                ) : (
                  '실행'
                )}
              </Button>
            </DialogFooter>
          </form>

          {error && (
            <div className="text-red-500 mt-4">
              <p>{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-4 border-t pt-4 overflow-y-auto">
              <h3 className="font-bold">결과</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {response.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 
        기존 별도 API Key Dialog는 인라인 폼으로 대체되었으므로 주석 처리 또는 삭제합니다.
        <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        ...
        </Dialog> 
      */}
    </>
  );
}