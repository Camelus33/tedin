'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { loginStart, loginSuccess, loginFailure, logout } from '@/store/slices/userSlice';
import { auth as authApi } from '@/lib/api';

export default function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check if user is already authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !user.isAuthenticated) {
      // If we have a token but no user data, try to fetch user data
      setIsLoading(true);
      
      // Here we would normally make an API call to validate the token and get user info
      // For now, we'll just set the user as authenticated with minimal data
      dispatch(loginSuccess({
        id: 'cached', // This would be replaced with real ID from API
        email: 'cached@email.com', // This would be replaced with real email from API
        nickname: 'Cached User', // This would be replaced with real nickname from API
        token,
        trialEndsAt: null,
        inviteCode: null,
      }));
      
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [dispatch, user.isAuthenticated]);
  
  // Register a new user
  const register = useCallback(async (
    email: string,
    password: string,
    nickname: string,
    inviteCode?: string
  ) => {
    try {
      dispatch(loginStart());
      const response = await authApi.register(email, password, nickname, inviteCode);
      
      dispatch(loginSuccess({
        id: response.userId,
        email,
        nickname,
        token: response.token,
        trialEndsAt: response.trialEndsAt,
        inviteCode: response.inviteCode,
      }));
      
      // Navigate to onboarding
      router.push('/onboarding');
      return true;
    } catch (error: any) {
      dispatch(loginFailure(error.message || '회원가입 중 오류가 발생했습니다'));
      return false;
    }
  }, [dispatch, router]);
  
  // Login an existing user
  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to login');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      
      dispatch(loginSuccess(data.user));
      router.push('/dashboard');
      return data;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };
  
  // Logout the current user
  const logoutUser = useCallback(() => {
    authApi.logout();
    dispatch(logout());
    router.push('/');
  }, [dispatch, router]);
  
  // Request a password reset
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authApi.resetPassword(email);
      return true;
    } catch (error) {
      return false;
    }
  }, []);
  
  return {
    user,
    isLoading,
    isAuthenticated: user.isAuthenticated,
    register,
    login,
    logout: logoutUser,
    resetPassword,
  };
} 