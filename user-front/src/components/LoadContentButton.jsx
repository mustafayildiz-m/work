'use client';

import useToggle from '@/hooks/useToggle';
import clsx from 'clsx';
import { Button } from 'react-bootstrap';
import Link from 'next/link';

const LoadContentButton = ({
  name,
  className,
  href = '/feed/home' // Default olarak anasayfaya yönlendir
}) => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  
  return (
    <Link href={href} className="text-decoration-none">
      <Button 
        onClick={toggle} 
        variant="link" 
        role="button" 
        className={clsx(className, 'btn-link-loader btn-sm text-secondary d-flex align-items-center', {
          active: isOpen
        })} 
        data-bs-toggle="button" 
        aria-pressed="true"
      >
        <div className="spinner-dots me-2">
          <span className="spinner-dot" />
          <span className="spinner-dot" />
          <span className="spinner-dot" />
        </div>
        {name}
      </Button>
    </Link>
  );
};

export default LoadContentButton;