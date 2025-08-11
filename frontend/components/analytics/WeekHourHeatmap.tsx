'use client';

import React, { useMemo, useState } from 'react';

type ActionKey = 'all' | 'create_note' | 'add_thought' | 'evolve_memo' | 'add_connection';

export interface WeekHourHeatmapProps {
  data: Record<ActionKey, number[][]>; // [7][24]
  initialAction?: ActionKey;
  streakDays?: number;
  onSlotClick?: (weekday: number, hour: number, action: ActionKey) => void;
}

const weekdayLabel = ['일', '월', '화', '수', '목', '금', '토'];

function classForValue(v: number, max: number): string {
  if (max <= 0) return 'bg-gray-800/30';
  const r = v / max;
  if (r === 0) return 'bg-gray-800/30';
  if (r < 0.2) return 'bg-indigo-900/50';
  if (r < 0.4) return 'bg-indigo-800/60';
  if (r < 0.6) return 'bg-indigo-700/70';
  if (r < 0.8) return 'bg-indigo-600/80';
  return 'bg-indigo-500';
}

export const WeekHourHeatmap: React.FC<WeekHourHeatmapProps> = ({ data, initialAction = 'all', streakDays = 0, onSlotClick }) => {
  const [action, setAction] = useState<ActionKey>(initialAction);

  const matrix = data[action] || Array.from({ length: 7 }, () => Array(24).fill(0));
  const maxValue = useMemo(() => Math.max(1, ...matrix.flat()), [matrix]);

  const top3 = useMemo(() => {
    const items: Array<{ weekday: number; hour: number; count: number }> = [];
    matrix.forEach((row, w) => row.forEach((v, h) => items.push({ weekday: w, hour: h, count: v })));
    return items
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [matrix]);

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all','create_note','add_thought','evolve_memo','add_connection'] as ActionKey[]).map(k => (
          <button
            key={k}
            onClick={() => setAction(k)}
            className={`px-3 py-1.5 rounded-md text-sm border ${action === k ? 'border-indigo-400 text-indigo-300 bg-indigo-900/30' : 'border-gray-700 text-gray-300 bg-gray-900/40'}`}
          >
            {k === 'all' ? '전체' : k === 'create_note' ? '메모생성' : k === 'add_thought' ? '생각추가' : k === 'evolve_memo' ? '기억강화' : '지식연결'}
          </button>
        ))}
        <div className="ml-auto text-xs text-gray-400">연속 {streakDays}일 작성</div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-[auto_1fr] gap-2">
        {/* y labels */}
        <div className="flex flex-col gap-1.5 pt-6">
          {weekdayLabel.map((d, i) => (
            <div key={i} className="h-6 text-xs text-gray-400 flex items-center justify-end pr-1 w-8">{d}</div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {/* x labels */}
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={`x-${h}`} className="text-[10px] text-gray-500 text-center">{h}</div>
              ))}
            </div>
            <div className="mt-1 grid gap-1" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
              {matrix.map((row, w) => (
                <div key={`r-${w}`} className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                  {row.map((v, h) => (
                    <button
                      key={`c-${w}-${h}`}
                      aria-label={`${weekdayLabel[w]} ${h}시: ${v}건`}
                      className={`h-6 rounded ${classForValue(v, maxValue)} border border-gray-800/70 hover:outline hover:outline-1 hover:outline-indigo-300`}
                      onClick={() => onSlotClick?.(w, h, action)}
                      title={`${weekdayLabel[w]} ${h}시: ${v}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top3 chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {top3.map(({ weekday, hour, count }, idx) => (
          <button
            key={`${weekday}-${hour}`}
            onClick={() => onSlotClick?.(weekday, hour, action)}
            className="px-3 py-1.5 rounded-full text-sm bg-indigo-900/40 border border-indigo-700 text-indigo-200 hover:bg-indigo-800/60"
          >
            #{idx + 1} {weekdayLabel[weekday]} {hour}–{(hour + 1) % 24}h · {count}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekHourHeatmap;


