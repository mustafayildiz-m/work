'use client';

import clsx from 'clsx';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/useLanguageContext';
import { useState, useEffect } from 'react';
import { useLayoutContext } from '@/context/useLayoutContext';

const SettingPanel = ({
  links
}) => {
  const pathName = usePathname();
  const { t } = useLanguage();
  const { theme } = useLayoutContext();
  const [userId, setUserId] = useState(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/me/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const user = await response.json();
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUserId();
  }, []);

  return (
    <div
      className="w-100"
      style={{
        background: isDark ? '#2c3034' : 'white',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.4)' : '0 2px 12px rgba(0, 0, 0, 0.06)',
        border: isDark ? '1px solid #454d55' : 'none'
      }}
    >
      <ul
        className="nav flex-column fw-bold"
        style={{
          gap: '0.25rem',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}
      >
        {links.map((item, idx) => (
          <li key={idx} style={{ margin: 0 }}>
            <Link
              className={clsx('d-flex align-items-center text-decoration-none', {
                'text-white': pathName === item.link
              })}
              href={item.link}
              style={{
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: pathName === item.link
                  ? 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)'
                  : 'transparent',
                color: pathName === item.link ? 'white' : (isDark ? '#dee2e6' : '#2C3E50'),
                fontWeight: 600
              }}
              onMouseEnter={(e) => {
                if (pathName !== item.link) {
                  e.currentTarget.style.background = isDark ? 'rgba(129, 199, 132, 0.15)' : 'rgba(129, 199, 132, 0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathName !== item.link) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <img
                height={20}
                width={19}
                className="me-2"
                src={item.image}
                alt="image"
                style={{
                  filter: pathName === item.link ? 'brightness(0) invert(1)' : 'none'
                }}
              />
              <span>{item.nameKey ? t(item.nameKey) : item.name}</span>
            </Link>
          </li>
        ))}

        <li style={{ margin: 0, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: isDark ? '1px solid #454d55' : '1px solid #F1F8F4' }}>
          <Link
            href={userId ? `/profile/user/${userId}/feed` : '/profile/feed'}
            className="d-flex align-items-center text-decoration-none"
            style={{
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'transparent',
              color: isDark ? '#dee2e6' : '#2C3E50',
              fontWeight: 600
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(129, 199, 132, 0.15)' : 'rgba(129, 199, 132, 0.08)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span className="me-2" style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
              </svg>
            </span>
            <span>{t('menu.viewProfile')}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SettingPanel;