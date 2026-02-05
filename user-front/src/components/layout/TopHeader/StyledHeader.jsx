'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
const StyledHeader = ({
  children,
  ...restProps
}) => {
  const pathname = usePathname();
  
  const classes = useMemo(() => {
    const transparentPages = ['/event', '/events/details'];
    
    if (transparentPages.includes(pathname)) {
      return {
        header: 'navbar-transparent header-static',
        nav: 'navbar navbar-dark navbar-expand-lg'
      };
    }
    return {
      header: 'navbar-light fixed-top header-static bg-mode',
      nav: 'navbar navbar-expand-lg'
    };
  }, [pathname]);
  
  return <header className={classes.header} style={{ overflow: 'visible' }} {...restProps}>
      <nav className={classes.nav} style={{ overflow: 'visible' }}>{children}</nav>
    </header>;
};
export default StyledHeader;