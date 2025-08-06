'use client';

import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Share2, Search, SlidersHorizontal, Eye, Paperclip, Microscope, Link as LinkIcon, BookOpen, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';
import ExpandableText from '@/components/common/ExpandableText';
import ClientTimeDisplay from '@/components/share/ClientTimeDisplay';

const VectorGraphCanvas = dynamic(
  () => import('@/components/share/VectorGraphCanvas'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><p>그래프 로딩 중...</p></div> }
);

const formatSessionDuration = (seconds?: number): string => {
  if (seconds === undefined || seconds < 0) return '정보 없음';
  if (seconds === 0) return '0분';
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  let durationString = "";
  if (h > 0) durationString += `${h}시간 `;
  if (m > 0 || h === 0) durationString += `${m}분`;
  return durationString.trim();
};

const formatPPM = (ppm?: number | null): string => {
  if (ppm == null || !Number.isFinite(ppm)) return '정보 없음';
  return `분당 ${ppm.toFixed(1)} 페이지`;
};


export default function SharePageLayout({ htmlData }: { htmlData: any }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { title, description, userMarkdownContent, notes, user, createdAt, diagram } = htmlData;

  const selectedNote = notes.find((note: any) => note._id === selectedNodeId);

  return (
    <main className="font-sans bg-gray-900 text-gray-200 h-screen w-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-2 flex justify-between items-center z-20">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-indigo-400 truncate" title={title ?? '제목 없음'}>{title ?? '제목 없음'}</h1>
          <p className="text-xs text-gray-400 truncate" title={description}>{description || '설명 없음'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            공유자: {user?.name || '익명'}
          </span>
          <button className="p-1.5 rounded-md hover:bg-gray-700 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={15} className="hidden md:flex flex-col p-2 bg-gray-800/50">
           <div className="flex-shrink-0 p-2 border-b border-gray-700">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-400" /> 전체 구조 (Map)</h2>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="개념 검색..." className="w-full bg-gray-700/80 border border-gray-600 rounded-md pl-8 pr-2 py-1 text-xs focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
          <div className="flex-grow mt-2 bg-gray-900/50 rounded-md border border-gray-700/50 flex items-center justify-center">
             {diagram?.data ? (
                <VectorGraphCanvas diagramData={diagram.data} onNodeSelect={setSelectedNodeId} isMinimap={true} />
              ) : (
                <p className="text-xs text-gray-500">미니맵 데이터 없음</p>
              )}
          </div>
        </Panel>

        <PanelResizeHandle className="hidden md:block w-[2px] bg-gray-700 hover:bg-cyan-500 transition-colors duration-200 cursor-col-resize" />

        <Panel defaultSize={50} minSize={30}>
          <div className="w-full h-full bg-gray-900 relative flex flex-col">
            <div className="flex-shrink-0 p-2 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-sm font-semibold">탐색 캔버스 (Canvas)</h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-md hover:bg-gray-700 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-grow relative">
              {diagram?.data ? (
                <VectorGraphCanvas diagramData={diagram.data} onNodeSelect={setSelectedNodeId} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm text-gray-500">표시할 벡터그래프 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="hidden md:block w-[2px] bg-gray-700 hover:bg-cyan-500 transition-colors duration-200 cursor-col-resize" />

        <Panel defaultSize={30} minSize={20}>
          <div className="w-full h-full bg-gray-800/50 flex flex-col p-2">
            <div className="flex-shrink-0 p-2 border-b border-gray-700">
              <h2 className="text-sm font-semibold">상세 내용 (Inspector)</h2>
            </div>
            <div className="flex-grow mt-2 overflow-y-auto pr-1">
              {selectedNote ? (
                <div className="p-4 space-y-6 text-sm">
                  <h3 className="font-bold text-lg text-indigo-300 break-words">{selectedNote.content}</h3>
                  
                  {selectedNote.sessionDetails && (
                    <section className="bg-gray-700/30 p-3 rounded-lg">
                      <h4 className="font-semibold text-cyan-400 flex items-center mb-2"><Paperclip className="h-4 w-4 mr-2" />카드 정보</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {selectedNote.sessionDetails?.createdAt && <li><strong>기록 시점:</strong> <ClientTimeDisplay createdAt={selectedNote.sessionDetails.createdAt} clientCreatedAt={selectedNote.clientCreatedAt} /></li>}
                        {selectedNote.sessionDetails?.durationSeconds !== undefined && <li><strong>읽은 시간:</strong> {formatSessionDuration(selectedNote.sessionDetails.durationSeconds)}</li>}
                        {selectedNote.sessionDetails?.ppm !== undefined && <li><strong>읽기 속도:</strong> {formatPPM(selectedNote.sessionDetails.ppm)}</li>}
                        {selectedNote.book?.title && <li><strong>출처:</strong> {selectedNote.book.title}</li>}
                      </ul>
                    </section>
                  )}

                  {(selectedNote.importanceReason || selectedNote.momentContext || selectedNote.relatedKnowledge || selectedNote.mentalImage) && (
                    <section>
                      <h4 className="font-semibold text-cyan-400 flex items-center mb-2"><Microscope className="h-4 w-4 mr-2" />기억 강화</h4>
                      <ul className="text-xs text-gray-300 space-y-3">
                        {selectedNote.importanceReason && <li><strong className="block text-indigo-400 mb-1">작성 이유:</strong> <ExpandableText text={selectedNote.importanceReason} /></li>}
                        {selectedNote.momentContext && <li><strong className="block text-indigo-400 mb-1">당시 상황:</strong> <ExpandableText text={selectedNote.momentContext} /></li>}
                        {selectedNote.relatedKnowledge && <li><strong className="block text-indigo-400 mb-1">연상 지식:</strong> <ExpandableText text={selectedNote.relatedKnowledge} /></li>}
                        {selectedNote.mentalImage && <li><strong className="block text-indigo-400 mb-1">떠오른 장면:</strong> <ExpandableText text={selectedNote.mentalImage} /></li>}
                      </ul>
                    </section>
                  )}
                  
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <p>그래프에서 노드를 선택하여 상세 정보를 확인하세요.</p>
                </div>
              )}
               {userMarkdownContent && (
                <section className="mt-6 p-4">
                    <h4 className="font-semibold text-cyan-400 mb-2">작성자 인사이트</h4>
                    <div className="prose prose-sm prose-invert max-w-none p-3 bg-gray-700/50 rounded-md">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{userMarkdownContent}</pre>
                    </div>
                </section>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
