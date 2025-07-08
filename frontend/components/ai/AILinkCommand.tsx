"use client";

import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AILinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      // TODO: 실제 userId와 apiKey를 안전하게 가져와야 합니다.
      const userId = '60c72b2f9b1d8c001f8e4d1a'; // 임시 사용자 ID
      const apiKey = localStorage.getItem('openai_api_key') || ''; // 예시: 로컬 스토리지

      const res = await fetch('/api/ai-link/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': apiKey,
        },
        body: JSON.stringify({
          userId,
          aiLinkGoal: goal,
          targetModel: 'openai', // 현재는 openai로 고정
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
        onClick={() => setIsOpen(true)}
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
            <DialogDescription>
              달성하고 싶은 목표를 알려주세요. 당신의 지식 베이스를 활용하여 최적의 결과를 만들어 드립니다.
            </DialogDescription>
          </DialogHeader>
          
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

            <DialogFooter>
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