import React, { useEffect, useRef, useState } from 'react';

interface CountdownModalProps {
  game: any;
  onCancel: () => void;
  onComplete: () => void;
}

const COUNT_START = 5;

const CountdownModal: React.FC<CountdownModalProps> = ({ game, onCancel, onComplete }) => {
  const [count, setCount] = useState(COUNT_START);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          onComplete();
          return 1;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 shadow-2xl animate-pulse">
          <span className="text-white text-6xl md:text-7xl font-extrabold drop-shadow-lg animate-scaleIn">
            {count}
          </span>
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              onCancel();
            }}
            className="px-6 py-2 rounded-full bg-white/80 text-lg font-semibold text-gray-700 shadow hover:bg-white/100 transition-colors border border-gray-300"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountdownModal; 