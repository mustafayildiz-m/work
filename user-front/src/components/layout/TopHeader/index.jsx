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
      height: '120px',
      minHeight: '120px',
      maxHeight: '120px',
      maxWidth: '1200px',
      margin: '0 auto',
      overflow: 'visible'
    }}>
      {/* Sol üst: Logo - mobilde daha az alan, ikonlara yer aç */}
      <div className="d-flex align-items-center flex-shrink-0 logo-container" style={{ maxWidth: '500px', minWidth: '160px', marginRight: '1.25rem' }}>
        <LogoBox />
      </div>

      {/* Orta: Arama */}
      <div className="d-none d-lg-flex align-items-center" style={{ flex: 1, justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <CollapseMenu isSearch />
      </div>

      {/* Sağ: İkonlar */}
      <ul className="nav flex-nowrap align-items-center d-none d-lg-flex list-unstyled mb-0" style={{ gap: '0.5rem', overflow: 'visible' }}>
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

      {/* Mobile navigation - düzenli ikon düzeni */}
      <div className="d-flex align-items-center d-lg-none flex-nowrap mobile-header-actions" style={{
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
            padding-left: 0 !important;
            padding-right: 0.5rem !important;
          }
          
          .logo-container {
            max-width: 160px !important;
            margin-right: 0.35rem !important;
            margin-left: -3rem !important;
            padding-left: 0 !important;
          }
          
          .mobile-header-actions {
            gap: 0.35rem !important;
            min-width: 0;
            flex-shrink: 0;
          }
          
          .mobile-profile :global(.nav-link),
          .mobile-profile :global(.btn) {
            padding: 0.35rem 0.6rem !important;
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
            padding-left: 0 !important;
            padding-right: 0.35rem !important;
          }
          
          .logo-container {
            max-width: 130px !important;
            margin-left: -3rem !important;
            padding-left: 0 !important;
          }
          
          .mobile-language-switcher {
            max-width: 110px;
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
          .logo-container {
            max-width: 110px !important;
            margin-left: -3rem !important;
          }
          
          .mobile-language-switcher {
            max-width: 95px;
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