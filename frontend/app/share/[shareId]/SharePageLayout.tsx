'use client';

import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Share2, Search, SlidersHorizontal, Eye, Paperclip, Microscope, Link as LinkIcon, BookOpen, Calendar, HelpCircle, ChevronDown, ChevronUp, MessageSquare, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import ExpandableText from '@/components/common/ExpandableText';
import ClientTimeDisplay, { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';
import { RELATIONSHIP_CONFIGS, RelationshipType } from '@/components/share/VectorGraphCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import LearningJourneyVisualization from '@/components/share/LearningJourneyVisualization';
import InlineThreadsViewer from '@/components/share/InlineThreadsViewer';


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
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">핵심 내용</h3>
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
                        <h3 className="text-xl font-semibold text-gray-100 flex items-center">
                            <MessageSquare className="h-6 w-6 mr-2 text-purple-400" />
                            작성자 인사이트
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
                            <h3 className="flex-1 text-2xl font-semibold text-indigo-300 break-words">{note.content ?? '내용 없음'}</h3>
                        </div>

                        <div className="mt-6 pl-12 space-y-6">
                            {note.sessionDetails && (
                                <section className="bg-gray-700/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-300 flex items-center"><Paperclip className="h-4 w-4 mr-2 text-gray-500" />카드 정보</h4>
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
                                    <h4 className="font-semibold text-gray-300 flex items-center"><Microscope className="h-4 w-4 mr-2 text-gray-500" />기억 강화</h4>
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
                                    <h4 className="font-semibold text-gray-300 flex items-center"><LinkIcon className="h-4 w-4 mr-2 text-gray-500" />지식연결</h4>
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

  const { title, description, userMarkdownContent, notes, user, createdAt, diagram } = htmlData;

  const selectedNote = notes.find((note: any) => note._id === selectedNodeId);

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
          <div className="flex-grow mt-2 bg-gray-900/50 rounded-md border border-gray-700/50 flex items-center justify-center">
             {diagram?.data ? (
                <VectorGraphCanvas diagramData={diagram.data} onNodeSelect={setSelectedNodeId} isMinimap={true} />
              ) : (
                <p className="text-xs text-gray-500">미니맵 데이터 없음</p>
              )}
          </div>
          <div className="flex-shrink-0 mt-2 p-2 border-t border-gray-700">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><HelpCircle className="w-4 h-4 text-cyan-400" /> 범례</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(RELATIONSHIP_CONFIGS).map(([key, { label, icon, strokeColor }]) => (
                <div 
                  key={key} 
                  className="px-2 py-1 border border-gray-600 rounded text-xs text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer" 
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
            
            {/* 연결관계 서술 섹션 */}
            {diagram?.data?.connections && diagram.data.connections.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-white mb-2">Relation</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {(() => {
                    const connections = diagram.data.connections;
                    const nodes = diagram.data.nodes;
                    
                    // 노드 ID를 순서 번호로 변환하는 함수
                    const getNodeOrder = (noteId: string) => {
                      const node = nodes.find((n: any) => n.noteId === noteId);
                      return node ? node.order : 0;
                    };
                    
                    // 연결관계를 서술적으로 변환하는 함수
                    const getRelationshipDescription = (connection: any) => {
                      const sourceOrder = getNodeOrder(connection.sourceNoteId);
                      const targetOrder = getNodeOrder(connection.targetNoteId);
                      
                      const relationshipMap: { [key: string]: string } = {
                        'cause-effect': '인과',
                        'before-after': '전후', 
                        'foundation-extension': '기반-확장',
                        'contains': '포함',
                        'contrast': '대조'
                      };
                      
                      const relationship = relationshipMap[connection.relationshipType] || '연결';
                      
                      return `(${sourceOrder}) - ${relationship} - (${targetOrder})`;
                    };
                    
                    // 최대 8개까지만 표시
                    return connections.slice(0, 8).map((connection: any, index: number) => {
                      const description = getRelationshipDescription(connection);
                      
                      return (
                        <div key={connection.id || index} className="text-xs text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                          {description}
                        </div>
                      );
                    });
                  })()}
                </div>
                {diagram.data.connections.length > 8 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{diagram.data.connections.length - 8}개 더...
                  </div>
                )}
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
                 <div className="sticky bottom-0 left-0 right-0 p-2 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
                    <button 
                        onClick={() => setJourneyVisible(!isJourneyVisible)}
                        className="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-semibold"
                    >
                        <span>지식 성장 여정</span>
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
                  <h3 className="font-bold text-lg text-yellow-300 break-words">{selectedNote.content}</h3>
                  
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

                  {/* 지식연결 섹션 추가 (Inspector) */}
                  {selectedNote.relatedLinks && selectedNote.relatedLinks.length > 0 && (
                    <section>
                      <h4 className="font-semibold text-cyan-400 flex items-center mb-2"><LinkIcon className="h-4 w-4 mr-2" />지식 연결</h4>
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
