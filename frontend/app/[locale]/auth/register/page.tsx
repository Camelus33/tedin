'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import AppLogo from '@/components/common/AppLogo';
import { apiClient } from '@/lib/apiClient';

export default function RegisterPage() {
  const t = useTranslations('auth.page.register');
  const tValidation = useTranslations('auth.validation');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setEmailError('');

    // 이메일 유효성 검사
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setError(tValidation('email_invalid'));
      setIsLoading(false);
      return;
    }

    // 닉네임 유효성 검사 (최소 2자)
    if (nickname.trim().length < 2) {
      setError(tValidation('nickname_min_length'));
      setIsLoading(false);
      return;
    }

    // 비밀번호 유효성 검사 (최소 8자)
    if (password.length < 8) {
      setError(tValidation('password_min_length'));
      setIsLoading(false);
      return;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError(tValidation('password_mismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const postData = {
        email,
        password,
        nickname,
      };
      
      const data = await apiClient.post('/auth/register', postData);

      if (!data || data.error) {
        throw new Error(data.error || data.message || tValidation('registration_failed'));
      }

      // 토큰 저장
      localStorage.setItem('token', data.token);
      
      // 회원가입 성공시 온보딩 페이지로 이동
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
          <AppLogo className="mx-auto w-20 h-20" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('subtitle')}{" "}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              {t('login_link')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email_label')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder={t('email_placeholder')}
                title={t('email_tooltip')}
                onBlur={() => {
                  const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
                  if (email && !re.test(email)) {
                    setEmailError(tValidation('email_invalid'));
                  } else {
                    setEmailError('');
                  }
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
            </div>
            
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                {t('nickname_label')}
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                autoComplete="nickname"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder={t('nickname_placeholder')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password_label')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder={t('password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirm_password_label')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder={t('confirm_password_placeholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

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
              {isLoading ? t('register_button_loading') : t('register_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 