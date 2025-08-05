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
      
      // Fetch actual user data from API using the token
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            dispatch(loginSuccess({
              id: userData.userId, // userId 필드를 id로 매핑
              email: userData.email,
              nickname: userData.nickname,
              token,
              trialEndsAt: userData.trialEndsAt || null,
              inviteCode: userData.inviteCode || null,
            }));
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            dispatch(logout());
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          dispatch(logout());
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
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
      
      // Use the shared API function
      const data = await authApi.login(email, password);
      
      // The token is already stored by authApi.login, so no need to do it here.
      
      dispatch(loginSuccess(data.user));
      router.push('/dashboard');
      return data;
    } catch (error: any) {
      dispatch(loginFailure(error.message || '로그인 중 오류가 발생했습니다.'));
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