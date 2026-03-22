'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useSyncExternalStore } from 'react';
import { useLayoutContext } from '@/context/useLayoutContext';

function subscribePrefersDark(callback) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getPrefersDarkSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getPrefersDarkServerSnapshot() {
  return false;
}

const LogoBox = () => {
  const { theme } = useLayoutContext();
  const systemPrefersDark = useSyncExternalStore(
    subscribePrefersDark,
    getPrefersDarkSnapshot,
    getPrefersDarkServerSnapshot
  );

  const logoSrc = useMemo(() => {
    if (theme === 'dark' || theme === 'green') return '/logo/logo-on-dark.png';
    if (theme === 'light') return '/logo/logo.png';
    if (theme === 'auto') return systemPrefersDark ? '/logo/logo-on-dark.png' : '/logo/logo.png';
    return '/logo/logo.png';
  }, [theme, systemPrefersDark]);

  return (
    <Link className="navbar-brand" href="/" aria-label="Anasayfaya dön" title="Anasayfaya dön">
      {/* Desktop — header (80px); dark / green / auto+koyu: ISLAMIC_WINDOWS_White_Transparent */}
      <Image
        src={logoSrc}
        alt="Islamic Windows - Your window to a beautiful world"
        height={72}
        width={380}
        className="navbar-brand-item d-none d-lg-block"
        style={{ height: 72, maxHeight: 72, width: 'auto', maxWidth: 400, objectFit: 'contain' }}
        quality={100}
        unoptimized
        priority
      />

      <Image
        src={logoSrc}
        alt="Islamic Windows - Anasayfa"
        height={36}
        width={100}
        className="navbar-brand-item d-lg-none"
        style={{ height: 36, width: 'auto', maxWidth: 100, minWidth: 60, objectFit: 'contain' }}
        quality={95}
        unoptimized
      />
    </Link>
  );
};

export default LogoBox;