"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, SparklesIcon, ChatBubbleLeftRightIcon, CalendarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/apiClient';
import useAuth from '@/hooks/useAuth';
import AIChatInterface from './AIChatInterface';

interface SearchResult {
  _id: string;
  content: string;
  tags: string[];
  createdAt: string;
  type: string;
  bookId?: string;
  importanceReason?: string;
  momentContext?: string;
  relatedKnowledge?: string;
  mentalImage?: string;
  comprehensionScore?: number;
  score: number;
  keywordScore?: number;
  vectorScore?: number;
  combinedScore?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  originalQuery: string;
  naturalLanguageInfo?: {
    type: 'date' | 'time' | 'datetime' | 'range' | 'comprehension';
    start?: Date;
    end?: Date;
    timeRange?: { start: string; end: string };
    comprehensionScore?: { min: number; max?: number; operator: 'gte' | 'lte' | 'eq' | 'range' };
    originalExpression: string;
  };
  searchQuery: string;
}

interface SearchFilters {
  strategy: 'weighted' | 'rrf' | 'hybrid';
  keywordWeight: number;
  vectorWeight: number;
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  completionStatus?: 'all' | 'complete' | 'incomplete';
}

interface HybridSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HybridSearchModal: React.FC<HybridSearchModalProps> = ({ isOpen, onClose }) => {
  const { user, isLoading: authLoading } = useAuth();
  
  console.log('🔍 HybridSearchModal 렌더링:', {
    user: user,
    authLoading: authLoading,
    userKeys: user ? Object.keys(user) : 'no user'
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    strategy: 'weighted',
    keywordWeight: 0.4,
    vectorWeight: 0.6,
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchResponse(null);
  };

  const handleSearch = async () => {
    console.log('🔍 사용자 정보 체크:', {
      user: user,
      userEmail: user?.email,
      userNickname: user?.nickname,
      isAuthenticated: user?.isAuthenticated,
      userObject: JSON.stringify(user, null, 2)
    });

    if (!query.trim()) {
      console.log('❌ 쿼리가 비어있음');
      return;
    }
    
    if (!user) {
      console.log('❌ 사용자 정보 없음');
      return;
    }

    if (!user.email) {
      console.log('❌ 사용자 이메일 없음');
      return;
    }

    console.log('🔍 검색 시작:', {
      query: query.trim(),
      userEmail: user.email,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    });

    setIsLoading(true);
    try {
      const response: SearchResponse = await apiClient.post('/memo-search/search', {
        query: query.trim(),
        userId: user.email,
        limit: 20,
        strategy: filters.strategy,
        keywordWeight: filters.keywordWeight,
        vectorWeight: filters.vectorWeight,
        useCache: true,
      });

      console.log('✅ 검색 성공:', response);
      setResults(response.results || []);
      setSearchResponse(response);
    } catch (error) {
      console.error('❌ 검색 오류:', error);
      console.error('Error details:', {
        message: (error as any).message,
        status: (error as any).status,
        errorData: (error as any).errorData
      });
      setResults([]);
      setSearchResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    if (score >= 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleAIChatToggle = () => {
    setShowAIChat(!showAIChat);
  };

  // AI 채팅 모드일 때는 다른 레이아웃 표시
  if (showAIChat) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl bg-secondary">
          <div className="flex flex-col max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIChatToggle}
                  className="ml-auto"
                >
                  검색창으로
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 min-h-0">
              <AIChatInterface
                searchResults={results}
                searchQuery={query}
                onClose={onClose}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="max-w-4xl bg-secondary">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-100">
              <SparklesIcon className="h-5 w-5 text-indigo-500" />
              Ontology Search
              <Badge variant="secondary" className="ml-2">
                Keyword + Vector
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* 검색 입력 영역 */}
          <div className="flex flex-col sm:flex-row gap-2 my-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="메모 내용, 태그, 또는 의미를 검색해보세요..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 text-white placeholder:text-gray-400"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={handleClearSearch}
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? '검색 중...' : '검색'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <FunnelIcon className="h-4 w-4" />
              필터
            </Button>
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">검색 옵션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">결합 전략</label>
                    <select
                      value={filters.strategy}
                      onChange={(e) => setFilters({ ...filters, strategy: e.target.value as any })}
                      className="w-full mt-1 p-2 border rounded-md bg-gray-800 border-gray-600"
                    >
                      <option value="weighted">가중치 기반</option>
                      <option value="rrf">RRF (Reciprocal Rank Fusion)</option>
                      <option value="hybrid">하이브리드</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">키워드 가중치</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={filters.keywordWeight}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        keywordWeight: parseFloat(e.target.value),
                        vectorWeight: 1 - parseFloat(e.target.value)
                      })}
                      className="w-full mt-1"
                    />
                    <span className="text-xs text-gray-400">{filters.keywordWeight}</span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">벡터 가중치</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={filters.vectorWeight}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        vectorWeight: parseFloat(e.target.value),
                        keywordWeight: 1 - parseFloat(e.target.value)
                      })}
                      className="w-full mt-1"
                    />
                    <span className="text-xs text-gray-400">{filters.vectorWeight}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 검색 결과 */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-2 text-gray-400">검색 중...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">
                    {results.length}개의 결과를 찾았습니다
                    {searchResponse?.naturalLanguageInfo && (
                      <span className="ml-2 text-indigo-400">
                        • {searchResponse.naturalLanguageInfo.originalExpression} 필터 적용
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleAIChatToggle}
                    className="bg-indigo-600 hover:bg-indigo-700 text-sm"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    AI Chat
                  </Button>
                </div>
                
                {/* 날짜/시간 정보 표시 */}
                {searchResponse?.naturalLanguageInfo && (
                  <Card className="bg-indigo-900/20 border-indigo-500/30">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-indigo-400" />
                        <span className="text-indigo-300 font-medium">
                          {searchResponse.naturalLanguageInfo.originalExpression}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">
                          {searchResponse.naturalLanguageInfo.type === 'date' && '날짜 검색'}
                          {searchResponse.naturalLanguageInfo.type === 'time' && '시간 검색'}
                          {searchResponse.naturalLanguageInfo.type === 'range' && '기간 검색'}
                          {searchResponse.naturalLanguageInfo.type === 'comprehension' && '이해도점수 검색'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {results.map((result) => (
                  <Card key={result._id} className="hover:bg-gray-800/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                        <div className="flex-1 mb-2 sm:mb-0">
                          <p className="text-sm text-gray-300 mb-1">{result.content}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                            <span>{formatDate(result.createdAt)}</span>
                            <span>•</span>
                            <span>{result.type}</span>
                            {result.comprehensionScore !== undefined && (
                              <>
                                <span>•</span>
                                <span className="text-blue-400">
                                  이해도: {result.comprehensionScore}점
                                </span>
                              </>
                            )}
                            {result.tags && result.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex gap-1 flex-wrap">
                                  {result.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {result.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{result.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-4">
                          {result.combinedScore && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getScoreColor(result.combinedScore)}`}
                            >
                              {(result.combinedScore * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* 점수 상세 정보 */}
                      {(result.keywordScore !== undefined || result.vectorScore !== undefined) && (
                        <div className="flex gap-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                          {result.keywordScore !== undefined && (
                            <span>키워드: {(result.keywordScore * 100).toFixed(0)}%</span>
                          )}
                          {result.vectorScore !== undefined && (
                            <span>벡터: {(result.vectorScore * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      )}
                      
                      {/* 책 링크 아이콘 */}
                      {result.bookId && (
                        <div className="flex justify-end mt-2 pt-2 border-t border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                            onClick={() => window.open(`/books/${result.bookId}`, '_blank')}
                            title="책 상세페이지로 이동"
                          >
                            <BookOpenIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No results found
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Enjoy Ontology Search!
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HybridSearchModal; 