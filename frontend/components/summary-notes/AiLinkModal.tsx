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

interface AiLinkDataV2 {
  executiveSummary: string;
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


const SuggestedActionsDisplay = React.memo(({ actions }: { actions: PotentialAction[] | undefined }) => {
  if (!actions || actions.length === 0) return null;

  const handleCopyPrompt = (prompt: string, actionName: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success(`'${actionName}' 프롬프트가 복사되었습니다.`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-purple-400 flex items-center"><SparklesIcon className="w-5 h-5 mr-2"/>추천 액션</h3>
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
          const response = await api.get(`/summary-notes/${summaryNoteId}/data`);
          setAiLinkData(response.data);
          toast.success('AI-Link V2 데이터를 성공적으로 불러왔습니다.');
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
        toast.success('당신의 지식을 나눌 준비가 되었습니다.');
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
            <span>당신의 AI-Link, 이렇게 사용해보세요</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-4 text-left">
            <p className="text-center pb-2">AI-Link 전체를 복사해서 즐겨찾는 AI에 붙여넣고, 이렇게 요청해보세요:</p>
            <ol className="list-decimal list-inside bg-gray-900/50 p-3 rounded-md space-y-1">
              <li>Perplexity, Gemini에서 이 내용을 참고하여 '딥 리서치' 해줘</li>
              <li>Midjourney, Sora에서 이 컨셉을 참고하여 생성해줘</li>
              <li>NotebookLM에서 나의 지식 여정을 참고하여 답변해줘</li>
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
                <p className="text-sm text-gray-300">링크 생성 성공! 복사하여 공유하세요.</p>
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
                  NotebookLM, Gemini, Perplexity, Midjourney, Sora 등에 이 링크를 입력하여, 
                  <span className="block font-semibold text-cyan-400 mt-1">
                    딥 리서치, 글쓰기, 이미지/영상 생성 성능UP!
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
                  {isLoading ? '생성 중...' : '공유 링크 생성'}
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
                <SuggestedActionsDisplay actions={aiLinkData.potentialAction} />

                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center">
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    전체 AI-Link 데이터 보기 (JSON)
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
                AI-Link 데이터를 불러오는 데 실패했거나 데이터가 없습니다.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 