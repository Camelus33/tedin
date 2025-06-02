'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import TSNoteCard, { TSNote, TSSessionDetails } from '@/components/ts/TSNoteCard'; // Import TSSessionDetails
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Input } from '@/components/ui/input'; // Shadcn UI Input
import { Textarea } from '@/components/ui/textarea'; // Shadcn UI Textarea
import { useCartStore } from '@/store/cartStore'; // To potentially clear cart or for other interactions

// Types
interface SummaryNoteData {
  _id: string;
  title: string;
  description: string;
  orderedNoteIds: string[];
  bookIds: string[];
  tags: string[];
  userId?: string;
}

interface FetchedNoteDetails extends TSNote {
  originSession?: string; // Assuming backend sends originSession ID if not populated directly
  sessionDetails?: TSSessionDetails; // To store fetched session details
}

// Cyber Theme (copied from other pages for consistency, consider centralizing)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-500',
  inputFocusRing: 'focus:ring-cyan-500/50',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonDangerBg: 'bg-red-600',
  buttonDangerHoverBg: 'hover:bg-red-700',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
};

export default function EditSummaryNotePage() {
  const router = useRouter();
  const params = useParams();
  const summaryNoteId = params.summaryNoteId as string;

  const [summaryNote, setSummaryNote] = useState<SummaryNoteData | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fetchedNotes, setFetchedNotes] = useState<FetchedNoteDetails[]>([]);
  const [changedNoteIds, setChangedNoteIds] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [currentBookReadingPurpose, setCurrentBookReadingPurpose] = useState<string | undefined>('humanities_self_reflection'); // Default purpose

  const fetchBookDetailsForPurpose = useCallback(async (bookId: string) => {
    try {
      // Assuming you have an API endpoint to get a single book's details
      const response = await api.get(`/books/${bookId}`); 
      // Assuming the book data has a readingPurpose field
      setCurrentBookReadingPurpose(response.data?.readingPurpose || 'humanities_self_reflection'); 
    } catch (err) {
      console.error('Failed to fetch book details for reading purpose:', err);
      setCurrentBookReadingPurpose('humanities_self_reflection'); // Default on error
    }
  }, []);

  const fetchSummaryNoteDetails = useCallback(async () => {
    if (!summaryNoteId) return;
    setIsLoading(true);
    setError(null);
    setChangedNoteIds(new Set()); // Reset changed notes on full refresh
    try {
      const response = await api.get(`/summary-notes/${summaryNoteId}`);
      const data = response.data as SummaryNoteData;
      setSummaryNote(data);
      setTitle(data.title);
      setDescription(data.description || '');
      if (data.orderedNoteIds && data.orderedNoteIds.length > 0) {
        fetchNotesDetails(data.orderedNoteIds);
      }
      if (data.bookIds && data.bookIds.length > 0 && !currentBookReadingPurpose) {
        fetchBookDetailsForPurpose(data.bookIds[0]);
      }
    } catch (err: any) {
      console.error("Failed to fetch summary note details:", err);
      setError(err.response?.data?.message || "단권화 노트를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [summaryNoteId, fetchBookDetailsForPurpose, currentBookReadingPurpose]);

  const fetchNotesDetails = async (noteIds: string[]) => {
    if (noteIds.length === 0) {
      setFetchedNotes([]);
      return;
    }
    setNotesLoading(true);
    try {
      const notesResponse = await api.post('/notes/batch', { noteIds });
      let notesData: FetchedNoteDetails[] = notesResponse.data || [];

      // Fetch session details for each note that has an originSession ID
      const notesWithSessionDetails = await Promise.all(
        notesData.map(async (note) => {
          if (note.originSession) {
            try {
              const sessionResponse = await api.get(`/sessions/${note.originSession}`);
              const sessionData = sessionResponse.data;
              // Transform sessionData to TSSessionDetails format if necessary
              // Assuming sessionData already matches or can be directly used for TSSessionDetails relevant fields
              return {
                ...note,
                sessionDetails: {
                  createdAtISO: sessionData.createdAt, // Ensure this is ISO string
                  durationSeconds: sessionData.durationSec,
                  startPage: sessionData.startPage,
                  actualEndPage: sessionData.actualEndPage,
                  targetPage: sessionData.endPage, // Assuming 'endPage' is targetPage
                  ppm: sessionData.ppm,
                } as TSSessionDetails,
              };
            } catch (sessionErr) {
              console.error(`Failed to fetch session details for note ${note._id} session ${note.originSession}:`, sessionErr);
              return { ...note, sessionDetails: undefined }; // Keep note, but sessionDetails will be undefined
            }
          }
          return note; // Note without originSession or if session fetch fails part way
        })
      );
      setFetchedNotes(notesWithSessionDetails);
    } catch (err) {
      console.error("Failed to fetch notes details or their session details:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryNoteDetails();
  }, [fetchSummaryNoteDetails]);

  const handleSaveSummaryNote = async () => {
    if (!summaryNote) return;
    setIsSaving(true);
    setError(null);
    try {
      // 1. Save individual notes that have changed
      const updateNotePromises = [];
      for (const noteId of changedNoteIds) {
        const noteToUpdate = fetchedNotes.find(n => n._id === noteId);
        if (noteToUpdate) {
          // Construct payload for note update - ensure only updatable fields are sent
          const { _id, bookId, originSession, sessionDetails, ...updatableNoteFields } = noteToUpdate;
          updateNotePromises.push(api.put(`/notes/${noteId}`, updatableNoteFields));
        }
      }
      await Promise.all(updateNotePromises);
      console.log('Successfully updated changed notes:', changedNoteIds);

      // 2. Save the summary note itself (title, description)
      const updatedSummaryData = {
        title,
        description,
        // orderedNoteIds are managed by cart, not directly here unless reordering is implemented
      };
      await api.put(`/summary-notes/${summaryNoteId}`, updatedSummaryData);
      
      alert('단권화 노트가 성공적으로 저장되었습니다.');
      setChangedNoteIds(new Set()); // Clear changed notes after successful save
      fetchSummaryNoteDetails(); // Refresh data to reflect changes
    } catch (err: any) {
      console.error("Failed to save summary note or individual notes:", err);
      setError(err.response?.data?.message || "저장 중 오류가 발생했습니다. 일부 노트 변경사항이 저장되지 않았을 수 있습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNoteUpdate = (updatedFields: Partial<TSNote>) => {
    setFetchedNotes(prevNotes => 
      prevNotes.map(n => n._id === updatedFields._id ? {...n, ...updatedFields} : n)
    );
    if(updatedFields._id) {
        setChangedNoteIds(prev => new Set(prev).add(updatedFields._id!));
    }
    console.log('Note updated in local state, changed IDs:', changedNoteIds);
  };

  const handleConvertToFlashcard = (note: TSNote) => {
    console.log('Request to convert note to flashcard:', note);
    // Placeholder: Implement actual flashcard conversion logic or open a modal
    alert(`플래시카드 변환 요청: ${note.content.substring(0,20)}...`);
  };

  const handleManageRelatedLinks = (note: TSNote) => {
    console.log('Request to manage related links for note:', note);
    // Placeholder: Implement actual related links management or open a modal
    alert(`관련 링크 관리 요청: ${note.content.substring(0,20)}...`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient}`}>
        <Spinner size="lg" />
        <p className={`ml-4 ${cyberTheme.textLight}`}>단권화 노트 로딩 중...</p>
      </div>
    );
  }

  if (error && !summaryNote) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4 text-center`}>
        <p className={`${cyberTheme.errorText} text-xl mb-4`}>오류: {error}</p>
        <Button onClick={() => router.push('/books')} className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}>
          내 서재로 돌아가기
        </Button>
      </div>
    );
  }
  
  if (!summaryNote) {
     return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient}`}>
        <p className={`${cyberTheme.textLight}`}>단권화 노트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${cyberTheme.gradient} ${cyberTheme.textLight} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className={`text-3xl font-bold ${cyberTheme.primary} mb-2`}>단권화 노트 수정</h1>
          <p className={`${cyberTheme.textMuted}`}>노트의 제목, 설명 및 포함된 지식 조각들을 관리하세요.</p>
        </header>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
            <p><span className="font-bold">오류:</span> {error}</p>
          </div>
        )}

        <div className={`${cyberTheme.bgSecondary} p-6 rounded-lg shadow-xl border ${cyberTheme.borderSecondary}/30 mb-8`}>
          <div className="mb-6">
            <label htmlFor="title" className={`block text-sm font-medium ${cyberTheme.textMuted} mb-1`}>제목</label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="단권화 노트 제목"
              className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} ${cyberTheme.textLight} focus:${cyberTheme.inputFocusBorder} focus:${cyberTheme.inputFocusRing}`}
              disabled={isSaving}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className={`block text-sm font-medium ${cyberTheme.textMuted} mb-1`}>설명 (선택)</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 단권화 노트에 대한 간략한 설명"
              rows={4}
              className={`${cyberTheme.inputBg} ${cyberTheme.inputBorder} ${cyberTheme.textLight} focus:${cyberTheme.inputFocusBorder} focus:${cyberTheme.inputFocusRing}`}
              disabled={isSaving}
            />
          </div>
        </div>
        
        <div className="mb-8">
            <h2 className={`text-xl font-semibold ${cyberTheme.primary} mb-3`}>포함된 지식 조각 ({fetchedNotes.length}개)</h2>
            {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Spinner /> <p className="ml-2">메모 로딩 중...</p>
                </div>
            ) : fetchedNotes.length > 0 ? (
                <div className="space-y-4">
                    {fetchedNotes.map((note) => (
                        <div key={note._id} className={`${cyberTheme.cardBg} p-4 rounded-md border ${cyberTheme.inputBorder} opacity-90 hover:opacity-100 transition-opacity`}>
                          <TSNoteCard 
                            note={note} 
                            readingPurpose={currentBookReadingPurpose}
                            onUpdate={handleNoteUpdate}
                            onFlashcardConvert={handleConvertToFlashcard}
                            onRelatedLinks={handleManageRelatedLinks}
                            sessionDetails={note.sessionDetails}
                          />
                        </div>
                    ))}
                </div>
            ) : (
                <p className={`${cyberTheme.textMuted}`}>포함된 메모가 없거나, 불러오는데 실패했습니다.</p>
            )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t ${cyberTheme.inputBorder}">
          <Button 
            onClick={handleSaveSummaryNote} 
            className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg} text-white`}
            disabled={isSaving || isLoading}
          >
            {isSaving ? <Spinner size="sm" /> : '변경사항 저장'}
          </Button>
        </div>

      </div>
    </div>
  );
} 