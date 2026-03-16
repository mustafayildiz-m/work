'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguage } from '@/context/useLanguageContext';
import { BsCheckLg, BsSunFill, BsMoonStarsFill, BsCircleHalf } from 'react-icons/bs';

const THEME_MODES = [
    {
        id: 'light',
        labelKey: 'theme.lightTheme',
        icon: <BsSunFill size={16} />
    },
    {
        id: 'dark',
        labelKey: 'theme.darkTheme',
        icon: <BsMoonStarsFill size={16} />
    },
    {
        id: 'green',
        labelKey: 'theme.greenTheme',
        icon: (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.4 1.7c.216.289.65.84 1.725 1.274 1.093.44 2.884.774 5.834.528l.37-.023c1.823-.06 3.117.598 3.956 1.579C14.16 6.082 14.5 7.41 14.5 8.5c0 .58-.032 1.285-.229 1.997q.198.248.382.54c.756 1.2 1.19 2.563 1.348 3.966a1 1 0 0 1-1.98.198c-.13-.97-.397-1.913-.868-2.77C12.173 13.386 10.565 14 8 14c-1.854 0-3.32-.544-4.45-1.435-1.125-.887-1.89-2.095-2.391-3.383C.16 6.62.16 3.646.509 1.902L.73.806zm-.05 1.39c-.146 1.609-.008 3.809.74 5.728.457 1.17 1.13 2.213 2.079 2.961.942.744 2.185 1.22 3.83 1.221 2.588 0 3.91-.66 4.609-1.445-1.789-2.46-4.121-1.213-6.342-2.68-.74-.488-1.735-1.323-1.844-2.308-.023-.214.237-.274.38-.112 1.4 1.6 3.573 1.757 5.59 2.045 1.227.215 2.21.526 3.033 1.158.058-.39.075-.782.075-1.158 0-.91-.288-1.988-.975-2.792-.626-.732-1.622-1.281-3.167-1.229l-.316.02c-3.05.253-5.01-.08-6.291-.598a5.3 5.3 0 0 1-1.4-.811" />
            </svg>
        )
    },
    {
        id: 'auto',
        labelKey: 'theme.systemTheme',
        icon: <BsCircleHalf size={16} />
    }
];

const ThemeSwitcher = () => {
    const { status } = useSession();
    const { theme: themeMode, updateTheme } = useLayoutContext();
    const { t, isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isDark = themeMode === 'dark' || themeMode === 'green';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (status === 'authenticated') return null;

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleThemeChange = (id) => {
        updateTheme(id);
        setIsOpen(false);
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="nav-link p-0 border-0 bg-transparent theme-switcher-btn"
                onClick={toggleDropdown}
                style={{
                    transition: 'all 0.2s ease',
                    transform: isOpen ? 'scale(0.95)' : 'scale(1)'
                }}
                aria-label="Change theme"
            >
                <div className="theme-icon-wrapper d-flex align-items-center justify-content-center">
                    <span className="theme-icon-span">
                        {themeMode === 'light' ? <BsSunFill size={18} /> : themeMode === 'dark' ? <BsMoonStarsFill size={18} /> : themeMode === 'green' ? (
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1.4 1.7c.216.289.65.84 1.725 1.274 1.093.44 2.884.774 5.834.528l.37-.023c1.823-.06 3.117.598 3.956 1.579C14.16 6.082 14.5 7.41 14.5 8.5c0 .58-.032 1.285-.229 1.997q.198.248.382.54c.756 1.2 1.19 2.563 1.348 3.966a1 1 0 0 1-1.98.198c-.13-.97-.397-1.913-.868-2.77C12.173 13.386 10.565 14 8 14c-1.854 0-3.32-.544-4.45-1.435-1.125-.887-1.89-2.095-2.391-3.383C.16 6.62.16 3.646.509 1.902L.73.806zm-.05 1.39c-.146 1.609-.008 3.809.74 5.728.457 1.17 1.13 2.213 2.079 2.961.942.744 2.185 1.22 3.83 1.221 2.588 0 3.91-.66 4.609-1.445-1.789-2.46-4.121-1.213-6.342-2.68-.74-.488-1.735-1.323-1.844-2.308-.023-.214.237-.274.38-.112 1.4 1.6 3.573 1.757 5.59 2.045 1.227.215 2.21.526 3.033 1.158.058-.39.075-.782.075-1.158 0-.91-.288-1.988-.975-2.792-.626-.732-1.622-1.281-3.167-1.229l-.316.02c-3.05.253-5.01-.08-6.291-.598a5.3 5.3 0 0 1-1.4-.811" />
                            </svg>
                        ) : <BsCircleHalf size={18} />}
                    </span>
                </div>
            </button>

            {isOpen && (
                <div
                    className="position-absolute shadow-lg border-0 p-2 theme-dropdown-menu"
                    style={{
                        zIndex: 10000,
                        minWidth: '180px',
                        backgroundColor: themeMode === 'green' ? '#234d2a' : (isDark ? '#1e2125' : '#ffffff'),
                        top: '48px',
                        right: isRTL ? 'auto' : '0',
                        left: isRTL ? '0' : 'auto',
                        animation: 'slideDown 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards',
                        border: themeMode === 'green' ? '1px solid rgba(46, 125, 50, 0.35)' : '1px solid rgba(102, 187, 106, 0.15)',
                        borderRadius: '12px'
                    }}
                >
                    <div className="px-3 py-2 border-bottom mb-2">
                        <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('theme.title') || 'TEMA'}</span>
                    </div>
                    <div className="d-grid gap-1">
                        {THEME_MODES.map((mode) => {
                            const isSelected = themeMode === mode.id;
                            const themeBg = isSelected ? (mode.id === 'green' ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') : 'transparent';
                            const themeShadow = isSelected ? (mode.id === 'green' ? '0 4px 12px rgba(27, 94, 32, 0.35)' : '0 4px 12px rgba(118, 75, 162, 0.2)') : 'none';
                            const iconColor = isSelected ? '#ffffff' : (mode.id === 'green' ? '#2e7d32' : '#764ba2');
                            return (
                            <button
                                key={mode.id}
                                onClick={() => handleThemeChange(mode.id)}
                                className="w-100 d-flex align-items-center bg-transparent border-0 theme-mode-item"
                                style={{
                                    padding: '8px 12px',
                                    transition: 'all 0.2s ease',
                                    borderRadius: '8px',
                                    background: themeBg,
                                    color: isSelected ? '#ffffff' : (isDark ? '#dee2e6' : '#495057'),
                                    boxShadow: themeShadow
                                }}
                            >
                                <span className="d-flex align-items-center justify-content-center" style={{
                                    minWidth: '16px',
                                    width: '16px',
                                    height: '16px',
                                    color: iconColor
                                }}>
                                    {mode.icon}
                                </span>
                                <span className="flex-grow-1 ms-2 fw-medium text-start" style={{ fontSize: '12.5px' }}>
                                    {t(mode.labelKey) || mode.id.charAt(0).toUpperCase() + mode.id.slice(1)}
                                </span>
                                {isSelected && (
                                    <span style={{ width: '14px', height: '14px', color: '#ffffff' }}>
                                        <BsCheckLg size={12} />
                                    </span>
                                )}
                            </button>
                        );})}
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(8px); }
        }

        .theme-switcher-btn {
          width: 40px;
          height: 40px;
        }

        .theme-icon-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: ${isOpen ? '3px solid rgba(102, 187, 106, 0.6)' : '2px solid rgba(102, 187, 106, 0.3)'};
          background: ${isOpen ? 'linear-gradient(135deg, rgba(102, 187, 106, 0.2), rgba(181, 231, 160, 0.2))' : 'transparent'};
          padding: 2px;
          transition: all 0.3s ease;
          color: #66BB6A;
          box-shadow: ${isOpen ? '0 4px 12px rgba(102, 187, 106, 0.3)' : '0 2px 6px rgba(102, 187, 106, 0.15)'};
        }

        .theme-icon-span {
          transition: transform 0.5s ease;
          transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0)'};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-mode-item:hover:not(.active) {
          background-color: ${isDark ? 'rgba(102, 187, 106, 0.1)' : 'rgba(102, 187, 106, 0.05)'} !important;
        }

        /* Mobile responsive styles */
        @media (max-width: 991.98px) {
          .theme-switcher-btn {
            width: 32px;
            height: 32px;
          }
          
          .theme-icon-wrapper {
            border-width: 2px;
          }

          :global(.theme-icon-wrapper svg) {
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 575.98px) {
          .theme-switcher-btn {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
        </div>
    );
};

export default ThemeSwitcher;
