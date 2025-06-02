'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import TSNoteCard, { TSNote, TSSessionDetails, RelatedLink } from '@/components/ts/TSNoteCard'; // Import RelatedLink
import FlashcardForm from '@/components/flashcard/FlashcardForm'; // Import FlashcardForm
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpenIcon, DocumentTextIcon, ShareIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'; // Added TrashIcon and EllipsisVerticalIcon
import { AiFillYoutube } from 'react-icons/ai'; // For YouTube icon
import { NewspaperIcon } from '@heroicons/react/24/solid'; // For Media icon (can adjust if outline is preferred)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 

// Types
interface SummaryNoteData {
  _id: string;
  title: string;
  description: string;
  orderedNoteIds: string[];
  bookIds: string[]; // Assuming this stores relevant book IDs for context
  tags: string[];
  userId?: string; 
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
  errorText: 'text-red-400', // Added
  errorBorder: 'border-red-500/50', // Added
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
  const [fetchedNotes, setFetchedNotes] = useState<FetchedNoteDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changedNoteIds, setChangedNoteIds] = useState<Set<string>>(new Set());
  const [currentBookReadingPurpose, setCurrentBookReadingPurpose] = useState<string | undefined>(undefined);
  const [bookInfoMap, setBookInfoMap] = useState<Map<string, BookInfo>>(new Map());

  const [isEditing, setIsEditing] = useState(false); // 뷰/편집 모드 상태

  // State for Related Links Modal
  const [selectedNoteForLinkModal, setSelectedNoteForLinkModal] = useState<FetchedNoteDetails | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [currentLinkReason, setCurrentLinkReason] = useState('');
  const [activeRelatedLinkTypeTab, setActiveRelatedLinkTypeTab] = useState<RelatedLink['type']>(relatedLinkModalTabs[0].key);

  // State for Flashcard Modal
  const [noteForFlashcardModal, setNoteForFlashcardModal] = useState<FetchedNoteDetails | null>(null);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);

  useEffect(() => {
    if (!summaryNoteId) return;

    const fetchSummaryNoteDetails = async () => {
      setLoading(true);
      setError(null);
      setIsEditing(false); // 데이터 다시 불러올 때 항상 조회 모드로 시작
      try {
        const summaryRes = await api.get(`/summary-notes/${summaryNoteId}`);
        const summaryData: SummaryNoteData = summaryRes.data;
        setSummaryNote(summaryData);
        setTitle(summaryData.title);
        setDescription(summaryData.description);

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
                  book: sessionData.bookId // if populated and needed
                };
                return { ...note, sessionDetails };
              } catch (sessionErr) {
                console.warn(`Failed to fetch session ${note.originSession} for note ${note._id}`, sessionErr);
                return { ...note, sessionDetails: undefined };
              }
            }
            return note;
          }));
          
          // Reorder notes according to summaryData.orderedNoteIds
          const orderedNotes = summaryData.orderedNoteIds.map(id => 
            notesWithSessionDetails.find(n => n._id === id)
          ).filter(n => n !== undefined) as FetchedNoteDetails[];
          setFetchedNotes(orderedNotes);

          // After fetching notes, extract all unique bookIds and fetch their info
          const uniqueBookIds = Array.from(new Set(orderedNotes.map(note => note.bookId).filter(Boolean)));
          if (uniqueBookIds.length > 0) {
            try {
              const booksInfoRes = await api.post('/books/batch', { bookIds: uniqueBookIds });
              const booksData: BookInfo[] = booksInfoRes.data;
              const newBookInfoMap = new Map<string, BookInfo>();
              booksData.forEach(book => newBookInfoMap.set(book._id, book));
              setBookInfoMap(newBookInfoMap);
            } catch (bookBatchError) {
              console.warn('Failed to fetch batch book details:', bookBatchError);
              // Not critical enough to set a page-level error, notes will just miss book titles
            }
          }

        } else {
          setFetchedNotes([]);
          setBookInfoMap(new Map()); // Clear book info map if no notes
        }
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch summary note details:', err);
        setError('요약 노트 정보를 불러오는데 실패했습니다. 요약 노트 목록으로 돌아가거나, 새로고침 해보세요.');
        setSummaryNote(null);
        setFetchedNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryNoteDetails();
  }, [summaryNoteId]);

  const handleNoteUpdate = useCallback((updatedNoteFields: Partial<FetchedNoteDetails>) => {
    if (!updatedNoteFields._id) return;
    setFetchedNotes(prevNotes =>
      prevNotes.map(n => (n._id === updatedNoteFields._id ? { ...n, ...updatedNoteFields } : n))
    );
    setChangedNoteIds(prev => new Set(prev).add(updatedNoteFields._id!));
  }, []);

  // 모드 전환 핸들러
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 제목과 설명을 원본 데이터로 복원
    if (summaryNote) {
      setTitle(summaryNote.title);
      setDescription(summaryNote.description);
    }
    // 변경된 노트 ID 목록도 초기화 (선택적: 저장하지 않았으므로)
    // setChangedNoteIds(new Set()); 
  };

  const handleSaveSummaryNote = async () => {
    if (!summaryNote) return false; // boolean 반환하도록 수정
    setLoading(true);
    try {
      // 1. Save all changed individual notes
      if (changedNoteIds.size > 0) {
        const updatePromises = Array.from(changedNoteIds).map(noteId => {
          const noteToUpdate = fetchedNotes.find(n => n._id === noteId);
          if (noteToUpdate) {
            // Destructure to send only relevant fields for INote update
            const { 
              _id, userId, bookId, originSession, sessionDetails, // these are not directly updatable or managed elsewhere
              ...updatableFields 
            } = noteToUpdate;
            return api.put(`/notes/${noteId}`, updatableFields);
          }
          return Promise.resolve();
        });
        await Promise.all(updatePromises);
      }

      // 2. Save the summary note itself
      const updatedSummaryNoteData = {
        title,
        description,
        orderedNoteIds: fetchedNotes.map(n => n._id), // Ensure order is preserved
        // bookIds and tags might also need updating if they can be changed on this page
      };
      await api.put(`/summary-notes/${summaryNote._id}`, updatedSummaryNoteData);
      
      setChangedNoteIds(new Set());
      alert('단권화 노트가 성공적으로 저장되었습니다.');
      // 저장 후 summaryNote 상태 업데이트 (선택적이지만, UI 즉시 반영에 도움)
      setSummaryNote(prev => prev ? { ...prev, ...updatedSummaryNoteData } : null);
      return true; // 저장 성공
    } catch (err) {
      console.error('Failed to save summary note:', err);
      alert('단권화 노트 저장 중 오류가 발생했습니다.');
      return false; // 저장 실패
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndToggleMode = async () => {
    const success = await handleSaveSummaryNote();
    if (success) {
      setIsEditing(false); // 저장 성공 시 조회 모드로 전환
    }
  };
  
  const handleDeleteSummaryNote = async () => {
    if (!summaryNoteId) return;
    if (window.confirm('이 단권화 노트를 정말 삭제하시겠습니까? 연결된 1줄 메모는 삭제되지 않습니다.')) {
      setLoading(true);
      try {
        await api.delete(`/summary-notes/${summaryNoteId}`);
        alert('단권화 노트가 삭제되었습니다.');
        router.push('/books?tab=summary'); // Redirect to My Library, summary tab
      } catch (err) {
        console.error('Failed to delete summary note:', err);
        alert('단권화 노트 삭제 중 오류가 발생했습니다.');
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
  
  const handleRemoveNoteFromSummary = (noteIdToRemove: string) => {
    if (window.confirm('이 메모를 단권화 노트에서 제거하시겠습니까? 원본 1줄 메모는 삭제되지 않습니다.')) {
        setFetchedNotes(prevNotes => prevNotes.filter(note => note._id !== noteIdToRemove));
        // This change will be saved when "변경사항 저장" is clicked as orderedNoteIds will be different.
    }
  };

  // Placeholder for Related Link Modal Add
  const handleAddRelatedLinkInModal = async () => {
    if (!selectedNoteForLinkModal || !currentLinkUrl.trim()) return;
    
    const newLink: RelatedLink = {
      type: activeRelatedLinkTypeTab,
      url: currentLinkUrl.trim(),
      reason: currentLinkReason.trim() || undefined,
    };

    const updatedRelatedLinks = [...(selectedNoteForLinkModal.relatedLinks || []), newLink];
    
    // Update the specific note in fetchedNotes state
    setFetchedNotes(prevNotes =>
      prevNotes.map(n =>
        n._id === selectedNoteForLinkModal._id
          ? { ...n, relatedLinks: updatedRelatedLinks }
          : n
      )
    );
    // Mark this note as changed
    setChangedNoteIds(prev => new Set(prev).add(selectedNoteForLinkModal._id));

    // Reset form fields for the modal
    setCurrentLinkUrl('');
    setCurrentLinkReason('');
    // Optionally close the modal or allow adding more links
    // setShowLinkModal(false); 
    alert('링크가 추가되었습니다. "변경사항 저장"을 눌러야 최종 반영됩니다.');
  };

  // Placeholder for Related Link Modal Delete
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
    setChangedNoteIds(prev => new Set(prev).add(selectedNoteForLinkModal._id));
    alert('링크가 삭제되었습니다. "변경사항 저장"을 눌러야 최종 반영됩니다.');
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!summaryNote) return <div className="text-center p-4">요약 노트를 찾을 수 없습니다.</div>;

  return (
    <div className={`min-h-screen ${cyberTheme.bgPrimary} ${cyberTheme.textLight} py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className={`text-3xl font-bold ${cyberTheme.primary} mb-4 sm:mb-0`}>
            {isEditing ? '단권화 노트 수정' : summaryNote.title} 
          </h1>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => router.push('/books?tab=summary')}>목록으로</Button>
                <Button onClick={handleEdit}>수정</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDeleteSummaryNote} className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      노트 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>취소</Button>
                <Button onClick={handleSaveAndToggleMode}>변경사항 저장</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDeleteSummaryNote} className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      노트 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Title and Description Fields */}
        <div className={isEditing ? `mb-8 p-6 rounded-lg shadow-xl border border-gray-700/50 bg-gray-800/70` : `mb-8 py-2`}>
          {isEditing ? (
            <>
              <div className="mb-4">
                <label htmlFor="summaryNoteTitle" className={`block text-sm font-medium ${cyberTheme.textMuted} mb-1`}>노트 제목</label>
                <Input 
                  id="summaryNoteTitle"
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="단권화 노트의 제목을 입력하세요..."
                  className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:ring-cyan-500 focus:border-cyan-500 w-full ${cyberTheme.textLight}`}
                />
              </div>
              <div>
                <label htmlFor="summaryNoteDescription" className={`block text-sm font-medium ${cyberTheme.textMuted} mb-1`}>노트 설명 (선택)</label>
                <Textarea 
                  id="summaryNoteDescription"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="노트에 대한 간략한 설명을 추가하세요... (선택 사항)"
                  rows={3}
                  className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:ring-cyan-500 focus:border-cyan-500 w-full ${cyberTheme.textLight}`}
                />
              </div>
            </>
          ) : (
            <>
              {/* 조회 모드에서는 페이지 제목(h1)이 이미 summaryNote.title을 표시하므로 여기서는 설명만 표시 */}
              <p className={`text-lg whitespace-pre-wrap ${description ? cyberTheme.textLight : cyberTheme.textMuted}`}>
                {description || '설명이 없습니다.'}
              </p>
            </>
          )}
        </div>

        {/* Divider */}
        <hr className="border-gray-700/50" />

        {/* Included Notes Section Title */}
        <h2 className={`text-2xl font-semibold mt-8 mb-6 ${cyberTheme.secondary}`}>포함된 1줄 메모 ({fetchedNotes.length}개)</h2>

        {/* Notes List */}
        {fetchedNotes.length > 0 ? (
          <div className="space-y-6">
            {fetchedNotes.map((note, index) => (
              <div key={note._id} className="flex items-start space-x-3 w-full">
                <TSNoteCard
                  note={note}
                  bookTitle={bookInfoMap.get(note.bookId)?.title} 
                  readingPurpose={currentBookReadingPurpose} 
                  sessionDetails={note.sessionDetails}
                  onUpdate={handleNoteUpdate} 
                  onFlashcardConvert={(currentNote) => {
                    setNoteForFlashcardModal(currentNote as FetchedNoteDetails);
                    setShowFlashcardModal(true);
                  }}
                  onRelatedLinks={(currentNote) => {
                    setSelectedNoteForLinkModal(currentNote as FetchedNoteDetails);
                    setShowLinkModal(true);
                  }}
                  isPageEditing={isEditing} 
                />
                {isEditing && (
                  <div className="flex flex-col space-y-1.5 mt-1 relative top-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleReorderNote(note._id, 'up')} 
                      disabled={index === 0}
                      className={`p-1 h-7 w-7 ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} ${cyberTheme.textMuted}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleReorderNote(note._id, 'down')} 
                      disabled={index === fetchedNotes.length - 1}
                      className={`p-1 h-7 w-7 ${index === fetchedNotes.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} ${cyberTheme.textMuted}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveNoteFromSummary(note._id)}
                      className={`p-1 h-7 w-7 hover:bg-red-700/50 hover:text-red-300 ${cyberTheme.textMuted}`}
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={`${cyberTheme.textMuted} text-center py-8`}>아직 추가된 1줄 메모가 없습니다.</p>
        )}

        {/* Related Links Modal */}
        {showLinkModal && selectedNoteForLinkModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className={`bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-cyan-500/50 relative ${cyberTheme.textLight}`}>
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                관련 링크 관리: "{selectedNoteForLinkModal.content.substring(0,30)}..."
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
                  링크 추가하기
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
                                       else alert("삭제할 링크를 찾는 데 문제가 발생했습니다.");
                                  } else {
                                      alert("삭제할 링크를 찾는 데 문제가 발생했습니다. (filtered)");
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

        {/* Flashcard Modal */}
        {showFlashcardModal && noteForFlashcardModal && (
           <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-gray-800 p-0 rounded-lg shadow-xl max-w-lg w-full border border-purple-500/50 relative">
              {/* FlashcardForm expects white background, so added a wrapper or adjust FlashcardForm theme */}
              <FlashcardForm
                bookId={noteForFlashcardModal.bookId} 
                note={noteForFlashcardModal} // Pass the full note object, changed from noteContext
                onCreated={(createdCard) => {
                  console.log('Flashcard created/updated:', createdCard);
                  alert(`플래시카드가 성공적으로 ${createdCard.question.includes(noteForFlashcardModal.content.substring(0,10)) ? '생성' : '수정'}되었습니다!`); // Basic feedback
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
      </div>
    </div>
  );
} 