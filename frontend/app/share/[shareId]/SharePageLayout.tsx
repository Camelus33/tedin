'use client';

import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Share2, Search, SlidersHorizontal, Eye, Paperclip, Microscope, Link as LinkIcon, BookOpen, Calendar, HelpCircle, ChevronDown, ChevronUp, MessageSquare, ExternalLink, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import ExpandableText from '@/components/common/ExpandableText';
import ClientTimeDisplay, { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';
import { RELATIONSHIP_CONFIGS, RelationshipType } from '@/components/share/VectorGraphCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import LearningJourneyVisualization from '@/components/share/LearningJourneyVisualization';
import InlineThreadsViewer from '@/components/share/InlineThreadsViewer';
import { flashcardApi, Flashcard } from '@/lib/api';


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

const JourneyContent = ({ htmlData, jsonLdData, shareId }: { htmlData: any, jsonLdData: any, shareId: string }) => {
    const { userMarkdownContent, notes } = htmlData;

    // 관련 링크 타입별 아이콘과 라벨 매핑
    const getLinkTypeInfo = (type: string) => {
        switch (type) {
            case 'book': return { icon: BookOpen, label: '책', color: 'text-blue-400' };
            case 'paper': return { icon: Paperclip, label: '논문/자료', color: 'text-green-400' };
            case 'youtube': return { icon: ExternalLink, label: '유튜브', color: 'text-red-400' };
            case 'media': return { icon: ExternalLink, label: '미디어/뉴스', color: 'text-yellow-400' };
            case 'website': return { icon: ExternalLink, label: '웹사이트', color: 'text-purple-400' };
            default: return { icon: ExternalLink, label: '링크', color: 'text-gray-400' };
        }
    };

    return (
        <div className="p-4 bg-gray-800/50 rounded-lg space-y-8">
            {jsonLdData?.learningJourney && (
                <LearningJourneyVisualization
                    learningJourney={jsonLdData.learningJourney}
                    className="mb-8"
                />
            )}

            {notes && notes.length > 0 && (
                <section className="p-6 bg-gray-700/30 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      핵심 내용
                    </h3>
                    <ul className="space-y-2">
                        {notes.map((note: any, index: number) => (
                        <li key={`toc-${note._id || index}`} className="text-gray-400 hover:text-cyan-400 transition-colors">
                            <a href={`#journey-${note._id || index}`} className="flex items-start">
                            <span className="mr-3 text-cyan-400 font-semibold">{index + 1}.</span>
                            <span className="flex-1">{note.content?.substring(0, 70) ?? '내용 없음'}{note.content?.length > 70 ? '...' : ''}</span>
                            </a>
                        </li>
                        ))}
                    </ul>
                </section>
            )}
            
            {userMarkdownContent && (
                <section className="p-6 bg-indigo-900/30 rounded-lg border-l-4 border-purple-500">
                    <header className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-400" />
                            Comment
                        </h3>
                    </header>
                    <div className="prose prose-invert max-w-none bg-gray-800 p-4 rounded border border-purple-700">
                        <pre className="whitespace-pre-wrap font-sans text-lg text-gray-300 leading-loose">
                            {userMarkdownContent}
                        </pre>
                    </div>
                </section>
            )}
            
            <div className="space-y-10">
                {notes && notes.map((note: any, index: number) => (
                    <article key={note._id} id={`journey-${note._id}`} className="border-t border-gray-700 pt-8 scroll-mt-20">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-green-600 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">{index + 1}</div>
                            <h3 className="flex-1 text-lg font-semibold text-indigo-300 break-words">{note.content ?? '내용 없음'}</h3>
                        </div>

                        <div className="mt-6 pl-12 space-y-6">
                            {note.sessionDetails && (
                                <section className="bg-gray-700/50 p-4 rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2"><Paperclip className="w-4 h-4 text-cyan-400" />카드 정보</h4>
                                    <ul className="mt-2 text-sm text-gray-400 space-y-1">
                                        {note.sessionDetails?.createdAt && <li><strong>기록 시점:</strong> <ClientTimeDisplay createdAt={note.sessionDetails.createdAt} clientCreatedAt={note.clientCreatedAt} /></li>}
                                        {note.sessionDetails?.durationSeconds !== undefined && <li><strong>읽은 시간:</strong> {formatSessionDuration(note.sessionDetails.durationSeconds)}</li>}
                                        {note.sessionDetails?.ppm !== undefined && <li><strong>읽기 속도:</strong> {formatPPM(note.sessionDetails.ppm)}</li>}
                                        {note.book?.title && <li><strong>출처:</strong> {note.book.title} {note.book.author && `(${note.book.author})`}</li>}
                                    </ul>
                                </section>
                            )}

                            {(note.importanceReason || note.momentContext || note.relatedKnowledge || note.mentalImage) && (
                                <section>
                                    <h4 className="font-semibold flex items-center gap-2"><Microscope className="w-4 h-4 text-cyan-400" />기억 강화</h4>
                                    <ul className="mt-2 text-sm text-gray-400 space-y-4">
                                        {note.importanceReason && <li><strong className="text-indigo-400 block mb-1">작성 이유:</strong> <ExpandableText text={note.importanceReason} /></li>}
                                        {note.momentContext && <li><strong className="text-indigo-400 block mb-1">당시 상황:</strong> <ExpandableText text={note.momentContext} /></li>}
                                        {note.relatedKnowledge && <li><strong className="text-indigo-400 block mb-1">연상 지식:</strong> <ExpandableText text={note.relatedKnowledge} /></li>}
                                        {note.mentalImage && <li><strong className="text-indigo-400 block mb-1">떠오른 장면:</strong> <ExpandableText text={note.mentalImage} /></li>}
                                    </ul>
                                </section>
                            )}

                            {/* 지식연결 섹션 추가 */}
                            {note.relatedLinks && note.relatedLinks.length > 0 && (
                                <section>
                                    <h4 className="font-semibold flex items-center gap-2"><LinkIcon className="w-4 h-4 text-cyan-400" />지식연결</h4>
                                    <div className="mt-2 space-y-3">
                                        {note.relatedLinks.map((link: any, linkIndex: number) => {
                                            const linkInfo = getLinkTypeInfo(link.type);
                                            const IconComponent = linkInfo.icon;
                                            return (
                                                <div key={link._id || linkIndex} className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                                                    <div className="flex items-start space-x-2">
                                                        <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${linkInfo.color}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <a 
                                                                href={link.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors break-all"
                                                            >
                                                                {link.reason || link.url}
                                                            </a>
                                                            {link.reason && (
                                                                <p className="text-xs text-gray-500 mt-1 break-words">
                                                                    {link.url}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                             
                             {typeof note.inlineThreadsCount === 'number' && note.inlineThreadsCount > 0 && (
                                <InlineThreadsViewer shareId={shareId} noteId={note._id} count={note.inlineThreadsCount} />
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}

export default function SharePageLayout({ htmlData, jsonLdData, shareId }: { htmlData: any, jsonLdData: any, shareId: string }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isJourneyVisible, setJourneyVisible] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);
  const [selectedNoteFlashcards, setSelectedNoteFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);

  const { title, description, userMarkdownContent, notes, user, createdAt, diagram } = htmlData;

  const selectedNote = notes.find((note: any) => note._id === selectedNodeId);

  // 선택된 노드의 복습카드 가져오기
  useEffect(() => {
    if (selectedNote?._id) {
      setFlashcardsLoading(true);
      // memoId로 복습카드 조회 (API에 memoId 필터 추가 필요)
      flashcardApi.list({ bookId: selectedNote.bookId || '' })
        .then((flashcards: Flashcard[]) => {
          // memoId가 일치하는 복습카드만 필터링
          const memoFlashcards = flashcards.filter(card => card.memoId === selectedNote._id);
          setSelectedNoteFlashcards(memoFlashcards);
        })
        .catch((error) => {
          console.error('복습카드 조회 실패:', error);
          setSelectedNoteFlashcards([]);
        })
        .finally(() => {
          setFlashcardsLoading(false);
        });
    } else {
      setSelectedNoteFlashcards([]);
    }
  }, [selectedNote?._id]);

  // 관련 링크 타입별 아이콘과 라벨 매핑 (Inspector용)
  const getLinkTypeInfo = (type: string) => {
    switch (type) {
      case 'book': return { icon: BookOpen, label: '책', color: 'text-blue-400' };
      case 'paper': return { icon: Paperclip, label: '논문/자료', color: 'text-green-400' };
      case 'youtube': return { icon: ExternalLink, label: '유튜브', color: 'text-red-400' };
      case 'media': return { icon: ExternalLink, label: '미디어/뉴스', color: 'text-yellow-400' };
      case 'website': return { icon: ExternalLink, label: '웹사이트', color: 'text-purple-400' };
      default: return { icon: ExternalLink, label: '링크', color: 'text-gray-400' };
    }
  };

  return (
    <main className="font-sans bg-gray-900 text-gray-200 h-screen w-screen flex flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-2 flex justify-between items-center z-20">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-indigo-400 truncate" title={title ?? '제목 없음'}>{title ?? '제목 없음'}</h1>
          <p className="text-xs text-gray-400 truncate" title={description}>{description || '설명 없음'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>공유일: <ClientDateDisplay createdAt={createdAt} /></span>
            <span>|</span>
            <span>공유자: {user?.name || '익명'}</span>
          </div>
          <button className="p-1.5 rounded-md hover:bg-gray-700 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={15} className="hidden md:flex flex-col p-2 bg-gray-800/50">
           <div className="flex-shrink-0 p-2 border-b border-gray-700">
                <h2 className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-400" /> Miny Map</h2>
            </div>
          <div className="flex-shrink-0 mt-2 bg-gray-900/50 rounded-md border border-gray-700/50 flex items-center justify-center p-1" style={{ height: '120px' }}>
             {diagram?.data ? (
                <VectorGraphCanvas diagramData={diagram.data} onNodeSelect={setSelectedNodeId} isMinimap={true} />
              ) : (
                <p className="text-xs text-gray-500">미니맵 데이터 없음</p>
              )}
          </div>
          
          {/* 인사이트 토글 섹션 */}
          <div className="flex-shrink-0 mt-2 p-2 border-t border-gray-700">
            <button 
              onClick={() => setInsightVisible(!insightVisible)}
              className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-semibold"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                인사이트
              </span>
              {insightVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {insightVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-gray-700/30 rounded border border-gray-600/50">
                    {userMarkdownContent ? (
                      <div className="text-xs text-gray-300 leading-relaxed">
                        <pre className="whitespace-pre-wrap font-sans text-xs text-gray-300">
                          {userMarkdownContent}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center">작성된 인사이트가 없습니다.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-grow mt-2 p-2 border-t border-gray-700">
            {/* 학습 지표 대시보드 */}
            {notes && notes.length > 0 && (
              <div className="space-y-1 mb-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  학습 지표
                </h4>
                
                {/* 전체 평균 요약 - 4가지 항목 */}
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <div className="bg-gray-700/30 p-1.5 rounded text-center">
                    <div className="text-sm font-bold text-blue-400">
                      {(() => {
                        const avgThoughts = notes.reduce((sum: number, note: any) => {
                          return sum + (note.thoughtExpansion || 0);
                        }, 0) / notes.length;
                        return avgThoughts.toFixed(1);
                      })()}
                    </div>
                    <div className="text-xs text-gray-400">생각추가</div>
                  </div>
                  <div className="bg-gray-700/30 p-1.5 rounded text-center">
                    <div className="text-sm font-bold text-cyan-400">
                      {(() => {
                        const avgMemory = notes.reduce((sum: number, note: any) => {
                          const memoryCount = [
                            note.importanceReason ? 1 : 0,
                            note.momentContext ? 1 : 0,
                            note.relatedKnowledge ? 1 : 0,
                            note.mentalImage ? 1 : 0
                          ].filter(Boolean).length;
                          return sum + memoryCount;
                        }, 0) / notes.length;
                        return avgMemory.toFixed(1);
                      })()}
                    </div>
                    <div className="text-xs text-gray-400">기억강화</div>
                  </div>
                  <div className="bg-gray-700/30 p-1.5 rounded text-center">
                    <div className="text-sm font-bold text-green-400">
                      {(() => {
                        const avgConnections = notes.reduce((sum: number, note: any) => {
                          return sum + (note.relatedLinks?.length || 0);
                        }, 0) / notes.length;
                        return avgConnections.toFixed(1);
                      })()}
                    </div>
                    <div className="text-xs text-gray-400">지식연결</div>
                  </div>
                  <div className="bg-gray-700/30 p-1.5 rounded text-center">
                    <div className="text-sm font-bold text-purple-400">
                      {(() => {
                        const avgFlashcards = notes.reduce((sum: number, note: any) => {
                          return sum + (note.flashcardCount || 0);
                        }, 0) / notes.length;
                        return avgFlashcards.toFixed(1);
                      })()}
                    </div>
                    <div className="text-xs text-gray-400">복습카드</div>
                  </div>
                </div>
                
                {/* 개별 노드 지표 */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {notes.map((note: any, index: number) => {
                    const thoughtExpansion = note.thoughtExpansion || 0;
                    const memoryEnhancement = [
                      note.importanceReason ? 1 : 0,
                      note.momentContext ? 1 : 0,
                      note.relatedKnowledge ? 1 : 0,
                      note.mentalImage ? 1 : 0
                    ].filter(Boolean).length;
                    const knowledgeConnections = note.relatedLinks?.length || 0;
                    const flashcardCount = note.flashcardCount || 0;
                    
                    return (
                      <div key={note._id || index} className="bg-gray-700/20 p-2 rounded border border-gray-600/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-300">{note.order || index + 1}번</span>
                          <span className="text-xs text-gray-400">
                            {thoughtExpansion + memoryEnhancement + knowledgeConnections + flashcardCount}/12
                          </span>
                        </div>
                        
                        {/* 4가지 진행률 바 */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-6">생각</span>
                            <div className="flex-1 bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-blue-400 h-1 rounded-full transition-all"
                                style={{ width: `${Math.min((thoughtExpansion / 3) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-3">{thoughtExpansion}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-6">기억</span>
                            <div className="flex-1 bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-cyan-400 h-1 rounded-full transition-all"
                                style={{ width: `${(memoryEnhancement / 4) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-3">{memoryEnhancement}/4</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-6">연결</span>
                            <div className="flex-1 bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-green-400 h-1 rounded-full transition-all"
                                style={{ width: `${Math.min((knowledgeConnections / 3) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-3">{knowledgeConnections}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 w-6">복습</span>
                            <div className="flex-1 bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-purple-400 h-1 rounded-full transition-all"
                                style={{ width: `${Math.min((flashcardCount / 2) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-3">{flashcardCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            

          </div>
        </Panel>

        <PanelResizeHandle className="hidden md:block w-[2px] bg-gray-700 hover:bg-cyan-500 transition-colors duration-200 cursor-col-resize" />

        <Panel defaultSize={50} minSize={30}>
          <div className="w-full h-full bg-gray-900 relative flex flex-col">
            <div className="flex-shrink-0 p-2 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-sm font-semibold">Ontology Canvas</h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-md hover:bg-gray-700 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-grow relative overflow-y-auto">
              <div className="h-full" style={{ maxHeight: isJourneyVisible ? '50vh' : 'calc(100% - 40px)', transition: 'max-height 0.5s ease-in-out'}}>
                  {diagram?.data ? (
                      <VectorGraphCanvas diagramData={diagram.data} onNodeSelect={setSelectedNodeId} />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center">
                      <p className="text-sm text-gray-500">표시할 벡터그래프 데이터가 없습니다.</p>
                      </div>
                  )}
              </div>
              
              {/* 범례 - 좌측상단 고정 (아이콘 및 메뉴명 제거) */}
              <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-2 shadow-lg">
                <div className="flex flex-wrap gap-0.5">
                  {Object.entries(RELATIONSHIP_CONFIGS).map(([key, { label, icon, strokeColor }]) => (
                    <div 
                      key={key} 
                      className="px-1 py-0.5 border border-gray-600 rounded text-xs text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer bg-gray-700/50" 
                      style={{ 
                        color: 'inherit',
                        '--hover-color': strokeColor 
                      } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = strokeColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '';
                      }}
                    >
                      {icon} {label}
                    </div>
                  ))}
                </div>
              </div>
                 <div className="sticky bottom-0 left-0 right-0 p-2 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
                    <button 
                        onClick={() => setJourneyVisible(!isJourneyVisible)}
                        className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-semibold"
                    >
                        <span>Timeline</span>
                        {isJourneyVisible ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
                <AnimatePresence>
                    {isJourneyVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <JourneyContent htmlData={htmlData} jsonLdData={jsonLdData} shareId={shareId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="hidden md:block w-[2px] bg-gray-700 hover:bg-cyan-500 transition-colors duration-200 cursor-col-resize" />

        <Panel defaultSize={30} minSize={20}>
          <div className="w-full h-full bg-gray-800/50 flex flex-col p-2">
            <div className="flex-shrink-0 p-2 border-b border-gray-700">
              <h2 className="text-sm font-semibold">Inspector</h2>
            </div>
            <div className="flex-grow mt-2 overflow-y-auto pr-1">
              {selectedNote ? (
                <div className="p-4 space-y-6 text-sm">
                  <h3 className="text-lg text-white hover:text-yellow-300 transition-colors break-words">{selectedNote.content}</h3>
                  
                  {selectedNote.sessionDetails && (
                    <section className="bg-gray-700/30 p-3 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><Paperclip className="w-4 h-4 text-cyan-400" />카드 정보</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {selectedNote.sessionDetails?.createdAt && <li><strong>기록 시점:</strong> <ClientTimeDisplay createdAt={selectedNote.sessionDetails.createdAt} clientCreatedAt={selectedNote.clientCreatedAt} /></li>}
                        {selectedNote.sessionDetails?.durationSeconds !== undefined && <li><strong>읽은 시간:</strong> {formatSessionDuration(selectedNote.sessionDetails.durationSeconds)}</li>}
                        {selectedNote.sessionDetails?.ppm !== undefined && <li><strong>읽기 속도:</strong> {formatPPM(selectedNote.sessionDetails.ppm)}</li>}
                        {selectedNote.book?.title && <li><strong>출처:</strong> {selectedNote.book.title}</li>}
                      </ul>
                    </section>
                  )}

                  {/* 생각추가 섹션 */}
                  {selectedNote.thoughtExpansion && (
                    <section>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-blue-400" />생각추가</h4>
                      <div className="text-xs text-gray-300">
                        <ExpandableText text={selectedNote.thoughtExpansion} />
                      </div>
                    </section>
                  )}

                  {(selectedNote.importanceReason || selectedNote.momentContext || selectedNote.relatedKnowledge || selectedNote.mentalImage) && (
                    <section>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><Microscope className="w-4 h-4 text-cyan-400" />기억 강화</h4>
                      <ul className="text-xs text-gray-300 space-y-3">
                        {selectedNote.importanceReason && <li><strong className="block text-indigo-400 mb-1">작성 이유:</strong> <ExpandableText text={selectedNote.importanceReason} /></li>}
                        {selectedNote.momentContext && <li><strong className="block text-indigo-400 mb-1">당시 상황:</strong> <ExpandableText text={selectedNote.momentContext} /></li>}
                        {selectedNote.relatedKnowledge && <li><strong className="block text-indigo-400 mb-1">연상 지식:</strong> <ExpandableText text={selectedNote.relatedKnowledge} /></li>}
                        {selectedNote.mentalImage && <li><strong className="block text-indigo-400 mb-1">떠오른 장면:</strong> <ExpandableText text={selectedNote.mentalImage} /></li>}
                      </ul>
                    </section>
                  )}

                  {/* 복습카드 섹션 */}
                  {(selectedNote.flashcardCount && selectedNote.flashcardCount > 0) || selectedNoteFlashcards.length > 0 ? (
                    <section>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-purple-400" />복습카드</h4>
                      <div className="space-y-2">
                        {flashcardsLoading ? (
                          <div className="text-xs text-gray-400 text-center py-2">복습카드 불러오는 중...</div>
                        ) : selectedNoteFlashcards.length > 0 ? (
                          selectedNoteFlashcards.map((flashcard, index) => (
                            <div key={flashcard._id || index} className="bg-gray-700/20 p-2 rounded border border-gray-600/30">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-purple-400 font-semibold">문제 {index + 1}</span>
                                  <span className="text-xs text-gray-400">
                                    {flashcard.srsState?.repetitions || 0}회 복습
                                  </span>
                                </div>
                                <div className="text-xs text-gray-300 font-medium">
                                  {flashcard.question}
                                </div>
                                <div className="text-xs text-gray-400">
                                  답: {flashcard.answer}
                                </div>
                                {flashcard.srsState?.lastResult && (
                                  <div className="text-xs text-gray-500">
                                    마지막 결과: {flashcard.srsState.lastResult === 'correct' ? '정답' : 
                                                   flashcard.srsState.lastResult === 'hard' ? '어려움' : 
                                                   flashcard.srsState.lastResult === 'incorrect' ? '오답' : '미정'}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-700/20 p-2 rounded border border-gray-600/30">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">생성된 복습카드</span>
                              <span className="text-xs text-purple-400 font-semibold">{selectedNote.flashcardCount || 0}개</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              이 메모에서 {selectedNote.flashcardCount || 0}개의 복습카드가 생성되었습니다.
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  ) : null}

                  {/* 지식연결 섹션 추가 (Inspector) */}
                  {selectedNote.relatedLinks && selectedNote.relatedLinks.length > 0 && (
                    <section>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><LinkIcon className="w-4 h-4 text-cyan-400" />지식 연결</h4>
                      <div className="space-y-2">
                        {selectedNote.relatedLinks.map((link: any, linkIndex: number) => {
                          const linkInfo = getLinkTypeInfo(link.type);
                          const IconComponent = linkInfo.icon;
                          return (
                            <div key={link._id || linkIndex} className="bg-gray-700/20 p-2 rounded border border-gray-600/30">
                              <div className="flex items-start space-x-2">
                                <IconComponent className={`h-3 w-3 mt-0.5 flex-shrink-0 ${linkInfo.color}`} />
                                <div className="flex-1 min-w-0">
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors break-all"
                                  >
                                    {link.reason || link.url}
                                  </a>
                                  {link.reason && (
                                    <p className="text-xs text-gray-500 mt-1 break-words">
                                      {link.url}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                  
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <p>그래프에서 노드를 선택하여 상세 정보를 확인하세요.</p>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
