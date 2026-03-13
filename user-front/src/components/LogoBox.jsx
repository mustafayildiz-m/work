'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLayoutContext } from '@/context/useLayoutContext';

const LogoBox = () => {
  const {
    theme
  } = useLayoutContext();
  return (
    <Link className="navbar-brand" href="/">
      {/* Desktop logo - 100px, header sınırları içinde */}
      <Image
        src="/logo/logo.png"
        alt="Islamic Windows - Your window to a beautiful world"
        height={100}
        width={380}
        className="navbar-brand-item d-none d-lg-block"
        style={{ height: 100, maxHeight: 100, width: 'auto', maxWidth: 400, objectFit: 'contain' }}
        quality={100}
        unoptimized
        priority
      />

      {/* Mobile logo */}
      <Image
        src="/logo/logo.png"
        alt="Islamic Windows"
        height={72}
        width={270}
        className="navbar-brand-item d-lg-none"
        style={{ height: 72, width: 'auto', minWidth: 200 }}
        quality={95}
        unoptimized
      />
    </Link>
  );
};

export default LogoBox;