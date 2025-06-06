'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 성찰 저널 항목 인터페이스
interface ReflectionEntry {
  id: string;
  date: string;
  content: string;
  category: 'improvement' | 'achievement' | 'challenge' | 'general';
  mood: 'positive' | 'neutral' | 'negative';
}

interface ReflectionJournalProps {
  metricName: string;
}

const REFLECTION_PROMPTS = {
  improvement: [
    "이 영역에서 어떤 개선이 있었나요?",
    "개선을 위해 어떤 방법이 가장 효과적이었나요?",
    "개선 과정에서 무엇을 배웠나요?",
    "다음에는 어떻게 더 효율적으로 개선할 수 있을까요?"
  ],
  achievement: [
    "최근에 이룬 가장 큰 성취는 무엇인가요?",
    "그 성취가 당신에게 어떤 의미가 있나요?",
    "성취를 가능하게 한 요소는 무엇이었나요?",
    "이 성취를 통해 무엇을 배웠나요?"
  ],
  challenge: [
    "현재 가장 어려운 도전은 무엇인가요?",
    "이 도전을 어떻게 극복하려고 계획하고 있나요?",
    "이 도전에서 무엇을 배우고 있나요?",
    "도전을 통해 어떤 성장을 기대하나요?"
  ],
  general: [
    "지금 당신의 인지적 여정에서 가장 중요한 것은 무엇인가요?",
    "어떤 패턴이나 습관이 당신의 발전에 도움이 되고 있나요?",
    "앞으로의 발전 방향에 대해 어떻게 생각하나요?",
    "지금 당신의 학습 과정에서 가장 즐거운 점은 무엇인가요?"
  ]
};

const ReflectionJournal: React.FC<ReflectionJournalProps> = ({ metricName }) => {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [newEntry, setNewEntry] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ReflectionEntry['category']>('general');
  const [activeMood, setActiveMood] = useState<ReflectionEntry['mood']>('neutral');
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const storageKey = `${metricName}-reflection-journal`;

  useEffect(() => {
    // 저장된 저널 항목 불러오기
    const savedEntries = localStorage.getItem(storageKey);
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('저널 데이터 파싱 오류:', error);
      }
    }
  }, [storageKey]);

  // 저널 항목 저장
  const saveEntries = (updatedEntries: ReflectionEntry[]) => {
    setEntries(updatedEntries);
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
  };

  // 새 저널 항목 추가
  const addEntry = () => {
    if (newEntry.trim() === '') return;
    
    const entry: ReflectionEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: newEntry,
      category: activeCategory,
      mood: activeMood,
    };
    
    const updatedEntries = [entry, ...entries];
    saveEntries(updatedEntries);
    setNewEntry('');
    setIsWriting(false);
    setSelectedPrompt(null);
  };

  // 저널 항목 삭제
  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  };

  // 프롬프트 선택
  const selectPrompt = () => {
    const prompts = REFLECTION_PROMPTS[activeCategory];
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setSelectedPrompt(prompts[randomIndex]);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 무드 아이콘
  const getMoodIcon = (mood: ReflectionEntry['mood']) => {
    switch (mood) {
      case 'positive': return '😊';
      case 'neutral': return '😐';
      case 'negative': return '😔';
    }
  };

  // 카테고리 색상
  const getCategoryColor = (category: ReflectionEntry['category']) => {
    switch (category) {
      case 'improvement': return 'rgb(var(--primary-turquoise))';
      case 'achievement': return 'rgb(var(--secondary-green))';
      case 'challenge': return 'rgb(var(--primary-indigo))';
      case 'general': return 'rgb(var(--secondary-beige))';
    }
  };

  // 카테고리 이름
  const getCategoryName = (category: ReflectionEntry['category']) => {
    switch (category) {
      case 'improvement': return '개선';
      case 'achievement': return '성취';
      case 'challenge': return '도전';
      case 'general': return '일반';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">인지 성찰 저널</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          당신의 인지적 여정에 대한 생각과 느낌을 기록하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* 새 항목 작성 영역 */}
        {isWriting ? (
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex justify-between mb-3">
              <h3 className="text-md font-medium">새 성찰 작성</h3>
              <Button 
                variant="ghost" 
                className="h-auto p-1"
                onClick={() => setIsWriting(false)}
              >
                &times;
              </Button>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm mb-2">카테고리 선택</h4>
              <div className="flex space-x-2 mb-3">
                {(['improvement', 'achievement', 'challenge', 'general'] as const).map(category => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? 'default' : 'outline'}
                    className="text-xs py-1 h-auto"
                    style={activeCategory === category ? 
                      { backgroundColor: getCategoryColor(category) } : 
                      { borderColor: getCategoryColor(category), color: getCategoryColor(category) }
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    {getCategoryName(category)}
                  </Button>
                ))}
              </div>
              
              <h4 className="text-sm mb-2">기분 선택</h4>
              <div className="flex space-x-2 mb-3">
                {(['positive', 'neutral', 'negative'] as const).map(mood => (
                  <Button
                    key={mood}
                    variant={activeMood === mood ? 'default' : 'outline'}
                    className="text-base py-1 px-3 h-auto"
                    style={activeMood === mood ? 
                      { backgroundColor: 'rgb(var(--primary-indigo))' } : 
                      {}
                    }
                    onClick={() => setActiveMood(mood)}
                  >
                    {getMoodIcon(mood)}
                  </Button>
                ))}
              </div>
              
              {selectedPrompt && (
                <div className="p-3 my-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{selectedPrompt}</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs mb-3"
                onClick={selectPrompt}
              >
                프롬프트 생성
              </Button>
            </div>
            
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="당신의 생각과 느낌을 적어보세요..."
              className="w-full p-3 border rounded-lg text-sm mb-3"
              rows={6}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsWriting(false)}
              >
                취소
              </Button>
              <Button 
                size="sm"
                style={{ backgroundColor: 'rgb(var(--primary-indigo))' }}
                onClick={addEntry}
              >
                저장
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <Button 
              className="w-full"
              style={{ backgroundColor: 'rgb(var(--primary-indigo))' }}
              onClick={() => setIsWriting(true)}
            >
              새 성찰 작성하기
            </Button>
          </div>
        )}
        
        {/* 저널 항목 목록 */}
        {entries.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-md font-medium">이전 성찰 ({entries.length})</h3>
            
            <Tabs defaultValue="all">
              <TabsList className="w-full flex mb-4">
                <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
                <TabsTrigger value="improvement" className="flex-1">개선</TabsTrigger>
                <TabsTrigger value="achievement" className="flex-1">성취</TabsTrigger>
                <TabsTrigger value="challenge" className="flex-1">도전</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-3">
                  {entries.map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-3 border rounded-lg"
                      style={{ borderLeftColor: getCategoryColor(entry.category), borderLeftWidth: '4px' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{getMoodIcon(entry.mood)}</span>
                          <span 
                            className="text-xs py-1 px-2 rounded-full"
                            style={{ 
                              backgroundColor: `${getCategoryColor(entry.category)}20`,
                              color: getCategoryColor(entry.category)
                            }}
                          >
                            {getCategoryName(entry.category)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="h-auto p-1 text-gray-400 hover:text-red-500"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          &times;
                        </Button>
                      </div>
                      <p className="text-sm mb-2 whitespace-pre-wrap">{entry.content}</p>
                      <p className="text-xs text-gray-500 text-right">{formatDate(entry.date)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {(['improvement', 'achievement', 'challenge'] as const).map(category => (
                <TabsContent key={category} value={category}>
                  <div className="space-y-3">
                    {entries
                      .filter(entry => entry.category === category)
                      .map(entry => (
                        <div 
                          key={entry.id} 
                          className="p-3 border rounded-lg"
                          style={{ borderLeftColor: getCategoryColor(entry.category), borderLeftWidth: '4px' }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span>{getMoodIcon(entry.mood)}</span>
                            <Button 
                              variant="ghost" 
                              className="h-auto p-1 text-gray-400 hover:text-red-500"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              &times;
                            </Button>
                          </div>
                          <p className="text-sm mb-2 whitespace-pre-wrap">{entry.content}</p>
                          <p className="text-xs text-gray-500 text-right">{formatDate(entry.date)}</p>
                        </div>
                    ))}
                    {entries.filter(entry => entry.category === category).length === 0 && (
                      <p className="text-center text-sm text-gray-500 py-4">
                        이 카테고리의 성찰이 아직 없습니다.
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-2">아직 작성된 성찰이 없습니다.</p>
            <p className="text-xs text-gray-400">
              첫 번째 성찰을 작성하고 당신의 인지적 여정을 기록해보세요.
            </p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 italic">
            "자신의 생각을 성찰하는 것은 인지적 성장의 열쇠입니다."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReflectionJournal; 