import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

const ArticleToCapsuleAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        {/* Animated paths */}
        <path
          d="M 50,50 Q 150,20 250,100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          className="path-animate"
          style={{ animationDelay: '0s' }}
        />
        <path
          d="M 50,100 Q 150,100 250,100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          className="path-animate"
          style={{ animationDelay: '0.3s' }}
        />
        <path
          d="M 50,150 Q 150,180 250,100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          className="path-animate"
          style={{ animationDelay: '0.6s' }}
        />

        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Article Stack */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-24">
        <div className="absolute w-full h-full bg-white/60 rounded-md shadow-sm transform -rotate-6" />
        <div className="absolute w-full h-full bg-white/80 rounded-md shadow-md transform -rotate-3" />
        <div className="absolute w-full h-full bg-white rounded-md shadow-lg p-2 space-y-1.5">
          <div className="w-3/4 h-1 bg-gray-300 rounded-sm" />
          <div className="w-full h-1 bg-gray-200 rounded-sm" />
          <div className="w-1/2 h-1 bg-gray-300 rounded-sm" />
        </div>
      </div>

      {/* Capsule */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center">
        <div className="absolute w-full h-full bg-indigo-500 rounded-full blur-lg opacity-75 animate-pulse" />
        <div className="relative w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center">
          {/* Capsule Shape */}
          <div className="w-8 h-12 bg-gradient-to-b from-slate-100 to-white rounded-full shadow-lg p-1 flex items-center justify-center">
            <div 
              className="w-full h-full bg-indigo-500 rounded-full opacity-70 animate-pulse"
              style={{ animationDuration: '1.5s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleToCapsuleAnimation; 