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
        id: 'auto',
        labelKey: 'theme.systemTheme',
        icon: <BsCircleHalf size={16} />
    }
];

const ThemeSwitcher = () => {
    const { status } = useSession();
    const { theme: themeMode, updateTheme } = useLayoutContext();
    const { t, isRTL } = useLanguage();

    if (status === 'authenticated') return null;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isDark = themeMode === 'dark';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        {themeMode === 'light' ? <BsSunFill size={18} /> : themeMode === 'dark' ? <BsMoonStarsFill size={18} /> : <BsCircleHalf size={18} />}
                    </span>
                </div>
            </button>

            {isOpen && (
                <div
                    className="position-absolute shadow-lg border-0 p-2 theme-dropdown-menu"
                    style={{
                        zIndex: 10000,
                        minWidth: '180px',
                        backgroundColor: isDark ? '#1e2125' : '#ffffff',
                        top: '48px',
                        right: isRTL ? 'auto' : '0',
                        left: isRTL ? '0' : 'auto',
                        animation: 'slideDown 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards',
                        border: '1px solid rgba(102, 187, 106, 0.15)',
                        borderRadius: '12px'
                    }}
                >
                    <div className="px-3 py-2 border-bottom mb-2">
                        <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('theme.title') || 'TEMA'}</span>
                    </div>
                    <div className="d-grid gap-1">
                        {THEME_MODES.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => handleThemeChange(mode.id)}
                                className="w-100 d-flex align-items-center bg-transparent border-0 theme-mode-item"
                                style={{
                                    padding: '8px 12px',
                                    transition: 'all 0.2s ease',
                                    borderRadius: '8px',
                                    background: themeMode === mode.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
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
                                <span className="flex-grow-1 ms-2 fw-medium text-start" style={{ fontSize: '12.5px' }}>
                                    {t(mode.labelKey) || mode.id.charAt(0).toUpperCase() + mode.id.slice(1)}
                                </span>
                                {themeMode === mode.id && (
                                    <span style={{ width: '14px', height: '14px', color: '#ffffff' }}>
                                        <BsCheckLg size={12} />
                                    </span>
                                )}
                            </button>
                        ))}
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
