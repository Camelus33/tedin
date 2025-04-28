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
}

interface GameCardProps {
  game: Game;
  collectionId?: string;
  onEditClick?: (gameId: string) => void;
  onDeleteClick?: (gameId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, collectionId, onEditClick, onDeleteClick }) => {
  const href = `/myverse/games/${game._id}`;
    
  const gameTypeLabel = game.type === 'myverse' ? 'Myverse' : (game.type || 'ZenGo');
  const gameTypeBgColor = gameTypeLabel === 'Myverse' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary';

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
    <div className="relative group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      {(onEditClick || onDeleteClick) && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      <Link href={href} className="block p-4">
        <h3 className="text-base font-semibold text-neutral-DEFAULT mb-1 truncate">{game.title}</h3>
        <p className="text-sm text-neutral-500 mb-3 h-10 overflow-hidden text-ellipsis">
          {game.description || game.inputText}
        </p>
      <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-0.5 rounded-full ${gameTypeBgColor}`}>
            {gameTypeLabel}
        </span>
        {game.updatedAt && (
            <span className="text-xs text-neutral-400">
            {new Date(game.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
      <Link 
        href={href}
        className="absolute bottom-3 right-3 p-2 bg-accent text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-accent-hover"
        aria-label="게임 플레이"
      >
        <PlayIcon className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default GameCard; 