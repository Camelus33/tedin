"use client";

import React, { useEffect, useState } from 'react';

interface MemoryTestProps {
  sequenceLength?: number;
  displayDuration?: number; // duration in ms for each digit display
  onComplete: (score: number) => void;
}

const MemoryTest: React.FC<MemoryTestProps> = ({ sequenceLength = 5, displayDuration = 500, onComplete }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [showIndex, setShowIndex] = useState<number>(0);
  const [stage, setStage] = useState<'show' | 'input'>('show');
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    // Generate random digit sequence
    const seq = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 10).toString());
    setSequence(seq);
  }, [sequenceLength]);

  useEffect(() => {
    if (sequence.length === 0) return;
    const timers: NodeJS.Timeout[] = [];
    sequence.forEach((_, idx) => {
      const timer = setTimeout(() => {
        setShowIndex(idx);
        // After last digit, switch to input mode after displayDuration
        if (idx === sequence.length - 1) {
          setTimeout(() => setStage('input'), displayDuration);
        }
      }, idx * displayDuration);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [sequence, displayDuration]);

  const handleSubmit = () => {
    const inputSeq = inputValue.replace(/\s/g, '').split('');
    let correct = 0;
    sequence.forEach((digit, idx) => {
      if (inputSeq[idx] === digit) correct++;
    });
    const score = Math.round((correct / sequence.length) * 100);
    onComplete(score);
  };

  if (stage === 'show') {
    return (
      <div className="text-center">
        <p className="mb-2">순서를 기억하세요</p>
        <div className="text-3xl font-bold">{sequence[showIndex] || ''}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p>보였던 숫자를 순서대로 입력하세요:</p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-indigo-500 text-white rounded"
      >
        제출
      </button>
    </div>
  );
};

export default MemoryTest; 