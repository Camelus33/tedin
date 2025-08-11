'use client';

export type ZengoResultEntry = {
  ts: number;
  level: string; // e.g., '3x3-easy' | '5x5-medium' | '7x7-hard'
  resultType: 'EXCELLENT' | 'SUCCESS' | 'FAIL';
  score?: number;
};

const STORAGE_KEY = 'zengoRecentResults';
const MAX_ENTRIES = 50;

export function addResultEntry(entry: ZengoResultEntry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: ZengoResultEntry[] = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    const trimmed = arr.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[zengoProgress] addResultEntry failed', e);
  }
}

export function getRecentResults(limit = 20): ZengoResultEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: ZengoResultEntry[] = raw ? JSON.parse(raw) : [];
    return arr.slice(0, limit);
  } catch (e) {
    return [];
  }
}

export function computeNudges(recent: ZengoResultEntry[]) {
  const lastN = (n: number) => recent.slice(0, n);

  const last5 = lastN(5);
  const last10 = lastN(10);

  const countBy = (arr: ZengoResultEntry[], pred: (e: ZengoResultEntry) => boolean) => arr.filter(pred).length;
  const avgScore = (arr: ZengoResultEntry[]) => {
    const nums = arr.map(e => e.score ?? 0);
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  };

  const is3x3 = (e: ZengoResultEntry) => e.level.startsWith('3x3');
  const is5x5 = (e: ZengoResultEntry) => e.level.startsWith('5x5');

  const last5_3x3 = last5.filter(is3x3);
  const readyFor5x5 =
    countBy(last5_3x3, e => e.resultType === 'EXCELLENT') >= 2 || avgScore(last5_3x3) >= 80;

  const last10_5x5 = last10.filter(is5x5);
  const suggest7x7 =
    countBy(last10_5x5, e => e.resultType !== 'FAIL') >= 4 ||
    countBy(last10_5x5, e => e.resultType === 'EXCELLENT') >= 1;

  return { readyFor5x5, suggest7x7 };
}

// Daily challenge token for 7x7
const CHALLENGE_KEY = 'zengoDailyChallengeDate';
export function canUseDailyChallenge(today = new Date()): boolean {
  try {
    const stored = localStorage.getItem(CHALLENGE_KEY);
    const d = today.toISOString().slice(0, 10);
    return stored !== d; // usable if not used today
  } catch {
    return true;
  }
}

export function markDailyChallengeUsed(today = new Date()) {
  try {
    const d = today.toISOString().slice(0, 10);
    localStorage.setItem(CHALLENGE_KEY, d);
  } catch {}
}


