import { median } from './stats';

export interface RhythmBin {
  weekday: number; // 0..6 (Sun=0)
  hour: number; // 0..23
  intervals: number[]; // minutes
}

export function computeFastestBins(
  events: Array<{ createdAt: Date; type: string }>,
  targetTypes: Set<string>,
  minCount: number = 20,
  topN: number = 3
): Array<{ weekday: number; hour: number; medianIntervalMin: number; count: number }> {
  if (events.length < 2) return [];
  const bins: Record<string, RhythmBin> = {};
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];
    if (!targetTypes.has(String(curr.type))) continue;
    const dtMin = (curr.createdAt.getTime() - prev.createdAt.getTime()) / 60000;
    const d = curr.createdAt;
    const key = `${d.getDay()}-${d.getHours()}`;
    if (!bins[key]) bins[key] = { weekday: d.getDay(), hour: d.getHours(), intervals: [] };
    bins[key].intervals.push(dtMin);
  }
  const scored = Object.values(bins)
    .map(b => ({
      weekday: b.weekday,
      hour: b.hour,
      medianIntervalMin: median(b.intervals),
      count: b.intervals.length,
    }))
    .filter(b => b.count >= minCount)
    .sort((a, b) => a.medianIntervalMin - b.medianIntervalMin || b.count - a.count)
    .slice(0, topN);
  return scored;
}


