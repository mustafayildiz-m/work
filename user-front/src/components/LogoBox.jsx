'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLayoutContext } from '@/context/useLayoutContext';

const LogoBox = () => {
  const {
    theme
  } = useLayoutContext();
  return (
    <Link className="navbar-brand" href="/" aria-label="Anasayfaya dön" title="Anasayfaya dön">
      {/* Desktop logo - açık tema ile aynı, header (80px) sınırları içinde */}
      <Image
        src="/logo/logo.png"
        alt="Islamic Windows - Your window to a beautiful world"
        height={72}
        width={380}
        className="navbar-brand-item d-none d-lg-block"
        style={{ height: 72, maxHeight: 72, width: 'auto', maxWidth: 400, objectFit: 'contain' }}
        quality={100}
        unoptimized
        priority
      />

      {/* Mobile logo - kompakt, anasayfaya tıklanabilir */}
      <Image
        src="/logo/logo.png"
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