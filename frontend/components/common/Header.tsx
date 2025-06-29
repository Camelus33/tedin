'use client';

import Link from 'next/link';
import AppLogo from '@/components/common/AppLogo';

export default function Header() {
  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3" aria-label="Homepage">
            <AppLogo className="w-10 h-10" />
            <div className="flex items-end space-x-1.5">
              <span className="text-2xl font-bold text-gray-800 leading-none">habitus33</span>
              <span className="text-xs font-medium tracking-wider text-gray-500 pb-0.5">Atomic Memo</span>
            </div>
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              나의 AI-Link 만들기
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 