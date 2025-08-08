'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RocketIcon, CheckIcon, ClipboardIcon, XIcon, SparklesIcon, FileTextIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface AiLinkModalProps {
  summaryNoteId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- V2 Data Type Definitions ---
interface PotentialAction {
  '@type': string;
  name: string;
  description: string;
  llmPrompt: string;
  targetPlatform?: string[];
}

interface MemoSummary {
  memoId: string;
  contentSummary: string;
  tags?: string[];
  createdAt?: string;
}

interface KnowledgeGrowthEvent {
  memoId: string;
  timestamp: string;
  summary: string;
  tags?: string[];
  relatedConcepts?: string[];
}

interface AiLinkDataV2 {
  executiveSummary: string;
  memoSummary?: MemoSummary[];
  knowledgeGrowthTimeline?: {
    name: string;
    description: string;
    timelineEvents: KnowledgeGrowthEvent[];
    llmAnalysisGuidance: string;
  };
  potentialAction?: PotentialAction[];
  [key: string]: any; // Allow other properties for the full data view
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

// --- V2 UI Sub-components ---

const ExecutiveSummaryDisplay = React.memo(({ summary }: { summary: string | undefined }) => {
  if (!summary) return null;

  // Simple markdown-like parser
  const renderSummary = () => {
    return summary.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-cyan-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('**')) {
        return <p key={index} className="font-bold text-gray-200 mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('• ')) {
        return <p key={index} className="ml-4 text-sm text-gray-400">{line}</p>;
      }
      return <p key={index} className="text-sm text-gray-400">{line}</p>;
    });
  };

  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
      {renderSummary()}
    </div>
  );
});
ExecutiveSummaryDisplay.displayName = 'ExecutiveSummaryDisplay';

const MemoSummaryDisplay = React.memo(({ memoSummary }: { memoSummary: MemoSummary[] | undefined }) => {
  if (!memoSummary || memoSummary.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-cyan-400 flex items-center">
        <FileTextIcon className="w-5 h-5 mr-2"/>
        핵심 메모 요약 ({memoSummary.length}개)
      </h3>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {memoSummary.map((memo, index) => (
          <div key={index} className="p-3 rounded-md bg-gray-800/70 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-300 font-medium">메모 {index + 1}</p>
                <p className="text-xs text-gray-400 mt-1">{memo.contentSummary}</p>
                {memo.tags && memo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {memo.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
MemoSummaryDisplay.displayName = 'MemoSummaryDisplay';

const KnowledgeGrowthTimelineDisplay = React.memo(({ timeline }: { timeline: any | undefined }) => {
  if (!timeline || !timeline.timelineEvents || timeline.timelineEvents.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-purple-400 flex items-center">
        <SparklesIcon className="w-5 h-5 mr-2"/>
        지식 성장 과정
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {timeline.timelineEvents.map((event: any, index: number) => (
          <div key={index} className="p-3 rounded-md bg-gray-800/70 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-400 font-medium">단계 {index + 1}</span>
                  {event.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-1">{event.summary}</p>
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {event.tags.map((tag: string, tagIndex: number) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {timeline.llmAnalysisGuidance && (
        <div className="p-3 rounded-md bg-purple-900/20 border border-purple-700/50">
          <p className="text-xs text-purple-300 font-medium">AI 분석 가이드:</p>
          <p className="text-xs text-gray-400 mt-1">{timeline.llmAnalysisGuidance}</p>
        </div>
      )}
    </div>
  );
});
KnowledgeGrowthTimelineDisplay.displayName = 'KnowledgeGrowthTimelineDisplay';

const SuggestedActionsDisplay = React.memo(({ actions }: { actions: PotentialAction[] | undefined }) => {
  if (!actions || actions.length === 0) return null;

  const handleCopyPrompt = (prompt: string, actionName: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success(`'${actionName}' 프롬프트가 복사되었습니다.`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-purple-400 flex items-center"><SparklesIcon className="w-5 h-5 mr-2"/>AI 추천 액션</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <div key={index} className="p-3 rounded-md bg-gray-800/70 border border-gray-700 flex flex-col justify-between">
            <div>
              <p className="font-semibold text-cyan-400">{action.name}</p>
              <p className="text-xs text-gray-400 mt-1 mb-2">{action.description}</p>
            </div>
            <Button
              size="sm"
              className="w-full mt-2 text-xs h-8 bg-purple-600 hover:bg-purple-700"
              onClick={() => handleCopyPrompt(action.llmPrompt, action.name)}
            >
              <ClipboardIcon className="w-3 h-3 mr-2" />
              프롬프트 복사
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
});
SuggestedActionsDisplay.displayName = 'SuggestedActionsDisplay';

const LLMOptimizedDataDisplay = React.memo(({ aiLinkData }: { aiLinkData: AiLinkDataV2 | null }) => {
  if (!aiLinkData) return null;

  const handleCopyLLMData = () => {
    // LLM이 바로 사용할 수 있는 최적화된 JSON 형태 생성
    const llmOptimizedData = {
      executiveSummary: aiLinkData.executiveSummary,
      memoSummary: aiLinkData.memoSummary || [],
      knowledgeGrowthTimeline: aiLinkData.knowledgeGrowthTimeline || null,
      potentialActions: aiLinkData.potentialAction || [],
      metadata: {
        totalMemos: aiLinkData.memoSummary?.length || 0,
        hasTimeline: !!aiLinkData.knowledgeGrowthTimeline,
        hasActions: (aiLinkData.potentialAction?.length || 0) > 0,
        generatedAt: new Date().toISOString()
      }
    };

    const dataString = JSON.stringify(llmOptimizedData, null, 2);
    navigator.clipboard.writeText(dataString);
    toast.success('AI 최적화 데이터가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-green-400 flex items-center">
        <RocketIcon className="w-5 h-5 mr-2"/>
        AI 최적화 데이터
      </h3>
      <div className="p-3 rounded-md bg-green-900/20 border border-green-700/50">
        <p className="text-xs text-green-300 mb-2">
          AI가 바로 사용할 수 있도록 최적화된 JSON 형태입니다.
        </p>
        <Button
          size="sm"
          className="w-full text-xs h-8 bg-green-600 hover:bg-green-700"
          onClick={handleCopyLLMData}
        >
          <ClipboardIcon className="w-3 h-3 mr-2" />
          AI 데이터 복사
        </Button>
      </div>
    </div>
  );
});
LLMOptimizedDataDisplay.displayName = 'LLMOptimizedDataDisplay';


export function AiLinkModal({ summaryNoteId, isOpen, onOpenChange }: AiLinkModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('share');
  
  const [aiLinkData, setAiLinkData] = useState<AiLinkDataV2 | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isAiDataCopied, setIsAiDataCopied] = useState(false);

  useEffect(() => {
    const fetchAiLinkData = async () => {
      if (activeTab === 'ai-data' && isOpen && !aiLinkData) {
        setIsDataLoading(true);
        try {
          // v2 데이터 요청 (모달 한정)
          const response = await api.get(`/summary-notes/${summaryNoteId}/data`, { params: { v: '2' } });
          setAiLinkData(response.data);
          toast.success('V2 데이터 로드 완료');
        } catch (error) {
          console.error('Failed to fetch AI link data:', error);
          toast.error('AI-Link 데이터를 불러오는 데 실패했습니다.');
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    fetchAiLinkData();
  }, [activeTab, isOpen, summaryNoteId, aiLinkData]);

  const handleGenerateLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/summary-notes/${summaryNoteId}/public-link`);
      const { shareId } = response.data;
      if (shareId) {
        const fullUrl = `${window.location.origin}/share/${shareId}`;
        setGeneratedUrl(fullUrl);
        toast.success('공유 링크가 준비되었습니다.');
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

  const handleCopyAiData = () => {
    if (!aiLinkData) return;
    const dataString = JSON.stringify(aiLinkData, null, 2);
    navigator.clipboard.writeText(dataString);
    setIsAiDataCopied(true);
    toast.success('전체 AI 데이터가 클립보드에 복사되었습니다.');
    setTimeout(() => setIsAiDataCopied(false), 2000);
  };
  
  // Reset state when modal is closed
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setGeneratedUrl('');
        setIsLoading(false);
        setIsCopied(false);
        setAiLinkData(null);
        setActiveTab('share');
        setIsAiDataCopied(false);
      }, 300); // Allow for closing animation
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className={`${cyberTheme.cardBg} ${cyberTheme.borderPrimary} text-gray-200 border max-w-2xl`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center justify-center space-x-2 ${cyberTheme.primary} text-lg`}>
            <RocketIcon className="h-5 w-5" />
            <span>AI-Link</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-4 text-left">
            <p className="text-center pb-2">LLM이 생각의 순서·시간 리듬을 이해하도록 데이터를 전달합니다.</p>
            <ol className="list-decimal list-inside bg-gray-900/50 p-3 rounded-md space-y-1">
              <li>복사한 데이터를 ChatGPT, Claude, NotebookLM에 붙여넣기</li>
              <li>LLM이 생각의 순서·시간 리듬을 읽고 맞춤 코칭을 제안</li>
            </ol>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="share">공유 링크</TabsTrigger>
              <TabsTrigger value="ai-data">AI 제공 데이터</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="py-4">
            {generatedUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">공유 링크가 생성되었습니다.</p>
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
              <div className="text-center space-y-4">
                <p className="text-gray-300 px-2">
                  LLM이 분석할 수 있는 공유 링크를 생성합니다
                  <span className="block font-semibold text-cyan-400 mt-1">
                    개인화된 코칭을 위한 준비 완료
                  </span>
                </p>
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
                  {isLoading ? '생성 중...' : '지식 그래프 링크 생성'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-data" className="py-4">
            {isDataLoading ? (
              <div className="flex justify-center items-center h-48">
                <span className="animate-spin h-8 w-8 border-4 border-white/20 border-t-cyan-400 rounded-full"></span>
              </div>
            ) : aiLinkData ? (
              <div className="space-y-4">
                <ExecutiveSummaryDisplay summary={aiLinkData.executiveSummary} />
                <MemoSummaryDisplay memoSummary={aiLinkData.memoSummary} />
                <KnowledgeGrowthTimelineDisplay timeline={aiLinkData.knowledgeGrowthTimeline} />
                <SuggestedActionsDisplay actions={aiLinkData.potentialAction} />
                <LLMOptimizedDataDisplay aiLinkData={aiLinkData} />

                {/* V2 보조 패널 (모달 전용) */}
                {aiLinkData?.analysisV2 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-cyan-300">생각의 순서·리듬·복습 흐름(V2)</h3>
                    <p className="text-[11px] text-gray-400">메모 관계로 대화하려면 관계 v1을, 생각의 순서·리듬으로 대화하려면 V2를 선택하세요.</p>

                    {/* timelineV2 요약 */}
                    {Array.isArray(aiLinkData.analysisV2.timelineV2) && aiLinkData.analysisV2.timelineV2.length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">타임라인(Δt·리듬·세션) 미리보기</summary>
                        <div className="mt-2 p-3 rounded-md bg-gray-900/60 border border-gray-800 max-h-56 overflow-y-auto">
                          {aiLinkData.analysisV2.timelineV2.slice(0, 20).map((ev: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-300 flex items-center justify-between py-1 border-b border-gray-800/60">
                              <div className="flex-1 pr-2 truncate">
                                <span className="text-cyan-400">{new Date(ev.timestampISO).toLocaleString()}</span>
                                <span className="ml-2 text-gray-400">Δt: {ev.deltaHuman || '-'}</span>
                                <span className="ml-2 text-gray-400">리듬: {ev.rhythmPersonal || ev.rhythmLabel}</span>
                              </div>
                              <div className="text-gray-500 whitespace-nowrap">세션 {ev.sessionIndex || '-'} · 시간대 {ev.hourOfDay}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* 체인 요약 */}
                    {Array.isArray(aiLinkData.analysisV2.chains) && aiLinkData.analysisV2.chains.length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">생각의 사슬(Chains) 요약</summary>
                        <div className="mt-2 p-3 rounded-md bg-gray-900/60 border border-gray-800 max-h-56 overflow-y-auto">
                          {aiLinkData.analysisV2.chains.slice(0, 10).map((ch: any, idx: number) => {
                            const dur = ch?.strength?.durationMs || 0;
                            const minutes = Math.floor(dur / 60000);
                            const seconds = Math.floor((dur % 60000) / 1000);
                            return (
                              <div key={idx} className="text-xs text-gray-300 py-1 border-b border-gray-800/60">
                                <div className="flex items-center justify-between">
                                  <span className="text-purple-300">사슬 {idx + 1}</span>
                                  <span className="text-gray-500">길이 {ch?.strength?.length || 0} · {minutes}m {seconds}s</span>
                                </div>
                                {Array.isArray(ch?.dominantTags) && ch.dominantTags.length > 0 && (
                                  <div className="mt-1 text-gray-400">대표 태그: {ch.dominantTags.join(', ')}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}

                    {/* SRS 오버레이 요약 */}
                    {Array.isArray(aiLinkData.analysisV2.srsOverlay) && aiLinkData.analysisV2.srsOverlay.length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">복습(SRS) 이벤트</summary>
                        <div className="mt-2 p-3 rounded-md bg-gray-900/60 border border-gray-800 max-h-48 overflow-y-auto">
                          {aiLinkData.analysisV2.srsOverlay.slice(0, 20).map((e: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-300 py-1 border-b border-gray-800/60">
                              메모 {e.memoId} · 다음 복습 {e.nextReviewISO ? new Date(e.nextReviewISO).toLocaleDateString() : '-'} · 결과 {e.lastResult || '-'}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* 미세 타임라인 요약 */}
                    {Array.isArray(aiLinkData.analysisV2.microTimeline) && aiLinkData.analysisV2.microTimeline.length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">인라인(미세) 타임라인</summary>
                        <div className="mt-2 p-3 rounded-md bg-gray-900/60 border border-gray-800 max-h-48 overflow-y-auto">
                          {aiLinkData.analysisV2.microTimeline.slice(0, 20).map((m: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-300 py-1 border-b border-gray-800/60">
                              {new Date(m.timestampISO).toLocaleString()} · {m.textSnippet}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* V2 JSON 복사 */}
                    <div className="p-3 rounded-md bg-cyan-900/20 border border-cyan-700/50">
                      <p className="text-xs text-cyan-300 mb-2">LLM에 붙여넣을 V2 분석 데이터(JSON)</p>
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 bg-cyan-600 hover:bg-cyan-700"
                        onClick={() => {
                          const v2 = aiLinkData?.analysisV2 || {};
                          const payload = JSON.stringify(v2, null, 2);
                          navigator.clipboard.writeText(payload);
                          toast.success('V2 분석 데이터가 복사되었습니다.');
                        }}
                      >
                        <ClipboardIcon className="w-3 h-3 mr-2" /> V2 분석 데이터 복사(순서·리듬)
                      </Button>
                    </div>

                    {/* v1 관계 그래프: 유저 친화적 라벨로 선택 복사 */}
                    <div className="p-3 rounded-md bg-gray-900/50 border border-gray-800">
                      <p className="text-xs text-gray-300 mb-2">관계 중심(v1): 메모 간 연결·구조를 LLM에 전달</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="text-xs h-8 bg-gray-700 hover:bg-gray-600"
                          title="가벼운 nodes/edges 데이터로 그래프 구조만 전달"
                          onClick={async () => {
                            try {
                              const res = await api.get(`/summary-notes/${summaryNoteId}/data`, { params: { compact: '1' } });
                              const compact = (res.data as any)?.memoRelGraphCompact;
                              if (!compact) {
                                toast.error('연결 구조 데이터를 불러올 수 없습니다.');
                                return;
                              }
                              navigator.clipboard.writeText(JSON.stringify(compact, null, 2));
                              toast.success('연결 구조 데이터가 복사되었습니다.');
                            } catch (e) {
                              toast.error('연결 구조 데이터를 불러오는 데 실패했습니다.');
                            }
                          }}
                        >
                          <ClipboardIcon className="w-3 h-3 mr-2" /> 연결 구조 복사(v1·가벼움)
                        </Button>

                        <Button
                          size="sm"
                          className="text-xs h-8 bg-gray-700 hover:bg-gray-600"
                          title="adjacency/요약지표 포함: LLM이 바로 분석하기 좋음"
                          onClick={async () => {
                            try {
                              const res = await api.get(`/summary-notes/${summaryNoteId}/data`, { params: { llm: '1' } });
                              const llm = (res.data as any)?.memoRelGraphLLM;
                              if (!llm) {
                                toast.error('연결 요약 데이터를 불러올 수 없습니다.');
                                return;
                              }
                              navigator.clipboard.writeText(JSON.stringify(llm, null, 2));
                              toast.success('연결 요약 데이터가 복사되었습니다.');
                            } catch (e) {
                              toast.error('연결 요약 데이터를 불러오는 데 실패했습니다.');
                            }
                          }}
                        >
                          <ClipboardIcon className="w-3 h-3 mr-2" /> 연결 요약 복사(v1·분석용)
                        </Button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">가벼움: nodes/edges 정규화 · 분석용: adjacency/요약지표/상위N</p>
                    </div>
                  </div>
                )}

                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center">
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    전체 지식 그래프 데이터 (JSON)
                  </summary>
                  <div className="relative mt-2 p-4 rounded-md bg-gray-900/70 border border-gray-700 max-h-64 overflow-y-auto">
                    <Button size="icon" variant="ghost" onClick={handleCopyAiData} className="absolute top-2 right-2 h-7 w-7">
                      {isAiDataCopied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                    </Button>
                    <pre className="text-xs text-cyan-300 whitespace-pre-wrap break-all">
                      <code>{JSON.stringify(aiLinkData, null, 2)}</code>
                    </pre>
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center text-gray-400 h-48 flex items-center justify-center">
                지식 그래프 데이터를 불러오는 데 실패했습니다.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 