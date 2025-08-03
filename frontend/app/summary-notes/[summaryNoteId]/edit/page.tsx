'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import TSNoteCard, { TSNote, TSSessionDetails, RelatedLink } from '@/components/ts/TSNoteCard';
import FlashcardForm from '@/components/flashcard/FlashcardForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpenIcon, DocumentTextIcon, ShareIcon, TrashIcon, EllipsisVerticalIcon, ArrowPathIcon, EyeIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { RocketIcon } from 'lucide-react';
import { AiFillYoutube } from 'react-icons/ai';
import { NewspaperIcon } from '@heroicons/react/24/solid';
import { showSuccess, showError } from '@/lib/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiLinkModal } from '@/components/summary-notes/AiLinkModal';
import { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';


// BlockNote 에디터 및 리사이저블 패널 추가
import DynamicBlockNoteEditor from '@/components/editor/DynamicBlockNoteEditor';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

// Types
interface DiagramNode {
  noteId: string;           // 메모카드 ID
  content: string;          // 메모카드 내용
  order: number;            // 메모카드 순서
  color: string;            // 노드 색상
  position: {
    x: number;
    y: number;
  };
}

interface DiagramConnection {
  id: string;               // 고유 연결 ID
  sourceNoteId: string;     // 시작 메모카드 ID
  targetNoteId: string;     // 도착 메모카드 ID
  relationshipType: RelationshipType; // 5가지 관계 타입
}

interface DiagramData {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

interface SummaryNoteData {
  _id: string;
  title: string;
  description: string;
  orderedNoteIds: string[];
  bookIds: string[]; // Assuming this stores relevant book IDs for context
  tags: string[];
  userId?: string; 
  userMarkdownContent?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // 다이어그램 데이터 (1:1 대응)
  diagram?: {
    imageUrl?: string;           // SVG 이미지 URL/base64
    data?: DiagramData;          // 다이어그램 데이터
    lastModified?: string;       // 마지막 수정 시간
  };
}

// Diagram relationship types
export type RelationshipType = 'cause-effect' | 'before-after' | 'foundation-extension' | 'contains' | 'contrast';

interface RelationshipConfig {
  label: string;
  icon: string;
  color: string;
  strokeColor: string; // Added for SVG stroke color
  description: string;
}

const RELATIONSHIP_CONFIGS: Record<RelationshipType, RelationshipConfig> = {
  'cause-effect': {
    label: '원인-결과',
    icon: '→',
    color: 'text-red-400',
    strokeColor: '#f87171', // red-400
    description: 'A가 B의 원인이 됨'
  },
  'before-after': {
    label: '전-후',
    icon: '⏭️',
    color: 'text-blue-400',
    strokeColor: '#60a5fa', // blue-400
    description: '시간적 순서 관계'
  },
  'foundation-extension': {
    label: '기반-확장',
    icon: '↑',
    color: 'text-green-400',
    strokeColor: '#4ade80', // green-400
    description: 'A가 B의 기반이 됨'
  },
  'contains': {
    label: '포함',
    icon: '⊃',
    color: 'text-purple-400',
    strokeColor: '#a78bfa', // purple-400
    description: 'A가 B를 포함함'
  },
  'contrast': {
    label: '대조',
    icon: '↔',
    color: 'text-yellow-400',
    strokeColor: '#facc15', // yellow-400
    description: 'A와 B의 차이점'
  }
};

// Memo icon colors
const MEMO_ICON_COLORS = [
  'bg-blue-600',
  'bg-green-600', 
  'bg-purple-600',
  'bg-orange-600',
  'bg-red-600',
  'bg-teal-600',
  'bg-pink-600',
  'bg-indigo-600'
];

// Calculate optimal connection points on circle boundaries
const calculateOptimalConnectionPoints = (
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  radius: number
) => {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null; // Same position
  
  // Calculate unit vector from source to target
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  // Calculate connection points on circle boundaries
  const startX = sourcePos.x + unitX * radius;
  const startY = sourcePos.y + unitY * radius;
  const endX = targetPos.x - unitX * radius;
  const endY = targetPos.y - unitY * radius;
  
  return { startX, startY, endX, endY };
};

// Ensure FetchedNoteDetails inherits bookId from TSNote
interface FetchedNoteDetails extends TSNote { 
  originSession?: string; 
  sessionDetails?: TSSessionDetails;
  // relatedLinks is already part of TSNote, ensure it's correctly typed as RelatedLink[]
}

interface BookInfo {
  _id: string;
  title: string;
  // Add other fields like author or coverImage if needed later
}

// Theme (copied from books/page.tsx for consistency if needed, or use a central theme object)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
  buttonPrimaryBg: 'bg-cyan-600 hover:bg-cyan-700',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-purple-600 hover:bg-purple-700',
  buttonSecondaryHoverBg: 'hover:bg-purple-700',
  buttonDisabledBg: 'bg-gray-600 opacity-50 cursor-not-allowed',
  textAccent: 'text-cyan-400',
  bgHover: 'bg-gray-800',
};

// Related Link Tabs definition (similar to books/[id]/page.tsx but using TSNoteCard's RelatedLink type)
const relatedLinkModalTabs: { key: RelatedLink['type']; label: string; icon: React.ComponentType<any>; }[] = [
  { key: 'book',    label: '책',            icon: BookOpenIcon, },
  { key: 'paper',   label: '논문/자료',      icon: DocumentTextIcon, },
  { key: 'youtube', label: '유튜브',        icon: AiFillYoutube, },
  { key: 'media',   label: '미디어/뉴스',    icon: NewspaperIcon, },
  { key: 'website', label: '웹사이트/기타', icon: ShareIcon, },
];

export default function EditSummaryNotePage() {
  const router = useRouter();
  const params = useParams();
  const summaryNoteId = params.summaryNoteId as string;

  const [summaryNote, setSummaryNote] = useState<SummaryNoteData | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userMarkdownContent, setUserMarkdownContent] = useState('');
  const [fetchedNotes, setFetchedNotes] = useState<FetchedNoteDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changedNoteIds, setChangedNoteIds] = useState<Set<string>>(new Set());
  const [currentBookReadingPurpose, setCurrentBookReadingPurpose] = useState<string | undefined>(undefined);
  const [bookInfoMap, setBookInfoMap] = useState<Map<string, BookInfo>>(new Map());

  const [isEditing, setIsEditing] = useState(false);

  // State for Related Links Modal
  const [selectedNoteForLinkModal, setSelectedNoteForLinkModal] = useState<FetchedNoteDetails | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [currentLinkReason, setCurrentLinkReason] = useState('');
  const [activeRelatedLinkTypeTab, setActiveRelatedLinkTypeTab] = useState<RelatedLink['type']>(relatedLinkModalTabs[0].key);

  // State for Flashcard Modal
  const [noteForFlashcardModal, setNoteForFlashcardModal] = useState<FetchedNoteDetails | null>(null);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  
  // State for AI Link Modal
  const [isAiLinkModalOpen, setIsAiLinkModalOpen] = useState(false);
  
  // Diagram state
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [draggedMemo, setDraggedMemo] = useState<FetchedNoteDetails | null>(null);
  const [canvasNodes, setCanvasNodes] = useState<DiagramNode[]>([]);
  const [canvasConnections, setCanvasConnections] = useState<DiagramConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [memoIconColors, setMemoIconColors] = useState<Record<string, string>>({});
  const [diagramImageUrl, setDiagramImageUrl] = useState<string | null>(null);
  const [selectedNodeMarkdown, setSelectedNodeMarkdown] = useState<string>('');
  const [nodeMarkdownContent, setNodeMarkdownContent] = useState<Record<string, string>>({});
  
  // 데이터 가져오기 및 저장 로직 (기존 코드 유지)
  useEffect(() => {
    if (!summaryNoteId) return;

    const fetchSummaryNoteDetails = async () => {
      setLoading(true);
      setError(null);
      
      let finalNotes: FetchedNoteDetails[] = [];
      let finalBookInfoMap = new Map<string, BookInfo>();

      try {
        const summaryRes = await api.get(`/summary-notes/${summaryNoteId}`);
        const summaryData: SummaryNoteData = summaryRes.data;
        
        // 기본 정보 먼저 설정
        setSummaryNote(summaryData);
        setTitle(summaryData.title);
        setDescription(summaryData.description);
        setUserMarkdownContent(summaryData.userMarkdownContent || '');
        
        // 다이어그램 데이터 로드 및 검증
        if (summaryData.diagram) {
          console.log('[Diagram Load] Loading diagram data:', {
            hasImageUrl: !!summaryData.diagram.imageUrl,
            hasData: !!summaryData.diagram.data,
            nodeCount: summaryData.diagram.data?.nodes?.length || 0,
            connectionCount: summaryData.diagram.data?.connections?.length || 0
          });
          
          // 다이어그램 이미지 URL 설정
          setDiagramImageUrl(summaryData.diagram.imageUrl || null);
          
          // 다이어그램 데이터 검증 및 로드
          if (summaryData.diagram.data) {
            const diagramData = summaryData.diagram.data;
            
            // 노드 데이터 검증
            if (Array.isArray(diagramData.nodes)) {
              const validNodes = diagramData.nodes.filter(node => 
                node.noteId && 
                node.content && 
                typeof node.order === 'number' &&
                node.color &&
                node.position &&
                typeof node.position.x === 'number' &&
                typeof node.position.y === 'number'
              );
              
              if (validNodes.length !== diagramData.nodes.length) {
                console.warn('[Diagram Load] Some nodes were invalid and filtered out');
              }
              
              setCanvasNodes(validNodes);
            } else {
              console.warn('[Diagram Load] Invalid nodes data, using empty array');
              setCanvasNodes([]);
            }
            
            // 연결 데이터 검증
            if (Array.isArray(diagramData.connections)) {
              const validConnections = diagramData.connections.filter(conn => 
                conn.id &&
                conn.sourceNoteId &&
                conn.targetNoteId &&
                conn.relationshipType &&
                ['cause-effect', 'before-after', 'foundation-extension', 'contains', 'contrast'].includes(conn.relationshipType)
              );
              
              if (validConnections.length !== diagramData.connections.length) {
                console.warn('[Diagram Load] Some connections were invalid and filtered out');
              }
              
              setCanvasConnections(validConnections);
            } else {
              console.warn('[Diagram Load] Invalid connections data, using empty array');
              setCanvasConnections([]);
            }
          } else {
            // 다이어그램 데이터가 없는 경우 기본값 설정
            setCanvasNodes([]);
            setCanvasConnections([]);
          }
        } else {
          // 다이어그램이 없는 경우 기본값 설정
          setDiagramImageUrl(null);
          setCanvasNodes([]);
          setCanvasConnections([]);
        }

        if (summaryData.orderedNoteIds && summaryData.orderedNoteIds.length > 0) {
          const notesDetailsRes = await api.post('/notes/batch', { noteIds: summaryData.orderedNoteIds });
          let notesData: FetchedNoteDetails[] = notesDetailsRes.data;

          if (notesData.length > 0 && notesData[0].bookId) {
            try {
              const bookRes = await api.get(`/books/${notesData[0].bookId}`);
              setCurrentBookReadingPurpose(bookRes.data.readingPurpose || bookRes.data.readingGoal);
            } catch (bookErr) {
              console.warn(`Could not fetch book details for ${notesData[0].bookId}`, bookErr);
            }
          }
          
          const notesWithSessionDetails = await Promise.all(notesData.map(async (note) => {
            if (note.originSession) {
              try {
                const sessionRes = await api.get(`/sessions/${note.originSession}`);
                const sessionData = sessionRes.data;
                const sessionDetails: TSSessionDetails = {
                  createdAtISO: sessionData.createdAt,
                  durationSeconds: sessionData.durationSec,
                  startPage: sessionData.startPage,
                  actualEndPage: sessionData.actualEndPage,
                  targetPage: sessionData.endPage,
                  ppm: sessionData.ppm,
                  book: sessionData.bookId 
                };
                return { ...note, sessionDetails };
              } catch (sessionErr) {
                console.warn(`Failed to fetch session ${note.originSession} for note ${note._id}`, sessionErr);
                return { ...note, sessionDetails: undefined };
              }
            }
            return note;
          }));
          
          finalNotes = summaryData.orderedNoteIds.map(id => 
            notesWithSessionDetails.find(n => n._id === id)
          ).filter(n => n !== undefined) as FetchedNoteDetails[];

          const uniqueBookIds = Array.from(new Set(finalNotes.map(note => note.bookId).filter(Boolean)));
          if (uniqueBookIds.length > 0) {
            try {
              const booksInfoRes = await api.post('/books/batch', { bookIds: uniqueBookIds });
              booksInfoRes.data.forEach((book: BookInfo) => finalBookInfoMap.set(book._id, book));
            } catch (booksErr) {
              console.warn('Failed to fetch batch book info', booksErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch summary note details:', err);
        setError('서머리 노트를 불러오는 중 잠시 멈춤이 있어요. 조금 후에 다시 시도해 볼래요?');
      } finally {
        // 모든 데이터가 준비된 후 한 번에 상태를 설정합니다.
        setFetchedNotes(finalNotes);
        setBookInfoMap(finalBookInfoMap);
        setLoading(false);
      }
    };
    fetchSummaryNoteDetails();
  }, [summaryNoteId]);

  const handleNoteUpdate = useCallback((updatedFields: Partial<FetchedNoteDetails>) => {
    setFetchedNotes(prevNotes =>
      prevNotes.map(note =>
        note._id === (updatedFields._id || note._id) ? { ...note, ...updatedFields } : note
      )
    );
    if (updatedFields._id) {
      setChangedNoteIds(prev => new Set(prev).add(updatedFields._id!));
    }
  }, []);

  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (summaryNote) {
      setTitle(summaryNote.title);
      setDescription(summaryNote.description);
      setUserMarkdownContent(summaryNote.userMarkdownContent || '');
      // To revert changes in fetchedNotes, re-fetch or store initial state
      // For simplicity, this example doesn't revert individual note edits on cancel
      // but you might want to add that if changedNoteIds is not cleared or notes are not re-fetched
    }
  };

  const handleSaveSummaryNote = async () => {
    if (!summaryNote) return false;
    
    // 메모가 없는 경우 저장을 방지하고 알림 표시
    if (fetchedNotes.length === 0) {
      showError('메모가 없는 서머리 노트는 저장할 수 없습니다. 메모를 추가해 주세요.');
      return false;
    }

    setLoading(true);
    try {
      if (changedNoteIds.size > 0) {
        const updatePromises = Array.from(changedNoteIds).map(noteId => {
          const noteToUpdate = fetchedNotes.find(n => n._id === noteId);
          if (noteToUpdate) {
            const { _id, userId, bookId, originSession, sessionDetails, ...updatableFields } = noteToUpdate;
            return api.put(`/notes/${noteId}`, updatableFields);
          }
          return Promise.resolve();
        });
        await Promise.all(updatePromises);
      }

      const updatedSummaryNoteData = {
        title,
        description,
        orderedNoteIds: fetchedNotes.map(n => n._id),
        userMarkdownContent,
        diagram: {
          imageUrl: diagramImageUrl || undefined,
          data: {
            nodes: canvasNodes,
            connections: canvasConnections
          },
          lastModified: new Date().toISOString()
        }
      };
      await api.put(`/summary-notes/${summaryNote._id}`, updatedSummaryNoteData);
      
      setChangedNoteIds(new Set());
      showSuccess('서머리 노트가 성공적으로 저장되었습니다.');
      setSummaryNote(prev => prev ? { 
        ...prev, 
        diagram: {
          imageUrl: diagramImageUrl || undefined,
          data: {
            nodes: canvasNodes,
            connections: canvasConnections
          },
          lastModified: new Date().toISOString()
        }
      } : null);
      return true;
    } catch (err: any) {
      console.error('Failed to save summary note:', err);
      showError('서머리 노트 저장이 지금은 어려워요. 조금 있다 다시 해볼래요?');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndToggleMode = async () => {
    const success = await handleSaveSummaryNote();
    if (success) {
      setIsEditing(false); 
    }
  };
  
  const handleDeleteSummaryNote = async () => {
    if (!summaryNoteId) return;
    if (window.confirm('이 서머리 노트를 정말 삭제하시겠습니까? 연결된 1줄 메모는 삭제되지 않습니다.')) {
      setLoading(true);
      try {
        await api.delete(`/summary-notes/${summaryNoteId}`);
        showSuccess('서머리 노트가 삭제되었습니다.');
        router.push('/books?tab=summary'); // Redirect to My Library, summary tab
      } catch (err) {
        console.error('Failed to delete summary note:', err);
        showError('서머리 노트 삭제가 지금은 어려워요. 잠시 후에 다시 시도해 볼까요?');
        setLoading(false);
      }
    }
  };

  const handleReorderNote = (noteId: string, direction: 'up' | 'down') => {
    setFetchedNotes(prevNotes => {
      const index = prevNotes.findIndex(n => n._id === noteId);
      if (index === -1) return prevNotes;
      if (direction === 'up' && index === 0) return prevNotes;
      if (direction === 'down' && index === prevNotes.length - 1) return prevNotes;

      const newNotes = [...prevNotes];
      const noteToMove = newNotes.splice(index, 1)[0];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      newNotes.splice(newIndex, 0, noteToMove);
      
      // Mark summary note as changed because orderedNoteIds will change
      // (though individual notes within it haven't changed content)
      // For simplicity, we can just let handleSaveSummaryNote always send the current order.
      return newNotes;
    });
  };

  // Related Links Modal Handlers
  const handleAddRelatedLinkInModal = async () => {
    if (!selectedNoteForLinkModal || !currentLinkUrl.trim()) return;
    
    const newLink: RelatedLink = {
      type: activeRelatedLinkTypeTab,
      url: currentLinkUrl.trim(),
      reason: currentLinkReason.trim() || undefined,
    };

    const updatedRelatedLinks = [...(selectedNoteForLinkModal.relatedLinks || []), newLink];
    
    setFetchedNotes(prevNotes =>
      prevNotes.map(n =>
        n._id === selectedNoteForLinkModal._id
          ? { ...n, relatedLinks: updatedRelatedLinks }
          : n
      )
    );
    setChangedNoteIds(prev => new Set(prev).add(selectedNoteForLinkModal._id!));

    setCurrentLinkUrl('');
    setCurrentLinkReason('');
    // setShowLinkModal(false); // Optionally close modal, or allow adding more
    showSuccess('링크가 추가되었습니다. 저장 버튼을 눌러야 최종 반영됩니다.');
  };

  const handleDeleteRelatedLinkInModal = async (linkIndexToDelete: number) => {
    if (!selectedNoteForLinkModal) return;
    
    const updatedLinks = (selectedNoteForLinkModal.relatedLinks || []).filter((_, index) => index !== linkIndexToDelete);
    
    try {
      await api.put(`/notes/${selectedNoteForLinkModal._id}`, {
        relatedLinks: updatedLinks
      });
      
      // Update local state
      setFetchedNotes(prev => prev.map(note => 
        note._id === selectedNoteForLinkModal._id 
          ? { ...note, relatedLinks: updatedLinks }
          : note
      ));
      
      showSuccess('연결된 지식이 삭제되었습니다.');
      setShowLinkModal(false);
      setSelectedNoteForLinkModal(null);
    } catch (err) {
      console.error('Failed to delete related link:', err);
      showError('연결된 지식 삭제가 지금은 어려워요. 잠시 후에 다시 시도해 볼까요?');
    }
  };

  // SVG 다이어그램 생성 함수
  const generateDiagramSVG = () => {
    if (canvasNodes.length === 0) return null;
    
    const width = 800;
    const height = 600;
    const padding = 50;
    
    // 노드 위치 정규화
    const minX = Math.min(...canvasNodes.map(n => n.position.x));
    const maxX = Math.max(...canvasNodes.map(n => n.position.x));
    const minY = Math.min(...canvasNodes.map(n => n.position.y));
    const maxY = Math.max(...canvasNodes.map(n => n.position.y));
    
    const scaleX = (width - 2 * padding) / (maxX - minX || 1);
    const scaleY = (height - 2 * padding) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY, 1);
    
    const normalizePosition = (pos: any) => ({
      x: padding + (pos.x - minX) * scale,
      y: padding + (pos.y - minY) * scale
    });
    
    const nodeElements = canvasNodes.map(node => {
      const pos = normalizePosition(node.position);
      const color = node.color.replace('bg-', '').replace('-600', '');
      const fillColorMap: Record<string, string> = {
        'blue': '#2563eb',
        'green': '#16a34a',
        'purple': '#9333ea',
        'orange': '#ea580c',
        'red': '#dc2626',
        'teal': '#0d9488',
        'pink': '#db2777',
        'indigo': '#4f46e5'
      };
      const fillColor = fillColorMap[color] || '#2563eb';
      
      return `
        <circle cx="${pos.x}" cy="${pos.y}" r="25" fill="${fillColor}" stroke="#1f2937" stroke-width="2"/>
        <text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${node.order}</text>
      `;
    }).join('');
    
    const connectionElements = canvasConnections.map(connection => {
      const sourceNode = canvasNodes.find(n => n.noteId === connection.sourceNoteId);
      const targetNode = canvasNodes.find(n => n.noteId === connection.targetNoteId);
      
      if (!sourceNode || !targetNode) return '';
      
      const sourcePos = normalizePosition(sourceNode.position);
      const targetPos = normalizePosition(targetNode.position);
      const config = RELATIONSHIP_CONFIGS[connection.relationshipType as RelationshipType];
      const strokeColor = config.strokeColor;
      
      // Calculate optimal connection points on circle boundaries
      const nodeRadius = 25; // SVG에서 사용하는 반지름
      const connectionPoints = calculateOptimalConnectionPoints(
        sourcePos,
        targetPos,
        nodeRadius
      );
      
      if (!connectionPoints) return '';
      
      const { startX, startY, endX, endY } = connectionPoints;
      
      // Calculate midpoint for relationship indicator
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      return `
        <defs>
          <marker id="arrow-${connection.id}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="${strokeColor}"/>
          </marker>
        </defs>
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" 
              stroke="${strokeColor}" stroke-width="3" 
              marker-end="url(#arrow-${connection.id})"/>
        <circle cx="${midX}" cy="${midY}" r="10" fill="${strokeColor}" stroke="#1f2937" stroke-width="1"/>
        <text x="${midX}" y="${midY + 3}" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${config.icon}</text>
      `;
    }).join('');
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f8fafc"/>
        ${nodeElements}
        ${connectionElements}
      </svg>
    `;
  };

  // 다이어그램을 이미지로 저장
  const saveDiagramAsImage = async () => {
    const svg = generateDiagramSVG();
    if (!svg) {
      showError('저장할 다이어그램이 없습니다.');
      return;
    }
    
    // 다이어그램 데이터 검증
    if (canvasNodes.length === 0) {
      showError('캔버스에 노드가 없습니다. 먼저 메모 아이콘을 캔버스에 배치해 주세요.');
      return;
    }
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setDiagramImageUrl(url);
    
    try {
      // SVG를 base64로 변환
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const svgDataUrl = base64Data;
        
        // 다이어그램 데이터 구조 검증
        const diagramData: DiagramData = {
          nodes: canvasNodes.map(node => ({
            noteId: node.noteId,
            content: node.content,
            order: node.order,
            color: node.color,
            position: {
              x: node.position.x,
              y: node.position.y
            }
          })),
          connections: canvasConnections.map(conn => ({
            id: conn.id,
            sourceNoteId: conn.sourceNoteId,
            targetNoteId: conn.targetNoteId,
            relationshipType: conn.relationshipType
          }))
        };
        
        // SummaryNote에 다이어그램 데이터 저장
        const updatedSummaryNoteData = {
          title,
          description,
          orderedNoteIds: fetchedNotes.map(n => n._id),
          userMarkdownContent,
          diagram: {
            imageUrl: svgDataUrl,
            data: diagramData,
            lastModified: new Date().toISOString()
          }
        };
        
        console.log('[Diagram Save] Saving diagram data:', {
          nodeCount: diagramData.nodes.length,
          connectionCount: diagramData.connections.length,
          summaryNoteId
        });
        
        await api.put(`/summary-notes/${summaryNoteId}`, updatedSummaryNoteData);
        showSuccess('다이어그램이 저장되었습니다.');
        
        // 로컬 상태 업데이트
        setSummaryNote(prev => prev ? { 
          ...prev, 
          diagram: {
            imageUrl: svgDataUrl,
            data: diagramData,
            lastModified: new Date().toISOString()
          }
        } : null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('[Diagram Save Error]', err);
      showError('다이어그램 저장이 지금은 어려워요. 잠시 후에 다시 시도해 볼까요?');
    }
  };

  // Flashcard Modal Handlers
  // ... (기존 플래시카드 모달 핸들러 코드) ...

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10 p-4 bg-red-900/20 rounded-md">{error}</div>;
  if (!summaryNote) return <div className="text-center mt-10">찾으시는 노트를 찾고 있습니다. 잠시 후 다시 시도해 볼래요?</div>;

  const displayDate = summaryNote?.updatedAt && summaryNote.updatedAt !== summaryNote.createdAt
    ? <>Last updated: <ClientDateDisplay createdAt={summaryNote.updatedAt} /></>
    : summaryNote?.createdAt
    ? <>Created: <ClientDateDisplay createdAt={summaryNote.createdAt} /></>
    : null;

  return (
    <div className={`min-h-screen ${cyberTheme.bgPrimary} ${cyberTheme.textLight} px-4 md:px-6 lg:px-8`}>
      <AiLinkModal
        isOpen={isAiLinkModalOpen}
        onOpenChange={setIsAiLinkModalOpen}
        summaryNoteId={summaryNoteId}
      />
      <div className="max-w-7xl mx-auto">
        {/* 나의 도서관으로 이동하는 버튼 */}
        <div className="mb-6">
          <Button
            onClick={() => {
              // 저장되지 않은 변경사항이 있는지 확인
              if (isEditing || changedNoteIds.size > 0) {
                if (confirm('저장되지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?')) {
                  router.push('/books');
                }
              } else {
                router.push('/books');
              }
            }}
            variant="ghost"
            size="sm"
            aria-label="나의 도서관으로 이동"
            className={`flex items-center gap-1 text-sm ${cyberTheme.textAccent} hover:${cyberTheme.bgHover} transition-all duration-200`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>My Lib</span>
          </Button>
        </div>
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-y-4 md:gap-y-5">
          <div className='flex-grow'>
            {isEditing ? (
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className={`text-3xl font-bold ${cyberTheme.inputBg} ${cyberTheme.inputBorder} ${cyberTheme.textLight} focus:ring-cyan-500 focus:border-cyan-500 w-full`}
              />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                <h1 className={`text-3xl md:text-4xl font-bold ${cyberTheme.primary} break-all`}>{title}</h1>
                {displayDate && (
                  <span className="text-sm italic text-gray-500 mt-2 sm:mt-0">{displayDate}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0 flex-shrink-0">
            {isEditing ? (
              <>
                <Button onClick={handleSaveAndToggleMode} className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}>
                  <ArrowPathIcon className="w-5 h-5 mr-2" /> 저장
                </Button>
                <Button onClick={handleCancel} variant="outline" className={`${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} border-gray-600 hover:border-gray-500`}>
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsAiLinkModalOpen(true)} className={`${cyberTheme.buttonPrimaryBg}`}>
                  <RocketIcon className="w-5 h-5 mr-2" /> AI 링크 생성
                </Button>
                <Button onClick={handleEditToggle} className={`${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg}`}>
                  <PencilIcon className="w-5 h-5 mr-2" /> 편집하기
                </Button>
                {canvasNodes.length > 0 && (
                  <Button onClick={saveDiagramAsImage} className="bg-green-600 hover:bg-green-700 text-white">
                    벡터 그래프 저장
                  </Button>
                )}
              </>
            )}
            {/* Dropdown Menu for Delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <EllipsisVerticalIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${cyberTheme.bgSecondary} border-gray-700 text-gray-200`}>
                <DropdownMenuItem onClick={handleDeleteSummaryNote} className="hover:bg-red-900/50 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-900/50">
                  <TrashIcon className="mr-2 h-4 w-4" />
                  <span>이 노트 삭제</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Description Section */}
        <div className={isEditing ? `mb-6 md:mb-8 p-4 md:p-5 lg:p-6 rounded-lg shadow-xl border border-gray-700/50 bg-gray-800/70` : `mb-6 md:mb-8 py-2`}>
          {isEditing ? (
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="선택한 메모카드의 공통주제를 뽑고, 깊이 이해하여 인사이트를 도출하는 공간입니다. 독서 및 학습일지, 각종 과제, 보고서를 작성할 수 있어요."
              rows={3}
              className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:ring-cyan-500 focus:border-cyan-500 w-full ${cyberTheme.textLight}`}
            />
          ) : (
            <p className={`text-lg whitespace-pre-wrap ${description ? cyberTheme.textLight : cyberTheme.textMuted}`}>
              {description || '설명이 없습니다.'}
            </p>
          )}
        </div>

        <hr className="border-gray-700/50 mb-8" />

        {/* Main Content Area: 3-Panel Layout */}
        <PanelGroup direction="horizontal" className="flex flex-col md:flex-row h-[calc(100vh-300px)] md:h-[calc(100vh-280px)]">
          {/* Left Panel: Notes List */}
          <Panel minSize={25} defaultSize={30} className="overflow-y-auto pr-2 pb-6 h-full summary-scrollbar">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-300 mb-4 text-center">Memo Card</h3>
              {fetchedNotes.length > 0 ? (
                fetchedNotes.map((note, idx) => {
                  const noteBookTitle = bookInfoMap.get(note.bookId)?.title;

                  return (
                    <div key={note._id} className="p-2 relative group bg-gray-800/60 rounded-md">
                      {/* Order Badge */}
                      <div className="absolute left-1 top-1 z-20">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                          {idx + 1}
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="absolute left-0 top-0 z-10 flex space-x-1 ml-6">
                          <button 
                            onClick={() => handleReorderNote(note._id, 'up')}
                            disabled={idx === 0}
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            title="위로 이동"
                          >
                            ↑
                          </button>
                          <button 
                            onClick={() => handleReorderNote(note._id, 'down')}
                            disabled={idx === fetchedNotes.length - 1}
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${idx === fetchedNotes.length - 1 ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            title="아래로 이동"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                      <TSNoteCard 
                        note={note} 
                        onUpdate={handleNoteUpdate}
                        onFlashcardConvert={(note) => {
                          setNoteForFlashcardModal(note);
                          setShowFlashcardModal(true);
                        }}
                        onRelatedLinks={(note) => {
                          setSelectedNoteForLinkModal(note);
                          setShowLinkModal(true);
                          if (note.relatedLinks && note.relatedLinks.length > 0) {
                            setActiveRelatedLinkTypeTab(note.relatedLinks[0].type);
                          }
                        }}
                        sessionDetails={note.sessionDetails}
                        readingPurpose={currentBookReadingPurpose || 'humanities_self_reflection'}
                        isPageEditing={false}
                        bookTitle={noteBookTitle}
                      />
                    </div>
                  );
                })
              ) : (
                <p className={`${cyberTheme.textMuted}`}>포함된 1줄 메모카드가 없습니다.</p>
              )}
            </div>
          </Panel>
          
          {/* Resize Handle 1 */}
          <PanelResizeHandle className="hidden sm:block w-[1px] bg-gray-600/30 hover:bg-cyan-500/50 active:bg-cyan-400 transition-colors duration-200 cursor-col-resize" />

          {/* Center Panel: Diagram Canvas */}
          <Panel minSize={30} defaultSize={40} className="overflow-hidden bg-gray-800/30">
            <div className="h-full flex flex-col">
              <h3 className="text-xl font-semibold text-gray-300 mb-4 text-center">Ontology Canvas</h3>
              
              <div className="p-4 border-b border-gray-700/50">
                {/* Relationship Selection Toolbar */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-300 mr-3">관계 선택:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                    {Object.entries(RELATIONSHIP_CONFIGS).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedRelationship(selectedRelationship === type ? null : type as RelationshipType);
                          setIsDrawingMode(selectedRelationship !== type);
                        }}
                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center min-w-[70px] ${
                          selectedRelationship === type
                            ? `${config.color} bg-gray-700 border-2 border-gray-500 shadow-lg`
                            : `text-gray-400 hover:${config.color} hover:bg-gray-700 border border-transparent`
                        }`}
                        title={config.description}
                      >
                        <span className="mr-1 text-sm">{config.icon}</span>
                        <span className="leading-none">{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Connection Instructions */}
                {selectedRelationship && canvasNodes.length >= 2 && (
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-500/50 rounded-md">
                    <h4 className="text-sm font-medium text-green-300 mb-1">🔗 연결 방법</h4>
                    <p className="text-xs text-green-400">
                      <strong>1단계:</strong> {RELATIONSHIP_CONFIGS[selectedRelationship].label} 관계를 선택했습니다<br/>
                      <strong>2단계:</strong> 연결할 첫 번째 노드를 클릭하세요<br/>
                      <strong>3단계:</strong> 연결할 두 번째 노드를 클릭하세요
                    </p>
                  </div>
                )}
                
                {/* Drawing Mode Indicator */}
                {isDrawingMode && selectedRelationship && (
                  <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/50 rounded-md">
                    <p className="text-sm text-blue-300">
                      <span className="font-medium">그리기 모드:</span> {RELATIONSHIP_CONFIGS[selectedRelationship].label}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                      캔버스에서 관계를 그려보세요
                    </p>
                  </div>
                )}
                
                {/* Connection Mode Indicator */}
                {isConnecting && connectionStart && (
                  <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded-md">
                    <p className="text-sm text-red-300">
                      <span className="font-medium">연결 모드:</span> {RELATIONSHIP_CONFIGS[selectedRelationship!].label}
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      연결할 노드를 클릭하세요
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-grow p-4">
                {/* Canvas with Icon Palette */}
                <div className="h-full bg-gray-900/30 rounded-lg border border-gray-700/50 relative">
                  {/* Icon Palette - Top Left */}
                  <div className="absolute top-4 left-4 z-10 bg-gray-800/90 rounded-lg p-2 border border-gray-600 shadow-lg max-h-32 overflow-hidden">
                    <h4 className="text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                      <span className="text-blue-400">📋</span>
                      메모 아이콘 ({fetchedNotes.length})
                    </h4>
                    <div className="flex flex-wrap gap-1 max-w-56">
                      {fetchedNotes.map((note, idx) => {
                        const defaultColor = MEMO_ICON_COLORS[idx % MEMO_ICON_COLORS.length];
                        const currentColor = memoIconColors[note._id] || defaultColor;
                        
                        return (
                          <div
                            key={note._id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({
                                id: note._id,
                                content: note.content,
                                order: idx + 1,
                                color: currentColor
                              }));
                              // 드래그 시 시각적 피드백
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.opacity = '0.7';
                            }}
                            onDragEnd={(e) => {
                              // 드래그 종료 시 원래 상태로 복원
                              e.currentTarget.style.transform = '';
                              e.currentTarget.style.opacity = '';
                            }}
                            className={`w-6 h-6 ${currentColor} rounded-full flex items-center justify-center text-white text-xs font-bold cursor-move hover:scale-110 transition-all shadow-md hover:shadow-lg border-2 border-transparent hover:border-white/30`}
                            title={`${idx + 1}번: ${note.content.substring(0, 20)}...`}
                            onClick={() => {
                              // Color selection modal or dropdown
                              const currentIndex = MEMO_ICON_COLORS.indexOf(currentColor);
                              const nextColor = MEMO_ICON_COLORS[(currentIndex + 1) % MEMO_ICON_COLORS.length];
                              setMemoIconColors(prev => ({
                                ...prev,
                                [note._id]: nextColor
                              }));
                            }}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      <p className="text-xs">💡 드래그 배치 • 🎨 클릭 색상변경</p>
                    </div>
                  </div>
                  
                  {/* Canvas Area */}
                  <div 
                    className="h-full w-full transition-all duration-200"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                      e.currentTarget.style.border = '2px dashed rgba(59, 130, 246, 0.8)';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.border = '';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.border = '';
                      
                      try {
                        const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
                        const newNode = {
                          noteId: droppedData.id,
                          content: droppedData.content,
                          order: droppedData.order,
                          color: droppedData.color || 'bg-blue-600',
                          position: {
                            x: e.clientX - e.currentTarget.getBoundingClientRect().left,
                            y: e.clientY - e.currentTarget.getBoundingClientRect().top
                          }
                        };
                        
                        setCanvasNodes(prev => [...prev, newNode]);
                      } catch (error) {
                        console.error('Failed to parse dropped data:', error);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Delete key to remove selected node
                      if (e.key === 'Delete' && selectedNode) {
                        setCanvasNodes(prev => prev.filter(node => node.noteId !== selectedNode));
                        setCanvasConnections(prev => prev.filter(conn => 
                          conn.sourceNoteId !== selectedNode && conn.targetNoteId !== selectedNode
                        ));
                        setSelectedNode(null);
                        setSelectedNodeMarkdown('');
                      }
                    }}
                    tabIndex={0}
                  >
                    {/* Connection Guide */}
                    {canvasNodes.length >= 2 && !selectedRelationship && (
                      <div className="absolute top-4 right-4 z-10 bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 max-w-48">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">🔗 연결 방법</h4>
                        <p className="text-xs text-blue-400">
                          1. 상단에서 관계 타입 선택<br/>
                          2. 첫 번째 노드 클릭<br/>
                          3. 두 번째 노드 클릭
                        </p>
                      </div>
                    )}
                    
                    {/* Existing Nodes */}
                    {canvasNodes.map((node) => (
                      <div
                        key={node.noteId}
                        className={`absolute ${node.color} text-white rounded-full p-2 text-sm font-medium shadow-lg cursor-move ${
                          selectedNode === node.noteId ? 'ring-2 ring-yellow-400' : ''
                        } ${connectionStart === node.noteId ? 'ring-2 ring-red-400' : ''}`}
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          transform: 'translate(-50%, -50%)',
                          width: '40px',
                          height: '40px'
                        }}
                        draggable
                        onDragStart={(e) => {
                          // 드래그 시작 시 시각적 피드백
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                          // 불필요한 데이터 전송 제거
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDrag={(e) => {
                          // 드래그 중 위치 업데이트
                          if (e.clientX !== 0 && e.clientY !== 0) {
                            const canvasRect = e.currentTarget.parentElement?.getBoundingClientRect();
                            if (canvasRect) {
                              const newX = e.clientX - canvasRect.left;
                              const newY = e.clientY - canvasRect.top;
                              
                              setCanvasNodes(prev => prev.map(n => 
                                n.noteId === node.noteId 
                                  ? { ...n, position: { x: newX, y: newY } }
                                  : n
                              ));
                            }
                          }
                        }}
                        onDragEnd={(e) => {
                          // 드래그 종료 시 원래 상태로 복원
                          e.currentTarget.style.opacity = '';
                          e.currentTarget.style.transform = 'translate(-50%, -50%)';
                          // 드래그 후 클릭 이벤트 방지
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          // 드래그 후 클릭 이벤트 방지
                          if (e.detail === 0) return;
                          
                          if (isConnecting && connectionStart && connectionStart !== node.noteId) {
                            // Create connection
                            const newConnection = {
                              id: `${connectionStart}-${node.noteId}`,
                              sourceNoteId: connectionStart,
                              targetNoteId: node.noteId,
                              relationshipType: selectedRelationship || 'cause-effect'
                            };
                            setCanvasConnections(prev => [...prev, newConnection]);
                            setIsConnecting(false);
                            setConnectionStart(null);
                          } else if (selectedRelationship) {
                            // Start connection
                            setIsConnecting(true);
                            setConnectionStart(node.noteId);
                            setSelectedNode(node.noteId);
                          } else {
                            // Just select node
                            setSelectedNode(selectedNode === node.noteId ? null : node.noteId);
                            
                            // Load node's markdown content
                            if (selectedNode !== node.noteId) {
                              const nodeContent = nodeMarkdownContent[node.noteId] || '';
                              setSelectedNodeMarkdown(nodeContent);
                            }
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (confirm(`노드 ${node.order}번을 삭제하시겠습니까?`)) {
                            setCanvasNodes(prev => prev.filter(n => n.noteId !== node.noteId));
                            setCanvasConnections(prev => prev.filter(conn => 
                              conn.sourceNoteId !== node.noteId && conn.targetNoteId !== node.noteId
                            ));
                            if (selectedNode === node.noteId) {
                              setSelectedNode(null);
                              setSelectedNodeMarkdown('');
                            }
                          }
                        }}
                        title={`노드 ${node.order}번 (드래그로 이동, 우클릭으로 삭제)`}
                      >
                        <div className="flex items-center justify-center h-full relative">
                          <span className="text-sm font-bold">
                            {node.order}
                          </span>
                          {/* Markdown content indicator */}
                          {nodeMarkdownContent[node.noteId] && nodeMarkdownContent[node.noteId].trim() && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Connections */}
                    {canvasConnections.map((connection) => {
                      const sourceNode = canvasNodes.find(n => n.noteId === connection.sourceNoteId);
                      const targetNode = canvasNodes.find(n => n.noteId === connection.targetNoteId);
                      const config = RELATIONSHIP_CONFIGS[connection.relationshipType as RelationshipType];
                      
                      if (!sourceNode || !targetNode) return null;
                      
                      // Calculate optimal connection points on circle boundaries
                      const nodeRadius = 20; // 40px diameter / 2
                      const connectionPoints = calculateOptimalConnectionPoints(
                        sourceNode.position,
                        targetNode.position,
                        nodeRadius
                      );
                      
                      if (!connectionPoints) return null;
                      
                      const { startX, startY, endX, endY } = connectionPoints;
                      
                      // Calculate midpoint for relationship indicator
                      const midX = (startX + endX) / 2;
                      const midY = (startY + endY) / 2;
                      
                      return (
                        <svg
                          key={connection.id}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ zIndex: 1 }}
                        >
                          <defs>
                            <marker
                              id={`arrow-${connection.relationshipType}`}
                              markerWidth="10"
                              markerHeight="10"
                              refX="9"
                              refY="3"
                              orient="auto"
                              markerUnits="strokeWidth"
                            >
                              <path
                                d="M0,0 L0,6 L9,3 z"
                                fill={config.strokeColor}
                              />
                            </marker>
                          </defs>
                          <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke={config.strokeColor}
                            strokeWidth="2"
                            markerEnd={`url(#arrow-${connection.relationshipType})`}
                            className="cursor-pointer"
                            onClick={() => {
                              // Remove connection
                              setCanvasConnections(prev => 
                                prev.filter(c => c.id !== connection.id)
                              );
                            }}
                          />
                          {/* Relationship indicator at midpoint */}
                          <circle
                            cx={midX}
                            cy={midY}
                            r="8"
                            fill={config.strokeColor}
                            stroke="#1f2937"
                            strokeWidth="1"
                            className="cursor-pointer"
                            onClick={() => {
                              // Remove connection
                              setCanvasConnections(prev => 
                                prev.filter(c => c.id !== connection.id)
                              );
                            }}
                          />
                          <text
                            x={midX}
                            y={midY + 2}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                            className="cursor-pointer"
                            onClick={() => {
                              // Remove connection
                              setCanvasConnections(prev => 
                                prev.filter(c => c.id !== connection.id)
                              );
                            }}
                          >
                            {config.icon}
                          </text>
                        </svg>
                      );
                    })}
                    
                    {/* Empty Canvas Message */}
                    {canvasNodes.length === 0 && (
                      <div className="text-center text-gray-400 pt-20">
                        <div className="text-4xl mb-2"></div>
                        <p className="text-sm"></p>
                        <p className="text-xs mt-1"></p>
                        {selectedRelationship && (
                          <div className="mt-4 p-2 bg-gray-800/50 rounded max-w-xs mx-auto">
                            <p className="text-xs text-gray-300">
                              선택된 관계: {RELATIONSHIP_CONFIGS[selectedRelationship].label}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Resize Handle 2 */}
          <PanelResizeHandle className="hidden sm:block w-[1px] bg-gray-600/30 hover:bg-cyan-500/50 active:bg-cyan-400 transition-colors duration-200 cursor-col-resize" />

          {/* Right Panel: Markdown Editor */}
          <Panel minSize={25} defaultSize={30} className="overflow-y-auto pl-2 md:pl-4 bg-opacity-50 bg-black/10 rounded-lg flex flex-col h-full">
             <h3 className="text-xl font-semibold text-gray-300 mb-4 text-center">
              {selectedNode ? (
                <div className="flex items-center justify-center gap-3">
                  <span>Deep Dive</span>
                  <span className="text-sm text-gray-400">
                    (노드 {canvasNodes.find(n => n.noteId === selectedNode)?.order}번)
                  </span>
                  <Button
                    onClick={() => {
                      setSelectedNode(null);
                      setSelectedNodeMarkdown('');
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-200"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                'Deep Dive'
              )}
              </h3>
            <div className="flex-grow h-full">
              <DynamicBlockNoteEditor
                initialContent={selectedNode ? selectedNodeMarkdown : userMarkdownContent}
                onChange={(content) => {
                  if (selectedNode) {
                    // Update node's markdown content
                    setNodeMarkdownContent(prev => ({
                      ...prev,
                      [selectedNode]: content
                    }));
                    setSelectedNodeMarkdown(content);
                  } else {
                    // Update main markdown content
                    setUserMarkdownContent(content);
                  }
                }}
                editable={isEditing}
                className="h-full"
              />
            </div>
          </Panel>
        </PanelGroup>

        {/* Saved Diagram Display */}
        {(diagramImageUrl || summaryNote?.diagram?.imageUrl) && (
          <div className="mt-8 p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <h3 className={`text-xl font-semibold mb-4 ${cyberTheme.primary}`}>
              📊 저장된 다이어그램
            </h3>
            <div className="flex justify-center">
              <img 
                src={diagramImageUrl || summaryNote?.diagram?.imageUrl} 
                alt="관계 다이어그램" 
                className="max-w-full h-auto rounded-lg shadow-lg border border-gray-600"
                style={{ maxHeight: '400px' }}
              />
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Button 
                onClick={() => {
                  const imageUrl = diagramImageUrl || summaryNote?.diagram?.imageUrl;
                  if (imageUrl) {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `diagram-${summaryNoteId}.svg`;
                    link.click();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                📥 다운로드
              </Button>
              <Button 
                onClick={() => setDiagramImageUrl(null)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                ❌ 숨기기
              </Button>
            </div>
          </div>
        )}

        {/* Modals (Flashcard, Related Links) */}
        {showFlashcardModal && noteForFlashcardModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-0 rounded-lg shadow-xl max-w-lg w-full border border-purple-500/50 relative">
              {/* FlashcardForm expects white background, so added a wrapper or adjust FlashcardForm theme */}
              <FlashcardForm
                bookId={noteForFlashcardModal.bookId} 
                note={noteForFlashcardModal} // Pass the full note object, changed from noteContext
                onCreated={(createdCard) => {
                  console.log('Flashcard created/updated:', createdCard);
                  showSuccess(`복습 카드가 성공적으로 ${createdCard.question.includes(noteForFlashcardModal.content.substring(0,10)) ? '생성' : '수정'}되었습니다!`); // Basic feedback
                  setShowFlashcardModal(false);
                  setNoteForFlashcardModal(null);
                }}
                onCancel={() => {
                  setShowFlashcardModal(false);
                  setNoteForFlashcardModal(null);
                }}
                // To use existing flashcard edit functionality, you'd need to fetch if a flashcard exists for this note
                // and pass its 'editId'. For now, this will always create.
              />
            </div>
          </div>
        )}
        {showLinkModal && selectedNoteForLinkModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className={`bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-cyan-500/50 relative ${cyberTheme.textLight}`}>
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                연결 지식: "{selectedNoteForLinkModal.content.substring(0,30)}..."
              </h3>
              
              {/* Link Type Tabs */}
              <div className="flex space-x-1 border-b border-gray-700 mb-4">
                  {relatedLinkModalTabs.map(tab => (
                      <button
                          key={tab.key}
                          onClick={() => setActiveRelatedLinkTypeTab(tab.key)}
                          className={`px-3 py-1.5 text-xs rounded-t-md ${activeRelatedLinkTypeTab === tab.key ? 'bg-cyan-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                          <tab.icon className="w-3 h-3 mr-1.5 inline"/>{tab.label}
                      </button>
                  ))}
              </div>

              {/* Form to add new related link */}
              <div className="mb-4 p-3 bg-gray-700/50 rounded-md space-y-3">
                <h4 className="text-sm font-medium text-gray-300">
                  새 '{relatedLinkModalTabs.find(t => t.key === activeRelatedLinkTypeTab)?.label}' 링크 추가
                </h4>
                <Input
                  type="url"
                  placeholder="링크 URL"
                  value={currentLinkUrl}
                  onChange={(e) => setCurrentLinkUrl(e.target.value)}
                  className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:border-cyan-500`}
                />
                <Textarea
                  placeholder="이 링크를 연결하는 이유 (선택 사항)"
                  value={currentLinkReason}
                  onChange={(e) => setCurrentLinkReason(e.target.value)}
                  className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:border-cyan-500`}
                  rows={2}
                />
                <Button onClick={handleAddRelatedLinkInModal} size="sm" className="text-white bg-cyan-600 hover:bg-cyan-700">
                  링크 추가
                </Button>
              </div>

              {/* Display existing links for the current note & type */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <h4 className="text-sm font-medium text-gray-300 mt-3">
                  현재 노트의 '{relatedLinkModalTabs.find(t => t.key === activeRelatedLinkTypeTab)?.label}' 링크
                </h4>
                {(selectedNoteForLinkModal.relatedLinks || []).filter(link => link.type === activeRelatedLinkTypeTab).length > 0 ? 
                  (selectedNoteForLinkModal.relatedLinks || []).filter(link => link.type === activeRelatedLinkTypeTab).map((link, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/70 rounded text-xs">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-cyan-400" title={link.url}>
                        {link.reason || link.url}
                      </a>
                      <Button 
                          onClick={() => {
                              // Find the actual index in the full relatedLinks array before filtering by type
                              const actualIndex = (selectedNoteForLinkModal.relatedLinks || []).findIndex(
                                  rl => rl.url === link.url && rl.type === link.type && rl.reason === link.reason
                                  // This findIndex might not be robust if multiple identical links exist.
                                  // A more robust way would be to pass the original index or a unique ID if links had one.
                                  // For now, this assumes link objects are unique enough or order is preserved.
                              );
                              if (actualIndex !== -1) {
                                  handleDeleteRelatedLinkInModal(actualIndex);
                              } else {
                                  // Fallback for safety if the above logic fails (e.g. due to non-unique links)
                                  // This part of the logic may need refinement if links don't have unique IDs
                                  // and direct index from filtered list is not reliable.
                                  // Consider adding temporary unique IDs to links in UI state if this becomes an issue.
                                  const indexInFiltered = (selectedNoteForLinkModal.relatedLinks || [])
                                      .filter(rl => rl.type === activeRelatedLinkTypeTab)
                                      .findIndex(rl => rl.url === link.url && rl.reason === link.reason);
                                  if(indexInFiltered !== -1) {
                                       const originalFullList = selectedNoteForLinkModal.relatedLinks || [];
                                       let count = 0;
                                       let foundOriginalIndex = -1;
                                       for(let i=0; i < originalFullList.length; i++){
                                           if(originalFullList[i].type === activeRelatedLinkTypeTab){
                                               if(count === indexInFiltered){
                                                   foundOriginalIndex = i;
                                                   break;
                                               }
                                               count++;
                                           }
                                       }
                                       if(foundOriginalIndex !== -1) handleDeleteRelatedLinkInModal(foundOriginalIndex);
                                       else showError("삭제할 링크를 찾는 데 문제가 발생했습니다.");
                                  } else {
                                      showError("삭제할 링크를 찾는 데 문제가 발생했습니다. (filtered)");
                                  }
                              }
                          }} 
                          variant="destructive" 
                          size="sm" 
                          className="p-0 h-auto"
                          title="이 링크 삭제"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  )) : 
                  <p className="text-gray-500 text-xs">이 유형의 링크가 없습니다.</p>
                }
              </div>
              <Button onClick={() => setShowLinkModal(false)} variant="outline" size="sm" className="mt-6 w-full">
                닫기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 