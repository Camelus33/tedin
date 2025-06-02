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
import { BookOpenIcon, DocumentTextIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'; // Added TrashIcon
import { AiFillYoutube } from 'react-icons/ai'; // For YouTube icon
import { NewspaperIcon } from '@heroicons/react/24/solid'; // For Media icon (can adjust if outline is preferred)

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
      setError(null); // Reset error state at the beginning of fetch
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

  const handleSaveSummaryNote = async () => {
    if (!summaryNote) return;
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
      
      setChangedNoteIds(new Set()); // Reset changed IDs
      alert('단권화 노트가 성공적으로 저장되었습니다.');
      // Optionally, router.push somewhere or re-fetch data if needed
    } catch (err) {
      console.error('Failed to save summary note:', err);
      alert('단권화 노트 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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

  if (loading && !summaryNote) { // Show full page spinner only on initial load
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.bgPrimary}`}>
        <Spinner size="lg" color="cyan" />
        <p className={`ml-4 ${cyberTheme.textLight}`}>단권화 노트 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${cyberTheme.bgPrimary}`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-6 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-4`}>오류 발생</h1>
          <p className={`mb-6 ${cyberTheme.textLight}`}>{error}</p>
          <Button onClick={() => router.push('/books?tab=summary')} className="w-full">
            내 서재로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  if (!summaryNote) {
    return ( // Should be covered by error state if fetch fails, but as a fallback
        <div className={`min-h-screen flex items-center justify-center ${cyberTheme.bgPrimary}`}>
            <p className={`${cyberTheme.textMuted}`}>단권화 노트를 찾을 수 없습니다.</p>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.bgPrimary} ${cyberTheme.textLight} p-4 md:p-8`}>
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${cyberTheme.primary}`}>단권화 노트 수정</h1>
          <div>
            <Button onClick={() => router.push('/books?tab=summary')} variant="outline" className="mr-2">
              목록으로
            </Button>
            <Button onClick={handleDeleteSummaryNote} variant="destructive" className="mr-2">
              노트 삭제
            </Button>
            <Button onClick={handleSaveSummaryNote} disabled={loading}>
              {loading ? <Spinner size="sm" /> : '변경사항 저장'}
            </Button>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-xl ${cyberTheme.cardBg} border ${cyberTheme.borderSecondary}/50 mb-8`}>
          <div className="mb-4">
            <label htmlFor="summaryTitle" className={`block text-sm font-medium ${cyberTheme.textMuted} mb-1`}>노트 제목</label>
            <Input
              id="summaryTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="단권화 노트의 주제를 입력하세요"
              className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:border-cyan-500 focus:ring-cyan-500/50`}
            />
          </div>
          <div>
            <label htmlFor="summaryDescription" className={`block text-sm font-medium ${cyberTheme.textMuted} mb-1`}>노트 설명 (선택)</label>
            <Textarea
              id="summaryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 단권화 노트의 목적이나 개요를 설명해주세요."
              className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} focus:border-cyan-500 focus:ring-cyan-500/50`}
              rows={3}
            />
          </div>
        </div>

        <h2 className={`text-2xl font-semibold ${cyberTheme.secondary} mb-4`}>포함된 1줄 메모 ({fetchedNotes.length}개)</h2>
        {fetchedNotes.length > 0 ? (
          <div className="space-y-6">
            {fetchedNotes.map((note, index) => (
              <div key={note._id} className={`p-1 rounded-lg shadow-lg ${cyberTheme.cardBg} border ${cyberTheme.borderPrimary}/30 relative`}>
                <TSNoteCard
                  note={note}
                  bookTitle={bookInfoMap.get(note.bookId)?.title} // Pass bookTitle
                  readingPurpose={currentBookReadingPurpose} // Pass down reading purpose
                  sessionDetails={note.sessionDetails}
                  onUpdate={handleNoteUpdate}
                  onFlashcardConvert={(currentNote) => {
                    setNoteForFlashcardModal(currentNote as FetchedNoteDetails);
                    setShowFlashcardModal(true);
                  }}
                  onRelatedLinks={(currentNote) => {
                    setSelectedNoteForLinkModal(currentNote as FetchedNoteDetails);
                    // Initialize modal states based on currentNote's links
                    setCurrentLinkUrl('');
                    setCurrentLinkReason('');
                    setActiveRelatedLinkTypeTab(relatedLinkModalTabs[0].key); // Reset to first tab
                    setShowLinkModal(true);
                  }}
                  // onAddToCart is not relevant here as notes are already part of the summary
                />
                <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
                    <Button size="sm" variant="ghost" onClick={() => handleReorderNote(note._id, 'up')} disabled={index === 0} className="px-1 py-0.5 h-auto">▲</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleReorderNote(note._id, 'down')} disabled={index === fetchedNotes.length - 1} className="px-1 py-0.5 h-auto">▼</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveNoteFromSummary(note._id)} className="px-1 py-0.5 h-auto">✕</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`${cyberTheme.textMuted} text-center py-8`}>아직 추가된 1줄 메모가 없습니다.</p>
        )}
      </div>

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
  );
} 