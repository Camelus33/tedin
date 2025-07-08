"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux'; // Redux 훅 임포트
import { RootState } from '@/store/store'; // Redux 스토어 타입 임포트
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, Sparkles } from 'lucide-react';

// API 응답 타입 (임시)
interface AILinkResponse {
  content: string;
  citations: { sourceContent: string }[];
}

export function AILinkCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState('');
  // 2-step 흐름 상태: 'key' 단계 또는 'goal' 단계
  const [currentStep, setCurrentStep] = useState<'key' | 'goal'>('key');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const modelOptions = [
    { id: 'openai', label: 'OpenAI' },
    { id: 'claude', label: 'Claude' },
    { id: 'gemini', label: 'Gemini' },
    { id: 'perplexity', label: 'Perplexity' },
    { id: 'midjourney', label: 'Midjourney' },
  ] as const;
  type ModelId = typeof modelOptions[number]['id'];
  const [selectedModel, setSelectedModel] = useState<ModelId>('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AILinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 최초 렌더 시 로컬스토리지에 저장된 키가 있으면 바로 Goal 단계로 전환
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedModel = (localStorage.getItem('ai_link_model') as ModelId) || 'openai';
    setSelectedModel(storedModel);
    const storedKey = localStorage.getItem(`${storedModel}_api_key`);
    if (storedKey) {
      setApiKeyInput(storedKey);
      setCurrentStep('goal');
    }
  }, []);

  // Redux 스토어에서 사용자 정보 가져오기
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = user.isAuthenticated;
  const userId = user.id;

  // 로컬 스토리지 토큰도 확인하여 로그인 상태를 보완적으로 판단
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  const isLoggedIn = isAuthenticated || hasToken;

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
      // TODO: apiKey를 안전하게 관리해야 합니다. (예: 서버에서 관리)
      const apiKey = localStorage.getItem(`${selectedModel}_api_key`) || '';

      const bearerToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

      const res = await fetch('/api/ai-link/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': apiKey,
          ...(bearerToken ? { 'Authorization': `Bearer ${bearerToken}` } : {}),
        },
        body: JSON.stringify({
          ...(userId ? { userId } : {}),
          aiLinkGoal: goal,
          targetModel: selectedModel,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <Button
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => {
            if (!isLoggedIn) {
                // TODO: 로그인 페이지로 유도하는 더 나은 UX 필요
                alert('AI-Link 기능을 사용하려면 로그인이 필요합니다.');
                return;
            }
    // 플로팅 버튼을 클릭할 때마다 저장된 키 유무를 확인 후 단계 설정
    const storedModel = (typeof window !== 'undefined' ? localStorage.getItem('ai_link_model') : null) as ModelId | null;
    setSelectedModel(storedModel || 'openai');
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem(`${storedModel || 'openai'}_api_key`) : null;
    setCurrentStep(storedKey ? 'goal' : 'key');
    setIsOpen(true);
        }}
      >
        <Sparkles className="h-8 w-8" />
      </Button>

      {/* AI-Link 커맨드 창 (모달) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="mr-2" />
              AI-Link Command
            </DialogTitle>
            {currentStep === 'key' ? (
              <DialogDescription>
                처음 사용 시, OpenAI 등 사용하실 AI 모델의 API Key를 입력해 주세요. 로컬 스토리지에만 저장되며 서버로 전송되지 않습니다.
              </DialogDescription>
            ) : (
              <DialogDescription>
                달성하고 싶은 목표를 알려주세요. 당신의 지식 베이스를 활용하여 최적의 결과를 만들어 드립니다.
              </DialogDescription>
            )}
          </DialogHeader>

          {currentStep === 'key' && (
            <>
              <div className="grid gap-4 py-4">
                {/* 모델 선택 토글 */}
                <div className="flex flex-wrap gap-2">
                  {modelOptions.map((m) => (
                    <Button
                      key={m.id}
                      type="button"
                      variant={selectedModel === m.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedModel(m.id);
                        const existingKey = typeof window !== 'undefined' ? localStorage.getItem(`${m.id}_api_key`) : '';
                        setApiKeyInput(existingKey || '');
                      }}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
                {/* API Key 입력 */}
                <Input
                  id="apiKey"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    if (!apiKeyInput) {
                      setError('API Key를 입력해주세요.');
                      return;
                    }
                    localStorage.setItem(`${selectedModel}_api_key`, apiKeyInput);
                    localStorage.setItem('ai_link_model', selectedModel);
                    toast.success('API Key가 저장되었습니다.');
                    setError(null);
                    setCurrentStep('goal');
                  }}
                  disabled={isLoading}
                >
                  저장
                </Button>
              </DialogFooter>
            </>
          )}

          {currentStep === 'goal' && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <Textarea
                  id="goal"
                  placeholder="예: 내 메모들을 바탕으로 '머신러닝'에 대한 블로그 글 초안을 작성해줘."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <DialogFooter className="flex-col items-stretch gap-2">
                <div className="self-end flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCurrentStep('key');
                    }}
                  >
                    API Key 재설정
                  </Button>
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
                </div>
              </DialogFooter>
            </form>
          )}

          {/* 결과 표시 영역 */}
          {response && (
            <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2">AI 응답:</h3>
                <p className="text-sm bg-secondary p-4 rounded-md whitespace-pre-wrap">{response.content}</p>
                {response.citations && response.citations.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-xs text-muted-foreground mb-2">인용된 컨텍스트:</h4>
                        <ul className="list-disc pl-5 text-xs text-muted-foreground">
                            {response.citations.map((cite, index) => (
                                <li key={index} className="truncate">"{cite.sourceContent}"</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          )}

          {error && (
            <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold text-red-500 mb-2">에러 발생:</h3>
                <p className="text-sm bg-destructive/10 text-destructive p-4 rounded-md">{error}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 