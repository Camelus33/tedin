'use client';

import React from 'react';

export interface FastRhythmItem {
  weekday: number; // 0..6
  hour: number; // 0..23
  medianIntervalMin: number;
  count: number;
}

const weekdayLabel = ['일','월','화','수','목','금','토'];

export const FastRhythmTop: React.FC<{
  items: FastRhythmItem[];
  onWriteNow?: (weekday: number, hour: number) => void;
  onSchedule?: (weekday: number, hour: number) => void;
}> = ({ items, onWriteNow, onSchedule }) => {
  return (
    <div className="space-y-2">
      {items.slice(0, 3).map((it, idx) => (
        <div key={`${it.weekday}-${it.hour}`} className="flex items-center justify-between p-3 rounded-lg border border-indigo-800/40 bg-indigo-900/20">
          <div className="flex items-center gap-3">
            <span className="text-indigo-300 font-medium">#{idx + 1}</span>
            <span className="text-indigo-100">{weekdayLabel[it.weekday]} {it.hour}–{(it.hour + 1) % 24}h</span>
            <span className="text-indigo-200/80 text-sm">median {it.medianIntervalMin.toFixed(1)}m · n={it.count}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSchedule?.(it.weekday, it.hour)} className="px-3 py-1.5 rounded-md text-sm border border-indigo-700 text-indigo-200 hover:bg-indigo-800/40">일정 추가</button>
            <button onClick={() => onWriteNow?.(it.weekday, it.hour)} className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-500">바로 쓰기</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FastRhythmTop;


