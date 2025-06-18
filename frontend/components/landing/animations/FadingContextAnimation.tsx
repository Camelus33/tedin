'use client';

import React from 'react';
import { User, Cpu } from 'lucide-react';

const FadingContextAnimation = () => {
  return (
    <div className="relative flex justify-center items-center p-8 mt-8 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-indigo-100/80 to-transparent blur-3xl opacity-50"></div>
      </div>
      <style jsx>{`
        .context-packet-wrapper {
          position: absolute;
          top: 50%;
          left: 10px; /* Give some initial padding */
          transform: translateY(-50%);
          /* Add a delay and refined timing */
          animation: fadeAndMove 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0.2s;
        }

        .context-packet {
          display: inline-block;
          /* Refined Gradient */
          background: linear-gradient(120deg, #5e5efd, #ad5bff);
          color: white;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          border-radius: 9999px;
          padding: 6px 14px;
          /* Softer, more layered shadow */
          box-shadow: 0 5px 15px rgba(94, 94, 253, 0.25), 0 2px 4px rgba(0,0,0,0.05);
          white-space: nowrap;
          /* Add pulsing glow */
          animation: pulse 2.5s infinite;
        }

        @keyframes fadeAndMove {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          20% {
            opacity: 1;
          }
          90% {
            opacity: 0;
            transform: translateX(160px) scale(0.5);
          }
          100% {
             opacity: 0;
             transform: translateX(160px) scale(0.5);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 5px 15px rgba(94, 94, 253, 0.25), 0 2px 4px rgba(0,0,0,0.05);
          }
          50% {
            box-shadow: 0 8px 25px rgba(94, 94, 253, 0.4), 0 2px 4px rgba(0,0,0,0.05);
          }
        }

        .icon-container {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Polished Style */
          background-color: white;
          border: 1px solid #e2e8f0; /* slate-200 */
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .path-line {
            width: 180px;
            height: 2px;
            /* Simple, elegant line */
            background-color: #e2e8f0; /* slate-200 */
        }
      `}</style>
      <div className="flex items-center gap-4 z-10">
        {/* User Icon */}
        <div className="icon-container">
          <User size={30} className="text-indigo-500" />
        </div>

        {/* Animation Path */}
        <div className="relative w-48 h-12">
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 path-line"></div>
            <div className="context-packet-wrapper">
                <div className="context-packet">
                Context
                </div>
            </div>
        </div>

        {/* AI Icon */}
        <div className="icon-container">
          <Cpu size={30} className="text-violet-500" />
        </div>
      </div>
    </div>
  );
};

export default FadingContextAnimation; 