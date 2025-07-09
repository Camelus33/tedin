"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Bot, ChevronDown, Loader2, Sparkles } from 'lucide-react';

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

export function AILinkCommand() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [goal, setGoal] = useState('');
  
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('gemini');
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRegistry.gemini.models[0].id);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [providerForApiKey, setProviderForApiKey] = useState<ProviderId | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AILinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ────────────────────────────────
   *  DRAGGABLE FAB (Floating Action Button)
   * --------------------------------------
   *  버튼을 사용자가 자유롭게 끌어서 위치를 변경할 수 있습니다.
   *  초기 위치는 **좌측 하단** 32px 마진으로 지정합니다.
   */
  const defaultPos = typeof window !== 'undefined'
    ? { x: 32, y: window.innerHeight - 80 /* btn h */ - 32 } // bottom-left
    : { x: 0, y: 0 };

  const [{ x, y }, setPos] = useState<{ x: number; y: number }>(defaultPos);
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

  const checkApiKey = (providerId: ProviderId) => {
    const key = localStorage.getItem(`${providerId}_api_key`);
    if (!key) {
      setProviderForApiKey(providerId);
      setIsApiKeyModalOpen(true);
    }
  };

  const saveApiKey = () => {
    if (!providerForApiKey || !apiKeyInput) {
      toast.error("API 키를 입력해주세요.");
      return;
    }
    localStorage.setItem(`${providerForApiKey}_api_key`, apiKeyInput);
    toast.success(`${modelRegistry[providerForApiKey].label} API 키가 저장되었습니다.`);
    setIsApiKeyModalOpen(false);
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
        throw new Error(`${modelRegistry[selectedProvider].label} API 키가 필요합니다.`);
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

  return (
    <>
      {/*
        position: fixed  + inline style → 사용자 이동 좌표 적용
      */}
      <Button
        className="h-16 w-16 rounded-full shadow-lg z-50"
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
              AI-Link Command
            </DialogTitle>
            <DialogDescription>
              달성하고 싶은 목표를 알려주세요. 구체적인 목표, 특정 메모와 AI 모델을 설정하여 최고의 퍼포먼스를 경험하세요
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <Textarea
              id="goal"
              placeholder="예) 내 지식 공백을 분석해 줘 / 나에게 보이지 않는 메모, 책 등 숨겨진 모든 연결을 찾아 줘"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-grow mb-4"
              disabled={isLoading}
            />
            <DialogFooter className="mt-4 flex flex-row justify-between items-center">
              <div className="flex gap-2 items-center">
                <Select value={selectedProvider} onValueChange={(v) => handleProviderChange(v as ProviderId)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(modelRegistry).map(([id, { label }]) => (
                      <SelectItem key={id} value={id}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedModelId} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading || !goal}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    실행 중...
                  </>
                ) : '실행'}
              </Button>
            </DialogFooter>
          </form>

          {error && <div className="text-red-500 mt-4"><p>{error}</p></div>}
          
          {response && (
             <div className="mt-4 border-t pt-4 overflow-y-auto">
                <h3 className="font-bold">결과</h3>
                <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{response.content}</div>
             </div>
           )}

        </DialogContent>
      </Dialog>
      
      <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modelRegistry[providerForApiKey!]?.label} API Key 입력</DialogTitle>
            <DialogDescription>
              선택하신 모델을 사용하려면 API 키가 필요합니다. 키는 당신의 브라우저(로컬 스토리지)에만 안전하게 저장됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="apiKey"
              placeholder="sk-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyModalOpen(false)}>취소</Button>
            <Button onClick={saveApiKey}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}