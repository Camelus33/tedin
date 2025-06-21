'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RocketIcon, CheckIcon, ClipboardIcon, XIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AiLinkModalProps {
  summaryNoteId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AiLinkModal({ summaryNoteId, isOpen, onOpenChange }: AiLinkModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('share');
  
  // For Ontology Feature
  const [aiLinkData, setAiLinkData] = useState<object | null>(null);
  const [displayedData, setDisplayedData] = useState<object | null>(null);
  const [isOntologyApplied, setIsOntologyApplied] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isAiDataCopied, setIsAiDataCopied] = useState(false);

  useEffect(() => {
    const fetchSummaryNoteData = async () => {
      if (activeTab === 'ai-data' && isOpen && !aiLinkData) {
        setIsDataLoading(true);
        try {
          // NOTE: Assuming this API endpoint exists to fetch the raw summary note data.
          const response = await api.get(`/summary-notes/${summaryNoteId}/data`);
          setAiLinkData(response.data);
          setDisplayedData(response.data);
          toast.success('AI-Link 데이터를 성공적으로 불러왔습니다.');
        } catch (error) {
          console.error('Failed to fetch AI link data:', error);
          toast.error('AI-Link 데이터를 불러오는 데 실패했습니다.');
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    fetchSummaryNoteData();
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

  const handleToggleOntology = () => {
    if (!aiLinkData) return;

    const newIsOntologyApplied = !isOntologyApplied;
    setIsOntologyApplied(newIsOntologyApplied);

    if (newIsOntologyApplied) {
      // NOTE: For this to work reliably in production, 
      // NEXT_PUBLIC_FRONTEND_URL environment variable should be set in your .env.local file.
      // Example: NEXT_PUBLIC_FRONTEND_URL=https://www.habitus33.com
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
      const dataWithContext = {
        '@context': `${baseUrl}/ai-link-context.jsonld`,
        ...aiLinkData,
      };
      setDisplayedData(dataWithContext);
    } else {
      setDisplayedData(aiLinkData);
    }
  };

  const handleCopyAiData = () => {
    if (!displayedData) return;
    const dataString = JSON.stringify(displayedData, null, 2);
    navigator.clipboard.writeText(dataString);
    setIsAiDataCopied(true);
    toast.success('AI 데이터가 클립보드에 복사되었습니다.');
    setTimeout(() => setIsAiDataCopied(false), 2000);
  };
  
  // Reset state when modal is closed
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setGeneratedUrl('');
        setIsLoading(false);
        setIsCopied(false);
        // Reset new states as well
        setAiLinkData(null);
        setDisplayedData(null);
        setIsOntologyApplied(false);
        setActiveTab('share');
        setIsAiDataCopied(false);
      }, 300); // Allow for closing animation
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className={`${cyberTheme.cardBg} ${cyberTheme.borderPrimary} text-gray-200 border`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center justify-center space-x-2 ${cyberTheme.primary} text-lg`}>
            <RocketIcon className="h-5 w-5" />
            <span>지식 캡슐 활용법</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-4 text-center">
            놀라운 경험이 시작됩니다. AI에 입력하고,<br/> "메모 진화의 모든 외부 링크를 직접 방문해 내용을 읽어와"라고 해보세요.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="share">공유 링크</TabsTrigger>
            <TabsTrigger value="ai-data">AI제공 데이터</TabsTrigger>
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
                 <p className="text-gray-300">
                  NotebookLM, Gemini, ChatGPT, Perplexity에 입력,<br/>  '딥리서치'를 활용해 보세요. 강추!
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
              <div className="flex justify-center items-center h-24">
                <span className="animate-spin h-8 w-8 border-4 border-white/20 border-t-cyan-400 rounded-full"></span>
              </div>
            ) : aiLinkData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-300">
                    {isOntologyApplied ? '온톨로지 적용 (JSON-LD)' : '원본 데이터 (JSON)'}
                  </p>
                  <Button size="sm" variant="outline" onClick={handleToggleOntology} className="text-xs h-7">
                    {isOntologyApplied ? '원본 보기' : '온톨로지 적용'}
                  </Button>
                </div>
                <div className="relative p-4 rounded-md bg-gray-900/70 border border-gray-700 max-h-64 overflow-y-auto">
                  <Button size="icon" variant="ghost" onClick={handleCopyAiData} className="absolute top-2 right-2 h-7 w-7">
                    {isAiDataCopied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                  </Button>
                  <pre className="text-sm text-cyan-300 whitespace-pre-wrap break-all">
                    <code>{JSON.stringify(displayedData, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>AI-Link 데이터를 불러오는 데 실패했거나,<br/>데이터가 존재하지 않습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
           <Button variant="outline" onClick={() => handleModalOpenChange(false)} className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300">
              닫기
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 