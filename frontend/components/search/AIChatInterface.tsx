"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    { name: 'ChatGPT', model: 'gpt-4', apiKey: '', isConfigured: false },
    { name: 'Claude', model: 'claude-3-sonnet', apiKey: '', isConfigured: false },
    { name: 'Gemini', model: 'gemini-pro', apiKey: '', isConfigured: false }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API keys from localStorage on mount
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('habitus33_llm_api_keys');
      if (savedKeys) {
        const parsedKeys: Record<string, string> = JSON.parse(savedKeys);
        
        setLlmProviders(prevProviders => {
          const updatedProviders = prevProviders.map(provider => {
            if (parsedKeys[provider.name]) {
              return {
                ...provider,
                apiKey: parsedKeys[provider.name],
                isConfigured: true,
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

  // LLM 설정 및 localStorage에 저장
  const handleLLMConfig = (provider: LLMProvider, apiKey: string) => {
    const updatedProviders = llmProviders.map(p =>
      p.name === provider.name
        ? { ...p, apiKey, isConfigured: !!apiKey.trim() }
        : p
    );
    setLlmProviders(updatedProviders);

    if (apiKey.trim()) {
      setSelectedLLM({ ...provider, apiKey, isConfigured: true });
    } else if (selectedLLM?.name === provider.name) {
      // 키가 삭제된 경우 선택 해제
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

  // 채팅 복사
  const copyChat = () => {
    const chatText = messages
      .map(msg => `${msg.sender === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(chatText);
  };

  // 채팅 저장
  const saveChat = async () => {
    try {
      await apiClient.post('/ai-chat/save', {
        messages,
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
    <div className="flex flex-col h-full bg-gray-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
          <span className="font-medium text-white">Ontology Agent</span>
          {selectedLLM && (
            <Badge variant="secondary" className="text-xs">
              {selectedLLM.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLLMSettings(!showLLMSettings)}
            className="flex items-center gap-1"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            설정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyChat}
            className="flex items-center gap-1"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            복사
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveChat}
            className="flex items-center gap-1"
          >
            <SparklesIcon className="h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      {/* LLM 설정 */}
      {showLLMSettings && (
        <Card className="m-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">AI 모델 설정</h3>
            <div className="space-y-3">
              {llmProviders.map((provider) => (
                <div key={provider.name} className="flex items-center gap-3">
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 ai-chat-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">추천 질문</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec) => (
              <Button
                key={rec.id}
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationClick(rec)}
                className="text-xs"
              >
                💡 {rec.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            placeholder={
              selectedLLM?.isConfigured 
                ? "AI와 대화해보세요..." 
                : "AI 모델을 설정해주세요"
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!selectedLLM?.isConfigured || isLoading}
            className="flex-1 text-white placeholder:text-gray-300"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !selectedLLM?.isConfigured || isLoading}
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