'use client';

import React, { useState, useEffect } from 'react';
import styles from './ZengoStatusDisplay.module.css'; // Create this CSS module

interface ZengoStatusDisplayProps {
  usedStonesCount: number;
  totalAllowedStones: number;
  startTime: number | null; // Timestamp when the game started ('playing' state)
  gameState: 'showing' | 'playing' | 'submitting' | 'finished_success' | 'finished_fail' | string; // Include other states if needed
  wordOrderCorrect?: boolean | null; // Optional property to show word order correctness
}

export default function ZengoStatusDisplay({
  usedStonesCount,
  totalAllowedStones,
  startTime,
  gameState,
  wordOrderCorrect
}: ZengoStatusDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState === 'playing' && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100); // Update every 100ms for smoother timer
    } else if (gameState !== 'playing' && interval) {
      clearInterval(interval);
    } else if (gameState === 'showing') {
        // Reset timer when showing words
        setElapsedTime(0);
    }

    // Cleanup on unmount or when gameState changes from playing
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState, startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100); // Get tenths of a second
    return `${seconds}.${milliseconds}초`;
  };

  const remainingStones = totalAllowedStones - usedStonesCount;

  return (
    <div className={styles.statusDisplayContainer}>
      <div className={styles.statusItem}>
        <span className={styles.label}>남은 돌:</span>
        <span className={styles.value}>{remainingStones} / {totalAllowedStones}</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.label}>경과 시간:</span>
        <span className={styles.value}>{formatTime(elapsedTime)}</span>
      </div>
    </div>
  );
} 