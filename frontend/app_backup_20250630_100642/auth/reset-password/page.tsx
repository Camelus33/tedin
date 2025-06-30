'use client';

import Link from 'next/link';
import AppLogo from '@/components/common/AppLogo'; // AppLogo 컴포넌트 경로 확인 필요
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // 실제 비밀번호 재설정 요청 로직 (추후 구현)
    // 예: apiClient.post('/auth/request-password-reset', { email });
    // 현재는 임시 메시지만 표시
    try {
      // 임시: 성공 메시지 표시
      setMessage('비밀번호 재설정 이메일이 발송되었습니다. 받은 편지함을 확인해주세요. (기능 구현 중)');
      console.log('Password reset requested for:', email);
      // setEmail(''); // 성공 시 이메일 필드 비우기 (선택)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
          <Link href="/">
            <AppLogo className="mx-auto w-20 h-20" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            계정의 이메일 주소를 입력해주세요.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="등록된 이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 font-medium shadow-lg disabled:opacity-70"
            >
              {isLoading ? "요청 중..." : "재설정 링크 받기"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 