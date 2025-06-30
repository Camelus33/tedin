'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { myverseApi, collectionsApi } from '@/lib/api';
import CollectionGameForm from './CollectionGameForm';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';
import { toast } from 'react-hot-toast';
import Button from '@/components/common/Button';
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowLeftIcon, AcademicCapIcon, BookOpenIcon, BriefcaseIcon, SunIcon, TagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import CollectionForm from '@/components/CollectionForm';
import HabitusIcon from '@/components/HabitusIcon';

interface MyverseGame {
  _id: string;
  title: string;
  inputText: string;
  wordMappings?: { word: string; coords: { x: number; y: number } }[];
  boardSize?: number;
  visibility?: 'private' | 'public' | 'group';
  sharedWith?: string[];
  description?: string;
  type?: string;
  updatedAt?: string;
}

interface Collection {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  visibility?: 'private' | 'public' | 'group';
  imageUrl?: string;
}

export default function Page() {
  const t = useTranslations('collectionDetail');
  const { collectionId } = useParams() as { collectionId: string };
  const [games, setGames] = useState<MyverseGame[] | undefined>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [collectionMeta, setCollectionMeta] = useState<Collection & { imageUrl?: string; type?: string } | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showEditGameModal, setShowEditGameModal] = useState(false);
  const [editingGameData, setEditingGameData] = useState<MyverseGame | null>(null);
  const router = useRouter();

  // 카테고리별 아이콘/컬러 매핑 (i18n 적용)
  const categoryMeta = {
    exam: { color: '#fde047', Icon: AcademicCapIcon, label: t('sampleData.exam.title') },
    study: { color: '#bef264', Icon: BookOpenIcon, label: t('sampleData.study.title') },
    work: { color: '#38bdf8', Icon: BriefcaseIcon, label: t('sampleData.work.title') },
    daily: { color: '#fb923c', Icon: SunIcon, label: t('sampleData.daily.title') },
    default: { color: '#06b6d4', Icon: (props: any) => <HabitusIcon {...props} />, label: t('defaultCategory') },
  };

  // 샘플 데이터 매핑 (i18n 적용)
  const sampleDataMap = {
    exam: { title: t('sampleData.exam.title'), description: t('sampleData.exam.description'), inputText: t('sampleData.exam.inputText') },
    study: { title: t('sampleData.study.title'), description: t('sampleData.study.description'), inputText: t('sampleData.study.inputText') },
    work: { title: t('sampleData.work.title'), description: t('sampleData.work.description'), inputText: t('sampleData.work.inputText') },
    daily: { title: t('sampleData.daily.title'), description: t('sampleData.daily.description'), inputText: t('sampleData.daily.inputText') },
    default: { title: t('sampleData.default.title'), description: t('sampleData.default.description'), inputText: t('sampleData.default.inputText') },
  };

  const typeKey = collectionMeta?.type && Object.keys(sampleDataMap).includes(collectionMeta.type) ? collectionMeta.type as keyof typeof sampleDataMap : 'default';
  const sample = sampleDataMap[typeKey];

  useEffect(() => {
    if (error) {
      toast.error(t('toast.errorLoadGames', { error }));
    }
    if (metaError) {
      toast.error(t('toast.errorLoadMeta', { error: metaError }));
    }
  }, [error, metaError, t]);

  useEffect(() => {
    setLoadingMeta(true);
    collectionsApi.getById(collectionId)
      .then(data => setCollectionMeta(data))
      .catch(err => setMetaError(err.message || t('toast.errorGetMeta')))
      .finally(() => setLoadingMeta(false));
  }, [collectionId, t]);

  useEffect(() => {
    setLoading(true);
    myverseApi.getByCollection(collectionId)
      .then(data => setGames((data.games as any) || []))
      .catch(err => setError(err.message || t('toast.errorGetGames')))
      .finally(() => setLoading(false));
  }, [collectionId, t]);

  const handleDeleteCollection = async () => {
    if (window.confirm(t('alert.deleteCollection'))) {
      try {
        await collectionsApi.delete(collectionId);
        toast.success(t('toast.successDeleteCollection'));
        router.push('/myverse');
      } catch (error: any) {
        console.error('컬렉션 삭제 실패:', error);
        toast.error(error.message || t('toast.errorDeleteCollection'));
      }
    }
  }

  const handleEditGame = (gameId: string) => {
    const gameToEdit = (games ?? []).find(g => g._id === gameId);
    if (gameToEdit) {
      setEditingGameData(gameToEdit);
      setShowEditGameModal(true);
    } else {
      console.error('수정할 게임 데이터를 찾을 수 없습니다:', gameId);
      toast.error(t('toast.errorGetGameInfo'));
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm(t('alert.deleteGame'))) {
      try {
        await myverseApi.delete(gameId);
        toast.success(t('toast.successDeleteGame'));
        router.refresh(); 
      } catch (error: any) {
        console.error('게임 삭제 실패:', error);
        toast.error(error.message || t('toast.errorDeleteGame'));
      }
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 컬렉션 시각적 Hero Section */}
        <div className="relative mb-8">
          <Link href="/myverse" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {t('backLink')}
          </Link>
          {loadingMeta ? (
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          ) : metaError ? (
            <div className="bg-feedback-error/10 text-feedback-error p-3 rounded-md">
              {t('errorLoading', { error: metaError })}
            </div>
          ) : collectionMeta ? (
            <div
              className="relative flex flex-col md:flex-row items-center md:items-end gap-6 rounded-3xl p-4 md:p-6 mb-6 shadow-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${(categoryMeta[typeKey]?.color || categoryMeta.default.color)}33 0%, #fff 100%)`,
                minHeight: '120px',
              }}
            >
              {/* 흐릿한 컬러풀 원형 패턴 SVG 배경 */}
              <svg className="absolute -top-10 -left-10 w-48 h-48 z-0 opacity-30 blur-2xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="100" fill={categoryMeta[typeKey]?.color || categoryMeta.default.color} />
              </svg>
              <svg className="absolute bottom-0 right-0 w-40 h-40 z-0 opacity-20 blur-2xl" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="80" r="80" fill="#a3a3a3" />
              </svg>
              {/* 액션 버튼 우측 상단 플로팅 */}
              <div className="absolute top-6 right-6 flex gap-2 z-20 backdrop-blur-md bg-white/40 rounded-xl shadow-lg p-1 transition-transform hover:scale-105">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowEditCollectionModal(true)}
                  aria-label={t('editCollectionAria')}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={handleDeleteCollection}
                  aria-label={t('deleteCollectionAria')}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              {/* 대표 이미지/아이콘 */}
              <div className="relative flex flex-col items-center md:items-start min-w-[120px] z-10">
                {/* blurred circle behind image/icon */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-48 md:h-48 rounded-full bg-white/40 blur-2xl z-0" />
                {collectionMeta?.imageUrl ? (
                  <img src={collectionMeta.imageUrl} alt={t('imageAlt')} className="relative w-28 h-28 md:w-36 md:h-36 object-cover rounded-full border-4 shadow-xl ring-4 ring-white/60" style={{ zIndex: 1 }} />
                ) : (
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-xl" style={{ background: categoryMeta[typeKey]?.color || categoryMeta.default.color, opacity: 0.95, zIndex: 1 }}>
                    {React.createElement((categoryMeta[typeKey]?.Icon || categoryMeta.default.Icon), {
                      className: 'w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-lg',
                    })}
                  </div>
                )}
              </div>
              {/* 컬렉션 정보 */}
              <div className="flex-1 min-w-0 flex flex-col items-center md:items-start z-10">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight truncate drop-shadow-sm" style={{ color: categoryMeta[typeKey]?.color || categoryMeta.default.color }}>{collectionMeta?.name}</h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 shadow border border-white/40" style={{ color: categoryMeta[typeKey]?.color || categoryMeta.default.color }}>
                    {React.createElement((categoryMeta[typeKey]?.Icon || categoryMeta.default.Icon), { className: 'w-4 h-4' })}
                    {collectionMeta?.type ? categoryMeta[typeKey]?.label : t('defaultCategory')}
                  </span>
                </div>
                {collectionMeta?.description && (
                  <div className="bg-white/80 rounded-xl px-4 py-2 shadow-md mb-2 max-w-xl text-center md:text-left backdrop-blur-sm border border-white/40">
                    <p className="text-base italic text-gray-700 drop-shadow-sm">{collectionMeta.description}</p>
                  </div>
                )}
                {/* 동기부여 메시지/이모지 */}
                <div className="mt-2 text-base md:text-lg font-medium text-green-700 flex items-center gap-2 bg-green-50/80 rounded-lg px-3 py-1 shadow-sm border border-green-100">
                  <span role="img" aria-label={t('fireAria')} className="text-xl md:text-2xl">🔥</span>
                  {t('motivationalMessage')}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-heading-sm text-neutral-DEFAULT">{t('gameListTitle')}</h2>
          <Button variant="default" onClick={() => setIsCreating(true)}>
            <PlusIcon className="h-5 w-5 mr-1" />
            {t('newGameButton')}
          </Button>
        </div>

      {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white h-36 rounded-lg shadow-md" />
          ))}
        </div>
      ) : error ? (
          <div className="bg-feedback-error/10 text-feedback-error p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="visible"
          >
          {(games ?? []).length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                message={t('emptyState.message')}
                icon={React.createElement(categoryMeta[typeKey]?.Icon || categoryMeta.default.Icon, { className: 'w-12 h-12' })}
                color={categoryMeta[typeKey]?.color}
                sampleTitle={sample.title}
                sampleDescription={sample.description}
                sampleButtonLabel={t('emptyState.sampleButton')}
                onSampleClick={() => {
                  setIsCreating(true);
                  setTimeout(() => {
                    const typeKey = collectionMeta?.type && sampleDataMap[collectionMeta.type as keyof typeof sampleDataMap] ? collectionMeta.type as keyof typeof sampleDataMap : 'default';
                    const sample = sampleDataMap[typeKey];
                    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>('#gameTitle');
                    const textarea = document.querySelector<HTMLTextAreaElement>('#gameText');
                    if (input) input.value = sample.title;
                    if (textarea) textarea.value = sample.inputText;
                    input?.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea?.dispatchEvent(new Event('input', { bubbles: true }));
                  }, 200);
                }}
              />
            </div>
          ) : (games ?? []).map(game => (
              <motion.div 
                key={game._id} 
                variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
              >
                <GameCard 
                  game={game} 
                  collectionId={collectionId} 
                  onEditClick={handleEditGame}
                  onDeleteClick={handleDeleteGame}
                  collectionType={collectionMeta?.type}
                  collectionColor={categoryMeta[typeKey]?.color || categoryMeta.default.color}
                  collectionIcon={categoryMeta[typeKey]?.Icon || categoryMeta.default.Icon}
                  collectionName={collectionMeta?.name}
                />
              </motion.div>
            ))}
            <motion.button
              className="flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-neutral-300 hover:border-accent hover:text-accent transition-colors duration-200 p-6 group h-full min-h-[144px]"
            onClick={() => setIsCreating(true)}
              aria-label={t('newGameButton')}
              variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="h-8 w-8 text-neutral-400 group-hover:text-accent mb-2 transition-colors" />
              <span className="text-base font-medium text-neutral-500 group-hover:text-accent transition-colors">{t('newGameButton')}</span>
            </motion.button>
          </motion.div>
      )}

        <AnimatePresence>
      {isCreating && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }}
            >
              <motion.div 
                className="relative w-full max-w-lg"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <CollectionGameForm 
                  collectionId={collectionId} 
                  onCancel={() => {
                    setIsCreating(false);
                  }} 
                  onSuccess={(newGame) => {
                    setIsCreating(false);
                    setGames(prev => [newGame, ...((prev ?? []) as MyverseGame[])]);
                    toast.success(t('toast.successCreateGame'));
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditCollectionModal && collectionMeta && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CollectionForm 
                  initialData={collectionMeta as Collection}
                  onCancel={() => setShowEditCollectionModal(false)}
                  onSuccess={(updatedCollection) => {
                    setShowEditCollectionModal(false);
                    setCollectionMeta(updatedCollection);
                    toast.success(t('toast.successUpdateCollection'));
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditGameModal && editingGameData && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CollectionGameForm
                  collectionId={collectionId}
                  initialData={editingGameData as any}
                  onCancel={() => {
                    setShowEditGameModal(false);
                    setEditingGameData(null);
                  }}
                  onSuccess={(updatedGame) => {
                    setShowEditGameModal(false);
                    setEditingGameData(null);
                    setGames(prev => (prev ?? []).map(g => g._id === updatedGame._id ? updatedGame : g));
                  }}
                />
              </motion.div>
            </motion.div>
      )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 