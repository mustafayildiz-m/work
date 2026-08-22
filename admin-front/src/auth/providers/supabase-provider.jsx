import { useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import * as authHelper from '@/auth/lib/helpers';
import { resetAdminUiLanguageToDefault } from '@/i18n/reset-admin-language';

// Define the Supabase Auth Provider
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('access_token');
    const rememberMe = localStorage.getItem('remember_me');
    // rememberMe === 'false' means the token should not survive a full browser
    // restart; session_active only lives in sessionStorage, so its absence
    // here means the browser was closed and reopened since the last login.
    if (token && rememberMe === 'false' && !sessionStorage.getItem('session_active')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('remember_me');
      return null;
    }
    return token ? { access_token: token } : null;
  });
  const [currentUser, setCurrentUser] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(currentUser?.is_admin === true);
  }, [currentUser]);

  const verify = async () => {
    if (auth?.access_token) {
      try {
        const user = await getUser();
        if (user?.role === 'user') {
          throw new Error('Yetkisiz giriş: Bu alana sadece yöneticiler erişebilir.');
        }
        setCurrentUser(user || undefined);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth, rememberMe = true) => {
    setAuth(auth);
    if (auth?.access_token) {
      localStorage.setItem('access_token', auth.access_token);
      localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');
      if (rememberMe) {
        sessionStorage.removeItem('session_active');
      } else {
        sessionStorage.setItem('session_active', 'true');
      }
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('remember_me');
      sessionStorage.removeItem('session_active');
    }
  };

  const login = async (email, password, rememberMe = true) => {
    try {
      const auth = await SupabaseAdapter.login(email, password);
      if (auth.user?.role === 'user') {
        throw new Error('Yetkisiz giriş: Bu alana sadece yöneticiler erişebilir.');
      }
      saveAuth(auth, rememberMe);
      const user = await getUser();
      if (user?.role === 'user') {
        saveAuth(undefined);
        setCurrentUser(undefined);
        throw new Error('Yetkisiz giriş: Bu alana sadece yöneticiler erişebilir.');
      }
      setCurrentUser(user || undefined);
    } catch (error) {
      console.error('Login error in provider:', error);
      saveAuth(undefined);
      // Error mesajını olduğu gibi ilet
      throw error;
    }
  };

  const register = async (
    email,
    password,
    password_confirmation,
    firstName,
    lastName,
  ) => {
    try {
      const auth = await SupabaseAdapter.register(
        email,
        password,
        password_confirmation,
        firstName,
        lastName,
      );
      saveAuth(auth);
      const user = await getUser();
      setCurrentUser(user || undefined);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    await SupabaseAdapter.requestPasswordReset(email);
  };

  const resetPassword = async (password, password_confirmation) => {
    await SupabaseAdapter.resetPassword(password, password_confirmation);
  };

  const resendVerificationEmail = async (email) => {
    await SupabaseAdapter.resendVerificationEmail(email);
  };

  const getUser = async () => {
    if (!auth?.access_token) return null;
    return await SupabaseAdapter.getCurrentUser(auth.access_token);
  };

  const updateProfile = async (userData) => {
    return await SupabaseAdapter.updateUserProfile(userData);
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
    resetAdminUiLanguageToDefault();
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        getUser,
        updateProfile,
        logout,
        verify,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
