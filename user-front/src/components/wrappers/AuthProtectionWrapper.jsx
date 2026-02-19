'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
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
  } = useSession({
    required: !isPublicPage,
    onUnauthenticated() {
      if (!isPublicPage) {
        // Session yoksa ve sayfa public değilse login sayfasına yönlendir
        const currentPath = window.location.pathname;
        window.location.href = `${window.location.origin}/auth-advance/sign-in?redirectTo=${encodeURIComponent(currentPath)}`;
      }
    }
  });

  // Session durumunu kontrol et
  useEffect(() => {
    if (status === 'unauthenticated' && !isPublicPage) {
      const loginUrl = `${window.location.origin}/auth-advance/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [status, router, pathname, isPublicPage]);

  // Loading durumunda fallback göster (Public sayfalarda session loading iken de içeriği gösterebiliriz ama bazen user datasını beklemek iyi olabilir)
  if (status === 'loading') {
    return <FallbackLoading />;
  }

  // Unauthenticated durumunda eğer sayfa public değilse fallback göster (zaten useEffect yönlendirecek)
  if (status === 'unauthenticated' && !isPublicPage) {
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