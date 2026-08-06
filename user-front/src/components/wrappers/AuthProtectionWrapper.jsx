'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { hasValidToken, isTokenExpired } from '@/utils/auth';
import FallbackLoading from '../FallbackLoading';

const AuthProtectionWrapper = ({
  children
}) => {
  const pathname = usePathname();
  const isRedirecting = useRef(false);

  const publicPages = [
    '/auth-advance',
    '/auth',
    '/blogs',
    '/feed/scholars',
    '/feed/books',
    '/feed/podcasts',
    '/profile/scholar'
  ];

  const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  const { status, data: session } = useSession();

  const redirectToLogin = (message) => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;
    if (typeof window !== 'undefined') {
      const loginUrl = new URL(`${window.location.origin}/auth-advance/sign-in`);
      loginUrl.searchParams.set('redirectTo', pathname);
      if (message) loginUrl.searchParams.set('message', message);
      window.location.replace(loginUrl.toString());
    }
  };

  const forceLogout = () => {
    if (isRedirecting.current) return;
    signOut({ redirect: false }).then(() => {
      redirectToLogin('session_expired');
    });
  };

  const ensureAuthenticated = () => {
    if (isPublicPage) return true;

    if (status === 'authenticated') {
      if (session?.access_token && isTokenExpired(session.access_token)) {
        forceLogout();
        return false;
      }
      return true;
    }

    if (status === 'loading') return true;

    const hasToken = hasValidToken();
    if (!hasToken) {
      redirectToLogin();
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (status === 'loading') return;
    isRedirecting.current = false;

    if (status === 'unauthenticated') {
      ensureAuthenticated();
    }

    if (status === 'authenticated' && !isPublicPage) {
      if (session?.access_token && isTokenExpired(session.access_token)) {
        forceLogout();
        return;
      }
    }

    const handleVisibilityOrFocus = () => {
      if (status === 'unauthenticated') {
        ensureAuthenticated();
      }
      if (status === 'authenticated' && !isPublicPage && !hasValidToken()) {
        forceLogout();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const intervalId = window.setInterval(() => {
      if (status === 'unauthenticated') {
        ensureAuthenticated();
      }
      if (status === 'authenticated' && !isPublicPage && !hasValidToken()) {
        forceLogout();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.clearInterval(intervalId);
    };
  }, [status, pathname, isPublicPage, session]);

  if (status === 'loading') {
    if (hasValidToken()) {
      return (
        <Suspense fallback={<FallbackLoading />}>
          {children}
        </Suspense>
      );
    }
    return <FallbackLoading />;
  }

  if (status === 'unauthenticated' && !isPublicPage) {
    if (ensureAuthenticated()) {
      return (
        <Suspense fallback={<FallbackLoading />}>
          {children}
        </Suspense>
      );
    }
    return <FallbackLoading />;
  }

  if (status === 'authenticated' && !isPublicPage) {
    if (session?.access_token && isTokenExpired(session.access_token)) {
      return <FallbackLoading />;
    }
  }

  return (
    <Suspense fallback={<FallbackLoading />}>
      {children}
    </Suspense>
  );
};


export default AuthProtectionWrapper;