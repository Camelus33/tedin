import React from 'react';
import Link from 'next/link';
import { PlayIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define the Game interface based on the actual structure
interface Game {
  id?: string;
  _id: string;
  title: string;
  inputText: string;
  description?: string;
  type?: string;
  updatedAt?: string;
  owner?: { // 게임 소유자 정보 (공유한 사람으로 간주)
    _id?: string;
    nickname: string;
  };
}

interface GameCardProps {
  game: Game & { wordMappings?: { word: string }[]; updatedAt?: string };
  collectionId?: string;
  onEditClick?: (gameId: string) => void;
  onDeleteClick?: (gameId: string) => void;
  collectionType?: string;
  collectionColor?: string;
  collectionIcon?: React.ElementType;
  collectionName?: string;
  onClick?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, collectionId, onEditClick, onDeleteClick, collectionType, collectionColor, collectionIcon: CollectionIcon, collectionName, onClick }) => {
  const href = `/myverse/games/${game._id}`;
  const gameTypeLabel = game.type === 'myverse' ? 'Myverse' : (game.type || 'ZenGo');
  const gameTypeBgColor = gameTypeLabel === 'Myverse' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary';
  const words = game.wordMappings ? game.wordMappings.map(w => w.word) : (game.inputText ? game.inputText.split(/\s+/) : []);
  const mainWords = words.slice(0, 3).join(', ');
  const difficulty = words.length;
  const maxStars = 5;
  const stars = Math.min(Math.ceil(difficulty / 2), maxStars);
  const updated = game.updatedAt ? new Date(game.updatedAt).toLocaleDateString() : '';
  const ownerNickname = game.owner?.nickname; // 소유자 닉네임 가져오기

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEditClick?.(game._id);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteClick?.(game._id);
  };

  return (
    <div className="relative group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-2" style={{ borderColor: collectionColor || '#e5e7eb' }}>
      {(collectionName || CollectionIcon) && (
        <div className="flex items-center gap-2 mb-1 px-4 pt-4">
          {CollectionIcon && <CollectionIcon className="w-5 h-5" style={{ color: collectionColor }} />}
          <span className="text-xs font-semibold truncate" style={{ color: collectionColor }}>{collectionName}</span>
        </div>
      )}
      {(onEditClick || onDeleteClick) && (
        <div className="flex gap-2 mt-4 md:mt-0 md:absolute md:top-2 md:right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          {onEditClick && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-full bg-secondary text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 transition-colors"
              aria-label="게임 수정"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
          )}
          {onDeleteClick && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-secondary text-feedback-error/70 hover:bg-feedback-error/10 hover:text-feedback-error transition-colors"
              aria-label="게임 삭제"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      <div className="block p-4 pt-2 cursor-pointer" onClick={onClick} role="button" tabIndex={0}>
        <h3 className="text-base font-semibold text-neutral-DEFAULT mb-1 truncate">{game.title}</h3>
        <div className="text-xs text-gray-500 mb-2 line-clamp-2 min-h-[32px]">
          {game.description ? game.description : `예시: ${mainWords}${words.length > 3 ? '...' : ''}`}
        </div>
        {ownerNickname && (
          <div className="text-xs text-gray-400 mb-1">
            보낸 사람: <span className="font-medium text-gray-500">{ownerNickname}</span>
          </div>
        )}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(stars)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
          {[...Array(maxStars - stars)].map((_, i) => <span key={i} className="text-gray-300">★</span>)}
          <span className="ml-2 text-xs text-gray-400">{difficulty}단어</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-0.5 rounded-full ${gameTypeBgColor}`}>{gameTypeLabel}</span>
          {updated && <span className="text-xs text-neutral-400">{updated}</span>}
        </div>
      </div>
      <Link 
        href={href}
        className="md:absolute md:bottom-3 md:right-3 p-2 bg-accent text-white rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-green-500 hover:text-green-100 mt-4 md:mt-0"
        aria-label="게임 플레이"
      >
        <PlayIcon className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default GameCard; 