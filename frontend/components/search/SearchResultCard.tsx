"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// HybridSearchModal.tsx 에서 가져온 타입 정의
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

interface SearchResultCardProps {
  result: SearchResult;
}

// Helper functions
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

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="hover:bg-gray-800/50 transition-colors">
      <CardContent className="p-4">
        {/* Main Content Area */}
        <div className="flex justify-between items-start gap-4">
          <p className="flex-1 text-base font-medium text-gray-100">{result.content}</p>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {result.combinedScore && (
              <Badge
                variant="secondary"
                className={`text-sm ${getScoreColor(result.combinedScore)}`}
              >
                {(result.combinedScore * 100).toFixed(0)}%
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-indigo-400"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "상세 정보 닫기" : "상세 정보 열기"}
            >
              <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Collapsible Details Area */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-gray-700 space-y-3">
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
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
            </div>
            
            {/* Tags row */}
            {result.tags && result.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                    {result.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                    </Badge>
                    ))}
                </div>
            )}

            {/* Scores row */}
            {(result.keywordScore !== undefined || result.vectorScore !== undefined) && (
              <div className="flex gap-4 text-xs text-gray-500">
                {result.keywordScore !== undefined && (
                  <span>키워드: {(result.keywordScore * 100).toFixed(0)}%</span>
                )}
                {result.vectorScore !== undefined && (
                  <span>벡터: {(result.vectorScore * 100).toFixed(0)}%</span>
                )}
              </div>
            )}
            
            {/* Book link */}
            {result.bookId && (
              <div className="flex justify-end pt-2 border-t border-gray-700/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                  onClick={() => window.open(`/books/${result.bookId}`, '_blank')}
                  title="책 상세페이지로 이동"
                >
                  <BookOpenIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
