import { useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import * as authHelper from '@/auth/lib/helpers';

// Define the Supabase Auth Provider
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('access_token');
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

  const saveAuth = (auth) => {
    setAuth(auth);
    if (auth?.access_token) {
      localStorage.setItem('access_token', auth.access_token);
    } else {
      localStorage.removeItem('access_token');
    }
  };

  const login = async (email, password) => {
    try {
      const auth = await SupabaseAdapter.login(email, password);
      if (auth.user?.role === 'user') {
        throw new Error('Yetkisiz giriş: Bu alana sadece yöneticiler erişebilir.');
      }
      saveAuth(auth);
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
