'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import FallbackLoading from '../FallbackLoading';

const AuthProtectionWrapper = ({
  children
}) => {
  const {
    status,
    data: session
  } = useSession({
    required: false,
    onUnauthenticated() {
      // Session yoksa login sayfasına yönlendir
      const pathname = window.location.pathname;
      window.location.href = `${window.location.origin}/auth-advance/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
    }
  });

  const router = useRouter();
  const pathname = usePathname();

  // Session durumunu kontrol et
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Use absolute URL for production compatibility
      const loginUrl = `${window.location.origin}/auth-advance/sign-in?redirectTo=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [status, router, pathname]);

  // Debug için session durumunu logla
  useEffect(() => {
  }, [status, session]);

  // Loading durumunda fallback göster
  if (status === 'loading') {
    return <FallbackLoading />;
  }

  // Unauthenticated durumunda fallback göster
  if (status === 'unauthenticated') {
    return <FallbackLoading />;
  }

  // Authenticated durumunda children'ı render et
  return (
    <Suspense fallback={<FallbackLoading />}>
      {children}
    </Suspense>
  );
};

export default AuthProtectionWrapper;