import dynamic from 'next/dynamic';
import { Inter, Cinzel } from 'next/font/google';
import Image from 'next/image';
import NextTopLoader from 'nextjs-toploader';
import { DEFAULT_PAGE_TITLE, SITE_META_DESCRIPTION } from '@/context/constants';
import '@/assets/scss/style.scss';
import 'leaflet/dist/leaflet.css';
const AppProvidersWrapper = dynamic(() => import('@/components/wrappers/AppProvidersWrapper'));
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

// Logo (marka) için klasik serif font — CSS değişkeni olarak globale aktarılır
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-logo'
});
export const metadata = {
  title: {
    template: '%s | Islamic Windows',
    default: DEFAULT_PAGE_TITLE
  },
  description: SITE_META_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
  }
};
const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.5s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.5s forwards;
  z-index: 0;
  pointer-events: none;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`;
const RootLayout = ({
  children
}) => {
  return <html lang="en" className={cinzel.variable}>
    <head>
      <style>{splashScreenStyles}</style>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var k='SOCIAL_NEXTJS_THEME_KEY';if(!localStorage.getItem(k)){document.documentElement.setAttribute('data-bs-theme','green');localStorage.setItem(k,'green');}}catch(e){}})();`,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
              if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
                window.global = window;
              }
            `,
        }}
      />
    </head>
    <body className={inter.className}>
      <div id="splash-screen">
        <Image alt="Islamic Windows" width={200} height={200} src="/logo/logo.png" style={{
          height: 'auto',
          width: '200px',
          maxWidth: '80%'
        }} priority unoptimized />
      </div>
      <NextTopLoader color="#1c84ee" showSpinner={false} />
      <div id="__next_splash">
        <AppProvidersWrapper>{children}</AppProvidersWrapper>
      </div>
    </body>
  </html>;
};
export default RootLayout;