"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/apiClient';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  llmModel?: string;
  llmProvider?: string;
  searchContext?: {
    query: string;
    results: any[];
  };
}

interface LLMProvider {
  name: string;
  model: string;
  apiKey: string;
  isConfigured: boolean;
}

interface RecommendationQuery {
  id: string;
  text: string;
  relevance: number;
}

interface AIChatInterfaceProps {
  searchResults: any[];
  searchQuery: string;
  onClose: () => void;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ 
  searchResults, 
  searchQuery, 
  onClose 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationQuery[]>([]);
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider | null>(null);
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [llmProviders, setLlmProviders] = useState<LLMProvider[]>([
    { name: 'ChatGPT', model: 'gpt-4o', apiKey: '', isConfigured: false },
    { name: 'Claude', model: 'claude-sonnet-4.0', apiKey: '', isConfigured: false },
    { name: 'Gemini', model: 'gemini-2.5-flash', apiKey: '', isConfigured: false }
  ]);

  // 간단한 프리셋 모델 목록 (사용자는 언제든 커스텀 입력 가능)
  const modelPresets: Record<string, string[]> = {
    ChatGPT: ['gpt-5', 'gpt-4o'],
    Claude: ['claude-sonnet-4.0', 'claude-opus-4.1'],
    Gemini: ['gemini-2.5-pro', 'gemini-2.5-flash']
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recsScrollRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Load API keys from localStorage on mount
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('habitus33_llm_api_keys');
      const savedModels = localStorage.getItem('habitus33_llm_models');
      if (savedKeys) {
        const parsedKeys: Record<string, string> = JSON.parse(savedKeys);
        const parsedModels: Record<string, string> = savedModels ? JSON.parse(savedModels) : {};
        setLlmProviders(prevProviders => {
          const updatedProviders = prevProviders.map(provider => {
            if (parsedKeys[provider.name]) {
              return {
                ...provider,
                apiKey: parsedKeys[provider.name],
                isConfigured: true,
                model: parsedModels[provider.name] || provider.model,
              };
            }
            return provider;
          });

          const firstConfigured = updatedProviders.find(p => p.isConfigured);
          if (firstConfigured) {
            setSelectedLLM(firstConfigured);
          }
          return updatedProviders;
        });
      }
    } catch (error) {
      console.error("Failed to load LLM API keys from localStorage:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 설정 패널 토글 시 자동 스크롤
  useEffect(() => {
    if (showLLMSettings) {
      settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showLLMSettings]);

  // 초기 컨텍스트 메시지 생성
  useEffect(() => {
    if (searchResults.length > 0 && searchQuery) {
      const contextMessage: Message = {
        id: 'context',
        content: `검색 결과를 기반으로 AI와 대화할 수 있습니다. "${searchQuery}"에 대한 ${searchResults.length}개의 메모를 찾았습니다.`,
        sender: 'ai',
        timestamp: new Date(),
        searchContext: {
          query: searchQuery,
          results: searchResults
        }
      };
      setMessages([contextMessage]);
      generateRecommendations();
    }
  }, [searchResults, searchQuery]);

  // 데스크톱 마우스 드래그로 추천 쿼리 영역 좌우 스크롤
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !recsScrollRef.current) return;
      const dx = e.pageX - dragStartXRef.current;
      if (Math.abs(dx) > 5) hasDraggedRef.current = true;
      recsScrollRef.current.scrollLeft = scrollStartLeftRef.current - dx;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      // 드래그 종료 후 즉시 클릭이 발생해도 무시되도록 한 틱 뒤 리셋
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleRecsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!recsScrollRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX;
    scrollStartLeftRef.current = recsScrollRef.current.scrollLeft;
    hasDraggedRef.current = false;
    e.preventDefault();
  };

  // 추천 쿼리 생성
  const generateRecommendations = async () => {
    if (!searchResults.length) return;

    try {
      const response = await apiClient.post('/ai-chat/recommendations', {
        searchQuery,
        searchResults: searchResults.slice(0, 5) // 상위 5개 결과만 사용
      });

      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('추천 쿼리 생성 오류:', error);
    }
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedLLM || !selectedLLM.isConfigured) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/ai-chat/send', {
        message: inputMessage,
        searchContext: { query: searchQuery, results: searchResults },
        llmProvider: selectedLLM.name,
        llmModel: selectedLLM.model,
        userApiKey: selectedLLM.apiKey,
        conversationId: 'temp'
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
        llmModel: response.model,
        llmProvider: response.provider,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 새로운 추천 쿼리 생성
      setTimeout(generateRecommendations, 1000);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 추천 쿼리 클릭
  const handleRecommendationClick = (recommendation: RecommendationQuery) => {
    setInputMessage(recommendation.text);
  };

  const handleSelectLLM = (provider: LLMProvider) => {
    if (provider.isConfigured) {
      setSelectedLLM(provider);
    } else {
      toast.error(`${provider.name} 모델의 API 키가 설정되지 않았습니다.`);
    }
  };

  // LLM 설정 및 localStorage에 저장
  const handleLLMConfig = (provider: LLMProvider, apiKey: string) => {
    const updatedProviders = llmProviders.map(p =>
      p.name === provider.name
        ? { ...p, apiKey, isConfigured: !!apiKey.trim() }
        : p
    );
    setLlmProviders(updatedProviders);

    // If the currently selected provider's key is removed, deselect it.
    if (selectedLLM?.name === provider.name && !apiKey.trim()) {
      setSelectedLLM(null);
    }
    
    try {
      const currentKeys = JSON.parse(localStorage.getItem('habitus33_llm_api_keys') || '{}');
      currentKeys[provider.name] = apiKey;
      localStorage.setItem('habitus33_llm_api_keys', JSON.stringify(currentKeys));
    } catch (error) {
      console.error("Failed to save LLM API key to localStorage:", error);
    }
  };

  const handleModelChange = (provider: LLMProvider, model: string) => {
    const updated = llmProviders.map(p =>
      p.name === provider.name ? { ...p, model } : p
    );
    setLlmProviders(updated);
    // 현재 선택된 공급자의 모델이 변경되면 선택 상태도 즉시 동기화
    if (selectedLLM?.name === provider.name) {
      setSelectedLLM({ ...provider, model });
    }
    try {
      const currentModels = JSON.parse(localStorage.getItem('habitus33_llm_models') || '{}');
      currentModels[provider.name] = model;
      localStorage.setItem('habitus33_llm_models', JSON.stringify(currentModels));
    } catch (error) {
      console.error('Failed to save LLM model to localStorage:', error);
    }
  };

  // 채팅 복사
  const copyChat = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('메시지가 복사되었습니다.');
  };

  // 채팅 저장
  const saveChat = async (messagesToSave: Message[]) => {
    try {
      await apiClient.post('/ai-chat/save', {
        messages: messagesToSave,
        searchContext: { query: searchQuery, results: searchResults },
        userId: user?.id
      });
      toast.success('채팅이 저장되었습니다.');
    } catch (error) {
      console.error('채팅 저장 오류:', error);
      toast.error('채팅 저장에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full min-h-0 bg-secondary">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
          <span className="font-medium text-white">Ontology Agent</span>
        </div>
        <div className="flex items-center gap-2">
          {llmProviders.filter(p => p.isConfigured).map(provider => (
            <Button
              key={provider.name}
              variant={selectedLLM?.name === provider.name ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleSelectLLM(provider)}
              className={`text-xs ${selectedLLM?.name === provider.name ? 'font-bold' : ''}`}
            >
              {provider.name}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLLMSettings(!showLLMSettings)}
            className="flex items-center gap-1"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            설정
          </Button>
        </div>
      </div>

      {/* LLM 설정 */}
      {showLLMSettings && (
        <div ref={settingsRef} className="m-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto rounded-md">
          <Card>
            <CardContent className="p-4">
            <h3 className="font-medium mb-3">AI 모델 설정</h3>
            <div className="space-y-3">
              {llmProviders.map((provider) => (
                <div key={provider.name} className="flex flex-col gap-2 rounded-md border border-gray-700 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{provider.name}</label>
                      <Input
                        type="password"
                        placeholder="API 키를 입력하세요"
                        value={provider.apiKey}
                        onChange={(e) => handleLLMConfig(provider, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Badge 
                      variant={provider.isConfigured ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {provider.isConfigured ? '설정됨' : '미설정'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">모델 (프리셋)</label>
                      <Select value={provider.model} onValueChange={(val) => handleModelChange(provider, val)}>
                        <SelectTrigger className="h-8 mt-1">
                          <SelectValue placeholder="모델 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {(modelPresets[provider.name] || []).map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                          <SelectItem value={provider.model}>현재: {provider.model}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">모델 (직접 입력)</label>
                      <Input
                        placeholder="예: gpt-4o, claude-3-5-sonnet-latest, gemini-1.5-pro"
                        value={provider.model}
                        onChange={(e) => handleModelChange(provider, e.target.value)}
                        className="h-8 mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">공식 문서에서 최신 모델명을 확인해 입력하세요. 잘못된 모델명을 입력하면 호출이 실패할 수 있습니다.</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* 메시지 영역 */}
      <div 
        className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex group ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.sender === 'ai' && (
                  <SparklesIcon className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.llmModel && (
                    <p className="text-xs text-gray-400 mt-1">
                      {message.llmModel}
                    </p>
                  )}
                </div>
              </div>
              {message.sender === 'ai' && (
                <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyChat(message.content)}>
                    <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveChat([message])}>
                    <SparklesIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
                <span className="text-sm text-gray-300">AI가 응답을 생성하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 추천 쿼리 */}
      {recommendations.length > 0 && (
        <div className="p-4 border-t border-gray-700 min-w-0">
          <h4 className="text-xs font-medium text-gray-300 mb-1">맥락기반 추천 질문</h4>
          <div
            ref={recsScrollRef}
            className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x snap-mandatory overscroll-x-contain cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleRecsMouseDown}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {recommendations.map((rec) => (
              <Button
                key={rec.id}
                variant="outline"
                size="sm"
                onClick={() => { if (hasDraggedRef.current) return; handleRecommendationClick(rec); }}
                className="text-xs py-0.5 px-2 h-auto flex-shrink-0 whitespace-nowrap snap-start"
              >
                <span className="mr-1">💡</span>
                <span className="block max-w-[80vw] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-none">{rec.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/75 sm:static sm:bg-transparent sm:backdrop-blur-0 sm:supports-[backdrop-filter]:bg-transparent">
        <div className="flex gap-2">
          <Input
            placeholder={
              !llmProviders.some(p => p.isConfigured)
                ? "AI 모델을 설정해주세요"
                : !selectedLLM
                ? "사용할 AI 모델을 선택해주세요"
                : "AI와 대화해보세요..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!selectedLLM || isLoading}
            className="flex-1 text-white placeholder:text-gray-300"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !selectedLLM || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </div>
        {!selectedLLM?.isConfigured && (
          <p className="text-xs text-gray-400 mt-1">
            AI와 대화하려면 상단의 설정 버튼을 클릭하여 API 키를 입력해주세요.
          </p>
        )}
      </div>
    </div>
  );
};

export default AIChatInterface; 