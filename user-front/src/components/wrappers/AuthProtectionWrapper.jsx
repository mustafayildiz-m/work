'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { hasValidToken } from '@/utils/auth';
import FallbackLoading from '../FallbackLoading';

const AuthProtectionWrapper = ({
  children
}) => {
  const pathname = usePathname();

  const publicPages = [
    '/auth-advance',
    '/auth',
    '/blogs',
    '/feed/scholars',
    '/feed/books',
    '/feed/articles',
    '/feed/podcasts',
    '/feed/newsletters',
    '/feed/papers',
    '/profile/scholar'
  ];

  const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  const { status } = useSession();

  const redirectToLogin = () => {
    const loginUrl = `${window.location.origin}/auth-advance/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
    window.location.href = loginUrl;
  };

  const ensureAuthenticated = () => {
    if (isPublicPage) return true;
    const hasToken = hasValidToken();
    if (!hasToken) {
      redirectToLogin();
      return false;
    }
    return true;
  };

  // Session + token durumunu kontrol et
  useEffect(() => {
    if (status === 'unauthenticated') {
      ensureAuthenticated();
      return;
    }
    ensureAuthenticated();

    const handleVisibilityOrFocus = () => {
      ensureAuthenticated();
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const intervalId = window.setInterval(() => {
      ensureAuthenticated();
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.clearInterval(intervalId);
    };
  }, [status, pathname, isPublicPage]);

  // Loading durumunda fallback göster
  // Ancak eğer token varsa içeriği göstermeye devam edebiliriz (agresif yaklaşım)
  if (status === 'loading') {
    if (hasValidToken()) {
      // Token varsa loading olsa bile içeriği göster (session gelince update olur)
      return (
        <Suspense fallback={<FallbackLoading />}>
          {children}
        </Suspense>
      );
    }
    return <FallbackLoading />;
  }

  // Unauthenticated durumunda eğer sayfa public değilse ve token da yoksa fallback göster
  if (status === 'unauthenticated' && !isPublicPage) {
    if (ensureAuthenticated()) {
      // Token var ama status unauthenticated? 
      // Bu genellikle NextAuth'ın token'ı henüz işlemediği/jitter durumudur.
      // İçeriği göstermeye devam et.
      return (
        <Suspense fallback={<FallbackLoading />}>
          {children}
        </Suspense>
      );
    }
    return <FallbackLoading />;
  }

  // Authenticated durumunda veya Public sayfada children'ı render et
  return (
    <Suspense fallback={<FallbackLoading />}>
      {children}
    </Suspense>
  );
};


export default AuthProtectionWrapper;