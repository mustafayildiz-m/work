'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { useLayoutContext } from '@/context/useLayoutContext';

function subscribePrefersDark(callback) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getPrefersDarkSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getPrefersDarkServerSnapshot() {
  return false;
}

const LogoBox = () => {
  const { theme } = useLayoutContext();
  const systemPrefersDark = useSyncExternalStore(
    subscribePrefersDark,
    getPrefersDarkSnapshot,
    getPrefersDarkServerSnapshot
  );

  // Tema dark/green/(auto+koyu) ise koyu zemin için tasarlanmış logo kullan
  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || theme === 'green') return true;
    if (theme === 'light') return false;
    if (theme === 'auto') return systemPrefersDark;
    return false;
  }, [theme, systemPrefersDark]);

  const logoSrc = isDarkMode ? '/logo/logo-on-dark.png' : '/logo/logo.png';

  // Yazı rengi: koyu temalarda beyaz, açık temada lacivert (logo mavisi)
  const wordmarkColor = isDarkMode ? '#ffffff' : '#1f3a63';

  return (
    <Link
      className="navbar-brand logo-brand p-0 m-0"
      href="/"
      aria-label="Anasayfaya dön — Islamic Windows"
      title="Islamic Windows"
    >
      {/* Desktop / tablet — yatay logo: simge solda, yazı iki satır büyük */}
      <span className="logo-horizontal d-none d-lg-flex align-items-center">
        <span className="logo-icon" aria-hidden="true" />
        <span className="logo-wordmark">
          <span className="logo-word">ISLAMIC</span>
          <span className="logo-word">WINDOWS</span>
        </span>
      </span>

      {/* Mobile — daha kompakt yatay logo */}
      <span className="logo-horizontal-mobile d-flex d-lg-none align-items-center">
        <span className="logo-icon-mobile" aria-hidden="true" />
        <span className="logo-wordmark-mobile">
          <span className="logo-word-mobile">ISLAMIC</span>
          <span className="logo-word-mobile">WINDOWS</span>
        </span>
      </span>

      <style jsx>{`
        .logo-brand {
          display: inline-flex;
          align-items: center;
          line-height: 1;
        }

        /* ---------- Desktop ---------- */
        .logo-horizontal {
          gap: 0.7rem;
        }

        /*
          Simge — orijinal logodan sadece pencere ikonu kırpılır.
          Orijinal logo (2400x1250) içinde pencere ikonu yaklaşık
          x: 937–1453, y: 188–914 (~540×726) bölgesinde, merkez (1196, 551).
          Container'ı ikonun en/boy oranına göre (~0.74:1) tutuyoruz ki
          simge container'ı tamamen doldursun ve yazıyla görsel hizalama
          temiz olsun.
        */
        .logo-icon {
          display: inline-block;
          width: 56px;
          height: 76px;
          background-image: url('${logoSrc}');
          background-repeat: no-repeat;
          background-size: 251px auto;
          background-position: -97px -20px;
          flex-shrink: 0;
        }

        .logo-wordmark {
          display: inline-flex;
          flex-direction: column;
          justify-content: center;
          font-family: var(--font-logo), 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1.05;
          color: ${wordmarkColor};
          white-space: nowrap;
        }

        .logo-word {
          font-size: 1.7rem;
          display: block;
        }

        /* ---------- Mobile ---------- */
        /*
          Desktop ile birebir aynı yerleşim:
          - Simge solda, container ikonun en/boy oranına göre dar (≈0.74:1)
          - Yazı iki satır (ISLAMIC / WINDOWS), serif font, sağda
          Sadece ölçek küçültülür.
        */
        .logo-horizontal-mobile {
          gap: 0.4rem;
        }

        .logo-icon-mobile {
          display: inline-block;
          width: 34px;
          height: 46px;
          background-image: url('${logoSrc}');
          background-repeat: no-repeat;
          background-size: 152px auto;
          background-position: -59px -12px;
          flex-shrink: 0;
        }

        .logo-wordmark-mobile {
          display: inline-flex;
          flex-direction: column;
          justify-content: center;
          font-family: var(--font-logo), 'Cinzel', 'Playfair Display', Georgia, serif;
          font-weight: 700;
          letter-spacing: 0.03em;
          line-height: 1.05;
          color: ${wordmarkColor};
          white-space: nowrap;
        }

        .logo-word-mobile {
          font-size: 0.95rem;
          display: block;
        }

        /* Küçük telefonlarda hafifçe küçült — yazı yine görünür kalsın */
        @media (max-width: 399.98px) {
          .logo-horizontal-mobile {
            gap: 0.3rem;
          }
          .logo-icon-mobile {
            width: 28px;
            height: 38px;
            background-size: 126px auto;
            background-position: -49px -10px;
          }
          .logo-word-mobile {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </Link>
  );
};

export default LogoBox;
