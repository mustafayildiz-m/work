'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLayoutContext } from '@/context/useLayoutContext';
import logo from '@/assets/images/logo.svg';

const LogoBox = () => {
  const {
    theme
  } = useLayoutContext();
  return (
    <Link className="navbar-brand" href="/">
      {/* Desktop logo */}
      <Image
        src={logo}
        alt="logo"
        height={36}
        width={150}
        className="navbar-brand-item d-none d-lg-block"
      />

      {/* Mobile logo - smaller size */}
      <Image
        src={logo}
        alt="logo"
        height={28}
        width={116}
        className="navbar-brand-item d-lg-none"
      />
    </Link>
  );
};

export default LogoBox;