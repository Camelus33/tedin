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
}

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
      };
      await api.put(`/summary-notes/${summaryNote._id}`, updatedSummaryNoteData);
      
      setChangedNoteIds(new Set());
      showSuccess('서머리 노트가 성공적으로 저장되었습니다.');
      setSummaryNote(prev => prev ? { ...prev, ...updatedSummaryNoteData, userMarkdownContent } : null);
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
    if (!selectedNoteForLinkModal || !selectedNoteForLinkModal.relatedLinks) return;

    const updatedRelatedLinks = selectedNoteForLinkModal.relatedLinks.filter((_, index) => index !== linkIndexToDelete);

    setFetchedNotes(prevNotes =>
      prevNotes.map(n =>
        n._id === selectedNoteForLinkModal._id
          ? { ...n, relatedLinks: updatedRelatedLinks }
          : n
      )
    );
    setChangedNoteIds(prev => new Set(prev).add(selectedNoteForLinkModal._id!));
    showSuccess('링크가 삭제되었습니다. 저장 버튼을 눌러야 최종 반영됩니다.');
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
    <div className={`min-h-screen ${cyberTheme.bgPrimary} ${cyberTheme.textLight} p-4 md:p-8`}>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
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
        <div className={isEditing ? `mb-8 p-6 rounded-lg shadow-xl border border-gray-700/50 bg-gray-800/70` : `mb-8 py-2`}>
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

        {/* Main Content Area: 2-Panel Layout */}
        <PanelGroup direction="horizontal" className="flex flex-col md:flex-row h-[calc(100vh-300px)] md:h-[calc(100vh-280px)]"> {/* Adjust height as needed */}
          {/* Left Panel: Notes List */}
          <Panel minSize={30} className="overflow-y-auto pr-2 pb-6 h-full custom-scrollbar">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">메모 카드 ({fetchedNotes.length})</h3>
              {fetchedNotes.length > 0 ? (
                fetchedNotes.map((note, idx) => {
                  const noteBookTitle = bookInfoMap.get(note.bookId)?.title;

                  return (
                    <div key={note._id} className="p-2 relative group bg-gray-800/60 rounded-md">
                      {isEditing && (
                        <div className="absolute -left-2 -top-2 z-10 flex space-x-1">
                          <button 
                            onClick={() => handleReorderNote(note._id, 'up')}
                            disabled={idx === 0}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            title="위로 이동"
                          >
                            ↑
                          </button>
                          <button 
                            onClick={() => handleReorderNote(note._id, 'down')}
                            disabled={idx === fetchedNotes.length - 1}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${idx === fetchedNotes.length - 1 ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
          
          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 md:w-3 bg-gray-700 hover:bg-cyan-600 active:bg-cyan-500 transition-colors duration-200 cursor-col-resize mx-1 rounded-full" />

          {/* Right Panel: Markdown Editor */}
          <Panel defaultSize={50} minSize={25} className="pl-2 md:pl-4 bg-opacity-50 bg-black/10 rounded-lg flex flex-col h-full relative">
             <h2 className={`text-2xl font-semibold mb-6 ${cyberTheme.secondary}`}>
                Deep Dive
              </h2>
            <div className="flex-grow h-full relative overflow-hidden">
              <DynamicBlockNoteEditor
                initialContent={userMarkdownContent}
                onChange={(content) => setUserMarkdownContent(content)}
                editable={isEditing}
                className="h-full w-full absolute inset-0"
              />
            </div>
          </Panel>
        </PanelGroup>

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
                  showSuccess(`플래시카드가 성공적으로 ${createdCard.question.includes(noteForFlashcardModal.content.substring(0,10)) ? '생성' : '수정'}되었습니다!`); // Basic feedback
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
                                  // For now, we rely on the fact that we rebuild the array.
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