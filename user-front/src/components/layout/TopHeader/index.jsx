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
    <div className="container position-relative d-flex align-items-center justify-content-between flex-nowrap" style={{
      height: '64px',
      minHeight: '64px',
      maxHeight: '64px',
      maxWidth: '1200px',
      margin: '0 auto',
      overflow: 'visible'
    }}>
      <div className="d-flex align-items-center flex-shrink-0" style={{
        maxWidth: '120px'
      }}>
        <LogoBox />
      </div>

      <div className="d-none d-lg-flex align-items-center" style={{ flex: 1, justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <CollapseMenu isSearch />
      </div>

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

      {/* Mobile navigation - compact layout for small screens */}
      <div className="d-flex align-items-center d-lg-none flex-nowrap" style={{
        gap: '3px',
        flex: '1 1 auto',
        justifyContent: 'flex-end',
        minWidth: 0,
        overflow: 'visible'
      }}>
        {!isGuest && (
          <div className="d-flex align-items-center gap-1 flex-nowrap">
            <MessageIconWithBadge />
            <FollowRequestsDropdown />
            <NotificationDropdown />
          </div>
        )}
        <div className="mobile-language-switcher flex-shrink-1" style={{ minWidth: 0 }}>
          <LanguageSwitcher />
        </div>
        <ThemeSwitcher />
        <ProfileDropdown />
      </div>
    </div>

    <style jsx>{`
        @media (max-width: 991.98px) {
          .container {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .mobile-language-switcher {
            max-width: 120px;
          }
          
          .mobile-language-switcher :global(.language-switcher-select2) {
            min-width: 100px !important;
            max-width: 120px !important;
          }
          
          .mobile-language-switcher :global(.language-select__control) {
            min-height: 32px !important;
            padding: 0.15rem 0.3rem !important;
            font-size: 0.75rem !important;
          }
          
          .mobile-language-switcher :global(.language-select__single-value) {
            font-size: 0.75rem !important;
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
            padding-left: 0.35rem !important;
            padding-right: 0.35rem !important;
          }
          
          .mobile-language-switcher {
            max-width: 100px;
          }
          
          .mobile-language-switcher :global(.language-switcher-select2) {
            min-width: 45px !important;
            max-width: 55px !important;
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
          .mobile-language-switcher {
            max-width: 80px;
          }
          
          .mobile-language-switcher :global(.language-switcher-select2) {
            min-width: 75px !important;
            max-width: 90px !important;
          }
          
          .mobile-language-switcher :global(.language-select__control) {
            min-height: 28px !important;
            font-size: 0.7rem !important;
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