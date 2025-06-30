'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import AppLogo from '@/components/common/AppLogo';
import { apiClient } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth.page.login');
  const tValidation = useTranslations('auth.validation');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiClient.post('/auth/login', { email, password });

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Redirect user to dashboard page
      router.push('/dashboard');
    } catch (err: any) {
      console.error('로그인 오류:', err);
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
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              {t('create_account_link')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password_label')}
                </label>
                <Link href="/auth/reset-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  {t('forgot_password_link')}
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder={t('password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {isLoading ? t('login_button_loading') : t('login_button')}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/80 text-gray-500">{t('customer_support')}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('contact_email')}: <a href="mailto:camelus.tedin@gmail.com" className="text-indigo-600 hover:text-indigo-500 transition-colors">camelus.tedin@gmail.com</a>
            </p>
            <p className="mt-4 text-xs text-gray-500">
              {t('company_name')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 