'use client';

import Link from 'next/link';
import { BsChatLeftTextFill, BsGearFill } from 'react-icons/bs';
import LogoBox from '@/components/LogoBox';
import CollapseMenu from './CollapseMenu';
import MobileMenuToggle from './MobileMenuToggle';
import ProfileDropdown from './ProfileDropdown';
import StyledHeader from './StyledHeader';
import MessageIconWithBadge from './MessageIconWithBadge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationDropdown from './NotificationDropdown';
import FollowRequestsDropdown from './FollowRequestsDropdown';
import { useSession } from 'next-auth/react';

const TopHeader = () => {
  const { status } = useSession();
  const isGuest = status === 'unauthenticated';

  return <StyledHeader>
    <div className="container top-header-inner position-relative d-flex align-items-center justify-content-between flex-nowrap" style={{
      height: '80px',
      minHeight: '80px',
      maxHeight: '80px',
      maxWidth: '1040px',
      margin: '0 auto',
      overflow: 'visible',
      gap: '1.5rem'
    }}>
      {/* Sol: Logo - solda sabit */}
      <div className="d-flex align-items-center justify-content-start flex-shrink-0 logo-container" style={{ flex: '0 0 auto', minWidth: '0' }}>
        <LogoBox />
      </div>

      {/* Orta: Arama - merkezde, kalan alanı doldurur */}
      <div className="d-none d-lg-flex align-items-center" style={{ flex: '1 1 auto', minWidth: '200px', maxWidth: '420px', justifyContent: 'center' }}>
        <CollapseMenu isSearch />
      </div>

      {/* Sağ: İkonlar - sağda sabit */}
      <ul className="nav flex-nowrap align-items-center d-none d-lg-flex list-unstyled mb-0" style={{ flex: '0 0 auto', gap: '0.5rem', overflow: 'visible', justifyContent: 'flex-end', minWidth: '0' }}>
        {!isGuest && (
          <>
            <li className="nav-item">
              <MessageIconWithBadge />
            </li>
            <FollowRequestsDropdown />
            <NotificationDropdown />
          </>
        )}

        <li className="nav-item">
          <LanguageSwitcher />
        </li>

        <li className="nav-item">
          <ThemeSwitcher />
        </li>

        <li className="nav-item">
          <ProfileDropdown />
        </li>
      </ul>

      {/* Mobile navigation - profil butonu ekranda kalacak şekilde */}
      <div className="d-flex align-items-center d-lg-none flex-nowrap mobile-header-actions overflow-visible" style={{
        gap: '0.5rem',
        flex: '1 1 auto',
        justifyContent: 'flex-end',
        minWidth: 0,
        flexShrink: 0
      }}>
        {!isGuest && (
          <div className="d-flex align-items-center flex-nowrap" style={{ gap: '0.35rem' }}>
            <MessageIconWithBadge />
            <FollowRequestsDropdown />
            <NotificationDropdown />
          </div>
        )}
        <div className="mobile-language-switcher flex-shrink-0">
          <LanguageSwitcher compact />
        </div>
        <div className="mobile-theme-switcher flex-shrink-0">
          <ThemeSwitcher />
        </div>
        <div className="mobile-profile flex-shrink-0">
          <ProfileDropdown />
        </div>
      </div>
    </div>

    <style jsx>{`
        @media (max-width: 991.98px) {
          .container {
            padding-left: 0.5rem !important;
            padding-right: 1rem !important;
            justify-content: space-between !important;
            max-width: 100vw !important;
          }
          
          .logo-container {
            max-width: 110px !important;
            margin-right: 0.35rem !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
          }
          
          .mobile-header-actions {
            gap: 0.25rem !important;
            min-width: 0;
            flex-shrink: 0;
            overflow: visible !important;
          }
          
          .mobile-profile :global(.nav-link),
          .mobile-profile :global(.btn) {
            padding: 0.3rem 0.5rem !important;
            font-size: 0.8rem !important;
          }
          
          .mobile-language-switcher {
            max-width: 130px;
          }
          
          .mobile-language-switcher :global(.language-switcher-select2) {
            min-width: 95px !important;
            max-width: 130px !important;
          }
          
          .mobile-language-switcher :global(.language-select__control) {
            min-height: 36px !important;
            padding: 0.2rem 0.4rem !important;
            font-size: 0.8rem !important;
          }
          
          .mobile-language-switcher :global(.language-select__single-value) {
            font-size: 0.8rem !important;
          }
          
          .mobile-language-switcher :global(.language-select__dropdown-indicator) {
            padding: 0 0.2rem !important;
          }
          
          .mobile-language-switcher :global(.language-select__indicator svg) {
            width: 14px !important;
            height: 14px !important;
          }
          
          .mobile-language-switcher :global(.language-select__menu) {
            min-width: 280px !important;
            max-width: calc(100vw - 1.5rem) !important;
            max-height: calc(100dvh - 80px) !important;
            font-size: 0.85rem !important;
          }
          
          .mobile-language-switcher :global(.language-menu-list-responsive) {
            grid-template-columns: 1fr !important;
            max-height: calc(100dvh - 140px) !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
        }
        
        @media (max-width: 575.98px) {
          .container {
            padding-left: 0.5rem !important;
            padding-right: 1rem !important;
          }
          
          .logo-container {
            max-width: 90px !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
          
          .mobile-language-switcher {
            max-width: 90px;
          }
          
          .mobile-language-switcher :global(.language-switcher-select2) {
            min-width: 88px !important;
            max-width: 110px !important;
          }
          
          .mobile-language-switcher :global(.language-select__control) {
            min-height: 38px !important;
            padding: 0.35rem 0.5rem !important;
            font-size: 0.85rem !important;
          }
          
          .mobile-language-switcher :global(.language-select__menu) {
            min-width: 250px !important;
            max-width: calc(100vw - 1rem) !important;
            max-height: calc(100dvh - 72px) !important;
          }
          
          .mobile-language-switcher :global(.language-menu-list-responsive) {
            max-height: calc(100dvh - 130px) !important;
            padding: 0.35rem !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
        }
        
        @media (max-width: 399.98px) {
          .container {
            padding-left: 0.4rem !important;
            padding-right: 0.75rem !important;
          }
          
          .logo-container {
            max-width: 75px !important;
            margin-left: 0 !important;
          }
          
          .mobile-language-switcher {
            max-width: 75px;
          }
          
          .mobile-language-switcher :global(.language-switcher-select2) {
            min-width: 80px !important;
            max-width: 95px !important;
          }
          
          .mobile-language-switcher :global(.language-select__control) {
            min-height: 36px !important;
            padding: 0.3rem 0.4rem !important;
            font-size: 0.8rem !important;
          }
          
          .mobile-language-switcher :global(.language-select__menu) {
            min-width: 220px !important;
            max-width: calc(100vw - 0.75rem) !important;
            max-height: calc(100dvh - 68px) !important;
          }
          
          .mobile-language-switcher :global(.language-menu-list-responsive) {
            max-height: calc(100dvh - 125px) !important;
            padding: 0.3rem !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          .mobile-language-switcher :global(.language-select__option) {
            padding: 0.35rem 0.5rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
  </StyledHeader>;
};
export default TopHeader;