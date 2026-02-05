'use client';

import { useLayoutContext } from '@/context/useLayoutContext';

const MobileMenuToggle = () => {
  const {
    mobileMenu: {
      open,
      toggle
    }
  } = useLayoutContext();
  
  return (
    <>
      <button 
        className="navbar-toggler icon-md btn btn-light p-0 d-flex align-items-center justify-content-center mobile-menu-toggle" 
        type="button" 
        data-bs-toggle="collapse" 
        aria-label="Toggle navigation" 
        aria-expanded={open} 
        onClick={toggle}
      >
        <span className="navbar-toggler-animation">
          <span />
          <span />
          <span />
        </span>
      </button>

      <style jsx>{`
        @media (max-width: 991.98px) {
          :global(.mobile-menu-toggle) {
            width: 32px !important;
            height: 32px !important;
          }
          
          :global(.mobile-menu-toggle .navbar-toggler-animation) {
            width: 18px !important;
          }
          
          :global(.mobile-menu-toggle .navbar-toggler-animation span) {
            height: 2px !important;
          }
        }

        @media (max-width: 575.98px) {
          :global(.mobile-menu-toggle) {
            width: 30px !important;
            height: 30px !important;
          }
          
          :global(.mobile-menu-toggle .navbar-toggler-animation) {
            width: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileMenuToggle;