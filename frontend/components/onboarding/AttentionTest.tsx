"use client";

import React, { useEffect, useState } from 'react';

interface AttentionTestProps {
  onComplete: (score: number) => void;
  maxDelay?: number;
}

const AttentionTest: React.FC<AttentionTestProps> = ({ onComplete, maxDelay = 3000 }) => {
  const [stage, setStage] = useState<'waiting' | 'ready'>('waiting');
  const [message, setMessage] = useState<string>('준비 중...');
  const [startTime, setStartTime] = useState<number>(0);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [btnColor, setBtnColor] = useState<string>('bg-indigo-500');
  const [btnShape, setBtnShape] = useState<string>('rounded');

  useEffect(() => {
    const delay = Math.random() * (maxDelay - 1000) + 1000;
    const timer = setTimeout(() => {
      setStage('ready');
      setMessage('클릭하세요!');
      setStartTime(Date.now());
      setPos({ x: Math.random() * 80, y: Math.random() * 80 });
      const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500'];
      setBtnColor(colors[Math.floor(Math.random() * colors.length)]);
      const shapes = ['rounded-full', 'rounded-lg', 'rounded'];
      setBtnShape(shapes[Math.floor(Math.random() * shapes.length)]);
    }, delay);
    return () => clearTimeout(timer);
  }, [maxDelay]);

  const handleClick = () => {
    if (stage !== 'ready') return;
    const reactionTime = Date.now() - startTime;
    const minRT = 200;
    const maxRT = 2000;
    const clamped = Math.min(maxRT, Math.max(minRT, reactionTime));
    const score = Math.round(((maxRT - clamped) / (maxRT - minRT)) * 100);
    setMessage(`반응시간: ${reactionTime} ms, 점수: ${score}`);
    onComplete(score);
  };

  return (
    <div className="relative w-full h-32 border border-gray-200">
      <p className="text-center mb-2">{message}</p>
      {stage === 'ready' && (
        <button
          onClick={handleClick}
          className={`${btnColor} text-white px-4 py-2 ${btnShape} absolute`}
          style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
        >
          클릭!
        </button>
      )}
    </div>
  );
};

export default AttentionTest; 