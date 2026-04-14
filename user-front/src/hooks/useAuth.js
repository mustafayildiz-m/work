'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  getUserIdFromToken, 
  getUserInfoFromToken, 
  storeToken, 
  clearToken, 
  hasValidToken,
  getToken,
  isTokenExpired 
} from '@/utils/auth';
import {
  dispatchThemeAfterLogin,
  THEME_RESET_SESSION_FLAG,
} from '@/utils/themeLogin';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const hasToken = hasValidToken();
        const token = getToken();
        const userId = getUserIdFromToken();
        const user = getUserInfoFromToken();

        setIsAuthenticated(hasToken && !!userId);
        setUserInfo(user);
        setLoading(false);

        //   hasToken,
        //   hasValidToken: hasToken,
        //   userId,
        //   user,
        //   sessionStatus: status
        // });
      } catch (error) {
        // console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUserInfo(null);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [status, session]);

  // Session değiştiğinde token'ı localStorage'a yaz
  // Backend JWT expire olduysa kullanıcıyı çıkış yaptır
  useEffect(() => {
    if (session?.access_token) {
      if (isTokenExpired(session.access_token)) {
        // Backend JWT expired ama NextAuth session hala aktif — force logout
        clearToken();
        setIsAuthenticated(false);
        setUserInfo(null);
        signOut({ redirect: false }).then(() => {
          if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}/auth-advance/sign-in?message=session_expired`;
          }
        });
        return;
      }

      storeToken(session.access_token, true);
      
      const userId = getUserIdFromToken();
      const user = getUserInfoFromToken();
      setIsAuthenticated(!!userId);
      setUserInfo(user);

      if (typeof window !== 'undefined') {
        try {
          if (sessionStorage.getItem(THEME_RESET_SESSION_FLAG) === '1') {
            sessionStorage.removeItem(THEME_RESET_SESSION_FLAG);
            dispatchThemeAfterLogin('green');
          }
        } catch {
          /* sessionStorage erişilemezse yoksay */
        }
      }
    }
  }, [session]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Login öncesi eski token'ı temizle
      clearToken();
      
      // NextAuth ile giriş yap
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false
      });

      if (result?.ok) {
        dispatchThemeAfterLogin('green');
        // Başarılı giriş - session callback'te token otomatik olarak localStorage'a yazılacak
        return { success: true };
      } else {
        return { success: false, error: result?.error || 'Login failed' };
      }
    } catch (error) {
      // console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // LocalStorage'dan token'ı temizle
      clearToken();
      
      // State'i temizle
      setIsAuthenticated(false);
      setUserInfo(null);
      
      // Dynamic callback URL based on current environment
      const getCallbackUrl = () => {
        if (typeof window !== 'undefined') {
          // Client-side: use current origin
          const currentOrigin = window.location.origin;
          return `${currentOrigin}/auth-advance/sign-in`;
        }
        // Server-side: use environment variable or fallback
        return process.env.NEXTAUTH_URL 
          ? `${process.env.NEXTAUTH_URL}/auth-advance/sign-in`
          : '/auth-advance/sign-in';
      };
      
      const callbackUrl = getCallbackUrl();
      
      // NextAuth session'ı temizle - redirect'i manuel yap
      await signOut({ 
        redirect: false
      });
      
      // Manuel redirect - NextAuth'ın redirect'ini bypass et
      window.location.href = callbackUrl;
    } catch (error) {
      // console.error('Logout error:', error);
      // Hata olsa bile state'i temizle ve login sayfasına yönlendir
      setIsAuthenticated(false);
      setUserInfo(null);
      
      // Dynamic redirect for error case too
      if (typeof window !== 'undefined') {
        window.location.href = `${window.location.origin}/auth-advance/sign-in`;
      } else {
        window.location.href = '/auth-advance/sign-in';
      }
    } finally {
      setLoading(false);
    }
  };

  // Periyodik olarak backend JWT'nin geçerliliğini kontrol et
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = getToken(true);
      if (status === 'authenticated' && !token) {
        clearToken();
        setIsAuthenticated(false);
        setUserInfo(null);
        signOut({ redirect: false }).then(() => {
          if (typeof window !== 'undefined') {
            window.location.href = `${window.location.origin}/auth-advance/sign-in?message=session_expired`;
          }
        });
      }
    };

    const intervalId = setInterval(checkTokenValidity, 60000);
    return () => clearInterval(intervalId);
  }, [status]);

  const refreshAuth = () => {
    const userId = getUserIdFromToken();
    const user = getUserInfoFromToken();
    const hasToken = hasValidToken();
    
    setIsAuthenticated(hasToken && !!userId);
    setUserInfo(user);
    
    return { isAuthenticated: hasToken && !!userId, userInfo: user };
  };

  return {
    // State
    isAuthenticated,
    userInfo,
    loading,
    session,
    status,
    
    // Actions
    login,
    logout,
    refreshAuth,
    
    // Token utilities
    getUserIdFromToken,
    getUserInfoFromToken,
    hasValidToken,
    getToken,
    
    // Direct token operations
    storeToken,
    clearToken
  };
};
