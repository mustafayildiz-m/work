'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguage } from '@/context/useLanguageContext';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { BsCheckLg } from 'react-icons/bs';

// Theme modes configuration (labels will be translated in component)
const THEME_MODES = [
  {
    id: 'light',
    labelKey: 'theme.lightTheme',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
      </svg>
    )
  },
  {
    id: 'dark',
    labelKey: 'theme.darkTheme',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
      </svg>
    )
  },
  {
    id: 'auto',
    labelKey: 'theme.systemTheme',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
      </svg>
    )
  }
];

// Menu items configuration (labels will be translated in component)
const MENU_ITEMS = [
  {
    href: '/profile',
    labelKey: 'menu.profile',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
        <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
      </svg>
    )
  },
  {
    href: '/settings/account',
    labelKey: 'menu.settings',
    icon: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
      </svg>
    )
  }
];

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const [imageLoading, setImageLoading] = useState(true);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const { data: session, status } = useSession();
  const { logout, userInfo } = useAuth();
  const { theme: themeMode, updateTheme, resetTheme } = useLayoutContext();
  const { t, isRTL } = useLanguage();
  const isDark = themeMode === 'dark';

  // Get image URL with proper fallback and cache busting
  const getImageUrl = useCallback((photoUrl, bustCache = false) => {
    const defaultAvatar = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');

    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined' || imageError) {
      return defaultAvatar;
    }

    // If photoUrl is an object (imported image), return its src property
    if (typeof photoUrl === 'object') {
      return photoUrl.src || defaultAvatar;
    }

    if (typeof photoUrl !== 'string') {
      return defaultAvatar;
    }

    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const url = `${apiBaseUrl}${photoUrl}`;
      // Only add cache busting when explicitly requested (e.g., after upload)
      return bustCache ? `${url}?v=${imageKey}` : url;
    }

    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:image/')) {
      return photoUrl;
    }

    return defaultAvatar;
  }, [imageError, imageKey]);

  // Memoized user data
  const userData = useMemo(() => {
    if (session?.user) return session.user;
    if (userInfo) return userInfo;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
    }

    return null;
  }, [session?.user, userInfo]);

  // Get user ID from various sources
  const getUserId = useCallback(() => {
    // Try to get from userData first
    if (userData?.id) return userData.id;
    if (userData?.sub) return userData.sub;

    // Try to get from session
    if (session?.user?.id) return session.user.id;
    if (session?.user?.sub) return session.user.sub;

    // Try to get from localStorage token
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          return decodedPayload.sub || decodedPayload.id;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    return null;
  }, [userData, session?.user]);

  // Dynamic menu items with user ID
  const dynamicMenuItems = useMemo(() => {
    const userId = getUserId();
    const profileHref = userId ? `/profile/user/${userId}/feed` : '/profile';

    return MENU_ITEMS.map(item => ({
      ...item,
      href: item.labelKey === 'menu.profile' ? profileHref : item.href
    }));
  }, [getUserId]);

  // Fetch fresh user data on mount
  useEffect(() => {
    const fetchFreshUserData = async () => {
      const userId = getUserId();
      if (userId) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const freshData = await response.json();
            setImageLoading(true); // Reset loading for initial load
            setImageKey(Date.now());
            setUser({
              ...userData,
              ...freshData
            });
          }
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
        }
      }
    };

    fetchFreshUserData();
  }, [getUserId]); // Only run on mount

  // Initial data loading
  useEffect(() => {
    if (userData && !user) {
      setUser(userData);
    }
  }, [userData, user]);

  // Listen for profile photo updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      const userId = getUserId();
      if (userId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const freshUserData = await response.json();

            // Reset loading state for new image
            setImageLoading(true);
            setImageKey(Date.now());

            // Force update user state with fresh data
            setUser(prev => ({
              ...prev,
              ...freshUserData
            }));

            // LocalStorage'daki user verisini de güncelle
            if (typeof window !== 'undefined') {
              const currentStoredUser = localStorage.getItem('user');
              if (currentStoredUser) {
                const parsedUser = JSON.parse(currentStoredUser);
                localStorage.setItem('user', JSON.stringify({
                  ...parsedUser,
                  ...freshUserData
                }));
              }
            }

            // Reset image error state to try loading the new image
            setImageError(false);
          }
        } catch (error) {
          console.error('Error updating profile in header:', error);
        }
      }
    };

    window.addEventListener('profilePhotoUpdated', handleProfileUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handleProfileUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [getUserId]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      setIsOpen(false);
      // Reset theme to light before logout
      if (resetTheme) {
        resetTheme();
      }
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, resetTheme]);

  // Handle theme change
  const handleThemeChange = useCallback(async (theme) => {
    try {
      // Update theme first
      await updateTheme(theme);

      // Small delay to ensure theme is applied
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    } catch (error) {
      console.error('Theme update error:', error);
      setIsOpen(false);
    }
  }, [updateTheme]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="ms-2 d-flex align-items-center">
        <div className="nav-link">
          <div
            className="rounded-circle bg-light d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
          >
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
              style={{ width: '16px', height: '16px' }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="ms-2 ms-lg-2 d-flex align-items-center">
        <Link
          href="/auth-advance/sign-in"
          className="btn btn-sm px-3 fw-bold"
          style={{
            background: isDark ? 'rgba(102, 187, 106, 0.15)' : 'rgba(102, 187, 106, 0.1)',
            color: '#66BB6A',
            borderRadius: '10px',
            border: '1px solid rgba(102, 187, 106, 0.2)',
            fontSize: '0.85rem',
            padding: '0.4rem 0.75rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#66BB6A';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(102, 187, 106, 0.15)' : 'rgba(102, 187, 106, 0.1)';
            e.currentTarget.style.color = '#66BB6A';
          }}
        >
          {t('auth.signIn')}
        </Link>
      </div>
    );
  }


  return (
    <div className="ms-2 ms-lg-2 d-flex align-items-center position-relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        ref={buttonRef}
        className="nav-link p-0 border-0 bg-transparent position-relative"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('menu.profileMenu')}
        style={{
          transition: 'all 0.2s ease',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        <div
          className="position-relative profile-avatar-container"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: isOpen
              ? '3px solid rgba(181, 231, 160, 0.6)'
              : '2px solid rgba(181, 231, 160, 0.3)',
            background: isOpen
              ? 'linear-gradient(135deg, rgba(181, 231, 160, 0.2), rgba(129, 199, 132, 0.2))'
              : 'transparent',
            padding: '2px',
            transition: 'all 0.3s ease',
            boxShadow: isOpen
              ? '0 4px 12px rgba(181, 231, 160, 0.3)'
              : '0 2px 6px rgba(181, 231, 160, 0.15)'
          }}
        >
          {imageLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                backgroundColor: '#e9ecef',
                zIndex: 2,
                margin: '2px'
              }}
            >
              <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '14px', height: '14px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <img
            src={getImageUrl(user?.photoUrl, false)}
            alt="User Avatar"
            className="rounded-circle profile-avatar-img"
            key={`avatar-btn-${imageKey}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              handleImageError();
              e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
              setImageLoading(false);
            }}
            style={{
              objectFit: 'cover',
              transition: 'all 0.2s ease, opacity 0.3s ease-in-out',
              filter: isOpen ? 'brightness(1.05)' : 'brightness(1)',
              opacity: imageLoading ? 0 : 1,
              width: '36px',
              height: '36px'
            }}
          />

          {/* Online indicator - Fixed position */}
          <div
            className="position-absolute bg-success rounded-circle profile-online-indicator"
            style={{
              width: '14px',
              height: '14px',
              bottom: '-2px',
              right: '-2px',
              border: '3px solid #ffffff',
              boxShadow: '0 2px 6px rgba(40, 167, 69, 0.4)',
              zIndex: 10,
              transform: isOpen ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`position-absolute top-100 mt-2 bg-body rounded-4 shadow-lg border-0 ${isRTL ? 'start-0' : 'end-0'}`}
          style={{
            width: '240px',
            zIndex: 1050,
            transform: 'translateY(8px)',
            animation: 'slideDown 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
            boxShadow: '0 10px 40px rgba(118, 75, 162, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(118, 75, 162, 0.2) !important',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* User Info Section */}
          <div className="p-3 border-bottom" style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.12) 100%)',
            borderBottom: '1px solid rgba(118, 75, 162, 0.1) !important'
          }}>
            <div className="d-flex align-items-center">
              <div className={`position-relative ${isRTL ? 'ms-2' : 'me-2'}`} style={{ flexShrink: 0 }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '2px solid rgba(118, 75, 162, 0.4)',
                  padding: '2px',
                  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.2)',
                  background: 'linear-gradient(135deg, #667eea1a, #764ba21a)'
                }}>
                  <img
                    src={getImageUrl(user?.photoUrl, false)}
                    alt="User Avatar"
                    className="rounded-circle"
                    key={`avatar-dropdown-${imageKey}`}
                    onError={(e) => {
                      handleImageError();
                      e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                    }}
                    style={{
                      objectFit: 'cover',
                      transition: 'opacity 0.3s ease-in-out',
                      width: '34px',
                      height: '34px'
                    }}
                  />
                </div>
                <div
                  className="position-absolute bg-success rounded-circle"
                  style={{
                    width: '10px',
                    height: '10px',
                    bottom: '1px',
                    right: '1px',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.5)',
                    zIndex: 10
                  }}
                />
              </div>
              <div className="flex-grow-1 min-width-0">
                <div className="fw-bold text-body mb-0 text-truncate" style={{ fontSize: '13px', lineHeight: '1.2' }}>
                  {user?.firstName || user?.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : (user?.name || user?.username || t('menu.user'))
                  }
                </div>
                {user?.username && (
                  <div className="text-muted text-truncate" style={{ fontSize: '11px', lineHeight: '1.1' }}>@{user.username}</div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {dynamicMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="d-flex align-items-center text-decoration-none text-body"
                onClick={() => setIsOpen(false)}
                style={{
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  margin: '1px 8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(118, 75, 162, 0.08)';
                  e.currentTarget.style.transform = isRTL ? 'translateX(-4px)' : 'translateX(4px)';
                  e.currentTarget.style.color = '#764ba2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                <span className={`${isRTL ? 'ms-3' : 'me-3'}`} style={{
                  color: '#764ba2',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{item.icon}</span>
                <span className="flex-grow-1 fw-medium" style={{ fontSize: '12.5px' }}>{t(item.labelKey)}</span>
              </Link>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="py-2 px-3" style={{ borderTop: '1px solid rgba(118, 75, 162, 0.1) !important' }}>
            <div className="small text-muted mb-2 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{t('theme.themeSelection')}</div>
            <div className="d-flex flex-column gap-1">
              {THEME_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleThemeChange(mode.id)}
                  className={`btn w-100 d-flex align-items-center border-0 ${isRTL ? 'text-end' : 'text-start'}`}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    background: themeMode === mode.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(118, 75, 162, 0.05)',
                    color: themeMode === mode.id ? '#ffffff' : (isDark ? '#dee2e6' : '#495057'),
                    boxShadow: themeMode === mode.id ? '0 4px 12px rgba(118, 75, 162, 0.2)' : 'none'
                  }}
                >
                  <span className="d-flex align-items-center justify-content-center" style={{
                    minWidth: '16px',
                    width: '16px',
                    height: '16px',
                    color: themeMode === mode.id ? '#ffffff' : '#764ba2'
                  }}>
                    {mode.icon}
                  </span>
                  <span className="flex-grow-1 ms-2 fw-medium" style={{ fontSize: '12px' }}>{t(mode.labelKey)}</span>
                  {themeMode === mode.id && (
                    <span style={{ width: '14px', height: '14px', color: '#ffffff' }}>
                      <BsCheckLg size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="py-1" style={{ borderTop: '1px solid rgba(118, 75, 162, 0.1) !important' }}>
            <button
              onClick={handleLogout}
              className="w-100 d-flex align-items-center bg-transparent border-0 text-danger"
              style={{
                transition: 'all 0.2s ease',
                fontSize: '12.5px',
                padding: '8px 12px',
                margin: '0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.08)';
                e.currentTarget.style.transform = isRTL ? 'translateX(-4px)' : 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span className={isRTL ? 'ms-3' : 'me-3'} style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc3545'
              }}>
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                </svg>
              </span>
              <span className={`flex-grow-1 fw-bold ${isRTL ? 'text-end' : 'text-start'}`}>{t('menu.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(8px);
          }
        }
        
        .hover-bg-light:hover {
          background-color: var(--bs-gray-100) !important;
        }
        
        .hover-bg-danger-light:hover {
          background-color: rgba(220, 53, 69, 0.1) !important;
        }
        
        .min-width-0 {
          min-width: 0;
        }

        /* Mobile responsive styles */
        @media (max-width: 991.98px) {
          :global(.profile-avatar-container) {
            width: 32px !important;
            height: 32px !important;
            border-width: 2px !important;
          }
          
          :global(.profile-avatar-img) {
            width: 28px !important;
            height: 28px !important;
          }
          
          :global(.profile-online-indicator) {
            width: 10px !important;
            height: 10px !important;
            border-width: 2px !important;
            bottom: -1px !important;
            right: -1px !important;
          }
        }

        @media (max-width: 575.98px) {
          :global(.profile-avatar-container) {
            width: 30px !important;
            height: 30px !important;
          }
          
          :global(.profile-avatar-img) {
            width: 26px !important;
            height: 26px !important;
          }
          
          :global(.profile-online-indicator) {
            width: 9px !important;
            height: 9px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileDropdown;