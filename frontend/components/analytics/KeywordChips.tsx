'use client';

import React from 'react';

export interface KeywordItem {
  term: string;
  count: number;
  deltaPct?: number;
}

export const KeywordChips: React.FC<{
  items: KeywordItem[];
  onClick?: (term: string) => void;
}> = ({ items, onClick }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k) => (
        <button
          key={k.term}
          onClick={() => onClick?.(k.term)}
          className="px-3 py-1.5 rounded-full text-sm bg-gray-800/60 border border-gray-700 text-gray-200 hover:bg-gray-700/60"
          title={`count ${k.count}${typeof k.deltaPct === 'number' ? `, ${k.deltaPct >= 0 ? '+' : ''}${k.deltaPct}%` : ''}`}
        >
          {k.term}
          {typeof k.deltaPct === 'number' && (
            <span className={`ml-1 text-xs ${k.deltaPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {k.deltaPct >= 0 ? '▲' : '▼'}{Math.abs(k.deltaPct)}%
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default KeywordChips;


