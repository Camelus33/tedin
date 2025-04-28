'use client';
import React, { useEffect, useState } from 'react';
import { myverseApi, collectionsApi } from '@/lib/api';
import CollectionGameForm from './CollectionGameForm';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';
import { toast } from 'react-hot-toast';
import Button from '@/components/common/Button';
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CollectionForm from '@/components/CollectionForm';

interface CollectionPageProps {
  params: { collectionId: string };
}

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
}

export default function Page({ params: { collectionId } }: CollectionPageProps) {
  const [games, setGames] = useState<MyverseGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [collectionMeta, setCollectionMeta] = useState<{ name: string; description?: string } | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showEditGameModal, setShowEditGameModal] = useState(false);
  const [editingGameData, setEditingGameData] = useState<MyverseGame | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(`게임 로드 실패: ${error}`);
    }
    if (metaError) {
      toast.error(`컬렉션 정보 로드 실패: ${metaError}`);
    }
  }, [error, metaError]);

  useEffect(() => {
    setLoadingMeta(true);
    collectionsApi.getById(collectionId)
      .then(data => setCollectionMeta(data))
      .catch(err => setMetaError(err.message || '컬렉션 정보를 가져올 수 없습니다.'))
      .finally(() => setLoadingMeta(false));
  }, [collectionId]);

  useEffect(() => {
    setLoading(true);
    myverseApi.getByCollection(collectionId)
      .then(data => setGames(data.games))
      .catch(err => setError(err.message || '게임 목록을 가져올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [collectionId]);

  const handleDeleteCollection = async () => {
    if (window.confirm('정말 이 컬렉션을 삭제하시겠습니까? 모든 게임이 함께 삭제됩니다.')) {
      try {
        await collectionsApi.delete(collectionId);
        toast.success('컬렉션이 삭제되었습니다.');
        router.push('/myverse');
      } catch (error: any) {
        console.error('컬렉션 삭제 실패:', error);
        toast.error(error.message || '컬렉션 삭제 중 오류가 발생했습니다.');
      }
    }
  }

  const handleEditGame = (gameId: string) => {
    const gameToEdit = games.find(g => g._id === gameId);
    if (gameToEdit) {
      setEditingGameData(gameToEdit);
      setShowEditGameModal(true);
    } else {
      console.error('수정할 게임 데이터를 찾을 수 없습니다:', gameId);
      toast.error('게임 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('정말 이 게임을 삭제하시겠습니까?')) {
      try {
        await myverseApi.delete(gameId);
        toast.success('게임이 삭제되었습니다.');
        router.refresh(); 
      } catch (error: any) {
        console.error('게임 삭제 실패:', error);
        toast.error(error.message || '게임 삭제 중 오류가 발생했습니다.');
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
        <div className="mb-8">
          <Link href="/myverse" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Myverse로 돌아가기
          </Link>
          {loadingMeta ? (
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          ) : metaError ? (
            <div className="bg-feedback-error/10 text-feedback-error p-3 rounded-md">
              컬렉션 정보를 불러오지 못했습니다: {metaError}
            </div>
          ) : collectionMeta ? (
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-heading-lg text-neutral-DEFAULT">{collectionMeta.name}</h1>
          {collectionMeta.description && (
                  <p className="text-base text-neutral-500 mt-1 max-w-prose">{collectionMeta.description}</p>
          )}
              </div>
              <div className="flex space-x-2 flex-shrink-0 mt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowEditCollectionModal(true)}
                  aria-label="컬렉션 수정"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={handleDeleteCollection}
                  aria-label="컬렉션 삭제"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-heading-sm text-neutral-DEFAULT">게임 목록</h2>
          <Button variant="default" onClick={() => setIsCreating(true)}>
            <PlusIcon className="h-5 w-5 mr-1" />
            새 게임 만들기
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
          {games.map(game => (
              <motion.div 
                key={game._id} 
                variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
              >
                <GameCard 
                  game={game} 
                  collectionId={collectionId} 
                  onEditClick={handleEditGame}
                  onDeleteClick={handleDeleteGame}
                />
              </motion.div>
            ))}
            <motion.button
              className="flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-neutral-300 hover:border-accent hover:text-accent transition-colors duration-200 p-6 group h-full min-h-[144px]"
            onClick={() => setIsCreating(true)}
              aria-label="새 게임 만들기"
              variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="h-8 w-8 text-neutral-400 group-hover:text-accent mb-2 transition-colors" />
              <span className="text-base font-medium text-neutral-500 group-hover:text-accent transition-colors">새 게임 만들기</span>
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
                    setGames(prev => [newGame, ...prev]);
                    toast.success('게임이 성공적으로 생성되었습니다!');
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
                    toast.success('컬렉션이 수정되었습니다.');
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
                  initialData={editingGameData}
                  onCancel={() => {
                    setShowEditGameModal(false);
                    setEditingGameData(null);
                  }}
                  onSuccess={(updatedGame) => {
                    setShowEditGameModal(false);
                    setEditingGameData(null);
                    setGames(prev => prev.map(g => g._id === updatedGame._id ? updatedGame : g));
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