'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { hasValidToken } from '@/utils/auth';
import FallbackLoading from '../FallbackLoading';

const AuthProtectionWrapper = ({
  children
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const publicPages = [
    '/auth-advance',
    '/auth',
    '/blogs',
    '/feed/scholars',
    '/feed/books',
    '/feed/articles',
    '/feed/podcasts',
    '/profile/scholar'
  ];

  const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  const {
    status,
    data: session
  } = useSession();

  // Session durumunu kontrol et
  useEffect(() => {
    // ÖNEMLİ: NextAuth bazen session'ı geç yükleyebilir veya unauthenticated diyebilir
    // Bu yüzden localStorage'daki token'ı da kontrol eden agresif bir yaklaşım izliyoruz
    const hasToken = hasValidToken();

    // Sadece public olmayan sayfalarda ve GERÇEKTEN kimlik doğrulanmamışsa (token da yoksa) yönlendir
    if (status === 'unauthenticated' && !isPublicPage && !hasToken) {
      const loginUrl = `${window.location.origin}/auth-advance/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
      window.location.href = loginUrl;
    }
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
    if (hasValidToken()) {
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