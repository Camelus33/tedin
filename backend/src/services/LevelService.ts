export type LevelInputs = {
  totalUsageMs: number; // accumulated service usage in milliseconds
  memoCount: number; // number of memos (notes) created by the user
  conceptScoreSum: number; // sum of concept understanding scores across notes
};

export type LevelConfig = {
  // XP coefficients
  a: number; // time coefficient
  b: number; // memo coefficient
  c: number; // concept coefficient
  // scaling unit for concept score sum
  cUnit: number;
  // diminishing returns exponents (0<exp<=1)
  alpha: number; // time exponent
  beta: number; // memo exponent
  gamma: number; // concept exponent
  // level threshold parameters
  k: number; // base multiplier
  exponent: number; // level growth exponent, e.g., 1.45
};

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  a: 80,
  b: 100,
  c: 220,
  cUnit: 1000,
  alpha: 0.85,
  beta: 0.8,
  gamma: 0.9,
  k: 500,
  exponent: 1.45,
};

export type LevelComputation = {
  level: number;
  totalXP: number;
  nextLevel: number;
  currentThreshold: number;
  nextThreshold: number;
  progressToNext: number; // 0..1
  breakdown: {
    xpTime: number;
    xpMemo: number;
    xpConcept: number;
    hours: number;
    memoCount: number;
    conceptScoreSum: number;
  };
  config: LevelConfig;
};

function clampToFinite(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

export function computeXPLevel(
  inputs: LevelInputs,
  config: LevelConfig = DEFAULT_LEVEL_CONFIG
): LevelComputation {
  const hours = clampToFinite(inputs.totalUsageMs) / 3_600_000;
  const memo = clampToFinite(inputs.memoCount);
  const conceptUnits = clampToFinite(inputs.conceptScoreSum) / Math.max(1, config.cUnit);

  // XP components with diminishing returns
  const xpTime = config.a * Math.pow(hours, config.alpha);
  const xpMemo = config.b * Math.pow(memo, config.beta);
  const xpConcept = config.c * Math.pow(conceptUnits, config.gamma);

  const totalXP = xpTime + xpMemo + xpConcept;

  // Find max level L such that k * L^exponent <= totalXP
  // Solve for L: L <= (totalXP / k)^(1/exponent)
  const approxLevel = Math.pow(totalXP / Math.max(1e-9, config.k), 1 / config.exponent);
  const level = Math.max(0, Math.floor(approxLevel));
  const nextLevel = level + 1;

  const currentThreshold = config.k * Math.pow(level, config.exponent);
  const nextThreshold = config.k * Math.pow(nextLevel, config.exponent);

  let progressToNext = 0;
  if (nextThreshold > currentThreshold) {
    progressToNext = clampToFinite((totalXP - currentThreshold) / (nextThreshold - currentThreshold));
    if (!Number.isFinite(progressToNext)) progressToNext = 0;
    progressToNext = Math.min(1, Math.max(0, progressToNext));
  }

  return {
    level,
    totalXP,
    nextLevel,
    currentThreshold,
    nextThreshold,
    progressToNext,
    breakdown: {
      xpTime,
      xpMemo,
      xpConcept,
      hours,
      memoCount: memo,
      conceptScoreSum: clampToFinite(inputs.conceptScoreSum),
    },
    config,
  };
}


