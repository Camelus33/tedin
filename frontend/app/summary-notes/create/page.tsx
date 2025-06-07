"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import TSNoteCard, { TSNote } from '@/components/ts/TSNoteCard'; // TSNote 타입도 함께 임포트
import api from '@/lib/api';
import { Input } from '@/components/ui/input'; // shadcn/ui에서 추가된 Input 경로
import { Textarea } from '@/components/ui/textarea'; // shadcn/ui에서 추가된 Textarea 경로
import Button from '@/components/common/Button'; // 기존 Button 컴포넌트
import { Loader2, Save } from 'lucide-react'; // 아이콘 복구 시도
import toast from 'react-hot-toast';

/**
 * @page CreateSummaryNotePage
 * @description 지식 카트에 담긴 1줄 메모들을 기반으로 새로운 단권화 노트를 생성하는 페이지입니다.
 * 사용자는 전체 단권화 노트의 제목과 설명을 입력하고, 개별 메모들을 `TSNoteCard`를 통해 추가적으로 편집(메모 진화)할 수 있습니다.
 * 최종적으로 "단권화 노트 저장하기" 버튼을 클릭하여 서버에 단권화 노트 데이터를 저장합니다.
 */
export default function CreateSummaryNotePage() {
  const router = useRouter();
  const { items: cartItems, clearCart, _hasHydrated } = useCartStore();

  // 단권화 노트의 전체 제목, 설명을 위한 상태입니다.
  const [title, setTitle] = useState<string>('나의 단권화 노트');
  const [description, setDescription] = useState<string>('');
  
  // 카트에서 가져온 순서대로 전체 노트 데이터를 담을 상태입니다. (TSNoteCard 표시에 사용)
  const [orderedNotes, setOrderedNotes] = useState<TSNote[]>([]);
  
  // 노트 데이터 로딩 상태 및 저장 진행 상태를 관리합니다.
  const [isLoading, setIsLoading] = useState<boolean>(true); // 카트에 담긴 노트들의 상세 정보 로딩
  const [isSaving, setIsSaving] = useState<boolean>(false); // 단권화 노트 서버 저장 진행
  const [error, setError] = useState<string | null>(null); // 오류 메시지 표시용

  useEffect(() => {
    // 스토어 rehydration이 완료되고, 노트 로딩도 끝났는데 카트가 비어있으면 리디렉션
    if (_hasHydrated && cartItems.length === 0 && !isLoading) {
      toast.error('카트에 담긴 내용이 없습니다. 먼저 1줄 메모를 카트에 추가해주세요.');
      router.push('/books');
    }
  }, [_hasHydrated, cartItems, isLoading, router]);

  useEffect(() => {
    // rehydration이 완료된 후에만 노트 정보를 가져옵니다.
    if (!_hasHydrated) {
      return;
    }

    const fetchFullNotes = async () => {
      if (cartItems.length === 0) {
        // Hydration 후 카트가 비어있다면, 위의 useEffect가 리디렉션을 처리할 것입니다.
        // 여기서는 로딩 상태만 false로 변경합니다.
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const noteIds = cartItems.map(item => item.noteId);
        const response = await api.post('/notes/batch', { noteIds });
        const fullNotesData: TSNote[] = response.data || [];

        const sortedFullNotes = cartItems.map(cartItem => 
          fullNotesData.find(note => note._id === cartItem.noteId)
        ).filter(Boolean) as TSNote[];
        
        setOrderedNotes(sortedFullNotes);
      } catch (err: any) {
        console.error('Error fetching full notes for summary:', err);
        setError('노트 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
        setOrderedNotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullNotes();
  }, [cartItems, _hasHydrated]);

  /**
   * @function handleNoteUpdateInList
   * @description `TSNoteCard` 내부에서 1줄 메모의 내용(메모 진화 필드 등)이 변경되었을 때 호출되는 콜백 함수입니다.
   * `orderedNotes` 상태 배열에서 해당 노트를 찾아 변경된 내용으로 업데이트합니다.
   * @param {Partial<TSNote>} updatedNoteFields - 변경된 필드만 포함하는 부분적인 TSNote 객체 (반드시 _id 포함).
   */
  const handleNoteUpdateInList = useCallback((updatedNoteFields: Partial<TSNote>) => {
    setOrderedNotes(prevNotes =>
      prevNotes.map(note =>
        note._id === updatedNoteFields._id ? { ...note, ...updatedNoteFields } : note
      )
    );
  }, []);

  /**
   * @function handleSaveSummaryNote
   * @description "단권화 노트 저장하기" 버튼 클릭 시 실행되는 핸들러입니다.
   * 현재 입력된 제목, 설명, 그리고 `orderedNotes`에서 노트 ID와 책 ID 목록을 추출하여
   * 백엔드 API (`/summary-notes`)를 호출하여 단권화 노트를 서버에 저장합니다.
   * 성공 시 카트를 비우고 대시보드 페이지 등으로 리다이렉트합니다.
   */
  const handleSaveSummaryNote = async () => {
    if (orderedNotes.length === 0) {
      toast.error('저장할 노트가 없습니다.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // 저장할 데이터 구성
      const noteIdsToSave = orderedNotes.map(note => note._id);
      // 중복을 제거한 책 ID 목록 추출
      const uniqueBookIds = [...new Set(orderedNotes.map(note => note.bookId).filter(Boolean))];

      const summaryNoteData = {
        title: title.trim() || '나의 단권화 노트', // 제목이 비어있으면 기본값 사용
        description: description.trim(),
        orderedNoteIds: noteIdsToSave,
        bookIds: uniqueBookIds,
        // tags: [] // 태그 기능은 Version 1 MVP에서 제외되었으나, 필요시 추가 가능
      };

      // 백엔드 API 호출
      const response = await api.post('/summary-notes', summaryNoteData);
      
      if (response.status === 201 && response.data?._id) { // HTTP 201 Created 성공 응답 및 ID 확인
        const newNoteId = response.data._id;
        toast.success('단권화 노트가 성공적으로 저장되었습니다!');
        clearCart(); // 카트 비우기
        router.push(`/summary-notes/${newNoteId}/edit`); // 새로 생성된 노트의 편집 페이지로 이동
      } else {
        // 예상치 못한 성공 상태 코드 처리 (예: 200 OK 또는 ID 없음)
        console.warn('Summary note saved, but with unexpected status or missing ID:', response);
        setError('노트 저장에 성공했으나, 예상치 못한 응답을 받았습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err: any) {
      console.error('Error saving summary note:', err);
      let errorMessage = '단권화 노트 저장 중 오류가 발생했습니다.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage += ` (${err.response.data.message})`;
      }
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // 스토어 Hydration을 기다리는 동안 로딩 상태를 표시합니다.
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mb-4" />
        <p className="text-lg">카트 정보를 동기화하는 중입니다...</p>
      </div>
    );
  }

  // 노트 정보를 fetch하는 동안 로딩 상태를 표시합니다.
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mb-4" />
        <p className="text-lg">⏳ 선택한 노트들을 불러오는 중입니다...</p>
      </div>
    );
  }

  // 노트가 없는 경우 (로딩 완료 후)
  if (!isLoading && orderedNotes.length === 0 && cartItems.length > 0) {
    // 이 경우는 fetchFullNotes에서 오류가 발생했거나, ID에 해당하는 노트를 찾지 못한 경우
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <p className="text-lg text-red-400 mb-4">
          {error || '카트에 담긴 노트 정보를 불러올 수 없습니다. 네트워크 연결을 확인하거나 다시 시도해주세요.'}
        </p>
        <Button onClick={() => router.push('/books')} variant="outline">
          내 서재로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">단권화 노트 만들기</h1>
          <p className="text-gray-400 mt-2">지식 카트에서 선택한 1줄 메모들을 하나의 노트로 통합합니다.</p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* 단권화 노트 전체 제목 및 설명 입력 폼 */}
        <section className="mb-8 space-y-6">
          <div>
            <label htmlFor="summaryTitle" className="block text-lg font-semibold text-gray-300 mb-2">노트 제목</label>
            <Input 
              id="summaryTitle"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="예: 객체지향 프로그래밍 핵심 원리" 
              className="w-full bg-gray-700/50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50 text-lg"
            />
          </div>
          <div>
            <label htmlFor="summaryDescription" className="block text-lg font-semibold text-gray-300 mb-2">간단 설명 (선택)</label>
            <Textarea 
              id="summaryDescription"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="이 단권화 노트에 대한 간략한 소개를 적어주세요."
              rows={3}
              className="w-full bg-gray-700/50 border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50 text-base"
            />
          </div>
        </section>

        {/* 선택된 노트 목록 (TSNoteCard 사용) */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">포함된 1줄 메모 ({orderedNotes.length}개)</h2>
          {orderedNotes.length > 0 ? (
            <div className="space-y-4">
              {orderedNotes.map((note) => (
                <TSNoteCard 
                  key={note._id} 
                  note={note} // TSNote 타입의 노트 객체 전달
                  onUpdate={handleNoteUpdateInList} // TSNoteCard 내부 변경 시 orderedNotes 상태 업데이트
                  // readingPurpose 등 필요한 다른 프롭도 전달 가능 (현재는 기본값 사용)
                  // onAddToCart 프롭은 여기서는 필요 없음 (이미 카트에 담겨서 온 아이템들이므로)
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">표시할 메모가 없습니다. (오류 또는 빈 카트)</p>
          )}
        </section>

        {/* 저장 버튼 */}
        <footer className="flex justify-end mt-10">
          <Button 
            onClick={handleSaveSummaryNote} 
            disabled={isSaving || orderedNotes.length === 0}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg transform hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> ⏳ 저장 중...</>
            ) : (
              <><Save className="mr-2 h-5 w-5" /> 💾 단권화 노트 저장하기</>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
} 